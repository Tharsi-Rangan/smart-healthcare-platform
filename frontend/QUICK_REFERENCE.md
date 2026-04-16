# Quick Reference Guide - MediConnect UI Design System

## 🎨 Color Quick Reference

### Primary Actions
```css
--primary-600: #0284c7    /* Main brand color */
--primary-700: #0369a1    /* Hover state */
--primary-50:  #f0f9ff    /* Light background */
```

### Status Colors
```css
Success:  --success-600  (#16a34a)    - Green
Warning:  --warning-600  (#ea580c)    - Orange
Danger:   --danger-600   (#dc2626)    - Red
Info:     --primary-600  (#0284c7)    - Blue
```

### Neutral Text
```css
Headings:  --neutral-900  (Black)
Body:      --neutral-700  (Dark gray)
Secondary: --neutral-600  (Medium gray)
Hints:     --neutral-500  (Light gray)
```

## 🔘 Button Quick Reference

### Button Classes
```jsx
// Primary button
<button className="btn btn-primary">Primary Button</button>

// Secondary button
<button className="btn btn-secondary">Secondary</button>

// Success button
<button className="btn btn-success">Success</button>

// Danger button
<button className="btn btn-danger">Delete</button>

// Outline button
<button className="btn btn-outline">Outline</button>

// Ghost button
<button className="btn btn-ghost">Ghost</button>

// Sizes
<button className="btn btn-sm">Small</button>
<button className="btn">Normal</button>
<button className="btn btn-lg">Large</button>

// Full width
<button className="btn w-full">Full Width</button>

// Disabled
<button className="btn" disabled>Disabled</button>
```

## 📝 Input Quick Reference

```jsx
// Text input
<div className="form-group">
  <label className="input-label">Email</label>
  <input className="input-field" type="email" placeholder="your@email.com" />
</div>

// With error
<div className="form-group error">
  <label className="input-label">Password</label>
  <input className="input-field" type="password" />
  <span className="input-error">Password is required</span>
</div>

// With hint
<div className="form-group">
  <label className="input-label">Password</label>
  <input className="input-field" type="password" />
  <span className="input-hint">Minimum 8 characters</span>
</div>

// Select/Dropdown
<select className="input-field">
  <option>Option 1</option>
  <option>Option 2</option>
</select>

// Textarea
<textarea className="input-field" rows="4"></textarea>
```

## 🏷️ Badge Quick Reference

```jsx
// Color variants
<span className="badge badge-success">Verified</span>
<span className="badge badge-warning">Pending</span>
<span className="badge badge-danger">Cancelled</span>
<span className="badge badge-primary">New</span>

// Sizes
<span className="badge badge-sm">Small</span>
<span className="badge">Normal</span>
<span className="badge badge-lg">Large</span>
```

## ⚠️ Alert Quick Reference

```jsx
// Success alert
<div className="alert alert-success">
  <span className="alert-icon">✓</span>
  <div className="alert-content">
    <p className="alert-title">Success</p>
    <p className="alert-message">Operation completed</p>
  </div>
</div>

// Warning alert
<div className="alert alert-warning">...</div>

// Danger alert
<div className="alert alert-danger">...</div>

// Info alert
<div className="alert alert-info">...</div>
```

## 🎴 Card Quick Reference

```jsx
// Basic card
<div className="card">
  <h3>Card Title</h3>
  <p>Card content goes here</p>
</div>

// Card with multiple sections
<div className="card">
  <div className="card-header">
    <h3>Header</h3>
  </div>
  <div className="card-body">
    Content
  </div>
  <div className="card-footer">
    Footer
  </div>
</div>

// Card with hover effect
<div className="card hover-lift">
  Content
</div>
```

## 🏛️ Layout Quick Reference

```jsx
// Container
<div className="container">
  <h1>Page content</h1>
</div>

// Grid layout
<div className="grid">
  <div>Column 1</div>
  <div>Column 2</div>
  <div>Column 3</div>
</div>

// Flexbox
<div className="flex items-center gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

// Grid with custom columns
<div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
  {/* items */}
</div>
```

## 📏 Typography Quick Reference

```jsx
// Headings
<h1 className="text-h1">Heading 1</h1>
<h2 className="text-h2">Heading 2</h2>
<h3 className="text-h3">Heading 3</h3>
<h4 className="text-h4">Heading 4</h4>
<h5 className="text-h5">Heading 5</h5>
<h6 className="text-h6">Heading 6</h6>

// Body text
<p className="text-body-lg">Large body text</p>
<p className="text-body-md">Medium body text</p>
<p className="text-body-sm">Small body text</p>

// Caption
<p className="text-caption">Caption text</p>
```

## 🎨 Spacing Quick Reference

```css
/* Using CSS variables */
margin: var(--spacing-md);      /* 1rem */
padding: var(--spacing-lg);     /* 1.5rem */
gap: var(--spacing-xs);         /* 0.25rem */

/* Sizes */
--spacing-xs:    0.25rem   (4px)
--spacing-sm:    0.5rem    (8px)
--spacing-md:    1rem      (16px)
--spacing-lg:    1.5rem    (24px)
--spacing-xl:    2rem      (32px)
--spacing-2xl:   2.5rem    (40px)
--spacing-3xl:   3rem      (48px)
```

## 🔲 Border Radius Quick Reference

```css
--radius-xs:     0.375rem    (6px)
--radius-sm:     0.5rem      (8px)
--radius-md:     0.75rem     (12px)
--radius-lg:     1rem        (16px)
--radius-xl:     1.5rem      (24px)
--radius-full:   9999px      (Circle)
```

## 🌟 Shadow Quick Reference

```css
--shadow-sm:     0 1px 2px 0 rgba(0, 0, 0, 0.05)
--shadow-md:     0 4px 6px -1px rgba(0, 0, 0, 0.1)
--shadow-lg:     0 10px 15px -3px rgba(0, 0, 0, 0.1)
--shadow-xl:     0 20px 25px -5px rgba(0, 0, 0, 0.1)
--shadow-2xl:    0 25px 50px -12px rgba(0, 0, 0, 0.25)
```

## ⏱️ Transition Quick Reference

```css
--transition-base:      all 0.2s ease
--transition-slow:      all 0.3s ease
--transition-fast:      all 0.15s ease
```

## 🎬 Animation Quick Reference

```css
/* Available animations */
@keyframes bounce   { /* Bouncing effect */ }
@keyframes float    { /* Floating effect */ }
@keyframes pulse    { /* Pulsing effect */ }
@keyframes fade     { /* Fade in/out */ }
@keyframes slideInLeft   { /* Slide from left */ }
@keyframes slideInRight  { /* Slide from right */ }

/* Usage */
animation: bounce 3s ease-in-out infinite;
animation: float 6s ease-in-out infinite;
animation: pulse 2s ease-in-out infinite;
```

## 🔗 Link Styling

```jsx
// Primary link (auto-colored)
<a href="#" className="link-primary">Link</a>

// Custom link styling
<a href="#" style={{ color: 'var(--primary-600)' }}>Link</a>

// Hover effect
<a href="#" className="link-hover">Link</a>
```

## 📊 Common Layout Patterns

### Hero Section
```jsx
<div className="hero">
  <div className="container">
    <h1 className="text-h1">Headline</h1>
    <p className="text-body-lg">Subtitle</p>
    <button className="btn btn-primary btn-lg">CTA</button>
  </div>
</div>
```

### Card Grid
```jsx
<div className="container">
  <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
    {items.map(item => (
      <div key={item.id} className="card">
        {/* Card content */}
      </div>
    ))}
  </div>
</div>
```

### Form Layout
```jsx
<form className="form">
  <div className="form-group">
    <label className="input-label">Field 1</label>
    <input className="input-field" type="text" />
  </div>
  <div className="form-group">
    <label className="input-label">Field 2</label>
    <input className="input-field" type="email" />
  </div>
  <button className="btn btn-primary w-full">Submit</button>
</form>
```

### Two Column Layout
```jsx
<div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
  <div>Left column</div>
  <div>Right column</div>
</div>
```

## 🎯 Component Import Quick Reference

```jsx
// Navbar
import Navbar from "./components/common/Navbar";
<Navbar />

// Footer
import Footer from "./components/common/Footer";
<Footer />

// Doctor Card
import DoctorCard from "./components/shared/DoctorCard";
<DoctorCard doctor={doctorData} />

// Appointment Card
import AppointmentCard from "./components/shared/AppointmentCard";
<AppointmentCard appointment={appointmentData} />

// Health Metrics
import HealthMetricsCard from "./components/patient/HealthMetricsCard";
<HealthMetricsCard title="BP" value="120/80" unit="mmHg" icon="❤️" />
```

## 🚀 Quick Tips

1. **Always import the design system CSS first**
   ```jsx
   import "../styles/design-system.css";
   ```

2. **Use CSS variables instead of hardcoded colors**
   ```css
   color: var(--primary-600);    /* ✅ Good */
   color: #0284c7;              /* ❌ Avoid */
   ```

3. **Use utility classes for common patterns**
   ```jsx
   <div className="container">          /* Max-width container */
   <div className="grid">               /* Responsive grid */
   <div className="flex items-center">  /* Flexbox */
   <div className="w-full">             /* Full width */
   ```

4. **Responsive design is mobile-first**
   ```css
   /* Default styles (mobile) */
   .element { width: 100%; }
   
   /* Tablet and up */
   @media (min-width: 768px) {
     .element { width: 50%; }
   }
   ```

5. **Use semantic HTML**
   ```jsx
   <button>       /* Buttons */
   <a>            /* Links */
   <header>       /* Header */
   <main>         /* Main content */
   <footer>       /* Footer */
   <nav>          /* Navigation */
   <section>      /* Section */
   <article>      /* Article */
   ```

## 📚 Documentation Files

- **PROFESSIONAL_UI_GUIDE.md** - Comprehensive design system guide
- **PROFESSIONAL_UI_IMPROVEMENTS.md** - Summary of all improvements
- **IMPLEMENTATION_CHECKLIST.md** - Task tracking and progress
- **design-system.css** - All CSS custom properties and components

## ✅ Verification Checklist

Before committing code:
- [ ] Used design system colors (not hardcoded)
- [ ] Used design system spacing
- [ ] Used design system typography
- [ ] Tested on mobile (480px)
- [ ] Tested on tablet (768px)
- [ ] Tested on desktop (1024px+)
- [ ] Verified color contrast
- [ ] Tested keyboard navigation
- [ ] No console errors
- [ ] Component follows established patterns

---

**Last Updated**: April 16, 2026  
**Quick Reference Version**: 1.0
