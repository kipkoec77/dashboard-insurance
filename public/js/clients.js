// Import Firebase functions
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// Global variables to store auth and db
let globalAuth = null;
let globalDb = null;

// Initialize the clients page
document.addEventListener("DOMContentLoaded", async () => {
  console.log("Clients page loaded");
  
  try {
    // Import Firebase services
    const { auth, db } = window.firebaseServices || {};
    
    if (!auth || !db) {
      console.error("Firebase services not available");
      return;
    }
    
    // Check authentication
    const { onAuthStateChanged } = await import("https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js");
    
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("User authenticated:", user.uid);
        initializeClientsPage(auth, db, user);
      } else {
        console.log("User not authenticated, redirecting to login");
        window.location.href = "login.html";
      }
    });
    
  } catch (error) {
    console.error("Error initializing clients page:", error);
  }
});

// Auto-calculate renewal date when start date changes
function setupRenewalDateCalculation() {
  const startDateInput = document.getElementById("startDate");
  const renewalDateInput = document.getElementById("renewalDate");
  
  if (startDateInput && renewalDateInput) {
    startDateInput.addEventListener("change", function() {
      if (this.value) {
        const startDate = new Date(this.value);
        const renewalDate = new Date(startDate);
        renewalDate.setFullYear(startDate.getFullYear() + 1);
        
        // Format date as YYYY-MM-DD for input field
        const renewalDateString = renewalDate.toISOString().split('T')[0];
        renewalDateInput.value = renewalDateString;
        
        console.log("Auto-calculated renewal date:", renewalDateString);
      } else {
        renewalDateInput.value = "";
      }
    });
  }
}

async function initializeClientsPage(auth, db, user) {
  // Load user profile
  await loadUserProfile(db, user);
  
  // Set up event listeners
  setupEventListeners(auth);
  
  // Set up renewal date calculation
  setupRenewalDateCalculation();
  
  // Set up form submission
  setupFormSubmission(db, auth);
  
  // Set up search and filters
  setupSearchAndFilters();
  
  // Load clients data
  await loadClients(db);
}

async function loadUserProfile(db, user) {
  try {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      updateUserDisplay(userData.name || user.displayName || "User", user.email);
    } else {
      updateUserDisplay(user.displayName || "User", user.email);
    }
  } catch (error) {
    console.error("Error loading user profile:", error);
    updateUserDisplay(user.displayName || "User", user.email);
  }
}

function updateUserDisplay(name, email) {
  const userNameElement = document.getElementById("userName");
  const userAvatarElement = document.getElementById("userAvatar");
  
  if (userNameElement) {
    userNameElement.textContent = name;
  }
  
  if (userAvatarElement) {
    userAvatarElement.textContent = name.charAt(0).toUpperCase();
  }
}

function setupEventListeners(auth) {
  // Set up logout functionality
  const userProfile = document.querySelector(".user-profile");
  if (userProfile) {
    userProfile.addEventListener("click", async () => {
      if (confirm("Are you sure you want to logout?")) {
        try {
          await signOut(auth);
          console.log("Logout successful");
        } catch (error) {
          console.error("Logout error:", error);
        }
      }
    });
  }
  
  // Set up Add Client button functionality
  const addClientBtn = document.getElementById("addClientBtn");
  const addClientForm = document.getElementById("addClientForm");
  
  console.log("Button element:", addClientBtn);
  console.log("Form element:", addClientForm);
  
  if (addClientBtn && addClientForm) {
    console.log("Setting up button click listener");
    
    // Ensure form starts hidden
    addClientForm.style.display = "none";
    
    addClientBtn.addEventListener("click", (e) => {
      e.preventDefault();
      console.log("Add Client button clicked");
      console.log("Current form display before toggle:", addClientForm.style.display);
      
      // Simple toggle - check current inline style
      if (addClientForm.style.display === "none" || addClientForm.style.display === "") {
        addClientForm.style.display = "block";
        console.log("Form shown - display set to:", addClientForm.style.display);
        // Scroll to form when shown
        setTimeout(() => {
          addClientForm.scrollIntoView({ behavior: "smooth" });
        }, 100);
      } else {
        addClientForm.style.display = "none";
        console.log("Form hidden - display set to:", addClientForm.style.display);
      }
    });
  } else {
    console.error("Button or form not found!");
    console.error("Button:", addClientBtn);
    console.error("Form:", addClientForm);
  }
}

function setupFormSubmission(db, auth) {
  const clientForm = document.getElementById("clientForm");
  const submitBtn = document.getElementById("submitBtn");
  const errorMessage = document.getElementById("errorMessage");
  const successMessage = document.getElementById("successMessage");
  
  if (clientForm) {
    clientForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      console.log("Form submitted");
      
      // Get form data
      const formData = {
        fullName: document.getElementById("fullName").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        email: document.getElementById("email").value.trim(),
        address: document.getElementById("address").value.trim(),
        vehicleNumber: document.getElementById("vehicleNumber").value.trim(),
        startDate: document.getElementById("startDate").value,
        renewalDate: document.getElementById("renewalDate").value,
        policyType: document.getElementById("policyType").value,
        premium: parseFloat(document.getElementById("premium").value) || 0,
        earned: parseFloat(document.getElementById("earned").value) || 0,
        commission: parseFloat(document.getElementById("commission").value) || 0,
        createdAt: new Date().toISOString(),
        createdBy: auth.currentUser.uid
      };
      
      console.log("Form data:", formData);
      
      // Validate form data
      if (!validateFormData(formData)) {
        return;
      }
      
      // Disable submit button
      submitBtn.disabled = true;
      submitBtn.textContent = "Saving Client...";
      errorMessage.style.display = "none";
      successMessage.style.display = "none";
      
      try {
        console.log("Attempting to add client to Firestore...");
        console.log("Database instance:", db);
        console.log("Form data to save:", formData);
        
        // Add document to Firestore
        const docRef = await addDoc(collection(db, "clients"), formData);
        console.log("Client added with ID:", docRef.id);
        
        // Clear form
        clientForm.reset();
        
        // Show success message
        successMessage.textContent = "Client added successfully!";
        successMessage.style.display = "block";
        
        // Reset form
        clientForm.reset();
        
        // Reload clients list to show new client immediately
        await loadClients(db);
        
        // Hide form after successful submission
        setTimeout(() => {
          addClientForm.style.display = "none";
          successMessage.style.display = "none";
        }, 2000);
        
      } catch (error) {
        console.error("Error adding client:", error);
        console.error("Error details:", error.message);
        console.error("Error code:", error.code);
        
        let errorText = "Error adding client. Please try again.";
        
        // Handle specific Firebase errors
        if (error.code === 'permission-denied') {
          errorText = "Permission denied. Please check your Firebase security rules.";
        } else if (error.code === 'unavailable') {
          errorText = "Service unavailable. Please check your internet connection.";
        } else if (error.message) {
          errorText = `Error: ${error.message}`;
        }
        
        // Show error message
        errorMessage.textContent = errorText;
        errorMessage.style.display = "block";
      } finally {
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.textContent = "Save Client";
      }
    });
  } else {
    console.error("Client form not found!");
  }
}

function validateFormData(formData) {
  const errorMessage = document.getElementById("errorMessage");
  
  if (!formData.fullName) {
    errorMessage.textContent = "Full name is required.";
    errorMessage.style.display = "block";
    return false;
  }
  
  if (!formData.phone) {
    errorMessage.textContent = "Phone number is required.";
    errorMessage.style.display = "block";
    return false;
  }
  
  // Enhanced phone validation
  const phoneRegex = /^(\+254|0)[17]\d{8}$/; // Kenyan phone format
  if (!phoneRegex.test(formData.phone.replace(/\s+/g, ''))) {
    errorMessage.textContent = "Please enter a valid phone number (e.g., +254 700 123 456 or 0700 123 456).";
    errorMessage.style.display = "block";
    return false;
  }
  
  // Enhanced email validation (if provided)
  if (formData.email && formData.email.trim() !== '') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      errorMessage.textContent = "Please enter a valid email address.";
      errorMessage.style.display = "block";
      return false;
    }
  }
  
  if (!formData.vehicleNumber) {
    errorMessage.textContent = "Vehicle registration number is required.";
    errorMessage.style.display = "block";
    return false;
  }
  
  if (!formData.startDate) {
    errorMessage.textContent = "Start date is required.";
    errorMessage.style.display = "block";
    return false;
  }
  
  if (!formData.renewalDate) {
    errorMessage.textContent = "Renewal date is required.";
    errorMessage.style.display = "block";
    return false;
  }
  
  if (!formData.policyType) {
    errorMessage.textContent = "Policy type is required.";
    errorMessage.style.display = "block";
    return false;
  }
  
  if (formData.premium < 0) {
    errorMessage.textContent = "Premium must be a positive number.";
    errorMessage.style.display = "block";
    return false;
  }
  
  if (formData.commission < 0) {
    errorMessage.textContent = "Commission must be a positive number.";
    errorMessage.style.display = "block";
    return false;
  }
  
  return true;
}

async function loadClients(db) {
  const loadingMessage = document.getElementById("loadingMessage");
  const clientsTable = document.getElementById("clientsTable");
  const noClientsMessage = document.getElementById("noClientsMessage");
  const clientsTableBody = document.getElementById("clientsTableBody");
  
  console.log("Starting to load clients...");
  console.log("Database instance:", db);
  
  // Show loading message
  loadingMessage.style.display = "block";
  clientsTable.style.display = "none";
  noClientsMessage.style.display = "none";
  
  try {
    // Get all documents from clients collection
    console.log("Fetching clients from Firestore...");
    const querySnapshot = await getDocs(collection(db, "clients"));
    console.log("Query snapshot received:", querySnapshot);
    
    // Clear existing table rows
    clientsTableBody.innerHTML = "";
    
    if (querySnapshot.empty) {
      // No clients found
      console.log("No clients found in database");
      loadingMessage.style.display = "none";
      noClientsMessage.style.display = "block";
      return;
    }
    
    // Convert to array and sort by creation date
    const clients = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    clients.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Add each client to the table
    clients.forEach(client => {
      const row = createClientRow(client);
      clientsTableBody.appendChild(row);
    });
    
    // Show table
    loadingMessage.style.display = "none";
    clientsTable.style.display = "block";
    
  } catch (error) {
    console.error("Error loading clients:", error);
    loadingMessage.textContent = "Error loading clients. Please refresh the page.";
  }
}

function createClientRow(client) {
  const row = document.createElement("tr");
  
  // Handle renewal date - check if it exists, if not calculate from start date
  let renewalDate;
  if (client.renewalDate) {
    renewalDate = new Date(client.renewalDate);
  } else if (client.startDate) {
    // Calculate renewal date as start date + 1 year for existing clients without renewal date
    const startDate = new Date(client.startDate);
    renewalDate = new Date(startDate);
    renewalDate.setFullYear(startDate.getFullYear() + 1);
  } else {
    renewalDate = new Date(); // fallback to today
  }
  
  const today = new Date();
  const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
  
  // Determine status based on renewal date
  let status, statusClass;
  if (isNaN(renewalDate.getTime())) {
    status = "Date Error";
    statusClass = "status-expired";
  } else if (renewalDate > today) {
    if (renewalDate <= thirtyDaysFromNow) {
      status = "Renewal Due Soon";
      statusClass = "status-expiring";
    } else {
      status = "Active";
      statusClass = "status-active";
    }
  } else {
    status = "Renewal Overdue";
    statusClass = "status-expired";
  }
  
  // Add renewal reminder highlighting
  if (!isNaN(renewalDate.getTime())) {
    if (renewalDate <= thirtyDaysFromNow && renewalDate > today) {
      row.classList.add("renewal-reminder");
    } else if (renewalDate <= today) {
      row.classList.add("renewal-overdue");
    }
  }
  
  // Format renewal date for display
  const renewalDateFormatted = isNaN(renewalDate.getTime()) ? 'Invalid Date' : renewalDate.toLocaleDateString();
  
  row.innerHTML = `
    <td>${client.fullName || 'N/A'}</td>
    <td>${client.phone || 'N/A'}</td>
    <td>${client.email || 'N/A'}</td>
    <td>${client.vehicleNumber || 'N/A'}</td>
    <td>${client.policyType || 'N/A'}</td>
    <td class="renewal-date">${renewalDateFormatted}</td>
    <td><span class="status-badge ${statusClass}">${status}</span></td>
    <td>
      <div class="action-buttons">
        <button class="btn btn-secondary" onclick="editClient('${client.id}')">✏️</button>
        <button class="btn btn-danger" onclick="deleteClient('${client.id}')">🗑️</button>
      </div>
    </td>
  `;
  
  return row;
}

function setupSearchAndFilters() {
  // Search functionality
  const searchInput = document.getElementById("clientSearch");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const searchTerm = e.target.value.toLowerCase();
      filterTable(searchTerm);
    });
  }
  
  // Filter buttons
  const filterButtons = document.querySelectorAll(".filter-btn");
  filterButtons.forEach(button => {
    button.addEventListener("click", () => {
      // Remove active class from all buttons
      filterButtons.forEach(btn => btn.classList.remove("active"));
      // Add active class to clicked button
      button.classList.add("active");
      
      // Filter table based on button data-filter
      const filter = button.getAttribute("data-filter");
      filterTableByStatus(filter);
    });
  });
}

function filterTable(searchTerm) {
  const tableRows = document.querySelectorAll("#clientsTableBody tr");
  tableRows.forEach(row => {
    const text = row.textContent.toLowerCase();
    if (text.includes(searchTerm)) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });
}

function filterTableByStatus(status) {
  const tableRows = document.querySelectorAll("#clientsTableBody tr");
  tableRows.forEach(row => {
    if (status === "all") {
      row.style.display = "";
    } else {
      const statusBadge = row.querySelector(".status-badge");
      if (statusBadge) {
        const badgeText = statusBadge.textContent.toLowerCase();
        if (
          (status === "active" && badgeText === "active") ||
          (status === "expiring" && badgeText === "expiring soon") ||
          (status === "expired" && badgeText === "expired")
        ) {
          row.style.display = "";
        } else {
          row.style.display = "none";
        }
      }
    }
  });
}

// Global functions for action buttons
window.editClient = function(clientId) {
  console.log("Edit client:", clientId);
  // TODO: Implement edit functionality
  alert("Edit functionality will be implemented soon!");
};

window.deleteClient = function(clientId) {
  if (confirm("Are you sure you want to delete this client?")) {
    deleteClientFromFirestore(clientId);
  }
};

async function deleteClientFromFirestore(clientId) {
  const { db } = window.firebaseServices || {};
  
  if (!db) {
    console.error("Firebase services not available");
    return;
  }
  
  try {
    await deleteDoc(doc(db, "clients", clientId));
    console.log("Client deleted successfully");
    alert("Client deleted successfully!");
    
    // Reload clients
    await loadClients(db);
    
  } catch (error) {
    console.error("Error deleting client:", error);
    alert("Error deleting client. Please try again.");
  }
}

window.toggleUserMenu = function() {
  console.log("Toggle user menu");
};
