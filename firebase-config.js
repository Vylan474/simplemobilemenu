// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBzlAQhmKT3LzPj9Mb8s3uXEvvG9pw4prU",
    authDomain: "menu-editor-2c673.firebaseapp.com",
    projectId: "menu-editor-2c673",
    storageBucket: "menu-editor-2c673.firebasestorage.app",
    messagingSenderId: "865975937357",
    appId: "1:865975937357:web:1c9e0ea5e6d86ac054ef04",
    measurementId: "G-NS6MJGF8DV"
};

// Initialize Firebase (will be loaded when Firebase scripts are included)
let app, auth, db;

// Initialize Firebase when scripts are loaded
function initializeFirebase() {
    if (typeof firebase !== 'undefined') {
        app = firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
        
        // Configure Google Auth Provider
        const googleProvider = new firebase.auth.GoogleAuthProvider();
        googleProvider.addScope('profile');
        googleProvider.addScope('email');
        
        return { app, auth, googleProvider };
    } else {
        console.error('Firebase not loaded');
        return null;
    }
}

// Export for use in other files
window.firebaseConfig = firebaseConfig;
window.initializeFirebase = initializeFirebase;