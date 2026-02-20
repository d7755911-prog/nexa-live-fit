/**
 * NEXA · SMART SIZE ENGINE (v1.0.0)
 * Optimized for: Zara, Myntra, Ajio, Amazon
 */

const scriptURL = "https://script.google.com/macros/s/AKfycbzxHqnnnDSwMuoeQonoDKqHAAf_DSu6Z8w-wRmvfRkEkiP7nr1Mta1M9cHf5Ijzl7TI/exec";

// 1. Data Logging Engine
function sendToSheet(feedback, size, h, w, site, issue = "none") {
    chrome.storage.local.get(["height", "weight"], (data) => {
        let userH = data.height || h;
        let userW = data.weight || w;
        
        let bmiVal = "N/A";
        if (userH && userW) {
            let h_m = parseFloat(userH) / 100;
            bmiVal = (parseFloat(userW) / (h_m * h_m)).toFixed(2);
        }

        const payload = {
            feedback: feedback,
            size: size,
            h: userH || "Blank",
            w: userW || "Blank",
            bmi: bmiVal, 
            site: site,
            issue: issue,
            ts: new Date().toISOString()
        };

        fetch(scriptURL, {
            method: "POST",
            mode: 'no-cors',
            body: JSON.stringify(payload)
        }).catch(err => console.log("NEXA Sync...")); // Quiet logging
    });
}

// 2. Size Calculation Logic
function calculateSize(data) {
    const h = parseFloat(data.height);
    const w = parseFloat(data.weight);
    const c = parseFloat(data.chest || 0);
    
    if (c > 20) {
        if (c <= 35.5) return "XS";
        if (c <= 37.5) return "S";
        if (c <= 40.5) return "M";
        if (c <= 43.5) return "L";
        if (c <= 46.5) return "XL";
        return "XXL";
    } else {
        const h_m = h / 100;
        const bmi = w / (h_m * h_m);
        if (bmi < 18.5) return "S";
        if (bmi < 25) return "M";
        if (bmi < 30) return "L";
        return "XL";
    }
}

// 3. UI Rendering (The Badge)
function injectBadge(size, h, w) {
    if (document.getElementById("nexa-badge")) return;

    const badge = document.createElement("div");
    badge.id = "nexa-badge";
    badge.style.cssText = `
        position: fixed !important; bottom: 30px !important; right: 30px !important; 
        background: rgba(255, 255, 255, 0.98) !important; backdrop-filter: blur(12px) !important;
        padding: 12px 20px !important; border-radius: 20px !important; z-index: 2147483647 !important; 
        box-shadow: 0 12px 40px rgba(0,0,0,0.12) !important; border: 1px solid #f0f0f0 !important;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        display: flex !important; flex-direction: column !important; align-items: center !important; gap: 8px !important;
    `;

    // VERSION FIX: Yahan maine NEXA ke sath chota v1.0 likha hai jo professional lagta hai
    badge.innerHTML = `
        <style>
            .nx-brand { font-size: 9px; font-weight: 800; letter-spacing: 2px; color: #ccced1; text-transform: uppercase; }
            .nx-main { display: flex; align-items: center; gap: 12px; width: 100%; justify-content: center; }
            .nx-size { font-size: 17px; font-weight: 700; color: #1a1a1a; }
            .nx-btn { border:none; background:none; cursor:pointer; font-size: 11px; font-weight: 600; color: #444; text-transform: uppercase; padding: 6px 12px; border-radius: 10px; border: 1px solid #eee; transition: 0.3s; }
            .nx-btn:hover { background: #1a1a1a; color: #fff; border-color: #1a1a1a; }
            .nx-divider { width: 1px; height: 14px; background: #eee; }
            .nx-select { border: 1px solid #eee; font-size: 11px; font-weight: 600; padding: 5px; border-radius: 8px; background: #fff; outline: none; }
        </style>
        <div class="nx-brand">NEXA <span style="font-weight:400; font-size:8px;">v1.0</span></div>
        <div class="nx-main" id="nx-core">
            <div class="nx-size">FIT: ${size}</div>
            <div class="nx-divider"></div>
            <button id="nx-ok" class="nx-btn">Perfect</button>
            <button id="nx-no" class="nx-btn">Issue?</button>
        </div>
    `;

    document.body.appendChild(badge);

    const kill = (msg) => {
        const core = document.getElementById("nx-core");
        if (core) core.innerHTML = `<span style="font-size:11px; font-weight:700; color:#222;">${msg}</span>`;
        setTimeout(() => { badge.style.opacity = '0'; setTimeout(() => badge.remove(), 600); }, 2000);
    };

    document.getElementById("nx-ok").onclick = () => {
        sendToSheet("correct", size, h, w, window.location.hostname);
        kill("GOT IT! ✨");
    };

    document.getElementById("nx-no").onclick = () => {
        const core = document.getElementById("nx-core");
        core.innerHTML = `
            <select id="nx-issue" class="nx-select">
                <option value="tight">TIGHT</option>
                <option value="loose">LOOSE</option>
                <option value="short">SHORT</option>
                <option value="long">LONG</option>
            </select>
            <button id="nx-sub" class="nx-btn" style="background:#1a1a1a; color:#fff;">OK</button>
        `;
        
        document.getElementById("nx-sub").onclick = () => {
            const issue = document.getElementById("nx-issue").value;
            sendToSheet("wrong", size, h, w, window.location.hostname, issue);
            kill("FEEDBACK SAVED ✅");
        };
    };
}

// 4. Main Injection Engine
function initNexaEngine() {
    chrome.storage.local.get(["height", "weight", "chest"], (data) => {
        if (!data.height || !data.weight) return;

        const runLogic = () => {
            const sites = ['amazon', 'myntra', 'ajio', 'zara', 'hm', 'nike', 'flipkart', 'meesho'];
            const isShop = sites.some(s => window.location.hostname.includes(s));
            
            if (isShop) {
                const size = calculateSize(data);
                injectBadge(size, data.height, data.weight);
            }
        };

        runLogic();
        // SPA support for sites like Myntra (checks for URL changes)
        if (!window.nexaInterval) window.nexaInterval = setInterval(runLogic, 3000);
    });
}

// 5. Sync & Listeners
chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local") {
        const oldBadge = document.getElementById("nexa-badge");
        if (oldBadge) oldBadge.remove();
        initNexaEngine();
    }
});

initNexaEngine();