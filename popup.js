/**
 * NEXA · World Class Size Engine v6.0
 * Logic: Chest-First Multi-Tier Analysis
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

// --- 1. BRAHMAND LOGIC (Chest > Weight > Height) ---
function getSmartSize(h, w, c) {
  const H = parseFloat(h);
  const W = parseFloat(w);
  const C = parseFloat(c || 0);
  
  let base = "M";

  // Priority 1: Chest Measurement (The Industry Standard)
  if (C > 20) {
    if (C <= 35) base = "XS";
    else if (C <= 37.5) base = "S";
    else if (C <= 40.5) base = "M";
    else if (C <= 43.5) base = "L";
    else if (C <= 46.5) base = "XL";
    else base = "XXL";
  } 
  // Priority 2: Height & Weight Fallback
  else {
    if (H < 165) base = W < 62 ? "S" : "M";
    else if (H <= 178) base = W < 74 ? "M" : "L";
    else base = W < 88 ? "L" : "XL";
  }

  const sizes = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];
  const i = sizes.indexOf(base);

  return {
    safest: base,
    acceptable: sizes[i + 1] || base, // One size up for relaxed fit
    risky: sizes[i - 1] || (i > 0 ? sizes[i - 1] : "XS") // One size down (Tight)
  };
}

// --- 2. DISPLAY & UI SYNC ---
function updateUI(h, w, c) {
  if (!h || !w) return;
  
  const result = getSmartSize(h, w, c);
  
  elements.safeVal.textContent = result.safest;
  elements.accVal.textContent = result.acceptable;
  elements.riskVal.textContent = result.risky;
  
  elements.resultsZone.style.display = "block";
}

// --- 3. STORAGE: Load & Save ---
chrome.storage.local.get(["height", "weight", "chest"], (data) => {
  if (data.height) elements.hInput.value = data.height;
  if (data.weight) elements.wInput.value = data.weight;
  if (data.chest) elements.cInput.value = data.chest;
  
  if (data.height && data.weight) {
    updateUI(data.height, data.weight, data.chest);
  }
});

elements.saveBtn.addEventListener("click", () => {
  const h = elements.hInput.value;
  const w = elements.wInput.value;
  const c = elements.cInput.value;

  if (!h || !w) {
      alert("Please enter Height and Weight");
      return;
  }

  chrome.storage.local.set({ 
    height: h, 
    weight: w, 
    chest: c 
  }, () => {
    updateUI(h, w, c);
    elements.saveBtn.textContent = "SAVED ✅";
    elements.saveBtn.style.background = "#10b981";
    
    setTimeout(() => {
      elements.saveBtn.textContent = "SAVE PROFILE";
      elements.saveBtn.style.background = "#000";
    }, 2000);
  });
});