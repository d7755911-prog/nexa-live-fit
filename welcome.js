/**
 * NEXA · Onboarding Engine (Final Fix)
 * Logic: Data Storage + UI Transition to Launchpad
 */

document.getElementById('save-btn').onclick = () => {
    const h = document.getElementById('h-input').value;
    const w = document.getElementById('w-input').value;
    const c = document.getElementById('c-input').value;
    const status = document.getElementById('status');
    const btn = document.getElementById('save-btn');

    if (h && w && c) {
        // 1. Storage Optimization (Initialize all startup variables)
        chrome.storage.local.set({ 
            height: Number(h), 
            weight: Number(w), 
            chest: Number(c),
            setupDone: true,
            installDate: new Date().toDateString(),
            totalFits: 0,
            streak: 0,
            lastDate: new Date().toDateString()
        }, () => {
            // 2. Success Animation
            btn.innerText = "Profile Optimized ✅";
            btn.style.background = "#10b981";
            status.style.color = "#10b981";
            status.innerText = "Syncing with NEXA Cloud...";

            // 3. UI Section Switch (1 second delay for feedback)
            setTimeout(() => {
                document.getElementById('setup-section').style.display = 'none';
                document.getElementById('launchpad-section').style.display = 'block';
                window.scrollTo(0, 0);
            }, 1000);
        });
    } else {
        // 4. Error Feedback (With Shake Effect)
        status.style.color = "#ef4444";
        status.innerText = "Please fill all measurements!";
        
        btn.style.animation = "shake 0.4s ease";
        setTimeout(() => btn.style.animation = "", 400);
    }
};

// Error Animation Helper
const style = document.createElement('style');
style.innerHTML = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style);