# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Adobe Experience Manager (AEM) Edge Delivery Services boilerplate project for creating high-performance websites. It follows AEM Live/Franklin architecture patterns using vanilla JavaScript, CSS, and component-based development.

## Development Commands

- **Install dependencies**: `npm i`
- **Lint JavaScript and CSS**: `npm run lint`
- **Lint JavaScript only**: `npm run lint:js`
- **Lint CSS only**: `npm run lint:css`
- **Build component models**: `npm run build:json`
- **Start local development**: `aem up` (requires @adobe/aem-cli to be installed globally)

## Architecture

### Core Scripts Architecture
- **`scripts/aem.js`**: Core AEM framework utilities (imported from external package)
- **`scripts/scripts.js`**: Main site initialization and utility functions
  - `decorateMain()`: Decorates main element with buttons, icons, sections, and blocks
  - `moveInstrumentation()`: Moves AEM authoring attributes (`data-aue-*`, `data-richtext-*`)
  - Page loading lifecycle: `loadEager()` → `loadLazy()` → `loadDelayed()`

### Component System
- **Blocks**: Located in `/blocks/[block-name]/` directories
- Each block contains: `[block-name].js`, `[block-name].css`, optional `README.md`
- Component models defined in `/models/` and compiled to root-level JSON files
- Universal Editor integration through component definitions and models

### Key Configuration Files
- **`fstab.yaml`**: Defines content mountpoints from AEM Cloud Service
- **`helix-query.yaml`**: Search index configuration
- **`component-models.json`**: Generated component field definitions for Universal Editor
- **`component-definition.json`**: Generated component metadata for Universal Editor
- **`component-filters.json`**: Generated component availability filters

### Content Architecture
- **Sections and Blocks**: Content is organized in sections containing blocks
- **Auto-blocking**: Can be implemented in `buildAutoBlocks()` function
- **Instrumentation**: AEM authoring data attributes must be preserved during DOM manipulation

## Development Patterns

### Block Development
1. Create block directory: `/blocks/[block-name]/`
2. Export default `decorate(block)` function from `[block-name].js`
3. Process block content: transform table-like structure to semantic HTML
4. Use `moveInstrumentation()` when restructuring DOM elements
5. Use `createOptimizedPicture()` from aem.js for images

### Styling Approach
- **Lazy loading**: Non-critical styles in `styles/lazy-styles.css`
- **Fonts**: Loaded conditionally based on device/connection
- **CSS naming**: Use block-specific class names (e.g., `.carousel-slide`, `.hero-content`)

### Component Model Integration
- Component fields defined in `/models/_component-models.json`
- Models merged and compiled via `npm run build:json`
- Support for Universal Editor authoring experience

## Project Structure Context
- **Development environment**: Requires AEM Cloud Service integration
- **Content source**: AEM Cloud Service via mountpoint configuration
- **Deployment**: Edge Delivery Services infrastructure
- **Authoring**: Universal Editor for WYSIWYG content editing