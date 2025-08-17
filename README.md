# NewsCurator SaaS Platform

AI-powered news curation and social media posting SaaS platform built with Next.js, TypeScript, and Prisma.

## Features

- 🤖 AI-powered news curation and content analysis
- 📱 Social media posting automation (X/Twitter, LinkedIn)
- 🎨 Clean black and white design using shadcn/ui
- 🔐 Secure authentication with NextAuth.js
- 🗄️ PostgreSQL database with Prisma ORM
- 📊 Analytics and performance tracking
- 👥 Team collaboration features
- 🚀 Production-ready deployment

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js
- **Deployment**: PM2, Nginx
- **SSL**: Let's Encrypt

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Redis (for caching)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/burjix/newscurator.git
cd newscurator
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Deployment

The application is deployed at [https://post.g8nie.com](https://post.g8nie.com)

### Production Setup

1. Build the application:
```bash
npm run build
```

2. Start with PM2:
```bash
pm2 start ecosystem.config.js
```

## License

MIT License
