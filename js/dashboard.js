// Import Firebase functions
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  console.log("Dashboard loaded");
  
  // Wait for Firebase to initialize
  setTimeout(() => {
    const { auth, db } = window.firebaseServices || {};
    
    if (!auth || !db) {
      console.error(" Firebase services failed to load");
      return;
    }
    
    console.log(" Firebase services loaded successfully!");
    
    // Check authentication
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // User not authenticated, redirect to login
        console.log("User not authenticated, redirecting to login");
        window.location.href = "login.html";
        return;
      }
      
      console.log("User authenticated:", user.email);
      
      // Check if profile is complete
      const profileComplete = await checkProfileCompletion(db, user);
      
      if (!profileComplete) {
        console.log("Profile incomplete, redirecting to settings...");
        window.location.href = "settings.html";
        return;
      }
      
      initializeDashboard(auth, db, user);
    });
  }, 1000);
});

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
    // Load clients data
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
    
  } catch (error) {
    console.error("Error loading dashboard data:", error);
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
      <td colspan="4" class="text-center text-muted">No clients found</td>
    `;
    tableBody.appendChild(row);
    return;
  }
  
  // Add client rows
  recentClients.forEach(client => {
    const row = createClientRow(client);
    tableBody.appendChild(row);
  });
}

function createClientRow(client) {
  const row = document.createElement("tr");
  
  // Calculate policy status
  const startDate = new Date(client.startDate);
  const oneYearLater = new Date(startDate);
  oneYearLater.setFullYear(startDate.getFullYear() + 1);
  const now = new Date();
  
  let status = "Active";
  let statusClass = "status-active";
  
  if (now > oneYearLater) {
    status = "Expired";
    statusClass = "status-expired";
  } else {
    const daysUntilExpiry = Math.ceil((oneYearLater - now) / (1000 * 60 * 60 * 24));
    if (daysUntilExpiry <= 30) {
      status = "Expiring Soon";
      statusClass = "status-expiring";
    }
  }
  
  row.innerHTML = `
    <td>${client.fullName || "N/A"}</td>
    <td>${client.vehicleNumber || "N/A"}</td>
    <td>${client.policyType || "N/A"}</td>
    <td><span class="status-badge ${statusClass}">${status}</span></td>
  `;
  
  return row;
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

function setupSearch() {
  const searchInput = document.getElementById("dashboardSearch");
  
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const searchTerm = e.target.value.toLowerCase();
      console.log("Searching for:", searchTerm);
      // Implement search functionality here
    });
  }
}

function setupFilters() {
  const filterButtons = document.querySelectorAll(".filter-btn");
  
  filterButtons.forEach(button => {
    button.addEventListener("click", () => {
      // Remove active class from all buttons
      filterButtons.forEach(btn => btn.classList.remove("active"));
      
      // Add active class to clicked button
      button.classList.add("active");
      
      const filter = button.getAttribute("data-filter");
      console.log("Filter applied:", filter);
      // Implement filter functionality here
    });
  });
}

// Global functions
window.toggleUserMenu = function() {
  console.log("Toggle user menu");
};
