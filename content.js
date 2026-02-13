/**
 * NEXA · ELITE CAPSULE BUILD (v6.8)
 * Features: Branded UI, 4-Way Feedback, Smart Auto-Exit (35s)
 */

(function nexaMain() {
    const isProductPage = () => {
        const text = document.body ? document.body.innerText.toLowerCase() : "";
        const keywords = ['add to bag', 'buy now', 'size chart', 'select size', 'add to cart'];
        const isShop = ['zara', 'ajio', 'myntra', 'amazon', 'flipkart', 'h&m', 'nike', 'meesho'].some(s => location.hostname.includes(s));
        return isShop && keywords.some(k => text.includes(k));
    };
    if (isProductPage()) initNexaEngine();
})();

function initNexaEngine() {
    const scriptURL = "https://script.google.com/macros/s/AKfycbxj_A8MYcRMpJ3qAhgDsR_fC5JNPbrcw-ZCZfl8qFtbBekLg1_Xx1WJRUa0rdPo-18/exec";

    function sendToSheet(feedback, size, h, w, site, issue = "none") {
        fetch(scriptURL, {
            method: "POST",
            mode: 'no-cors',
            body: JSON.stringify({ feedback, size, h, w, site, issue, ts: new Date().toISOString() })
        }).catch(() => {});
    }

    function calculateSize(h, w, c) {
        const H = parseFloat(h); const W = parseFloat(w); const C = parseFloat(c || 0);
        if (C > 20) {
            if (C <= 35.5) return "XS"; if (C <= 37.5) return "S"; if (C <= 39.5) return "M";
            if (C <= 42.5) return "L"; if (C <= 45.5) return "XL"; return "XXL";
        }
        if (H < 165) return W < 63 ? "S" : "M";
        if (H <= 178) return W < 75 ? "M" : "L";
        return W < 88 ? "L" : "XL";
    }

    function injectBadge(size, h, w) {
        if (document.getElementById("nexa-badge")) return;

        const badge = document.createElement("div");
        badge.id = "nexa-badge";
        badge.style.cssText = `
            position: fixed; bottom: 30px; right: 30px; 
            background: #fff; padding: 12px 20px; border-radius: 24px;
            z-index: 2147483647; box-shadow: 0 20px 50px rgba(0,0,0,0.1);
            border: 1px solid #eee; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            display: flex; flex-direction: column; align-items: center; gap: 8px;
            transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
            opacity: 0; transform: translateY(20px); min-width: 140px;
        `;

        badge.innerHTML = `
            <style>
                .nx-brand { font-size: 9px; font-weight: 800; letter-spacing: 3px; color: #bbb; text-transform: uppercase; margin-bottom: -4px; }
                .nx-main { display: flex; align-items: center; gap: 12px; width: 100%; justify-content: center; }
                .nx-size { font-size: 16px; font-weight: 700; color: #000; }
                .nx-btn-mini { border:none; background:none; cursor:pointer; font-size: 11px; font-weight: 600; color: #000; text-transform: uppercase; padding: 5px 8px; border-radius: 8px; transition: 0.2s; border: 1px solid #f0f0f0; }
                .nx-btn-mini:hover { background: #000; color: #fff; }
                .nx-divider { width: 1px; height: 14px; background: #eee; }
                .nx-select { border: 1px solid #eee; font-size: 11px; outline: none; font-weight: 600; padding: 5px; border-radius: 8px; width: 100%; background: #f9f9f9; }
            </style>
            <div class="nx-brand">NEXA</div>
            <div class="nx-main" id="nx-content">
                <div class="nx-size">${size}</div>
                <div class="nx-divider"></div>
                <button id="nx-ok" class="nx-btn-mini">Yes</button>
                <button id="nx-no" class="nx-btn-mini">No</button>
            </div>
        `;

        document.body.appendChild(badge);
        setTimeout(() => { badge.style.opacity = "1"; badge.style.transform = "translateY(0)"; }, 100);

        const hideBadge = () => {
            badge.style.opacity = "0";
            badge.style.transform = "translateY(20px)";
            setTimeout(() => { if(badge) badge.remove(); }, 600);
        };

        // YES Logic
        document.getElementById("nx-ok").onclick = () => {
            sendToSheet("correct", size, h, w, location.hostname);
            document.getElementById("nx-content").innerHTML = '<span style="color:#10b981; font-size:12px; font-weight:700;">PERFECT FIT</span>';
            setTimeout(hideBadge, 1500);
        };

        // NO Logic with 4 Options
        document.getElementById("nx-no").onclick = () => {
            document.getElementById("nx-content").innerHTML = `
                <select id="nx-issue" class="nx-select">
                    <option value="tight">TOO TIGHT</option>
                    <option value="loose">TOO LOOSE</option>
                    <option value="short">TOO SHORT</option>
                    <option value="long">TOO LONG</option>
                </select>
                <button id="nx-send" class="nx-btn-mini" style="background:#000; color:#fff;">OK</button>
            `;
            document.getElementById("nx-send").onclick = () => {
                const issue = document.getElementById("nx-issue").value;
                sendToSheet("wrong", size, h, w, location.hostname, issue);
                document.getElementById("nx-content").innerHTML = '<span style="font-size:11px; font-weight:700;">UPDATED</span>';
                setTimeout(hideBadge, 1200);
            };
        };

        return hideBadge;
    }

    chrome.storage.local.get(["height", "weight", "chest"], (data) => {
        if (!data.height || !data.weight) return;
        const finalSize = calculateSize(data.height, data.weight, data.chest);

        // Visibility Schedule: Total 35-40 seconds
        const closer = injectBadge(finalSize, data.height, data.weight);
        
        setTimeout(() => {
            if (closer) closer();
            // Final Clean Up after 35 seconds total
        }, 35000);
    });
}