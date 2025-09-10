// Import Firebase functions
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// Global variables to store auth and db
let globalAuth = null;
let globalDb = null;

document.addEventListener("DOMContentLoaded", () => {
  console.log("Clients page loaded");
  
  // Wait for Firebase to initialize
  setTimeout(() => {
    const { auth, db } = window.firebaseServices || {};
    
    if (!auth || !db) {
      console.error("❌ Firebase services failed to load");
      return;
    }
    
    console.log("✅ Firebase services loaded successfully!");
    
    // Store globally for use in other functions
    globalAuth = auth;
    globalDb = db;
    
    // Check authentication
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        // User not authenticated, redirect to login
        console.log("User not authenticated, redirecting to login");
        window.location.href = "login.html";
        return;
      }
      
      console.log("User authenticated:", user.email);
      initializeClientsPage(auth, db, user);
    });
  }, 1000);
});

async function initializeClientsPage(auth, db, user) {
  // Load user profile
  await loadUserProfile(db, user);
  
  // Set up event listeners
  setupEventListeners(auth);
  
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
        // Add document to Firestore
        const docRef = await addDoc(collection(db, "clients"), formData);
        console.log("Client added with ID:", docRef.id);
        
        // Clear form
        clientForm.reset();
        
        // Show success message
        successMessage.textContent = "Client added successfully!";
        successMessage.style.display = "block";
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          successMessage.style.display = "none";
        }, 3000);
        
        // Reload clients
        await loadClients(db);
        
      } catch (error) {
        console.error("Error adding client:", error);
        errorMessage.textContent = `Error adding client: ${error.message}`;
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
  
  // Show loading message
  loadingMessage.style.display = "block";
  clientsTable.style.display = "none";
  noClientsMessage.style.display = "none";
  
  try {
    // Get all documents from clients collection
    const querySnapshot = await getDocs(collection(db, "clients"));
    
    // Clear existing table rows
    clientsTableBody.innerHTML = "";
    
    if (querySnapshot.empty) {
      // No clients found
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
  
  // Calculate expiry date (assuming 1 year from start date)
  const startDate = new Date(client.startDate);
  const expiryDate = new Date(startDate.getTime() + (365 * 24 * 60 * 60 * 1000));
  const today = new Date();
  const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
  
  // Determine status
  let status, statusClass;
  if (expiryDate > today) {
    if (expiryDate <= thirtyDaysFromNow) {
      status = "Expiring Soon";
      statusClass = "status-expiring";
    } else {
      status = "Active";
      statusClass = "status-active";
    }
  } else {
    status = "Expired";
    statusClass = "status-expired";
  }
  
  // Generate policy number
  const policyNumber = `POL ${client.vehicleNumber.slice(-2)}`;
  
  row.innerHTML = `
    <td>${client.fullName}</td>
    <td>${client.vehicleNumber}</td>
    <td>${policyNumber}</td>
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
