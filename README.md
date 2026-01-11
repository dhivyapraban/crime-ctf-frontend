# CTF Platform Frontend

A cinematic, crime-scene–based CTF platform where participants act as **Detectives**, admins act as **Chief**, and challenges are presented as **case files** inside an immersive environment.

## Features

- Landing page with crime scene theme
- Role selection: Detective or Chief
- Detective login and waiting room
- Detective dashboard with case files, hint box, and leaderboard
- Chief dashboard for contest control, case management, and leaderboard

## Tech Stack

- React
- TypeScript
- Vite
- React Router

## Getting Started

1. Install dependencies: `npm install`
2. Run development server: `npm run dev`
3. Build for production: `npm run build`

## Assets

Static assets are in `src/assets/images/`:
- `crime-scene-prompt.txt`: Prompt for generating the crime scene background image
- `detective-door.svg`, `chief-door.svg`: Door icons
- `folder.svg`: Folder icon for cases
- `police-tape.svg`: Police tape overlay

Replace placeholders with actual images generated from the prompts.
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
