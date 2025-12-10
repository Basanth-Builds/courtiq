# CourtIQ Mobile Responsiveness Guide

This document outlines the mobile-first responsive design implementation for CourtIQ.

## 🌓 Dark/Light Mode Features

### Theme System
- **System Default**: Automatically detects user's system preference
- **Manual Toggle**: Users can override with Light, Dark, or System modes
- **Persistent**: Theme preference is saved across sessions
- **Smooth Transitions**: No flash of unstyled content (FOUC)

### Theme Toggle Locations
- **Landing Page Footer**: Simple toggle button with theme indicator
- **Dashboard Header**: Dropdown menu with all theme options (desktop)
- **Mobile Menu**: Integrated theme toggle in mobile navigation

### Theme Options
1. **🌞 Light Mode**: Clean, bright interface
2. **🌙 Dark Mode**: Easy on the eyes, battery-friendly
3. **💻 System**: Follows device/browser preference

## 📱 Mobile Responsiveness

### Breakpoint Strategy
- **Mobile First**: Designed for mobile, enhanced for larger screens
- **Breakpoints**: 
  - `sm`: 640px+ (small tablets)
  - `md`: 768px+ (tablets)
  - `lg`: 1024px+ (laptops)
  - `xl`: 1280px+ (desktops)

### Key Responsive Features

#### Navigation
- **Desktop**: Horizontal navigation with theme toggle and user menu
- **Mobile**: Collapsible hamburger menu with all navigation items
- **Sticky Header**: Always accessible navigation on all devices
- **Touch-Friendly**: Minimum 44px touch targets

#### Typography
- **Responsive Text**: Scales appropriately across devices
  - Headings: `text-xl sm:text-2xl lg:text-3xl`
  - Body: `text-sm sm:text-base`
  - Buttons: `text-sm sm:text-base`

#### Layout
- **Grid Systems**: Responsive grid layouts
  - Cards: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
  - Stats: `grid-cols-2 lg:grid-cols-4`
- **Spacing**: Consistent spacing that scales
  - Padding: `p-4 sm:p-6 lg:p-8`
  - Gaps: `gap-4 sm:gap-6 lg:gap-8`

#### Forms & Inputs
- **Touch-Friendly**: Large input fields and buttons
- **Proper Keyboard**: Correct input types for mobile keyboards
- **Accessible**: Proper labels and focus states

## 🏓 Page-Specific Responsiveness

### Landing Page
- **Hero Section**: Responsive text and button layout
- **Feature Cards**: Stack on mobile, grid on desktop
- **Footer**: Responsive links with theme toggle

### Authentication Pages
- **Login**: Centered card with responsive tabs
- **Role Selection**: Grid layout that stacks on mobile
- **OTP Input**: Large, touch-friendly input field

### Dashboards
- **Stats Cards**: 2-column on mobile, 4-column on desktop
- **Navigation**: Collapsible mobile menu
- **Content**: Responsive spacing and typography

### Live Scoring (Referee)
- **Score Display**: Large, readable scores on all devices
- **Action Buttons**: Touch-friendly scoring buttons
- **Team Layout**: Stacks vertically on mobile
- **Controls**: Accessible match controls

### Tournament Management
- **Tournament Lists**: Responsive cards with proper spacing
- **Match Creation**: Mobile-friendly form layouts
- **Player Management**: Touch-friendly selection interface

### Settings Page
- **Form Layout**: Single column on mobile, responsive on desktop
- **Role Cards**: Grid that adapts to screen size
- **Access Code Dialog**: Mobile-optimized modal

## 🎨 Design System

### Colors
- **Consistent**: Same color palette across light/dark modes
- **Accessible**: WCAG compliant contrast ratios
- **Neon Accents**: Signature neon green for highlights

### Components
- **Cards**: Responsive padding and spacing
- **Buttons**: Touch-friendly sizes with proper states
- **Dialogs**: Mobile-optimized modals
- **Tables**: Responsive table layouts

### Animations
- **Smooth Transitions**: Theme switching without jarring changes
- **Hover Effects**: Desktop-only hover states
- **Loading States**: Consistent loading indicators

## 📐 CSS Utilities

### Custom Classes
```css
.mobile-padding { @apply px-4 sm:px-6 lg:px-8; }
.mobile-text { @apply text-sm sm:text-base; }
.mobile-heading { @apply text-xl sm:text-2xl lg:text-3xl; }
.touch-button { @apply min-h-[44px] min-w-[44px]; }
.score-display { @apply text-4xl sm:text-5xl lg:text-6xl font-black; }
.athletic-button { @apply font-bold uppercase tracking-wider text-sm sm:text-base; }
```

### Responsive Patterns
- **Flex to Grid**: `flex flex-col sm:flex-row`
- **Hide/Show**: `hidden sm:block` or `block sm:hidden`
- **Responsive Sizing**: `w-full sm:w-auto`
- **Spacing**: `space-y-4 sm:space-y-0 sm:space-x-4`

## 🧪 Testing Guidelines

### Device Testing
- **Mobile Phones**: iPhone SE, iPhone 14, Android phones
- **Tablets**: iPad, Android tablets
- **Desktops**: Various screen sizes and resolutions

### Browser Testing
- **Mobile Browsers**: Safari iOS, Chrome Android
- **Desktop Browsers**: Chrome, Firefox, Safari, Edge

### Accessibility Testing
- **Touch Targets**: Minimum 44px for interactive elements
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Readers**: Proper ARIA labels and semantic HTML

## 🚀 Performance Optimizations

### Mobile Performance
- **Optimized Images**: Responsive images with proper sizing
- **Minimal JavaScript**: Client-side JS only where needed
- **Fast Loading**: Optimized bundle sizes
- **Smooth Animations**: Hardware-accelerated transitions

### Theme Performance
- **No FOUC**: Proper theme initialization
- **Cached Preferences**: Theme choice persisted locally
- **System Integration**: Respects system theme changes

## 📱 Mobile-Specific Features

### Touch Interactions
- **Swipe Gestures**: Where appropriate (future enhancement)
- **Pull to Refresh**: On data-heavy pages (future enhancement)
- **Touch Feedback**: Visual feedback for touch interactions

### Mobile Navigation
- **Hamburger Menu**: Collapsible navigation
- **Bottom Navigation**: For key actions (future enhancement)
- **Breadcrumbs**: Clear navigation hierarchy

### Mobile Forms
- **Large Inputs**: Easy to tap and type
- **Proper Keyboards**: Number pad for codes, email keyboard for emails
- **Auto-focus**: Logical focus flow
- **Validation**: Clear error messages

## 🔧 Implementation Details

### Theme Provider Setup
```tsx
<ThemeProvider
  attribute="class"
  defaultTheme="system"
  enableSystem
  disableTransitionOnChange
>
```

### Responsive Grid Example
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
```

### Mobile Menu Pattern
```tsx
{/* Desktop Navigation */}
<nav className="hidden md:flex space-x-6">

{/* Mobile Menu Button */}
<div className="md:hidden">
  <Button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
    <Menu className="h-5 w-5" />
  </Button>
</div>
```

The CourtIQ platform is now fully responsive and provides an excellent user experience across all device types and screen sizes!