// Import Firebase functions
import { onAuthStateChanged, signOut, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// Global variables
let globalAuth = null;
let globalDb = null;
let currentUser = null;

document.addEventListener("DOMContentLoaded", () => {
  console.log("Settings page loaded");
  
  // Wait for Firebase to initialize
  setTimeout(() => {
    const { auth, db } = window.firebaseServices || {};
    
    if (!auth || !db) {
      console.error("? Firebase services failed to load");
      return;
    }
    
    console.log("? Firebase services loaded successfully!");
    
    // Store globally
    globalAuth = auth;
    globalDb = db;
    
    // Check authentication
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        console.log("User not authenticated, redirecting to login");
        window.location.href = "login.html";
        return;
      }
      
      currentUser = user;
      console.log("User authenticated:", user.email);
      
      // Check if profile is already complete
      const profileComplete = await checkProfileCompletion(db, user);
      
      if (profileComplete) {
        console.log("Profile already complete, redirecting to dashboard...");
        window.location.href = "dashboard.html";
        return;
      }
      
      initializeSettingsPage(auth, db, user);
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

async function initializeSettingsPage(auth, db, user) {
  // Load user profile
  await loadUserProfile(db, user);
  
  // Set up event listeners
  setupEventListeners(auth);
  
  // Set up tab functionality
  setupTabs();
  
  // Set up form submissions
  setupFormSubmissions(db, auth);
  
  // Load user settings
  await loadUserSettings(db, user);
  
  // Show profile setup message
  showProfileSetupMessage();
}

function showProfileSetupMessage() {
  // Create a banner message to guide the user
  const banner = document.createElement("div");
  banner.className = "profile-setup-banner";
  banner.innerHTML = `
    <div class="banner-content">
      <div class="banner-icon">??</div>
      <div class="banner-text">
        <h4>Welcome! Please complete your profile setup</h4>
        <p>Fill in your personal information and change your password to get started.</p>
      </div>
    </div>
  `;
  
  // Insert banner at the top of page content
  const pageContent = document.querySelector(".page-content");
  if (pageContent) {
    pageContent.insertBefore(banner, pageContent.firstChild);
  }
}

async function loadUserProfile(db, user) {
  try {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      updateUserDisplay(userData.name || user.displayName || "User", user.email);
      populateProfileForm(userData);
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
  const profileAvatarElement = document.getElementById("profileAvatar");
  
  if (userNameElement) {
    userNameElement.textContent = name;
  }
  
  if (userAvatarElement) {
    userAvatarElement.textContent = name.charAt(0).toUpperCase();
  }
  
  if (profileAvatarElement) {
    profileAvatarElement.textContent = name.charAt(0).toUpperCase();
  }
}

function populateProfileForm(userData) {
  // Populate profile form
  const profileName = document.getElementById("profileName");
  const profileEmail = document.getElementById("profileEmail");
  const profilePhone = document.getElementById("profilePhone");
  const profileAddress = document.getElementById("profileAddress");
  
  if (profileName) profileName.value = userData.name || "";
  if (profileEmail) profileEmail.value = userData.email || "";
  if (profilePhone) profilePhone.value = userData.phone || "";
  if (profileAddress) profileAddress.value = userData.address || "";
}

async function loadUserSettings(db, user) {
  try {
    const settingsDoc = await getDoc(doc(db, "userSettings", user.uid));
    
    if (settingsDoc.exists()) {
      const settings = settingsDoc.data();
      populateSettingsForms(settings);
    }
  } catch (error) {
    console.error("Error loading user settings:", error);
  }
}

function populateSettingsForms(settings) {
  // Business settings
  const companyName = document.getElementById("companyName");
  const companyAddress = document.getElementById("companyAddress");
  const companyPhone = document.getElementById("companyPhone");
  const companyEmail = document.getElementById("companyEmail");
  
  if (companyName) companyName.value = settings.companyName || "";
  if (companyAddress) companyAddress.value = settings.companyAddress || "";
  if (companyPhone) companyPhone.value = settings.companyPhone || "";
  if (companyEmail) companyEmail.value = settings.companyEmail || "";
  
  // Commission rates
  const defaultCommission = document.getElementById("defaultCommission");
  const comprehensiveRate = document.getElementById("comprehensiveRate");
  const thirdPartyRate = document.getElementById("thirdPartyRate");
  const actOnlyRate = document.getElementById("actOnlyRate");
  
  if (defaultCommission) defaultCommission.value = settings.defaultCommission || "";
  if (comprehensiveRate) comprehensiveRate.value = settings.comprehensiveRate || "";
  if (thirdPartyRate) thirdPartyRate.value = settings.thirdPartyRate || "";
  if (actOnlyRate) actOnlyRate.value = settings.actOnlyRate || "";
  
  // Preferences
  const darkMode = document.getElementById("darkMode");
  const language = document.getElementById("language");
  const emailNotifications = document.getElementById("emailNotifications");
  const expiryAlerts = document.getElementById("expiryAlerts");
  const commissionUpdates = document.getElementById("commissionUpdates");
  const defaultPage = document.getElementById("defaultPage");
  const itemsPerPage = document.getElementById("itemsPerPage");
  
  if (darkMode) darkMode.checked = settings.darkMode || false;
  if (language) language.value = settings.language || "en";
  if (emailNotifications) emailNotifications.checked = settings.emailNotifications !== false;
  if (expiryAlerts) expiryAlerts.checked = settings.expiryAlerts !== false;
  if (commissionUpdates) commissionUpdates.checked = settings.commissionUpdates || false;
  if (defaultPage) defaultPage.value = settings.defaultPage || "dashboard";
  if (itemsPerPage) itemsPerPage.value = settings.itemsPerPage || "25";
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

function setupTabs() {
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".settings-content");
  
  tabButtons.forEach(button => {
    button.addEventListener("click", () => {
      const targetTab = button.getAttribute("data-tab");
      
      // Remove active class from all tabs
      tabButtons.forEach(btn => btn.classList.remove("active"));
      tabContents.forEach(content => content.style.display = "none");
      
      // Add active class to clicked tab
      button.classList.add("active");
      
      // Show target content
      const targetContent = document.getElementById(`${targetTab}-tab`);
      if (targetContent) {
        targetContent.style.display = "block";
      }
    });
  });
}

function setupFormSubmissions(db, auth) {
  // Profile form
  const profileForm = document.getElementById("profileForm");
  if (profileForm) {
    profileForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      await updateProfile(db, auth);
    });
  }
  
  // Business form
  const businessForm = document.getElementById("businessForm");
  if (businessForm) {
    businessForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      await updateBusinessSettings(db);
    });
  }
  
  // Preferences form
  const preferencesForm = document.getElementById("preferencesForm");
  if (preferencesForm) {
    preferencesForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      await updatePreferences(db);
    });
  }
}

async function updateProfile(db, auth) {
  const submitBtn = document.querySelector("#profileForm .btn-primary");
  const successMessage = document.getElementById("profileSuccessMessage");
  const errorMessage = document.getElementById("profileErrorMessage");
  
  const profileData = {
    name: document.getElementById("profileName").value.trim(),
    phone: document.getElementById("profilePhone").value.trim(),
    address: document.getElementById("profileAddress").value.trim(),
    updatedAt: new Date().toISOString()
  };
  
  // Validate required fields
  if (!profileData.name || !profileData.phone || !profileData.address) {
    errorMessage.textContent = "Please fill in all required fields (Name, Phone, Address).";
    errorMessage.style.display = "block";
    return;
  }
  
  // Disable button
  submitBtn.disabled = true;
  submitBtn.textContent = "Updating...";
  errorMessage.style.display = "none";
  successMessage.style.display = "none";
  
  try {
    // Update user document
    await setDoc(doc(db, "users", auth.currentUser.uid), profileData, { merge: true });
    
    // Update display
    updateUserDisplay(profileData.name, auth.currentUser.email);
    
    // Show success message
    successMessage.textContent = "Profile updated successfully!";
    successMessage.style.display = "block";
    
    // Check if profile is now complete
    const profileComplete = await checkProfileCompletion(db, auth.currentUser);
    
    if (profileComplete) {
      successMessage.innerHTML = "Profile updated successfully! <br><strong>Your profile is now complete!</strong>";
      
      // Show redirect message after 2 seconds
      setTimeout(() => {
        successMessage.innerHTML = "Profile updated successfully! <br><strong>Redirecting to dashboard...</strong>";
        
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 3000);
      }, 2000);
    } else {
      setTimeout(() => {
        successMessage.style.display = "none";
      }, 3000);
    }
    
  } catch (error) {
    console.error("Error updating profile:", error);
    errorMessage.textContent = `Error updating profile: ${error.message}`;
    errorMessage.style.display = "block";
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Update Profile";
  }
}

async function updateBusinessSettings(db) {
  const submitBtn = document.querySelector("#businessForm .btn-primary");
  const successMessage = document.getElementById("businessSuccessMessage");
  const errorMessage = document.getElementById("businessErrorMessage");
  
  const businessData = {
    companyName: document.getElementById("companyName").value.trim(),
    companyAddress: document.getElementById("companyAddress").value.trim(),
    companyPhone: document.getElementById("companyPhone").value.trim(),
    companyEmail: document.getElementById("companyEmail").value.trim(),
    defaultCommission: parseFloat(document.getElementById("defaultCommission").value) || 0,
    comprehensiveRate: parseFloat(document.getElementById("comprehensiveRate").value) || 0,
    thirdPartyRate: parseFloat(document.getElementById("thirdPartyRate").value) || 0,
    actOnlyRate: parseFloat(document.getElementById("actOnlyRate").value) || 0,
    updatedAt: new Date().toISOString()
  };
  
  // Disable button
  submitBtn.disabled = true;
  submitBtn.textContent = "Saving...";
  errorMessage.style.display = "none";
  successMessage.style.display = "none";
  
  try {
    // Update settings document
    await setDoc(doc(db, "userSettings", globalAuth.currentUser.uid), businessData, { merge: true });
    
    // Show success message
    successMessage.textContent = "Business settings saved successfully!";
    successMessage.style.display = "block";
    
    setTimeout(() => {
      successMessage.style.display = "none";
    }, 3000);
    
  } catch (error) {
    console.error("Error updating business settings:", error);
    errorMessage.textContent = `Error saving settings: ${error.message}`;
    errorMessage.style.display = "block";
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Save Business Settings";
  }
}

async function updatePreferences(db) {
  const submitBtn = document.querySelector("#preferencesForm .btn-primary");
  const successMessage = document.getElementById("preferencesSuccessMessage");
  const errorMessage = document.getElementById("preferencesErrorMessage");
  
  const preferencesData = {
    darkMode: document.getElementById("darkMode").checked,
    language: document.getElementById("language").value,
    emailNotifications: document.getElementById("emailNotifications").checked,
    expiryAlerts: document.getElementById("expiryAlerts").checked,
    commissionUpdates: document.getElementById("commissionUpdates").checked,
    defaultPage: document.getElementById("defaultPage").value,
    itemsPerPage: document.getElementById("itemsPerPage").value,
    updatedAt: new Date().toISOString()
  };
  
  // Disable button
  submitBtn.disabled = true;
  submitBtn.textContent = "Saving...";
  errorMessage.style.display = "none";
  successMessage.style.display = "none";
  
  try {
    // Update settings document
    await setDoc(doc(db, "userSettings", globalAuth.currentUser.uid), preferencesData, { merge: true });
    
    // Apply dark mode if enabled
    if (preferencesData.darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
    
    // Show success message
    successMessage.textContent = "Preferences saved successfully!";
    successMessage.style.display = "block";
    
    setTimeout(() => {
      successMessage.style.display = "none";
    }, 3000);
    
  } catch (error) {
    console.error("Error updating preferences:", error);
    errorMessage.textContent = `Error saving preferences: ${error.message}`;
    errorMessage.style.display = "block";
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Save Preferences";
  }
}

// Global functions
window.changeAvatar = function() {
  alert("Avatar change functionality will be implemented soon!");
};

window.exportData = function() {
  alert("Data export functionality will be implemented soon!");
};

window.deleteAccount = function() {
  if (confirm("Are you sure you want to delete your account? This action cannot be undone!")) {
    if (confirm("This will permanently delete all your data. Are you absolutely sure?")) {
      alert("Account deletion functionality will be implemented soon!");
    }
  }
};

window.toggleUserMenu = function() {
  console.log("Toggle user menu");
};
