const OMI_API_KEY = "YOUR_API_KEY_HERE";
const ENDPOINT_MEMORIES = "https://api.omi.me/v1/dev/user/memories";
const ENDPOINT_CONVERSATIONS = "https://api.omi.me/v1/dev/user/conversations";

const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const inputArea = document.getElementById('inputArea');
const sendBtn = document.getElementById('sendBtn');
const userInput = document.getElementById('userInput');
const chatLog = document.getElementById('chatLog');
const chkContext = document.getElementById('chkContext');
const chkMemory = document.getElementById('chkMemory');

let sessionActive = false;

function logMessage(type, text) {
    const div = document.createElement('div');
    div.className = `msg ${type}`;
    div.textContent = text;
    chatLog.appendChild(div);
    chatLog.scrollTop = chatLog.scrollHeight;
}

startBtn.addEventListener('click', () => {
    sessionActive = true;
    startBtn.style.display = 'none';
    stopBtn.style.display = 'block';
    inputArea.style.display = 'flex';
    logMessage("sys", "[*] Session Started. Capture active.");
});

stopBtn.addEventListener('click', () => {
    sessionActive = false;
    startBtn.style.display = 'block';
    stopBtn.style.display = 'none';
    inputArea.style.display = 'none';
    logMessage("sys", "[*] Session Stopped.");
});

sendBtn.addEventListener('click', () => {
    if (!sessionActive) return;
    
    const text = userInput.value.trim();
    if (!text) return;

    logMessage("user", `You: ${text}`);
    userInput.value = "";
    
    const includeContext = chkContext.checked;
    const isMemory = chkMemory.checked;

    if (!includeContext) {
        logMessage("sys", "[*] Sending note only...");
        pushToOmi(`[SESSION LOG]\nUser Note: ${text}`, isMemory);
        return;
    }

    logMessage("sys", "[*] Extracting page content...");
    
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs || tabs.length === 0 || !tabs[0].id) {
            logMessage("sys", "[-] Error: No active tab found. Sending note only.");
            pushToOmi(`[SESSION LOG]\nUser Note: ${text}`, isMemory);
            return;
        }

        const tabId = tabs[0].id;
        const url = tabs[0].url;

        if (url.startsWith('chrome://') || url.startsWith('about:') || url.startsWith('edge://')) {
            logMessage("sys", "[-] Warning: Cannot read system pages. Sending note only.");
            pushToOmi(`[SESSION LOG]\nNote: ${text}\n(System Page: ${url})`, isMemory);
            return;
        }

        try {
            chrome.scripting.executeScript({
                target: { tabId: tabId },
                func: () => {
                    if (document.body) {
                        return document.body.innerText.substring(0, 3000);
                    }
                    return "No body content found.";
                }
            })
            .then((results) => {
                const pageContent = (results && results[0]) ? results[0].result : "No readable content.";
                let finalPayload = `[SESSION LOG]\nURL: ${url}\nUser Note: ${text}\n\nPage Context:\n${pageContent}`;
                
                if (isMemory && finalPayload.length > 490) {
                    finalPayload = finalPayload.substring(0, 485) + "...";
                }
                
                logMessage("sys", "[*] Sending payload to Omi API...");
                pushToOmi(finalPayload, isMemory);
            })
            .catch((err) => {
                logMessage("sys", `[-] Script Error: ${err.message}. Sending note only.`);
                pushToOmi(`[SESSION LOG]\nNote: ${text}\nURL: ${url}\n(Extraction failed)`, isMemory);
            });
        } catch (fatalErr) {
            logMessage("sys", `[-] Fatal Extraction Error. Sending note only.`);
            pushToOmi(`[SESSION LOG]\nNote: ${text}`, isMemory);
        }
    });
});

async function pushToOmi(payload, isMemory) {
    const targetUrl = isMemory ? ENDPOINT_MEMORIES : ENDPOINT_CONVERSATIONS;
    const bodyData = isMemory ? { content: payload } : { text: payload };

    try {
        const response = await fetch(targetUrl, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OMI_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(bodyData)
        });

        if (response.status === 200) {
            const dest = isMemory ? "Memories" : "Conversations";
            logMessage("sys", `[+] Success: Data injected into Omi ${dest}. Open mobile app to interact.`);
        } else {
            const errBody = await response.text();
            logMessage("sys", `[-] API Error: ${response.status} - ${errBody}`);
        }
    } catch (e) {
        logMessage("sys", `[-] Connection Failed: ${e.message}`);
    }
}
