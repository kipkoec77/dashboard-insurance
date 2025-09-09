# Majani Insurance Agent Management System

A comprehensive web-based insurance agent management system built with HTML, CSS, JavaScript, and Firebase.

## Features

- **Dashboard**: Overview of clients, policies, claims, and commissions
- **Client Management**: Add, view, and manage insurance clients
- **Policy Management**: Track and manage insurance policies
- **Claims Processing**: Handle insurance claims
- **Commission Tracking**: Monitor agent commissions
- **Reports**: Generate and export business reports
- **User Authentication**: Secure login with Firebase Auth
- **Settings**: User profile and system settings

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Firebase (Authentication & Firestore)
- **Hosting**: Vercel
- **Styling**: Custom CSS with modern design

## Deployment on Vercel

### Prerequisites

1. Install [Node.js](https://nodejs.org/) (version 14 or higher)
2. Install [Vercel CLI](https://vercel.com/cli): `npm i -g vercel`
3. Create a [Vercel account](https://vercel.com/signup)

### Deployment Steps

1. **Clone/Download the project**
   ```bash
   git clone <your-repo-url>
   cd insurance-cms
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy to Vercel**
   ```bash
   vercel --prod
   ```

4. **Follow the prompts:**
   - Set up and deploy? `Y`
   - Which scope? Select your account
   - Link to existing project? `N` (for first deployment)
   - Project name: `majani-insurance-cms` (or your preferred name)
   - In which directory is your code located? `./`

### Environment Setup

The application uses Firebase for authentication and database. Make sure your Firebase configuration in `firebase.js` is properly set up with your project credentials.

### Custom Domain (Optional)

To use a custom domain:
1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings > Domains
4. Add your custom domain

## Local Development

To run the project locally:

```bash
# Install Vercel CLI if not already installed
npm install -g vercel

# Start local development server
vercel dev
```

The application will be available at `http://localhost:3000`

## Project Structure

```
insurance-cms/
├── index.html          # Entry point (redirects to login)
├── login.html          # Login page
├── dashboard.html      # Main dashboard
├── clients.html        # Client management
├── policies.html       # Policy management
├── claims.html         # Claims processing
├── commissions.html    # Commission tracking
├── reports.html        # Reports and analytics
├── settings.html       # User settings
├── change-password.html # Password change
├── styles.css          # Main stylesheet
├── app.js             # Main application logic
├── firebase.js        # Firebase configuration
├── dashboard.js       # Dashboard functionality
├── clients.js         # Client management logic
├── settings.js        # Settings functionality
├── change-password.js # Password change logic
├── package.json       # Project configuration
├── vercel.json        # Vercel deployment configuration
└── README.md          # This file
```

## Configuration Files

- **vercel.json**: Vercel deployment configuration with routing rules
- **package.json**: Project metadata and scripts
- **.gitignore**: Files and folders to ignore in version control

## Security Features

- Firebase Authentication for secure user management
- Security headers configured in vercel.json
- Protected routes that require authentication
- Input validation and sanitization

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

ISC License

## Support

For support and questions, please contact the development team.
