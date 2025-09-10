// Import Firebase functions
import { onAuthStateChanged, updatePassword } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  console.log("Change password page loaded");
  
  // Wait for Firebase to initialize
  setTimeout(() => {
    const { auth, db } = window.firebaseServices || {};
    
    if (!auth || !db) {
      console.error(" Firebase services failed to load");
      return;
    }
    
    console.log(" Firebase services loaded successfully!");
    
    // Check authentication
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        // User not authenticated, redirect to login
        console.log("User not authenticated, redirecting to login");
        window.location.href = "login.html";
        return;
      }
      
      console.log("User authenticated:", user.email);
      initializeChangePasswordPage(auth, db, user);
    });
  }, 1000);
});

function initializeChangePasswordPage(auth, db, user) {
  // Set up form submission
  const changePasswordForm = document.getElementById("changePasswordForm");
  const submitBtn = document.getElementById("submitBtn");
  const errorMessage = document.getElementById("errorMessage");
  const successMessage = document.getElementById("successMessage");
  
  if (changePasswordForm) {
    changePasswordForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      const newPassword = document.getElementById("newPassword").value;
      const confirmPassword = document.getElementById("confirmPassword").value;
      
      console.log("Attempting to change password");
      
      // Clear previous messages
      errorMessage.style.display = "none";
      successMessage.style.display = "none";
      
      // Validate passwords
      if (!validatePasswords(newPassword, confirmPassword)) {
        return;
      }
      
      // Disable button and show loading state
      submitBtn.disabled = true;
      submitBtn.textContent = "Changing Password...";
      
      try {
        // Update password in Firebase Auth
        await updatePassword(user, newPassword);
        console.log("Password updated successfully");
        
        // Update Firestore user document
        await updateDoc(doc(db, "users", user.uid), {
          mustChangePassword: false,
          passwordChangedAt: new Date().toISOString()
        });
        console.log("User document updated successfully");
        
        // Show success message
        successMessage.textContent = "Password changed successfully! Redirecting to dashboard...";
        successMessage.style.display = "block";
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 2000);
        
      } catch (error) {
        console.error("Error changing password:", error);
        
        // Show error message
        let errorText = "Failed to change password. Please try again.";
        
        switch (error.code) {
          case "auth/weak-password":
            errorText = "Password is too weak. Please choose a stronger password.";
            break;
          case "auth/requires-recent-login":
            errorText = "Please log out and log back in before changing your password.";
            break;
          case "auth/too-many-requests":
            errorText = "Too many attempts. Please try again later.";
            break;
          default:
            errorText = error.message || errorText;
        }
        
        errorMessage.textContent = errorText;
        errorMessage.style.display = "block";
        
        // Re-enable button
        submitBtn.disabled = false;
        submitBtn.textContent = "Change Password";
      }
    });
  }
  
  // Set up real-time password validation
  setupPasswordValidation();
}

function validatePasswords(newPassword, confirmPassword) {
  const errorMessage = document.getElementById("errorMessage");
  
  // Check minimum length
  if (newPassword.length < 6) {
    errorMessage.textContent = "Password must be at least 6 characters long.";
    errorMessage.style.display = "block";
    return false;
  }
  
  // Check if passwords match
  if (newPassword !== confirmPassword) {
    errorMessage.textContent = "Passwords do not match. Please try again.";
    errorMessage.style.display = "block";
    return false;
  }
  
  return true;
}

function setupPasswordValidation() {
  const newPasswordInput = document.getElementById("newPassword");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  const errorMessage = document.getElementById("errorMessage");
  
  // Real-time password matching validation
  function validatePasswordsMatch() {
    const newPassword = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    
    if (confirmPassword.length > 0 && newPassword !== confirmPassword) {
      errorMessage.textContent = "Passwords do not match.";
      errorMessage.style.display = "block";
    } else if (confirmPassword.length > 0 && newPassword === confirmPassword) {
      errorMessage.style.display = "none";
    }
  }
  
  // Add event listeners
  newPasswordInput.addEventListener("input", validatePasswordsMatch);
  confirmPasswordInput.addEventListener("input", validatePasswordsMatch);
  
  // Real-time length validation
  newPasswordInput.addEventListener("input", () => {
    const password = newPasswordInput.value;
    if (password.length > 0 && password.length < 6) {
      errorMessage.textContent = "Password must be at least 6 characters long.";
      errorMessage.style.display = "block";
    } else if (password.length >= 6) {
      errorMessage.style.display = "none";
    }
  });
}
