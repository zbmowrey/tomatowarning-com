# Tomato Warning: Design Tokens & Styling Store

## 1. Color Palette

### Base Brand Colors
- **Storm Charcoal:** `#2C2C2C` (Primary Text / Dark Backgrounds)
- **Premium White:** `#F5F0EB` (Canvas / Light Backgrounds)
- **Accent Gold:** `#D4AF37` (Primary Accents / Links / Active States / Foil Banding)
- **Radar Teal:** `#00B4D8` (Secondary Tech/Radar Accents)

### EF Scale Heat Colors
- **EF-1 (Mild):** `#D4A017` (Warm amber)
- **EF-2 (Medium):** `#CC5500` (Deep orange)
- **EF-3 (Hot):** `#8B2500` (Rust red)
- **EF-4 (Extreme):** `#5C0A0A` (Dark crimson)
- **EF-5 (Devastating):** `#1C0A0A` (Near-black)

## 2. Typography
- **Display / Headings (`font-display`):** `Outfit`, `Inter`, or `system-ui`. We will use a clean, bold grotesque/geometric sans-serif.
- **Body (`font-sans`):** `system-ui`, `-apple-system`, `sans-serif`. Clean and highly legible.

## 3. Layout & Effects
- **Glassmorphism (`glass`, `glass-dark`):** We use backdrop blur (`backdrop-blur-md`) with semi-transparent white or charcoal backgrounds to simulate weather overlays and radar screens.
- **Textures (`texture-radar`):** Subtle isobar or radar patterns via background gradients or SVGs using low opacity to create depth.

## 4. Animations & Micro-Interactions
- **`animate-storm-pulse`:** A slow, pulsing animation (opacity 0.6 to 1) applied to extreme warnings or radar elements.
- **`animate-fade-in-up`:** A gentle entry animation for hero text and components (transform translate-y-20px to 0, opacity 0 to 1) over 0.7s.
- **Hover Transitions:** All interactive elements should use standard `transition-all duration-300 ease-out`. Buttons scale up slightly (`hover:scale-105`) with a dynamic box-shadow upgrade.

These tokens map directly to our Tailwind v4 configuration in `src/styles/global.css`.
