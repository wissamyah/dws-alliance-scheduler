// Component Loader Module
// Loads HTML components dynamically for better code organization

const ComponentLoader = (function() {
  // Component manifest - maps component IDs to their file paths
  const components = {
    'skeleton-loader': 'components/skeleton-loader.html',
    'auth-modal': 'components/auth-modal.html',
    'floating-buttons': 'components/floating-buttons.html',
    'mobile-settings': 'components/mobile-settings.html',
    'timezone-modal': 'components/timezone-modal.html',
    'custom-modal': 'components/custom-modal.html',
    'header': 'components/header.html',
    'tab-navigation': 'components/tab-navigation.html',
    'submit-info-tab': 'components/submit-info-tab.html',
    'registration-tab': 'components/registration-tab.html',
    'view-alliance-tab': 'components/view-alliance-tab.html'
  };

  // Cache for loaded components
  const cache = {};

  // Load a single component with retry logic
  async function loadComponent(componentId, retries = 3) {
    // Check cache first
    if (cache[componentId]) {
      return cache[componentId];
    }

    const path = components[componentId];
    if (!path) {
      console.error(`Component not found: ${componentId}`);
      return '';
    }

    let lastError;
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await fetch(path);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const html = await response.text();

        // Validate HTML content
        if (!html || html.trim().length === 0) {
          throw new Error('Empty component content');
        }

        cache[componentId] = html;
        console.log(`✅ Loaded component: ${componentId}`);
        return html;
      } catch (error) {
        lastError = error;
        console.warn(`⚠️ Attempt ${attempt}/${retries} failed for ${componentId}:`, error.message);

        // Wait before retrying (exponential backoff)
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, 100 * attempt));
        }
      }
    }

    console.error(`❌ Failed to load component ${componentId} after ${retries} attempts:`, lastError);
    return '';
  }

  // Load all components and inject into specified containers
  // SEQUENTIAL loading to prevent server overload
  async function loadAll() {
    console.log('🔄 Loading components sequentially...');
    let successCount = 0;
    let failCount = 0;

    for (const componentId of Object.keys(components)) {
      const html = await loadComponent(componentId);
      const targetElement = document.getElementById(`component-${componentId}`);

      if (targetElement && html) {
        targetElement.outerHTML = html;
        successCount++;
      } else if (!targetElement) {
        console.warn(`⚠️ No placeholder found for component: ${componentId}`);
        failCount++;
      } else {
        failCount++;
      }
    }

    console.log(`✅ Component loading complete: ${successCount} succeeded, ${failCount} failed`);

    if (failCount > 0) {
      console.error(`❌ ${failCount} components failed to load. App may not work correctly.`);
    }
  }

  // Preload all components (for faster rendering)
  async function preload() {
    const loadingPromises = Object.keys(components).map(componentId =>
      loadComponent(componentId)
    );

    await Promise.all(loadingPromises);
    console.log('✅ All components preloaded');
  }

  // Public API
  return {
    load: loadComponent,
    loadAll,
    preload
  };
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ComponentLoader;
}
