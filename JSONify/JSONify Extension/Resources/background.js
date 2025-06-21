// JSONSpruce Extension Background Script

// Listen for tab updates to potentially inject content script for JSON detection
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // Only proceed when the page is completely loaded
    if (changeInfo.status === 'complete' && tab.url) {
        // Check if URL might contain JSON (API endpoints, .json files, etc.)
        const url = tab.url.toLowerCase();
        const isLikelyJSON = url.includes('/api/') || 
                           url.endsWith('.json') || 
                           url.includes('json') ||
                           url.includes('/rest/') ||
                           url.includes('/graphql');
        
        if (isLikelyJSON) {
            // Content script is already injected via manifest, but we can send a message
            // to trigger re-checking if needed
            browser.tabs.sendMessage(tabId, { action: 'checkJSON' }).catch(() => {
                // Ignore errors - content script might not be injected on this page
            });
        }
    }
});

// Handle messages from content script
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'jsonDetected') {
        // Update extension icon or badge to indicate JSON was detected
        browser.action.setBadgeText({ 
            text: 'JSON', 
            tabId: sender.tab.id 
        });
        browser.action.setBadgeBackgroundColor({ 
            color: '#4CAF50',
            tabId: sender.tab.id
        });
    } else if (request.action === 'notJSON') {
        // Clear badge if not JSON
        browser.action.setBadgeText({ 
            text: '', 
            tabId: sender.tab.id 
        });
    }
    
    return true;
});

// Clear badge when tab is closed
browser.tabs.onRemoved.addListener((tabId) => {
    browser.action.setBadgeText({ text: '', tabId });
});

// Handle extension icon click
browser.action.onClicked.addListener((tab) => {
    // Send message to content script to toggle formatting
    browser.tabs.sendMessage(tab.id, { action: 'toggleFormat' }).catch(() => {
        // Ignore errors
    });
});