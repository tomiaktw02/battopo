/**
 * ABILITY_CONFIG - 寵物特性設定表 (標籤驅動版)
 * 包含特性的名稱、觸發條件與戰鬥效果關鍵字。
 * 
 * 關鍵字說明：
 * - triggerType: preBattle (開戰前), turnStart (回合開始), onAttack (攻擊前判斷), onHit (命中後), onDealDamage (造成傷害), onDamaged (受到傷害), turnEnd (回合結束)
 * - effectType: damage (直接扣血), heal (恢復血量), statMod (屬性修正), bonusDamage (額外傷害)
 * - subCondition: 額外判定條件 (isFirst, isSecond, hitRollUnder, atkOverDef, atkUnderDef, hitCountBatch, hitRollUnderAtk)
 */
const ABILITY_CONFIG = {
    '爆閃羽毛': {
        nameKey: 'ability_feather_name',
        descKey: 'ability_feather_desc',
        triggerType: 'onDamaged',
        effectType: 'multiEffect',
        target: 'attacker',
        effects: [
            { nameKey: 'ability_feather_name', effectType: 'rest', target: 'attacker' },
            { nameKey: 'ability_feather_name', effectType: 'statModPermanent', target: 'attacker', stat: 'atk', val: -1 }
        ]
    },
    '虛空之網': {
        nameKey: 'ability_vweb_name',
        descKey: 'ability_vweb_desc',
        triggerType: 'onDamaged',
        subCondition: 'hitRollUnder',
        conditionVal: 2,
        effectType: 'heal',
        target: 'self',
        val: 1
    },
    '快速脫離': {
        nameKey: 'ability_escape_name',
        descKey: 'ability_escape_desc',
        triggerType: 'onHit',
        subCondition: 'isFirst',
        effectType: 'statMod',
        target: 'opponent',
        stat: 'atk',
        val: -10,
        duration: 'thisTurn'
    },
    '灼燒之拳': {
        nameKey: 'ability_burnpunch_name',
        descKey: 'ability_burnpunch_desc',
        triggerType: 'onHit',
        subCondition: 'atkPlus3UnderDef',
        oncePerBattle: true,
        effectType: 'bonusDamage',
        val: 1
    },
    '投擲火球': {
        nameKey: 'ability_fireball_name',
        descKey: 'ability_fireball_desc',
        triggerType: 'preBattle',
        subCondition: 'hitRollUnderAtk',
        effectType: 'damage',
        target: 'opponent',
        val: 1
    },
    '自然恢復': {
        nameKey: 'ability_nrecover_name',
        descKey: 'ability_nrecover_desc',
        triggerType: 'onAttack',
        subCondition: 'hitRollUnder',
        conditionVal: 4,
        effectType: 'heal',
        target: 'self',
        val: 1
    },
    '靜電麻痺': {
        nameKey: 'ability_static_name',
        descKey: 'ability_static_desc',
        triggerType: 'onHit',
        subCondition: 'hitRollUnder',
        conditionVal: 5,
        effectType: 'multiEffect',
        effects: [
            { nameKey: 'ability_static_name', effectType: 'statMod', stat: 'atk', val: -10, target: 'opponent', duration: 'nextTurn' },
            { nameKey: 'ability_static_name', effectType: 'statMod', stat: 'def', val: -10, target: 'opponent', duration: 'nextTurn' },
            { nameKey: 'ability_static_name', effectType: 'statMod', stat: 'spd', val: -10, target: 'opponent', duration: 'nextTurn' }
        ]
    },
    '果斷出擊': {
        nameKey: 'ability_decisive_name',
        descKey: 'ability_decisive_desc',
        triggerType: 'turnStart',
        subCondition: 'isFirst',
        effectType: 'statMod',
        target: 'opponent',
        stat: 'def',
        val: -10,
        duration: 'thisTurn'
    },
    '狐舞連閃': {
        nameKey: 'ability_foxdance_name',
        descKey: 'ability_foxdance_desc',
        triggerType: 'onHit',
        effectType: 'statMod',
        target: 'self',
        stat: 'def',
        val: 4,
        duration: 'nextTurn'
    },
    '替狐誘餌': {
        nameKey: 'ability_foxbait_name',
        descKey: 'ability_foxbait_desc',
        triggerType: 'turnStart',
        subCondition: 'isSecond',
        effectType: 'statMod',
        target: 'opponent',
        stat: 'atk',
        val: -10,
        duration: 'thisTurn'
    },
    '恐懼凝視': {
        nameKey: 'ability_fear_name',
        descKey: 'ability_fear_desc',
        triggerType: 'onHit',
        effectType: 'statMod',
        target: 'opponent',
        stat: 'spd',
        val: -5,
        duration: 'nextTurn'
    },
    '利爪繫命': {
        nameKey: 'ability_clawtie_name',
        descKey: 'ability_clawtie_desc',
        triggerType: 'onDealDamage',
        subCondition: 'hitCountBatch',
        conditionVal: 3,
        oncePerBattle: true,
        effectType: 'heal',
        target: 'self',
        val: 1
    },
    '噬命毒霧': {
        nameKey: 'ability_venommist_name',
        descKey: 'ability_venommist_desc',
        triggerType: 'turnEnd',
        subCondition: 'consecutiveFirstGE2',
        oncePerBattle: true,
        effectType: 'damage',
        target: 'opponent',
        val: 1
    },
    '毒牙崩解': {
        nameKey: 'ability_toxicfang_name',
        descKey: 'ability_toxicfang_desc',
        triggerType: 'onDealDamage',
        subCondition: 'isFirstDealDamage',
        effectType: 'multiEffect',
        effects: [
            { nameKey: 'ability_toxicfang_name', effectType: 'bonusDamage', val: 1 },
            { nameKey: 'ability_toxicfang_name', effectType: 'statModPermanent', stat: 'atk', val: -12, target: 'self' }
        ]
    },
    '拖行裝甲': {
        nameKey: 'ability_dragarmor_name',
        descKey: 'ability_dragarmor_desc',
        triggerType: 'onHit',
        effectType: 'rest',
        target: 'self'
    },
    '聚氣散華': {
        nameKey: 'ability_aurascatter_name',
        descKey: 'ability_aurascatter_desc',
        triggerType: 'onHit',
        effectType: 'statMod',
        target: 'self',
        stat: 'def',
        val: -10,
        duration: 'nextTurn'
    },
    '重甲解離': {
        nameKey: 'ability_armormelt_name',
        descKey: 'ability_armormelt_desc',
        triggerType: 'turnEnd',
        effectType: 'statModPermanent',
        target: 'self',
        stat: 'def',
        val: -4
    },
    '堅脆白骨': {
        nameKey: 'ability_brittlebone_name',
        descKey: 'ability_brittlebone_desc',
        triggerType: 'onBlock',
        effectType: 'statMod',
        target: 'self',
        stat: 'def',
        val: -16,
        duration: 'nextTurn'
    },
    '怒火熔殼': {
        nameKey: 'ability_rageshell_name',
        descKey: 'ability_rangeshell_desc',
        triggerType: 'turnEnd',
        effectType: 'multiEffect',
        effects: [
            { nameKey: 'ability_rageshell_name', effectType: 'statModPermanent', stat: 'atk', val: 1, target: 'self' },
            { nameKey: 'ability_rageshell_name', effectType: 'statModPermanent', stat: 'def', val: -6, target: 'self' }
        ]
    },
    '飄渺虛甲': {
        nameKey: 'ability_mistyarmor_name',
        descKey: 'ability_mistyarmor_desc',
        triggerType: 'onAttack',
        subCondition: 'isFirst',
        effectType: 'statMod',
        target: 'self',
        stat: 'def',
        val: -15,
        duration: 'thisTurn'
    },
    '潛襲尖牙': {
        nameKey: 'ability_sneakfang_name',
        descKey: 'ability_sneakfang_desc',
        triggerType: 'beforeAttack',
        effectType: 'hitRollMode',
        target: 'self',
        val: 'advantage'
    },
    '毀滅巨拳': {
        nameKey: 'ability_doomfist_name',
        descKey: 'ability_doomfist_desc',
        triggerType: 'beforeAttack',
        effectType: 'hitRollMode',
        target: 'self',
        val: 'sum'
    },
    '過度力竭': {
        nameKey: 'ability_exhausted_name',
        descKey: 'ability_exhausted_desc',
        triggerType: 'onHit',
        subCondition: 'hitRollUnder',
        conditionVal: 3,
        oncePerBattle: true,
        effectType: 'damage',
        target: 'self',
        val: 1
    },
    '秋風散葉': {
        nameKey: 'ability_wiltleaf_name',
        descKey: 'ability_wiltleaf_desc',
        triggerType: 'onBlock',
        subCondition: 'defRollUnder',
        conditionVal: 4,
        oncePerBattle: true,
        effectType: 'damage',
        target: 'self',
        val: 1
    },
    '光散淋漓': {
        nameKey: 'ability_lightscatter_name',
        descKey: 'ability_lightscatter_desc',
        triggerType: 'turnStart',
        subCondition: 'spdRollDiffGE12',
        oncePerBattle: true,
        effectType: 'damage',
        target: 'self',
        val: 1
    }
};

// 如果在 Node.js 環境中運行，則導出模組
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ABILITY_CONFIG;
}
