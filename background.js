/**
 * NEXA · AI Fit Engine (Background Service Worker)
 * Lifecycle Management & Onboarding Trigger
 * Version: 1.0.0
 */

chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === "install") {
        // 1. Launch the Global Onboarding Hub
        chrome.tabs.create({ 
            url: "welcome.html",
            active: true 
        });

        // 2. Initialize Core Storage (Safety Check)
        chrome.storage.local.set({ 
            installDate: new Date().toISOString(),
            setupDone: false 
        });

        console.log("NEXA 🚀: Global Hub Launched. Engine Primed.");
    }
});

// Listener to keep the service worker alive during active sessions
chrome.runtime.onStartup.addListener(() => {
    console.log("NEXA 🚀: Universal Fit Engine Active.");
});

/**
 * Startup Tip: 
 * We kept the UI clean (no badges) to maintain a premium, 
 * non-intrusive experience on the user's toolbar.
 */