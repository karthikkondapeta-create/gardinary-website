# Gardinary

Premium streetwear site built as a portfolio project. Dark botanical aesthetic,
forest-green accents, themes of growth, individuality, nature, and rebellion.

## Tech Stack

- **React** - UI components
- **Vite** - dev server / build tool
- **Tailwind CSS** - styling
- **Framer Motion** - animations
- **React Router** - client-side routing
- **Vercel** - deployment (free tier)

## Project Structure

```
src/
  components/
    layout/    Navbar, Footer, Layout
    home/      Hero, BrandStory, FeaturedProducts, Manifesto, Values, Marquee
  pages/       Home, Shop, About, Contact
  assets/      gardinary-mark.svg (placeholder logo - swap for the real logo)
  App.jsx      routes
  main.jsx     app entry
  index.css    Tailwind directives + shared component classes
```

## Getting Started (on your own machine)

Requires [Node.js LTS](https://nodejs.org) and [Git](https://git-scm.com).

```bash
cd gardinary
npm install
npm run dev
```

Open the local URL Vite prints (usually `http://localhost:5173`).

To build for production:

```bash
npm run build
npm run preview   # sanity-check the production build locally
```

## Git & GitHub

This folder isn't a git repo yet (initializing git inside this sandbox wasn't
possible here, so do this step locally):

```bash
cd gardinary
git init
git add -A
git commit -m "Initial Gardinary site"
```

Then on GitHub: create a new empty repository named `gardinary` (no README/license,
so it stays empty), then:

```bash
git branch -M main
git remote add origin https://github.com/<your-username>/gardinary.git
git push -u origin main
```

## Deploying to Vercel

1. Push the repo to GitHub (above).
2. Go to [vercel.com](https://vercel.com), sign in with GitHub.
3. "Add New Project" -> import the `gardinary` repo.
4. Framework preset: **Vite**. Leave build command (`npm run build`) and output
   directory (`dist`) as detected.
5. Deploy. Vercel gives you a live URL and redeploys automatically on every push.

## What's Done vs. What's Left

Built now: full component structure, all four pages (Home, Shop, About, Contact),
routing, animations, mobile responsiveness, dark botanical theme.

Still needs your input before it's launch-ready:
- Swap the placeholder mark in `src/assets/gardinary-mark.svg` for the real
  Gardinary logo, and replace the text-block product placeholders with real
  product photography.
- Wire the Contact form to a real handler (Formspree, Netlify Forms, or your
  own backend) - right now it just shows a success state locally.
- `git init`, push to GitHub, and deploy to Vercel (steps above).
- Write the GitHub README project summary / resume bullets once it's live.

## Resume Bullet (draft)

> Designed and built Gardinary, a responsive React + Tailwind e-commerce
> front-end with Framer Motion animations, component-driven architecture, and
> CI-free deploys via Vercel; wrote and maintained project documentation on
> GitHub.

## Interview Talking Points

Be ready to explain: why this component structure (layout vs. home vs. pages),
how Tailwind's config extends the base theme (custom `forest`/`ink`/`bone`
palette), how Framer Motion's `whileInView` drives scroll animations, the Git
workflow you used, and what you'd improve with more time (real CMS/data layer,
cart state, checkout flow).
