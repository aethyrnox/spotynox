# SPOTYNOX - Spotify Receipt Generator

A beautiful, neon-themed web application that generates Receiptify-style receipts from your Spotify listening data.

## 🎵 Features

- **Neon Dark Theme**: Stunning dark interface with purple/pink neon glow effects
- **Spotify Integration**: Real Spotify Web API integration for authentic data
- **Responsive Design**: Works perfectly on mobile, tablet, and desktop
- **Receipt Generation**: Creates beautiful receipt-style summaries of your top tracks
- **Download Feature**: Save your receipt as a PNG image
- **Real-time Data**: Fetches your actual Spotify listening history
- **Smooth Animations**: Engaging visual effects and transitions

## 🎨 Design

The application uses a carefully crafted neon color palette:
- Primary: `#BC6FF1` (Bright Purple)
- Secondary: `#892CDC` (Medium Purple) 
- Tertiary: `#52057B` (Dark Purple)
- Background: `#000000` (Pure Black)

## 🚀 Getting Started

### Prerequisites
- A modern web browser
- Internet connection
- Spotify account

### Installation

1. **Clone or download the files:**
   ```bash
   git clone <repository-url>
   # or download the ZIP file
   ```

2. **Start a local server:**
   ```bash
   # Using Python 3
   python3 -m http.server 8000
   
   # Using Python 2
   python -m SimpleHTTPServer 8000
   
   # Using Node.js
   npx http-server -p 8000
   
   # Using PHP
   php -S localhost:8000
   ```

3. **Open your browser:**
   Navigate to `http://localhost:8000`

## 🔧 Configuration

The Spotify API credentials are already configured in the application:
- **Client ID**: `-`
- **Client Secret**: `-`

> **Note**: In a production environment, the client secret should be handled server-side for security.

## 📱 Usage

1. **Login**: Click "Login with Spotify" to authenticate
2. **Authorization**: Grant permissions to access your Spotify data
3. **View Receipt**: Your personalized music receipt will be generated
4. **Download**: Save your receipt as an image file
5. **Refresh**: Update your data anytime with the refresh button
6. **Logout**: Clear your session when done

## ⌨️ Keyboard Shortcuts

- `Ctrl/Cmd + L`: Login with Spotify
- `Ctrl/Cmd + R`: Refresh data (when logged in)
- `Escape`: Logout

## 🎯 Features Breakdown

### Authentication
- Spotify OAuth 2.0 integration
- Secure token handling
- Session persistence
- Automatic token refresh

### Data Fetching
- User profile information
- Top tracks (medium-term)
- Real-time API calls
- Error handling and retry logic

### UI Components
- **Header**: Logo with pulsing glow effect
- **Login Section**: Animated login form with neon styling
- **Dashboard**: User info and receipt display
- **Receipt**: Authentic receipt-style layout
- **Loading**: Animated neon loading rings
- **Footer**: Credits and copyright

### Responsive Design
- **Mobile**: Optimized for phones (320px+)
- **Tablet**: Adapted for tablets (768px+)
- **Desktop**: Full experience (1024px+)

## 🎨 Styling Features

- CSS custom properties for consistent theming
- Neon glow effects using `text-shadow` and `box-shadow`
- Smooth transitions and hover effects
- Gradient backgrounds and borders
- Custom scrollbar styling
- Floating particle animations

## 🔒 Security Notes

- Tokens are stored in localStorage
- HTTPS recommended for production
- Client secret should be server-side in production
- CORS considerations for different domains

## 🐛 Troubleshooting

### Common Issues

1. **Login not working**:
   - Check internet connection
   - Ensure you're using HTTPS in production
   - Verify Spotify app settings

2. **No data showing**:
   - Make sure you have Spotify listening history
   - Try refreshing the data
   - Check browser console for errors

3. **Styling issues**:
   - Ensure all CSS files are loading
   - Check for browser compatibility
   - Clear browser cache

### Browser Support
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 🎵 API Endpoints Used

- `GET /v1/me` - User profile
- `GET /v1/me/top/tracks` - Top tracks
- `POST /api/token` - Authentication

## 📄 License

This project is for educational and personal use. Spotify is a trademark of Spotify AB.

## 👨‍💻 Credits

**Made with ❤️ by Rahmatt**

© 2025 Spotynox Neon. All rights reserved.

---

## 🚀 Live Demo

Start the server and visit `http://localhost:8000` to see SPOTYNOX in action!

Enjoy your neon Spotify experience! 🎵✨
