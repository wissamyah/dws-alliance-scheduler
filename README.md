# The Dark Creed Alliance Scheduler

A web-based alliance coordination tool for gaming community management, featuring real-time timezone coordination and member availability tracking.

## Features

- 🌍 **Smart Timezone Management** - Auto-detects user timezone with manual override option
- 👥 **Member Registration** - Track username, car power, tower level, and availability
- ⏰ **Time Slot Coordination** - 2-hour time blocks with automatic server time conversion (UTC-2)
- 💾 **GitHub-Based Persistence** - Uses GitHub API for data storage and authentication
- 🌐 **Multi-Language Support** - Available in English, Portuguese, French, Spanish, and Italian
- 📱 **Responsive Design** - Works seamlessly on both desktop and mobile devices
- 🔒 **Secure Authentication** - GitHub token-based access control
- 📊 **Visual Timeline** - Color-coded availability heatmap for optimal scheduling

## Architecture

### Modular Structure

```
/
├── index.html           # Main application UI
├── style.css           # Styling with dark theme
├── translations.js     # Multi-language support
├── data.json          # Alliance data store
└── js/
    ├── config.js      # Configuration and constants
    ├── state.js       # Centralized state management
    ├── utils.js       # Utility functions
    ├── api.js         # GitHub API operations
    ├── components.js  # Reusable UI components
    ├── ui.js          # UI rendering logic
    └── app.js         # Main application controller
```

### Core Technologies

- **Frontend**: Pure HTML/CSS/JavaScript (no framework dependencies)
- **Backend**: GitHub repository (via GitHub API)
- **Authentication**: GitHub personal access tokens
- **Data Format**: JSON

## Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- GitHub account
- GitHub personal access token (provided by alliance R4/R5)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/wissamyah/dws-alliance-scheduler.git
```

2. Open `index.html` in your web browser

3. Authenticate with your GitHub token when prompted

### Usage

1. **Timezone Setup**
   - Confirm auto-detected timezone or manually select
   - All times will be converted to server time (UTC-2)

2. **Submit Information**
   - Enter your in-game username
   - Add car power and tower level
   - Select available time slots
   - Submit to save

3. **View Alliance**
   - See all members and their availability
   - View timeline heatmap for coordination
   - Search and filter members

## Development

### Module Overview

- **config.js** - Central configuration, constants, and settings
- **state.js** - Application state management with event system
- **utils.js** - Reusable utility functions and helpers
- **api.js** - GitHub API integration with retry logic
- **components.js** - Reusable UI component library
- **ui.js** - DOM operations and rendering logic
- **app.js** - Main application logic and coordination

### Key Features

- Request queuing with retry logic
- DOM element caching for performance
- Input validation and sanitization
- Responsive design patterns
- Event-driven architecture

## Security

- Never commit tokens to the repository
- Authentication required for all data modifications
- Input sanitization to prevent XSS attacks
- Secure password handling for admin functions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## Performance

- **Modular architecture** - Clean separation of concerns
- **Optimized rendering** - Selective DOM updates
- **Caching strategy** - Reduces unnecessary API calls
- **Lazy loading** - Components load as needed
- **Debounced events** - Prevents excessive updates

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

Private repository - All rights reserved to The Dark Creed Alliance

## Support

For issues or questions, contact your alliance R4/R5 administrators.

---

Built with ❤️ for The Dark Creed Alliance