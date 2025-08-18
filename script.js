// Spotify API Configuration
const SPOTIFY_CONFIG = {
    clientId: '489e0479f85e42548d4dcaddcd0d3dfb',
    clientSecret: '83bc778464834dfe9c38dc1911e5e5ac',
    redirectUri: 'https://aethyrnox.github.io/spotynox',
    scopes: [
        'user-read-private',
        'user-read-email',
        'user-top-read',
        'user-read-recently-played',
        'playlist-read-private'
    ].join(' ')
};

// Application State
let accessToken = null;
let userData = null;
let topTracks = [];

// DOM Elements
const loginSection = document.getElementById('loginSection');
const dashboardSection = document.getElementById('dashboardSection');
const loadingSection = document.getElementById('loadingSection');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const loginError = document.getElementById('loginError');
const refreshBtn = document.getElementById('refreshBtn');
const downloadBtn = document.getElementById('downloadBtn');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('SPOTYNOX initialized');
    
    // Check if we're returning from Spotify auth
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');
    
    if (error) {
        showError('Authentication failed: ' + error);
        return;
    }
    
    if (code) {
        // Exchange code for access token
        exchangeCodeForToken(code);
        return;
    }
    
    // Check for existing token in localStorage
    const savedToken = localStorage.getItem('spotify_access_token');
    if (savedToken) {
        accessToken = savedToken;
        loadUserData();
    } else {
        showLoginSection();
    }
    
    // Event listeners
    loginBtn.addEventListener('click', initiateSpotifyLogin);
    logoutBtn.addEventListener('click', logout);
    refreshBtn.addEventListener('click', refreshData);
    downloadBtn.addEventListener('click', downloadReceipt);
});

// Show different sections
function showLoginSection() {
    loginSection.classList.remove('hidden');
    dashboardSection.classList.add('hidden');
    loadingSection.classList.add('hidden');
    logoutBtn.classList.add('hidden');
}

function showLoadingSection() {
    loginSection.classList.add('hidden');
    dashboardSection.classList.add('hidden');
    loadingSection.classList.remove('hidden');
    logoutBtn.classList.remove('hidden');
}

function showDashboardSection() {
    loginSection.classList.add('hidden');
    dashboardSection.classList.remove('hidden');
    loadingSection.classList.add('hidden');
    logoutBtn.classList.remove('hidden');
}

function showError(message) {
    loginError.textContent = message;
    loginError.classList.remove('hidden');
    setTimeout(() => {
        loginError.classList.add('hidden');
    }, 5000);
}

// Spotify Authentication
function initiateSpotifyLogin() {
    const authUrl = `https://accounts.spotify.com/authorize?` +
        `client_id=${SPOTIFY_CONFIG.clientId}&` +
        `response_type=code&` +
        `redirect_uri=${encodeURIComponent(SPOTIFY_CONFIG.redirectUri)}&` +
        `scope=${encodeURIComponent(SPOTIFY_CONFIG.scopes)}&` +
        `show_dialog=true`;
    
    window.location.href = authUrl;
}

async function exchangeCodeForToken(code) {
    showLoadingSection();
    
    try {
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + btoa(SPOTIFY_CONFIG.clientId + ':' + SPOTIFY_CONFIG.clientSecret)
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: SPOTIFY_CONFIG.redirectUri
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to exchange code for token');
        }
        
        const data = await response.json();
        accessToken = data.access_token;
        
        // Save token to localStorage
        localStorage.setItem('spotify_access_token', accessToken);
        
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Load user data
        await loadUserData();
        
    } catch (error) {
        console.error('Token exchange error:', error);
        showError('Failed to authenticate with Spotify. Please try again.');
        showLoginSection();
    }
}

// Load user data from Spotify API
async function loadUserData() {
    if (!accessToken) {
        showLoginSection();
        return;
    }
    
    showLoadingSection();
    
    try {
        // Fetch user profile
        const userResponse = await spotifyApiCall('https://api.spotify.com/v1/me');
        userData = userResponse;
        
        // Fetch top tracks
        const tracksResponse = await spotifyApiCall('https://api.spotify.com/v1/me/top/tracks?limit=10&time_range=medium_term');
        topTracks = tracksResponse.items;
        
        // Update UI
        updateUserInterface();
        showDashboardSection();
        
    } catch (error) {
        console.error('Error loading user data:', error);
        if (error.message.includes('401')) {
            // Token expired, need to re-authenticate
            localStorage.removeItem('spotify_access_token');
            accessToken = null;
            showError('Session expired. Please login again.');
            showLoginSection();
        } else {
            showError('Failed to load your Spotify data. Please try again.');
            showLoginSection();
        }
    }
}

// Make authenticated API calls to Spotify
async function spotifyApiCall(url) {
    const response = await fetch(url, {
        headers: {
            'Authorization': 'Bearer ' + accessToken
        }
    });
    
    if (!response.ok) {
        throw new Error(`Spotify API error: ${response.status}`);
    }
    
    return await response.json();
}

// Update the user interface with data
function updateUserInterface() {
    // Update user info
    document.getElementById('userName').textContent = userData.display_name || 'Spotify User';
    document.getElementById('userFollowers').textContent = `${userData.followers.total} followers`;
    
    // Update user avatar
    const userImage = document.getElementById('userImage');
    if (userData.images && userData.images.length > 0) {
        userImage.src = userData.images[0].url;
        userImage.alt = userData.display_name + ' avatar';
    } else {
        userImage.src = 'https://placehold.co/100x100?text=User';
        userImage.alt = 'Default user avatar';
    }
    
    // Update receipt date
    document.getElementById('receiptDate').textContent = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Update tracks list
    const tracksContainer = document.getElementById('topTracks');
    tracksContainer.innerHTML = '';
    
    topTracks.forEach((track, index) => {
        const trackElement = document.createElement('div');
        trackElement.className = 'track-item';
        trackElement.innerHTML = `
            <div class="track-info">
                <div class="track-name">${truncateText(track.name, 25)}</div>
                <div class="track-artist">${track.artists.map(artist => artist.name).join(', ')}</div>
            </div>
            <div class="track-popularity">${track.popularity}%</div>
        `;
        tracksContainer.appendChild(trackElement);
    });
    
    // Calculate total popularity for fun
    const totalPopularity = topTracks.reduce((sum, track) => sum + track.popularity, 0);
    document.getElementById('totalPlays').textContent = Math.floor(totalPopularity * 10);
}

// Utility function to truncate text
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
}

// Refresh data
async function refreshData() {
    await loadUserData();
}

// Logout functionality
function logout() {
    // Clear stored data
  localStorage.removeItem("access_token");
  window.location.href = "https://aethyrnox.github.io/spotynox";
}
    
    // Show login section
    showLoginSection();
    
    // Clear any error messages
    loginError.classList.add('hidden');
}

// Download receipt as image (simplified version)
function downloadReceipt() {
    // Create a canvas to draw the receipt
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = 400;
    canvas.height = 600;
    
    // Fill background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add border
    ctx.strokeStyle = '#892CDC';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
    
    // Add title
    ctx.fillStyle = '#BC6FF1';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('SPOTYNOX RECEIPT', canvas.width / 2, 50);
    
    // Add date
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '14px Arial';
    ctx.fillText(new Date().toLocaleDateString(), canvas.width / 2, 80);
    
    // Add user name
    ctx.fillStyle = '#BC6FF1';
    ctx.font = 'bold 18px Arial';
    ctx.fillText(userData?.display_name || 'Spotify User', canvas.width / 2, 120);
    
    // Add tracks
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    
    let yPosition = 160;
    ctx.fillText('TOP TRACKS:', 30, yPosition);
    yPosition += 30;
    
    topTracks.slice(0, 8).forEach((track, index) => {
        const trackText = `${index + 1}. ${truncateText(track.name, 30)}`;
        const artistText = `    ${truncateText(track.artists[0].name, 25)}`;
        
        ctx.fillText(trackText, 30, yPosition);
        yPosition += 20;
        ctx.fillStyle = '#892CDC';
        ctx.fillText(artistText, 30, yPosition);
        ctx.fillStyle = '#FFFFFF';
        yPosition += 25;
    });
    
    // Add footer
    yPosition = canvas.height - 80;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#BC6FF1';
    ctx.font = '14px Arial';
    ctx.fillText('Thank you for using SPOTYNOX!', canvas.width / 2, yPosition);
    
    yPosition += 30;
    ctx.fillStyle = '#892CDC';
    ctx.font = '12px Arial';
    ctx.fillText('© 2025 Spotynox Neon. Made by Rahmatt', canvas.width / 2, yPosition);
    
    // Download the image
    const link = document.createElement('a');
    link.download = `spotynox-receipt-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
}

// Add some visual effects
function addVisualEffects() {
    // Add floating particles effect
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'particles-container';
    particlesContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: -1;
    `;
    
    document.body.appendChild(particlesContainer);
    
    // Create particles
    for (let i = 0; i < 50; i++) {
        createParticle(particlesContainer);
    }
}

function createParticle(container) {
    const particle = document.createElement('div');
    particle.style.cssText = `
        position: absolute;
        width: 2px;
        height: 2px;
        background: #BC6FF1;
        border-radius: 50%;
        animation: float ${Math.random() * 10 + 5}s linear infinite;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        opacity: ${Math.random() * 0.5 + 0.2};
        box-shadow: 0 0 6px #BC6FF1;
    `;
    
    container.appendChild(particle);
    
    // Remove particle after animation
    setTimeout(() => {
        if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
        }
    }, 15000);
}

// Add CSS for particle animation
const style = document.createElement('style');
style.textContent = `
    @keyframes float {
        0% {
            transform: translateY(100vh) rotate(0deg);
            opacity: 0;
        }
        10% {
            opacity: 1;
        }
        90% {
            opacity: 1;
        }
        100% {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize visual effects
setTimeout(addVisualEffects, 1000);

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + L for login
    if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault();
        if (!accessToken) {
            initiateSpotifyLogin();
        }
    }
    
    // Ctrl/Cmd + R for refresh (when logged in)
    if ((e.ctrlKey || e.metaKey) && e.key === 'r' && accessToken) {
        e.preventDefault();
        refreshData();
    }
    
    // Escape for logout
    if (e.key === 'Escape' && accessToken) {
        logout();
    }
});

// Add error handling for network issues
window.addEventListener('online', function() {
    if (accessToken && !userData) {
        loadUserData();
    }
});

window.addEventListener('offline', function() {
    showError('You are offline. Some features may not work properly.');
});

// Console welcome message
console.log(`
🎵 SPOTYNOX - Your Spotify Receipt Generator 🎵
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Welcome to SPOTYNOX! 
This app generates beautiful neon-themed receipts from your Spotify data.

Keyboard shortcuts:
• Ctrl/Cmd + L: Login with Spotify
• Ctrl/Cmd + R: Refresh data
• Escape: Logout

Made with ❤️ by Rahmatt
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
 
