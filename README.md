# MAJANI INSURANCE - Vehicle Insurance Management System

A multi-page web application for managing vehicle insurance clients, policies, claims, and commissions. Built with modern HTML5, CSS3, and JavaScript.

## 🚀 Quick Start

1. **Open `public/index.html`** in any modern web browser
2. **Test the application** - Navigate between pages using the sidebar
3. **Add clients** - Use the "Add New Client" form with full validation
4. **Search and filter** - Test the search and filtering functionality

## 📁 Project Structure

```
dashboard-insurance/
├── public/
│   ├── index.html          # Dashboard page
│   ├── clients.html         # Client management page
│   ├── policies.html        # Policy management page
│   ├── claims.html          # Claims management page
│   ├── commissions.html     # Commission tracking page
│   ├── settings.html        # Settings page
│   ├── login.html           # Login page
│   └── js/
│       ├── dashboard.js     # Dashboard functionality
│       ├── clients.js       # Client management functionality
│       └── firebase.js      # Firebase configuration
├── style.css               # Complete CSS styling
├── script.js               # Shared JavaScript functionality
├── package.json            # Project configuration
└── README.md              # This file
```

## ✨ Features

### ✅ Fully Implemented
- **Multi-page Application** - Separate pages for each feature
- **Dashboard** - Overview with stats, quick actions, and alerts
- **Client Management** - Complete CRUD with form validation
- **Responsive Design** - Mobile-friendly with collapsible sidebar
- **Search & Filtering** - Global search and client-specific filters
- **Data Persistence** - Local storage for demo (ready for backend)

### 🔄 Ready for Backend Integration
- **API Placeholders** - Structured methods for easy backend connection
- **Data Models** - Well-defined structures for all entities
- **Error Handling** - Comprehensive error management framework

## 🎯 Sections

1. **Dashboard** - Overview with stats and quick actions
2. **Clients** - Add, view, edit, delete clients
3. **Policies** - Policy management (placeholder)
4. **Claims** - Claims processing (placeholder)
5. **Commissions** - Commission tracking (placeholder)
6. **Settings** - User profile and preferences

## 🔧 Backend Integration

The application is structured for easy backend integration. Replace the placeholder methods in `script.js`:

```javascript
// Replace this placeholder:
async apiCall(method, endpoint, data = null) {
    // With actual API calls:
    const response = await fetch(`/api${endpoint}`, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: data ? JSON.stringify(data) : null
    });
    return await response.json();
}
```

## 📱 Mobile Responsive

- Collapsible sidebar on mobile devices
- Touch-friendly buttons and forms
- Responsive grid layouts
- Optimized table views for small screens

## 🎨 Design

- **Modern blue color scheme** matching the mockup
- **Professional typography** with Inter font family
- **Smooth animations** and hover effects
- **Clean card-based layout** with proper shadows
- **Status badges** with color coding

## 🚀 Development

```bash
# Install dependencies (optional)
npm install

# Start development server
npm run dev

# Or simply open index.html in browser
```

## 📞 Support

For questions or issues:
1. Check the browser console for errors
2. Verify all files are properly linked
3. Test in different browsers

---

**Built with ❤️ for MAJANI INSURANCE**

This single-page application provides a solid foundation for a complete insurance management system with clean, maintainable code structure.