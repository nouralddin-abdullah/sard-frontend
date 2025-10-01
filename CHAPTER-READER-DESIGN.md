# Chapter Reader Page - Modern Reading Experience 📖

## Overview
A beautiful, distraction-free chapter reading page inspired by WebNovel's reader, designed for the best reading experience with full customization options.

## Features

### 🎯 Clean Header
- **Left Side**: Library link + User profile icon with dropdown
- **Center**: Book icon + Novel title / Chapter number / Chapter name
- **Right Side**: Reading progress percentage (e.g., "| 42%")
- **No main header**: Minimal distractions for focused reading

### 📋 Table of Contents Sidebar (Right)
- **Toggle Button**: Menu icon in left sidebar
- **Features**:
  - Full chapter list organized by volumes
  - Current chapter highlighted in blue
  - Chapter numbers and titles
  - Smooth scrolling
  - Chapter range pagination (1-100, 101-200, etc.)
  - Click any chapter to navigate
- **Position**: Slides in from the right (400px width)
- **Close**: X button or click anywhere outside

### ⚙️ Reading Settings Sidebar (Right)
- **Toggle Button**: Settings icon in left sidebar
- **Customization Options**:
  1. **Theme Selection**:
     - Light: White background, dark text
     - Sepia: Warm beige background, brown text
     - Dark: Dark gray background, white text (default)
  2. **Font Family**:
     - Noto Sans Arabic (modern, clean)
     - Amiri (traditional, elegant)
  3. **Font Size**:
     - Range: 14px to 32px
     - +/- buttons for adjustment
     - Current size displayed

### 📊 Progress Tracking
- **Top Bar**: Percentage display in header
- **Bottom Bar**: Visual progress bar (blue)
- **Auto-calculated**: Based on scroll position
- **Real-time updates**: Smooth transitions

### 🎨 Theme Styles
- **Dark Theme** (Default):
  - Background: #2C2C2C
  - Text: #FFFFFF
  - Secondary: #AAAAAA
- **Light Theme**:
  - Background: #FFFFFF
  - Text: #2C2C2C
  - Secondary: #666666
- **Sepia Theme**:
  - Background: #F4ECD8
  - Text: #5C4B37
  - Secondary: #8B7355

### 🔄 Navigation
- **Previous Chapter Button**: Right side with arrow
- **Next Chapter Button**: Left side with arrow
- **Keyboard Shortcuts** (planned):
  - Arrow keys for navigation
  - Escape to close sidebars
  - Numbers for quick settings

### 📱 Responsive Design
- **Desktop**: Full sidebar experience
- **Tablet**: Adjusted sidebar widths
- **Mobile**: Bottom sheet for TOC and settings (planned)

## File Structure

```
src/pages/novel/
├── chapter-reader.jsx        # Main chapter reader component
├── page.jsx                   # Novel details page (links here)
└── create.jsx                 # Novel creation page

src/utils/
└── routes.jsx                 # Route configuration
```

## URL Structure

```
/novel/:novelSlug/chapter/:chapterId
```

Example:
```
/novel/journey-to-another-world/chapter/1
```

## Components Breakdown

### 1. Top Header Bar
```jsx
- Fixed position at top
- Transparent background matching theme
- Three-section layout (left, center, right)
- Border bottom for separation
```

### 2. Left Control Sidebar
```jsx
- Fixed position at left center
- Two circular buttons:
  * Menu (Table of Contents)
  * Settings (Reader preferences)
- Blue highlight when active
- Hover scale animation
```

### 3. Table of Contents
```jsx
- Fixed sidebar 400px wide
- Dark background (#3C3C3C)
- Scrollable chapter list
- Volume organization
- Current chapter highlighted
- Chapter range navigation at bottom
```

### 4. Settings Panel
```jsx
- Fixed sidebar 350px wide
- Three main sections:
  * Theme selection (visual swatches)
  * Font family (toggle buttons)
  * Font size (slider with +/- buttons)
- Instant preview of changes
```

### 5. Main Content Area
```jsx
- Centered layout (max-width: 800px)
- Large chapter title
- Content with proper line height
- Navigation buttons at bottom
- Scrollable with progress tracking
```

### 6. Progress Bar
```jsx
- Fixed at bottom
- Full width, 4px height
- Blue fill representing progress
- Smooth transitions
```

## State Management

### Reader State
```javascript
- showTOC: boolean          // Table of Contents visibility
- showSettings: boolean     // Settings panel visibility
- scrollProgress: number    // Reading progress (0-100)
- isDropdownOpen: boolean   // User menu visibility
- imageError: boolean       // Profile image error handling
```

### Reader Preferences
```javascript
- theme: 'dark' | 'light' | 'sepia'
- fontSize: number (14-32)
- fontFamily: 'noto' | 'amiri'
```

## API Integration (To-Do)

### Required Endpoints
```javascript
// Get chapter content
GET /api/novels/:novelSlug/chapters/:chapterId
Response: {
  id: number,
  title: string,
  content: string,
  chapterNumber: number,
  novel: {
    id: number,
    title: string,
    slug: string,
    totalChapters: number
  }
}

// Get table of contents
GET /api/novels/:novelSlug/chapters
Response: {
  volumes: [{
    id: number,
    name: string,
    chapters: [{
      id: number,
      number: number,
      title: string
    }]
  }]
}

// Save reading progress
POST /api/novels/:novelSlug/chapters/:chapterId/progress
Body: {
  progress: number (0-100)
}
```

## Mock Data

Currently uses mock data for development:
- Sample chapter with Arabic content
- 10 chapters in table of contents
- Single volume structure

## Styling Details

### Colors
- **Primary Blue**: #4A9EFF
- **Primary Hover**: #6BB4FF
- **Dark Gray**: #2C2C2C
- **Medium Gray**: #3C3C3C
- **Light Gray**: #4A4A4A

### Typography
- **Arabic Font**: Noto Sans Arabic, Amiri
- **Font Weights**: 500 (Medium), 800 (ExtraBold)
- **Line Height**: 2.0 for content (optimal reading)

### Animations
- Button hover: scale(1.1)
- Sidebar slide: 300ms ease
- Progress bar: 300ms transition
- Theme switch: instant

## User Experience Features

### 1. Distraction-Free Reading
- No navigation clutter
- Hidden sidebars by default
- Clean, focused layout
- Proper content width for reading

### 2. Quick Access
- TOC and Settings always one click away
- User menu in familiar top-right position
- Clear visual feedback for all interactions

### 3. Personalization
- Remember user preferences (localStorage)
- Theme persists across sessions
- Font choices for different tastes
- Adjustable text size for accessibility

### 4. Progress Tracking
- Visual feedback at all times
- Percentage in header
- Progress bar at bottom
- Save progress for later (planned)

## Future Enhancements

### Phase 1
- [ ] Connect to real API
- [ ] Save user preferences to backend
- [ ] Add loading states
- [ ] Error handling

### Phase 2
- [ ] Keyboard shortcuts
- [ ] Night mode (darker than dark theme)
- [ ] Custom color themes
- [ ] Reading stats (time spent, pages read)

### Phase 3
- [ ] Comments on paragraphs
- [ ] Bookmarks
- [ ] Highlights
- [ ] Reading history

### Phase 4
- [ ] Text-to-speech
- [ ] Accessibility improvements
- [ ] Mobile app-like experience
- [ ] Offline reading

## Testing Checklist

### Functionality
- [ ] TOC opens and closes correctly
- [ ] Settings panel opens and closes correctly
- [ ] Only one sidebar open at a time
- [ ] Theme switching works instantly
- [ ] Font changes apply immediately
- [ ] Font size increases/decreases properly
- [ ] Progress bar updates on scroll
- [ ] Navigation buttons work
- [ ] User dropdown functions correctly

### Visual
- [ ] All themes display correctly
- [ ] Text is readable in all themes
- [ ] Sidebars don't overlap content
- [ ] Buttons have proper hover states
- [ ] Icons are centered and sized correctly
- [ ] Progress bar is smooth

### Responsive
- [ ] Works on desktop (1920px+)
- [ ] Works on laptop (1366px)
- [ ] Works on tablet (768px)
- [ ] Works on mobile (375px)

## Usage Example

```jsx
// In NovelPage, link to chapter:
<Link to={`/novel/${novel.slug}/chapter/${chapter.id}`}>
  <p>{chapter.title}</p>
</Link>

// Navigation in chapter reader:
<Link to={`/novel/${novelSlug}/chapter/${nextChapterId}`}>
  Next Chapter
</Link>
```

## Performance Considerations

1. **Smooth Scrolling**: Using native browser scroll
2. **Minimal Re-renders**: State updates only when necessary
3. **Optimized Content**: Virtual scrolling for very long chapters (planned)
4. **Lazy Loading**: Images and content loaded as needed (planned)

---

**Design Philosophy**: "Reading should be a pleasure, not a chore. Every element serves the content." 📚✨
