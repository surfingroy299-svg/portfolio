# PROJECT CONTEXT
**Roy Vanounou — Portfolio Site**
Last updated: June 2026

---

## Overview

A hand-coded personal portfolio for Roy Vanounou, Product Designer. Built from scratch with plain HTML/CSS (no frameworks). Intended for Netlify Drop deployment.

---

## Stack & Architecture

- **HTML/CSS only** — no JavaScript, no build tools
- **Font:** Roboto (Google Fonts, weights 300/400/500)
- **Primary colour:** `#007AFF`
- **Background:** `#1a1a1a`
- **File structure:**
  ```
  Claude portfolio/
  ├── index.html              ← Work index (hero + project grid)
  ├── about.html              ← About page
  ├── style.css               ← Global stylesheet (~600 lines)
  ├── assets/
  │   └── images/             ← All production images (28 files)
  ├── projects/
  │   ├── pricing-checkout.html
  │   ├── mobile-dashboard.html
  │   ├── upgrade-flow.html
  │   └── coaching-app.html
  └── PROJECT_CONTEXT.md
  ```

---

## Design System (style.css)

### CSS variables
| Variable | Value | Usage |
|---|---|---|
| `--bg` | `#1a1a1a` | Page background |
| `--bg2` | `#222222` | Elevated surfaces (cards, chips) |
| `--border` | `#2a2a2a` | All borders and dividers |
| `--text` | `#ffffff` | Primary text |
| `--muted` | `#777777` | Secondary text, labels, nav links |
| `--accent` | `#007AFF` | Blue — CTAs, section labels, active states |
| `--font` | Roboto | Global font family |

### Key CSS classes
| Class | Purpose |
|---|---|
| `.nav` | Fixed top nav — logo left, links right |
| `.hero` | Index page hero — 2-column (text + photo) |
| `.work-grid` | 3-column project card grid |
| `.project-card` | Work index card — image + meta |
| `.project-page` | Case study page wrapper — `max-width: 1280px` |
| `.project-header` | Title, attrs, brief — capped at `760px` |
| `.case-split` | Two-column split layout — `2fr / 3fr`, fluid gap |
| `.case-split.reverse` | Same layout, columns flipped via `direction: rtl` |
| `.case-split__text` | Text column inside a case-split |
| `.case-split__screen` | Screen/image column inside a case-split (semantic wrapper, no styles) |
| `.screen-showcase` | Wrapper for screen mockups — adds ambient glow via `::after` |
| `.screen-mockup` | Product screen treatment — `border-radius: 10px`, layered shadow |
| `.content-section` | Standard prose section — `margin-bottom: 72px`, capped at `760px` |
| `.section-label` | Uppercase blue label above section headings |
| `.feature-list` | Arrow-prefixed bullet list |
| `.outcome` | Blue-tinted callout pill — used at end of sections |
| `.back-link` | "← Work" link at top of case study pages |
| `.next-project` | Next case study footer link |
| `.whatsapp-btn` | Blue pill CTA with WhatsApp icon |

### Screen mockup treatment
No browser chrome. Screens presented clean:
- `border-radius: 10px` (desktop), `26px` (mobile phones in local styles)
- Multi-layer `box-shadow` for depth (defined on `.screen-mockup` in style.css — do not re-declare locally)
- Ambient glow underneath via `.screen-showcase::after`

### Hero (index.html only)
2-colour radial gradient (violet bottom-left `#7B2FBE`, blue top-right `#007AFF`) with SVG `fractalNoise` grain filter (`<filter id="grain">`). Three decorative shapes: 2 rings, 1 dot grid.

### Hover states
- Project cards: `opacity: 0.88` on image + `rgba(255,255,255,0.07)` overlay via `::after`
- Nav links: muted → white
- `.whatsapp-btn`: `opacity: 0.85`

---

## Pages

### index.html — Work Index
- Fixed nav: Roy Vanounou / About / Work
- **Hero:** Two-column — text left, photo right
  - Photo: `assets/images/roy.png`
  - WhatsApp CTA: `https://wa.me/972548308128`
  - Trait tags: Fast learner, AI-first workflows, Surfer, Martial arts
- **Work grid:** 3 columns, 4 project cards, each links to a case study

### about.html — About
- Full-bleed hero image: `assets/images/about-hero.jpg`, gradient fade to bg
- Two-column bio: Experience (left) / Character (right)
- Tools section: Figma, Claude Code, ChatGPT, Perplexity — chip format with inline SVG logos
- Outside work: Surfing, Martial arts, Reading, Crossfit — 4-cell icon grid
- WhatsApp CTA at bottom
- **Note:** Section heading `<h3>` elements are styled locally with duplicate rules — candidate for `.section-label` consolidation (cleanup item #8, not yet done).

### projects/pricing-checkout.html — Spines Pricing & Checkout
**Status: Complete**

Sections:
1. **Pricing** (`content-section`) — intro text, two desktop screens side by side (default vs children's tab)
2. **Pricing Details** (`case-split`) — expanded plan view
3. **Mobile Checkout** (`content-section`) — three-step phone flow with step badges and flow arrows
4. **Web Checkout** (`content-section`) — two desktop checkout screens side by side

Images used:
- `pricing-web-default.png`, `pricing-web-overview.png`, `pricing-web-expanded.png`
- `checkout-order.png`, `checkout-billing.png`, `checkout-payment.png`
- `checkout-web-traditional.png`, `checkout-web-tabbed.png`

Local `<style>` includes: `.two-screens`, `.checkout-step`, `.checkout-flow`, `.flow-arrow`, `.step-badge`, `.step-label`, `.screen-label`.

### projects/mobile-dashboard.html — Spines Mobile Dashboard
**Status: Complete**

Sections (all `case-split phone-split`):
1. State 1 — Library / entry point
2. State 2 (reversed) — In Progress / active production
3. State 3 — Published / post-publication

Images used:
- `dashboard-library.png`, `dashboard-inprogress.png`, `dashboard-published.png`

Local `<style>`: `.case-split.phone-split` — overrides to `1fr 1fr` columns, `border-radius: 26px` on phone mockups.

### projects/upgrade-flow.html — Spines Upgrade Experience
**Status: Complete**

Sections (all `case-split`):
1. Entry Point — decision screen
2. Path 1 (reversed) — Plan Upgrade
3. Path 2 — Purchase Add-ons

Images used:
- `upgrade-entry.png`, `upgrade-plan.png`, `upgrade-addons-full.png`

No local `<style>` block — uses shared styles only.

### projects/coaching-app.html — Coaching App (Feedback.)
**Status: Complete**

Academic concept from Studio Six B. End-to-end mobile app for asynchronous athlete/coach video feedback.

Sections:
1. Product overview (`case-split overview-split`)
2. Upload flow (`case-split upload-split`) — includes loop-marker step indicator
3. AI Feedback (`case-split ai-split milestone`)
4. Community Feedback (`case-split community-split reverse milestone`) — includes timeline-visual
5. Professional Coaching (`content-section milestone`) — capability chips, coach-phones-row

Images used:
- `feedback-home.jpg`, `feedback-upload-1/2/3.png`, `feedback-community.png`
- `feedback-chats.png`, `feedback-coach-request.png`, `feedback-coach-review.jpg`

Local `<style>` block (~380 lines) contains all page-specific layout classes. Candidates for consolidation: layout modifier classes and arrow connector patterns — cleanup items #10–11, not yet done.

---

## Roy — Personal Context

- **Role:** Product Designer, currently sole designer at Spines (in-house, ~1 year)
- **Previous:** In-house designer at IDF, freelance work
- **Background:** Extended military service in elite unit → 12 months world travel → design
- **Working style:** Fast learner, AI-first workflow
- **Tools:** Figma, Claude Code, ChatGPT, Perplexity
- **Hobbies:** Surfing, martial arts, reading, crossfit
- **Contact:** roee299@gmail.com / WhatsApp +972548308128

---

## Key Design Decisions

| Decision | Rationale |
|---|---|
| No browser frame on mockups | Clean product presentation — "the UI is the hero" |
| `case-split` layout (text + screen) | Reduces vertical scroll, shows text/screen relationship directly |
| `2fr / 3fr` column ratio | Mockup gets more visual presence than text on wide screens |
| 3-column work grid | 2-column felt too large on desktop |
| WhatsApp CTA instead of contact page | Direct WhatsApp link; contact page removed |
| Grain + gradient on hero | Requested grainy texture; violet + blue chosen after removing orange |
| Background `#1a1a1a` | `#0d0d0d` felt too dark |

---

## Pending Cleanup (approved, not yet implemented)

Identified in a June 2026 audit:

- **#8** — `about.html` h3 sections duplicate `.section-label` — replace 3 inline rules with shared class; also fixes a 0.08em vs 0.1em letter-spacing inconsistency
- **#9** — `about.html` `color:#eee` inline style on "Spines" — replace with `var(--text)`
- **#10** — Arrow connector pseudo-element code duplicated across pricing-checkout and coaching-app — extract to shared `.flow-connector` class in style.css
- **#11** — coaching-app layout modifier classes (overview-split, upload-split, ai-split, community-split) — consolidate or inline
- **#12** — Add `/* semantic wrapper only */` comment to `case-split__screen` in style.css

---

## Deployment

Drag the `Claude portfolio/` folder to [netlify.com/drop](https://app.netlify.com/drop). No server required — pure static HTML/CSS.
