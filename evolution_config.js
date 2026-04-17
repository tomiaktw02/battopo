// =========================================================
// Battopo - 分支進化配置表
// 修改此檔案可以調整遊戲中寵物成長各階段的型態與進化條件。
// =========================================================

const EVOLUTION_CONFIG = {

    // ==================== 初始階段 ====================
    baby: {
        id: 'baby',
        name: '小黑點',
        emoji: '⚫',
        img: 'images/pets/baby.png',
        description: '幼年期的基本形式，非常活潑，需要細心照顧才能成長。',
        stats: { hp: 1, atk: 4, def: 4, spd: 5 }
    },

    baby_black: {
        id: 'baby_black',
        name: '小黑點',
        emoji: '⚫',
        img: 'images/pets/baby_black.png',
        description: '深色的小黑點，常隱匿在黑暗的角落裡。',
        stats: { hp: 1, atk: 5, def: 3, spd: 3 }
    },

    // ==================== 一階進化 (普通/彩色) ====================
    stage1: [
        {
            id: 'mud_pig',
            name: '泥巴豬',
            emoji: '🐗',
            img: 'images/pets/mud_pig.png',
            condition: 'dirty',
            description: '環境清潔度低（便便超過4個）。',
            stats: { hp: 3, atk: 7, def: 11, spd: 4 }
        },
        {
            id: 'rainbow_dove',
            name: '彩虹鴿',
            emoji: '🕊️',
            img: 'images/pets/rainbow_dove.png',
            condition: 'balanced',
            description: '五種屬性進食量完全平均（皆大於1）。',
            stats: { hp: 2, atk: 12, def: 9, spd: 14 }
        },
        {
            id: 'fire_rat',
            name: '火花鼠',
            emoji: '🔥',
            img: 'images/pets/fire_rat.png',
            condition: 'most_red',
            description: '紅色水果進食量最多。',
            stats: { hp: 2, atk: 14, def: 7, spd: 10 }
        },
        {
            id: 'sprout_deer',
            name: '嫩芽鹿',
            emoji: '🦌',
            img: 'images/pets/sprout_deer.png',
            condition: 'most_green',
            description: '綠色水果進食量最多。',
            stats: { hp: 3, atk: 8, def: 9, spd: 10 }
        },
        {
            id: 'spark_cat',
            name: '金光貓',
            emoji: '🐈',
            img: 'images/pets/spark_cat.png',
            condition: 'most_light',
            description: '淺色水果進食量最多。',
            stats: { hp: 2, atk: 15, def: 6, spd: 13 }
        },
        {
            id: 'shadow_fox',
            name: '影子狐',
            emoji: '🦊',
            img: 'images/pets/shadow_fox.png',
            condition: 'most_dark',
            description: '深色水果進食量最多。',
            stats: { hp: 2, atk: 13, def: 8, spd: 10 }
        },
        {
            id: 'fist_lion',
            name: '猛火獅',
            emoji: '🦁',
            img: 'images/pets/fist_lion.png',
            condition: 'most_orange',
            description: '橘色水果進食量最多 / 預設進化',
            stats: { hp: 2, atk: 14, def: 8, spd: 4 }
        },
    ],

    // ==================== 一階進化 (黑化分支) ====================
    stage1_black: [
        {
            id: 'shadow_spider',
            name: '影網蜘',
            emoji: '🕷️',
            img: 'images/pets/shadow_spider.png',
            condition: 'hunger_low',
            description: '空腹度低 / 飢餓進化',
            stats: { hp: 2, atk: 14, def: 7, spd: 10 }
        },
        {
            id: 'shadow_turtle',
            name: '黑坦龜',
            emoji: '🐢',
            img: 'images/pets/shadow_turtle.png',
            condition: 'default',
            description: '預設黑化進化',
            stats: { hp: 3, atk: 6, def: 12, spd: 5 }
        },
    ],

    // ==================== 二階進化 ====================
    // key = 一階型態的 id
    // value = 各種判定下可能轉向的型態清單，由上而下判定
    // condition 欄位:
    //   'clean_low'               -> 環境清潔度低（便便 >= MAX_POOP = 4）
    //   'clean_high'              -> 環境清潔度高（便便 = 0）
    //   'happy_high'              -> 快樂度高（= MAX_HAPPY = 6）
    //   'happy_low'               -> 快樂度低（= 0）
    //   'hunger_low'              -> 飢餓度低（= 0）
    //   'happy_high_and_clean_high' -> 快樂度高 且 清潔度高
    //   'default'                 -> 預設分支（保底，若無對應則用此）
    stage2: {

        // ---------- 泥巴豬系列（肉盾系）： ----------
        mud_pig: [
            {
                id: 'toxic_boar',
                name: '猛毒腐甲豬',
                emoji: '🐗',
                img: 'images/pets/toxic_boar.png',
                condition: 'clean_low',
                description: '清潔度低（髒亂環境）。',
                stats: { hp: 5, atk: 16, def: 18, spd: 5 },
                ability: '毒性分泌物'
            },
            {
                id: 'junk_boar',
                name: '森林鎧甲豬',
                emoji: '🐗',
                img: 'images/pets/junk_boar.png',
                condition: 'happy_high',
                description: '快樂度高（=6）。',
                stats: { hp: 5, atk: 14, def: 19, spd: 8 },
                ability: '守護鱗甲'
            },
            {
                id: 'ghost_boar',
                name: '荒野影豬',
                emoji: '🐗',
                img: 'images/pets/ghost_boar.png',
                condition: 'default',
                description: '預設',
                stats: { hp: 4, atk: 15, def: 14, spd: 11 }
            },
        ],

        // ---------- 影狐/彩虹系（神獸系）： ----------
        rainbow_dove: [
            {
                id: 'aurora_eagle',
                name: '極光大天鷹',
                emoji: '🦅',
                img: 'images/pets/aurora_eagle.png',
                condition: 'happy_high_and_clean_high',
                description: '快樂度高 + 清潔度高',
                stats: { hp: 4, atk: 18, def: 12, spd: 17 },
                ability: '神聖閃耀'
            },
            {
                id: 'chaos_crow',
                name: '渾沌鴿',
                emoji: '🕊️',
                img: 'images/pets/chaos_crow.png',
                condition: 'clean_low',
                description: '清潔度低',
                stats: { hp: 3, atk: 19, def: 10, spd: 16 },
                ability: '崩解羽翼'
            },
            {
                id: 'flash_falcon',
                name: '迅疾之隼',
                emoji: '🦅',
                img: 'images/pets/flash_falcon.png',
                condition: 'default',
                description: '預設',
                stats: { hp: 3, atk: 17, def: 11, spd: 19 },
                ability: '極速掠襲'
            },
        ],

        // ---------- 火花系列（火系）： ----------
        fire_rat: [
            {
                id: 'blast_rat',
                name: '爆衝火鼠',
                emoji: '🐹',
                img: 'images/pets/blast_rat.png',
                condition: 'happy_high',
                description: '快樂度高（=6）。',
                stats: { hp: 3, atk: 19, def: 10, spd: 14 },
                ability: '烈焰突進'
            },
            {
                id: 'ash_rat',
                name: '灰燼刺鼠',
                emoji: '🐹',
                img: 'images/pets/ash_rat.png',
                condition: 'clean_low',
                description: '清潔度低',
                stats: { hp: 3, atk: 16, def: 14, spd: 17 },
                ability: '焦土領域'
            },
            {
                id: 'flame_rat',
                name: '熔火噴鼠',
                emoji: '🔥',
                img: 'images/pets/flame_rat.png',
                condition: 'default',
                description: '預設',
                stats: { hp: 3, atk: 18, def: 12, spd: 12 },
                ability: '岩漿吐息'
            },
        ],

        // ---------- 嫩芽系列（草系）： ----------
        sprout_deer: [
            {
                id: 'tree_deer',
                name: '森羅古鹿',
                emoji: '🦌',
                img: 'images/pets/tree_deer.png',
                condition: 'clean_high',
                description: '清潔度高（無任何便便）。',
                stats: { hp: 5, atk: 14, def: 18, spd: 8 },
                ability: '森林賜予'
            },
            {
                id: 'wind_deer',
                name: '蒼翠疾鹿',
                emoji: '🦌',
                img: 'images/pets/wind_deer.png',
                condition: 'happy_high',
                description: '快樂度高（=6）。',
                stats: { hp: 3, atk: 16, def: 14, spd: 18 },
                ability: '翠影步法'
            },
            {
                id: 'wilt_deer',
                name: '枯榮之鹿',
                emoji: '🦌',
                img: 'images/pets/wilt_deer.png',
                condition: 'default',
                description: '預設',
                stats: { hp: 4, atk: 17, def: 15, spd: 10 },
                ability: '靈氣轉換'
            },
        ],

        // ---------- 金光系列（雷系）： ----------
        spark_cat: [
            {
                id: 'static_cat',
                name: '靜電幻貓',
                emoji: '🐈',
                img: 'images/pets/static_cat.png',
                condition: 'clean_low',
                description: '清潔度低',
                stats: { hp: 3, atk: 19, def: 10, spd: 18 },
                ability: '靜電屏障'
            },
            {
                id: 'hunger_cat',
                name: '飢荒虎豹',
                emoji: '🐈',
                img: 'images/pets/hunger_cat.png',
                condition: 'hunger_low',
                description: '飢餓度低（=0）。',
                stats: { hp: 3, atk: 19, def: 8, spd: 19 },
                ability: '飢渴爆發'
            },
            {
                id: 'thunder_cat',
                name: '雷鳴戰貓',
                emoji: '🐈',
                img: 'images/pets/thunder_cat.png',
                condition: 'default',
                description: '預設',
                stats: { hp: 4, atk: 18, def: 10, spd: 17 }
            },
        ],

        // ---------- 影狐系列（暗影系）： ----------
        shadow_fox: [
            {
                id: 'phantom_fox',
                name: '幽影幻狐',
                emoji: '🦊',
                img: 'images/pets/phantom_fox.png',
                condition: 'happy_high',
                description: '快樂度高（=6）。',
                stats: { hp: 3, atk: 19, def: 11, spd: 18 },
                ability: '幻影替身'
            },
            {
                id: 'creep_fox',
                name: '飢影咒狐',
                emoji: '🦊',
                img: 'images/pets/creep_fox.png',
                condition: 'hunger_low',
                description: '飢餓度低（=0）。',
                stats: { hp: 3, atk: 19, def: 9, spd: 19 },
                ability: '幽冥之語'
            },
            {
                id: 'abyss_fox',
                name: '深淵影狐',
                emoji: '🦊',
                img: 'images/pets/abyss_fox.png',
                condition: 'default',
                description: '預設',
                stats: { hp: 4, atk: 18, def: 10, spd: 12 },
                ability: '深淵之噬'
            },
        ],

        // ---------- 猛火系列（獅子系）： ----------
        fist_lion: [
            {
                id: 'mega_lion',
                name: '巨型悍獅',
                emoji: '🦁',
                img: 'images/pets/mega_lion.png',
                condition: 'happy_low',
                description: '快樂度低（=0）。',
                stats: { hp: 5, atk: 19, def: 14, spd: 7 },
                ability: '霸者重擊'
            },
            {
                id: 'dirty_lion',
                name: '穢垢猛獅',
                emoji: '🦁',
                img: 'images/pets/dirty_lion.png',
                condition: 'clean_low',
                description: '清潔度低',
                stats: { hp: 5, atk: 18, def: 17, spd: 5 },
                ability: '汙染咆哮'
            },
            {
                id: 'rage_lion',
                name: '狂怒獅王',
                emoji: '🦁',
                img: 'images/pets/rage_lion.png',
                condition: 'default',
                description: '預設',
                stats: { hp: 4, atk: 19, def: 13, spd: 9 },
                ability: '熾熱狂怒'
            },
        ],

        // ---------- 黑化分支：影蜘系列 ----------
        shadow_spider: [
            {
                id: 'doom_spider',
                name: '死劫蜘',
                emoji: '🕷️',
                img: 'images/pets/doom_spider.png',
                condition: 'hunger_low',
                description: '飢餓度低 / 噩兆進化',
                stats: { hp: 3, atk: 19, def: 12, spd: 16 },
                ability: '死亡纏繞'
            },
            {
                id: 'venom_spider',
                name: '毒腺蛛',
                emoji: '🕷️',
                img: 'images/pets/venom_spider.png',
                condition: 'clean_low',
                description: '清潔度低 / 毒素進化',
                stats: { hp: 3, atk: 18, def: 13, spd: 15 },
                ability: '毒網禁錮'
            },
            {
                id: 'void_spider',
                name: '亡魂蜘',
                emoji: '🕷️',
                img: 'images/pets/void_spider.png',
                condition: 'default',
                description: '預設黑化進化',
                stats: { hp: 3, atk: 17, def: 15, spd: 17 },
                ability: '亡魂之網'
            },
        ],

        // ---------- 黑化分支：黑龜系列 ----------
        shadow_turtle: [
            {
                id: 'bone_turtle',
                name: '骸骨坦龜',
                emoji: '🐢',
                img: 'images/pets/bone_turtle.png',
                condition: 'happy_low',
                description: '快樂度低 / 坦魂進化',
                stats: { hp: 4, atk: 15, def: 19, spd: 4 },
                ability: '靈魂盾牆'
            },
            {
                id: 'hellfire_turtle',
                name: '獄火龜',
                emoji: '🔥',
                img: 'images/pets/hellfire_turtle.png',
                condition: 'most_red',
                description: '紅色水果進食量最多 / 炎帝進化',
                stats: { hp: 5, atk: 18, def: 18, spd: 5 },
                ability: '怒火反彈'
            },
            {
                id: 'mirage_turtle',
                name: '幻象龜',
                emoji: '🐢',
                img: 'images/pets/mirage_turtle.png',
                condition: 'default',
                description: '預設黑化進化',
                stats: { hp: 4, atk: 17, def: 17, spd: 8 },
                ability: '鏡像防禦'
            },
        ],
    },

    // ==================== 進化時間設定 ====================
    evo1Time: 1 * 24 * 60 * 60 * 1000,  // 一階進化所需時間: 1天
    evo2Time: 2 * 24 * 60 * 60 * 1000,  // 二階進化所需時間: 2天 (孵化後總計 3天)
};

// 如果在 Node.js 環境中運行，則導出模組
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EVOLUTION_CONFIG;
}
