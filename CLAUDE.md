# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

- **Development**: `npm run dev` - Start the Vite development server
- **Build**: `npm run build` - Build the application for production using Vite
- **Lint**: `npm run lint` - Run ESLint on the codebase
- **Preview**: `npm run preview` - Preview the production build locally

## Project Architecture

This is a React + TypeScript application built with Vite, featuring an n8n workflow assistant interface. The application has two main modes:

### Landing Page Mode
- Marketing site with sections: Header, Hero, HowItWorks, Examples, CTA, Footer
- Simple state management using React's `useState` to toggle between landing and chat modes
- Triggered via "Free Generations" button clicks

### Chat Dashboard Mode  
- Full-featured chat interface for n8n workflow generation
- Located in `src/components/ChatDashboard.tsx` (935+ lines)
- Features include:
  - Chat sidebar with conversation management (create, rename, delete chats)
  - Message interface with user/assistant message types
  - Modal systems for pricing plans and settings
  - Simulated AI responses for workflow generation
  - Example prompts and file upload interface

## Tech Stack & Configuration

- **React 18** with TypeScript and StrictMode
- **Vite** as build tool with React plugin
- **Tailwind CSS** for styling with dark mode support (`darkMode: 'class'`)
- **Lucide React** for icons throughout the application
- **ESLint** with TypeScript, React Hooks, and React Refresh plugins
- **PostCSS** with Autoprefixer for CSS processing

## Key Components Structure

- `App.tsx` - Main component managing landing/chat mode state
- `components/ChatDashboard.tsx` - Complex chat interface with modals and state management
- `components/Header.tsx` - Navigation with login modal integration
- `components/LoginPage.tsx` - Authentication interface (referenced but not fully implemented)
- Other landing page components: Hero, HowItWorks, Examples, CTA, Footer, ThemeToggle

## State Management Patterns

The app uses local React state throughout:
- App-level state for mode switching (`showChat`)
- Complex local state in ChatDashboard for chat management, UI modals, and user interactions
- No external state management library (Redux, Zustand, etc.)

## Styling Approach

- Utility-first with Tailwind CSS
- Dark theme with custom color palette (`#EFD09E`, `#D4AA7D`, `#272727`, etc.)
- Gradient backgrounds and backdrop blur effects
- Responsive design with mobile considerations
- Custom animations and transitions

## Development Notes

- Uses Vite's optimizeDeps to exclude 'lucide-react' from pre-bundling
- TypeScript configuration split across multiple files (tsconfig.json, tsconfig.app.json, tsconfig.node.json)
- No test framework currently configured
- No backend integration - uses simulated responses in chat interface