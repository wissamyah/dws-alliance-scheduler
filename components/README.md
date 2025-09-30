# Component System

This directory contains HTML components that are dynamically loaded into the main `index.html` file.

## Component Structure

### Core Components
- **skeleton-loader.html** - Loading skeleton templates displayed during data fetch
- **auth-modal.html** - Authentication modal for GitHub token input
- **floating-buttons.html** - Floating authentication button
- **mobile-settings.html** - Mobile settings panel with language selector

### Layout Components
- **header.html** - Page header with title, language selector, and logout button
- **tab-navigation.html** - Tab navigation buttons (Submit Info, Registration, View Alliance)

### Modal Components
- **timezone-modal.html** - Timezone confirmation modal
- **custom-modal.html** - Reusable custom dialog modal

### Tab Content Components
- **submit-info-tab.html** - Submit member information tab content
- **registration-tab.html** - Alliance registration form tab content
- **view-alliance-tab.html** - View alliance members and timeline tab content

## How It Works

1. The `index.html` file contains placeholder `<div>` elements with IDs like `component-{name}`
2. The `js/componentLoader.js` script loads each component file via fetch API
3. Components are injected into the page by replacing the placeholder elements
4. All components are loaded before the main application initializes

## Adding New Components

1. Create a new `.html` file in the `components/` directory
2. Add the component to the manifest in `js/componentLoader.js`:
   ```javascript
   const components = {
     'my-component': 'components/my-component.html',
     // ...
   };
   ```
3. Add a placeholder in `index.html`:
   ```html
   <div id="component-my-component"></div>
   ```

## Editing Components

Simply edit the `.html` file in this directory. Changes will be reflected when the page is reloaded.

## Benefits

✅ **Modular** - Each component is in its own file
✅ **Maintainable** - Easy to find and edit specific sections
✅ **Reusable** - Components can be loaded in multiple places
✅ **Clean** - Main index.html is only 70 lines (down from 871!)
✅ **Fast** - Components are cached after first load

## Original File

The original monolithic `index.html` is backed up as `index.html.backup` (871 lines).
