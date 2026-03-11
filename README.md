# Omi-Extension
Chrome side panel extension for Omi API integration. Captures active page context and sends notes to Omi Memories or Conversations.
# Omi Persistent Chat (Chrome Extension)

## Overview
A Chrome side panel extension designed to bridge your browser with the Omi API. Capture thoughts, notes, and active web page context without leaving your current tab.

## Features
* Persistent side panel interface.
* Sends notes directly to Omi API endpoints.
* Routes data to Omi Memories or Omi Conversations.
* Optional extraction of up to 3000 characters from the active web page.
* High-contrast, dyslexia-friendly dark theme.

## Prerequisites
* Google Chrome browser.
* An active Omi API key.

## Installation (Developer Mode)
1. Clone or download this repository to your local machine.
2. Open Google Chrome.
3. Navigate to `chrome://extensions/` in your address bar.
4. Enable **Developer mode** using the toggle switch in the top right corner.
5. Click the **Load unpacked** button.
6. Select the folder containing the extension files (`manifest.json`, `background.js`, `sidepanel.html`, `sidepanel.js`).
7. The extension icon will appear in your Chrome toolbar.
8. Pin the extension to your toolbar for easy access.

## Configuration
1. Open the `sidepanel.js` file in a text editor.
2. Locate the `OMI_API_KEY` constant on line 2.
3. Replace `"YOUR_API_KEY_HERE"` with your actual Omi developer API key.
4. Save the file.
5. Navigate back to `chrome://extensions/`.
6. Click the **Reload** icon on the Omi Persistent Chat extension card.

## Usage
1. Click the extension icon in your Chrome toolbar to open the side panel.
2. Click **Start Session**.
3. Type your note or thought in the input area.
4. Toggle **Attach Page Text** to include textual context from the currently active tab.
5. Toggle **Save to Memories** to route the payload to the Memories endpoint. Uncheck this to route to Conversations.
6. Click **Send**.
7. Verify the injected data in your Omi mobile application.

## Limitations
* Chrome security prevents text extraction from restricted system pages (e.g., `chrome://`, `about:`).
* Payloads sent to the Memories endpoint are strictly truncated to 485 characters to meet API constraints.

## License
MIT License
