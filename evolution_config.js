// =========================================================
// Battopo - ?脣?閮剖?銵?// 靽格甇斗?獢?湔敶梢?銝剔??脣?璇辣??閮剖秘?拙?蝔?// =========================================================

const EVOLUTION_CONFIG = {

    // ==================== ???? ====================
    baby: {
        id: 'baby',
        name: '撠暺?,
        emoji: '??,
        img: 'images/pets/baby.png',
        description: '撠??質?擃??????敺株歲??,
        stats: { hp: 1, atk: 4, def: 4, spd: 5 }
    },

    baby_black: {
        id: 'baby_black',
        name: '撠?暺?,
        emoji: '??,
        img: 'images/pets/baby_black.png',
        description: '瘛梢???暺?嚗?潸?敺桀摹?厭?除??,
        stats: { hp: 1, atk: 5, def: 3, spd: 3 }
    },

    // ==================== 銝?脣? (?賡?頝臬?) ====================
    stage1: [
        {
            id: 'mud_pig',
            name: '瘜亦鞊?,
            emoji: '?',
            img: 'images/pets/mud_pig.png',
            condition: 'dirty',
            description: '皜?摨虫?嚗噶靘踵遛4??',
            stats: { hp: 3, atk: 7, def: 11, spd: 4 }
        },
        {
            id: 'rainbow_dove',
            name: '?寧噬暾?,
            emoji: '??儭?,
            img: 'images/pets/rainbow_dove.png',
            condition: 'balanced',
            description: '鈭車憿憌潭??賊?摰?詨?嚗?蝔栽1嚗?,
            stats: { hp: 2, atk: 12, def: 9, spd: 14 }
        },
        {
            id: 'fire_rat',
            name: '?偏曌?,
            emoji: '?',
            img: 'images/pets/fire_rat.png',
            condition: 'most_red',
            description: '蝝憌?賊??憭?,
            stats: { hp: 2, atk: 14, def: 7, spd: 10 }
        },
        {
            id: 'sprout_deer',
            name: '?質?暽?,
            emoji: '?',
            img: 'images/pets/sprout_deer.png',
            condition: 'most_green',
            description: '蝬憌?賊??憭?,
            stats: { hp: 3, atk: 8, def: 9, spd: 10 }
        },
        {
            id: 'spark_cat',
            name: '??鞎?,
            emoji: '??,
            img: 'images/pets/spark_cat.png',
            condition: 'most_light',
            description: '瘛箄憌?賊??憭?,
            stats: { hp: 2, atk: 15, def: 6, spd: 13 }
        },
        {
            id: 'shadow_fox',
            name: '敶梁???,
            emoji: '??',
            img: 'images/pets/shadow_fox.png',
            condition: 'most_dark',
            description: '瘛梯憌?賊??憭?,
            stats: { hp: 2, atk: 13, def: 8, spd: 10 }
        },
        {
            id: 'fist_lion',
            name: '?喳偏??,
            emoji: '??',
            img: 'images/pets/fist_lion.png',
            condition: 'most_orange',
            description: '璈憌?賊??憭?/ ?身??',
            stats: { hp: 2, atk: 14, def: 8, spd: 4 }
        },
    ],

    // ==================== 銝?脣? (暺?頝臬?) ====================
    stage1_black: [
        {
            id: 'shadow_spider',
            name: '敶勗??,
            emoji: '?儭?,
            img: 'images/pets/shadow_spider.png',
            condition: 'hunger_low',
            description: '憌賡?摨虫? / 撟賣??脣?',
            stats: { hp: 2, atk: 14, def: 7, spd: 10 }
        },
        {
            id: 'shadow_turtle',
            name: '?亦樴?,
            emoji: '?',
            img: 'images/pets/shadow_turtle.png',
            condition: 'default',
            description: '?身暺??脣?',
            stats: { hp: 3, atk: 6, def: 12, spd: 5 }
        },
    ],

    // ==================== 鈭??脣? ====================
    // key = 銝????id
    // value = ??瑕??????”嚗銝??斗
    // condition 憿?:
    //   'clean_low'               ??皜?摨虫?嚗噶靘?= MAX_POOP = 4嚗?    //   'clean_high'              ??皜?摨阡?嚗噶靘?= 0嚗?    //   'happy_high'              ??敹急?摨阡?嚗? MAX_HAPPY = 6嚗?    //   'happy_low'               ??敹急?摨虫?嚗? 0嚗?    //   'hunger_low'              ??憌賡?摨虫?嚗? 0嚗?    //   'happy_high_and_clean_high' ??敹急?摨阡? 銝?皜?摨阡?
    //   'default'                 ???身嚗?摨?瘞賊???嚗?    stage2: {

        // ---------- 擃?憓株頝舐?嚗惇蝟鳴? ----------
        mud_pig: [
            {
                id: 'toxic_boar',
                name: '瘥票?惇',
                emoji: '??',
                img: 'images/pets/toxic_boar.png',
                condition: 'clean_low',
                description: '皜?摨虫?嚗噶靘踵遛嚗?,
                stats: { hp: 5, atk: 16, def: 18, spd: 5 },
                ability: '瘥?撏抵圾'
            },
            {
                id: 'junk_boar',
                name: '?撱Ｚ惇',
                emoji: '?儭?,
                img: 'images/pets/junk_boar.png',
                condition: 'happy_high',
                description: '敹急?摨阡?嚗?6嚗?,
                stats: { hp: 5, atk: 14, def: 19, spd: 8 },
                ability: '??鋆'
            },
            {
                id: 'ghost_boar',
                name: '?冽野敶梯惇',
                emoji: '?',
                img: 'images/pets/ghost_boar.png',
                condition: 'default',
                description: '?身',
                stats: { hp: 4, atk: 15, def: 14, spd: 11 }
            },
        ],

        // ---------- 敶抵?﹛頝舐?嚗野憿? ----------
        rainbow_dove: [
            {
                id: 'aurora_eagle',
                name: '璆萄?憭拚溯',
                emoji: '??',
                img: 'images/pets/aurora_eagle.png',
                condition: 'happy_high_and_clean_high',
                description: '敹急?摨阡? + 皜?摨阡?',
                stats: { hp: 4, atk: 18, def: 12, spd: 17 },
                ability: '?瘛?'
            },
            {
                id: 'chaos_crow',
                name: '鈭蔗暾?,
                emoji: '???',
                img: 'images/pets/chaos_crow.png',
                condition: 'clean_low',
                description: '皜?摨虫?',
                stats: { hp: 3, atk: 19, def: 10, spd: 16 },
                ability: '??蝢賣?'
            },
            {
                id: 'flash_falcon',
                name: '?怠???,
                emoji: '??',
                img: 'images/pets/flash_falcon.png',
                condition: 'default',
                description: '?身',
                stats: { hp: 3, atk: 17, def: 11, spd: 19 },
                ability: '敹恍??
            },
        ],

        // ---------- 蝝頝舐?嚗?啁頂嚗?----------
        fire_rat: [
            {
                id: 'blast_rat',
                name: '?撌券?',
                emoji: '?',
                img: 'images/pets/blast_rat.png',
                condition: 'happy_high',
                description: '敹急?摨阡?嚗?6嚗?,
                stats: { hp: 3, atk: 19, def: 10, spd: 14 },
                ability: '?潛?銋'
            },
            {
                id: 'ash_rat',
                name: '?啁瞏?',
                emoji: '?儭?,
                img: 'images/pets/ash_rat.png',
                condition: 'clean_low',
                description: '皜?摨虫?',
                stats: { hp: 3, atk: 16, def: 14, spd: 17 },
                ability: '瞏必撠?'
            },
            {
                id: 'flame_rat',
                name: '??菟?',
                emoji: '?',
                img: 'images/pets/flame_rat.png',
                condition: 'default',
                description: '?身',
                stats: { hp: 3, atk: 18, def: 12, spd: 12 },
                ability: '??怎?'
            },
        ],

        // ---------- 蝬頝舐?嚗?嗥頂嚗?----------
        sprout_deer: [
            {
                id: 'tree_deer',
                name: '?斗邦撌券嘀',
                emoji: '?',
                img: 'images/pets/tree_deer.png',
                condition: 'clean_high',
                description: '皜?摨阡?嚗靘蹂噶嚗?,
                stats: { hp: 5, atk: 14, def: 18, spd: 8 },
                ability: '?除??'
            },
            {
                id: 'wind_deer',
                name: '?暸◢?嘀',
                emoji: '??',
                img: 'images/pets/wind_deer.png',
                condition: 'happy_high',
                description: '敹急?摨阡?嚗?6嚗?,
                stats: { hp: 3, atk: 16, def: 14, spd: 18 },
                ability: '?芰?Ｗ儔'
            },
            {
                id: 'wilt_deer',
                name: '?航??梢嘀',
                emoji: '??',
                img: 'images/pets/wilt_deer.png',
                condition: 'default',
                description: '?身',
                stats: { hp: 4, atk: 17, def: 15, spd: 10 },
                ability: '蝘◢???'
            },
        ],

        // ---------- 暺頝舐?嚗蝟鳴? ----------
        spark_cat: [
            {
                id: 'static_cat',
                name: '?敶梯?',
                emoji: '??,
                img: 'images/pets/static_cat.png',
                condition: 'clean_low',
                description: '皜?摨虫?',
                stats: { hp: 3, atk: 19, def: 10, spd: 18 },
                ability: '?暻餌'
            },
            {
                id: 'hunger_cat',
                name: '憌ａ餈?',
                emoji: '??,
                img: 'images/pets/hunger_cat.png',
                condition: 'hunger_low',
                description: '憌賡?摨虫?嚗?0嚗?,
                stats: { hp: 3, atk: 19, def: 8, spd: 19 },
                ability: '??箸?'
            },
            {
                id: 'thunder_cat',
                name: '?琿??啗?',
                emoji: '??,
                img: 'images/pets/thunder_cat.png',
                condition: 'default',
                description: '?身',
                stats: { hp: 4, atk: 18, def: 10, spd: 17 }
            },
        ],

        // ---------- 蝝怨頝舐?嚗?敶梁頂嚗?----------
        shadow_fox: [
            {
                id: 'phantom_fox',
                name: '撟餃蔣??',
                emoji: '??',
                img: 'images/pets/phantom_fox.png',
                condition: 'happy_high',
                description: '敹急?摨阡?嚗?6嚗?,
                stats: { hp: 3, atk: 19, def: 11, spd: 18 },
                ability: '?????'
            },
            {
                id: 'creep_fox',
                name: '憌Ｗ蔣閰剔?',
                emoji: '??儭?,
                img: 'images/pets/creep_fox.png',
                condition: 'hunger_low',
                description: '憌賡?摨虫?嚗?0嚗?,
                stats: { hp: 3, atk: 19, def: 9, spd: 19 },
                ability: '?輻?隤?'
            },
            {
                id: 'abyss_fox',
                name: '瘛望殿敶梁?',
                emoji: '??',
                img: 'images/pets/abyss_fox.png',
                condition: 'default',
                description: '?身',
                stats: { hp: 4, atk: 18, def: 10, spd: 12 },
                ability: '???'
            },
        ],

        // ---------- 璈頝舐?嚗??頂嚗?----------
        fist_lion: [
            {
                id: 'mega_lion',
                name: '撌冽?啁?',
                emoji: '??',
                img: 'images/pets/mega_lion.png',
                condition: 'happy_low',
                description: '敹急?摨虫?嚗?0嚗?,
                stats: { hp: 5, atk: 19, def: 14, spd: 7 },
                ability: '瘥皛楊??
            },
            {
                id: 'dirty_lion',
                name: '瘙⊿擛亦?',
                emoji: '?儭?,
                img: 'images/pets/dirty_lion.png',
                condition: 'clean_low',
                description: '皜?摨虫?',
                stats: { hp: 5, atk: 18, def: 17, spd: 5 },
                ability: '?閫?'
            },
            {
                id: 'rage_lion',
                name: '?斗???,
                emoji: '?',
                img: 'images/pets/rage_lion.png',
                condition: 'default',
                description: '?身',
                stats: { hp: 4, atk: 19, def: 13, spd: 9 },
                ability: '?漲?垠'
            },
        ],

        // ---------- 暺??嚗??頂 ----------
        shadow_spider: [
            {
                id: 'doom_spider',
                name: '??株?',
                emoji: '?儭?,
                img: 'images/pets/doom_spider.png',
                condition: 'hunger_low',
                description: '憌賡?摨虫? / ?嗥??脣?',
                stats: { hp: 3, atk: 19, def: 12, spd: 16 },
                ability: '?拍蝜怠'
            },
            {
                id: 'venom_spider',
                name: '???嗉?',
                emoji: '??',
                img: 'images/pets/venom_spider.png',
                condition: 'clean_low',
                description: '皜?摨虫? / 瘥??脣?',
                stats: { hp: 3, atk: 18, def: 13, spd: 15 },
                ability: '?砍瘥'
            },
            {
                id: 'void_spider',
                name: '?征蝜雯??,
                emoji: '?儭?,
                img: 'images/pets/void_spider.png',
                condition: 'default',
                description: '?身?脣?',
                stats: { hp: 3, atk: 17, def: 15, spd: 17 },
                ability: '?征銋雯'
            },
        ],

        // ---------- 暺??嚗?樴頂 ----------
        shadow_turtle: [
            {
                id: 'bone_turtle',
                name: '?撉券?',
                emoji: '?',
                img: 'images/pets/bone_turtle.png',
                condition: 'happy_low',
                description: '敹急?摨虫? / 撉賊爸?脣?',
                stats: { hp: 4, atk: 15, def: 19, spd: 4 },
                ability: '???賡爸'
            },
            {
                id: 'hellfire_turtle',
                name: '?撗拚?',
                emoji: '?',
                img: 'images/pets/hellfire_turtle.png',
                condition: 'most_red',
                description: '蝝憌擗菟??憭?/ ?痔?脣?',
                stats: { hp: 5, atk: 18, def: 18, spd: 5 },
                ability: '??挺'
            },
            {
                id: 'mirage_turtle',
                name: '撟賢撟駁?',
                emoji: '?',
                img: 'images/pets/mirage_turtle.png',
                condition: 'default',
                description: '?身?脣?',
                stats: { hp: 4, atk: 17, def: 17, spd: 8 },
                ability: '憌蛹?'
            },
        ],
    },

    // ==================== ?脣???閮剖? ====================
    evo1Time: 1 * 24 * 60 * 60 * 1000,  // 銝?脣?????: 1憭?    evo2Time: 3 * 24 * 60 * 60 * 1000,  // 鈭??脣?????: 3憭?};

// 憒???Node.js ?啣?銝剝?銵????箸芋蝯?if (typeof module !== 'undefined' && module.exports) {
    module.exports = EVOLUTION_CONFIG;
}
