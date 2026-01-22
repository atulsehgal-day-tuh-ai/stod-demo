# STOD Demo (Same Thing Only Different Repository)

A modern **Next.js** demo app for browsing, contributing, and curating “Same Thing Only Different” principles with a lightweight **role-based experience**, **tools**, and a **credits** economy.

## Live deployment

- **Production (Vercel)**: `https://stod-demo.vercel.app/`

## What’s in the app

- **Principles repository**
  - Search, filter, sort, and read principles
  - “In Process” workflow stages for submissions and curator review
- **Roles & permissions (demo)**
  - **Looker**: browse/read (limited free previews; unlock more principles with credits)
  - **Member**: save principles + better session pricing
  - **Practitioner**: forums + deeper prompts/tools + stronger session discounts
  - **Contributor**: submit principles + Advanced Reader usage + high session discounts
  - **Moderator**: review/curate submissions and annotations + best session pricing (often free in demo)
  - **Admin**: full access including user management
- **Tools & learning**
  - **Tools Hub** (subscription gated in demo) including **Advanced Reader**
  - **Videos** and **Sessions** with role-based pricing/discounts
- **Annotations workflow (demo)**
  - Users submit annotations (stored in localStorage) as **Pending Review**
  - Moderators/Admins can approve/reject from **Review → Annotations**
  - Approved annotations appear inside **Advanced Reader**

## Demo credentials

- **Admin**: `admin` / `admin123`
- **Moderator**: `moderator` / `moderator123`
- **Contributor**: `contributor` / `contributor123`
- **Practitioner**: `practitioner` / `practitioner123`
- **Member**: `member` / `member123`
- **Looker**: `looker` / `looker123`

## Local development

### Prerequisites

- Node.js **18+**
- npm

### Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

If port 3000 is busy, run on 3003:

```bash
npm run dev:3003
```

Open `http://localhost:3003`.

### Troubleshooting

- If you hit a corrupted build cache error (e.g. “Cannot find module './480.js'”), see `LOCAL_RUN.md` for the recommended `.next` cleanup steps.

## Deployment (Vercel)

This project is designed to deploy cleanly to Vercel (Next.js auto-detected). For detailed steps see:

- `QUICK_DEPLOY.md` (fast path)
- `DEPLOYMENT.md` (expanded guide + alternatives)

To deploy “on top of” the existing Vercel app (`stod-demo.vercel.app`), push your changes to the git branch connected to the Vercel project (typically `main`). Vercel will automatically build and promote a new production deployment.

## Data/storage model (important)

This is a **demo** and uses browser **localStorage** for persistence (principles, annotations, subscriptions, etc.). That means:

- Data is per-browser and not shared across users/devices
- Clearing browser data resets state

In a production system this would be replaced with real authentication and a backend database/API.

## Repo structure (high-level)

```
app/                 # Next.js app router entry
components/          # UI + feature components (Dashboard, Reader, Review, Tools, etc.)
public/              # Static assets
types/               # TypeScript type shims
```

## License

Demo application for demonstration purposes.

