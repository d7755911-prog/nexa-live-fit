/**
 * NEXA · World Class Size Engine v10.0
 * Features: Sheets Sync, Error Handling, Number Validation, Real-time UI
 */

const elements = {
    hInput: document.getElementById("h"),
    wInput: document.getElementById("w"),
    cInput: document.getElementById("c"),
    saveBtn: document.getElementById("save"),
    resultsZone: document.getElementById("results"), 
    safeVal: document.getElementById("safe-val"),
    accVal: document.getElementById("acc-val"),
    riskVal: document.getElementById("risk-val")
};

const scriptURL = "YOUR_GOOGLE_SCRIPT_URL"; // Apni URL yahan dalein

// --- 1. SMART CALCULATION ENGINE ---
function updateUI(h, w, c) {
    if (!h || !w) return;
    
    const H = parseFloat(h);
    const W = parseFloat(w);
    const C = parseFloat(c || 0);
    
    let base = "M";
    const sizes = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];

    // Precise logic for Chest vs BMI
    if (C > 20) {
        if (C <= 35) base = "XS";
        else if (C <= 37.5) base = "S";
        else if (C <= 40.5) base = "M";
        else if (C <= 43.5) base = "L";
        else if (C <= 46.5) base = "XL";
        else base = "XXL";
    } else {
        if (H < 165) base = W < 62 ? "S" : "M";
        else if (H <= 178) base = W < 74 ? "M" : "L";
        else base = W < 88 ? "L" : "XL";
    }

    const i = sizes.indexOf(base);
    
    if(elements.safeVal) elements.safeVal.textContent = base;
    if(elements.accVal) elements.accVal.textContent = sizes[i + 1] || base;
    if(elements.riskVal) elements.riskVal.textContent = sizes[i - 1] || "XS";
    
    if(elements.resultsZone) elements.resultsZone.style.display = "block";
}

// --- 2. GOOGLE SHEETS SYNC WITH ERROR HANDLING ---
async function syncWithSheets(data) {
    try {
        const response = await fetch(scriptURL, { 
            method: 'POST', 
            mode: 'no-cors', // Standard for Google Apps Script
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' }
        });
        console.log("NEXA: Cloud Sync Success");
    } catch (error) {
        console.warn("NEXA: Sheet update failed, saving locally.");
        // Data local storage mein toh chala hi gaya hai, yahan bas alert ya log de sakte hain
    }
}

// --- 3. STORAGE: LOAD ---
chrome.storage.local.get(["height", "weight", "chest"], (data) => {
    if (data.height) elements.hInput.value = data.height;
    if (data.weight) elements.wInput.value = data.weight; 
    if (data.chest) elements.cInput.value = data.chest;
    
    if (data.height && data.weight) {
        updateUI(data.height, data.weight, data.chest);
    }
});

// --- 4. ACTION: SAVE & VALIDATE ---
elements.saveBtn.onclick = async () => {
    const h = elements.hInput.value.trim();
    const w = elements.wInput.value.trim();
    const c = elements.cInput.value.trim();

    if (!h || !w) {
        alert("Please enter Height and Weight!");
        return;
    }

    if (isNaN(h) || isNaN(w) || parseFloat(h) > 250 || parseFloat(w) > 250) {
        alert("Invalid measurements. Use numbers only.");
        return;
    }

    const profileData = { 
        height: h, 
        weight: w, 
        chest: c, 
        timestamp: new Date().toISOString() 
    };

    // Step A: Save to Chrome Storage (Instant & Reliable)
    chrome.storage.local.set(profileData, () => {
        console.log("NEXA: Local Profile Updated");
        updateUI(h, w, c);
        
        // Success UI Feedback
        elements.saveBtn.textContent = "SAVED ✅";
        elements.saveBtn.style.background = "#10b981";
        
        setTimeout(() => {
            elements.saveBtn.textContent = "SAVE PROFILE";
            elements.saveBtn.style.background = "#000";
        }, 1500);
    });

    // Step B: Attempt Cloud Sync (Background)
    await syncWithSheets(profileData);
};