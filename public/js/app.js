// Import Firebase Auth functions
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { getDoc, doc } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  console.log("App loaded");
  
  // Check if we are on login page or dashboard
  const isLoginPage = window.location.pathname.includes("login.html");
  const isDashboardPage = window.location.pathname.includes("dashboard.html");
  const isIndexPage = window.location.pathname.includes("index.html") || window.location.pathname === "/";
  const isSettingsPage = window.location.pathname.includes("settings.html");
  
  console.log("Current page - Login:", isLoginPage, "Dashboard:", isDashboardPage, "Index:", isIndexPage, "Settings:", isSettingsPage);
  
  // Handle index page redirect immediately
  if (isIndexPage) {
    console.log("On index page - redirecting to login...");
    window.location.href = "login.html";
    return; // Exit early to prevent further execution
  }
  
  // Wait a bit for Firebase to initialize (only for other pages)
  setTimeout(() => {
    // Access Firebase services from window
    const { auth, db } = window.firebaseServices || {};
    
    if (!auth || !db) {
      console.error(" Firebase services failed to load");
      return;
    }
    
    console.log(" Firebase services loaded successfully!");
    
    // Set up authentication state observer
    onAuthStateChanged(auth, async (user) => {
      console.log("Auth state changed:", user ? `User: ${user.email}` : "No user");
      
      if (user) {
        // User is signed in
        console.log("User signed in:", user.email);
        
        if (isLoginPage) {
          // Redirect directly to dashboard after login
          console.log("Redirecting to dashboard...");
          window.location.href = "dashboard.html";
        } else if (isDashboardPage) {
          // User is on dashboard and authenticated - no redirect needed
          console.log("User on dashboard - authenticated");
        }
      } else {
        // User is signed out
        console.log("User signed out");
        
        if (isDashboardPage || isSettingsPage) {
          // Redirect to login if on dashboard or settings
          console.log("Redirecting to login...");
          window.location.href = "login.html";
        }
      }
    });
    
    // Login form handling (only on login page)
    if (isLoginPage) {
      const loginForm = document.getElementById("loginForm");
      const loginBtn = document.getElementById("loginBtn");
      const errorMessage = document.getElementById("errorMessage");
      
      console.log("Setting up login form handlers");
      
      if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
          e.preventDefault();
          
          const email = document.getElementById("email").value;
          const password = document.getElementById("password").value;
          
          console.log("Attempting login for:", email);
          
          // Disable button and show loading state
          loginBtn.disabled = true;
          loginBtn.textContent = "Logging in...";
          errorMessage.style.display = "none";
          
          try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            console.log("Login successful:", result.user.email);
            // Success - redirect will happen via auth state observer
          } catch (error) {
            console.error("Login error:", error);
            console.error("Error code:", error.code);
            console.error("Error message:", error.message);
            
            // Show error message
            let errorText = "Login failed. Please try again.";
            
            switch (error.code) {
              case "auth/user-not-found":
                errorText = "No account found with this email address.";
                break;
              case "auth/wrong-password":
                errorText = "Incorrect password.";
                break;
              case "auth/invalid-email":
                errorText = "Invalid email address.";
                break;
              case "auth/user-disabled":
                errorText = "This account has been disabled.";
                break;
              case "auth/too-many-requests":
                errorText = "Too many failed attempts. Please try again later.";
                break;
              case "auth/invalid-credential":
                errorText = "Invalid email or password.";
                break;
            }
            
            errorMessage.textContent = errorText;
            errorMessage.style.display = "block";
            
            // Re-enable button
            loginBtn.disabled = false;
            loginBtn.textContent = "Login";
          }
        });
      }
    }
  }, 1000); // Wait 1 second for Firebase to initialize
});

// Profile completion function removed - users go directly to dashboard
