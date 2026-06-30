# Sentri — Predict. Rescue. Finish.

A world-class AI SaaS landing page built with React 18, Vite, Tailwind CSS, and Framer Motion.

## Stack

- **React 18** — component architecture
- **Vite** — blazing-fast dev server & build
- **Tailwind CSS v3** — utility-first styling
- **Framer Motion** — cinematic scroll animations
- **Lucide React** — clean icon set

## Getting started

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project structure

```
sentri/
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── main.jsx          # Entry point
    ├── App.jsx           # Root — assembles all sections
    ├── index.css         # Global styles + Tailwind + keyframes
    ├── hooks/
    │   ├── useScrollReveal.js   # IntersectionObserver reveal
    │   └── useCounter.js        # Animated number counter
    ├── components/
    │   ├── Navbar.jsx           # Sticky nav with blur-on-scroll
    │   ├── HeroDashboard.jsx    # Floating risk feed widget
    │   └── Footer.jsx
    └── sections/
        ├── Hero.jsx             # Full-screen hero + particles + parallax
        ├── Problem.jsx          # Before vs After flow cards
        ├── AIThinking.jsx       # Sequential AI workflow steps
        ├── RiskPrediction.jsx   # 91% risk circle + reasons
        ├── RescueMode.jsx       # 91% → 18% transformation + plan
        ├── Features.jsx         # Bento grid
        ├── HowItWorks.jsx       # Horizontal timeline
        ├── Metrics.jsx          # Animated counters
        └── CTA.jsx              # Glowing final call to action
```

## Design tokens (tailwind.config.js)

| Token    | Value     | Use                  |
|----------|-----------|----------------------|
| `bg`     | `#09090B` | Page background      |
| `card`   | `#18181B` | Card surfaces        |
| `card2`  | `#1E1E24` | Nested surfaces      |
| `primary`| `#6366F1` | Brand / CTA          |
| `accent` | `#22C55E` | Success / safe       |
| `danger` | `#EF4444` | Risk / high urgency  |
| `warning`| `#F59E0B` | Medium risk          |

## Animations

Every major section uses Framer Motion's `whileInView` with `viewport={{ once: true }}` for performance.
Custom hooks (`useScrollReveal`, `useCounter`) power the metrics and staggered reveals.
CSS keyframes handle the ambient `float`, `pulse`, and `glow-pulse` loops.
