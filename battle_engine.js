/**
 * BattleEngine - 戰鬥運算中心
 * 負責處理所有戰鬥相關的數值計算與流程。
 */
const BattleEngine = (() => {
    'use strict';

    /**
     * 翻譯輔助函式
     */
    const _t = (key, ...args) => {
        if (typeof t === 'function') return t(key, ...args);
        let str = key;
        args.forEach((val, i) => { str = str.replace(`{${i}}`, val); });
        return str;
    };

    /**
     * 擲骰子函數
     * @param {number} sides 面數
     * @returns {number} 1 到 sides 的隨機整數
     */
    function roll(sides) {
        return Math.floor(Math.random() * sides) + 1;
    }

    /**
     * 計算單次攻擊
     * @param {Object} attacker 攻擊者戰鬥狀態
     * @param {Object} defender 防禦者戰鬥狀態
     * @returns {Object} 攻擊結果
     */
    /**
     * 更新有效戰鬥屬性 (預計算修正量)
     * @param {Object} s 戰鬥狀態
     */
    function refreshEffStats(s) {
        const stats = ['atk', 'def', 'spd'];
        s.effStats = {};
        stats.forEach(stat => {
            let val = s.stats[stat];
            // 基礎永久修正
            s.permanentModifiers.forEach(m => { if (m.stat === stat) val += m.val; });
            // 臨時修正
            s.currentTurnModifiers.forEach(m => { if (m.stat === stat) val += m.val; });
            // 限制在 2 ~ 19
            s.effStats[stat] = Math.min(19, Math.max(2, val));
        });
    }

    function calculateAttack(attacker, defender) {
        const currentAtk = attacker.effStats.atk;
        const currentDef = defender.effStats.def;

        // 命中擲骰 D20
        const rawHitRoll = roll(20);
        let hitRoll = rawHitRoll;
        let extraRolls = [];

        const mode = attacker.hitRollMode;
        if (mode === 'advantage') {
            extraRolls.push(roll(20), roll(20));
            hitRoll = Math.min(hitRoll, ...extraRolls);
        } else if (mode === 'disadvantage') {
            extraRolls.push(roll(20), roll(20));
            hitRoll = Math.max(hitRoll, ...extraRolls);
        } else if (mode === 'sum') {
            const r2 = roll(11);
            extraRolls.push(r2);
            hitRoll = hitRoll + r2;
        }

        const hit = (hitRoll === 1) || (hitRoll < 20 && hitRoll <= currentAtk);

        if (!hit) {
            return { hit: false, hitRoll, rawHitRoll, extraRolls, hitRollMode: mode, currentAtk };
        }

        const defRoll = roll(20);
        const blocked = (defRoll === 1) || (defRoll < 20 && defRoll <= currentDef);
        return { hit: true, hitRoll, rawHitRoll, extraRolls, hitRollMode: mode, blocked, defRoll, currentAtk, currentDef };
    }

    /**
     * 模擬完整戰鬥
     * @param {Object} p1 玩家物件
     * @param {Object} p2 對手物件
     * @param {boolean} debugMode 是否顯示詳細日誌點數
     * @returns {Object} 戰鬥完整日誌與結果
     */
    function simulate(p1, p2, debugMode = false) {
        const createBattleState = (p, side) => {
            const s = {
                id: p.id,
                name: p.name,
                side: side, // 'p1' or 'p2'
                ability: (typeof p.ability === 'string') ? ABILITY_CONFIG[p.ability] : p.ability,
                stats: { ...p.stats },
                hp: p.stats.hp,
                maxHp: p.stats.hp,
                hitCount: 0,
                consecutiveFirstMoves: 0,
                consecutiveBlocks: 0,
                consecutiveMisses: 0,
                abilityTriggerCount: 0,
                dealtDamageThisBattle: false,
                firstDealDamageTriggered: false,
                isResting: false,
                hitRollMode: 'normal',
                nextTurnModifiers: [],
                currentTurnModifiers: [],
                permanentModifiers: [],
                effStats: {}
            };
            refreshEffStats(s);
            return s;
        };

        const s1 = createBattleState(p1, 'p1');
        const s2 = createBattleState(p2, 'p2');

        /**
         * 檢查子條件是否成立
         */
        const checkCondition = (pet, opponent, ab, context) => {
            if (!ab.subCondition) return true;
            const { hitRoll, defRoll, oppRoll, myRoll } = context;
            switch (ab.subCondition) {
                case 'isFirst': return pet.movedFirst;
                case 'isSecond': return !pet.movedFirst;
                case 'isFirstDealDamage': return !pet.firstDealDamageTriggered;
                case 'consecutiveFirstGE2': return pet.consecutiveFirstMoves >= 2;
                case 'consecutiveFirstGE3': return pet.consecutiveFirstMoves >= 3;
                case 'hitRollUnder': return (hitRoll || 0) <= (ab.conditionVal || 0);
                case 'defRollUnder': return (defRoll || 0) <= (ab.conditionVal || 0);
                case 'atkOverDef': return hitRoll > defRoll;
                case 'atkUnderDef': return hitRoll < defRoll;
                case 'atkPlus3UnderDef': return (hitRoll + 3) < defRoll;
                case 'spdRollDiffGE12': return (oppRoll - myRoll) >= 12;
                case 'hitRollUnderAtk': return hitRoll <= (hitRoll === 20 ? 20 : pet.effStats.atk);
                default: return true;
            }
        };

        /**
         * 執行效果
         */
        const applyEffect = (pet, opponent, ab, context, logLayer, actionRef) => {
            const target = ab.target === 'opponent' ? opponent : (ab.target === 'attacker' ? context.attacker : pet);
            const val = ab.val || 0;

            switch (ab.effectType) {
                case 'damage':
                    target.hp -= val;
                    const abilityName = _t(ab.nameKey);
                    const dmgMsg = _t('battle_ability_dmg', target.name, abilityName, val);
                    if (logLayer) logLayer.push({ type: 'damage', side: target.side, ability: abilityName, damage: val, msg: dmgMsg });
                    if (actionRef) {
                        // 僅有對對手造成的傷害才計入動作總傷害 tally
                        if (target.side !== pet.side) {
                            actionRef.damage = (actionRef.damage || 0) + val;
                        }
                        actionRef.triggers.push({ type: 'damage', side: target.side, name: abilityName, damage: val, msg: dmgMsg });
                    }
                    break;

                case 'heal':
                    const healAbilityName = _t(ab.nameKey);
                    const healVal = Math.min(target.maxHp - target.hp, val);
                    if (healVal > 0) {
                        target.hp += healVal;
                        const healMsg = _t('battle_ability_heal', target.name, healAbilityName, healVal);
                        if (logLayer) logLayer.push({ type: 'heal', side: target.side, ability: healAbilityName, msg: healMsg });
                        if (actionRef) actionRef.triggers.push({ type: 'heal', side: target.side, name: healAbilityName, healVal: healVal, msg: healMsg });
                    }
                    break;

                case 'statMod':
                    const statAbilityName = _t(ab.nameKey);
                    const mod = { stat: ab.stat, val: val, source: statAbilityName };
                    if (ab.duration === 'nextTurn') {
                        target.nextTurnModifiers.push(mod);
                    } else {
                        target.currentTurnModifiers.push(mod);
                        refreshEffStats(target); // Immediate refresh for current turn buffs
                    }
                    const modMsg = _t('battle_ability_stat', target.name, statAbilityName, ab.stat, (val > 0 ? '+' : '') + val);
                    if (actionRef) actionRef.triggers.push({ type: 'statMod', name: statAbilityName, msg: modMsg });
                    break;

                case 'statModPermanent':
                    const permAbilityName = _t(ab.nameKey);
                    target.permanentModifiers.push({ stat: ab.stat, val: val, source: permAbilityName });
                    refreshEffStats(target); // Immediate refresh
                    const permMsg = _t('battle_ability_stat_perm', target.name, permAbilityName, ab.stat, (val > 0 ? '+' : '') + val);
                    if (actionRef) actionRef.triggers.push({ type: 'statModPermanent', name: permAbilityName, msg: permMsg });
                    break;

                case 'rest':
                    const restAbilityName = _t(ab.nameKey);
                    target.isResting = true;
                    const restMsg = _t('battle_ability_rest', target.name, restAbilityName);
                    if (actionRef) actionRef.triggers.push({ type: 'rest', name: restAbilityName, msg: restMsg });
                    break;

                case 'hitRollMode':
                    const modeAbilityName = _t(ab.nameKey);
                    target.hitRollMode = ab.val; // advantage, disadvantage, sum
                    let modeDesc = '';
                    if (ab.val === 'advantage') modeDesc = _t('log_adv');
                    else if (ab.val === 'disadvantage') modeDesc = _t('log_dis');
                    else if (ab.val === 'sum') modeDesc = _t('log_sum');

                    const modeMsg = _t('battle_ability_mode', target.name, modeDesc);
                    if (actionRef) actionRef.triggers.push({ type: 'hitRollMode', name: modeAbilityName, msg: modeMsg });
                    break;

                case 'multiEffect':
                    if (ab.effects && Array.isArray(ab.effects)) {
                        ab.effects.forEach(subAb => {
                            // 傳遞父級的 nameKey 如果子級沒有 (為了保持一致)
                            if (!subAb.nameKey) subAb.nameKey = ab.nameKey;
                            applyEffect(pet, opponent, subAb, context, logLayer, actionRef);
                        });
                    }
                    break;

                case 'bonusDamage':
                    if (actionRef) {
                        const bonusAbilityName = _t(ab.nameKey);
                        // 計入對手傷害
                        actionRef.damage += val;
                        opponent.hp -= val;
                        actionRef.triggers.push({ type: 'bonusDamage', side: opponent.side, name: bonusAbilityName, damage: val, msg: _t('battle_ability_bonus', bonusAbilityName, val) });
                    }
                    break;
            }
        };

        /**
         * 通用特性執行口
         */
        const triggerAbilities = (pet, opponent, type, context, logLayer, actionRef) => {
            const ab = pet.ability;
            if (ab && ab.triggerType === type) {
                // 如果特性標註為「每場戰鬥僅限一次」
                if (ab.oncePerBattle && pet.abilityTriggerCount > 0) {
                    return;
                }

                if (checkCondition(pet, opponent, ab, context)) {
                    applyEffect(pet, opponent, ab, context, logLayer, actionRef);
                    pet.abilityTriggerCount++;
                }
            }
        };

        const log = {
            p1: { ...p1 },
            p2: { ...p2 },
            turns: [],
            preBattle: [],
            winner: null
        };

        // --- 戰鬥開始前階段 ---
        [s1, s2].forEach((attacker, idx) => {
            const defender = idx === 0 ? s2 : s1;
            triggerAbilities(attacker, defender, 'preBattle', { hitRoll: roll(20) }, log.preBattle);
        });

        let turnCount = 1;
        while (s1.hp > 0 && s2.hp > 0 && turnCount <= 100) {
            const turnData = {
                turn: turnCount,
                actions: []
            };

            // 準備回合修正
            s1.currentTurnModifiers = [...s1.nextTurnModifiers];
            s2.currentTurnModifiers = [...s2.nextTurnModifiers];
            s1.nextTurnModifiers = [];
            s2.nextTurnModifiers = [];
            refreshEffStats(s1);
            refreshEffStats(s2);

            turnData.p1SpdRoll = roll(s1.effStats.spd);
            turnData.p2SpdRoll = roll(s2.effStats.spd);

            s1.movedFirst = false;
            s2.movedFirst = false;

            let first, second, firstSide, secondSide;
            if (turnData.p1SpdRoll >= turnData.p2SpdRoll) {
                first = s1; firstSide = 'p1';
                second = s2; secondSide = 'p2';
            } else {
                first = s2; firstSide = 'p2';
                second = s1; secondSide = 'p1';
            }
            first.movedFirst = true;

            // 更新連續先攻計數
            first.consecutiveFirstMoves++;
            second.consecutiveFirstMoves = 0;

            // --- 回合開始判定 ---
            const turnStartAction = { type: 'turnStart', triggers: [] };
            triggerAbilities(s1, s2, 'turnStart', { myRoll: turnData.p1SpdRoll, oppRoll: turnData.p2SpdRoll }, null, turnStartAction);
            triggerAbilities(s2, s1, 'turnStart', { myRoll: turnData.p2SpdRoll, oppRoll: turnData.p1SpdRoll }, null, turnStartAction);
            if (turnStartAction.triggers.length > 0) turnData.actions.push(turnStartAction);

            const playAction = (attacker, defender, aSide, dSide) => {
                // 每回合、每次行動前重置模式
                attacker.hitRollMode = 'normal';

                // 將破防判定恢復為原本的連續兩次格擋必定破防
                const isGuardBroken = (defender.consecutiveBlocks >= 2);

                const action = {
                    attacker: aSide,
                    defender: dSide,
                    damage: 0,
                    baseDamage: 0,
                    triggers: []
                };

                // 攻擊前判定 (用於設定優劣勢等模式)
                triggerAbilities(attacker, defender, 'beforeAttack', {}, null, action);

                let result;
                // 連續兩次未命中後，下一次必定會因為用力過猛而致命失敗
                if (attacker.consecutiveMisses >= 2) {
                    result = {
                        hit: false,
                        rawHitRoll: 20,
                        hitRoll: 20,
                        extraRolls: [],
                        hitRollMode: attacker.hitRollMode,
                        currentAtk: attacker.effStats.atk
                    };
                } else {
                    result = calculateAttack(attacker, defender);
                }

                // 如果處於破防狀態，強行修改結果為未格擋
                if (isGuardBroken && result.hit) {
                    result.blocked = false;
                    result.guardBroken = true;
                }

                // 檢查是否正在休息
                if (attacker.isResting) {
                    attacker.isResting = false;
                    action.hit = false;
                    action.resting = true;
                    action.triggers.push({ type: 'rest', name: _t('battle_rest_name'), msg: _t('battle_rest_msg', attacker.name) });
                    return action;
                }

                // [Bug Fix] 攻擊致命失敗：加入名稱到訊息中以確保 UI 同步
                if (result.rawHitRoll === 20) {
                    attacker.hp -= 1;
                    attacker.consecutiveMisses = 0; // 重置
                    const failMsg = debugMode
                        ? _t('battle_crit_fail_debug', attacker.name)
                        : _t('battle_crit_fail_msg', attacker.name);
                    action.triggers.push({ type: 'crit_fail', side: aSide, name: _t('battle_crit_fail_name'), msg: failMsg });
                    if (attacker.hp <= 0) return action;
                } else if (!result.hit) {
                    // 一般未命中
                    attacker.consecutiveMisses++;
                }

                // 攻擊時判定
                triggerAbilities(attacker, defender, 'onAttack', result, null, action);

                if (result.hit) {
                    attacker.consecutiveMisses = 0; // 命中對手，重置未命中計數
                    attacker.hitCount++;
                    // 基礎命中傷害
                    const baseDmg = (result.blocked) ? 0 : 1;
                    action.baseDamage = baseDmg;
                    action.damage += baseDmg;
                    defender.hp -= baseDmg;

                    // 檢查防禦致命失敗 (暴露弱點)
                    if (!result.blocked && result.defRoll === 20) {
                        action.damage += 1;
                        defender.hp -= 1;
                        const weakMsg = debugMode
                            ? _t('battle_weak_debug', defender.name)
                            : _t('battle_weak_msg', defender.name);
                        action.triggers.push({ type: 'weakness', side: dSide, name: _t('battle_weak_name'), msg: weakMsg });
                    }

                    if (result.blocked) {
                        defender.consecutiveBlocks++;
                    } else {
                        // 只要造成傷害（包括破防），就重置格擋計數
                        defender.consecutiveBlocks = 0;
                    }

                    // 命中後觸發 (包含加傷或是狀態修正)
                    triggerAbilities(attacker, defender, 'onHit', result, null, action);

                    // 同步最終 result 供後續判斷用
                    Object.assign(action, result);

                    // 被攻擊命中判定
                    if (!result.blocked) {
                        attacker.dealtDamageThisBattle = true;
                        triggerAbilities(attacker, defender, 'onDealDamage', result, null, action);
                        // 判定是否為第一次造成傷害的特性觸發點 (在 onDealDamage 裡可以透過 isFirstDamage 判斷)
                        // 之後將標記設為 true
                        if (!attacker.firstDealDamageTriggered) {
                            attacker.firstDealDamageTriggered = true;
                        }

                        triggerAbilities(defender, attacker, 'onDamaged', { ...result, attacker: attacker }, null, action);
                    } else {
                        // 格擋成功觸發點
                        triggerAbilities(defender, attacker, 'onBlock', result, null, action);
                    }
                }
                return action;
            };

            // 第一波攻擊
            const action1 = playAction(first, second, firstSide, secondSide);
            turnData.actions.push(action1);
            if (s1.hp <= 0 || s2.hp <= 0) {
                log.turns.push(turnData);
                break;
            }

            // 第二波攻擊
            const action2 = playAction(second, first, secondSide, firstSide);
            turnData.actions.push(action2);
            if (s1.hp <= 0 || s2.hp <= 0) {
                log.turns.push(turnData);
                break;
            }

            // --- 回合結束判定 ---
            if (s1.hp > 0 && s2.hp > 0) {
                const endAction = { type: 'endOfTurn', triggers: [] };
                triggerAbilities(s1, s2, 'turnEnd', {}, null, endAction);
                triggerAbilities(s2, s1, 'turnEnd', {}, null, endAction);
                if (endAction.triggers.length > 0) turnData.actions.push(endAction);
            }

            log.turns.push(turnData);
            if (s1.hp <= 0 || s2.hp <= 0) break;
            turnCount++;
        }

        log.winner = s1.hp > 0 ? 'p1' : 'p2';
        log.finalHP = { p1: s1.hp, p2: s2.hp };

        return log;
    }

    /**
     * 將戰鬥日誌轉換為易讀的文字格式
     * @param {Object} log 戰鬥日誌物件
     * @returns {string} 格式化後的文字
     */
    function generateTextLog(log) {
        const lines = [];
        lines.push(`================================================`);
        lines.push(`${_t('log_title')}`);
        lines.push(`================================================\n`);
        lines.push(`${_t('log_vs', log.p1.name, log.p1.stats.hp, log.p2.name, log.p2.stats.hp)}`);
        lines.push(`${_t('log_winner', log.winner === 'p1' ? log.p1.name : log.p2.name)}`);
        lines.push(`${_t('log_hp', log.p1.name, log.finalHP.p1, log.p2.name, log.finalHP.p2)}\n`);

        if (log.preBattle && log.preBattle.length > 0) {
            lines.push(`${_t('log_pre')}`);
            log.preBattle.forEach(e => {
                lines.push(`[${e.ability || _t('ui_trait')}] ${e.msg}`);
            });
            lines.push(``);
        }

        log.turns.forEach(tu => {
            lines.push(`${_t('log_turn_header', tu.turn)}`);
            lines.push(`${_t('log_spd', log.p1.name, tu.p1SpdRoll, log.p2.name, tu.p2SpdRoll)}`);

            tu.actions.forEach(a => {
                if (a.type === 'turnStart') {
                    a.triggers.forEach(tr => lines.push(`${_t('log_start', tr.msg)}`));
                } else if (a.type === 'endOfTurn') {
                    a.triggers.forEach(tr => lines.push(`${_t('log_end', tr.msg)}`));
                } else {
                    const attackerName = a.attacker === 'p1' ? log.p1.name : log.p2.name;
                    const defenderName = a.defender === 'p1' ? log.p1.name : log.p2.name;
                    if (a.resting) {
                        lines.push(`${_t('log_rest', attackerName)}`);
                    } else {
                        lines.push(`${_t('log_atk_title', attackerName, defenderName)}`);
                        let rollMsg = `${a.hitRoll}`;
                        if (a.extraRolls && a.extraRolls.length > 0) {
                            let modeName = '';
                            if (a.hitRollMode === 'advantage') modeName = _t('log_adv');
                            else if (a.hitRollMode === 'disadvantage') modeName = _t('log_dis');
                            else if (a.hitRollMode === 'sum') modeName = _t('log_sum');

                            rollMsg = _t('log_roll_info', a.hitRoll, modeName, [a.hitRoll - (a.hitRollMode === 'sum' ? a.extraRolls[0] : 0), ...a.extraRolls].join(', '));
                        }
                        lines.push(`${_t('log_atk_roll', rollMsg, a.currentAtk, a.hit ? _t('ui_hit') : _t('ui_miss'))}`);
                        if (a.hit) {
                            lines.push(`${_t('log_def_roll', a.defRoll, a.currentDef, a.blocked ? _t('log_blk_true') : _t('log_blk_false'))}`);
                            if (a.guardBroken) {
                                lines.push(`${_t('log_pbf')}`);
                            }
                            lines.push(`${_t('log_dmg', a.damage)}`);
                        }
                    }
                    if (a.triggers && a.triggers.length > 0) {
                        a.triggers.forEach(tr => lines.push(`${_t('log_trig', tr.name, tr.msg)}`));
                    }
                }
            });
            lines.push(``);
        });

        lines.push(`================================================`);
        lines.push(`${_t('log_eof')}`);
        lines.push(`================================================`);
        return lines.join('\n');
    }

    return {
        roll,
        calculateAttack,
        simulate,
        generateTextLog
    };
})();

// 如果在 Node.js 環境中運行，則導出模組
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BattleEngine;
}
