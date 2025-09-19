/**
 * MAJANI INSURANCE - Vehicle Insurance Management System
 * Multi-page application with shared functionality
 */

// Global variables
let clients = [];
let policies = [];
let claims = [];
let commissions = [];

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    console.log('MAJANI Insurance Management System initialized');
    
    // Check if user is logged in
    if (!checkUserLogin()) {
        return;
    }
    
    // Load data from localStorage
    loadData();
    
    // Setup common functionality
    setupMobileMenu();
    setupUserDropdown();
    setupSearch();
    setupNotifications();
    setupLogout();
    
    // Setup page-specific functionality
    const currentPage = getCurrentPage();
    setupPageSpecificFunctionality(currentPage);
}

function checkUserLogin() {
    const isLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
    
    if (!isLoggedIn) {
        // Redirect to login page
        window.location.href = 'login.html';
        return false;
    }
    
    return true;
}

function getCurrentPage() {
    const path = window.location.pathname;
    const filename = path.split('/').pop();
    return filename.replace('.html', '');
}

function setupPageSpecificFunctionality(page) {
    switch(page) {
        case 'index':
        case 'dashboard':
            setupDashboard();
            break;
        case 'clients':
            setupClients();
            break;
        case 'policies':
            setupPolicies();
            break;
        case 'claims':
            setupClaims();
            break;
        case 'commissions':
            setupCommissions();
            break;
        case 'settings':
            setupSettings();
            break;
    }
}

// ==================== DATA MANAGEMENT ====================

function loadData() {
    // Clear any existing dummy data
    localStorage.removeItem('clients');
    localStorage.removeItem('policies');
    localStorage.removeItem('claims');
    localStorage.removeItem('commissions');
    
    clients = [];
    policies = [];
    claims = [];
    commissions = [];
}


function saveData() {
    localStorage.setItem('clients', JSON.stringify(clients));
    localStorage.setItem('policies', JSON.stringify(policies));
    localStorage.setItem('claims', JSON.stringify(claims));
    localStorage.setItem('commissions', JSON.stringify(commissions));
}

// ==================== PAGE SETUP FUNCTIONS ====================

function setupDashboard() {
    console.log('Setting up dashboard');
    updateDashboardStats();
    setupQuickActions();
    loadUserProfileForDashboard();
}

function setupClients() {
    console.log('Setting up clients page');
    displayClientsTable();
    setupClientForm();
    setupClientFilters();
    loadUserProfileForPage();
}

function setupPolicies() {
    console.log('Setting up policies page');
    loadUserProfileForPage();
}

function setupClaims() {
    console.log('Setting up claims page');
    loadUserProfileForPage();
}

function setupCommissions() {
    console.log('Setting up commissions page');
    loadUserProfileForPage();
}

function setupSettings() {
    console.log('Setting up settings page');
    setupProfileForm();
    loadUserProfile();
    loadUserProfileForPage();
}

// ==================== DASHBOARD FUNCTIONALITY ====================

function updateDashboardStats() {
    const stats = {
        totalClients: clients.length,
        activePolicies: policies.filter(p => p.status === 'Active').length,
        pendingClaims: claims.filter(c => c.status === 'Pending').length,
        totalRevenue: clients.reduce((sum, client) => sum + (client.premium || 0), 0)
    };
    
    const statCards = document.querySelectorAll('.stat-value');
    if (statCards.length >= 4) {
        statCards[0].textContent = stats.totalClients;
        statCards[1].textContent = stats.activePolicies;
        statCards[2].textContent = stats.pendingClaims;
        statCards[3].textContent = `KES ${stats.totalRevenue.toLocaleString()}`;
    }
}

function setupQuickActions() {
    const actionCards = document.querySelectorAll('.action-card');
    actionCards.forEach(card => {
        card.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href) {
                window.location.href = href;
            }
        });
    });
}

function loadUserProfileForDashboard() {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{"name": "Dennis", "role": "Insurance Agent"}');
    
    // Update welcome message
    const welcomeElements = document.querySelectorAll('h1');
    welcomeElements.forEach(element => {
        if (element.textContent.includes('Welcome')) {
            element.textContent = `Welcome ${userInfo.name} 👋`;
        }
    });
    
    // Update user name in sidebar and top nav
    const userNameElements = document.querySelectorAll('.user-name');
    userNameElements.forEach(element => {
        element.textContent = userInfo.name;
    });
    
    // Update user avatar
    const userAvatarElements = document.querySelectorAll('.user-avatar');
    userAvatarElements.forEach(element => {
        element.textContent = userInfo.name.charAt(0).toUpperCase();
    });
}

function loadUserProfileForPage() {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{"name": "Dennis", "role": "Insurance Agent"}');
    
    // Update user name in sidebar and top nav
    const userNameElements = document.querySelectorAll('.user-name');
    userNameElements.forEach(element => {
        element.textContent = userInfo.name;
    });
    
    // Update user avatar
    const userAvatarElements = document.querySelectorAll('.user-avatar');
    userAvatarElements.forEach(element => {
        element.textContent = userInfo.name.charAt(0).toUpperCase();
    });
}

// ==================== CLIENT FUNCTIONALITY ====================

function displayClientsTable() {
    const tableBody = document.getElementById('clientsTableBody');
    if (!tableBody) return;
    
    if (clients.length === 0) {
        const noClientsMessage = document.getElementById('noClientsMessage');
        if (noClientsMessage) {
            noClientsMessage.style.display = 'block';
        }
        tableBody.innerHTML = '';
        return;
    }
    
    const noClientsMessage = document.getElementById('noClientsMessage');
    if (noClientsMessage) {
        noClientsMessage.style.display = 'none';
    }
    
    tableBody.innerHTML = clients.map(client => `
        <tr>
            <td>${client.fullName}</td>
            <td>${client.phone}</td>
            <td>${client.email || '-'}</td>
            <td>${client.vehicleNumber}</td>
            <td>${client.policyType}</td>
            <td>${client.renewalDate}</td>
            <td><span class="status-badge ${getStatusClass(client.renewalDate)}">${getStatusText(client.renewalDate)}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-secondary" onclick="editClient(${client.id})">✏️</button>
                    <button class="btn btn-danger" onclick="deleteClient(${client.id})">🗑️</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function getStatusClass(renewalDate) {
    const today = new Date();
    const renewal = new Date(renewalDate);
    const daysUntilRenewal = Math.ceil((renewal - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilRenewal < 0) {
        return 'status-expired';
    } else if (daysUntilRenewal <= 30) {
        return 'status-expiring';
    } else {
        return 'status-active';
    }
}

function getStatusText(renewalDate) {
    const today = new Date();
    const renewal = new Date(renewalDate);
    const daysUntilRenewal = Math.ceil((renewal - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilRenewal < 0) {
        return 'Expired';
    } else if (daysUntilRenewal <= 30) {
        return 'Expiring Soon';
    } else {
        return 'Active';
    }
}

function setupClientForm() {
    const clientForm = document.getElementById('clientForm');
    if (!clientForm) return;
    
    clientForm.addEventListener('submit', handleClientFormSubmit);
    
    const startDateInput = document.getElementById('startDate');
    if (startDateInput) {
        startDateInput.addEventListener('change', calculateRenewalDate);
    }
}

function handleClientFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const clientData = Object.fromEntries(formData.entries());
    
    if (!validateClientForm(clientData)) {
        return;
    }
    
    clientData.id = Date.now();
    clientData.createdAt = new Date().toISOString();
    
    clients.push(clientData);
    saveData();
    
    showNotification('Client added successfully!', 'success');
    
    e.target.reset();
    displayClientsTable();
}

function validateClientForm(data) {
    const requiredFields = ['fullName', 'phone', 'vehicleNumber', 'startDate', 'policyType', 'commission'];
    
    for (const field of requiredFields) {
        if (!data[field] || data[field].trim() === '') {
            showNotification(`Please fill in the ${field} field`, 'error');
            return false;
        }
    }
    
    const phoneRegex = /^(\+254|0)[0-9]{9}$/;
    if (!phoneRegex.test(data.phone.replace(/\s/g, ''))) {
        showNotification('Please enter a valid phone number', 'error');
        return false;
    }
    
    if (data.email && !isValidEmail(data.email)) {
        showNotification('Please enter a valid email address', 'error');
        return false;
    }
    
    return true;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function calculateRenewalDate() {
    const startDateInput = document.getElementById('startDate');
    const renewalDateInput = document.getElementById('renewalDate');
    
    if (startDateInput.value && renewalDateInput) {
        const startDate = new Date(startDateInput.value);
        const renewalDate = new Date(startDate);
        renewalDate.setFullYear(renewalDate.getFullYear() + 1);
        
        renewalDateInput.value = renewalDate.toISOString().split('T')[0];
    }
}

function setupClientFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            filterClientsByStatus(filter);
        });
    });
    
    const clientSearch = document.getElementById('clientSearch');
    if (clientSearch) {
        clientSearch.addEventListener('input', filterClients);
    }
}

function filterClients() {
    const searchTerm = document.getElementById('clientSearch').value.toLowerCase();
    const filteredClients = clients.filter(client => 
        client.fullName.toLowerCase().includes(searchTerm) ||
        client.phone.includes(searchTerm) ||
        client.email.toLowerCase().includes(searchTerm) ||
        client.vehicleNumber.toLowerCase().includes(searchTerm)
    );
    
    displayFilteredClients(filteredClients);
}

function filterClientsByStatus(status) {
    let filteredClients = clients;
    
    if (status !== 'all') {
        filteredClients = clients.filter(client => {
            const statusClass = getStatusClass(client.renewalDate);
            return statusClass === `status-${status}`;
        });
    }
    
    displayFilteredClients(filteredClients);
}

function displayFilteredClients(filteredClients) {
    const tableBody = document.getElementById('clientsTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = filteredClients.map(client => `
        <tr>
            <td>${client.fullName}</td>
            <td>${client.phone}</td>
            <td>${client.email || '-'}</td>
            <td>${client.vehicleNumber}</td>
            <td>${client.policyType}</td>
            <td>${client.renewalDate}</td>
            <td><span class="status-badge ${getStatusClass(client.renewalDate)}">${getStatusText(client.renewalDate)}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-secondary" onclick="editClient(${client.id})">✏️</button>
                    <button class="btn btn-danger" onclick="deleteClient(${client.id})">🗑️</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function editClient(clientId) {
    console.log('Edit client:', clientId);
    showNotification('Edit functionality coming soon!', 'info');
}

function deleteClient(clientId) {
    if (confirm('Are you sure you want to delete this client?')) {
        clients = clients.filter(client => client.id !== clientId);
        saveData();
        displayClientsTable();
        showNotification('Client deleted successfully!', 'success');
    }
}

// ==================== COMMON FUNCTIONALITY ====================

function setupMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const sidebar = document.getElementById('sidebar');
    const sidebarClose = document.getElementById('sidebarClose');
    
    if (mobileMenuBtn && sidebar) {
        mobileMenuBtn.addEventListener('click', function() {
            sidebar.classList.toggle('mobile-open');
        });
        
        // Close button functionality
        if (sidebarClose) {
            sidebarClose.addEventListener('click', function() {
                sidebar.classList.remove('mobile-open');
            });
        }
        
        // Close sidebar when clicking outside
        document.addEventListener('click', function(e) {
            if (sidebar.classList.contains('mobile-open') && 
                !sidebar.contains(e.target) && 
                !mobileMenuBtn.contains(e.target)) {
                sidebar.classList.remove('mobile-open');
            }
        });
        
        // Close sidebar when clicking on nav links (mobile)
        const navLinks = sidebar.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 1023) {
                    sidebar.classList.remove('mobile-open');
                }
            });
        });
        
        // Handle window resize
        window.addEventListener('resize', function() {
            if (window.innerWidth > 1023) {
                sidebar.classList.remove('mobile-open');
            }
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
        
        document.addEventListener('click', function() {
            userDropdown.classList.remove('show');
        });
    }
}

function setupSearch() {
    const searchInput = document.getElementById('globalSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const query = this.value.toLowerCase();
            console.log('Searching for:', query);
        });
    }
}

function setupNotifications() {
    if (!document.getElementById('notificationContainer')) {
        const notificationContainer = document.createElement('div');
        notificationContainer.id = 'notificationContainer';
        notificationContainer.className = 'notification-container';
        document.body.appendChild(notificationContainer);
    }
}

function setupLogout() {
    // Handle logout links
    const logoutLinks = document.querySelectorAll('a[href="login.html"]');
    logoutLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    });
}

function logout() {
    // Clear user session
    localStorage.removeItem('userLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userInfo');
    
    // Redirect to login page
    window.location.href = 'login.html';
}

function showNotification(message, type = 'info') {
    const notificationContainer = document.getElementById('notificationContainer');
    if (!notificationContainer) return;
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    notificationContainer.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function exportData() {
    const data = {
        clients: clients,
        policies: policies,
        claims: claims,
        commissions: commissions
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'majani-insurance-data.json';
    link.click();
    
    URL.revokeObjectURL(url);
    
    showNotification('Data exported successfully!', 'success');
}

// ==================== PLACEHOLDER FUNCTIONS ====================

function showAddPolicyForm() {
    showNotification('Add policy form coming soon!', 'info');
}

function showAddClaimForm() {
    showNotification('Add claim form coming soon!', 'info');
}

function deleteAccount() {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        showNotification('Account deletion coming soon!', 'info');
    }
}

// ==================== PROFILE MANAGEMENT ====================

function loadUserProfile() {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{"name": "Dennis", "role": "Insurance Agent", "email": "dennis@majaniinsurance.com", "phone": "+254 700 000 000"}');
    
    // Load profile data into form
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    const profilePhone = document.getElementById('profilePhone');
    const profileRole = document.getElementById('profileRole');
    
    if (profileName) profileName.value = userInfo.name || 'Dennis';
    if (profileEmail) profileEmail.value = userInfo.email || 'dennis@majaniinsurance.com';
    if (profilePhone) profilePhone.value = userInfo.phone || '+254 700 000 000';
    if (profileRole) profileRole.value = userInfo.role || 'Insurance Agent';
}

function setupProfileForm() {
    const profileForm = document.getElementById('profileForm');
    if (!profileForm) return;
    
    profileForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const profileData = {
            name: formData.get('profileName'),
            email: formData.get('profileEmail'),
            phone: formData.get('profilePhone'),
            role: formData.get('profileRole')
        };
        
        // Validate form
        if (!validateProfileForm(profileData)) {
            return;
        }
        
        // Update user info in localStorage
        const currentUserInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        const updatedUserInfo = {
            ...currentUserInfo,
            ...profileData
        };
        
        localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
        
        // Update all instances of user name throughout the application
        updateUserNameEverywhere(profileData.name);
        
        // Show success message
        showProfileSuccessMessage('Profile updated successfully!');
        
        console.log('Profile updated:', updatedUserInfo);
    });
}

function validateProfileForm(data) {
    if (!data.name || data.name.trim() === '') {
        showProfileErrorMessage('Please enter your full name');
        return false;
    }
    
    if (!data.email || data.email.trim() === '') {
        showProfileErrorMessage('Please enter your email address');
        return false;
    }
    
    if (!isValidEmail(data.email)) {
        showProfileErrorMessage('Please enter a valid email address');
        return false;
    }
    
    if (!data.phone || data.phone.trim() === '') {
        showProfileErrorMessage('Please enter your phone number');
        return false;
    }
    
    return true;
}

function updateUserNameEverywhere(newName) {
    // Update all elements with class 'user-name'
    const userNameElements = document.querySelectorAll('.user-name');
    userNameElements.forEach(element => {
        element.textContent = newName;
    });
    
    // Update user avatar with first letter of new name
    const userAvatarElements = document.querySelectorAll('.user-avatar');
    userAvatarElements.forEach(element => {
        element.textContent = newName.charAt(0).toUpperCase();
    });
    
    // Update dashboard welcome message if it exists
    const welcomeElements = document.querySelectorAll('h1');
    welcomeElements.forEach(element => {
        if (element.textContent.includes('Welcome')) {
            element.textContent = `Welcome ${newName} 👋`;
        }
    });
    
    // Update any other elements that might contain the user name
    const allElements = document.querySelectorAll('*');
    allElements.forEach(element => {
        if (element.textContent && element.textContent.includes('Dennis') && !element.closest('form')) {
            element.textContent = element.textContent.replace('Dennis', newName);
        }
    });
}

function showProfileSuccessMessage(message) {
    const successMessage = document.getElementById('profileSuccessMessage');
    const errorMessage = document.getElementById('profileErrorMessage');
    
    if (errorMessage) errorMessage.style.display = 'none';
    if (successMessage) {
        successMessage.textContent = message;
        successMessage.style.display = 'block';
        
        setTimeout(() => {
            successMessage.style.display = 'none';
        }, 3000);
    }
}

function showProfileErrorMessage(message) {
    const successMessage = document.getElementById('profileSuccessMessage');
    const errorMessage = document.getElementById('profileErrorMessage');
    
    if (successMessage) successMessage.style.display = 'none';
    if (errorMessage) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 5000);
    }
}
