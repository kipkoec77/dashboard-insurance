// Client management functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize client management
    initializeClientManagement();
    
    // Load clients data
    loadClientsData();
    
    // Setup event listeners
    setupClientEventListeners();
});

function initializeClientManagement() {
    console.log('Client management initialized');
    
    // Setup mobile menu
    setupMobileMenu();
    
    // Setup user dropdown
    setupUserDropdown();
    
    // Setup form validation
    setupFormValidation();
}

function loadClientsData() {
    // Load clients from localStorage or API
    const clients = JSON.parse(localStorage.getItem('clients') || '[]');
    
    // Display clients in table
    displayClientsTable(clients);
    
    // Update stats
    updateClientStats(clients);
}

function displayClientsTable(clients) {
    const tableBody = document.getElementById('clientsTableBody');
    if (!tableBody) return;
    
    if (clients.length === 0) {
        // Show empty state
        const noClientsMessage = document.getElementById('noClientsMessage');
        if (noClientsMessage) {
            noClientsMessage.style.display = 'block';
        }
        tableBody.innerHTML = '';
      return;
    }
    
    // Hide empty state
    const noClientsMessage = document.getElementById('noClientsMessage');
    if (noClientsMessage) {
        noClientsMessage.style.display = 'none';
    }
    
    // Generate table rows
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

function updateClientStats(clients) {
    // Update stats in localStorage for dashboard
    localStorage.setItem('totalClients', clients.length);
    
    const activeClients = clients.filter(client => {
        const renewal = new Date(client.renewalDate);
        const today = new Date();
        return renewal > today;
    }).length;
    
    localStorage.setItem('activePolicies', activeClients);
}

function setupClientEventListeners() {
    // Form submission
    const clientForm = document.getElementById('clientForm');
    if (clientForm) {
        clientForm.addEventListener('submit', handleClientFormSubmit);
    }
    
    // Start date change (auto-calculate renewal date)
    const startDateInput = document.getElementById('startDate');
    if (startDateInput) {
        startDateInput.addEventListener('change', calculateRenewalDate);
    }
    
    // Search functionality
    const clientSearch = document.getElementById('clientSearch');
    if (clientSearch) {
        clientSearch.addEventListener('input', filterClients);
    }
    
    // Filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            // Filter clients
            const filter = this.getAttribute('data-filter');
            filterClientsByStatus(filter);
        });
    });
}

function handleClientFormSubmit(e) {
      e.preventDefault();
      
      // Get form data
    const formData = new FormData(e.target);
    const clientData = Object.fromEntries(formData.entries());
    
    // Validate form
    if (!validateClientForm(clientData)) {
        return;
      }
      
    // Add client ID and timestamp
    clientData.id = Date.now();
    clientData.createdAt = new Date().toISOString();
    
    // Save to localStorage (replace with API call later)
    const clients = JSON.parse(localStorage.getItem('clients') || '[]');
    clients.push(clientData);
    localStorage.setItem('clients', JSON.stringify(clients));
    
    // Show success message
    showSuccessMessage('Client added successfully!');
        
        // Clear form
    e.target.reset();
    
    // Reload clients data
    loadClientsData();
    
    // Update dashboard stats
    updateClientStats(clients);
}

function validateClientForm(data) {
    const requiredFields = ['fullName', 'phone', 'vehicleNumber', 'startDate', 'policyType', 'commission'];
    
    for (const field of requiredFields) {
        if (!data[field] || data[field].trim() === '') {
            showErrorMessage(`Please fill in the ${field} field`);
      return false;
    }
  }
  
    // Validate phone number format
    const phoneRegex = /^(\+254|0)[0-9]{9}$/;
    if (!phoneRegex.test(data.phone.replace(/\s/g, ''))) {
        showErrorMessage('Please enter a valid phone number');
    return false;
  }
  
    // Validate email if provided
    if (data.email && !isValidEmail(data.email)) {
        showErrorMessage('Please enter a valid email address');
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

function filterClients() {
    const searchTerm = document.getElementById('clientSearch').value.toLowerCase();
    const clients = JSON.parse(localStorage.getItem('clients') || '[]');
    
    const filteredClients = clients.filter(client => 
        client.fullName.toLowerCase().includes(searchTerm) ||
        client.phone.includes(searchTerm) ||
        client.email.toLowerCase().includes(searchTerm) ||
        client.vehicleNumber.toLowerCase().includes(searchTerm)
    );
    
    displayClientsTable(filteredClients);
}

function filterClientsByStatus(status) {
    const clients = JSON.parse(localStorage.getItem('clients') || '[]');
    let filteredClients = clients;
    
    if (status !== 'all') {
        filteredClients = clients.filter(client => {
            const statusClass = getStatusClass(client.renewalDate);
            return statusClass === `status-${status}`;
        });
    }
    
    displayClientsTable(filteredClients);
}

function editClient(clientId) {
    console.log('Edit client:', clientId);
    // TODO: Implement edit functionality
    showNotification('Edit functionality coming soon!', 'info');
}

function deleteClient(clientId) {
    if (confirm('Are you sure you want to delete this client?')) {
        const clients = JSON.parse(localStorage.getItem('clients') || '[]');
        const updatedClients = clients.filter(client => client.id !== clientId);
        localStorage.setItem('clients', JSON.stringify(updatedClients));
        
        // Reload clients data
        loadClientsData();
        
        showNotification('Client deleted successfully!', 'success');
    }
}

function showSuccessMessage(message) {
    const successMessage = document.getElementById('successMessage');
    if (successMessage) {
        successMessage.textContent = message;
        successMessage.style.display = 'block';
        
        // Hide after 3 seconds
        setTimeout(() => {
            successMessage.style.display = 'none';
        }, 3000);
    }
}

function showErrorMessage(message) {
    const errorMessage = document.getElementById('errorMessage');
    if (errorMessage) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        
        // Hide after 3 seconds
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 3000);
    }
}

function setupFormValidation() {
    // Real-time validation
    const formInputs = document.querySelectorAll('#clientForm input, #clientForm select');
    formInputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
    });
  });
}

function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    
    // Remove existing error styling
    field.classList.remove('error');
    
    // Validate based on field type
    if (field.required && !value) {
        field.classList.add('error');
        return false;
    }
    
    if (fieldName === 'email' && value && !isValidEmail(value)) {
        field.classList.add('error');
        return false;
    }
    
    if (fieldName === 'phone' && value) {
        const phoneRegex = /^(\+254|0)[0-9]{9}$/;
        if (!phoneRegex.test(value.replace(/\s/g, ''))) {
            field.classList.add('error');
            return false;
        }
    }
    
    return true;
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
