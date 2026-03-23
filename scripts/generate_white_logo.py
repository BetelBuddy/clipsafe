from PIL import Image
import os

def make_logo_white(input_path, output_path):
    if not os.path.exists(input_path):
        print(f"Error: {input_path} not found")
        return
    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()

    new_data = []
    for item in datas:
        # If the pixel is not fully transparent, change it to white (255, 255, 255)
        # while keeping its original alpha value
        if item[3] > 0:
            new_data.append((255, 255, 255, item[3]))
        else:
            new_data.append(item)

    img.putdata(new_data)
    img.save(output_path, "PNG")
    print(f"Generated {output_path}")

if __name__ == "__main__":
    make_logo_white("public/logo.png", "public/logo-white.png")
