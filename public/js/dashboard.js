// Dashboard functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize dashboard
    initializeDashboard();
    
    // Load dashboard data
    loadDashboardData();
    
    // Setup event listeners
    setupDashboardEventListeners();
});

function initializeDashboard() {
    console.log('Dashboard initialized');
    
    // Update user profile
    updateUserProfile();
    
    // Setup mobile menu
    setupMobileMenu();
    
    // Setup user dropdown
    setupUserDropdown();
}

function loadDashboardData() {
    // Load stats from localStorage or API
    const stats = {
        totalClients: localStorage.getItem('totalClients') || 156,
        activePolicies: localStorage.getItem('activePolicies') || 142,
        pendingClaims: localStorage.getItem('pendingClaims') || 8,
        totalRevenue: localStorage.getItem('totalRevenue') || 'KES 2.4M'
    };
    
    // Update stats display
    updateStatsDisplay(stats);
    
    // Load renewal alerts
    loadRenewalAlerts();
    
    // Load commission data
    loadCommissionData();
}

function updateStatsDisplay(stats) {
    // Update stat cards
    const statCards = document.querySelectorAll('.stat-value');
    if (statCards.length >= 4) {
        statCards[0].textContent = stats.totalClients;
        statCards[1].textContent = stats.activePolicies;
        statCards[2].textContent = stats.pendingClaims;
        statCards[3].textContent = stats.totalRevenue;
    }
}

function loadRenewalAlerts() {
    // Load renewal alerts from localStorage or API
    const alerts = JSON.parse(localStorage.getItem('renewalAlerts') || '[]');
    
    // Update alert count
    const alertNumber = document.querySelector('.alert-number');
    if (alertNumber) {
        alertNumber.textContent = alerts.length;
    }
}

function loadCommissionData() {
    // Load commission data from localStorage or API
    const commissionTotal = localStorage.getItem('commissionTotal') || 'KES 45,000';
    
    // Update commission display
    const commissionElement = document.querySelector('.commission-total');
    if (commissionElement) {
        commissionElement.textContent = commissionTotal;
    }
}

function setupDashboardEventListeners() {
    // Quick action buttons
    const actionCards = document.querySelectorAll('.action-card');
    actionCards.forEach(card => {
        card.addEventListener('click', function(e) {
            if (this.onclick) {
                // If onclick is already defined, don't prevent default
                return;
            }
            
        e.preventDefault();
            const href = this.getAttribute('href');
            if (href) {
                window.location.href = href;
            }
        });
    });
    
    // Search functionality
    const searchInput = document.getElementById('globalSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const query = this.value.toLowerCase();
            // Implement search functionality
            console.log('Searching for:', query);
    });
  }
}

function exportData() {
    // Export data functionality
    console.log('Exporting data...');
    
    // Get data from localStorage
    const clients = JSON.parse(localStorage.getItem('clients') || '[]');
    const policies = JSON.parse(localStorage.getItem('policies') || '[]');
    const claims = JSON.parse(localStorage.getItem('claims') || '[]');
    
    // Create CSV data
    const csvData = {
        clients: clients,
        policies: policies,
        claims: claims
    };
    
    // Download as JSON file
    const dataStr = JSON.stringify(csvData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'majani-insurance-data.json';
    link.click();
    
    URL.revokeObjectURL(url);
    
    showNotification('Data exported successfully!', 'success');
}

function showNotification(message, type = 'info') {
    const notificationContainer = document.getElementById('notificationContainer');
    if (!notificationContainer) return;
    
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    notificationContainer.appendChild(notification);
    
    // Auto remove after 3 seconds
  setTimeout(() => {
        notification.remove();
    }, 3000);
}

function updateUserProfile() {
    // Update user profile information
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{"name": "Dennis", "role": "Insurance Agent"}');
    
    // Update sidebar profile
    const userNameElements = document.querySelectorAll('.user-name');
    userNameElements.forEach(element => {
        element.textContent = userInfo.name;
    });
    
    const userRoleElements = document.querySelectorAll('.user-role');
    userRoleElements.forEach(element => {
        element.textContent = userInfo.role;
    });
}

function setupMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const sidebar = document.getElementById('sidebar');
    
    if (mobileMenuBtn && sidebar) {
        mobileMenuBtn.addEventListener('click', function() {
            sidebar.classList.toggle('mobile-open');
        });
    }
}

function setupUserDropdown() {
    const userProfileBtn = document.getElementById('userProfileBtn');
    const userDropdown = document.getElementById('userDropdown');
    
    if (userProfileBtn && userDropdown) {
        userProfileBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            userDropdown.classList.toggle('show');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function() {
            userDropdown.classList.remove('show');
        });
    }
}
