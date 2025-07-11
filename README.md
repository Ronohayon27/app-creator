# App Creator

A Next.js application that creates web apps using OpenAI API, similar to Loveable. This project allows you to generate web applications by describing what you want to build.

## Features

- AI-powered web app generation using OpenAI
- User authentication with Clerk
- Background processing with Inngest
- Image management with Cloudinary
- Modern UI with Tailwind CSS and Shadcn UI components

## Prerequisites

- Node.js 18.x or higher
- npm or yarn
- OpenAI API key
- Clerk account and API keys
- Inngest account

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Inngest
INNGEST_EVENT_KEY=your_inngest_event_key
INNGEST_SIGNING_KEY=your_inngest_signing_key

# Database (Prisma)
DATABASE_URL=your_database_connection_string
```

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/app-creator.git
cd app-creator
```

2. Install dependencies:

```bash
npm install
```

3. Set up the database:

```bash
npx prisma generate
npx prisma db push
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## Project Structure

- `/src/app`: Next.js app router pages
- `/src/components`: Reusable UI components
- `/src/inngest`: Inngest functions and client setup
- `/src/lib`: Utility functions and shared code
- `/src/modules`: Feature-specific code organized by domain
- `/public`: Static assets

## Image Management

This project uses Cloudinary for image hosting. Images are organized into categories:
- Food
- Hero backgrounds
- Movies
- Nature
- Products

The Cloudinary base URL is: `https://res.cloudinary.com/dpsxjxplc/image/upload/`

## Authentication

This project uses [Clerk](https://clerk.dev/) for authentication. Clerk provides:
- User sign-up and sign-in
- Social login options
- User profile management
- Session management

## Inngest Background Processing

[Inngest](https://www.inngest.com/) is used for background processing and handling AI generation tasks. The main function is defined in `/src/inngest/functions.ts`.

## Development

- Use `npm run dev` to start the development server with Turbopack
- Use `npm run build` to create a production build
- Use `npm run start` to run the production build

## License

[MIT](https://choosealicense.com/licenses/mit/)
