# پاکستان نیوز پوائنٹ - Urdu News Portal

A complete, production-ready Urdu news website built with Next.js 14, TypeScript, Tailwind CSS, Prisma, and PostgreSQL.

## Features

- **Full RTL support** with Urdu typography
- **Admin panel** with rich text editor (TipTap)
- **Daily news limit** - hard limit of 100 articles per day
- **Authentication** via NextAuth.js
- **SEO optimized** - sitemap, robots.txt, Open Graph, JSON-LD
- **RSS feed** for news syndication
- **Breaking news ticker**
- **Featured news carousel**
- **Category-wise news sections**
- **Related articles**
- **View counter**
- **Social sharing** (Facebook, Twitter/X, WhatsApp)
- **Media library** for image uploads
- **Responsive/mobile-first design**

## Tech Stack

- **Frontend:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS with RTL support
- **Backend:** Next.js API Routes + Server Actions
- **Database:** PostgreSQL + Prisma ORM
- **Authentication:** NextAuth.js
- **Rich Text Editor:** TipTap
- **Fonts:** Noto Nastaliq Urdu / Jameel Noori Nastaleeq

## Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

## Getting Started

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd pak-news-point
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
```

Edit `.env` with your database credentials:

```
DATABASE_URL="postgresql://postgres:password@localhost:5432/paknewspoint"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-change-in-production"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
DAILY_NEWS_LIMIT=100
```

### 3. Database Setup

```bash
# Create the database (if not exists)
createdb paknewspoint

# Generate Prisma client and push schema
npx prisma generate
npx prisma db push

# Seed with sample data
npm run db:seed
```

This creates:
- Admin user: `admin@paknewspoint.com` / `admin123`
- Editor user: `editor@paknewspoint.com` / `editor123`
- 8 categories (پاکستان, دنیا, کھیل, etc.)
- 8 sample Urdu articles
- Default settings

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Admin Panel

Visit [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

Login with:
- Email: `admin@paknewspoint.com`
- Password: `admin123`

## Daily News Limit Feature

The most critical feature is the hard limit of 100 published articles per day.

### How it works:
1. A `DailyPublishLog` table tracks `date` + `publishedCount`
2. Before any article is published, the system checks the count for the current date (Asia/Karachi timezone)
3. If count >= 100, publishing is **blocked** with message: "آج کی خبروں کی حد (100) مکمل ہو چکی ہے"
4. Articles can still be saved as **DRAFT** beyond the limit
5. The admin dashboard shows a widget: "Today: X / 100 news published"
6. The limit is configurable via:
   - `DAILY_NEWS_LIMIT` environment variable
   - Admin Settings page (overrides env var)
   - Defaults to 100

### To test:
1. Set `DAILY_NEWS_LIMIT=2` in `.env` for testing
2. Publish 2 articles - the 3rd will be blocked
3. Reset the counter by waiting for the next day (or clearing the DailyPublishLog table)

## Project Structure

```
pak-news-point/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Sample data seeder
├── public/
│   └── uploads/               # Uploaded images
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout with RTL
│   │   ├── page.tsx           # Homepage
│   │   ├── [category]/        # Category pages
│   │   ├── news/[slug]/       # Article pages
│   │   ├── search/            # Search page
│   │   ├── tag/[slug]/        # Tag pages
│   │   ├── author/[id]/       # Author pages
│   │   ├── (static)/          # Static pages
│   │   │   ├── about/
│   │   │   ├── contact/
│   │   │   ├── privacy-policy/
│   │   │   └── terms/
│   │   ├── admin/             # Admin panel
│   │   │   ├── login/
│   │   │   ├── dashboard/
│   │   │   ├── news/
│   │   │   ├── categories/
│   │   │   ├── tags/
│   │   │   ├── users/
│   │   │   ├── media/
│   │   │   └── settings/
│   │   ├── api/               # API routes
│   │   ├── sitemap.ts         # Auto-generated sitemap
│   │   └── robots.ts          # Robots config
│   ├── components/
│   │   ├── public/            # Public components
│   │   └── admin/             # Admin components
│   ├── lib/
│   │   ├── prisma.ts          # Prisma client
│   │   ├── auth.ts            # NextAuth config
│   │   ├── daily-limit.ts     # Daily limit logic
│   │   ├── urdu.ts            # Urdu helpers
│   │   └── validations.ts     # Zod schemas
│   ├── types/                 # TypeScript types
│   └── middleware.ts          # Auth middleware
├── .env.example
├── next.config.js
├── tailwind.config.ts
└── package.json
```

## Deployment

### Build for Production

```bash
npm run build
npm start
```

### Deploy to Vercel

1. Push to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `NEXTAUTH_URL` | Application URL | Required |
| `NEXTAUTH_SECRET` | Auth secret key | Required |
| `NEXT_PUBLIC_SITE_URL` | Public site URL | `http://localhost:3000` |
| `DAILY_NEWS_LIMIT` | Max articles per day | `100` |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Optional |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Optional |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Optional |
| `NEXT_PUBLIC_ADSENSE_ID` | Google AdSense ID | Optional |

## License

MIT
