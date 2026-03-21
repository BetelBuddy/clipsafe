# Contributing to ClipSafe 💎🚀

First off, thank you for considering contributing to ClipSafe! We are building a privacy-first Media OS that runs 100% in the browser, and we love having the community involved.

## 🛠️ Local Development Setup

ClipSafe is built with **Vite**, **React**, and **TypeScript**.

1.  **Clone the Repo**:
    ```bash
    git clone https://github.com/BetelBuddy/clipsafe.git
    cd clipsafe
    ```
2.  **Install Dependencies**:
    ```bash
    npm install
    # or
    bun install
    ```
3.  **Start Development Server**:
    ```bash
    npm run dev
    ```
    The app will be available at `http://localhost:8080`.

## 🎨 Coding Standards

- **React & TypeScript**: Use functional components and strict typing.
- **Styling**: Use **Tailwind CSS**. Follow the existing design system tokens in `tailwind.config.ts`.
- **Icons**: Use **Lucide React**.
- **State**: Use **Zustand** for global UI state.
- **Engine**: We use **FFmpeg.wasm**. If you are adding a new tool, check `src/lib/toolRegistry.ts`.

## 🚀 Pull Request Process

1.  **Fork** the repository and create your branch from `main`.
2.  If you've added code that should be tested, add tests.
3.  Ensure the test suite passes (`npm run build` is a good check for TS errors).
4.  Make sure your code lints (`npm run lint`).
5.  Submit your PR with a clear description of the changes.

## 🐛 Reporting Bugs

Please use the **Bug Report** template in GitHub Issues. Include:
- A clear summary of the issue.
- Steps to reproduce.
- Your browser and OS version.

## ✨ Feature Requests

We love new ideas! Please use the **Feature Request** template to describe the "Why" and "How" of your proposed tool or feature.

---
*By contributing to ClipSafe, you agree that your contributions will be licensed under the MIT License.*
