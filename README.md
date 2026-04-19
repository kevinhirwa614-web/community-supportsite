# CivicAlert — Community Issue Reporting System

A responsive, multi-page web application that allows citizens in a district to report community infrastructure and safety issues directly to local authorities.

## What It Does

CivicAlert enables residents to:
- **Report issues** across 6 categories: Road & Traffic, Water Supply, Electricity, Security, Waste & Sanitation, and Other
- **Track all reports** on a filterable, searchable public dashboard
- **Learn about the system** and how it scales across districts
- **Contact the team** for onboarding, partnerships, or support

## Pages

| Page | File | Description |
|------|------|-------------|
| Home | `index.html` | Hero, how-it-works, issue type grid, simulated social feeds |
| Report Issue | `report.html` | Full validated form with image upload |
| Dashboard | `dashboard.html` | Filterable list of issues with status badges |
| About | `about.html` | Mission, district coverage, scaling roadmap |
| Contact | `contact.html` | Contact form with validation and info sidebar |

## Technologies

- **HTML5** — semantic markup throughout
- **CSS3** — custom design system with CSS variables, animations, scroll-reveal
- **Vanilla JavaScript** — form validation, dashboard filtering, localStorage persistence
- **Bootstrap 5** — grid system, responsive layout, utility classes
- **Google Fonts** — Playfair Display (headings) + Source Sans 3 (body)

## How to Run Locally

Just open `public/index.html` in any modern browser — no build step or server required.

```
open public/index.html
```

Or serve the `public/` folder with any static server:

```bash
npx serve public
# → http://localhost:3000
```

## Project Structure

```
public/
├── index.html        # Home page
├── report.html       # Report Issue form
├── dashboard.html    # Issues Dashboard
├── about.html        # About page
├── contact.html      # Contact page
├── css/
│   └── style.css     # Custom design system
├── js/
│   └── script.js     # Vanilla JS (validation, dashboard, animations)
└── images/           # Place any local images here
```

## Features

- **Form validation** — inline errors, email regex, minimum character checks
- **Image upload** — drag-and-drop with preview, file type validation
- **Dashboard filtering** — by issue type, status (Pending/Review/Resolved/Urgent), and keyword search
- **localStorage persistence** — reports submitted on the Report page appear in the Dashboard
- **Scroll-reveal animations** — IntersectionObserver-based fade-ins
- **Counter animations** — eased number counting on stats
- **Simulated social feeds** — Facebook and Twitter/X feed placeholders with real embed hooks noted
- **Responsive** — fully mobile-friendly via Bootstrap 5 grid
- **Consistent design** — navy + amber colour scheme, Playfair Display headings across all pages
