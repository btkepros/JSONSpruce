(function() {
    // Only run on top-level frames
    if (window.top !== window.self) return;

    // Check if the content might be JSON
    function isLikelyJSON() {
        const contentType = document.contentType || '';
        const isJSONContentType = contentType.includes('application/json') || contentType.includes('text/json');
        
        // Get the raw text content
        const bodyText = document.body?.innerText?.trim() || '';
        
        // Quick checks for JSON structure
        const startsWithJSON = bodyText.startsWith('{') || bodyText.startsWith('[');
        const endsWithJSON = bodyText.endsWith('}') || bodyText.endsWith(']');
        
        return (isJSONContentType || (startsWithJSON && endsWithJSON)) && bodyText.length > 0;
    }

    // Parse and format JSON
    function formatJSON() {
        try {
            const rawText = document.body.innerText;
            const jsonData = JSON.parse(rawText);
            
            // Create formatted view
            document.documentElement.innerHTML = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <title>JSON Viewer - JSONSpruce</title>
                </head>
                <body>
                    <div class="json-formatter">
                        <button id="toggle-toolbar" class="toggle-toolbar-btn" title="Toggle Toolbar">☰</button>
                        <div class="toolbar" id="toolbar">
                            <button id="expand-all" class="toolbar-btn">Expand All</button>
                            <button id="collapse-all" class="toolbar-btn">Collapse All</button>
                            <button id="copy-json" class="toolbar-btn">Copy</button>
                            <button id="raw-json" class="toolbar-btn">Raw</button>
                            <button id="hide-toolbar" class="toolbar-btn">Hide</button>
                        </div>
                        <div id="json-content"></div>
                        <pre id="raw-content" style="display: none;">${escapeHtml(rawText)}</pre>
                    </div>
                </body>
                </html>
            `;
            
            // Render the formatted JSON
            const container = document.getElementById('json-content');
            container.appendChild(renderJSON(jsonData));
            
            // Add event listeners
            addEventListeners(rawText, jsonData);
            
        } catch (e) {
            console.error('JSONSpruce: Failed to parse JSON', e);
        }
    }

    // Escape HTML special characters
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Render JSON with syntax highlighting and collapsible sections
    function renderJSON(data, key = null, isLast = true) {
        const container = document.createElement('div');
        container.className = 'json-item';
        
        if (key !== null) {
            const keySpan = document.createElement('span');
            keySpan.className = 'json-key';
            keySpan.textContent = `"${key}"`;
            container.appendChild(keySpan);
            container.appendChild(document.createTextNode(': '));
        }
        
        if (data === null) {
            const nullSpan = document.createElement('span');
            nullSpan.className = 'json-null';
            nullSpan.textContent = 'null';
            container.appendChild(nullSpan);
        } else if (typeof data === 'boolean') {
            const boolSpan = document.createElement('span');
            boolSpan.className = 'json-boolean';
            boolSpan.textContent = data;
            container.appendChild(boolSpan);
        } else if (typeof data === 'number') {
            const numSpan = document.createElement('span');
            numSpan.className = 'json-number';
            numSpan.textContent = data;
            container.appendChild(numSpan);
        } else if (typeof data === 'string') {
            const strSpan = document.createElement('span');
            strSpan.className = 'json-string';
            strSpan.textContent = `"${data}"`;
            container.appendChild(strSpan);
        } else if (Array.isArray(data)) {
            const toggle = document.createElement('span');
            toggle.className = 'toggle expanded';
            toggle.textContent = '▼';
            container.appendChild(toggle);
            
            const arrayContainer = document.createElement('span');
            arrayContainer.className = 'json-array';
            
            const openBracket = document.createElement('span');
            openBracket.className = 'json-bracket';
            openBracket.textContent = '[';
            arrayContainer.appendChild(openBracket);
            
            if (data.length > 0) {
                const itemsContainer = document.createElement('div');
                itemsContainer.className = 'json-items';
                
                data.forEach((item, index) => {
                    const itemElement = renderJSON(item, null, index === data.length - 1);
                    itemsContainer.appendChild(itemElement);
                });
                
                arrayContainer.appendChild(itemsContainer);
            }
            
            const closeBracket = document.createElement('span');
            closeBracket.className = 'json-bracket';
            closeBracket.textContent = ']';
            arrayContainer.appendChild(closeBracket);
            
            container.appendChild(arrayContainer);
            
            // Toggle functionality
            toggle.addEventListener('click', () => {
                toggle.classList.toggle('expanded');
                const items = arrayContainer.querySelector('.json-items');
                if (items) {
                    items.style.display = toggle.classList.contains('expanded') ? 'block' : 'none';
                }
                toggle.textContent = toggle.classList.contains('expanded') ? '▼' : '▶';
            });
        } else if (typeof data === 'object') {
            const toggle = document.createElement('span');
            toggle.className = 'toggle expanded';
            toggle.textContent = '▼';
            container.appendChild(toggle);
            
            const objContainer = document.createElement('span');
            objContainer.className = 'json-object';
            
            const openBrace = document.createElement('span');
            openBrace.className = 'json-brace';
            openBrace.textContent = '{';
            objContainer.appendChild(openBrace);
            
            const keys = Object.keys(data);
            if (keys.length > 0) {
                const itemsContainer = document.createElement('div');
                itemsContainer.className = 'json-items';
                
                keys.forEach((key, index) => {
                    const itemElement = renderJSON(data[key], key, index === keys.length - 1);
                    itemsContainer.appendChild(itemElement);
                });
                
                objContainer.appendChild(itemsContainer);
            }
            
            const closeBrace = document.createElement('span');
            closeBrace.className = 'json-brace';
            closeBrace.textContent = '}';
            objContainer.appendChild(closeBrace);
            
            container.appendChild(objContainer);
            
            // Toggle functionality
            toggle.addEventListener('click', () => {
                toggle.classList.toggle('expanded');
                const items = objContainer.querySelector('.json-items');
                if (items) {
                    items.style.display = toggle.classList.contains('expanded') ? 'block' : 'none';
                }
                toggle.textContent = toggle.classList.contains('expanded') ? '▼' : '▶';
            });
        }
        
        if (!isLast) {
            container.appendChild(document.createTextNode(','));
        }
        
        return container;
    }

    // Add toolbar event listeners
    function addEventListeners(rawText, jsonData) {
        // Expand all
        document.getElementById('expand-all').addEventListener('click', () => {
            document.querySelectorAll('.toggle').forEach(toggle => {
                toggle.classList.add('expanded');
                toggle.textContent = '▼';
                const parent = toggle.parentElement;
                const items = parent.querySelector('.json-items');
                if (items) items.style.display = 'block';
            });
        });
        
        // Collapse all
        document.getElementById('collapse-all').addEventListener('click', () => {
            document.querySelectorAll('.toggle').forEach(toggle => {
                toggle.classList.remove('expanded');
                toggle.textContent = '▶';
                const parent = toggle.parentElement;
                const items = parent.querySelector('.json-items');
                if (items) items.style.display = 'none';
            });
        });
        
        // Copy JSON
        document.getElementById('copy-json').addEventListener('click', () => {
            // Copy the formatted JSON with proper indentation
            const formattedJson = JSON.stringify(jsonData, null, 2);
            navigator.clipboard.writeText(formattedJson).then(() => {
                const btn = document.getElementById('copy-json');
                const originalText = btn.textContent;
                btn.textContent = 'Copied!';
                setTimeout(() => {
                    btn.textContent = originalText;
                }, 2000);
            });
        });
        
        // Toggle raw view
        document.getElementById('raw-json').addEventListener('click', () => {
            const jsonContent = document.getElementById('json-content');
            const rawContent = document.getElementById('raw-content');
            const btn = document.getElementById('raw-json');
            
            if (jsonContent.style.display === 'none') {
                jsonContent.style.display = 'block';
                rawContent.style.display = 'none';
                btn.textContent = 'Raw';
            } else {
                jsonContent.style.display = 'none';
                rawContent.style.display = 'block';
                btn.textContent = 'Formatted';
            }
        });
        
        // Hide/Show toolbar
        const toolbar = document.getElementById('toolbar');
        const toggleBtn = document.getElementById('toggle-toolbar');
        const hideBtn = document.getElementById('hide-toolbar');
        
        // Load saved toolbar state (default to hidden if not set)
        const toolbarHidden = localStorage.getItem('jsonSpruceToolbarHidden') !== 'false';
        if (toolbarHidden) {
            toolbar.style.display = 'none';
            toggleBtn.style.display = 'block';
        } else {
            toggleBtn.style.display = 'none';
        }
        
        hideBtn.addEventListener('click', () => {
            toolbar.style.display = 'none';
            toggleBtn.style.display = 'block';
            localStorage.setItem('jsonSpruceToolbarHidden', 'true');
        });
        
        toggleBtn.addEventListener('click', () => {
            toolbar.style.display = 'flex';
            toggleBtn.style.display = 'none';
            localStorage.setItem('jsonSpruceToolbarHidden', 'false');
        });
    }

    // Initialize
    if (isLikelyJSON()) {
        // Small delay to ensure document is fully loaded
        setTimeout(() => {
            formatJSON();
            // Notify background script that JSON was detected
            browser.runtime.sendMessage({ action: 'jsonDetected' }).catch(() => {});
        }, 50);
    } else {
        // Notify background script that this is not JSON
        browser.runtime.sendMessage({ action: 'notJSON' }).catch(() => {});
    }
    
    // Listen for messages from background script
    browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'checkJSON' && isLikelyJSON()) {
            formatJSON();
            browser.runtime.sendMessage({ action: 'jsonDetected' }).catch(() => {});
        } else if (request.action === 'toggleFormat') {
            // Toggle between raw and formatted view
            const rawBtn = document.getElementById('raw-json');
            if (rawBtn) {
                rawBtn.click();
            }
        }
    });
})();