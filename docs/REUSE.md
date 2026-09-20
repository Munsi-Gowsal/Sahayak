# Open-Source Software Reuse

The Sahayak project utilizes the following open-source frameworks, libraries, and components to accelerate MVP development while focusing on the core business logic.

## Frontend UI Framework

### [Next.js](https://nextjs.org) & [React](https://reactjs.org)
- **Source**: Vercel / Meta
- **License**: MIT License
- **What was reused**: The Next.js App Router framework, React component architecture, and rendering engine.
- **Where it is used**: Entire `/apps/web` directory (Dashboard, Responder UI, Citizen UI).
- **Modifications**: Fully custom logic and application state built on top of the framework's standard APIs.

## Styling & Design

### [Tailwind CSS](https://tailwindcss.com)
- **Source**: Tailwind Labs
- **License**: MIT License
- **What was reused**: Utility-first CSS framework for rapidly building custom designs.
- **Where it is used**: `apps/web/src/app/globals.css` and inline component classes.
- **Modifications**: Custom color configurations and `glass-card` utilities added in global CSS.

### [Lucide Icons](https://lucide.dev)
- **Source**: Lucide Contributors
- **License**: ISC License
- **What was reused**: SVG icons used throughout the UI to indicate status, urgency, and navigation.
- **Where it is used**: `apps/web` (e.g., `AlertCircle`, `CheckCircle2`, `MapPin`).
- **Modifications**: Colored, resized, and animated using Tailwind classes.

### [Framer Motion](https://www.framer.com/motion/)
- **Source**: Framer
- **License**: MIT License
- **What was reused**: Animation library for React to handle complex layout transitions and micro-interactions.
- **Where it is used**: `apps/web` UI (e.g., `<motion.div>`, `<AnimatePresence>`).
- **Modifications**: Used to orchestrate custom entrance and exit animations for emergency assignment events.

## Backend & Cloud

### [AWS SDK for JavaScript v3](https://github.com/aws/aws-sdk-js-v3)
- **Source**: Amazon Web Services
- **License**: Apache License 2.0
- **What was reused**: API clients for DynamoDB and Bedrock.
- **Where it is used**: `services/api/src/handlers/*` and `services/api/src/ai/*`.
- **Modifications**: Integrated directly into our business logic layers with our specific configurations.

### [Zod](https://zod.dev)
- **Source**: Colin McDonnell
- **License**: MIT License
- **What was reused**: TypeScript-first schema declaration and validation library.
- **Where it is used**: `packages/shared/src/schemas/index.ts`.
- **Modifications**: Customized to represent the specific Sahayak Emergency Facts schema.

### [UUID](https://github.com/uuidjs/uuid)
- **Source**: UUID.js Contributors
- **License**: MIT License
- **What was reused**: Standard library to generate unique identifiers (v4).
- **Where it is used**: Generating unique Incident and Timeline Event IDs.
- **Modifications**: None.
