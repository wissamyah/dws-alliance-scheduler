# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is "The Dark Creed Alliance" scheduler - a web-based alliance coordination tool for a gaming community. It's a client-side application that uses GitHub as a backend for data storage and authentication.

## Architecture

### Core Components

- **Frontend**: Pure HTML/CSS/JavaScript (no framework)
- **Data Storage**: GitHub repository using GitHub API for persistence
- **Authentication**: GitHub personal access tokens
- **Data File**: `data.json` stores all alliance member information and configuration

### Key Files

- `index.html` - Main application UI with timezone modal, member form, and timeline view
- `script.js` - All application logic including GitHub API integration, timezone handling, and UI management
- `style.css` - Complete styling with responsive design and dark theme
- `data.json` - JSON data store with member info, configuration, and timezone settings

### Core Functionality

1. **Timezone Management**: Auto-detects user timezone with manual override option
2. **Member Registration**: Captures username, car power, tower level, and availability slots
3. **Time Slot Coordination**: 2-hour blocks with automatic conversion to server time (UTC-2)
4. **Data Persistence**: Real-time sync with GitHub repository via API calls
5. **Authentication**: GitHub token-based auth for data modifications

### Data Flow

1. App loads `data.json` from GitHub repository on startup
2. User confirms timezone (auto-detected or manual selection)
3. User submits member information through form
4. Data is immediately saved to GitHub and UI updates
5. Timeline shows member availability converted to server time

### Key Constants

- Server timezone: UTC-2
- Time slots: 12 two-hour blocks (12AM-2AM through 10PM-12AM)
- GitHub repo: `wissamyah/dws-alliance-scheduler`
- Data file: `data.json`

## Development Notes

- No build process required - pure static files
- No package.json or dependencies
- No testing framework configured
- Authentication required for all data modifications
- Responsive design supports both mobile and desktop
- Real-time timezone conversion for coordination across timezones

## Running the Application

Simply open `index.html` in a web browser. The application will:
1. Load existing data from GitHub
2. Show timezone confirmation modal
3. Allow member registration after authentication
4. Display real-time coordination timeline

No local development server or build commands needed.