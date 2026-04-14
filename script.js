// =========================================================
// Battopo - 虛擬寵物遊戲（分支進化版）
// =========================================================

(() => {
    'use strict';

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
    const FRUITS = [
        { id: 'apple',      emoji: '🍎', img: 'images/apple.png',  nameKey: 'fruit_apple',   color: '#e74c3c' },
        { id: 'orange',     emoji: '🍊', img: 'images/orange.png', nameKey: 'fruit_orange',  color: '#f39c12' },
        { id: 'lemon',      emoji: '🍋', img: 'images/lemon.png',  nameKey: 'fruit_lemon',   color: '#f1c40f' },
        { id: 'grape',      emoji: '🍇', img: 'images/grape.png',  nameKey: 'fruit_grape',   color: '#9b59b6' },
        { id: 'guava',      emoji: '🍏', img: 'images/guava.png',  nameKey: 'fruit_guava',   color: '#2ecc71' },
    ];

    const MAX_HUNGER = 6;
    const MAX_HAPPY = 6;
    const MAX_POOP = 4;
    const KNOCK_NEEDED = 10;

    // Time intervals in milliseconds
    const HUNGER_DECAY_MS   = 4 * 60 * 60 * 1000;   // 4 hours
    const HAPPY_DECAY_MS    = 4 * 60 * 60 * 1000;    // 4 hours
    const POOP_INTERVAL_MS  = 6 * 60 * 60 * 1000;    // 6 hours
    const LEAVE_THRESHOLD_MS = 24 * 60 * 60 * 1000;  // 24 hours

    const SAVE_KEY = 'battopo_save';
    const DEX_KEY = 'battopo_dex';
    const HOF_KEY = 'battopo_hof';

    const LIFESPAN_MS = 5 * 24 * 60 * 60 * 1000; // 5 days

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
    const poopArea       = $('poop-area');
    const emotionBubble  = $('emotion-bubble');
    const cmdInput       = $('command-input');
    const submitBtn      = $('submit-btn');
    const msgLog         = $('message-log');
    const rpsOverlay     = $('rps-overlay');
    const rpsResult      = $('rps-result');
    const leaveOverlay   = $('leave-overlay');
    const leaveMessage   = $('leave-message');
    const restartBtn     = $('restart-btn');
    const loadFileInput  = $('load-file-input');
    const dexOverlay     = $('dex-overlay');
    const dexGrid        = $('dex-grid');
    const dexProgress    = $('dex-progress');
    const dexBackBtn     = $('dex-back-btn');
    const feedOverlay     = $('feed-overlay');
    const feedChoices     = $('feed-choices');
    const feedCancelBtn   = $('feed-cancel-btn');
    const hofOverlay      = $('hof-overlay');
    const hofList         = $('hof-list');
    const hofCloseBtn     = $('hof-close-btn');

    const langOverlay     = $('lang-overlay');
    const langBackBtn     = $('lang-back-btn');

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

    // Make sure we initialize UI language once DOM is ready
    document.addEventListener('DOMContentLoaded', updateLanguageUI);

    // ---- Game State ----
    let state = null;
    let cachedFormInfo = null; // Performance optimization: cache for current species info

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
            feedCount: { apple: 0, orange: 0, lemon: 0, grape: 0, guava: 0 },
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
        };
    }

    // ---- Helper: Get form info from EVOLUTION_CONFIG ----
    function getFormInfo(formId) {
        if (!formId) return null;
        let originalForm = null;
        // Check baby
        if (EVOLUTION_CONFIG.baby.id === formId) originalForm = EVOLUTION_CONFIG.baby;
        // Check baby black
        else if (EVOLUTION_CONFIG.baby_black && EVOLUTION_CONFIG.baby_black.id === formId) originalForm = EVOLUTION_CONFIG.baby_black;
        // Check stage1
        else {
            for (const f of EVOLUTION_CONFIG.stage1) {
                if (f.id === formId) { originalForm = f; break; }
            }
            if (!originalForm && EVOLUTION_CONFIG.stage1_black) {
                for (const f of EVOLUTION_CONFIG.stage1_black) {
                    if (f.id === formId) { originalForm = f; break; }
                }
            }
            // Check stage2
            if (!originalForm) {
                for (const key in EVOLUTION_CONFIG.stage2) {
                    for (const f of EVOLUTION_CONFIG.stage2[key]) {
                        if (f.id === formId) { originalForm = f; break; }
                    }
                    if (originalForm) break;
                }
            }
        }

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
        forms.push({ ...getFormInfo(EVOLUTION_CONFIG.baby.id), stage: 'baby' });
        if (EVOLUTION_CONFIG.baby_black) {
            forms.push({ ...getFormInfo(EVOLUTION_CONFIG.baby_black.id), stage: 'baby' });
        }

        // Stage 1 (White)
        for (const f of EVOLUTION_CONFIG.stage1) {
            forms.push({ ...getFormInfo(f.id), stage: 'stage1' });
        }
        // Stage 1 (Black)
        if (EVOLUTION_CONFIG.stage1_black) {
            for (const f of EVOLUTION_CONFIG.stage1_black) {
                forms.push({ ...getFormInfo(f.id), stage: 'stage1' });
            }
        }

        // Stage 2
        for (const key in EVOLUTION_CONFIG.stage2) {
            for (const f of EVOLUTION_CONFIG.stage2[key]) {
                forms.push({ ...getFormInfo(f.id), stage: 'stage2', parentId: key });
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

    function openDex() {
        const dex = loadDex();
        const allForms = getAllPetForms();
        const total = allForms.length;
        const unlocked = allForms.filter(f => dex[f.id]).length;

        // Progress
        dexProgress.innerHTML = `${t('ui_dex_progress')}<span class="dex-count">${unlocked}</span> / <span class="dex-count">${total}</span>`;

        // Build grid
        dexGrid.innerHTML = '';

        // Group by stage
        const stages = [
            { key: 'baby', label: t('ui_stage_baby'), cssClass: 'stage-baby' },
            { key: 'stage1', label: t('ui_stage_1'), cssClass: 'stage-1' },
            { key: 'stage2', label: t('ui_stage_2'), cssClass: 'stage-2' },
        ];

        for (const stageInfo of stages) {
            const stageForms = allForms.filter(f => f.stage === stageInfo.key);
            if (stageForms.length === 0) continue;

            // Stage label header
            const label = document.createElement('div');
            label.className = `dex-stage-label ${stageInfo.cssClass}`;
            label.textContent = stageInfo.label;
            dexGrid.appendChild(label);

            for (const form of stageForms) {
                const isUnlocked = !!dex[form.id];
                const card = document.createElement('div');
                card.className = `dex-card ${isUnlocked ? 'unlocked' : 'locked'}`;

                // Use image if available, otherwise emoji
                if (form.img) {
                    card.innerHTML = `
                        <img class="dex-card-img" src="${form.img}" alt="${form.name}">
                        <span class="dex-card-name">${isUnlocked ? form.name : '???'}</span>
                        ${isUnlocked ? `<div class="dex-tooltip">
                            <span class="dex-tooltip-name">${form.emoji} ${form.name}</span>
                            <span class="dex-tooltip-desc">${form.description || ''}</span>
                            ${form.ability ? `
                                <div class="dex-tooltip-ability">
                                    <span class="dex-ability-label">${t('ui_trait')} ${form.ability.name}</span>
                                    <span class="dex-ability-effect">${form.ability.description}</span>
                                </div>
                            ` : ''}
                        </div>` : ''}
                    `;
                } else {
                    card.innerHTML = `
                        <span class="dex-card-emoji">${form.emoji}</span>
                        <span class="dex-card-name">${isUnlocked ? form.name : '???'}</span>
                        ${isUnlocked ? `<div class="dex-tooltip">
                            <span class="dex-tooltip-name">${form.emoji} ${form.name}</span>
                            <span class="dex-tooltip-desc">${form.description || ''}</span>
                            ${form.ability ? `
                                <div class="dex-tooltip-ability">
                                    <span class="dex-ability-label">${t('ui_trait')} ${form.ability.name}</span>
                                    <span class="dex-ability-effect">${form.ability.description}</span>
                                </div>
                            ` : ''}
                        </div>` : ''}
                    `;
                }

                dexGrid.appendChild(card);
            }
        }

        dexOverlay.classList.remove('hidden');
        state.isDexMode = true;
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

        feedChoices.innerHTML = '';
        FRUITS.forEach(fruit => {
            const btn = document.createElement('div');
            btn.className = 'feed-choice';
            
            // Render image if available, else emoji
            let displayHTML = '';
            if (fruit.img) {
                displayHTML = `<img src="${fruit.img}" class="feed-choice-img" alt="${fruit.name}">`;
            } else {
                displayHTML = `<span class="feed-choice-emoji">${fruit.emoji}</span>`;
            }

            btn.innerHTML = `
                ${displayHTML}
                <span class="feed-choice-name">${t(fruit.nameKey) || fruit.id}</span>
                <span class="feed-choice-cmd">${fruit.id}</span>
            `;
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
        if (state.isFeedMode === undefined) state.isFeedMode = false;
        if (state.isRenaming === undefined) state.isRenaming = false;
        // New fields
        if (state.feedCount === undefined) state.feedCount = { apple: 0, orange: 0, lemon: 0, grape: 0, guava: 0 };
        if (state.currentFormId === undefined) state.currentFormId = null;
        if (state.evolutionPathId === undefined) state.evolutionPathId = null;
        if (state.battleDebug === undefined) state.battleDebug = false;
        if (state.wins === undefined) state.wins = 0;
        if (state.totalBattles === undefined) state.totalBattles = 0;
        if (state.isHofMode === undefined) state.isHofMode = false;
        if (state.isDexMode === undefined) state.isDexMode = false;
        if (state.isCleaningMode === undefined) state.isCleaningMode = false;
        if (state.currentPest === undefined) state.currentPest = null;
        
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
        if (state.stage === STAGE_EGG) return 'images/egg.png';
        return cachedFormInfo ? cachedFormInfo.img : 'images/baby.png';
    }

    // ---- File Save / Load ----
    function exportSaveFile() {
        save(); // ensure latest state
        const data = JSON.stringify(state, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const formName = state.currentFormId || 'egg';
        const dateStr = new Date().toISOString().slice(0, 10);
        a.href = url;
        a.download = `battopo_${formName}_${dateStr}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        addMsg(`💾 存檔已下載: battopo_${formName}_${dateStr}.json`, 'success');
    }

    function importSaveFile() {
        loadFileInput.click();
    }

    function handleFileLoad(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const loaded = JSON.parse(e.target.result);
                // Validate it looks like a save file
                if (!loaded || typeof loaded.stage === 'undefined') {
                    addMsg(t('msg_save_invalid'), 'error');
                    return;
                }
                state = loaded;
                ensureStateFields();

                // Calculate time passage since the save
                if (!state.left) {
                    processTimePassage();
                }

                // Sync to localStorage too
                save();

                // Re-render everything
                leaveOverlay.classList.add('hidden');
                rpsOverlay.classList.add('hidden');
                state.isRps = false;

                if (state.left) {
                    renderAll();
                    triggerLeave('unknown');
                } else {
                    renderAll();
                    addMsg(t('msg_save_loaded', getPetName()), 'success');

                    // Show time-passage summary
                    const elapsed = Date.now() - (state.lastSaved || Date.now());
                    if (elapsed > 60000) {
                        const hrs = Math.floor(elapsed / 3600000);
                        const mins = Math.floor((elapsed % 3600000) / 60000);
                        if (hrs > 0) {
                            addMsg(t('msg_time_passed_hrs', hrs, mins), 'info');
                        } else {
                            addMsg(t('msg_time_passed_mins', mins), 'info');
                        }
                    }
                }
            } catch (err) {
                addMsg(t('msg_save_failed'), 'error');
            }
        };
        reader.readAsText(file);
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
            hof.forEach((entry, idx) => {
                const date = new Date(entry.diedAt).toLocaleString(currentLang === 'zh-TW' ? 'zh-TW' : (currentLang === 'ja' ? 'ja-JP' : 'en-US'), {
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
            hungerBar.innerHTML = '';
            happyBar.innerHTML = '';
            statsBar.style.display = 'none';
            return;
        }
        statsBar.style.display = '';

        // Hunger
        let hungerHTML = '';
        for (let i = 0; i < MAX_HUNGER; i++) {
            hungerHTML += `<div class="heart ${i < state.hunger ? 'filled' : 'empty'}"></div>`;
        }
        hungerBar.innerHTML = hungerHTML;

        // Happy
        let happyHTML = '';
        for (let i = 0; i < MAX_HAPPY; i++) {
            happyHTML += `<div class="heart ${i < state.happy ? 'happy-filled' : 'empty'}"></div>`;
        }
        happyBar.innerHTML = happyHTML;
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
        poopArea.innerHTML = '';
        if (state.stage === STAGE_EGG || state.isRps || state.isFeedMode || state.isCleaningMode) return;
        for (let i = 0; i < state.poopCount; i++) {
            const p = document.createElement('div');
            p.className = 'poop';
            p.textContent = '💩';
            p.style.animationDelay = `${i * 0.1}s`;
            poopArea.appendChild(p);
        }
    }

    function renderActions() {
        actionButtons.innerHTML = '';
        if (battleState) return; // Hide actions during battle

        const systemActions = [
            { id: 'hof',  emoji: '🏆', label: 'HOF',  desc: t('ui_hof_desc') },
            { id: 'dex',  emoji: '📖', label: 'DEX',  desc: t('ui_dex_desc') },
            { id: 'save', emoji: '💾', label: 'SAVE', desc: t('ui_save_desc') },
            { id: 'load', emoji: '📂', label: 'LOAD', desc: t('ui_load_desc') },
        ];

        if (state.left || state.dead) {
            systemActions.forEach(a => addActionBtn(a));
            return;
        }

        const actions = state.stage === STAGE_EGG
            ? [{ id: 'knock', emoji: '👊', label: 'KNOCK', desc: t('ui_knock_desc') }]
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
        btn.innerHTML = `
            ${a.emoji}
            <div class="action-tooltip">
                <span class="tooltip-name">${a.label}</span>
                <span class="tooltip-desc">${a.desc}</span>
            </div>
        `;
        actionButtons.appendChild(btn);
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
            remaining = Math.max(0, LIFESPAN_MS - (now - state.evolvedAt));
            nextDesc = t('ui_death_timer');
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
    function showEmotion(emoji, duration = 2000) {
        emotionBubble.textContent = emoji;
        emotionBubble.classList.remove('hidden');
        emotionBubble.style.animation = 'none';
        void emotionBubble.offsetHeight;
        emotionBubble.style.animation = '';
        setTimeout(() => emotionBubble.classList.add('hidden'), duration);
    }

    // ---- Commands ----
    function handleCommand(raw) {
        const cmd = raw.trim().toLowerCase();
        if (!cmd) return;

        // Save/Load/Dex always available
        if (cmd === 'save') { exportSaveFile(); return; }
        if (cmd === 'load') { importSaveFile(); return; }
        if (cmd === 'dex') { openDex(); return; }
        if (cmd === 'hof') { openHof(); return; }
        if (cmd === 'lang') { openLang(); return; }
        if (cmd === 'log_battle') {
            state.battleDebug = !state.battleDebug;
            addMsg(t('msg_battle_log_toggle', state.battleDebug ? t('ui_on') : t('ui_off')), 'info');
            save();
            return;
        }
        if (cmd === 'egg') { 
            if (state.left || state.dead) {
                restart();
            } else {
                addMsg(t('msg_egg_exists'), 'warning');
            }
            return; 
        }

        // If in a modal mode, prioritize those handlers
        if (state.isRps) {
            handleRPS(cmd);
            return;
        }
        if (state.isFeedMode) {
            if (cmd === 'back') { closeFeed(); return; }
            handleFeedChoice(cmd);
            return;
        }
        if (state.isLangMode) {
            if (cmd === 'back') { closeLang(); return; }
            if (['english', 'chinese', 'japanese'].includes(cmd)) {
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
            if (cmd === 'back') { closeHof(); return; }
            // HOF has no other commands
            addMsg(t('msg_hof_invalid'), 'error');
            return;
        }
        if (state.isDexMode) {
            if (cmd === 'back') { closeDex(); return; }
            addMsg(t('msg_dex_invalid', cmd), 'error');
            return;
        }
        if (state.isCleaningMode) {
            if (cmd === 'back') { closeClean(); return; }
            handleCleaningInput(cmd);
            return;
        }

        // Debug commands
        if (cmd === 'debughunger') {
            if (state.stage === STAGE_EGG) { addMsg(t('msg_debug_egg'), 'warning'); return; }
            state.hunger = Math.max(0, state.hunger - 1);
            if (state.hunger === 0 && !state.hungerZeroSince) state.hungerZeroSince = Date.now();
            addMsg(t('msg_debug_stat', 'hunger', getStatDesc('hunger', state.hunger).text), 'warning');
            save(); renderStats(); return;
        }
        if (cmd === 'debughappy') {
            if (state.stage === STAGE_EGG) { addMsg(t('msg_debug_egg'), 'warning'); return; }
            state.happy = Math.max(0, state.happy - 1);
            if (state.happy === 0 && !state.happyZeroSince) state.happyZeroSince = Date.now();
            addMsg(t('msg_debug_stat', 'happy', getStatDesc('happy', state.happy).text), 'warning');
            save(); renderStats(); return;
        }
        if (cmd === 'debugpoop') {
            if (state.stage === STAGE_EGG) { addMsg(t('msg_debug_egg'), 'warning'); return; }
            state.poopCount = Math.min(MAX_POOP, state.poopCount + 1);
            if (state.poopCount > 0 && !state.poopDirtySince) state.poopDirtySince = Date.now();
            addMsg(t('msg_debug_stat', 'poop', getStatDesc('poop', state.poopCount).text), 'warning');
            save(); renderPoops(); return;
        }
        if (cmd === 'debugreset') {
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
            saveDex(dex);
            addMsg(t('msg_debug_dex_all', allForms.length), 'warning');
            return;
        }
        if (cmd === 'debugdexclear') {
            localStorage.removeItem(DEX_KEY);
            addMsg(t('msg_debug_dex_clear'), 'warning');
            return;
        }
        if (cmd === 'debugstatus' || cmd === 'status') {
            doStatus();
            return;
        }
        if (cmd === 'debugdeath') {
            if (state.stage < STAGE_EVO2) { addMsg(t('msg_debug_death_err'), 'warning'); return; }
            triggerDeath();
            return;
        }
        if (cmd === 'debughofclear') {
            localStorage.removeItem(HOF_KEY);
            addMsg(t('msg_debug_hof_clear'), 'warning');
            return;
        }
        if (cmd === 'debugevolve') {
            if (state.stage === STAGE_EGG) { addMsg(t('msg_debug_egg_hatch_err'), 'warning'); return; }
            if (state.stage >= STAGE_EVO2) { addMsg(t('msg_debug_evo_err'), 'warning'); return; }

            if (state.stage === STAGE_BABY) {
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
            // debugfeed apple 5 — add 5 to apple count
            const parts = cmd.split(/\s+/);
            if (parts.length >= 3) {
                const fruitId = parts[1];
                const amount = parseInt(parts[2]);
                if (state.feedCount[fruitId] !== undefined && !isNaN(amount)) {
                    state.feedCount[fruitId] += amount;
                    addMsg(t('msg_debug_feed', fruitId, amount, state.feedCount[fruitId]), 'warning');
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
                    registerToDex(targetForm.id);
                    save();
                    renderAll();
                    return;
                }
            }
            addMsg(t('msg_debug_setpet_usage'), 'warning');
            return;
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
                doKnock();
            } else {
                addMsg(t('msg_cmd_unknown_egg', raw.trim()), 'error');
            }
            return;
        }

        // Hatched stages
        switch (cmd) {
            case 'feed':   openFeed();   break;
            case 'clean':  doClean();  break;
            case 'play':   doPlay();   break;
            case 'battle': doBattle(); break;
            case 'rename': doRename(); break;
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

    function doFeed() {
        openFeed();
    }

    function handleFeedChoice(cmd) {
        const fruit = FRUITS.find(f => f.id === cmd);
        if (!fruit) {
            const ids = FRUITS.map(f => f.id).join(', ');
            addMsg(t('msg_feed_invalid', ids), 'error');
            return;
        }
        closeFeed();
        state.hunger = Math.min(MAX_HUNGER, state.hunger + 1);
        if (state.hunger > 0) state.hungerZeroSince = null;

        // Track feed count
        state.feedCount[fruit.id] = (state.feedCount[fruit.id] || 0) + 1;

        const fruitName = t(fruit.nameKey) || fruit.id;
        addMsg(t('msg_feed_success', fruit.emoji, fruitName, getPetName(), getStatDesc('hunger', state.hunger).text), 'success');
        showEmotion('😋');
        petSprite.classList.add('happy-jump');
        setTimeout(() => petSprite.classList.remove('happy-jump'), 600);
        save();
        renderStats();
    }

    function doRename() {
        if (battleState) {
            addMsg(t('msg_battle_already'), 'warning');
            return;
        }
        state.isRenaming = true;
        addMsg(t('msg_rename_prompt', getPetName()), 'info');
        cmdInput.placeholder = '...';
    }

    function handleRename(newName) {
        state.isRenaming = false;
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
        // Randomly pick a pest
        const pest = PEST_CONFIG[Math.floor(Math.random() * PEST_CONFIG.length)];
        state.currentPest = pest;
        state.isCleaningMode = true;

        // Render pest info
        pestImg.src = pest.img;
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
        state.currentPest = null;
        cleanOverlay.classList.add('hidden');
        cmdInput.placeholder = t('ui_cmd_prompt');
        renderPoops();
    }

    function handleCleaningInput(cmd) {
        if (!state.currentPest) return;

        if (cmd === state.currentPest.id.toLowerCase()) {
            // Success!
            const poops = poopArea.querySelectorAll('.poop');
            // Even if hidden, we can animate or just update state
            state.poopCount = Math.max(0, state.poopCount - 1);
            if (state.poopCount === 0) state.poopDirtySince = null;

            addMsg(t('msg_clean_success', getStatDesc('poop', state.poopCount).text), 'success');
            showEmotion('🧹');
            
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
        const summary = FRUITS.map(f => `${f.emoji}${t(f.nameKey) || f.name}: ${fc[f.id] || 0}`).join('  ');
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

        // 準備戰鬥數據
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
                if (effect.success && effect.damage > 0) {
                    const defender = effect.attacker === 'p1' ? battleState.opponent : battleState.player;
                    defender.hp -= effect.damage;
                    updateBattleHP();
                    const dSide = effect.attacker === 'p1' ? 'opponent' : 'player';
                    $(`${dSide}-sprite`).classList.add('damage-flash');
                    setTimeout(() => $(`${dSide}-sprite`).classList.remove('damage-flash'), 400);
                }
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
            // Optimization: combined mask processing
            const replacements = [
                { reg: /受到\s*\d+\s*點傷害/g, val: t('msg_battle_dmg') },
                { reg: /HP\s*-\d+/gi, val: t('msg_battle_dmg') },
                { reg: /HP\s*\+\d+/gi, val: t('msg_battle_heal') },
                { reg: /恢復了\s*\d+\s*點\s*HP/g, val: t('msg_battle_heal') },
                { reg: /(攻擊力|atk).*?\+\d+/gi, val: t('msg_battle_atk_up') },
                { reg: /(攻擊力|atk).*?-\d+/gi, val: t('msg_battle_atk_down') },
                { reg: /(防禦力|def).*?\+\d+/gi, val: t('msg_battle_def_up') },
                { reg: /(防禦力|def).*?-\d+/gi, val: t('msg_battle_def_down') },
                { reg: /(速度|spd).*?\+\d+/gi, val: t('msg_battle_spd_up') },
                { reg: /(速度|spd).*?-\d+/gi, val: t('msg_battle_spd_down') },
                { reg: /傷害\s*\+\s*\d+/g, val: t('msg_battle_dmg_up') }
            ];
            replacements.forEach(r => txt = txt.replace(r.reg, r.val));
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

            if (action.triggers && action.triggers.length > 0) {
                for (const trigger of action.triggers) {
                    await new Promise(r => setTimeout(r, 250));
                    setBattleMsg(t('msg_battle_ability', trigger.name, trigger.msg));
                    syncBattleHPFromTrigger(trigger);
                }
            }
        } else {
            setBattleMsg(t('msg_battle_miss', attacker.name));
            
            if (action.triggers && action.triggers.length > 0) {
                for (const trigger of action.triggers) {
                    await new Promise(r => setTimeout(r, 250));
                    setBattleMsg(t('msg_battle_ability', trigger.name, trigger.msg));
                    syncBattleHPFromTrigger(trigger);
                }
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
            p.textContent = '💩';
            
            const colors = ['p-red', 'p-blue', 'p-green', 'p-yellow', 'p-purple', 'p-orange'];
            p.classList.add(colors[Math.floor(Math.random() * colors.length)]);

            const isPlayer = fromSide === 'player';
            
            const startX = isPlayer ? 155 : (rect.width - 155);
            const startY = isPlayer ? (rect.height - 180) : 80;
            const endX = isPlayer ? (rect.width - 155) : 155;
            const endY = isPlayer ? 80 : (rect.height - 180);

            p.style.setProperty('--tx-start', startX + 'px');
            p.style.setProperty('--ty-start', startY + 'px');
            p.style.setProperty('--tx-end', endX + 'px');
            p.style.setProperty('--ty-end', endY + 'px');

            if (type === 'miss') {
                // Player miss: fly to the left; Opponent miss: fly upward (existing behavior)
                const missX = isPlayer ? (endX - 100) : endX;
                const missY = isPlayer ? endY : (endY - 60);
                p.style.setProperty('--tx-miss', missX + 'px');
                p.style.setProperty('--ty-miss', missY + 'px');
                p.classList.add('animate-projectile-miss');
            } else if (type === 'loop') {
                // Loop: fly toward target mid-point then return
                const midX = isPlayer ? (rect.width - 180) : 180;
                const midY = isPlayer ? 130 : (rect.height - 230);
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
        } else {
            const msg = t('msg_battle_lose', getPetName());
            addMsg(msg, 'warning');
            setBattleMsg(msg); // Show in battle UI too
            showEmotion('😢');
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



    dexBackBtn.addEventListener('click', closeDex);
    if ($('clean-back-btn')) $('clean-back-btn').addEventListener('click', closeClean);
    if ($('feed-back-btn')) $('feed-back-btn').addEventListener('click', closeFeed);
    if ($('lang-back-btn')) $('lang-back-btn').addEventListener('click', closeLang);
    if ($('hof-close-btn')) $('hof-close-btn').addEventListener('click', closeHof);
    if ($('feed-choices')) {
        $('feed-choices').addEventListener('click', (e) => {
            const item = e.target.closest('.feed-choice');
            if (item) {
                const cmd = item.querySelector('.feed-choice-cmd').textContent;
                handleFeedChoice(cmd);
            }
        });
    }

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



    // File input listener
    loadFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFileLoad(file);
            loadFileInput.value = ''; // reset so same file can be loaded again
        }
    });

    // Focus input on page load
    window.addEventListener('load', () => {
        init();
        cmdInput.focus();
    });

})();
