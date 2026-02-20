/**
 * NEXA · AI Fit Engine (Background Service Worker)
 * High-Performance Onboarding & State Management
 */

// 1. Installation & Update Logic
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === "install") {
        // First time install - Open Welcome Page
        chrome.tabs.create({
            url: chrome.runtime.getURL("welcome.html")
        });

        // Initialize Local Storage Defaults
        chrome.storage.local.set({ 
            installDate: new Date().toISOString(),
            isInstalled: true,
            userProfile: null // Placeholder for future height/weight data
        });
        
        console.log("NEXA 🚀: First Launch Successful.");
    } 
    else if (details.reason === "update") {
        console.log("NEXA 🚀: Engine Updated to latest version.");
    }
});

// 2. Developer & Persistence Trigger
// Ensures the welcome page triggers even if installation event was missed during reload
chrome.storage.local.get(["isInstalled"], (res) => {
    if (!res.isInstalled) {
        chrome.tabs.create({
            url: chrome.runtime.getURL("welcome.html")
        });
        chrome.storage.local.set({ isInstalled: true });
    }
});

// 3. Message Listener (Future-Proofing)
// Content scripts ya Popup se aane wale data ke liye framework
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "ping") {
        sendResponse({ status: "NEXA Active" });
    }
    return true; // Keeps the message channel open for async responses
});

console.log("NEXA 🚀: Service Worker Registered.");