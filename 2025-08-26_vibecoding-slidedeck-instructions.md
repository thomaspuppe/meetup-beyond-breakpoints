## Instructions for HTML Slide Deck with Basecamp-Inspired Design

**Goal**: Create a single HTML file that functions as a presentation slide deck with Basecamp's design aesthetic.

### Core Requirements:

1. **Single HTML file** - All CSS and JavaScript must be inline (no external dependencies except CDN libraries if needed)
2. **Full-screen presentation mode** - Should work when opened in a browser and put in full-screen (F11)
3. **Navigation** - Arrow keys (← →) or click/tap to advance slides
4. **Slide counter** - Show current slide number (e.g., "3 / 12")

### Slide Types to Implement:

1. **Title Slide** - Large headline with optional subtitle
2. **Headline + Text** - Section header with paragraph text
3. **Bullet Points** - Header with bulleted list items
4. **Image Only** - Full-bleed or centered image
5. **Image + Text** - Split layout with image and accompanying text
6. **Code Example** - Syntax-highlighted code block with title

### Basecamp Design Language:

**Colors:**
- Primary background: #FAFAF8 (warm off-white)
- Text: #1D1D1D (near black)
- Accent: #1CA74E (Basecamp green)
- Secondary accent: #3B5998 (muted blue)
- Code background: #F5F5F3
- Subtle borders: #E5E5E1

**Typography:**
- Headlines: System font stack with preference for -apple-system, BlinkMacSystemFont, "Segoe UI"
- Body text: Same stack, optimized for readability
- Font sizes: Large and confident (48-64px for headlines, 24-28px for body)
- Line height: Generous (1.5-1.6 for body text)

**Visual Style:**
- Clean, minimal layouts with lots of whitespace
- Subtle shadows (box-shadow: 0 1px 3px rgba(0,0,0,0.12))
- Rounded corners on elements (border-radius: 6px)
- No gradients or excessive effects
- Occasional pops of the green accent color
- Friendly, approachable feel

### Technical Specifications:

1. **Responsive** - Should work on different screen sizes
2. **Smooth transitions** - Fade or slide between slides (keep it subtle)
3. **Keyboard controls**:
   - → or Space: Next slide
   - ← : Previous slide
   - Home: First slide
   - End: Last slide
4. **Progress indicator** - Subtle progress bar at top or bottom
5. **Code highlighting** - Use Prism.js or highlight.js from CDN for code blocks

### Example Structure:

```html
<!-- Slide container -->
<div class="slide" data-slide-type="title">
  <h1>Welcome to Basecamp</h1>
  <p class="subtitle">Project management that actually works</p>
</div>

<div class="slide" data-slide-type="bullets">
  <h2>Why Basecamp?</h2>
  <ul>
    <li>Organized by project, not features</li>
    <li>Everything in one place</li>
    <li>Actually reduces meetings</li>
  </ul>
</div>
```

### Additional Notes:

- Keep animations subtle and functional (300-400ms duration max)
- Ensure text is highly readable with good contrast
- Include a "presenter mode" hint (show that F11 makes it full-screen)
- Add touch/swipe support for mobile devices
- Consider adding a table of contents accessible via keyboard shortcut (e.g., 'T' key)
- Use CSS Grid or Flexbox for robust layouts
- Test with both light and dark system preferences

### Quality Checks:
- Clean, semantic HTML
- No JavaScript errors in console
- Smooth performance (60fps transitions)
- Works offline once loaded
- Accessible (proper heading hierarchy, keyboard navigable)
