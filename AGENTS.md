# ClipSafe AI Agent Metadata 🤖💎🚀

> [!NOTE]
> This file helps AI coding assistants (like Cursor, Windsurf, or Gemini) understand the project architecture and design patterns.

## Project Vision
ClipSafe is a **Browser-side AI Media Platform**. It avoids server-side processing to ensure absolute user privacy.

## Architectural Patterns
- **Local-First**: All heavy lifting (AI, Video) must happen on the client.
- **Wasm-Driven**: FFmpeg.wasm is the primary video processing engine.
- **Style Consistency**: Use the **Obsidian** (Dark) and **Porcelain** (Light) design tokens.
- **Component Standard**: React + Shadcn UI + Tailwind CSS.

## Key Files for Agents
- [toolRegistry.ts](src/lib/toolRegistry.ts): Index of all micro-tools.
- [ai.ts](src/lib/ai.ts): LLM integration and tool-calling logic.
- [AppLayout.tsx](src/pages/AppLayout.tsx): The main shell of the editor platform.

## Agent Guidelines
1.  **Never add Cloud Dependencies**: All processing must remain serverless.
2.  **Maintain High Performance**: Be mindful of Wasm memory and bundle sizes.
3.  **Privacy First**: No telemetry or data collection in any generated code.
