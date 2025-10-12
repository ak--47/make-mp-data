// Dungeon Master 4 - Complete Rebuild

let editor = null;
let hooksEditor = null;
let currentSchema = null;
let currentHooks = null;
let originalPrompt = '';
let isUpdatingFromEditor = false;
let isUpdatingFromForm = false;
let isUpdatingFromHooks = false;

// ========== MONACO EDITOR ==========
function initMonaco() {
    require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' } });

    require(['vs/editor/editor.main'], function () {
        // Initialize JSON editor
        editor = monaco.editor.create(document.getElementById('editor'), {
            value: '',
            language: 'json',
            theme: 'vs-dark',
            automaticLayout: true,
            fontSize: 14,
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            formatOnPaste: true,
            formatOnType: true,
            tabSize: 2,
        });

        // Initialize Hooks editor
        hooksEditor = monaco.editor.create(document.getElementById('hooksEditor'), {
            value: '',
            language: 'javascript',
            theme: 'vs-dark',
            automaticLayout: true,
            fontSize: 14,
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            formatOnPaste: true,
            formatOnType: true,
            tabSize: 2,
        });

        monaco.editor.defineTheme('dungeon-master', {
            base: 'vs-dark',
            inherit: true,
            rules: [
                { token: 'string.key.json', foreground: 'ef4444' },
                { token: 'string.value.json', foreground: 'fbbf24' },
                { token: 'number', foreground: 'a78bfa' },
                { token: 'keyword', foreground: 'dc2626' },
            ],
            colors: {
                'editor.background': '#0a0a0a',
                'editor.foreground': '#f5f5f5',
                'editor.lineHighlightBackground': '#1a1a1a',
                'editor.selectionBackground': '#dc262633',
                'editorCursor.foreground': '#dc2626',
                'editorLineNumber.foreground': '#3a3a3a',
            }
        });

        monaco.editor.setTheme('dungeon-master');

        // Initialize with empty schema template
        initializeEmptySchema();

        // Watch for JSON editor changes
        editor.onDidChangeModelContent(() => {
            if (!isUpdatingFromForm && !isUpdatingFromHooks) {
                clearTimeout(window._editorDebounce);
                window._editorDebounce = setTimeout(() => {
                    syncEditorToForm();
                    updateSchemaViz();
                    syncHooksToJson();
                }, 500);
            }
        });

        // Watch for hooks editor changes
        hooksEditor.onDidChangeModelContent(() => {
            if (!isUpdatingFromHooks) {
                clearTimeout(window._hooksDebounce);
                window._hooksDebounce = setTimeout(() => {
                    syncHooksToJson();
                }, 500);
            }
        });
    });
}

// Initialize editor with empty schema template
function initializeEmptySchema() {
    if (!editor) return;

    const emptySchema = {
        name: "",
        token: "",
        website: "",
        numUsers: 1000,
        numEvents: 100000,
        numDays: 100,
        format: "json",
        batchSize: 1500000,
        concurrency: 50,
        hasLocation: true,
        hasCampaigns: true,
        hasAdSpend: true,
        hasAvatar: true,
        hasAnonIds: false,
        hasSessionIds: false,
        hasDesktopDevices: true,
        hasAndroidDevices: false,
        hasIOSDevices: false,
        hasBrowser: true,
        writeToDisk: false,
        events: [],
        userProps: {},
        funnels: [],
        scdProps: {},
        lookupTables: [],
        groupKeys: [],
        groupProps: {}
    };

    editor.setValue(JSON.stringify(emptySchema, null, 2));
}

// ========== NUMBER FORMATTING ==========
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// ========== CONFIGURATION MANAGEMENT ==========
const SLIDER_CONFIGS = [
    { id: 'numUsers', min: 10, max: 100000, step: 10 },
    { id: 'numEvents', min: 100, max: 10000000, step: 1000 },
    { id: 'numDays', min: 1, max: 365, step: 1 },
    { id: 'batchSize', min: 1000, max: 10000000, step: 10000 },
    { id: 'concurrency', min: 1, max: 100, step: 1 },
];

const TOGGLE_IDS = [
    'hasLocation', 'hasCampaigns', 'hasAdSpend', 'hasAvatar',
    'hasAnonIds', 'hasSessionIds', 'hasDesktopDevices',
    'hasAndroidDevices', 'hasIOSDevices', 'hasBrowser', 'writeToDisk'
];

const TEXT_INPUT_IDS = ['dungeonName', 'token', 'website'];

// Initialize sliders with two-way sync
function initSliders() {
    SLIDER_CONFIGS.forEach(config => {
        const slider = document.getElementById(config.id);
        const numberInput = document.getElementById(`${config.id}Input`);
        const display = document.getElementById(`${config.id}Display`);

        if (!slider || !numberInput || !display) return;

        // Slider -> Number Input + Display
        slider.addEventListener('input', () => {
            const value = parseInt(slider.value);
            numberInput.value = value;
            display.textContent = formatNumber(value);
            syncFormToEditor();
        });

        // Number Input -> Slider + Display
        numberInput.addEventListener('input', () => {
            const value = parseInt(numberInput.value);
            if (!isNaN(value)) {
                slider.value = value;
                display.textContent = formatNumber(value);
                clearTimeout(numberInput._debounce);
                numberInput._debounce = setTimeout(syncFormToEditor, 300);
            }
        });
    });
}

// Initialize toggles
function initToggles() {
    TOGGLE_IDS.forEach(id => {
        const toggle = document.getElementById(id);
        if (toggle) {
            toggle.addEventListener('change', syncFormToEditor);
        }
    });

    // Format dropdown
    const formatSelect = document.getElementById('format');
    if (formatSelect) {
        formatSelect.addEventListener('change', syncFormToEditor);
    }
}

// Initialize text inputs
function initTextInputs() {
    TEXT_INPUT_IDS.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', () => {
                clearTimeout(input._debounce);
                input._debounce = setTimeout(syncFormToEditor, 300);
            });
        }
    });
}

// Set default config values
function setDefaultConfig() {
    const defaults = {
        hasLocation: true,
        hasCampaigns: true,
        hasAdSpend: true,
        hasAvatar: true,
        hasDesktopDevices: true,
        hasBrowser: true,
    };

    Object.entries(defaults).forEach(([key, value]) => {
        const element = document.getElementById(key);
        if (element && element.type === 'checkbox') {
            element.checked = value;
        }
    });
}

// Sync form to editor
function syncFormToEditor() {
    if (isUpdatingFromEditor || !editor) return;
    isUpdatingFromForm = true;

    try {
        let jsonData = {};
        try {
            jsonData = JSON.parse(editor.getValue());
        } catch (e) {
            // Invalid JSON, start fresh
        }

        // Update sliders
        SLIDER_CONFIGS.forEach(config => {
            const element = document.getElementById(config.id);
            if (element) {
                jsonData[config.id] = parseInt(element.value);
            }
        });

        // Update toggles
        TOGGLE_IDS.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                jsonData[id] = element.checked;
            }
        });

        // Update format
        const formatSelect = document.getElementById('format');
        if (formatSelect) {
            jsonData.format = formatSelect.value;
        }

        // Update text inputs (dungeonName -> name, token -> token)
        TEXT_INPUT_IDS.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                // Map dungeonName to 'name' in JSON
                const jsonKey = id === 'dungeonName' ? 'name' : id;
                jsonData[jsonKey] = element.value;
            }
        });

        // Update editor
        const formattedJson = JSON.stringify(jsonData, null, 2);
        editor.setValue(formattedJson);
    } catch (error) {
        console.error('Error syncing form to editor:', error);
    } finally {
        isUpdatingFromForm = false;
    }
}

// Sync editor to form
function syncEditorToForm() {
    if (isUpdatingFromForm || !editor) return;
    isUpdatingFromEditor = true;

    try {
        const jsonData = JSON.parse(editor.getValue());

        // Update sliders
        SLIDER_CONFIGS.forEach(config => {
            const slider = document.getElementById(config.id);
            const numberInput = document.getElementById(`${config.id}Input`);
            const display = document.getElementById(`${config.id}Display`);

            if (slider && jsonData[config.id] !== undefined) {
                const value = parseInt(jsonData[config.id]);
                slider.value = value;
                numberInput.value = value;
                display.textContent = formatNumber(value);
            }
        });

        // Update toggles
        TOGGLE_IDS.forEach(id => {
            const element = document.getElementById(id);
            if (element && jsonData[id] !== undefined) {
                element.checked = Boolean(jsonData[id]);
            }
        });

        // Update format
        const formatSelect = document.getElementById('format');
        if (formatSelect && jsonData.format) {
            formatSelect.value = jsonData.format;
        }

        // Update text inputs (name -> dungeonName, token -> token)
        TEXT_INPUT_IDS.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                // Map 'name' from JSON to dungeonName input
                const jsonKey = id === 'dungeonName' ? 'name' : id;
                if (jsonData[jsonKey] !== undefined) {
                    element.value = jsonData[jsonKey];
                }
            }
        });
    } catch (error) {
        console.debug('Invalid JSON, skipping form sync');
    } finally {
        isUpdatingFromEditor = false;
    }
}

// ========== HOOKS SYNC ==========
function syncHooksToJson() {
    if (!hooksEditor || !editor || isUpdatingFromHooks) return;

    try {
        const hooksCode = hooksEditor.getValue().trim();
        currentHooks = hooksCode;

        // Update JSON editor with hooks
        isUpdatingFromHooks = true;
        const jsonData = JSON.parse(editor.getValue());

        if (hooksCode) {
            jsonData.hook = hooksCode;
        } else {
            delete jsonData.hook;
        }

        editor.setValue(JSON.stringify(jsonData, null, 2));
    } catch (e) {
        console.debug('Error syncing hooks to JSON:', e);
    } finally {
        isUpdatingFromHooks = false;
    }
}

function syncJsonToHooks() {
    if (!hooksEditor || !editor || isUpdatingFromHooks) return;

    try {
        isUpdatingFromHooks = true;
        const jsonData = JSON.parse(editor.getValue());

        if (jsonData.hook && typeof jsonData.hook === 'string') {
            hooksEditor.setValue(jsonData.hook);
            currentHooks = jsonData.hook;
            showHooksEditor();
        } else {
            hooksEditor.setValue('');
            currentHooks = null;
        }
    } catch (e) {
        console.debug('Error syncing JSON to hooks:', e);
    } finally {
        isUpdatingFromHooks = false;
    }
}

function showHooksEditor() {
    const hooksEditor = document.getElementById('hooksEditor');
    const hooksEmpty = document.getElementById('hooksEmpty');

    if (hooksEditor && hooksEmpty) {
        hooksEditor.style.display = 'block';
        hooksEmpty.style.display = 'none';
    }
}

function hideHooksEditor() {
    const hooksEditorEl = document.getElementById('hooksEditor');
    const hooksEmpty = document.getElementById('hooksEmpty');

    if (hooksEditorEl && hooksEmpty) {
        hooksEditorEl.style.display = 'none';
        hooksEmpty.style.display = 'flex';
    }
}

// ========== COLLAPSIBLE SECTIONS ==========
function initCollapsibleSections() {
    const sections = [
        { header: 'configHeader', content: 'configContent' },
        { header: 'schemaHeader', content: 'schemaContent' },
        { header: 'hooksHeader', content: 'hooksContent' },
        { header: 'jsonHeader', content: 'jsonContent' }
    ];

    sections.forEach(({ header, content }) => {
        const headerEl = document.getElementById(header);
        const contentEl = document.getElementById(content);

        if (headerEl && contentEl) {
            headerEl.addEventListener('click', () => {
                headerEl.classList.toggle('collapsed');
                contentEl.classList.toggle('collapsed');
            });
        }
    });
}

// ========== TRIPPY LOTTIE DICE ANIMATION ==========
let diceAnimationState = {
    interval: null,
    dice: [],
    isRunning: false
};

function createLottieDice() {
    const diceContainer = document.getElementById('diceContainer');
    diceContainer.innerHTML = '';
    diceAnimationState.dice = [];
    diceAnimationState.isRunning = true;

    const containerWidth = diceContainer.clientWidth || 800;
    const containerHeight = diceContainer.clientHeight || 300;

    // Start with initial dice
    const initialDiceCount = Math.floor(Math.random() * 4) + 5; // 5-8 dice

    for (let i = 0; i < initialDiceCount; i++) {
        addDie(diceContainer, containerWidth, containerHeight);
    }

    // Randomly add/remove dice over time
    diceAnimationState.interval = setInterval(() => {
        if (!diceAnimationState.isRunning) return;

        const action = Math.random();

        // 40% chance to add a die
        if (action < 0.4 && diceAnimationState.dice.length < 20) {
            addDie(diceContainer, containerWidth, containerHeight);
        }
        // 30% chance to remove a die
        else if (action < 0.7 && diceAnimationState.dice.length > 3) {
            removeDie(diceContainer);
        }
        // 20% chance to split a die into two
        else if (action < 0.9 && diceAnimationState.dice.length < 15) {
            splitDie(diceContainer, containerWidth, containerHeight);
        }
        // 10% chance to make dice swap colors
        else {
            swapDiceColors();
        }
    }, 1200); // Every 1.2 seconds
}

function addDie(container, containerWidth, containerHeight) {
    const player = document.createElement('lottie-player');

    const size = Math.floor(Math.random() * 70) + 50; // 50-120px
    player.style.width = `${size}px`;
    player.style.height = `${size}px`;
    player.style.position = 'absolute';

    // Random starting position
    const x = Math.random() * (containerWidth - size);
    const y = Math.random() * (containerHeight - size);
    player.style.left = `${x}px`;
    player.style.top = `${y}px`;

    // Random movement animation
    const duration = 3 + Math.random() * 4; // 3-7 seconds
    const endX = Math.random() * (containerWidth - size);
    const endY = Math.random() * (containerHeight - size);

    player.style.animation = `float-dice ${duration}s ease-in-out infinite`;
    player.style.setProperty('--start-x', `${x}px`);
    player.style.setProperty('--start-y', `${y}px`);
    player.style.setProperty('--end-x', `${endX}px`);
    player.style.setProperty('--end-y', `${endY}px`);

    // Random rotation
    player.style.transform = `rotate(${Math.random() * 360}deg)`;
    player.style.transformOrigin = 'center';

    // Random opacity pulsing
    player.style.opacity = 0.7 + Math.random() * 0.3;

    player.setAttribute('src', 'cube-dice.lottie');
    player.setAttribute('loop', '');
    player.setAttribute('autoplay', '');
    player.setAttribute('speed', String(0.5 + Math.random() * 1));

    // Fade in
    player.style.animation = `dice-fade-in 0.5s ease-out, float-dice ${duration}s ease-in-out 0.5s infinite`;

    container.appendChild(player);
    diceAnimationState.dice.push(player);
}

function removeDie(container) {
    if (diceAnimationState.dice.length === 0) return;

    const index = Math.floor(Math.random() * diceAnimationState.dice.length);
    const die = diceAnimationState.dice[index];

    // Fade out animation
    die.style.animation = 'dice-fade-out 0.5s ease-out';

    setTimeout(() => {
        if (die.parentNode === container) {
            container.removeChild(die);
        }
        diceAnimationState.dice.splice(index, 1);
    }, 500);
}

function splitDie(container, containerWidth, containerHeight) {
    if (diceAnimationState.dice.length === 0) return;

    const index = Math.floor(Math.random() * diceAnimationState.dice.length);
    const originalDie = diceAnimationState.dice[index];

    // Get position of original die
    const rect = originalDie.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const x = rect.left - containerRect.left;
    const y = rect.top - containerRect.top;

    // Create two new smaller dice at same position
    for (let i = 0; i < 2; i++) {
        const player = document.createElement('lottie-player');

        const size = Math.floor(Math.random() * 50) + 40; // Smaller
        player.style.width = `${size}px`;
        player.style.height = `${size}px`;
        player.style.position = 'absolute';
        player.style.left = `${x}px`;
        player.style.top = `${y}px`;

        const duration = 3 + Math.random() * 4;
        const endX = Math.random() * (containerWidth - size);
        const endY = Math.random() * (containerHeight - size);

        player.style.setProperty('--start-x', `${x}px`);
        player.style.setProperty('--start-y', `${y}px`);
        player.style.setProperty('--end-x', `${endX}px`);
        player.style.setProperty('--end-y', `${endY}px`);

        player.style.transform = `rotate(${Math.random() * 360}deg) scale(0.8)`;
        player.style.opacity = 0.6 + Math.random() * 0.4;

        player.setAttribute('src', 'cube-dice.lottie');
        player.setAttribute('loop', '');
        player.setAttribute('autoplay', '');
        player.setAttribute('speed', String(0.8 + Math.random() * 0.8));

        player.style.animation = `dice-split 0.6s ease-out, float-dice ${duration}s ease-in-out 0.6s infinite`;

        container.appendChild(player);
        diceAnimationState.dice.push(player);
    }

    // Remove original
    removeDie(container);
}

function swapDiceColors() {
    diceAnimationState.dice.forEach(die => {
        const hue = Math.random() * 360;
        die.style.filter = `hue-rotate(${hue}deg) saturate(${0.8 + Math.random() * 0.4})`;
    });
}

// ========== UI SECTIONS ==========
const promptInput = document.getElementById('promptInput');
const generateBtn = document.getElementById('generateBtn');
const generateBtnText = document.getElementById('generateBtnText');
const promptTitle = document.getElementById('promptTitle');
const clearBtn = document.getElementById('clearBtn');
const loadingSection = document.getElementById('loadingSection');
const jsonSection = document.getElementById('jsonSection');
const errorSection = document.getElementById('errorSection');
const errorMessage = document.getElementById('errorMessage');
const copyBtn = document.getElementById('copyBtn');
const downloadBtn = document.getElementById('downloadBtn');

// Event Listeners
generateBtn.addEventListener('click', handleGenerate);
clearBtn.addEventListener('click', handleClear);
copyBtn.addEventListener('click', handleCopy);
downloadBtn.addEventListener('click', handleDownload);

// Show/hide clear button
promptInput.addEventListener('input', () => {
    if (promptInput.value.trim()) {
        clearBtn.style.display = 'inline-flex';
    } else {
        clearBtn.style.display = 'none';
    }
});

// Keyboard shortcuts
promptInput.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        handleGenerate();
    }
});

// ========== GENERATE SCHEMA ==========
async function handleGenerate() {
    const prompt = promptInput.value.trim();

    if (!prompt) {
        showError('Please enter a prompt describing your data');
        return;
    }

    // Check if we're iterating or generating new
    const isIteration = currentSchema !== null;
    originalPrompt = isIteration ? originalPrompt : prompt;

    generateBtn.disabled = true;
    hideError();
    showLoading();

    try {
        let schemaToIterate = null;
        if (isIteration && editor) {
            try {
                schemaToIterate = JSON.parse(editor.getValue());
            } catch (e) {
                schemaToIterate = currentSchema;
            }
        }

        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt,
                context: isIteration ? {
                    originalPrompt,
                    currentSchema: schemaToIterate
                } : undefined
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to generate schema');
        }

        currentSchema = data.schema;
        displaySchema(currentSchema);

        // Auto-expand schema section when schema is generated
        const schemaHeader = document.getElementById('schemaHeader');
        const schemaContent = document.getElementById('schemaContent');
        if (schemaHeader && schemaContent) {
            schemaHeader.classList.remove('collapsed');
            schemaContent.classList.remove('collapsed');
        }

        // Enable hooks generation button
        const generateHooksBtn = document.getElementById('generateHooksBtn');
        if (generateHooksBtn) {
            generateHooksBtn.disabled = false;
        }

        // Update UI for iteration mode
        if (!isIteration) {
            promptTitle.textContent = '🔄 Refine Your Schema';
            generateBtnText.textContent = '🔄 Update Schema';
            promptInput.placeholder = 'Describe changes to make to the schema...\n\nExample: Add more user properties like age and location, or change the purchase event to include shipping details...';
            promptInput.value = '';
        }
    } catch (error) {
        console.error('Error:', error);
        showError(error.message || 'An unexpected error occurred');
    } finally {
        generateBtn.disabled = false;
        hideLoading();
    }
}

// ========== DISPLAY SCHEMA ==========
function displaySchema(schema) {
    if (!editor) return;

    let formattedJson;
    if (typeof schema === 'object') {
        formattedJson = JSON.stringify(schema, null, 2);
    } else {
        try {
            formattedJson = JSON.stringify(JSON.parse(schema), null, 2);
        } catch (e) {
            formattedJson = String(schema);
        }
    }

    editor.setValue(formattedJson);

    // Update visualization
    updateSchemaViz();
}

// ========== GENERATE HOOKS ==========
async function handleGenerateHooks() {
    const hooksPromptInput = document.getElementById('hooksPromptInput');
    const generateHooksBtn = document.getElementById('generateHooksBtn');

    if (!hooksPromptInput) {
        // Fallback: use prompt() if no input field
        const prompt = window.prompt('Describe the statistical trends you want to engineer in your data:\n\nExample: "Users who watch low quality videos tend to churn more" or "Users in California spend 30% more than other states"');

        if (!prompt || !prompt.trim()) return;

        await generateHooks(prompt.trim());
        return;
    }

    const prompt = hooksPromptInput.value.trim();

    if (!prompt) {
        showError('Please describe the trends you want to engineer');
        return;
    }

    await generateHooks(prompt);
}

async function generateHooks(prompt) {
    const generateHooksBtn = document.getElementById('generateHooksBtn');

    if (!currentSchema) {
        showError('Please generate a schema first');
        return;
    }

    if (generateHooksBtn) generateHooksBtn.disabled = true;
    hideError();
    showLoadingModal('Weaving statistical magic...', 'The AI is engineering your data trends');

    try {
        const response = await fetch('/api/generate-hooks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt,
                currentSchema
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to generate hooks');
        }

        const hooksCode = data.hooks;
        currentHooks = hooksCode;

        // Update hooks editor
        if (hooksEditor) {
            isUpdatingFromHooks = true;
            hooksEditor.setValue(hooksCode);
            isUpdatingFromHooks = false;
        }

        // Show hooks editor
        showHooksEditor();

        // Sync to JSON
        syncHooksToJson();

        console.log('✅ Hooks generated successfully');
    } catch (error) {
        console.error('Error generating hooks:', error);
        showError(error.message || 'Failed to generate hooks');
    } finally {
        if (generateHooksBtn) generateHooksBtn.disabled = false;
        hideLoadingModal();
    }
}

// ========== SAVE & LOAD ==========
async function handleSave() {
    try {
        const saveBtn = document.getElementById('saveBtn');

        // Get current state
        const dungeonState = {
            schema: currentSchema || JSON.parse(editor.getValue()),
            hooks: currentHooks,
            timestamp: new Date().toISOString(),
            version: '4.0'
        };

        const content = JSON.stringify(dungeonState, null, 2);
        const blob = new Blob([content], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const name = dungeonState.schema?.name || 'dungeon';
        const filename = `${name}-${timestamp}.json`;

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Visual feedback
        const originalText = saveBtn.textContent;
        saveBtn.textContent = '✓ Saved';
        saveBtn.style.background = '#059669';

        setTimeout(() => {
            saveBtn.textContent = originalText;
            saveBtn.style.background = '';
        }, 2000);
    } catch (error) {
        console.error('Error saving dungeon:', error);
        showError('Failed to save dungeon: ' + error.message);
    }
}

async function handleLoad() {
    const fileInput = document.getElementById('fileInput');
    if (!fileInput) return;

    fileInput.click();
}

async function loadDungeonFromFile(file) {
    try {
        const loadBtn = document.getElementById('loadBtn');
        showLoadingModal('Loading your dungeon...', 'Restoring your configuration');

        const text = await file.text();
        const dungeonState = JSON.parse(text);

        // Validate structure
        if (!dungeonState.schema) {
            throw new Error('Invalid dungeon file: missing schema');
        }

        // Load schema
        currentSchema = dungeonState.schema;
        displaySchema(currentSchema);

        // Load hooks if present
        if (dungeonState.hooks && hooksEditor) {
            currentHooks = dungeonState.hooks;
            isUpdatingFromHooks = true;
            hooksEditor.setValue(dungeonState.hooks);
            isUpdatingFromHooks = false;
            showHooksEditor();

            // Enable hooks button
            const generateHooksBtn = document.getElementById('generateHooksBtn');
            if (generateHooksBtn) generateHooksBtn.disabled = false;
        }

        // Sync hooks to JSON
        syncHooksToJson();

        // Visual feedback
        hideLoadingModal();
        const originalText = loadBtn.textContent;
        loadBtn.textContent = '✓ Loaded';
        loadBtn.style.background = '#059669';

        setTimeout(() => {
            loadBtn.textContent = originalText;
            loadBtn.style.background = '';
        }, 2000);

        console.log('✅ Dungeon loaded successfully');
    } catch (error) {
        console.error('Error loading dungeon:', error);
        hideLoadingModal();
        showError('Failed to load dungeon: ' + error.message);
    }
}

// ========== CLEAR ALL ==========
function handleClear() {
    if (confirm('Clear everything and start fresh?')) {
        promptInput.value = '';
        currentSchema = null;
        currentHooks = null;
        originalPrompt = '';
        clearBtn.style.display = 'none';

        if (editor) {
            editor.setValue('');
        }

        if (hooksEditor) {
            hooksEditor.setValue('');
        }

        // Reset hooks UI
        hideHooksEditor();
        const generateHooksBtn = document.getElementById('generateHooksBtn');
        if (generateHooksBtn) generateHooksBtn.disabled = true;

        // Reset UI
        promptTitle.textContent = '✨ Generate Your Schema';
        generateBtnText.textContent = '🎲 Generate Schema';
        promptInput.placeholder = 'Describe the type of data you want to generate...\n\nExample: Create an e-commerce platform with product views, add to cart, checkout, and purchase events. Include user profiles with demographics and purchase history.';

        // Reinitialize empty schema
        initializeEmptySchema();
        hideError();
    }
}

// ========== COPY & DOWNLOAD ==========
async function handleCopy() {
    try {
        const content = editor.getValue();
        await navigator.clipboard.writeText(content);

        const iconSpan = copyBtn.querySelector('.icon');
        const originalIcon = iconSpan.textContent;

        iconSpan.textContent = '✓';
        copyBtn.style.background = '#059669';

        setTimeout(() => {
            iconSpan.textContent = originalIcon;
            copyBtn.style.background = '';
        }, 2000);
    } catch (error) {
        showError('Failed to copy to clipboard');
    }
}

function handleDownload() {
    try {
        const content = editor.getValue();
        const blob = new Blob([content], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const filename = `dungeon-schema-${timestamp}.json`;

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        const iconSpan = downloadBtn.querySelector('.icon');
        const originalIcon = iconSpan.textContent;

        iconSpan.textContent = '✓';
        downloadBtn.style.background = '#059669';

        setTimeout(() => {
            iconSpan.textContent = originalIcon;
            downloadBtn.style.background = '';
        }, 2000);
    } catch (error) {
        showError('Failed to download file');
    }
}

// ========== MODAL LOADING ==========
function showLoadingModal(text = 'Rolling the dice of fate...', subtext = 'The AI is conjuring your schema') {
    const modal = document.getElementById('loadingModal');
    const loadingText = document.getElementById('loadingText');
    const loadingSubtext = document.getElementById('loadingSubtext');

    if (loadingText) loadingText.textContent = text;
    if (loadingSubtext) loadingSubtext.textContent = subtext;

    createLottieDice();
    if (modal) modal.style.display = 'flex';
}

function hideLoadingModal() {
    const modal = document.getElementById('loadingModal');

    // Stop the animation interval
    diceAnimationState.isRunning = false;
    if (diceAnimationState.interval) {
        clearInterval(diceAnimationState.interval);
        diceAnimationState.interval = null;
    }

    if (modal) modal.style.display = 'none';

    const diceContainer = document.getElementById('diceContainer');
    if (diceContainer) {
        diceContainer.innerHTML = '';
    }
    diceAnimationState.dice = [];
}

// ========== UI HELPERS ==========
function showLoading() {
    showLoadingModal();
}

function hideLoading() {
    hideLoadingModal();
}

function showError(message) {
    hideLoading();
    errorMessage.textContent = message;
    errorSection.style.display = 'block';

    setTimeout(() => {
        errorSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);

    setTimeout(() => {
        hideError();
    }, 5000);
}

function hideError() {
    errorSection.style.display = 'none';
}

// ========== COLOR RE-ROLL EASTER EGG ==========
const COLOR_PALETTE = [
    { main: '#7856FF', dark: '#5028C0', light: '#B094FF' },  // Purple (default)
    { main: '#CC332B', dark: '#5B0237', light: '#FF7557' },  // Red
    { main: '#FFB0A3', dark: '#DA6B16', light: '#F8BC3B' },  // Orange/Peach
    { main: '#07B096', dark: '#07B096', light: '#80E1D9' },  // Teal
];

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function reRollColors() {
    // Pick a random color scheme
    const scheme = COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];
    const root = document.documentElement;

    // Convert hex to rgb for glow effects
    const mainRgb = hexToRgb(scheme.main);

    // Update CSS variables
    root.style.setProperty('--accent', scheme.main);
    root.style.setProperty('--accent-dark', scheme.dark);
    root.style.setProperty('--accent-light', scheme.light);
    root.style.setProperty('--glow', `0 0 20px rgba(${mainRgb.r}, ${mainRgb.g}, ${mainRgb.b}, 0.3)`);
    root.style.setProperty('--glow-strong', `0 0 30px rgba(${mainRgb.r}, ${mainRgb.g}, ${mainRgb.b}, 0.5)`);

    // Also update Monaco Editor theme colors
    if (editor && monaco) {
        setTimeout(() => {
            monaco.editor.defineTheme('dungeon-master', {
                base: 'vs-dark',
                inherit: true,
                rules: [
                    { token: 'string.key.json', foreground: scheme.light.replace('#', '') },
                    { token: 'string.value.json', foreground: 'fbbf24' },
                    { token: 'number', foreground: 'a78bfa' },
                    { token: 'keyword', foreground: scheme.main.replace('#', '') },
                ],
                colors: {
                    'editor.background': '#0a0a0a',
                    'editor.foreground': '#f5f5f5',
                    'editor.lineHighlightBackground': '#1a1a1a',
                    'editor.selectionBackground': scheme.main.replace('#', '') + '33',
                    'editorCursor.foreground': scheme.main.replace('#', ''),
                    'editorLineNumber.foreground': '#3a3a3a',
                }
            });
            monaco.editor.setTheme('dungeon-master');
        }, 100);
    }
}

// ========== SCHEMA VISUALIZATION ==========
let schemaVizState = {
    svg: null,
    zoom: null,
    simulation: null
};

function parseSchemaForViz(schema) {
    const nodes = [];
    const links = [];

    // Parse events
    if (schema.events && Array.isArray(schema.events)) {
        schema.events.forEach((evt, idx) => {
            const propKeys = evt.properties ? Object.keys(evt.properties) : [];
            nodes.push({
                id: `event-${idx}`,
                label: evt.event || 'Unnamed Event',
                type: 'event',
                weight: evt.weight || 1,
                properties: propKeys,
                data: evt
            });
        });
    }

    // Parse funnels and create links
    if (schema.funnels && Array.isArray(schema.funnels)) {
        schema.funnels.forEach((funnel, fIdx) => {
            if (funnel.sequence && Array.isArray(funnel.sequence)) {
                funnel.sequence.forEach((eventName, seqIdx) => {
                    // Find corresponding event node
                    const eventNode = nodes.find(n => n.label === eventName);
                    if (eventNode && seqIdx < funnel.sequence.length - 1) {
                        const nextEventName = funnel.sequence[seqIdx + 1];
                        const nextNode = nodes.find(n => n.label === nextEventName);
                        if (nextNode) {
                            links.push({
                                source: eventNode.id,
                                target: nextNode.id,
                                type: 'funnel',
                                funnelIdx: fIdx
                            });
                        }
                    }
                });
            }
        });
    }

    // Add user props node
    if (schema.userProps && Object.keys(schema.userProps).length > 0) {
        nodes.push({
            id: 'user-props',
            label: 'User Props',
            type: 'userProps',
            properties: Object.keys(schema.userProps),
            data: schema.userProps
        });
    }

    // Add super props node
    if (schema.superProps && Object.keys(schema.superProps).length > 0) {
        nodes.push({
            id: 'super-props',
            label: 'Super Props',
            type: 'superProps',
            properties: Object.keys(schema.superProps),
            data: schema.superProps
        });
    }

    // Add group keys
    if (schema.groupKeys && Array.isArray(schema.groupKeys)) {
        schema.groupKeys.forEach((group, idx) => {
            const [key, count] = group;
            nodes.push({
                id: `group-${idx}`,
                label: key,
                type: 'group',
                count: count,
                data: group
            });
        });
    }

    // Add SCD props
    if (schema.scdProps && Object.keys(schema.scdProps).length > 0) {
        nodes.push({
            id: 'scd-props',
            label: 'SCD Props',
            type: 'scd',
            properties: Object.keys(schema.scdProps),
            data: schema.scdProps
        });
    }

    // Add lookup tables
    if (schema.lookupTables && Array.isArray(schema.lookupTables)) {
        schema.lookupTables.forEach((table, idx) => {
            nodes.push({
                id: `lookup-${idx}`,
                label: table.key || `Lookup ${idx}`,
                type: 'lookup',
                entries: table.entries,
                data: table
            });
        });
    }

    return { nodes, links };
}

function updateSchemaViz() {
    if (!editor) return;

    try {
        const schema = JSON.parse(editor.getValue());
        renderSchemaViz(schema);
    } catch (e) {
        // Invalid JSON, show empty state
        renderSchemaViz({});
    }
}

function renderSchemaViz(schema) {
    const container = document.getElementById('schemaViz');
    const emptyState = document.getElementById('schemaEmpty');

    if (!schema || Object.keys(schema).length === 0) {
        emptyState.classList.remove('hidden');
        container.innerHTML = '';
        return;
    }

    emptyState.classList.add('hidden');

    const { nodes, links } = parseSchemaForViz(schema);

    if (nodes.length === 0) {
        emptyState.classList.remove('hidden');
        return;
    }

    // Clear previous viz
    container.innerHTML = '';

    const width = container.clientWidth;
    const height = Math.max(600, nodes.length * 80);

    // Create SVG
    const svg = d3.select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', [0, 0, width, height])
        .style('background', 'var(--bg-primary)');

    // Add zoom behavior
    const g = svg.append('g');
    const zoom = d3.zoom()
        .scaleExtent([0.3, 3])
        .on('zoom', (event) => {
            g.attr('transform', event.transform);
        });

    svg.call(zoom);

    // Add arrow marker for funnel links
    svg.append('defs').append('marker')
        .attr('id', 'arrowhead')
        .attr('viewBox', '-0 -5 10 10')
        .attr('refX', 50)
        .attr('refY', 0)
        .attr('orient', 'auto')
        .attr('markerWidth', 12)
        .attr('markerHeight', 12)
        .append('path')
        .attr('d', 'M 0,-5 L 10,0 L 0,5')
        .attr('fill', getComputedStyle(document.documentElement).getPropertyValue('--accent').trim());

    // Color scale for different node types
    const colorScale = {
        event: getComputedStyle(document.documentElement).getPropertyValue('--accent').trim(),
        userProps: '#10b981',
        superProps: '#f59e0b',
        group: '#8b5cf6',
        scd: '#ec4899',
        lookup: '#06b6d4'
    };

    // Group nodes by type for better layout
    const eventNodes = nodes.filter(n => n.type === 'event');
    const metaNodes = nodes.filter(n => n.type !== 'event');

    // Create force simulation with stronger forces
    const simulation = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).id(d => d.id).distance(200).strength(0.5))
        .force('charge', d3.forceManyBody().strength(-800))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide().radius(80))
        .force('x', d3.forceX(d => d.type === 'event' ? width / 2 : width * 0.8).strength(0.1))
        .force('y', d3.forceY(height / 2).strength(0.1));

    // Create links with better visibility
    const link = g.append('g')
        .selectAll('path')
        .data(links)
        .join('path')
        .attr('class', d => d.type === 'funnel' ? 'link link-funnel' : 'link')
        .attr('stroke', d => d.type === 'funnel' ? colorScale.event : '#3a3a3a')
        .attr('stroke-width', d => d.type === 'funnel' ? 4 : 2)
        .attr('fill', 'none')
        .attr('opacity', 0.7)
        .attr('marker-end', d => d.type === 'funnel' ? 'url(#arrowhead)' : '');

    // Create nodes
    const node = g.append('g')
        .selectAll('g')
        .data(nodes)
        .join('g')
        .attr('class', 'node')
        .call(d3.drag()
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended));

    // Add larger circles with glow effect
    node.append('circle')
        .attr('class', 'node-circle')
        .attr('r', d => {
            if (d.type === 'event') return 30 + (d.weight || 1) * 3;
            return 35;
        })
        .attr('fill', d => colorScale[d.type] || colorScale.event)
        .attr('stroke', d => d3.color(colorScale[d.type] || colorScale.event).brighter(0.5))
        .attr('stroke-width', 3)
        .style('filter', 'drop-shadow(0 0 8px rgba(120, 86, 255, 0.5))');

    // Add larger, more readable labels
    node.append('text')
        .attr('class', 'node-label')
        .attr('dy', -45)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .style('font-weight', '600')
        .style('fill', '#f5f5f5')
        .style('text-shadow', '0 0 4px rgba(0, 0, 0, 0.8)')
        .text(d => d.label);

    // Add sublabels with better positioning
    node.append('text')
        .attr('class', 'node-sublabel')
        .attr('dy', 50)
        .attr('text-anchor', 'middle')
        .style('font-size', '11px')
        .style('fill', '#a3a3a3')
        .style('text-shadow', '0 0 3px rgba(0, 0, 0, 0.8)')
        .text(d => {
            if (d.properties) return `${d.properties.length} props`;
            if (d.count) return `${d.count} items`;
            if (d.entries) return `${d.entries} entries`;
            return '';
        });

    // Enhanced tooltip
    const tooltip = d3.select('body').append('div')
        .attr('class', 'tooltip')
        .style('position', 'absolute');

    node.on('mouseover', function(event, d) {
        d3.select(this).select('circle')
            .transition()
            .duration(200)
            .attr('r', (d.type === 'event' ? 30 + (d.weight || 1) * 3 : 35) * 1.2)
            .attr('stroke-width', 5);

        tooltip.classed('visible', true)
            .html(`
                <div class="tooltip-title">${d.label}</div>
                <div class="tooltip-content">
                    <strong>Type:</strong> ${d.type}<br>
                    ${d.type === 'event' ? `<strong>Weight:</strong> ${d.weight || 1}<br>` : ''}
                    ${d.properties ? `<strong>Properties:</strong> ${d.properties.join(', ')}` : ''}
                    ${d.count ? `<strong>Count:</strong> ${d.count}` : ''}
                    ${d.entries ? `<strong>Entries:</strong> ${d.entries}` : ''}
                </div>
            `)
            .style('left', (event.pageX + 15) + 'px')
            .style('top', (event.pageY + 15) + 'px');
    })
    .on('mouseout', function(event, d) {
        d3.select(this).select('circle')
            .transition()
            .duration(200)
            .attr('r', d.type === 'event' ? 30 + (d.weight || 1) * 3 : 35)
            .attr('stroke-width', 3);

        tooltip.classed('visible', false);
    });

    // Update positions on simulation tick
    simulation.on('tick', () => {
        link.attr('d', d => {
            const dx = d.target.x - d.source.x;
            const dy = d.target.y - d.source.y;
            const dr = Math.sqrt(dx * dx + dy * dy);
            return `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;
        });

        node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    // Store state for controls
    schemaVizState = { svg, zoom, simulation };

    // Auto-fit view after simulation settles
    setTimeout(() => {
        const bounds = g.node().getBBox();
        const fullWidth = bounds.width;
        const fullHeight = bounds.height;
        const midX = bounds.x + fullWidth / 2;
        const midY = bounds.y + fullHeight / 2;

        const scale = 0.85 / Math.max(fullWidth / width, fullHeight / height);
        const translate = [width / 2 - scale * midX, height / 2 - scale * midY];

        svg.transition().duration(1000).call(
            zoom.transform,
            d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
        );
    }, 2000);

    // Setup controls
    document.getElementById('resetZoomBtn').onclick = () => {
        svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
    };

    document.getElementById('fitViewBtn').onclick = () => {
        const bounds = g.node().getBBox();
        const fullWidth = bounds.width;
        const fullHeight = bounds.height;
        const midX = bounds.x + fullWidth / 2;
        const midY = bounds.y + fullHeight / 2;

        const scale = 0.85 / Math.max(fullWidth / width, fullHeight / height);
        const translate = [width / 2 - scale * midX, height / 2 - scale * midY];

        svg.transition().duration(750).call(
            zoom.transform,
            d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
        );
    };
}

// ========== INITIALIZATION ==========
window.addEventListener('load', () => {
    initMonaco();
    setDefaultConfig();
    initSliders();
    initToggles();
    initTextInputs();
    initCollapsibleSections();

    // Dice easter egg
    const diceEmoji = document.getElementById('diceEmoji');
    if (diceEmoji) {
        diceEmoji.addEventListener('click', reRollColors);
    }

    // Hooks generation button
    const generateHooksBtn = document.getElementById('generateHooksBtn');
    if (generateHooksBtn) {
        generateHooksBtn.addEventListener('click', handleGenerateHooks);
    }

    // Save/Load buttons
    const saveBtn = document.getElementById('saveBtn');
    const loadBtn = document.getElementById('loadBtn');
    const fileInput = document.getElementById('fileInput');

    if (saveBtn) {
        saveBtn.addEventListener('click', handleSave);
    }

    if (loadBtn) {
        loadBtn.addEventListener('click', handleLoad);
    }

    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                loadDungeonFromFile(file);
            }
        });
    }

    // Initialize schema viz with empty state
    renderSchemaViz({});

    // Hide hooks editor initially
    hideHooksEditor();
});
