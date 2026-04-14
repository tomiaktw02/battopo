// =========================================================
// Battopo - 進化設定表
// 修改此檔案可直接影響遊戲中的進化條件與預設寵物名稱
// =========================================================

const EVOLUTION_CONFIG = {

    // ==================== 初始型態 ====================
    baby: {
        id: 'baby',
        name: '小白點',
        emoji: '⚪',
        img: 'images/baby.png',
        description: '小型白色生命體，有眼睛，會輕微跳動',
        stats: { hp: 1, atk: 4, def: 4, spd: 5 }
    },

    baby_black: {
        id: 'baby_black',
        name: '小黑點',
        emoji: '⚫',
        img: 'images/baby_black.png',
        description: '深邃的小黑點，散發著微弱的幽暗氣息',
        stats: { hp: 1, atk: 5, def: 3, spd: 3 }
    },

    // ==================== 一階進化 (白點路徑) ====================
    stage1: [
        {
            id: 'mud_pig',
            name: '泥皮豬',
            emoji: '🐷',
            img: 'images/mud_pig.png',
            condition: 'dirty',
            description: '清潔度低（便便滿4個）',
            stats: { hp: 3, atk: 7, def: 11, spd: 4 }
        },
        {
            id: 'rainbow_dove',
            name: '虹羽鴿',
            emoji: '🕊️',
            img: 'images/rainbow_dove.png',
            condition: 'balanced',
            description: '五色飼料數量完全相同（每種≥1）',
            stats: { hp: 2, atk: 12, def: 9, spd: 14 }
        },
        {
            id: 'fire_rat',
            name: '炎尾鼠',
            emoji: '🔥',
            img: 'images/fire_rat.png',
            condition: 'most_apple',
            description: '紅色飼料(蘋果)數量最多',
            stats: { hp: 2, atk: 14, def: 7, spd: 10 }
        },
        {
            id: 'sprout_deer',
            name: '芽角鹿',
            emoji: '🌿',
            img: 'images/sprout_deer.png',
            condition: 'most_guava',
            description: '綠色飼料(芭樂)數量最多',
            stats: { hp: 3, atk: 8, def: 9, spd: 10 }
        },
        {
            id: 'spark_cat',
            name: '閃毛貓',
            emoji: '⚡',
            img: 'images/spark_cat.png',
            condition: 'most_lemon',
            description: '黃色飼料(檸檬)數量最多',
            stats: { hp: 2, atk: 15, def: 6, spd: 13 }
        },
        {
            id: 'shadow_fox',
            name: '影球狐',
            emoji: '🌙',
            img: 'images/shadow_fox.png',
            condition: 'most_grape',
            description: '紫色飼料(葡萄)數量最多',
            stats: { hp: 2, atk: 13, def: 8, spd: 10 }
        },
        {
            id: 'fist_lion',
            name: '拳尾獅',
            emoji: '🦁',
            img: 'images/fist_lion.png',
            condition: 'most_orange',
            description: '橙色飼料(橘子)數量最多 / 預設兜底',
            stats: { hp: 2, atk: 14, def: 8, spd: 4 }
        },
    ],

    // ==================== 一階進化 (黑點路徑) ====================
    stage1_black: [
        {
            id: 'shadow_spider',
            name: '影刺蛛',
            emoji: '🕷️',
            img: 'images/shadow_spider.png',
            condition: 'hunger_low',
            description: '飽食度低 / 幽暗進化',
            stats: { hp: 2, atk: 14, def: 7, spd: 10 }
        },
        {
            id: 'shadow_turtle',
            name: '冥甲龜',
            emoji: '🐢',
            img: 'images/shadow_turtle.png',
            condition: 'default',
            description: '預設黑點進化',
            stats: { hp: 3, atk: 6, def: 12, spd: 5 }
        },
    ],

    // ==================== 二階進化 ====================
    // key = 一階型態 id
    // value = 按判斷優先序排列的候選列表，由上而下判斷
    // condition 類型:
    //   'clean_low'               → 清潔度低（便便 = MAX_POOP = 4）
    //   'clean_high'              → 清潔度高（便便 = 0）
    //   'happy_high'              → 快樂度高（= MAX_HAPPY = 6）
    //   'happy_low'               → 快樂度低（= 0）
    //   'hunger_low'              → 飽食度低（= 0）
    //   'happy_high_and_clean_high' → 快樂度高 且 清潔度高
    //   'default'                 → 預設（兜底，永遠成立）
    stage2: {

        // ---------- 髒髒墮落路線（豬系） ----------
        mud_pig: [
            {
                id: 'toxic_boar',
                name: '毒沼牙豬',
                emoji: '☠️',
                img: 'images/toxic_boar.png',
                condition: 'clean_low',
                description: '清潔度低（便便滿）',
                stats: { hp: 5, atk: 16, def: 18, spd: 5 },
                ability: '毒牙崩解'
            },
            {
                id: 'junk_boar',
                name: '重甲廢豬',
                emoji: '🛡️',
                img: 'images/junk_boar.png',
                condition: 'happy_high',
                description: '快樂度高（=6）',
                stats: { hp: 5, atk: 14, def: 19, spd: 8 },
                ability: '拖行裝甲'
            },
            {
                id: 'ghost_boar',
                name: '怨泥影豬',
                emoji: '👻',
                img: 'images/ghost_boar.png',
                condition: 'default',
                description: '預設',
                stats: { hp: 4, atk: 15, def: 14, spd: 11 }
            },
        ],

        // ---------- 彩色均衡路線（鳥類） ----------
        rainbow_dove: [
            {
                id: 'aurora_eagle',
                name: '極光天鷹',
                emoji: '🦅',
                img: 'images/aurora_eagle.png',
                condition: 'happy_high_and_clean_high',
                description: '快樂度高 + 清潔度高',
                stats: { hp: 4, atk: 18, def: 12, spd: 17 },
                ability: '光散淋漓'
            },
            {
                id: 'chaos_crow',
                name: '亂彩鴉',
                emoji: '🐦‍⬛',
                img: 'images/chaos_crow.png',
                condition: 'clean_low',
                description: '清潔度低',
                stats: { hp: 3, atk: 19, def: 10, spd: 16 },
                ability: '爆閃羽毛'
            },
            {
                id: 'flash_falcon',
                name: '炫光隼',
                emoji: '🦅',
                img: 'images/flash_falcon.png',
                condition: 'default',
                description: '預設',
                stats: { hp: 3, atk: 17, def: 11, spd: 19 },
                ability: '快速脫離'
            },
        ],

        // ---------- 紅色路線（火焰系） ----------
        fire_rat: [
            {
                id: 'blast_rat',
                name: '爆焰巨鼠',
                emoji: '💥',
                img: 'images/blast_rat.png',
                condition: 'happy_high',
                description: '快樂度高（=6）',
                stats: { hp: 3, atk: 19, def: 10, spd: 14 },
                ability: '灼燒之拳'
            },
            {
                id: 'ash_rat',
                name: '灰燼潛鼠',
                emoji: '🌫️',
                img: 'images/ash_rat.png',
                condition: 'clean_low',
                description: '清潔度低',
                stats: { hp: 3, atk: 16, def: 14, spd: 17 },
                ability: '潛襲尖牙'
            },
            {
                id: 'flame_rat',
                name: '烈焰獵鼠',
                emoji: '🔥',
                img: 'images/flame_rat.png',
                condition: 'default',
                description: '預設',
                stats: { hp: 3, atk: 18, def: 12, spd: 12 },
                ability: '投擲火球'
            },
        ],

        // ---------- 綠色路線（自然系） ----------
        sprout_deer: [
            {
                id: 'tree_deer',
                name: '古樹巨鹿',
                emoji: '🌳',
                img: 'images/tree_deer.png',
                condition: 'clean_high',
                description: '清潔度高（無便便）',
                stats: { hp: 5, atk: 14, def: 18, spd: 8 },
                ability: '聚氣散華'
            },
            {
                id: 'wind_deer',
                name: '疾風草鹿',
                emoji: '🍃',
                img: 'images/wind_deer.png',
                condition: 'happy_high',
                description: '快樂度高（=6）',
                stats: { hp: 3, atk: 16, def: 14, spd: 18 },
                ability: '自然恢復'
            },
            {
                id: 'wilt_deer',
                name: '枯葉隱鹿',
                emoji: '🍂',
                img: 'images/wilt_deer.png',
                condition: 'default',
                description: '預設',
                stats: { hp: 4, atk: 17, def: 15, spd: 10 },
                ability: '秋風散葉'
            },
        ],

        // ---------- 黃色路線（電系） ----------
        spark_cat: [
            {
                id: 'static_cat',
                name: '靜電影貓',
                emoji: '⚡',
                img: 'images/static_cat.png',
                condition: 'clean_low',
                description: '清潔度低',
                stats: { hp: 3, atk: 19, def: 10, spd: 18 },
                ability: '靜電麻痺'
            },
            {
                id: 'hunger_cat',
                name: '飢雷迅貓',
                emoji: '⚡',
                img: 'images/hunger_cat.png',
                condition: 'hunger_low',
                description: '飽食度低（=0）',
                stats: { hp: 3, atk: 19, def: 8, spd: 19 },
                ability: '果斷出擊'
            },
            {
                id: 'thunder_cat',
                name: '雷霆戰貓',
                emoji: '⚡',
                img: 'images/thunder_cat.png',
                condition: 'default',
                description: '預設',
                stats: { hp: 4, atk: 18, def: 10, spd: 17 }
            },
        ],

        // ---------- 紫色路線（暗影系） ----------
        shadow_fox: [
            {
                id: 'phantom_fox',
                name: '幻影舞狐',
                emoji: '🦊',
                img: 'images/phantom_fox.png',
                condition: 'happy_high',
                description: '快樂度高（=6）',
                stats: { hp: 3, atk: 19, def: 11, spd: 18 },
                ability: '狐舞連閃'
            },
            {
                id: 'creep_fox',
                name: '飢影詭狐',
                emoji: '👁️',
                img: 'images/creep_fox.png',
                condition: 'hunger_low',
                description: '飽食度低（=0）',
                stats: { hp: 3, atk: 19, def: 9, spd: 19 },
                ability: '替狐誘餌'
            },
            {
                id: 'abyss_fox',
                name: '深淵影狐',
                emoji: '🌑',
                img: 'images/abyss_fox.png',
                condition: 'default',
                description: '預設',
                stats: { hp: 4, atk: 18, def: 10, spd: 12 },
                ability: '恐懼凝視'
            },
        ],

        // ---------- 橙色路線（力量系） ----------
        fist_lion: [
            {
                id: 'mega_lion',
                name: '巨拳戰獅',
                emoji: '🥊',
                img: 'images/mega_lion.png',
                condition: 'happy_low',
                description: '快樂度低（=0）',
                stats: { hp: 5, atk: 19, def: 14, spd: 7 },
                ability: '毀滅巨拳'
            },
            {
                id: 'dirty_lion',
                name: '污鎧鬥獅',
                emoji: '🛡️',
                img: 'images/dirty_lion.png',
                condition: 'clean_low',
                description: '清潔度低',
                stats: { hp: 5, atk: 18, def: 17, spd: 5 },
                ability: '重甲解離'
            },
            {
                id: 'rage_lion',
                name: '憤怒狂獅',
                emoji: '😡',
                img: 'images/rage_lion.png',
                condition: 'default',
                description: '預設',
                stats: { hp: 4, atk: 19, def: 13, spd: 9 },
                ability: '過度力竭'
            },
        ],

        // ---------- 黑點分支：蜘蛛系 ----------
        shadow_spider: [
            {
                id: 'doom_spider',
                name: '厄命鐮蛛',
                emoji: '🕷️',
                img: 'images/doom_spider.png',
                condition: 'hunger_low',
                description: '飽食度低 / 凶猛進化',
                stats: { hp: 3, atk: 19, def: 12, spd: 16 },
                ability: '利爪繫命'
            },
            {
                id: 'venom_spider',
                name: '劇毒晶蛛',
                emoji: '🦂',
                img: 'images/venom_spider.png',
                condition: 'clean_low',
                description: '清潔度低 / 毒素進化',
                stats: { hp: 3, atk: 18, def: 13, spd: 15 },
                ability: '噬命毒霧'
            },
            {
                id: 'void_spider',
                name: '虛空織網蛛',
                emoji: '🕸️',
                img: 'images/void_spider.png',
                condition: 'default',
                description: '預設進化',
                stats: { hp: 3, atk: 17, def: 15, spd: 17 },
                ability: '虛空之網'
            },
        ],

        // ---------- 黑點分支：烏龜系 ----------
        shadow_turtle: [
            {
                id: 'bone_turtle',
                name: '荒蕪骨龜',
                emoji: '🐢',
                img: 'images/bone_turtle.png',
                condition: 'happy_low',
                description: '快樂度低 / 骸骨進化',
                stats: { hp: 4, atk: 15, def: 19, spd: 4 },
                ability: '堅脆白骨'
            },
            {
                id: 'hellfire_turtle',
                name: '獄火岩龜',
                emoji: '🔥',
                img: 'images/hellfire_turtle.png',
                condition: 'most_apple',
                description: '蘋果餵食多 / 熔岩進化',
                stats: { hp: 5, atk: 18, def: 18, spd: 5 },
                ability: '怒火熔殼'
            },
            {
                id: 'mirage_turtle',
                name: '幽冥幻龜',
                emoji: '👻',
                img: 'images/mirage_turtle.png',
                condition: 'default',
                description: '預設進化',
                stats: { hp: 4, atk: 17, def: 17, spd: 8 },
                ability: '飄渺虛甲'
            },
        ],
    },

    // ==================== 進化時間設定 ====================
    evo1Time: 1 * 24 * 60 * 60 * 1000,  // 一階進化所需時間: 1天
    evo2Time: 3 * 24 * 60 * 60 * 1000,  // 二階進化所需時間: 3天
};

// 如果在 Node.js 環境中運行，則導出模組
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EVOLUTION_CONFIG;
}
