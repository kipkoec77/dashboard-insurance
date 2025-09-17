// Import Firebase Firestore functions
import { collection, getDocs, getDoc, doc } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// Modern Dashboard Interactive Elements
document.addEventListener("DOMContentLoaded", () => {
  console.log("Dashboard loaded");
  
  // Initialize dashboard UI components
  initializeDashboardUI();
  
  // Wait for Firebase to initialize
  setTimeout(() => {
    const { auth, db } = window.firebaseServices || {};
    
    if (!auth || !db) {
      console.error("Firebase services failed to load");
      return;
    }
    
    console.log("Firebase services loaded successfully!");
    
    // Check authentication
    import("https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js").then(({ onAuthStateChanged, signOut }) => {
      onAuthStateChanged(auth, async (user) => {
        if (!user) {
          console.log("User not authenticated, redirecting to login");
          window.location.href = "login.html";
          return;
        }
        
        console.log("User authenticated:", user.email);
        
        // Check if profile is complete
        const profileComplete = await checkProfileCompletion(db, user);
        
        if (!profileComplete) {
          console.log("Profile incomplete, showing reminder banner (no redirect)");
          showProfileIncompleteBanner();
          // Continue initializing dashboard without redirect
        }
        
        initializeDashboard(auth, db, user);
      });
    });
  }, 1000);
});

// Initialize Dashboard UI Components
function initializeDashboardUI() {
  setupSidebarToggle();
  setupUserDropdown();
  setupMobileMenu();
  setupSearchFunctionality();
  setupNotifications();
}

// Sidebar Toggle Functionality
function setupSidebarToggle() {
  const sidebarToggle = document.querySelector('.sidebar-toggle');
  const sidebar = document.querySelector('.sidebar');
  
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
      
      // Store sidebar state in localStorage
      const isCollapsed = sidebar.classList.contains('collapsed');
      localStorage.setItem('sidebarCollapsed', isCollapsed);
    });
    
    // Restore sidebar state from localStorage
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState === 'true') {
      sidebar.classList.add('collapsed');
    }
  }
}

// User Dropdown Menu
function setupUserDropdown() {
  const userProfileBtn = document.querySelector('.user-profile-btn');
  const userDropdown = document.querySelector('.user-dropdown');
  
  if (userProfileBtn && userDropdown) {
    userProfileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      userDropdown.classList.toggle('show');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!userProfileBtn.contains(e.target) && !userDropdown.contains(e.target)) {
        userDropdown.classList.remove('show');
      }
    });
    
    // Handle dropdown item clicks
    const dropdownItems = userDropdown.querySelectorAll('.dropdown-item');
    dropdownItems.forEach(item => {
      item.addEventListener('click', (e) => {
        const action = item.getAttribute('data-action');
        handleDropdownAction(action);
        userDropdown.classList.remove('show');
      });
    });
  }
}

// Mobile Menu Toggle
function setupMobileMenu() {
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const sidebar = document.querySelector('.sidebar');
  
  if (mobileMenuBtn && sidebar) {
    mobileMenuBtn.addEventListener('click', () => {
      sidebar.classList.toggle('show');
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 768 && 
          !sidebar.contains(e.target) && 
          !mobileMenuBtn.contains(e.target)) {
        sidebar.classList.remove('show');
      }
    });
  }
}

// Enhanced Search Functionality
function setupSearchFunctionality() {
  const searchInput = document.querySelector('.search-input');
  const searchIcon = document.querySelector('.search-icon');
  
  if (searchInput) {
    // Focus search with keyboard shortcut (Ctrl/Cmd + K)
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInput.focus();
      }
    });
    
    // Search input functionality
    searchInput.addEventListener('input', debounce((e) => {
      const query = e.target.value.trim();
      if (query.length > 2) {
        performSearch(query);
      } else {
        clearSearchResults();
      }
    }, 300));
    
    // Clear search on escape
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        searchInput.value = '';
        clearSearchResults();
        searchInput.blur();
      }
    });
  }
}

// Notification System
function setupNotifications() {
  const notificationBtn = document.querySelector('.action-btn[data-action="notifications"]');
  
  if (notificationBtn) {
    notificationBtn.addEventListener('click', () => {
      showNotifications();
    });
    
    // Update notification badge periodically
    updateNotificationBadge();
    setInterval(updateNotificationBadge, 60000); // Update every minute
  }
}

// Handle dropdown actions
function handleDropdownAction(action) {
  switch (action) {
    case 'profile':
      window.location.href = 'settings.html';
      break;
    case 'settings':
      window.location.href = 'settings.html';
      break;
    case 'help':
      showHelpModal();
      break;
    case 'logout':
      handleLogout();
      break;
    default:
      console.log('Unknown action:', action);
  }
}

// Logout functionality
async function handleLogout() {
  if (confirm('Are you sure you want to logout?')) {
    try {
      const { signOut } = await import("https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js");
      const { auth } = window.firebaseServices || {};
      
      if (auth) {
        await signOut(auth);
        console.log('Logout successful');
        window.location.href = 'login.html';
      }
    } catch (error) {
      console.error('Logout error:', error);
      showNotification('Error logging out. Please try again.', 'error');
    }
  }
}

// Search functionality
function performSearch(query) {
  console.log('Searching for:', query);
  // TODO: Implement actual search logic
  showNotification(`Searching for: ${query}`, 'info');
}

function clearSearchResults() {
  // TODO: Clear search results
  console.log('Clearing search results');
}

// Notification functions
function showNotifications() {
  // TODO: Show notifications panel
  console.log('Showing notifications');
  showNotification('No new notifications', 'info');
}

function updateNotificationBadge() {
  const badge = document.querySelector('.notification-badge');
  if (badge) {
    // Get actual notification count from Firebase
    // For now, hide badge until real notifications are implemented
    badge.style.display = 'none';
  }
}

function showHelpModal() {
  // TODO: Implement help modal
  alert('Help documentation coming soon!');
}

// Utility function for debouncing
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Toast notification system
function showNotification(message, type = 'info', duration = 3000) {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <span class="notification-message">${message}</span>
      <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
    </div>
  `;
  
  // Add to page
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => notification.classList.add('show'), 100);
  
  // Auto remove
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, duration);
}

// Function to show profile incomplete banner on dashboard
function showProfileIncompleteBanner() {
  // Avoid duplicating the banner
  if (document.querySelector('#profile-incomplete-banner')) return;

  const banner = document.createElement('div');
  banner.id = 'profile-incomplete-banner';
  banner.className = 'notification notification-warning show';
  banner.innerHTML = `
    <div class="notification-content">
      <span class="notification-message">Please complete your profile to get the most out of the dashboard.</span>
      <div class="notification-actions">
        <button class="btn btn-sm" id="dismiss-profile-banner">Dismiss</button>
        <button class="btn btn-primary btn-sm" id="go-complete-profile">Complete now</button>
      </div>
    </div>
  `;
  document.body.appendChild(banner);

  const dismissBtn = document.getElementById('dismiss-profile-banner');
  const gotoBtn = document.getElementById('go-complete-profile');
  if (dismissBtn) dismissBtn.addEventListener('click', () => banner.remove());
  if (gotoBtn) gotoBtn.addEventListener('click', () => {
    window.location.href = 'settings.html';
  });
}

// Function to check if user profile is complete
async function checkProfileCompletion(db, user) {
  try {
    // Check if user document exists in Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));
    
    if (!userDoc.exists()) {
      console.log("User document does not exist - profile incomplete");
      return false;
    }
    
    const userData = userDoc.data();
    
    // Check if required fields are filled
    const requiredFields = ['name', 'phone', 'address'];
    const missingFields = requiredFields.filter(field => !userData[field] || userData[field].trim() === '');
    
    if (missingFields.length > 0) {
      console.log("Missing required fields:", missingFields);
      return false;
    }
    
    // Check if user has changed their password (not using default)
    if (userData.mustChangePassword === true) {
      console.log("User must change password - profile incomplete");
      return false;
    }
    
    console.log("Profile is complete");
    return true;
    
  } catch (error) {
    console.error("Error checking profile completion:", error);
    return false;
  }
}

async function initializeDashboard(auth, db, user) {
  // Load user profile
  await loadUserProfile(db, user);
  
  // Load dashboard data
  await loadDashboardData(db);
  
  // Set up event listeners
  setupEventListeners(auth);
  
  // Set up search functionality
  setupSearch();
  
  // Set up filter buttons
  setupFilters();
}

async function loadUserProfile(db, user) {
  try {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      updateUserDisplay(userData.name || user.displayName || "User");
    } else {
      updateUserDisplay(user.displayName || "User");
    }
  } catch (error) {
    console.error("Error loading user profile:", error);
    updateUserDisplay(user.displayName || "User");
  }
}

function updateUserDisplay(name) {
  const userNameElement = document.getElementById("userName");
  const userAvatarElement = document.getElementById("userAvatar");
  
  if (userNameElement) {
    userNameElement.textContent = name;
  }
  
  if (userAvatarElement) {
    userAvatarElement.textContent = name.charAt(0).toUpperCase();
  }
}

async function loadDashboardData(db) {
  try {
    console.log("Loading dashboard data...");
    
    // Fetch clients from Firestore
    const clientsSnapshot = await getDocs(collection(db, "clients"));
    const clients = [];
    
    clientsSnapshot.forEach((doc) => {
      clients.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log("Loaded clients:", clients.length);
    
    // Update stats
    updateStats(clients);
    
    // Update recent clients table
    updateRecentClientsTable(clients);
    
    // Update renewal reminders
    updateRenewalReminders(clients);
    
  } catch (error) {
    console.error("Error loading dashboard data:", error);
    if (error.code === 'permission-denied') {
      console.error("Permission denied - check Firebase security rules");
    }
  }
}

function updateStats(clients) {
  // Calculate stats
  const totalClients = clients.length;
  const activePolicies = clients.filter(client => {
    const startDate = new Date(client.startDate);
    const oneYearLater = new Date(startDate);
    oneYearLater.setFullYear(startDate.getFullYear() + 1);
    return new Date() < oneYearLater;
  }).length;
  
  const pendingClaims = 0; // Placeholder
  const totalCommissions = clients.reduce((sum, client) => sum + (client.commission || 0), 0);
  
  // Update stat cards
  const totalClientsElement = document.getElementById("totalClients");
  const activePoliciesElement = document.getElementById("activePolicies");
  const pendingClaimsElement = document.getElementById("pendingClaims");
  const totalCommissionsElement = document.getElementById("totalCommissions");
  
  if (totalClientsElement) {
    totalClientsElement.textContent = totalClients;
  }
  
  if (activePoliciesElement) {
    activePoliciesElement.textContent = activePolicies;
  }
  
  if (pendingClaimsElement) {
    pendingClaimsElement.textContent = pendingClaims;
  }
  
  if (totalCommissionsElement) {
    totalCommissionsElement.textContent = `KSh ${totalCommissions.toLocaleString()}`;
  }
}

function updateRecentClientsTable(clients) {
  const tableBody = document.getElementById("recentClientsTableBody");
  
  if (!tableBody) {
    console.log("Recent clients table body not found");
    return;
  }
  
  // Sort clients by creation date (most recent first)
  const sortedClients = clients.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  // Show only the 5 most recent clients
  const recentClients = sortedClients.slice(0, 5);
  
  // Clear existing rows
  tableBody.innerHTML = "";
  
  if (recentClients.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td colspan="5" class="text-center">No recent clients</td>
    `;
    tableBody.appendChild(row);
    return;
  }
  
  recentClients.forEach(client => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${client.name || 'N/A'}</td>
      <td>${client.policyType || 'N/A'}</td>
      <td>${client.premium ? `KSh ${client.premium.toLocaleString()}` : 'N/A'}</td>
      <td>${client.commission ? `KSh ${client.commission.toLocaleString()}` : 'N/A'}</td>
      <td>${client.createdAt ? new Date(client.createdAt).toLocaleDateString() : 'N/A'}</td>
    `;
    tableBody.appendChild(row);
  });
}

function updateRenewalReminders(clients) {
  const reminderContainer = document.getElementById("renewalReminders");
  const reminderCount = document.getElementById("reminderCount");
  const noReminders = document.getElementById("noReminders");
  
  if (!reminderContainer) return;
  
  const today = new Date();
  const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
  
  // Filter clients with renewals due in the next 30 days
  const upcomingRenewals = clients.filter(client => {
    if (!client.renewalDate) return false;
    const renewalDate = new Date(client.renewalDate);
    return renewalDate >= today && renewalDate <= thirtyDaysFromNow;
  }).sort((a, b) => new Date(a.renewalDate) - new Date(b.renewalDate));
  
  // Update reminder count
  if (reminderCount) {
    reminderCount.textContent = upcomingRenewals.length;
    reminderCount.style.display = upcomingRenewals.length > 0 ? 'inline' : 'none';
  }
  
  // Clear existing reminders
  reminderContainer.innerHTML = '';
  
  if (upcomingRenewals.length === 0) {
    reminderContainer.appendChild(noReminders);
    return;
  }
  
  // Create reminder items
  upcomingRenewals.forEach(client => {
    const renewalDate = new Date(client.renewalDate);
    const daysUntilRenewal = Math.ceil((renewalDate - today) / (1000 * 60 * 60 * 24));
    
    const reminderItem = document.createElement('div');
    reminderItem.className = 'renewal-item';
    reminderItem.innerHTML = `
      <div class="renewal-info">
        <div class="client-name">${client.fullName || 'N/A'}</div>
        <div class="renewal-details">
          <span class="vehicle-reg">${client.vehicleNumber || 'N/A'}</span>
          <span class="policy-type">${client.policyType || 'N/A'}</span>
        </div>
      </div>
      <div class="renewal-date-info">
        <div class="renewal-date">${renewalDate.toLocaleDateString()}</div>
        <div class="days-remaining ${daysUntilRenewal <= 7 ? 'urgent' : 'warning'}">
          ${daysUntilRenewal} day${daysUntilRenewal !== 1 ? 's' : ''} left
        </div>
      </div>
      <div class="renewal-actions">
        <button class="btn btn-sm btn-primary" onclick="contactClient('${client.phone || ''}', '${client.email || ''}')">
          Contact
        </button>
      </div>
    `;
    
    reminderContainer.appendChild(reminderItem);
  });
}

function contactClient(phone, email) {
  let contactOptions = [];
  
  if (phone) {
    contactOptions.push(`<a href="tel:${phone}" class="contact-option">📞 Call ${phone}</a>`);
    contactOptions.push(`<a href="sms:${phone}" class="contact-option">💬 SMS ${phone}</a>`);
  }
  
  if (email) {
    contactOptions.push(`<a href="mailto:${email}" class="contact-option">📧 Email ${email}</a>`);
  }
  
  if (contactOptions.length === 0) {
    showNotification('No contact information available for this client', 'warning');
    return;
  }
  
  const modal = document.createElement('div');
  modal.className = 'contact-modal';
  modal.innerHTML = `
    <div class="modal-overlay" onclick="this.parentElement.remove()">
      <div class="modal-content" onclick="event.stopPropagation()">
        <h3>Contact Client</h3>
        <div class="contact-options">
          ${contactOptions.join('')}
        </div>
        <button class="btn btn-secondary" onclick="this.closest('.contact-modal').remove()">Close</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
}

// Placeholder functions for features referenced later in the file
function setupEventListeners() {}
function setupSearch() {}
function setupFilters() {}
