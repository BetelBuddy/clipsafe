/**
 * AI Smart Crop / Auto-Reframe
 * Canvas-based motion/subject detection to automatically reframe videos
 * from one aspect ratio to another (e.g., 16:9 → 9:16)
 */

export interface CropRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type TargetAspect = '16:9' | '9:16' | '1:1' | '4:5' | '4:3';

const ASPECT_RATIOS: Record<TargetAspect, number> = {
  '16:9': 16 / 9,
  '9:16': 9 / 16,
  '1:1': 1,
  '4:5': 4 / 5,
  '4:3': 4 / 3,
};

/** Detect the "center of interest" in a video frame using brightness/motion analysis */
function detectSubjectCenter(imageData: ImageData): { x: number; y: number } {
  const { data, width, height } = imageData;
  let totalWeight = 0;
  let weightedX = 0;
  let weightedY = 0;

  // Sample every 4th pixel for performance
  const step = 4;
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const idx = (y * width + x) * 4;
      const r = data[idx], g = data[idx + 1], b = data[idx + 2];
      
      // Compute brightness with skin-tone weighting
      const brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
      
      // Skin-tone detection (rough heuristic)
      const isSkinTone = r > 95 && g > 40 && b > 20 &&
        r > g && r > b && (r - g) > 15 && (r - b) > 15;
      
      // Edge detection (high contrast areas are interesting)
      let edgeWeight = 0;
      if (x > 0 && y > 0) {
        const leftIdx = (y * width + (x - step)) * 4;
        const topIdx = ((y - step) * width + x) * 4;
        const dr = Math.abs(data[idx] - data[leftIdx]) + Math.abs(data[idx] - data[topIdx]);
        edgeWeight = Math.min(1, dr / 100);
      }
      
      // Combined weight: edges + skin tones + center bias
      const centerBiasX = 1 - Math.abs(x / width - 0.5) * 0.5;
      const centerBiasY = 1 - Math.abs(y / height - 0.5) * 0.3;
      
      const weight = (brightness * 0.3 + edgeWeight * 0.4 + (isSkinTone ? 0.8 : 0) + centerBiasX * 0.15 + centerBiasY * 0.15);
      
      weightedX += x * weight;
      weightedY += y * weight;
      totalWeight += weight;
    }
  }

  if (totalWeight === 0) return { x: width / 2, y: height / 2 };
  return { x: weightedX / totalWeight, y: weightedY / totalWeight };
}

/** Detect motion between two frames */
function detectMotion(prev: ImageData, curr: ImageData): { x: number; y: number } | null {
  const { data: d1 } = prev;
  const { data: d2 } = curr;
  const { width, height } = prev;
  
  let totalDiff = 0;
  let weightedX = 0;
  let weightedY = 0;
  
  const step = 8;
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const idx = (y * width + x) * 4;
      const diff = Math.abs(d1[idx] - d2[idx]) + Math.abs(d1[idx+1] - d2[idx+1]) + Math.abs(d1[idx+2] - d2[idx+2]);
      
      if (diff > 30) { // threshold
        weightedX += x * diff;
        weightedY += y * diff;
        totalDiff += diff;
      }
    }
  }
  
  if (totalDiff < 1000) return null; // no significant motion
  return { x: weightedX / totalDiff, y: weightedY / totalDiff };
}

/** Calculate crop region for a target aspect ratio centered on subject */
export function calculateCropRegion(
  sourceWidth: number,
  sourceHeight: number,
  targetAspect: TargetAspect,
  subjectCenter: { x: number; y: number },
): CropRegion {
  const ratio = ASPECT_RATIOS[targetAspect];
  
  let cropWidth: number, cropHeight: number;
  
  if (ratio >= sourceWidth / sourceHeight) {
    // Target is wider than source → fit width, crop height
    cropWidth = sourceWidth;
    cropHeight = sourceWidth / ratio;
  } else {
    // Target is taller than source → fit height, crop width
    cropHeight = sourceHeight;
    cropWidth = sourceHeight * ratio;
  }
  
  // Center on subject
  let x = subjectCenter.x - cropWidth / 2;
  let y = subjectCenter.y - cropHeight / 2;
  
  // Clamp to bounds
  x = Math.max(0, Math.min(sourceWidth - cropWidth, x));
  y = Math.max(0, Math.min(sourceHeight - cropHeight, y));
  
  return {
    x: Math.round(x),
    y: Math.round(y),
    width: Math.round(cropWidth),
    height: Math.round(cropHeight),
  };
}

/** Analyze a video element and return crop regions for each time sample */
export async function analyzeVideoForReframe(
  videoElement: HTMLVideoElement,
  targetAspect: TargetAspect,
  sampleInterval: number = 0.5, // sample every 0.5 seconds
): Promise<{ time: number; region: CropRegion }[]> {
  const { videoWidth, videoHeight, duration } = videoElement;
  
  const canvas = document.createElement('canvas');
  canvas.width = Math.min(videoWidth, 640); // Downscale for performance
  canvas.height = Math.min(videoHeight, 360);
  const ctx = canvas.getContext('2d')!;
  const scaleX = canvas.width / videoWidth;
  const scaleY = canvas.height / videoHeight;
  
  const results: { time: number; region: CropRegion }[] = [];
  let prevImageData: ImageData | null = null;
  
  const seekTo = (time: number): Promise<void> => {
    return new Promise((resolve) => {
      videoElement.currentTime = time;
      videoElement.onseeked = () => resolve();
    });
  };
  
  for (let t = 0; t < duration; t += sampleInterval) {
    await seekTo(t);
    
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Detect subject
    const subject = detectSubjectCenter(imageData);
    
    // Incorporate motion if we have a previous frame
    let center = { x: subject.x / scaleX, y: subject.y / scaleY };
    if (prevImageData) {
      const motion = detectMotion(prevImageData, imageData);
      if (motion) {
        // Blend subject detection with motion center
        center = {
          x: (subject.x * 0.6 + motion.x * 0.4) / scaleX,
          y: (subject.y * 0.6 + motion.y * 0.4) / scaleY,
        };
      }
    }
    
    const region = calculateCropRegion(videoWidth, videoHeight, targetAspect, center);
    results.push({ time: t, region });
    
    prevImageData = imageData;
  }
  
  // Smooth the crop regions to avoid jitter
  return smoothCropRegions(results);
}

/** Smooth crop regions to avoid jarring jumps */
function smoothCropRegions(
  regions: { time: number; region: CropRegion }[],
  smoothFactor: number = 0.3,
): { time: number; region: CropRegion }[] {
  if (regions.length < 2) return regions;
  
  const smoothed = [regions[0]];
  
  for (let i = 1; i < regions.length; i++) {
    const prev = smoothed[i - 1].region;
    const curr = regions[i].region;
    
    smoothed.push({
      time: regions[i].time,
      region: {
        x: Math.round(prev.x + (curr.x - prev.x) * smoothFactor),
        y: Math.round(prev.y + (curr.y - prev.y) * smoothFactor),
        width: curr.width,
        height: curr.height,
      },
    });
  }
  
  return smoothed;
}

/** Build FFmpeg crop filter args for auto-reframe */
export function buildReframeCropArgs(
  regions: { time: number; region: CropRegion }[],
  targetWidth: number,
  targetHeight: number,
): string {
  if (regions.length === 0) return `crop=${targetWidth}:${targetHeight}:0:0`;
  
  // Use the median position for a single static crop (simplest approach)
  const xs = regions.map(r => r.region.x).sort((a, b) => a - b);
  const ys = regions.map(r => r.region.y).sort((a, b) => a - b);
  const medianX = xs[Math.floor(xs.length / 2)];
  const medianY = ys[Math.floor(ys.length / 2)];
  const w = regions[0].region.width;
  const h = regions[0].region.height;
  
  return `crop=${w}:${h}:${medianX}:${medianY},scale=${targetWidth}:${targetHeight}`;
}
