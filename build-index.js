#!/usr/bin/env node

/**
 * Build Script - Combines all components into a single index.html
 * Run with: node build-index.js
 */

const fs = require('fs');
const path = require('path');

// Component mapping
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

// Read the template index.html
const templatePath = 'index.html';
let html = fs.readFileSync(templatePath, 'utf-8');

// Replace each component placeholder with actual content
for (const [componentId, componentPath] of Object.entries(components)) {
  const placeholder = `<div id="component-${componentId}"></div>`;

  if (!fs.existsSync(componentPath)) {
    console.error(`❌ Component file not found: ${componentPath}`);
    continue;
  }

  const componentContent = fs.readFileSync(componentPath, 'utf-8');
  html = html.replace(placeholder, componentContent);
  console.log(`✅ Injected component: ${componentId}`);
}

// Remove the component loader script and initialization
html = html.replace(
  /<!-- Component Loader - Load first! -->[\s\S]*?<script src="js\/componentLoader\.js"><\/script>/,
  '<!-- Components pre-built -->'
);

html = html.replace(
  /<!-- Initialize component loading -->[\s\S]*?<script>[\s\S]*?initializeComponents[\s\S]*?<\/script>/,
  ''
);

// Write the built file
const outputPath = 'index-built.html';
fs.writeFileSync(outputPath, html, 'utf-8');

console.log(`\n✅ Build complete! Output: ${outputPath}`);
console.log(`📦 Single HTML file ready for production`);
console.log(`\nTo use it, rename:\n  index-built.html → index.html`);
