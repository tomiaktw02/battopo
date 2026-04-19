// =========================================================
// Battopo - 虛擬寵物遊戲（分支進化版）
// =========================================================

(() => {
    'use strict';

    const IS_DEBUG = false; // [VERSION_FLAG] 控制偵錯指令是否可用

    // Debug helper
    window.onerror = function(msg, url, lineNo, columnNo, error) {
        const errorMsg = `❌ Error: ${msg} [${lineNo}:${columnNo}]`;
        if (typeof addMsg === 'function') {
            addMsg(errorMsg, 'error');
        } else {
            console.error(errorMsg);
        }
        return false;
    };

    // ---- Constants ----

    const MAX_HUNGER = 6;
    const MAX_HAPPY = 6;
    const MAX_POOP = 4;


    // Time intervals in milliseconds
    const HUNGER_DECAY_MS   = 4 * 60 * 60 * 1000;   // 4 hours
    const HAPPY_DECAY_MS    = 4 * 60 * 60 * 1000;    // 4 hours
    const POOP_INTERVAL_MS  = 5 * 60 * 60 * 1000;    // 5 hours
    const LEAVE_THRESHOLD_MS = 24 * 60 * 60 * 1000;  // 24 hours

    const SAVE_KEY = 'battopo_save';
    const DEX_KEY = 'battopo_dex';
    const FOOD_DEX_KEY = 'battopo_food_dex'; // NEW
    const PEST_DEX_KEY = 'battopo_pest_dex'; // NEW
    const HOF_KEY = 'battopo_hof';
    const SOUND_KEY = 'battopo_sound_mode'; // 0=off, 1=partial, 2=full
    const ACCENT_KEY = 'battopo_voice_accent'; // 'us' or 'uk'

    const LIFESPAN_MS = 4 * 24 * 60 * 60 * 1000; // 4 days (total 7 days from hatch)

    // ---- Evolution stage constants ----
    const STAGE_EGG = 0;
    const STAGE_BABY = 1;
    const STAGE_EVO1 = 2;
    const STAGE_EVO2 = 3;

    // ---- DOM refs ----
    const $ = id => document.getElementById(id);
    const petNameDisplay = $('pet-name-display');
    const hungerBar      = $('hunger-bar');
    const happyBar       = $('happy-bar');
    const evoTimer       = $('evolution-timer');
    const actionButtons  = $('action-buttons');
    const petSprite      = $('pet-sprite');
    const petSpriteWrapper = $('pet-sprite-wrapper');
    const poopArea       = $('poop-area');
    const emotionBubble  = $('emotion-bubble');
    const cmdInput       = $('command-input');
    const submitBtn      = $('submit-btn');
    const msgLog         = $('message-log');
    const rpsOverlay     = $('rps-overlay');
    const rpsResult      = $('rps-result');
    const leaveOverlay   = $('leave-overlay');
    const leaveMessage   = $('leave-message');

    const dexOverlay     = $('dex-overlay');
    const dexGrid        = $('dex-grid');
    const dexProgress    = $('dex-progress');
    const dexCloseBtn     = $('dex-close-btn');
    const dexTabs        = $('dex-tabs');

    const feedOverlay     = $('feed-overlay');
    const feedChoices     = $('feed-choices');

    const hofOverlay      = $('hof-overlay');
    const hofList         = $('hof-list');


    const langOverlay     = $('lang-overlay');


    const statsBar        = $('stats-bar');
    const spriteWrapper   = $('pet-sprite-wrapper');
    const cleanOverlay    = $('clean-overlay');
    const pestImg         = $('pest-img');
    const pestNameLocal   = $('pest-name-local');
    const pestNameEn      = $('pest-name-en');
    const pestDesc        = $('pest-desc');
    const battleOverlay   = $('battle-overlay');
    const oppSprite       = $('opponent-sprite');
    const oppNameTag      = $('opponent-name-tag');
    const playerSprite    = $('player-sprite');
    const playerNameTag   = $('player-name-tag');
    const actionPanel     = $('action-panel');
    const playerHPBar     = $('player-hp-bar');
    const oppHPBar        = $('opponent-hp-bar');
    const battleMsgText   = $('battle-msg-text');
    const projectileLayer = $('battle-projectile-layer');
    const mobileKeyboard  = $('mobile-keyboard');
    const globalTooltip   = $('global-tooltip');
    
    // Rename Modal DOM refs
    const renameOverlay    = $('rename-overlay');
    const renameInput      = $('rename-input');
    const renameConfirmBtn = $('rename-confirm-btn');
    const renameCancelBtn  = $('rename-cancel-btn');
    const pestImgWrapper   = $('pest-img-wrapper');

    // ---- Mobile Keyboard Logic ----
    function initMobileKeyboard() {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
                         || (window.matchMedia("(pointer: coarse)").matches)
                         || (window.innerWidth <= 600);

        if (!isMobile) return;

        // Enable mobile mode
        document.body.classList.add('mobile-mode');
        if (!mobileKeyboard) return;

        mobileKeyboard.classList.remove('hidden');
        cmdInput.setAttribute('inputmode', 'none');

        const rows = [
            'QWERTYUIOP',
            'ASDFGHJKL',
            'ZXCVBNM',
            ['CLEAR', 'SPACE', 'BACK'],
            ['SPACER']
        ];

        rows.forEach((row) => {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'kb-row';
            
            if (typeof row === 'string') {
                row.split('').forEach(char => {
                    const btn = document.createElement('div');
                    btn.className = 'kb-key';
                    btn.textContent = char;
                    btn.onclick = (e) => {
                        e.preventDefault();
                        insertChar(char.toLowerCase());
                    };
                    rowDiv.appendChild(btn);
                });
            } else {
                // Special row
                row.forEach(special => {
                    const btn = document.createElement('div');
                    if (special === 'SPACER') {
                        btn.className = 'kb-spacer';
                        btn.style.height = '30px'; // Physical height to push keys up
                        btn.style.flex = '10';
                        btn.style.pointerEvents = 'none'; // Non-interactive
                    } else {
                        btn.className = 'kb-key';
                        if (special === 'CLEAR') {
                            btn.classList.add('special');
                            btn.textContent = (typeof t === 'function' ? t('ui_kb_clear') : 'CLEAR');
                            btn.onclick = (e) => { 
                                e.preventDefault(); 
                                cmdInput.value = ''; 
                                cmdInput.focus(); 
                            };
                        } else if (special === 'SPACE') {
                            btn.classList.add('space');
                            btn.textContent = (typeof t === 'function' ? t('ui_kb_space') : 'SPACE');
                            btn.onclick = (e) => { e.preventDefault(); insertChar(' '); };
                        } else if (special === 'BACK') {
                            btn.classList.add('backspace');
                            btn.textContent = '⌫';
                            btn.onclick = (e) => {
                                e.preventDefault();
                                const start = cmdInput.selectionStart;
                                const end = cmdInput.selectionEnd;
                                const val = cmdInput.value;
                                if (start === end && start > 0) {
                                    cmdInput.value = val.slice(0, start - 1) + val.slice(end);
                                    cmdInput.selectionStart = cmdInput.selectionEnd = start - 1;
                                } else {
                                    cmdInput.value = val.slice(0, start) + val.slice(end);
                                    cmdInput.selectionStart = cmdInput.selectionEnd = start;
                                }
                                cmdInput.focus();
                            };
                        }
                    }
                    rowDiv.appendChild(btn);
                });
            }
            mobileKeyboard.appendChild(rowDiv);
        });
    }

    function insertChar(char) {
        const start = cmdInput.selectionStart;
        const end = cmdInput.selectionEnd;
        const val = cmdInput.value;
        cmdInput.value = val.slice(0, start) + char + val.slice(end);
        cmdInput.selectionStart = cmdInput.selectionEnd = start + char.length;
        cmdInput.focus();
    }

    // ---- Drag Scroll for Action Panel ----
    function initDragScroll() {
        if (!actionPanel) return;

        let isDown = false;
        let startY;
        let initialScrollTop;
        let moved = false;

        const startDrag = (clientY) => {
            isDown = true;
            actionPanel.classList.add('dragging');
            startY = clientY;
            initialScrollTop = actionPanel.scrollTop;
            moved = false;
            isPanelDragging = false;
            hideActionTooltip();
        };

        const stopDrag = () => {
            if (!isDown) return;
            isDown = false;
            actionPanel.classList.remove('dragging');
            if (moved) {
                setTimeout(() => { isPanelDragging = false; }, 50);
            } else {
                isPanelDragging = false;
            }
        };

        const onMove = (clientY) => {
            if (!isDown) return;
            const deltaY = clientY - startY;
            
            if (Math.abs(deltaY) > 5) {
                moved = true;
                isPanelDragging = true;
            }
            
            if (moved) {
                hideActionTooltip();
                actionPanel.scrollTop = initialScrollTop - deltaY;
            }
        };

        // Mouse events
        actionPanel.addEventListener('mousedown', (e) => {
            startDrag(e.clientY);
        });

        window.addEventListener('mouseup', stopDrag);
        
        window.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            onMove(e.clientY);
        });

        // Touch events
        actionPanel.addEventListener('touchstart', (e) => {
            startDrag(e.touches[0].clientY);
        }, { passive: true });

        window.addEventListener('touchend', stopDrag, { passive: true });

        window.addEventListener('touchmove', (e) => {
            if (!isDown) return;
            onMove(e.touches[0].clientY);
        }, { passive: false });
    }

    // Make sure we initialize UI language once DOM is ready
    document.addEventListener('DOMContentLoaded', () => {
        updateLanguageUI();
        initMobileKeyboard();
        initDragScroll();
        // Initialize status icons (sound & accent)
        renderStatusIcons();
        initStaticSoundIndicators();
        // Bind tooltip hover events once (not re-bound on every renderStatusIcons call)
        initStatusIconTooltips();
        
        // Global tap-outside: dismiss tooltips on mobile ONLY when tapping completely outside
        // (excludes interactive buttons, input areas, keyboard, and the tooltip itself)
        document.addEventListener('touchstart', (e) => {
            if (!isTouchCapable) return;
            const safeSelectors = [
                '.action-btn',
                '.dex-tab',
                '#sound-mode-btn',
                '#accent-mode-btn',
                '#lang-btn-display',
                '#input-area',         // entire bottom input zone
                '#command-input',      // command text input
                '#mobile-keyboard',    // on-screen keyboard
                '#global-tooltip',     // the tooltip itself
                '.action-tooltip',     // the action tooltip panel
            ].join(', ');
            if (!e.target.closest(safeSelectors)) {
                hideActionTooltip();
                hideGlobalTooltip();
            }
        }, { passive: true });
    });

    // ---- Sound Mode (0=off, 1=partial, 2=full) ----
    // Partial mode: only feed food names, rps choices, and pest names are spoken
    // Stored in localStorage independently from game state so it persists across resets
    function getSoundMode() {
        const val = localStorage.getItem(SOUND_KEY);
        if (val === null) return 2; // default: full on first play
        return parseInt(val, 10);
    }

    function setSoundMode(mode) {
        localStorage.setItem(SOUND_KEY, String(mode));
        renderStatusIcons();
    }

    function getVoiceAccent() {
        return localStorage.getItem(ACCENT_KEY) || 'us';
    }

    function setVoiceAccent(accent) {
        localStorage.setItem(ACCENT_KEY, accent);
        renderStatusIcons();
    }

    function renderStatusIcons() {
        // Render Sound Icon
        const soundBtn = document.getElementById('sound-mode-btn');
        if (soundBtn) {
            const mode = getSoundMode();
            const icons  = ['🔇', '🔉', '🔊'];
            const labels = ['off', 'partial', 'on'];
            soundBtn.querySelector('.sound-icon').textContent = icons[mode];
            soundBtn.querySelector('.sound-label').textContent = labels[mode];
            soundBtn.dataset.soundMode = mode;
            
            // Tooltip handled by global system (see below)
        }

        // Render Accent Icon
        const accentBtn = document.getElementById('accent-mode-btn');
        if (accentBtn) {
            const accent = getVoiceAccent();
            accentBtn.querySelector('.accent-label').textContent = accent.toUpperCase();
            accentBtn.dataset.accent = accent;
        }
        
        // Update all mini-indicators on the screen
        updateAllSoundIndicators();
    }

    function initStatusIconTooltips() {
        const soundBtn = document.getElementById('sound-mode-btn');
        const accentBtn = document.getElementById('accent-mode-btn');
        const langBtn = document.getElementById('lang-btn-display');

        const bindTooltip = (el, title, desc) => {
            if (!el) return;
            el.onclick = () => {
                if (isTouchCapable) {
                    showActionTooltip(el, title, desc);
                } else {
                    hideActionTooltip();
                }
            };
            el.onmouseenter = () => {
                if (isTouchCapable) return;
                showActionTooltip(el, title, desc);
            };
            el.onmouseleave = () => {
                if (isTouchCapable) return;
                hideActionTooltip();
            };
        };

        // Re-bind whenever called (lang/accent may update text)
        const rebind = () => {
            bindTooltip(soundBtn, t('ui_sound_title'), t('ui_sound_tooltip'));
            bindTooltip(accentBtn, t('ui_accent_title'), t('ui_accent_tooltip'));
            bindTooltip(langBtn, t('ui_lang_title'), t('ui_lang_tooltip'));
        };
        rebind();
        // Expose so renderStatusIcons can re-call if language changes
        initStatusIconTooltips._rebind = rebind;
    }

    // ---- Speech Synthesis ----
    // type: 'feed' | 'rps' | 'pest' | 'other'
    // In partial mode (1), only feed/rps/pest types are spoken
    function speakCommand(text, type) {
        const mode = getSoundMode();
        if (mode === 0) return; // fully muted
        if (mode === 1) {
            // Allow only key interaction types
            if (type !== 'feed' && type !== 'rps' && type !== 'pest') return;
        }
        if (!window.speechSynthesis) return;
        // Cancel any ongoing speech to avoid queueing up too many commands
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Accent switch
        const accent = getVoiceAccent();
        utterance.lang = (accent === 'uk') ? 'en-GB' : 'en-US';
        
        utterance.rate = 1.0;
        window.speechSynthesis.speak(utterance);
    }

    // ---- Sound Indicators ----
    // type: 'feed' | 'rps' | 'pest' | 'other'
    function getSoundMiniIcon(type) {
        const mode = getSoundMode();
        if (mode === 0) return '🔇';
        if (mode === 1) {
            if (type === 'feed' || type === 'rps' || type === 'pest') return '🔉';
            return '🔇';
        }
        return '🔊';
    }

    function injectSoundIndicator(parent, type) {
        if (!parent) return;
        // Check if already has indicator
        let indicator = parent.querySelector('.sound-indicator');
        if (!indicator) {
            indicator = document.createElement('span');
            indicator.className = 'sound-indicator';
            parent.appendChild(indicator);
        }
        indicator.textContent = getSoundMiniIcon(type);
        indicator.dataset.speechType = type;
    }

    function updateAllSoundIndicators() {
        document.querySelectorAll('.sound-indicator').forEach(el => {
            const type = el.dataset.speechType;
            el.textContent = getSoundMiniIcon(type);
        });
    }

    function initStaticSoundIndicators() {
        // RPS
        document.querySelectorAll('.rps-choice').forEach(btn => injectSoundIndicator(btn, 'rps'));
        // Lang
        document.querySelectorAll('.lang-choice').forEach(btn => injectSoundIndicator(btn, 'other'));
        // Modals Back
        injectSoundIndicator($('dex-back-btn'), 'other');
        injectSoundIndicator($('hof-close-btn'), 'other');
        injectSoundIndicator($('lang-back-btn'), 'other');
        injectSoundIndicator($('feed-back-btn'), 'other');
        injectSoundIndicator($('clean-back-btn'), 'other');
        // Pest
        if (pestImgWrapper) injectSoundIndicator(pestImgWrapper, 'pest');
    }


    // ---- Game State ----
    let isPanelDragging = false; 
    let isTouchCapable = 'ontouchstart' in window || 
                         navigator.maxTouchPoints > 0 || 
                         window.matchMedia("(pointer: coarse)").matches;
    let state = null;
    let cachedFormInfo = null; // Performance optimization: cache for current species info
    let _formLookupMap = null; // O(1) form lookup map, built lazily from EVOLUTION_CONFIG

    function updateFormCache() {
        if (!state || !state.currentFormId) {
            cachedFormInfo = null;
            return;
        }
        cachedFormInfo = getFormInfo(state.currentFormId);
    }

    function defaultState() {
        const now = Date.now();
        return {
            stage: STAGE_EGG,       // 0=egg, 1=baby, 2=evo1, 3=evo2
            knockCount: 0,
            hunger: MAX_HUNGER,
            happy: MAX_HAPPY,
            poopCount: 0,
            hatchedAt: null,
            evolvedAt: null,
            lastHungerDecay: now,
            lastHappyDecay: now,
            lastPoopTime: now,
            hungerZeroSince: null,
            happyZeroSince: null,
            poopDirtySince: null,
            isRps: false,
            isFeedMode: false,
            isLangMode: false,
            isRenaming: false,
            left: false,
            dead: false,
            diedAt: null,
            customName: null,
            // New evolution fields
            feedCount: { red: 0, orange: 0, light: 0, dark: 0, green: 0 },
            feedOptions: null,       // 當前餵食介面呈現的 5 個食物
            currentFormId: null,     // id from EVOLUTION_CONFIG (e.g. 'baby', 'fire_rat', 'blast_rat')
            evolutionPathId: null,   // stage1 form id (for determining stage2 candidates)
            stats: null,             // current stats {hp, atk, def, spd}
            maxHP: 0,
            battleDebug: false,      // toggles detailed battle logs
            wins: 0,                 // total wins
            totalBattles: 0,         // total battle count
            isHofMode: false,        // tracked for "back" command
            isDexMode: false,        // tracked for "back" command
            isCleaningMode: false,   // NEW: tracking if cleaning mini-game is active
            currentPest: null,       // NEW: current pest to identify
            accent: 'us',            // NEW: voice accent selection
            collectionTab: 0,        // NEW: 0=bestiary, 1=food, 2=pests
        };
    }

    // ---- Helper: Build O(1) form lookup map from EVOLUTION_CONFIG (called lazily) ----
    function buildFormLookup() {
        _formLookupMap = new Map();
        const add = (f) => { if (f) _formLookupMap.set(f.id, f); };
        add(EVOLUTION_CONFIG.baby);
        if (EVOLUTION_CONFIG.baby_black) add(EVOLUTION_CONFIG.baby_black);
        for (const f of EVOLUTION_CONFIG.stage1) add(f);
        if (EVOLUTION_CONFIG.stage1_black) {
            for (const f of EVOLUTION_CONFIG.stage1_black) add(f);
        }
        for (const key in EVOLUTION_CONFIG.stage2) {
            for (const f of EVOLUTION_CONFIG.stage2[key]) add(f);
        }
    }

    // ---- Helper: Get form info from EVOLUTION_CONFIG ----
    function getFormInfo(formId) {
        if (!formId) return null;
        // Lazy-build the lookup map on first access (O(1) thereafter)
        if (!_formLookupMap) buildFormLookup();

        const originalForm = _formLookupMap.get(formId);
        if (!originalForm) return null;

        // Clone to avoid mutating original config
        let form = { ...originalForm };
        if (typeof t === 'function') {
            form.name = t('pet_' + form.id) || form.name;
            form.description = t('pet_desc_' + form.id) || form.description;
        }

        // Resolve ability
        if (typeof form.ability === 'string') {
            const ab = ABILITY_CONFIG[form.ability];
            if (ab) {
                let abClone = { ...ab };
                if (typeof t === 'function') {
                    // 使用新的 nameKey 與 descKey
                    abClone.name = t(ab.nameKey) || ab.nameKey;
                    abClone.description = t(ab.descKey) || ab.descKey;
                }
                form.ability = abClone;
            }
        }
        return form;
    }

    // ---- Helper: Get descriptive text for stats ----
    function getStatDesc(type, val) {
        if (type === 'hunger') {
            const descs = [
                { text: t('stat_hunger_0'), class: 'stat-danger' },
                { text: t('stat_hunger_1'), class: 'stat-bad' },
                { text: t('stat_hunger_2'), class: 'stat-bad' },
                { text: t('stat_hunger_3'), class: 'stat-mid' },
                { text: t('stat_hunger_4'), class: 'stat-good' },
                { text: t('stat_hunger_5'), class: 'stat-good' },
                { text: t('stat_hunger_6'), class: 'stat-excellent' }
            ];
            return descs[val] || descs[0];
        } else if (type === 'happy') {
            const descs = [
                { text: t('stat_happy_0'), class: 'stat-danger' },
                { text: t('stat_happy_1'), class: 'stat-bad' },
                { text: t('stat_happy_2'), class: 'stat-mid' },
                { text: t('stat_happy_3'), class: 'stat-mid' },
                { text: t('stat_happy_4'), class: 'stat-good' },
                { text: t('stat_happy_5'), class: 'stat-good' },
                { text: t('stat_happy_6'), class: 'stat-excellent' }
            ];
            return descs[val] || descs[0];
        } else if (type === 'poop') {
            const descs = [
                { text: t('stat_poop_0'), class: 'stat-good' },
                { text: t('stat_poop_1'), class: 'stat-mid' },
                { text: t('stat_poop_2'), class: 'stat-bad' },
                { text: t('stat_poop_3'), class: 'stat-danger' },
                { text: t('stat_poop_4'), class: 'stat-danger' }
            ];
            return descs[val] || descs[4];
        }
        return { text: t('ui_unknown'), class: '' };
    }

    // ---- Build complete pet list from config for dex ----
    function getAllPetForms() {
        const forms = [];
        
        // Use getFormInfo to ensure everything is resolved and translated
        // Babies
        const babyInfo = getFormInfo(EVOLUTION_CONFIG.baby.id);
        if (babyInfo) forms.push({ ...babyInfo, stage: 'baby' });
        
        if (EVOLUTION_CONFIG.baby_black) {
            const babyBlackInfo = getFormInfo(EVOLUTION_CONFIG.baby_black.id);
            if (babyBlackInfo) forms.push({ ...babyBlackInfo, stage: 'baby' });
        }

        // Stage 1 (White)
        if (EVOLUTION_CONFIG.stage1) {
            for (const f of EVOLUTION_CONFIG.stage1) {
                const info = getFormInfo(f.id);
                if (info) forms.push({ ...info, stage: 'stage1' });
            }
        }
        // Stage 1 (Black)
        if (EVOLUTION_CONFIG.stage1_black) {
            for (const f of EVOLUTION_CONFIG.stage1_black) {
                const info = getFormInfo(f.id);
                if (info) forms.push({ ...info, stage: 'stage1' });
            }
        }

        // Stage 2
        if (EVOLUTION_CONFIG.stage2) {
            for (const key in EVOLUTION_CONFIG.stage2) {
                for (const f of EVOLUTION_CONFIG.stage2[key]) {
                    const info = getFormInfo(f.id);
                    if (info) forms.push({ ...info, stage: 'stage2', parentId: key });
                }
            }
        }
        return forms;
    }

    // ---- Dex (Pokédex) System ----
    // Stored separately from game save — persists across resets
    function loadDex() {
        const raw = localStorage.getItem(DEX_KEY);
        if (raw) {
            try { return JSON.parse(raw); } catch { return {}; }
        }
        return {};
    }

    function saveDex(dex) {
        localStorage.setItem(DEX_KEY, JSON.stringify(dex));
    }

    function registerToDex(formId) {
        if (!formId) return;
        const dex = loadDex();
        if (dex[formId]) return; // already registered
        const formInfo = getFormInfo(formId);
        if (!formInfo) return;
        dex[formId] = {
            id: formId,
            name: formInfo.name,
            emoji: formInfo.emoji,
            unlockedAt: Date.now()
        };
        saveDex(dex);
        addMsg(t('msg_dex_new') + `${formInfo.emoji} ${formInfo.name}！`, 'success');
    }

    // ---- Food Dex System ----
    function loadFoodDex() {
        const raw = localStorage.getItem(FOOD_DEX_KEY);
        if (raw) {
            try { return JSON.parse(raw); } catch { return {}; }
        }
        return {};
    }

    function saveFoodDex(dex) {
        localStorage.setItem(FOOD_DEX_KEY, JSON.stringify(dex));
    }

    function registerFoodToDex(foodId) {
        if (!foodId) return;
        const dex = loadFoodDex();
        if (dex[foodId]) return;
        dex[foodId] = { id: foodId, unlockedAt: Date.now() };
        saveFoodDex(dex);
        // We don't necessarily need a msg here as it might be too spammy,
        // but the user might want one. The plan didn't specify.
    }

    // ---- Pest Dex System ----
    function loadPestDex() {
        const raw = localStorage.getItem(PEST_DEX_KEY);
        if (raw) {
            try { return JSON.parse(raw); } catch { return {}; }
        }
        return {};
    }

    function savePestDex(dex) {
        localStorage.setItem(PEST_DEX_KEY, JSON.stringify(dex));
    }

    function registerPestToDex(pestId) {
        if (!pestId) return;
        const dex = loadPestDex();
        if (dex[pestId]) return;
        dex[pestId] = { id: pestId, unlockedAt: Date.now() };
        savePestDex(dex);
    }

    function openDex() {
        openCollection(0);
    }

    function openCollection(tabIndex = 0) {
        state.collectionTab = tabIndex;
        state.isDexMode = true;
        dexOverlay.classList.remove('hidden');

        // Tab speak commands: clicking a tab reads the command aloud (does NOT switch tabs)
        const tabs = dexTabs.querySelectorAll('.dex-tab');
        const tabCmds = ['bestiary', 'foods', 'bugs'];
        const tabLabels = ['BESTIARY', 'FOODS', 'BUGS'];
        const tabDescKeys = ['ui_tab_bestiary_desc', 'ui_tab_food_desc', 'ui_tab_bugs_desc'];

        tabs.forEach((tab, index) => {
            tab.classList.toggle('active', index === tabIndex);

            const label = tabLabels[index];
            const desc = t(tabDescKeys[index]);

            // Tooltip: touch = show on click; PC = show on hover
            tab.onclick = () => {
                speakCommand(tabCmds[index], 'other');
                if (isTouchCapable) {
                    showActionTooltip(tab, label, desc);
                } else {
                    hideActionTooltip();
                }
            };
            tab.onmouseenter = () => {
                if (isTouchCapable) return;
                showActionTooltip(tab, label, desc);
            };
            tab.onmouseleave = () => {
                if (isTouchCapable) return;
                hideActionTooltip();
            };

            // Sound indicator on each tab button
            injectSoundIndicator(tab, 'other');
        });

        if (tabIndex === 0) renderPetCollection();
        else if (tabIndex === 1) renderFoodCollection();
        else if (tabIndex === 2) renderPestCollection();
    }

    function renderPetCollection() {
        const dex = loadDex();
        const allForms = getAllPetForms();
        const total = allForms.length;
        const unlocked = allForms.filter(f => dex[f.id]).length;

        let progressHtml = t('ui_collection_progress');
        progressHtml = progressHtml.replace('{0}', `<span class="dex-count">${unlocked}</span>`);
        progressHtml = progressHtml.replace('{1}', `<span class="dex-count">${total}</span>`);
        dexProgress.innerHTML = progressHtml;

        dexGrid.innerHTML = '';
        const stages = [
            { key: 'baby', label: t('ui_stage_baby'), cssClass: 'stage-baby' },
            { key: 'stage1', label: t('ui_stage_1'), cssClass: 'stage-1' },
            { key: 'stage2', label: t('ui_stage_2'), cssClass: 'stage-2' },
        ];

        for (const stageInfo of stages) {
            const stageForms = allForms.filter(f => f.stage === stageInfo.key);
            if (stageForms.length === 0) continue;

            const label = document.createElement('div');
            label.className = `dex-stage-label ${stageInfo.cssClass}`;
            label.textContent = stageInfo.label;
            dexGrid.appendChild(label);

            for (const form of stageForms) {
                const isUnlocked = !!dex[form.id];
                const card = document.createElement('div');
                card.className = `dex-card ${isUnlocked ? 'unlocked' : 'locked'}`;

                if (form.img) {
                    card.innerHTML = `
                        <img class="dex-card-img ${isUnlocked ? '' : 'silhouette'}" src="${form.img}" alt="${form.name}">
                        <span class="dex-card-name">${isUnlocked ? form.name : '???'}</span>
                    `;
                } else {
                    card.innerHTML = `
                        <span class="dex-card-emoji">${isUnlocked ? form.emoji : '❓'}</span>
                        <span class="dex-card-name">${isUnlocked ? form.name : '???'}</span>
                    `;
                }

                if (isUnlocked) {
                    card.onmouseenter = () => showActionTooltip(card, `${form.emoji} ${form.name}`, form.description || '');
                    card.onmouseleave = () => hideActionTooltip();
                }
                dexGrid.appendChild(card);
            }
        }
    }

    function renderFoodCollection() {
        const foodDex = loadFoodDex();
        const categories = ['red', 'orange', 'light', 'dark', 'green'];
        let total = 0;
        let unlocked = 0;
        
        dexGrid.innerHTML = '';

        categories.forEach(cat => {
            const foods = FOOD_DATA[cat];
            total += foods.length;

            const label = document.createElement('div');
            label.className = `dex-stage-label`;
            label.textContent = t('food_cat_' + cat);
            dexGrid.appendChild(label);

            foods.forEach(food => {
                const isDiscovered = !!foodDex[food.id];
                if (isDiscovered) unlocked++;

                const card = document.createElement('div');
                card.className = `dex-card ${isDiscovered ? 'unlocked' : 'locked'}`;
                
                // Get English name based on accent
                const accent = getVoiceAccent();
                let enName = tEn('food_' + food.id);
                if (accent === 'uk' && LANGUAGES['en'] && LANGUAGES['en']['food_' + food.id + '_uk']) {
                    enName = LANGUAGES['en']['food_' + food.id + '_uk'];
                }

                card.innerHTML = `
                    <img class="dex-card-img ${isDiscovered ? '' : 'silhouette'}" src="${food.img}" alt="${food.id}">
                    <div class="collection-name-group">
                        <span class="dex-card-name">${isDiscovered ? t('food_' + food.id) : '???'}</span>
                        ${isDiscovered ? `<span class="collection-name-en">${enName}</span>` : ''}
                    </div>
                `;
                
                if (isDiscovered) {
                    card.style.cursor = 'pointer';
                    card.onclick = () => speakCommand(enName, 'feed');
                    injectSoundIndicator(card, 'feed');
                }
                
                dexGrid.appendChild(card);
            });
        });

        dexProgress.innerHTML = `${t('ui_collection_progress').replace('{0}', `<span class="dex-count">${unlocked}</span>`).replace('{1}', `<span class="dex-count">${total}</span>`)}`;
    }

    function renderPestCollection() {
        const pestDex = loadPestDex();
        const allPests = PEST_CONFIG;
        const total = allPests.length;
        const unlocked = allPests.filter(p => pestDex[p.id]).length;

        dexProgress.innerHTML = `${t('ui_collection_progress').replace('{0}', `<span class="dex-count">${unlocked}</span>`).replace('{1}', `<span class="dex-count">${total}</span>`)}`;

        dexGrid.innerHTML = '';
        allPests.forEach(pest => {
            const isDiscovered = !!pestDex[pest.id];
            const card = document.createElement('div');
            card.className = `dex-card ${isDiscovered ? 'unlocked' : 'locked'}`;

            card.innerHTML = `
                <img class="dex-card-img ${isDiscovered ? '' : 'silhouette'}" src="${pest.img}" alt="${pest.id}">
                <div class="collection-name-group">
                    <span class="dex-card-name">${isDiscovered ? pest.names[currentLang] || pest.names['en'] : '???'}</span>
                    ${isDiscovered ? `<span class="collection-name-en">${pest.names['en']}</span>` : ''}
                </div>
            `;

            if (isDiscovered) {
                card.onmouseenter = () => showActionTooltip(card, '', pest.descriptions[currentLang] || pest.descriptions['en']);
                card.onmouseleave = () => hideActionTooltip();
                card.style.cursor = 'pointer';
                card.onclick = () => speakCommand(pest.names['en'], 'pest');
                injectSoundIndicator(card, 'pest');
            }

            dexGrid.appendChild(card);
        });
    }

    function closeDex() {
        dexOverlay.classList.add('hidden');
        state.isDexMode = false;
    }

    function openFeed() {
        if (battleState) {
            addMsg(t('msg_feed_cant_battle'), 'warning');
            return;
        }
        if (state.hunger >= MAX_HUNGER) {
            addMsg(t('msg_feed_full'), 'warning');
            return;
        }

        // Randomly pick one food from each category, but persistent if already picked
        if (!state.feedOptions || !Array.isArray(state.feedOptions) || state.feedOptions.length === 0) {
            const categories = ['red', 'orange', 'light', 'dark', 'green'];
            const selection = [];
            categories.forEach(cat => {
                const pool = FOOD_DATA[cat];
                if (pool && pool.length > 0) {
                    const pick = pool[Math.floor(Math.random() * pool.length)];
                    selection.push(pick);
                }
            });

            state.feedOptions = selection;
            save();
        }

        const selection = state.feedOptions;

        feedChoices.innerHTML = '';
        selection.forEach(food => {
            const btn = document.createElement('div');
            btn.className = 'feed-choice';
            
            const displayHTML = `<img src="${food.img}" class="feed-choice-img" alt="${food.id}">`;

            // Display food name in current language, but hint/speak in English/Accent
            const localizedTitle = t('food_' + food.id);
            const englishTitle = tEn('food_' + food.id);

            btn.innerHTML = `
                ${displayHTML}
                <span class="feed-choice-name">${localizedTitle}</span>
                <span class="feed-choice-cmd">${englishTitle.toLowerCase()}</span>
            `;
            injectSoundIndicator(btn, 'feed');
            btn.onclick = () => speakCommand(englishTitle, 'feed');
            feedChoices.appendChild(btn);
        });

        feedOverlay.classList.remove('hidden');
        state.isFeedMode = true;
        cmdInput.placeholder = t('ui_feed_placeholder');
        addMsg(t('msg_feed_prompt'), 'info');
        renderPoops();
    }

    function closeFeed() {
        state.isFeedMode = false;
        feedOverlay.classList.add('hidden');
        cmdInput.placeholder = t('ui_cmd_prompt');
        renderPoops();
    }

    function openLang() {
        langOverlay.classList.remove('hidden');
        state.isLangMode = true;
        cmdInput.placeholder = t('ui_lang_placeholder');
    }

    function closeLang() {
        langOverlay.classList.add('hidden');
        state.isLangMode = false;
        cmdInput.placeholder = t('ui_cmd_prompt');
    }

    // ---- Save / Load ----
    function save() {
        state.lastSaved = Date.now();
        localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    }

    function load() {
        const raw = localStorage.getItem(SAVE_KEY);
        if (raw) {
            try {
                state = JSON.parse(raw);
                ensureStateFields();
            } catch {
                state = defaultState();
            }
        } else {
            state = defaultState();
        }
        updateFormCache();
    }

    function ensureStateFields() {
        if (state.hungerZeroSince === undefined) state.hungerZeroSince = null;
        if (state.happyZeroSince === undefined) state.happyZeroSince = null;
        if (state.poopDirtySince === undefined) state.poopDirtySince = null;
        if (state.left === undefined) state.left = false;
        if (state.dead === undefined) state.dead = false;
        if (state.diedAt === undefined) state.diedAt = null;
        if (state.lastSaved === undefined) state.lastSaved = Date.now();
        if (state.customName === undefined) state.customName = null;
        // Force UI modes to false on load to avoid state mismatch with HTML/CSS
        state.isRps = false;
        state.isFeedMode = false;
        state.isLangMode = false;
        state.isRenaming = false;
        state.isHofMode = false;
        state.isDexMode = false;
        state.isCleaningMode = false;


        // Ensure persistent data fields exist
        if (state.feedCount === undefined) state.feedCount = { red: 0, orange: 0, light: 0, dark: 0, green: 0 };
        // Migrate old counts if necessary
        if (state.feedCount.apple !== undefined) {
            state.feedCount = {
                red: state.feedCount.apple || 0,
                orange: state.feedCount.orange || 0,
                light: state.feedCount.lemon || 0,
                dark: state.feedCount.grape || 0,
                green: state.feedCount.guava || 0
            };
        }
        if (state.feedOptions === undefined) state.feedOptions = null;
        if (state.currentFormId === undefined) state.currentFormId = null;
        if (state.evolutionPathId === undefined) state.evolutionPathId = null;
        if (state.battleDebug === undefined) state.battleDebug = false;
        if (state.wins === undefined) state.wins = 0;
        if (state.totalBattles === undefined) state.totalBattles = 0;
        if (!state.currentPest) state.currentPest = null;
        if (!state.accent) state.accent = 'us';
        if (state.collectionTab === undefined) state.collectionTab = 0;
        
        // If stats are missing, try to initialize them
        if (!state.stats && state.currentFormId) {
            const info = getFormInfo(state.currentFormId);
            if (info && info.stats) {
                state.stats = { ...info.stats };
                state.maxHP = info.stats.hp;
            }
        }
    }

    // Get display name for the pet
    function getPetName() {
        if (state.customName) return state.customName;
        if (state.stage === STAGE_EGG) return t('ui_egg');
        return cachedFormInfo ? cachedFormInfo.name : t('ui_unknown_pet');
    }

    // Get current emoji
    function getPetEmoji() {
        if (state.stage === STAGE_EGG) return '🥚';
        return cachedFormInfo ? cachedFormInfo.emoji : '⚪';
    }

    // Get current image path
    function getPetImg() {
        if (state.stage === STAGE_EGG) return 'images/pets/egg.png';
        return cachedFormInfo ? cachedFormInfo.img : 'images/pets/baby.png';
    }



    // ---- Time-based Updates ----
    function processTimePassage() {
        if (state.stage === STAGE_EGG || state.left) return;

        const now = Date.now();

        // Hunger decay
        const hungerTicks = Math.floor((now - state.lastHungerDecay) / HUNGER_DECAY_MS);
        if (hungerTicks > 0) {
            state.hunger = Math.max(0, state.hunger - hungerTicks);
            state.lastHungerDecay += hungerTicks * HUNGER_DECAY_MS;
        }

        // Happy decay
        const happyTicks = Math.floor((now - state.lastHappyDecay) / HAPPY_DECAY_MS);
        if (happyTicks > 0) {
            state.happy = Math.max(0, state.happy - happyTicks);
            state.lastHappyDecay += happyTicks * HAPPY_DECAY_MS;
        }

        // Poop generation
        const poopTicks = Math.floor((now - state.lastPoopTime) / POOP_INTERVAL_MS);
        if (poopTicks > 0) {
            state.poopCount = Math.min(MAX_POOP, state.poopCount + poopTicks);
            state.lastPoopTime += poopTicks * POOP_INTERVAL_MS;
        }

        // Track zero-states for leaving
        if (state.hunger === 0) {
            if (!state.hungerZeroSince) state.hungerZeroSince = now;
        } else {
            state.hungerZeroSince = null;
        }

        if (state.happy === 0) {
            if (!state.happyZeroSince) state.happyZeroSince = now;
        } else {
            state.happyZeroSince = null;
        }

        if (state.poopCount > 0) {
            if (!state.poopDirtySince) state.poopDirtySince = now;
        } else {
            state.poopDirtySince = null;
        }

        // Check leave conditions
        if (state.hungerZeroSince && (now - state.hungerZeroSince >= LEAVE_THRESHOLD_MS)) {
            triggerLeave('hunger');
            return;
        }
        if (state.happyZeroSince && (now - state.happyZeroSince >= LEAVE_THRESHOLD_MS)) {
            triggerLeave('happy');
            return;
        }
        if (state.poopDirtySince && (now - state.poopDirtySince >= LEAVE_THRESHOLD_MS)) {
            triggerLeave('poop');
            return;
        }

        // Check evolution / life span
        checkEvolution(now);

        save();
    }

    // ---- Evolution Logic ----
    function checkEvolution(now) {
        if (state.stage === STAGE_BABY && state.hatchedAt) {
            // Check stage1 evolution (baby -> evo1)
            const elapsed = now - state.hatchedAt;
            if (elapsed >= EVOLUTION_CONFIG.evo1Time) {
                const target = determineStage1Evolution();
                evolveToForm(STAGE_EVO1, target);
            }
        } else if (state.stage === STAGE_EVO1 && state.evolvedAt) {
            // Check stage2 evolution (evo1 -> evo2)
            const elapsed = now - state.evolvedAt;
            if (elapsed >= EVOLUTION_CONFIG.evo2Time) {
                const target = determineStage2Evolution();
                evolveToForm(STAGE_EVO2, target);
            }
        } else if (state.stage === STAGE_EVO2 && state.evolvedAt) {
            // Check lifespan (evo2 -> death)
            const elapsed = now - state.evolvedAt;
            if (elapsed >= LIFESPAN_MS) {
                triggerDeath();
            }
        }
    }

    function determineStage1Evolution() {
        const fc = state.feedCount;
        // Use different config list based on whether it's baby white or baby black
        const configs = (state.currentFormId === 'baby_black') 
            ? EVOLUTION_CONFIG.stage1_black 
            : EVOLUTION_CONFIG.stage1;

        // Pre-calculate max info for 'most_X' conditions to ensure equal probability on ties
        const maxCount = Math.max(...Object.values(fc));
        const maxFruits = maxCount > 0 ? Object.keys(fc).filter(k => fc[k] === maxCount) : [];

        for (let i = 0; i < configs.length; i++) {
            const cfg = configs[i];
            const cond = cfg.condition;

            // Special handling for 'most_X' to ensure equal probability on ties (1/N chance)
            if (cond.startsWith('most_')) {
                const fruitId = cond.replace('most_', '');
                if (maxFruits.includes(fruitId)) {
                    // Current fruit is one of the max. 
                    // Find all candidates in the current config list that are tied for the maximum
                    const tiedCandidates = configs.filter(c => {
                        if (!c.condition.startsWith('most_')) return false;
                        const fid = c.condition.replace('most_', '');
                        return maxFruits.includes(fid);
                    });
                    
                    if (tiedCandidates.length > 0) {
                        return tiedCandidates[Math.floor(Math.random() * tiedCandidates.length)];
                    }
                }
                // If this specific fruit is not among the max, skip and continue to next config
                continue;
            }

            if (evaluateStage1Condition(cond, fc)) {
                return cfg;
            }
        }

        // Fallback: last in list
        return configs[configs.length - 1];
    }

    function evaluateStage1Condition(condition, fc) {
        if (condition === 'default') return true;
        if (condition === 'hunger_low') {
            return state.hunger <= 0;
        }
        if (condition === 'dirty') {
            return state.poopCount >= MAX_POOP;
        }
        if (condition === 'balanced') {
            // All five feed counts must be exactly equal and each >= 1
            const vals = Object.values(fc);
            const first = vals[0];
            return first >= 1 && vals.every(v => v === first);
        }
        if (condition.startsWith('most_')) {
            // Simple check: is this fruit consumption at the maximum?
            // Note: randomization for ties is handled in determineStage1Evolution
            const fruitId = condition.replace('most_', '');
            const myCount = fc[fruitId] || 0;
            if (myCount <= 0) return false;
            const maxCount = Math.max(...Object.values(fc));
            return myCount === maxCount;
        }
        return false;
    }

    function determineStage2Evolution() {
        const pathId = state.evolutionPathId;
        const candidates = EVOLUTION_CONFIG.stage2[pathId];
        if (!candidates || candidates.length === 0) {
            // Fallback
            return EVOLUTION_CONFIG.stage1.find(c => c.id === pathId) || EVOLUTION_CONFIG.baby;
        }

        for (const cfg of candidates) {
            if (evaluateStage2Condition(cfg.condition)) {
                return cfg;
            }
        }
        // Absolute fallback: last candidate (should be 'default')
        return candidates[candidates.length - 1];
    }

    function evaluateStage2Condition(condition) {
        switch (condition) {
            case 'clean_low':
                return state.poopCount >= MAX_POOP;
            case 'clean_high':
                return state.poopCount === 0;
            case 'happy_high':
                return state.happy >= MAX_HAPPY;
            case 'happy_low':
                return state.happy <= 0;
            case 'hunger_low':
                return state.hunger <= 0;
            case 'happy_high_and_clean_high':
                return state.happy >= MAX_HAPPY && state.poopCount === 0;
            case 'default':
                return true;
            default:
                return false;
        }
    }

    function evolveToForm(toStage, targetForm) {
        const fromName = getPetName();
        const fromEmoji = getPetEmoji();

        state.stage = toStage;
        state.currentFormId = targetForm.id;
        state.evolvedAt = Date.now();

        if (toStage === STAGE_EVO1) {
            state.evolutionPathId = targetForm.id;
        }

        // Update stats
        if (targetForm.stats) {
            state.stats = { ...targetForm.stats };
            state.maxHP = targetForm.stats.hp;
        }

        // Keep custom name if set, otherwise it will use the new species name via getPetName()


        const targetName = getFormInfo(targetForm.id).name;
        addMsg(t('msg_dex_evolve', fromName, targetName), 'success');

        // Register to Pokédex
        registerToDex(targetForm.id);

        // Show completion on stage1 evolution
        if (toStage === STAGE_EVO1) {
            addMsg(t('msg_evo1_complete'), 'info');
        }

        petSprite.classList.add('evolve-flash');
        setTimeout(() => petSprite.classList.remove('evolve-flash'), 2000);
        showEmotion('🎉', 3000);
        updateFormCache();
        save();
        renderAll();
    }

    // ---- Leave ----
    function triggerLeave(reason) {
        state.left = true;
        save();

        const petName = getPetName();
        let reasonText = '';
        if (reason === 'hunger') {
            reasonText = t('msg_leave_hunger', petName);
        } else if (reason === 'happy') {
            reasonText = t('msg_leave_happy', petName);
        } else if (reason === 'poop') {
            reasonText = t('msg_leave_poop', petName);
        }

        leaveMessage.innerHTML = `
            <span class="leave-emoji">😢</span>
            <p>${reasonText}</p>
            <p style="margin-top:16px;color:var(--accent-warm);font-weight:700;">${t('msg_leave_prompt')}</p>
            <p style="margin-top:8px;color:var(--text-secondary);font-size:14px;">${t('msg_leave_cmd')}</p>
        `;
        leaveOverlay.classList.remove('hidden');
    }

    // ---- Death ----
    function triggerDeath() {
        if (state.dead) return;
        state.dead = true;
        state.diedAt = Date.now();
        
        const petName = getPetName();
        const formInfo = getFormInfo(state.currentFormId);
        const formName = formInfo ? formInfo.name : t('ui_unknown_pet');
        
        // Save to Hall of Fame
        registerToHof({
            name: petName,
            formId: state.currentFormId, // Store ID for dynamic translation
            formName: formName,          // Keep as fallback
            emoji: getPetEmoji(),
            diedAt: state.diedAt,
            wins: state.wins || 0,
            totalBattles: state.totalBattles || 0
        });

        save();

        leaveMessage.innerHTML = `
            <span class="leave-emoji">🪦</span>
            <p>${t('msg_death', petName)}</p>
            <p style="margin-top:4px;color:var(--text-muted);font-size:13px;">${t('msg_death_sub')}</p>
            <p style="margin-top:20px;color:var(--accent-warm);font-weight:700;">${t('msg_leave_prompt')}</p>
            <p style="margin-top:8px;color:var(--text-secondary);font-size:14px;">${t('msg_leave_cmd')}</p>
        `;
        leaveOverlay.classList.remove('hidden');
        renderAll();
    }

    // ---- Hall of Fame Logic ----
    function loadHof() {
        const raw = localStorage.getItem(HOF_KEY);
        if (raw) {
            try { return JSON.parse(raw); } catch { return []; }
        }
        return [];
    }

    function saveToHof(hof) {
        localStorage.setItem(HOF_KEY, JSON.stringify(hof));
    }

    function registerToHof(entry) {
        const hof = loadHof();
        // Add to beginning of array
        hof.unshift(entry);
        saveToHof(hof);
    }

    function openHof() {
        const hof = loadHof();
        hofList.innerHTML = '';

        if (hof.length === 0) {
            hofList.innerHTML = `<div style="text-align:center;color:var(--text-muted);margin-top:40px;">${t('msg_hof_empty')}</div>`;
        } else {
            const hofLocale = currentLang === 'zh-TW' ? 'zh-TW' : (currentLang === 'ja' ? 'ja-JP' : 'en-US');
            hof.forEach((entry, idx) => {
                const date = new Date(entry.diedAt).toLocaleString(hofLocale, {
                    year: 'numeric', month: '2-digit', day: '2-digit',
                    hour: '2-digit', minute: '2-digit'
                });
                const winRate = entry.totalBattles > 0 
                    ? ((entry.wins / entry.totalBattles) * 100).toFixed(1) 
                    : 0;
                
                // Get translated species name
                // If formId is missing (old save), fallback to stored formName
                let translatedFormName = entry.formName;
                if (entry.formId) {
                    const info = getFormInfo(entry.formId);
                    if (info) translatedFormName = info.name;
                }

                const item = document.createElement('div');
                item.className = 'hof-item';
                item.innerHTML = `
                    <div class="hof-rank">#${hof.length - idx}</div>
                    <div class="hof-info">
                        <div class="hof-name">${entry.name}</div>
                        <div class="hof-form">${entry.emoji} ${translatedFormName}</div>
                        ${entry.totalBattles > 0 ? `
                            <div class="hof-battle-stats">
                                ${t('msg_hof_stats', entry.wins, entry.totalBattles, winRate)}
                            </div>
                        ` : ''}
                    </div>
                    <div class="hof-date">${date}</div>
                `;
                hofList.appendChild(item);
            });
        }

        hofOverlay.classList.remove('hidden');
        state.isHofMode = true;
        cmdInput.placeholder = t('ui_hof_placeholder');
    }

    function closeHof() {
        state.isHofMode = false;
        hofOverlay.classList.add('hidden');
        cmdInput.placeholder = t('ui_cmd_prompt');
    }

    // ---- Render ----
    function renderAll() {
        renderName();
        renderStats();
        renderSprite();
        renderPoops();
        renderActions();
        renderEvoTimer();
    }

    function renderName() {
        if (state.stage === STAGE_EGG) {
            petNameDisplay.textContent = `🥚 ${t('ui_egg')}`;
        } else {
            const displayName = getPetName();
            const emoji = getPetEmoji();
            petNameDisplay.textContent = `${emoji} ${displayName}`;
        }
    }

    function renderStats() {
        if (state.stage === STAGE_EGG) {
            statsBar.style.display = 'none';
            return;
        }
        statsBar.style.display = '';

        // Lazy-init pre-built heart nodes to avoid innerHTML reflow on every tick
        if (hungerBar.children.length !== MAX_HUNGER) {
            hungerBar.innerHTML = '';
            for (let i = 0; i < MAX_HUNGER; i++) {
                hungerBar.appendChild(document.createElement('div'));
            }
        }
        if (happyBar.children.length !== MAX_HAPPY) {
            happyBar.innerHTML = '';
            for (let i = 0; i < MAX_HAPPY; i++) {
                happyBar.appendChild(document.createElement('div'));
            }
        }

        // Update classes only — no DOM rebuild, no reflow
        const hHearts = hungerBar.children;
        for (let i = 0; i < MAX_HUNGER; i++) {
            hHearts[i].className = `heart ${i < state.hunger ? 'filled' : 'empty'}`;
        }
        const haHearts = happyBar.children;
        for (let i = 0; i < MAX_HAPPY; i++) {
            haHearts[i].className = `heart ${i < state.happy ? 'happy-filled' : 'empty'}`;
        }
    }

    function renderSprite() {
        if (state.dead) {
            // Show tombstone
            petSprite.style.display = 'none';
            // We need a place for the floating tombstone if we want consistent styling
            // but let's just reuse petSprite's area by swapping src or using an emoji
            let wrapper = spriteWrapper;
            let tombstone = $('tombstone-display');
            if (!tombstone) {
                tombstone = document.createElement('div');
                tombstone.id = 'tombstone-display';
                tombstone.className = 'tombstone-emoji';
                tombstone.textContent = '🪦';
                wrapper.appendChild(tombstone);
            }
            tombstone.style.display = 'block';
            return;
        }

        // Hide tombstone if back to normal
        const tombstone = $('tombstone-display');
        if (tombstone) tombstone.style.display = 'none';
        petSprite.style.display = 'block';
        
        petSprite.src = getPetImg();
        petSprite.alt = getPetName();

        if (state.stage === STAGE_EGG) {
            petSprite.classList.remove('idle-bounce');
        } else {
            petSprite.classList.add('idle-bounce');
        }
    }

    function renderPoops() {
        if (state.stage === STAGE_EGG || state.isRps || state.isFeedMode) {
            if (poopArea.children.length > 0) poopArea.innerHTML = '';
            return;
        }
        if (poopArea.children.length === state.poopCount) return;

        poopArea.innerHTML = '';
        for (let i = 0; i < state.poopCount; i++) {
            const p = document.createElement('div');
            p.className = 'poop';
            p.textContent = '💩';
            p.style.animationDelay = `${i * 0.1}s`;
            poopArea.appendChild(p);
        }
    }

    let lastRenderedActionState = null;

    function renderActions() {
        const lang = localStorage.getItem('battopo_lang') || 'zh-tw';
        const currentStateKey = `stage:${state.stage}_left:${state.left}_dead:${state.dead}_battle:${!!battleState}_lang:${lang}`;
        
        if (lastRenderedActionState === currentStateKey) {
            return;
        }
        lastRenderedActionState = currentStateKey;

        actionButtons.innerHTML = '';
        if (battleState) {
            hideActionTooltip();
            return;
        }

        const systemActions = [
            { id: 'hof',  emoji: '🏆', label: 'HOF',  desc: t('ui_hof_desc'), speak: 'hall of fame' },
            { id: 'collection', emoji: '📖', label: 'COLLECTION', desc: t('ui_dex_desc'), speak: 'collection' },
        ];

        if (state.left || state.dead) {
            systemActions.forEach(a => addActionBtn(a));
            return;
        }

        const actions = (state.stage === STAGE_EGG)
            ? [{ id: 'knock', emoji: '👊', label: 'KNOCK', desc: t('ui_knock_desc') }]
            : (state.stage === STAGE_BABY)
                ? [
                    { id: 'feed',   emoji: '🍎', label: 'FEED',   desc: t('ui_feed_desc') },
                    { id: 'clean',  emoji: '🚿', label: 'CLEAN',  desc: t('ui_clean_desc') },
                    { id: 'play',   emoji: '✌️', label: 'PLAY',   desc: t('ui_play_desc') },
                    { id: 'rename', emoji: '✏️', label: 'RENAME', desc: t('ui_rename_desc') },
                ]
                : [
                    { id: 'feed',   emoji: '🍎', label: 'FEED',   desc: t('ui_feed_desc') },
                    { id: 'clean',  emoji: '🚿', label: 'CLEAN',  desc: t('ui_clean_desc') },
                    { id: 'play',   emoji: '✌️', label: 'PLAY',   desc: t('ui_play_desc') },
                    { id: 'battle', emoji: '⚔️', label: 'BATTLE', desc: t('ui_battle_desc') },
                    { id: 'rename', emoji: '✏️', label: 'RENAME', desc: t('ui_rename_desc') },
                ];

        // Combine breed actions and system actions
        [...actions, ...systemActions].forEach(a => addActionBtn(a));
    }

    function addActionBtn(a) {
        const btn = document.createElement('div');
        btn.className = 'action-btn';
        
        btn.onclick = () => {
            if (isPanelDragging) return;
            // Only speak, do not execute game command
            speakCommand(a.speak || a.id, 'other');
            
            // On touch devices, click shows the tooltip and it remains visible.
            // On non-touch (PC), click hides it for a cleaner UI.
            if (isTouchCapable) {
                showActionTooltip(btn, a.label, a.desc);
            } else {
                hideActionTooltip();
            }
        };
        
        btn.onmouseenter = () => {
            // Hover logic only for PC (mouse)
            if (isTouchCapable) return;
            if (isPanelDragging) return;
            showActionTooltip(btn, a.label, a.desc);
        };
        
        btn.onmouseleave = () => {
            // Mouse leave logic only for PC
            if (isTouchCapable) return;
            hideActionTooltip();
        };

        btn.innerHTML = `${a.emoji}`;
        injectSoundIndicator(btn, 'other');
        actionButtons.appendChild(btn);
    }

    function showActionTooltip(target, name, desc) {
        if (!globalTooltip) return;
        
        globalTooltip.innerHTML = `
            ${name ? `<span class="tooltip-name">${name}</span>` : ''}
            <span class="tooltip-desc">${desc}</span>
        `;
        
        const rect = target.getBoundingClientRect();
        const container = $('game-container');
        const containerRect = container.getBoundingClientRect();
        
        // Detect if target is in the header controls area
        const isHeader = !!target.closest('#header-controls');
        
        if (isHeader) {
            // "Below" positioning mode for top header icons
            // Added more offset (12px) to ensure no overlap
            let top = (rect.bottom - containerRect.top) + 12;
            let left = (rect.left - containerRect.left) + (rect.width / 2);
            
            globalTooltip.style.top = `${top}px`;
            globalTooltip.style.left = `${left}px`;
            // Force reset of translateY just in case CSS has it
            globalTooltip.style.transform = `translateX(-50%) translateY(0)`;
            
            // Boundary checks for the "below" mode
            requestAnimationFrame(() => {
                const ttRect = globalTooltip.getBoundingClientRect();
                let adjustedLeft = left;
                
                // Adjust if overflowing left edge
                if (ttRect.left < containerRect.left) {
                    adjustedLeft += (containerRect.left - ttRect.left) + 8;
                }
                // Adjust if overflowing right edge
                else if (ttRect.right > containerRect.right) {
                    adjustedLeft -= (ttRect.right - containerRect.right) + 8;
                }
                
                globalTooltip.style.left = `${adjustedLeft}px`;
            });

        } else {
            // Side positioning mode for sidebar action panel buttons
            let top = (rect.top - containerRect.top) + (rect.height / 2);
            const isRightSideOfScreen = (rect.left - containerRect.left) > (containerRect.width / 2);
            
            if (isRightSideOfScreen) {
                let leftPos = (rect.left - containerRect.left) - 8;
                globalTooltip.style.left = `${leftPos}px`;
                globalTooltip.style.transform = `translateY(-50%) translateX(-100%)`;
            } else {
                let leftPos = (rect.right - containerRect.left) + 8;
                globalTooltip.style.left = `${leftPos}px`;
                globalTooltip.style.transform = `translateY(-50%)`;
            }
            
            globalTooltip.style.top = `${top}px`;
            
            requestAnimationFrame(() => {
                const ttRect = globalTooltip.getBoundingClientRect();
                let adjustedTop = top;
                if (ttRect.top < containerRect.top) {
                    adjustedTop += (containerRect.top - ttRect.top) + 8;
                } else if (ttRect.bottom > containerRect.bottom) {
                    adjustedTop -= (ttRect.bottom - containerRect.bottom) + 8;
                }
                
                // Horizontal boundary check for side mode
                if (ttRect.left < containerRect.left) {
                    const overflow = containerRect.left - ttRect.left;
                    globalTooltip.style.left = `${parseFloat(globalTooltip.style.left) + overflow + 8}px`;
                } else if (ttRect.right > containerRect.right) {
                    const overflow = ttRect.right - containerRect.right;
                    globalTooltip.style.left = `${parseFloat(globalTooltip.style.left) - overflow - 8}px`;
                }
                globalTooltip.style.top = `${adjustedTop}px`;
            });
        }
        
        globalTooltip.classList.remove('hidden');
    }

    function hideActionTooltip() {
        if (globalTooltip) {
            globalTooltip.classList.add('hidden');
        }
    }

    // Generic Tooltip Helpers
    function showGlobalTooltip(text, event) {
        if (!globalTooltip) return;
        globalTooltip.innerHTML = `<span class="tooltip-desc">${text}</span>`;
        
        const containerRect = $('game-container').getBoundingClientRect();
        const mouseX = event.clientX - containerRect.left;
        const mouseY = event.clientY - containerRect.top;
        
        globalTooltip.style.left = `${mouseX}px`;
        globalTooltip.style.top = `${mouseY - 10}px`;
        globalTooltip.style.transform = `translate(-50%, -100%)`;
        globalTooltip.classList.remove('hidden');
    }

    function hideGlobalTooltip() {
        hideActionTooltip();
    }

    function renderEvoTimer() {
        if (state.stage === STAGE_EGG || state.left || state.dead) {
            evoTimer.textContent = '';
            return;
        }

        const now = Date.now();
        let remaining = 0;
        let nextDesc = '';

        if (state.stage === STAGE_BABY) {
            remaining = Math.max(0, EVOLUTION_CONFIG.evo1Time - (now - state.hatchedAt));
            nextDesc = t('ui_evo1_timer');
        } else if (state.stage === STAGE_EVO1) {
            remaining = Math.max(0, EVOLUTION_CONFIG.evo2Time - (now - state.evolvedAt));
            nextDesc = t('ui_evo2_timer');
        } else if (state.stage === STAGE_EVO2) {
            evoTimer.textContent = '';
            return;
        }

        if (remaining <= 0) {
            evoTimer.textContent = t('ui_evo_ready', nextDesc);
        } else {
            const days = Math.floor(remaining / (24*60*60*1000));
            const hrs  = Math.floor((remaining % (24*60*60*1000)) / (60*60*1000));
            const mins = Math.floor((remaining % (60*60*1000)) / (60*1000));
            
            if (days > 0) {
                evoTimer.textContent = t('ui_evo_time_d', nextDesc, days, hrs, mins);
            } else {
                evoTimer.textContent = t('ui_evo_time', nextDesc, hrs, mins);
            }
        }
    }

    // ---- Messages ----
    function addMsg(text, type = '') {
        const div = document.createElement('div');
        div.className = 'msg' + (type ? ' ' + type : '');
        div.textContent = text;
        msgLog.appendChild(div);
        msgLog.scrollTop = msgLog.scrollHeight;
        // Keep last 50 messages
        while (msgLog.children.length > 50) {
            msgLog.removeChild(msgLog.firstChild);
        }
    }

    // ---- Emotion Bubble ----
    function showEmotion(emoji, duration = 2000, targetParent = null) {
        // Use spriteWrapper as the default home for the bubble
        const originalParent = spriteWrapper;
        const parent = targetParent || originalParent;
        
        // Temporarily move the bubble to the target container (e.g., during battle)
        if (emotionBubble.parentElement !== parent) {
            parent.appendChild(emotionBubble);
        }

        emotionBubble.textContent = emoji;
        emotionBubble.classList.remove('hidden');
        emotionBubble.style.animation = 'none';
        void emotionBubble.offsetHeight;
        emotionBubble.style.animation = '';
        
        // Optional: Ensure it's centered if it was moved to a new parent
        if (targetParent) {
            emotionBubble.style.top = '-50px'; // Slightly higher if in battle container
        } else {
            emotionBubble.style.top = '-45px';
        }

        setTimeout(() => {
            emotionBubble.classList.add('hidden');
            // After hiding, move it back to its original home if it was moved
            if (targetParent && emotionBubble.parentElement !== originalParent) {
                originalParent.appendChild(emotionBubble);
            }
        }, duration);
    }

    // ---- Commands ----
    function handleCommand(raw) {
        // Hide persistent tooltips when a command is processed
        hideActionTooltip();
        
        const cmd = raw.trim().toLowerCase();
        if (!cmd) return;

        // System commands always available
        if (cmd === 'collection') { speakCommand('collection', 'other'); openCollection(0); return; }
        if (cmd === 'bestiary') { speakCommand('bestiary', 'other'); openCollection(0); return; }
        if (cmd === 'foods') { speakCommand('foods', 'other'); openCollection(1); return; }
        if (cmd === 'bugs') { speakCommand('bugs', 'other'); openCollection(2); return; }
        if (cmd === 'hof') { speakCommand('hall of fame', 'other'); openHof(); return; }
        if (cmd === 'language') { speakCommand('language', 'other'); openLang(); return; }

        if (cmd === 'full') { speakCommand('sound full', 'other'); setSoundMode(2); addMsg(t('msg_sound_set', 'FULL'), 'success'); return; }
        if (cmd === 'partial') { speakCommand('sound partial', 'other'); setSoundMode(1); addMsg(t('msg_sound_set', 'PARTIAL'), 'success'); return; }
        if (cmd === 'mute') { speakCommand('sound mute', 'other'); setSoundMode(0); addMsg(t('msg_sound_set', 'MUTE'), 'success'); return; }

        if (cmd === 'accent uk') { setVoiceAccent('uk'); speakCommand('accent UK', 'other'); addMsg(t('msg_accent_set', 'UK'), 'success'); return; }
        if (cmd === 'accent us') { setVoiceAccent('us'); speakCommand('accent US', 'other'); addMsg(t('msg_accent_set', 'US'), 'success'); return; }
        if (cmd === 'log_battle') {
            speakCommand('log battle', 'other');
            state.battleDebug = !state.battleDebug;
            addMsg(t('msg_battle_log_toggle', state.battleDebug ? t('ui_on') : t('ui_off')), 'info');
            save();
            return;
        }
        if (cmd === 'restart') { 
            if (state.left || state.dead) {
                speakCommand('restart', 'other');
                restart();
            } else {
                addMsg(t('msg_cmd_unknown'), 'warning');
            }
            return; 
        }


        // If in a modal mode, prioritize those handlers
        if (state.isRps) {
            if (cmd === 'close') {
                speakCommand('close', 'other');
                state.isRps = false;
                rpsOverlay.classList.add('hidden');
                cmdInput.placeholder = t('ui_cmd_prompt');
                return;
            }
            handleRPS(cmd);
            return;
        }
        if (state.isFeedMode) {
            if (cmd === 'close') { speakCommand('close', 'other'); closeFeed(); return; }
            handleFeedChoice(cmd);
            return;
        }
        if (state.isLangMode) {
            if (cmd === 'close') { speakCommand('close', 'other'); closeLang(); return; }
            if (['english', 'chinese', 'japanese'].includes(cmd)) {
                speakCommand(cmd, 'other');
                let code = cmd === 'english' ? 'en' : (cmd === 'chinese' ? 'zh-TW' : 'ja');
                switchLanguage(code);
                closeLang();
                updateFormCache();
                addMsg(t('msg_lang_set', cmd), 'success');
                // Re-render strings
                renderAll();
                return;
            }
            addMsg(t('msg_lang_invalid'), 'error');
            return;
        }
        if (state.isHofMode) {
            if (cmd === 'close') { speakCommand('close', 'other'); closeHof(); return; }
            // HOF has no other commands
            addMsg(t('msg_hof_invalid'), 'error');
            return;
        }
        if (state.isDexMode) {
            if (cmd === 'close') { speakCommand('close', 'other'); closeDex(); return; }
            addMsg(t('msg_dex_invalid', cmd), 'error');
            return;
        }
        if (state.isCleaningMode) {
            if (cmd === 'close') { speakCommand('close', 'other'); closeClean(); return; }
            handleCleaningInput(cmd);
            return;
        }


        // Debug commands
        if (IS_DEBUG) {
            if (cmd === 'debughunger') {
                speakCommand('debug hunger', 'other');
                if (state.stage === STAGE_EGG) { addMsg(t('msg_debug_egg'), 'warning'); return; }

                state.hunger = Math.max(0, state.hunger - 1);
                if (state.hunger === 0 && !state.hungerZeroSince) state.hungerZeroSince = Date.now();
                addMsg(t('msg_debug_stat', 'hunger', getStatDesc('hunger', state.hunger).text), 'warning');
                save(); renderStats(); return;
            }
            if (cmd === 'debughappy') {
                speakCommand('debug happy', 'other');
                if (state.stage === STAGE_EGG) { addMsg(t('msg_debug_egg'), 'warning'); return; }

                state.happy = Math.max(0, state.happy - 1);
                if (state.happy === 0 && !state.happyZeroSince) state.happyZeroSince = Date.now();
                addMsg(t('msg_debug_stat', 'happy', getStatDesc('happy', state.happy).text), 'warning');
                save(); renderStats(); return;
            }
            if (cmd === 'debugpoop') {
                speakCommand('debug poop', 'other');
                if (state.stage === STAGE_EGG) { addMsg(t('msg_debug_egg'), 'warning'); return; }

                state.poopCount = Math.min(MAX_POOP, state.poopCount + 1);
                if (state.poopCount > 0 && !state.poopDirtySince) state.poopDirtySince = Date.now();
                addMsg(t('msg_debug_stat', 'poop', getStatDesc('poop', state.poopCount).text), 'warning');
                save(); renderPoops(); return;
            }
            if (cmd === 'debugreset') {
                speakCommand('debug reset', 'other');
                localStorage.removeItem(SAVE_KEY);

                state = defaultState();
                leaveOverlay.classList.add('hidden');
                rpsOverlay.classList.add('hidden');
                dexOverlay.classList.add('hidden');
                msgLog.innerHTML = '';
                addMsg(t('msg_debug_reset'), 'warning');
                save();
                renderAll();
                return;
            }
            if (cmd.startsWith('debugbattle')) {
                const parts = cmd.split(/\s+/);
                if (parts.length >= 2) {
                    const targetId = parts[1];
                    const opponent = getFormInfo(targetId);
                    if (opponent) {
                        speakCommand('debug battle', 'other');
                        startBattle(opponent);
                        return;
                    }

                }
                addMsg("❌ Usage: debugbattle [pet_id]", 'warning');
                return;
            }
            if (cmd === 'debugdexall') {
                const allForms = getAllPetForms();
                const dex = loadDex();
                for (const form of allForms) {
                    if (!dex[form.id]) {
                        dex[form.id] = {
                            id: form.id,
                            name: form.name,
                            emoji: form.emoji,
                            unlockedAt: Date.now()
                        };
                    }
                }
                speakCommand('debug dex all', 'other');
                saveDex(dex);

                addMsg(t('msg_debug_dex_all', allForms.length), 'warning');
                return;
            }
            if (cmd === 'debugdexclear') {
                speakCommand('debug dex clear', 'other');
                localStorage.removeItem(DEX_KEY);

                addMsg(t('msg_debug_dex_clear'), 'warning');
                return;
            }
            if (cmd === 'debugstatus' || cmd === 'status') {
                speakCommand('status', 'other');
                doStatus();
                return;
            }

            if (cmd === 'debugdeath') {
                speakCommand('debug death', 'other');
                if (state.stage < STAGE_EVO2) { addMsg(t('msg_debug_death_err'), 'warning'); return; }

                triggerDeath();
                return;
            }
            if (cmd === 'debughofclear') {
                speakCommand('debug hall of fame clear', 'other');
                localStorage.removeItem(HOF_KEY);

                addMsg(t('msg_debug_hof_clear'), 'warning');
                return;
            }
            if (cmd === 'debugevolve') {
                if (state.stage === STAGE_EGG) { addMsg(t('msg_debug_egg_hatch_err'), 'warning'); return; }
                if (state.stage >= STAGE_EVO2) { addMsg(t('msg_debug_evo_err'), 'warning'); return; }

                if (state.stage === STAGE_BABY) {
                    speakCommand('debug evolve', 'other');
                    const target = determineStage1Evolution();

                    evolveToForm(STAGE_EVO1, target);
                    addMsg(t('msg_debug_evo1'), 'warning');
                } else if (state.stage === STAGE_EVO1) {
                    const target = determineStage2Evolution();
                    evolveToForm(STAGE_EVO2, target);
                    addMsg(t('msg_debug_evo2'), 'warning');
                }
                return;
            }
            if (cmd.startsWith('debugfeed')) {
                // debugfeed [category/id] amount
                const parts = cmd.split(/\s+/);
                if (parts.length >= 3) {
                    let key = parts[1];
                    const amount = parseInt(parts[2]);
                    
                    // If key is a food ID, find its category
                    let foundCat = null;
                    for (const cat in FOOD_DATA) {
                        if (FOOD_DATA[cat].some(f => f.id === key)) {
                            foundCat = cat;
                            break;
                        }
                    }
                    if (foundCat) key = foundCat;

                    if (state.feedCount[key] !== undefined && !isNaN(amount)) {
                        speakCommand('debug feed', 'other');
                        state.feedCount[key] += amount;

                        const label = t('food_cat_' + key) || key;
                        addMsg(t('msg_debug_feed', label, amount, state.feedCount[key]), 'warning');
                        save();
                        return;
                    }
                }
                addMsg(t('msg_debug_feed_usage'), 'warning');
                return;
            }
            if (cmd.startsWith('debugsetpet')) {
                const parts = cmd.split(/\s+/);
                if (parts.length >= 2) {
                    const targetId = parts[1];
                    const allForms = getAllPetForms();
                    const targetForm = allForms.find(f => f.id === targetId);
                    
                    if (targetForm) {
                        state.currentFormId = targetForm.id;
                        state.evolvedAt = Date.now();
                        
                        // Map stage string to constant
                        if (targetForm.stage === 'baby') state.stage = STAGE_BABY;
                        else if (targetForm.stage === 'stage1') {
                            state.stage = STAGE_EVO1;
                            state.evolutionPathId = targetForm.id;
                        }
                        else if (targetForm.stage === 'stage2') {
                            state.stage = STAGE_EVO2;
                            if (targetForm.parentId) state.evolutionPathId = targetForm.parentId;
                        }
                        
                        if (targetForm.stats) {
                            state.stats = { ...targetForm.stats };
                            state.maxHP = targetForm.stats.hp;
                        }
                        
                        addMsg(t('msg_debug_setpet', targetForm.emoji, targetForm.name), 'warning');
                        speakCommand('debug set pet', 'other');
                        registerToDex(targetForm.id);

                        save();
                        renderAll();
                        return;
                    }
                }
                addMsg(t('msg_debug_setpet_usage'), 'warning');
                return;
            }
        }

        if (state.left || state.dead) {
            addMsg(t('msg_game_over_cmd', getPetName()), 'warning');
            return;
        }

        // Rename mode
        if (state.isRenaming) {
            handleRename(raw.trim());
            return;
        }

        // Egg stage
        if (state.stage === STAGE_EGG) {
            if (cmd === 'knock') {
                speakCommand('knock', 'other');
                doKnock();
            } else {
                addMsg(t('msg_cmd_unknown_egg', raw.trim()), 'error');
            }
            return;
        }

        // Hatched stages
        switch (cmd) {
            case 'feed':   speakCommand('feed', 'other');   openFeed();   break;
            case 'clean':  speakCommand('clean', 'other');  doClean();  break;
            case 'play':   speakCommand('play', 'other');   doPlay();   break;
            case 'battle': speakCommand('battle', 'other'); doBattle(); break;
            case 'rename': speakCommand('rename', 'other'); doRename(); break;
            default:
                addMsg(t('msg_cmd_unknown'), 'error');
        }

    }

    // ---- Actions ----
    function doKnock() {
        state.knockCount++;
        
        // UI feedback without showing count
        petSprite.classList.remove('shake');
        void petSprite.offsetHeight;
        petSprite.classList.add('shake');
        setTimeout(() => petSprite.classList.remove('shake'), 400);

        const now = Date.now();
        let hatched = false;
        let babyForm = null;

        if (state.knockCount >= 5 && state.knockCount <= 7) {
            // 1/2 chance to hatch into White Dot
            if (Math.random() < 0.5) {
                hatched = true;
                babyForm = EVOLUTION_CONFIG.baby;
            }
        } else if (state.knockCount >= 8) {
            // Guaranteed hatch into Black Dot
            hatched = true;
            babyForm = EVOLUTION_CONFIG.baby_black;
        }

        if (hatched && babyForm) {
            setTimeout(() => {
                state.stage = STAGE_BABY;
                state.knockCount = 0;
                state.currentFormId = babyForm.id;
                state.hatchedAt = now;
                state.evolvedAt = now;
                state.lastHungerDecay = now;
                state.lastHappyDecay = now;
                state.lastPoopTime = now;
                state.hunger = 1;
                state.happy = 1;
                state.poopCount = 0;
                
                // Set initial stats
                if (babyForm.stats) {
                    state.stats = { ...babyForm.stats };
                    state.maxHP = babyForm.stats.hp;
                }
                
                const babyName = t('pet_' + babyForm.id) || babyForm.name;
                addMsg(t('msg_egg_hatch', babyName), 'success');

                registerToDex(babyForm.id);
                
                petSprite.classList.add('hatch-glow');
                setTimeout(() => petSprite.classList.remove('hatch-glow'), 1500);
                showEmotion('🎉', 3000);
                updateFormCache();
                save();
                renderAll();
            }, 600);
        } else {
            addMsg(t('msg_knock'), 'info');
        }
        save();
        renderAll();
    }

    function handleFeedChoice(cmd) {
        if (!state.feedOptions) return;
        
        const normalizedCmd = cmd.toLowerCase().replace(/\s+/g, '');
        
        // Find food by ID (direct) or by the English display name (normalized for UK/US)
        const food = state.feedOptions.find(f => {
            if (f.id === cmd) return true; // Exact ID match
            
            const enName = tEn('food_' + f.id).toLowerCase().replace(/\s+/g, '');
            return enName === normalizedCmd;
        });

        if (!food) {
            // Updated to show current display names in hint (Localized names for clarity, though input is English)
            const names = state.feedOptions.map(f => `${t('food_' + f.id)} (${tEn('food_' + f.id)})`).join(', ');
            addMsg(t('msg_feed_invalid', names), 'error');
            return;
        }
        
        // Speak the English term (respects accent)
        const englishTitle = tEn('food_' + food.id);
        speakCommand(englishTitle, 'feed');
        closeFeed();

        state.hunger = Math.min(MAX_HUNGER, state.hunger + 1);
        if (state.hunger > 0) state.hungerZeroSince = null;

        // Track category feed count
        state.feedCount[food.category] = (state.feedCount[food.category] || 0) + 1;

        const foodName = t('food_' + food.id) || food.id;
        // Emoji based on category
        const catEmojiMap = { red: '🏮', orange: '🍊', light: '🥛', dark: '🍫', green: '🌿' };
        const emoji = catEmojiMap[food.category] || '🍱';

        addMsg(t('msg_feed_success', emoji, foodName, getPetName(), getStatDesc('hunger', state.hunger).text), 'success');
        showEmotion('😋');
        petSprite.classList.add('happy-jump');
        setTimeout(() => petSprite.classList.remove('happy-jump'), 600);
        
        state.feedOptions = null; // Reset options after feeding
        save();
        renderStats();
        registerFoodToDex(food.id);
    }

    function doRename() {
        if (battleState) {
            addMsg(t('msg_battle_already'), 'warning');
            return;
        }

        const isMobile = document.body.classList.contains('mobile-mode');
        if (isMobile && renameOverlay) {
            renameInput.value = getPetName();
            renameOverlay.classList.remove('hidden');
            setTimeout(() => renameInput.focus(), 100);
            return;
        }

        state.isRenaming = true;
        addMsg(t('msg_rename_prompt', getPetName()), 'info');
        cmdInput.placeholder = '...';
    }

    function closeRenameModal() {
        if (renameOverlay) renameOverlay.classList.add('hidden');
        cmdInput.focus();
    }

    function handleRename(newName) {
        state.isRenaming = false;
        closeRenameModal(); // Ensure modal is closed if coming from mobile UI

        if (!newName || newName.length === 0) {
            addMsg(t('msg_rename_empty'), 'error');
            cmdInput.placeholder = t('ui_cmd_prompt');
            return;
        }
        if (newName.length > 10) {
            addMsg(t('msg_rename_long'), 'error');
            cmdInput.placeholder = t('ui_cmd_prompt');
            return;
        }
        const oldName = getPetName();
        state.customName = newName;

        addMsg(t('msg_rename_success', oldName, newName), 'success');
        cmdInput.placeholder = t('ui_cmd_prompt');
        save();
        renderName();
    }

    function doClean() {
        if (battleState) {
            addMsg(t('msg_clean_cant_battle'), 'warning');
            return;
        }
        if (state.poopCount <= 0) {
            addMsg(t('msg_clean_unnecessary'), 'warning');
            return;
        }
        
        openClean();
    }

    function openClean() {
        // Randomly pick a pest if not already set
        if (!state.currentPest) {
            state.currentPest = PEST_CONFIG[Math.floor(Math.random() * PEST_CONFIG.length)];
            save(); // Ensure new pest is persisted immediately
        }
        const pest = state.currentPest;
        state.isCleaningMode = true;

        // Render pest info
        pestImg.src = pest.img;
        pestImg.onclick = () => speakCommand(pest.id.toLowerCase(), 'pest');
        injectSoundIndicator($('pest-img-wrapper'), 'pest');
        pestNameLocal.textContent = pest.names[currentLang] || pest.names['en'];


        pestNameEn.textContent = pest.names['en'];
        pestDesc.textContent = pest.descriptions[currentLang] || pest.descriptions['en'];

        cleanOverlay.classList.remove('hidden');
        cmdInput.placeholder = t('ui_clean_placeholder') || 'Type English name...';
        addMsg(t('msg_clean_start') || '🧹 發現蟲蟲！請輸入牠的英文名稱。', 'info');
        renderPoops();
    }

    function closeClean() {
        state.isCleaningMode = false;
        cleanOverlay.classList.add('hidden');
        cmdInput.placeholder = t('ui_cmd_prompt');
        renderPoops();
    }

    function handleCleaningInput(cmd) {
        if (!state.currentPest) return;

        // Use space-insensitive comparison for pest names
        const normalizedCmd = cmd.replace(/\s+/g, '');
        const targetId = state.currentPest.id.toLowerCase();
        const targetEn = (state.currentPest.names['en'] || '').toLowerCase().replace(/\s+/g, '');

        if (normalizedCmd === targetId || normalizedCmd === targetEn) {
            // Success!
            speakCommand(cmd, 'pest'); // Speak the original command including spaces

            const poops = poopArea.querySelectorAll('.poop');

            // Even if hidden, we can animate or just update state
            state.poopCount = Math.max(0, state.poopCount - 1);
            if (state.poopCount === 0) state.poopDirtySince = null;

            addMsg(t('msg_clean_success', getStatDesc('poop', state.poopCount).text), 'success');
            showEmotion('🧹');
            
            // Register to Pest Dex
            registerPestToDex(state.currentPest.id);

            state.currentPest = null;

            closeClean();
            save();
            renderAll();
        } else {
            // Wrong name
            addMsg(t('msg_clean_wrong') || '❌ 名稱錯誤！請再試一次。', 'error');
            // Optional: shake the modal
            const modal = $('clean-modal');
            modal.style.animation = 'none';
            void modal.offsetHeight;
            modal.style.animation = 'sadShake 0.4s ease-in-out';
        }
    }

    function doPlay() {
        if (battleState) {
            addMsg(t('msg_play_cant_battle'), 'warning');
            return;
        }
        state.isRps = true;
        rpsOverlay.classList.remove('hidden');
        rpsResult.classList.add('hidden');
        // Reset highlights
        document.querySelectorAll('.rps-choice').forEach(c => c.classList.remove('highlight'));
        addMsg(t('msg_rps_start'), 'info');
        cmdInput.placeholder = t('ui_rps_placeholder');
        renderPoops();
    }

    function doStatus() {
        const fc = state.feedCount;
        const catKeys = ['red', 'orange', 'light', 'dark', 'green'];
        const catEmojiMap = { red: '🏮', orange: '🍊', light: '🥛', dark: '🍫', green: '🌿' };
        
        const summary = catKeys.map(k => {
            const label = t('food_cat_' + k) || k;
            return `${catEmojiMap[k]}${label}: ${fc[k] || 0}`;
        }).join('  ');
        addMsg(t('msg_status_feed', summary), 'info');
        
        const hDesc = getStatDesc('hunger', state.hunger).text;
        const haDesc = getStatDesc('happy', state.happy).text;
        const pDesc = getStatDesc('poop', state.poopCount).text;
        addMsg(t('msg_status_overall', hDesc, haDesc, pDesc), 'info');

        if (state.totalBattles > 0) {
            const winRate = ((state.wins / state.totalBattles) * 100).toFixed(1);
            addMsg(t('msg_status_battle', state.wins, state.totalBattles, winRate), 'info');
        }

        if (state.stage === STAGE_BABY) {
            // Preview which evolution would happen now
            const target = determineStage1Evolution();
            const translatedName = t('pet_' + target.id) || target.name;
            const translatedDesc = t('pet_desc_' + target.id) || target.description;
            addMsg(t('msg_status_evo1', translatedName, translatedDesc), 'info');
        } else if (state.stage === STAGE_EVO1) {
            const target = determineStage2Evolution();
            const translatedName = t('pet_' + target.id) || target.name;
            const translatedDesc = t('pet_desc_' + target.id) || target.description;
            addMsg(t('msg_status_evo2', translatedName, translatedDesc), 'info');

        } else if (state.stage === STAGE_EVO2) {
            addMsg(t('msg_status_evo_max'), 'info');
        }
    }

    function handleRPS(cmd) {
        const choices = ['scissors', 'rock', 'paper'];
        if (!choices.includes(cmd)) {
            addMsg(t('msg_rps_invalid'), 'error');
            return;
        }
        speakCommand(cmd, 'rps');

        const playerChoice = cmd;

        const petChoice = choices[Math.floor(Math.random() * 3)];

        // Highlight choices
        document.querySelectorAll('.rps-choice').forEach(c => {
            c.classList.toggle('highlight', c.dataset.choice === petChoice);
        });

        const choiceNameZh = { scissors: t('ui_scissors'), rock: t('ui_rock'), paper: t('ui_paper') };

        let result;
        if (playerChoice === petChoice) {
            result = 'draw';
            rpsResult.textContent = `VS: ${choiceNameZh[petChoice]}`;
            rpsResult.className = 'draw';
            addMsg(t('msg_rps_draw', choiceNameZh[playerChoice]), 'info');
        } else if (
            (playerChoice === 'scissors' && petChoice === 'paper') ||
            (playerChoice === 'rock' && petChoice === 'scissors') ||
            (playerChoice === 'paper' && petChoice === 'rock')
        ) {
            result = 'win';
            rpsResult.textContent = `VS: ${choiceNameZh[petChoice]}`;
            rpsResult.className = 'win';
            addMsg(t('msg_rps_win', getPetName()), 'warning');
            showEmotion('😢', 2500);
            petSprite.classList.add('sad-shake');
            setTimeout(() => petSprite.classList.remove('sad-shake'), 800);
        } else {
            result = 'lose';
            rpsResult.textContent = `VS: ${choiceNameZh[petChoice]}`;
            rpsResult.className = 'lose';
            state.happy = Math.min(MAX_HAPPY, state.happy + 1);
            if (state.happy > 0) state.happyZeroSince = null;
            addMsg(t('msg_rps_lose', getPetName(), getStatDesc('happy', state.happy).text), 'success');
            showEmotion('😄', 2500);
            petSprite.classList.add('happy-jump');
            setTimeout(() => petSprite.classList.remove('happy-jump'), 600);
            renderStats();
        }

        rpsResult.classList.remove('hidden');

        // Close RPS after delay
        setTimeout(() => {
            state.isRps = false;
            rpsOverlay.classList.add('hidden');
            cmdInput.placeholder = t('ui_cmd_prompt');
            renderPoops();
            save();
        }, 2000);
    }

    // ---- Battle System ----

    // Pre-compiled regex patterns for setBattleMsg masking (avoids re-creation on every call)
    const BATTLE_MSG_PATTERNS = [
        /受到\s*\d+\s*點傷害/g,
        /HP\s*-\d+/gi,
        /HP\s*\+\d+/gi,
        /恢復了\s*\d+\s*點\s*HP/g,
        /(攻擊力|atk).*?\+\d+/gi,
        /(攻擊力|atk).*?-\d+/gi,
        /(防禦力|def).*?\+\d+/gi,
        /(防禦力|def).*?-\d+/gi,
        /(速度|spd).*?\+\d+/gi,
        /(速度|spd).*?-\d+/gi,
        /傷害\s*\+\s*\d+/g,
    ];

    let battleState = null;

    function doBattle() {
        if (battleState) {
            addMsg(t('msg_battle_already'), 'warning');
            return;
        }
        if (state.stage === STAGE_EGG) {
            addMsg(t('msg_battle_egg'), 'warning');
            return;
        }
        if (state.stage === STAGE_BABY) {
            addMsg(t('msg_battle_baby'), 'warning');
            return;
        }
        if (state.hunger < 2) {
            addMsg(t('msg_battle_tired'), 'warning');
            return;
        }
        startBattle();
    }

    async function startBattle(forcedOpponent = null) {
        const opponent = forcedOpponent || getRandomOpponent();
        if (!opponent) {
            addMsg(t('msg_battle_no_opponent'), 'error');
            return;
        }

        if (!forcedOpponent) {
            state.hunger -= 1;
            save();
            renderStats();
        }
        const pInfo = getFormInfo(state.currentFormId);
        if (!pInfo) {
            addMsg("❌ Error: Pet info not found. Please try hatching/evolving again.", 'error');
            return;
        }

        const pData = {
            id: state.currentFormId,
            name: getPetName(),
            ability: pInfo.ability,
            stats: { ...state.stats },
            emoji: getPetEmoji(),
            img: getPetImg()
        };
        const oData = {
            id: opponent.id,
            name: opponent.name,
            ability: opponent.ability,
            stats: { ...opponent.stats },
            emoji: opponent.emoji,
            img: opponent.img
        };

        // 使用計算中心預算結果
        const log = BattleEngine.simulate(pData, oData, state.battleDebug);

        battleState = {
            player: { ...pData, hp: pData.stats.hp, maxHp: pData.stats.hp },
            opponent: { ...oData, hp: oData.stats.hp, maxHp: oData.stats.hp },
            battleLog: log,
            active: true
        };

        // UI Setup
        battleOverlay.classList.remove('hidden');
        oppSprite.src = battleState.opponent.img;
        oppNameTag.textContent = battleState.opponent.name;
        playerSprite.src = battleState.player.img;
        playerNameTag.textContent = battleState.player.name;
        
        actionPanel.classList.add('hidden');
        renderActions(); // Update buttons to hide them
        updateBattleHP();
        setBattleMsg(t('msg_battle_start', battleState.opponent.name));

        // 處理戰鬥前效果
        if (log.preBattle && log.preBattle.length > 0) {
            for (const effect of log.preBattle) {
                await new Promise(r => setTimeout(r, 500));
                setBattleMsg(t('msg_battle_ability', effect.ability, effect.msg));
                syncBattleHPFromTrigger(effect);
            }
        }

        setTimeout(() => runLogBattle(), 800);
    }

    function getRandomOpponent() {
        const allForms = getAllPetForms();
        let stageStr = 'baby';
        if (state.stage === STAGE_EVO1) stageStr = 'stage1';
        if (state.stage === STAGE_EVO2) stageStr = 'stage2';

        const pool = allForms.filter(f => f.stage === stageStr && f.id !== state.currentFormId && f.id !== 'tombstone');
        if (pool.length === 0) {
            addMsg(t('msg_battle_no_opponent'), 'error');
            return null;
        }
        return pool[Math.floor(Math.random() * pool.length)];
    }

    function updateBattleHP() {
        if (!battleState) return;
        const pHP = (battleState.player.hp / battleState.player.maxHp) * 100;
        const oHP = (battleState.opponent.hp / battleState.opponent.maxHp) * 100;
        
        playerHPBar.style.width = Math.max(0, pHP) + '%';
        oppHPBar.style.width = Math.max(0, oHP) + '%';
        
        playerHPBar.classList.toggle('low', pHP < 30);
        oppHPBar.classList.toggle('low', oHP < 30);
    }

    function setBattleMsg(txt) {
        if (!state.battleDebug) {
            // Use pre-compiled BATTLE_MSG_PATTERNS — avoids rebuilding RegExp objects each call
            const vals = [
                t('msg_battle_dmg'),    t('msg_battle_dmg'),
                t('msg_battle_heal'),   t('msg_battle_heal'),
                t('msg_battle_atk_up'), t('msg_battle_atk_down'),
                t('msg_battle_def_up'), t('msg_battle_def_down'),
                t('msg_battle_spd_up'), t('msg_battle_spd_down'),
                t('msg_battle_dmg_up'),
            ];
            BATTLE_MSG_PATTERNS.forEach((reg, i) => { txt = txt.replace(reg, vals[i]); });
        }
        battleMsgText.textContent = txt;
    }

    // New helper: unify HP sync logic from ability triggers
    function syncBattleHPFromTrigger(trigger) {
        if (!battleState || !trigger) return;
        const p = battleState.player;
        const o = battleState.opponent;

        const val = (trigger.type === 'damage' || trigger.type === 'crit_fail' || trigger.type === 'weakness' || trigger.type === 'bonusDamage') 
            ? (trigger.damage || 1) 
            : (trigger.healVal || 1);

        if (trigger.side === 'p1') {
            if (trigger.type === 'heal') p.hp = Math.min(p.maxHp, p.hp + val);
            else p.hp = Math.max(0, p.hp - val);
        } else if (trigger.side === 'p2') {
            if (trigger.type === 'heal') o.hp = Math.min(o.maxHp, o.hp + val);
            else o.hp = Math.max(0, o.hp - val);
        }
        updateBattleHP();

        // 加一點閃爍特效供傷害判定
        const isDamage = (trigger.type === 'damage' || trigger.type === 'bonusDamage');
        if (isDamage && val > 0 && (trigger.side === 'p1' || trigger.side === 'p2')) {
            const dSide = trigger.side === 'p1' ? 'player' : 'opponent';
            const el = $(`${dSide}-sprite`);
            if (el) {
                el.classList.remove('damage-flash');
                void el.offsetWidth;
                el.classList.add('damage-flash');
                setTimeout(() => el.classList.remove('damage-flash'), 400);
            }
        }
    }

    async function runLogBattle() {
        if (!battleState || !battleState.active) return;

        for (const turn of battleState.battleLog.turns) {
            if (!battleState.active) break;

            setBattleMsg(t('msg_battle_turn', turn.turn));
            await new Promise(r => setTimeout(r, 300));

            if (state.battleDebug) {
                addMsg(t('msg_battle_debug_spd', turn.turn, turn.p1SpdRoll, turn.p2SpdRoll), 'info');
            }

            for (const action of turn.actions) {
                if (action.type === 'turnStart' || action.type === 'endOfTurn') {
                    if (action.triggers && action.triggers.length > 0) {
                        for (const trigger of action.triggers) {
                            setBattleMsg(t('msg_battle_ability', trigger.name, trigger.msg));
                            syncBattleHPFromTrigger(trigger);
                            await new Promise(r => setTimeout(r, 600));
                        }
                    }
                } else {
                    await playAction(action);
                }
                updateBattleHP();
                if (battleState.player.hp <= 0 || battleState.opponent.hp <= 0) break;
                await new Promise(r => setTimeout(r, 300));
            }

            if (battleState.player.hp <= 0 || battleState.opponent.hp <= 0) break;
            await new Promise(r => setTimeout(r, 300));
        }

        endBattle(battleState.player.hp > 0);
    }

    async function playAction(action) {
        const attacker = action.attacker === 'p1' ? battleState.player : battleState.opponent;
        const defender = action.defender === 'p1' ? battleState.player : battleState.opponent;
        const aSide = action.attacker === 'p1' ? 'player' : 'opponent';
        const dSide = action.defender === 'p1' ? 'player' : 'opponent';

        if (action.resting) {
            // 處理休息狀態，不播放攻擊動畫
            if (action.triggers && action.triggers.length > 0) {
                for (const trigger of action.triggers) {
                    await new Promise(r => setTimeout(r, 250));
                    setBattleMsg(t('msg_battle_ability', trigger.name, trigger.msg));
                    syncBattleHPFromTrigger(trigger);
                }
            }
            await new Promise(r => setTimeout(r, 300));
            return;
        }

        const isCritFail = action.triggers && action.triggers.some(t => t.type === 'crit_fail');
        const projType = isCritFail ? 'loop' : (action.hit ? 'normal' : 'miss');

        setBattleMsg(t('msg_battle_attack', attacker.name));
        await spawnProjectile(aSide, projType);

        if (isCritFail) {
            $(`${aSide}-sprite`).classList.add('damage-flash');
            setTimeout(() => $(`${aSide}-sprite`).classList.remove('damage-flash'), 400);
        }

        if (state.battleDebug) {
            addMsg(t('msg_battle_debug_atk', attacker.name, action.hitRoll, action.currentAtk, action.hit ? t('ui_hit') : t('ui_miss')), 'info');
            if (action.hit) {
                addMsg(t('msg_battle_debug_def', defender.name, action.defRoll, action.currentDef, action.blocked ? t('ui_blocked') : t('ui_dmg_taken', action.damage)), 'info');
            }
        }

        // 處理技能觸發日誌
        if (action.triggers && action.triggers.length > 0) {
            for (const trigger of action.triggers) {
                if (state.battleDebug) {
                    addMsg(t('msg_battle_ability', trigger.name, trigger.msg), 'success');
                }
            }
        }

        if (action.hit) {
            if (action.blocked) {
                setBattleMsg(t('msg_battle_blocked', defender.name));
                const dSprite = $(`${dSide}-sprite`);
                dSprite.classList.add('block-flash');
                setTimeout(() => dSprite.classList.remove('block-flash'), 400);
            } else {
                defender.hp -= action.baseDamage;
                setBattleMsg(t('msg_battle_hit', defender.name, action.baseDamage));
                
                const dSprite = $(`${dSide}-sprite`);
                dSprite.classList.add('damage-flash');
                setTimeout(() => dSprite.classList.remove('damage-flash'), 400);
                
                updateBattleHP();
            }
        } else {
            setBattleMsg(t('msg_battle_miss', attacker.name));
        }

        // Process ability triggers (shared for both hit and miss outcomes)
        if (action.triggers && action.triggers.length > 0) {
            for (const trigger of action.triggers) {
                await new Promise(r => setTimeout(r, 250));
                setBattleMsg(t('msg_battle_ability', trigger.name, trigger.msg));
                syncBattleHPFromTrigger(trigger);
            }
        }

        await new Promise(r => setTimeout(r, 300));
    }

    function spawnProjectile(fromSide, type = 'normal') {
        return new Promise(resolve => {
            const container = projectileLayer;
            const rect = container.getBoundingClientRect();
            
            const p = document.createElement('div');
            p.className = 'projectile';
            p.innerHTML = '<img src="images/poop.png" alt="poop">';
            
            const colors = ['p-red', 'p-blue', 'p-green', 'p-yellow', 'p-purple', 'p-orange'];
            p.classList.add(colors[Math.floor(Math.random() * colors.length)]);

            const isPlayer = fromSide === 'player';
            const isMobileLayout = document.body.classList.contains('mobile-mode');

            let startX, startY, endX, endY;

            if (isMobileLayout) {
                // Mobile: sprite 110px, player at margin-left:15, opponent at margin-right:20
                // Player center X ≈ 15 + 55 = 70; Opponent center X ≈ rect.width - 20 - 55 = rect.width - 75
                // Player Y ≈ rect.height - 35(margin-bottom) - 55(half sprite) - 30(hp+name) ≈ rect.height - 120
                // Opponent Y ≈ 10(margin-top) + 8(hp) + 55(half sprite) ≈ 73
                // endX for player attack: shifted left by 35px (from -75 to -110) so hit & miss paths look more distinct
                startX = isPlayer ? 70 : (rect.width - 110);
                startY = isPlayer ? (rect.height - 120) : 73;
                endX   = isPlayer ? (rect.width - 110) : 70;
                endY   = isPlayer ? 73 : (rect.height - 120);
            } else {
                startX = isPlayer ? 155 : (rect.width - 155);
                startY = isPlayer ? (rect.height - 180) : 80;
                endX   = isPlayer ? (rect.width - 155) : 155;
                endY   = isPlayer ? 80 : (rect.height - 180);
            }

            p.style.setProperty('--tx-start', startX + 'px');
            p.style.setProperty('--ty-start', startY + 'px');
            p.style.setProperty('--tx-end', endX + 'px');
            p.style.setProperty('--ty-end', endY + 'px');

            // Set rotation based on attacker
            const pRot = isPlayer ? '0deg' : '180deg';
            const pRotBack = isPlayer ? '180deg' : '0deg';
            p.style.setProperty('--p-rot', pRot);
            p.style.setProperty('--p-rot-back', pRotBack);

            if (type === 'miss') {
                // Player miss: fly to the left; Opponent miss: fly upward
                const missX = isPlayer ? (endX - 80) : endX;
                const missY = isPlayer ? endY : (endY - 50);
                p.style.setProperty('--tx-miss', missX + 'px');
                p.style.setProperty('--ty-miss', missY + 'px');
                p.classList.add('animate-projectile-miss');
            } else if (type === 'loop') {
                // Loop: fly toward target mid-point then return
                const midX = isMobileLayout
                    ? (isPlayer ? (rect.width - 90) : 85)
                    : (isPlayer ? (rect.width - 180) : 180);
                const midY = isMobileLayout
                    ? (isPlayer ? 100 : (rect.height - 150))
                    : (isPlayer ? 130 : (rect.height - 230));
                p.style.setProperty('--tx-mid', midX + 'px');
                p.style.setProperty('--ty-mid', midY + 'px');
                p.classList.add('animate-projectile-loop');
            } else {
                p.classList.add('animate-projectile');
            }

            container.appendChild(p);

            setTimeout(() => {
                p.remove();
                resolve();
            }, 700);
        });
    }

    function endBattle(playerWon) {
        if (!battleState) return;
        battleState.active = false;
        
        state.totalBattles++; // Increment total battles
        if (playerWon) {
            state.wins++; // Increment wins
            const msg = t('msg_battle_win', getPetName());
            addMsg(msg, 'success');
            setBattleMsg(msg); // Show in battle UI too
            state.happy = Math.min(MAX_HAPPY, state.happy + 1);
            if (state.happy > 0) state.happyZeroSince = null;
            showEmotion('😊', 3000, $('player-container'));
        } else {
            const msg = t('msg_battle_lose', getPetName());
            addMsg(msg, 'warning');
            setBattleMsg(msg); // Show in battle UI too
            showEmotion('😢', 3000, $('player-container'));
        }

        save();
        renderStats();

        // 如果開啟了詳細 log，則將戰鬥訊息存成 txt
        if (state.battleDebug && battleState.battleLog) {
            const detailedLog = BattleEngine.generateTextLog(battleState.battleLog);
            const blob = new Blob([detailedLog], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'battle_log.txt';
            a.click();
            URL.revokeObjectURL(url);
            addMsg(t('msg_battle_export_success'), 'info');
        }

        setTimeout(() => {
            battleOverlay.classList.add('hidden');
            actionPanel.classList.remove('hidden');
            battleState = null;
            renderActions(); // Restore buttons
        }, 1200);
    }

    // ---- Restart ----
    function restart() {
        localStorage.removeItem(SAVE_KEY);
        state = defaultState();
        leaveOverlay.classList.add('hidden');
        msgLog.innerHTML = ''; // 清空訊息紀錄
        addMsg(t('msg_egg_intro'), 'success');
        save();
        renderAll();
    }

    // ---- Idle Wander ----
    let wanderTimer = null;
    let currentWanderX = 0;
    function startIdleWander() {
        if (wanderTimer) clearInterval(wanderTimer);
        wanderTimer = setInterval(() => {
            if (state.left || state.dead || battleState || state.stage === STAGE_EGG || state.stage === 'tombstone') {
                petSpriteWrapper.style.translate = '';
                petSpriteWrapper.style.scale = '';
                return;
            }
            if (Math.random() < 0.3) {
                const deltaX = (Math.random() * 40) - 20; // -20 to +20
                currentWanderX += deltaX;
                
                // Dynamically calculate boundary so it won't go out of screen/container
                const containerWidth = document.getElementById('game-container').clientWidth;
                const petWidth = petSpriteWrapper.offsetWidth;
                const maxMove = Math.max(0, (containerWidth - petWidth) / 2 - 15);
                
                currentWanderX = Math.max(-maxMove, Math.min(maxMove, currentWanderX));
                
                const invertedPets = ['aurora_eagle', 'hunger_cat', 'mega_lion'];
                let scaleX = deltaX < 0 ? -1 : 1;
                if (invertedPets.includes(state.currentFormId)) {
                    scaleX *= -1;
                }
                petSpriteWrapper.style.translate = `${currentWanderX}px 0`;
                petSpriteWrapper.style.scale = `${scaleX} 1`;
            }
        }, 3000);
    }

    // ---- Init ----
    function init() {
        load();

        if (state.left || state.dead) {
            renderAll();
            if (state.dead) {
                triggerDeath(); // Show death message if already dead
            } else {
                triggerLeave('unknown');
            }
            return;
        }

        processTimePassage();
        renderAll();

        const hasSave = !!localStorage.getItem(SAVE_KEY);
        if (!hasSave) {
            addMsg(t('msg_egg_intro'), 'success');
        } else {
            addMsg(t('msg_welcome_back', getPetName()), 'info');
        }

        // Periodic updates (every 30 seconds)
        setInterval(() => {
            if (!state.left) {
                processTimePassage();
                renderAll();
            }
        }, 30000);

        // Update evolution timer every minute
        setInterval(() => {
            if (!state.left) {
                renderEvoTimer();
            }
        }, 60000);

        startIdleWander();
    }

    // ---- Event Listeners ----
    cmdInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const val = cmdInput.value;
            cmdInput.value = '';
            handleCommand(val);
        }
    });

    submitBtn.addEventListener('click', () => {
        const val = cmdInput.value;
        cmdInput.value = '';
        handleCommand(val);
    });

    // ---- Modal Button Listeners (Audio-Only) ----
    if (dexCloseBtn) dexCloseBtn.onclick = () => speakCommand('close', 'other');
    if ($('clean-close-btn')) $('clean-close-btn').onclick = () => speakCommand('close', 'other');
    if ($('feed-close-btn')) $('feed-close-btn').onclick = () => speakCommand('close', 'other');
    if ($('lang-close-btn')) $('lang-close-btn').onclick = () => speakCommand('close', 'other');
    if ($('hof-close-btn')) $('hof-close-btn').onclick = () => speakCommand('close', 'other');

    // Rename Modal Listeners
    if (renameConfirmBtn) {
        renameConfirmBtn.onclick = () => {
            const val = renameInput.value;
            handleRename(val);
        };
    }
    if (renameCancelBtn) {
        renameCancelBtn.onclick = () => closeRenameModal();
    }
    if (renameInput) {
        renameInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                handleRename(renameInput.value);
            }
        });
    }

    // RPS Choices (Audio-Only)
    document.querySelectorAll('.rps-choice').forEach(btn => {
        btn.onclick = () => {
            const choice = btn.dataset.choice;
            if (choice) speakCommand(choice, 'rps');
        };
    });

    // Language Choices (Audio-Only)
    document.querySelectorAll('.lang-choice').forEach(btn => {
        btn.onclick = () => {
            const cmd = btn.querySelector('span:last-child').textContent.toLowerCase();
            speakCommand(cmd, 'other');
        };
    });



    // Keyboard scrolling for Dex
    window.addEventListener('keydown', (e) => {
        if (!state.isDexMode) return;
        
        const modal = $('dex-modal');
        if (e.key === 'ArrowUp') {
            modal.scrollBy({ top: -60, behavior: 'smooth' });
            e.preventDefault();
        } else if (e.key === 'ArrowDown') {
            modal.scrollBy({ top: 60, behavior: 'smooth' });
            e.preventDefault();
        }
    });





    // Focus input on page load
    window.addEventListener('load', () => {
        init();
        cmdInput.focus();
    });

})();
