/**
 * PEST_CONFIG - 蟲蟲資料庫
 * 包含 30 種蟲蟲的名稱、圖片設定與各語系介紹。
 * 排除蜘蛛。
 */

const PEST_CONFIG = [
    {
        id: "cockroach",
        img: "images/bugs/cockroach.png",
        names: {
            "zh-TW": "蟑螂",
            "en": "Cockroach",
            "ja": "ゴキブリ"
        },
        descriptions: {
            "zh-TW": "能在極端環境下生存，生命力極強的蟲蟲，喜歡陰暗潮濕的地方。",
            "en": "Insects that can survive in extreme environments with very strong vitality, preferring dark and humid places.",
            "ja": "極限の環境でも生き延びることができる、生命力が極めて強いむし。暗く湿った場所を好みます。"
        }
    },
    {
        id: "fly",
        img: "images/bugs/fly.png",
        names: {
            "zh-TW": "蒼蠅",
            "en": "Fly",
            "ja": "ハエ"
        },
        descriptions: {
            "zh-TW": "頻繁飛行於垃圾與食物之間，容易傳播病菌的常見蟲蟲。",
            "en": "Frequent flyers between trash and food, common bugs that easily spread germs.",
            "ja": "ゴミと食べ物の間を頻繁に飛び回り、病原菌を媒介しやすい一般的なむし。"
        }
    },
    {
        id: "mosquito",
        img: "images/bugs/mosquito.png",
        names: {
            "zh-TW": "蚊子",
            "en": "Mosquito",
            "ja": "カ"
        },
        descriptions: {
            "zh-TW": "吸食血液並可能傳播登革熱、瘧疾等疾病的微小昆蟲。",
            "en": "Small insects that suck blood and may transmit diseases such as dengue fever and malaria.",
            "ja": "血を吸い、デング熱やマラリアなどの病気を媒介する可能性のある小さな昆虫。"
        }
    },
    {
        id: "ant",
        img: "images/bugs/ant.png",
        names: {
            "zh-TW": "螞蟻",
            "en": "Ant",
            "ja": "アリ"
        },
        descriptions: {
            "zh-TW": "社會性極強的昆蟲，當牠們成群入侵室內尋找食物時會造成困擾。",
            "en": "Highly social insects that cause trouble when they invade indoors in groups looking for food.",
            "ja": "非常に社会的な昆虫。食べ物を求めて集団で室内に侵入すると厄介です。"
        }
    },
    {
        id: "bedbug",
        img: "images/bugs/bedbug.png",
        names: {
            "zh-TW": "臭蟲",
            "en": "Bedbug",
            "ja": "トコジラミ"
        },
        descriptions: {
            "zh-TW": "隱藏在床墊與家具縫隙中，會在夜間吸食人類血液並引起搔癢。",
            "en": "Hidden in gaps of mattresses and furniture, they suck human blood at night and cause itching.",
            "ja": "マットレスや家具の隙間に隠れ、夜間に人間の血を吸って痒みを引き起こします。"
        }
    },
    {
        id: "flea",
        img: "images/bugs/flea.png",
        names: {
            "zh-TW": "跳蚤",
            "en": "Flea",
            "ja": "ノミ"
        },
        descriptions: {
            "zh-TW": "跳躍力極強的小型寄生蟲，常寄生在寵物身上並叮咬人類。",
            "en": "Small parasites with extreme jumping power, often parasitizing pets and biting humans.",
            "ja": "跳躍力が非常に強い小さな寄生虫。ペットに寄生し、人間を刺すこともあります。"
        }
    },
    {
        id: "tick",
        img: "images/bugs/tick.png",
        names: {
            "zh-TW": "壁蝨",
            "en": "Tick",
            "ja": "ダニ"
        },
        descriptions: {
            "zh-TW": "常出現在草叢中，會附著在生物皮膚上吸血，可能攜帶萊姆病病毒。",
            "en": "Often found in grass, they attach to skin to suck blood and may carry Lyme disease virus.",
            "ja": "草むらによく生息し、生物の皮膚に付着して血を吸います。ライム病などを媒介することもあります。"
        }
    },
    {
        id: "aphid",
        img: "images/bugs/aphid.png",
        names: {
            "zh-TW": "蚜蟲",
            "en": "Aphid",
            "ja": "アブラムシ"
        },
        descriptions: {
            "zh-TW": "吸食植物汁液的小型昆蟲，是園藝與農作物的常見蟲蟲。",
            "en": "Small insects that suck plant sap, common bugs of gardening and crops.",
            "ja": "植物の汁を吸う小さな昆虫。園芸や作物の一般的なむしです。"
        }
    },
    {
        id: "locust",
        img: "images/bugs/locust.png",
        names: {
            "zh-TW": "蝗蟲",
            "en": "Locust",
            "ja": "バッタ"
        },
        descriptions: {
            "zh-TW": "成群結隊時會瘋狂啃食農作物，造成嚴重的農業損失。",
            "en": "When in groups, they frantically devour crops, causing serious agricultural losses.",
            "ja": "集団になると作物を猛烈に食い荒らし、深刻な農業被害をもたらします。"
        }
    },
    {
        id: "termite",
        img: "images/bugs/termite.png",
        names: {
            "zh-TW": "白蟻",
            "en": "Termite",
            "ja": "シロアリ"
        },
        descriptions: {
            "zh-TW": "以木材為食的分泌型昆蟲，對木製品與建築結構具有強大破壞力。",
            "en": "Insects that feed on wood, capable of severely damaging wooden products and building structures.",
            "ja": "木材を主食とする昆虫。木製品や建物の構造に大きなダメージを与えます。"
        }
    },
    {
        id: "silverfish",
        img: "images/bugs/silverfish.png",
        names: {
            "zh-TW": "衣魚",
            "en": "Silverfish",
            "ja": "シミ"
        },
        descriptions: {
            "zh-TW": "喜歡取食含有澱粉或膠質的書籍、衣物，常見於陰暗的書架或櫥櫃。",
            "en": "They enjoy feeding on books and clothes containing starch or glue, often found in dark bookshelves or cabinets.",
            "ja": "澱粉や糊を含む本や衣類を好み、暗い本棚やクローゼットでよく見かけられます。"
        }
    },
    {
        id: "weevil",
        img: "images/bugs/weevil.png",
        names: {
            "zh-TW": "象鼻蟲",
            "en": "Weevil",
            "ja": "ゾウムシ"
        },
        descriptions: {
            "zh-TW": "具有像象鼻一樣的口器，是儲藏穀物如稻米中的常見蟲蟲。",
            "en": "Having mouthparts like an elephant's trunk, they are common bugs in stored grains like rice.",
            "ja": "象の鼻のような口器を持ち、米などの貯蔵穀物に発生する一般的なむし。"
        }
    },
    {
        id: "fruitfly",
        img: "images/bugs/fruitfly.png",
        names: {
            "zh-TW": "果實蠅",
            "en": "Fruit Fly",
            "ja": "ショウジョウバエ"
        },
        descriptions: {
            "zh-TW": "常盤旋在熟透或腐爛的水果周圍，繁殖速度極快。",
            "en": "Often hovering around ripe or rotting fruit, they reproduce extremely quickly.",
            "ja": "熟した果物やくさった果物の周りをよく飛び回り、繁殖スピードが非常に速いです。"
        }
    },
    {
        id: "moth",
        img: "images/bugs/moth.png",
        names: {
            "zh-TW": "蛾",
            "en": "Moth",
            "ja": "ガ"
        },
        descriptions: {
            "zh-TW": "夜間活動居多，其幼蟲會啃食衣物纖維，造成孔洞。",
            "en": "Mostly active at night, their larvae devour clothing fibers, causing holes.",
            "ja": "夜間に活動することが多く、幼虫は衣類の繊維を食べて穴を開けてしまいます。"
        }
    },
    {
        id: "carpetbeetle",
        img: "images/bugs/carpetbeetle.png",
        names: {
            "zh-TW": "地毯甲蟲",
            "en": "Carpet Beetle",
            "ja": "ヒメマルカツオブシムシ"
        },
        descriptions: {
            "zh-TW": "其幼蟲會破壞羊毛、地毯與皮革製品，是居家紡織品的敵人。",
            "en": "Their larvae damage wool, carpets, and leather products, enemies of home textiles.",
            "ja": "その幼虫はウールやカーペット、皮革製品を破壊し、家庭用繊維製品の敵となります。"
        }
    },
    {
        id: "earwig",
        img: "images/bugs/earwig.png",
        names: {
            "zh-TW": "蠼螋",
            "en": "Earwig",
            "ja": "ハサミムシ"
        },
        descriptions: {
            "zh-TW": "腹部末端有一對剪刀狀的尾鋏，喜歡躲在潮濕陰冷縫隙中的雜食昆蟲。",
            "en": "Omnivorous insects with pincers at the end of their abdomen, likes to hide in damp and cold cracks.",
            "ja": "腹部の末端にハサミのような尾鋏を持つ。湿った冷たい隙間に隠れるのが好きな雑食性の昆虫。"
        }
    },
    {
        id: "centipede",
        img: "images/bugs/centipede.png",
        names: {
            "zh-TW": "蜈蚣",
            "en": "Centipede",
            "ja": "ムカデ"
        },
        descriptions: {
            "zh-TW": "多足的肉食性節肢動物，雖然會捕食其他昆蟲，但具備毒腺且叮咬疼痛。",
            "en": "Many-legged carnivorous arthropods; while preying on other insects, they have venom glands and their bites are painful.",
            "ja": "多足の肉食性節足動物。他の昆虫を捕食しますが、毒腺を持ち、噛まれると非常に痛みます。"
        }
    },
    {
        id: "millipede",
        img: "images/bugs/millipede.png",
        names: {
            "zh-TW": "馬陸",
            "en": "Millipede",
            "ja": "ヤスデ"
        },
        descriptions: {
            "zh-TW": "身體細長呈圓筒狀，受驚嚇時會捲縮成螺旋狀，以腐殖質為食。",
            "en": "Slender and cylindrical body, curls into a spiral when startled, feeds on humus.",
            "ja": "細長い円筒形の体を持ち、驚くと螺旋状に丸まります。腐植質を食べて生きています。"
        }
    },
    {
        id: "slug",
        img: "images/bugs/slug.png",
        names: {
            "zh-TW": "蛞蝓",
            "en": "Slug",
            "ja": "ナメクジ"
        },
        descriptions: {
            "zh-TW": "像沒殼的蝸牛，身上帶有黏液，常出沒於潮濕環境並啃食葉片。",
            "en": "Like snails without shells, covered in slime, often appearing in damp environments and devouring leaves.",
            "ja": "殻のないカタツムリのような姿で、体にぬめりがあります。湿った場所に現れ、葉を食い荒らします。"
        }
    },
    {
        id: "snail",
        img: "images/bugs/snail.png",
        names: {
            "zh-TW": "蝸牛",
            "en": "Snail",
            "ja": "カタツムリ"
        },
        descriptions: {
            "zh-TW": "攜帶著螺旋狀硬殼的軟體動物，移動緩慢，但對嫩芽有巨大的食慾。",
            "en": "Mollusks carrying a spiral hard shell, moving slowly but having a huge appetite for sprouts.",
            "ja": "螺旋状の硬い殻を持つ軟体動物。移動は遅いですが、新芽に対する旺盛な食欲を持っています。"
        }
    },
    {
        id: "woodlice",
        img: "images/bugs/woodlice.png",
        names: {
            "zh-TW": "潮蟲",
            "en": "Woodlice",
            "ja": "ダンゴムシ"
        },
        descriptions: {
            "zh-TW": "喜歡生活在枯枝落葉下的甲殼類動物，雖然不算蟲蟲，但大量出現時令人不適。",
            "en": "Crustaceans that stay under fallen leaves; while not strictly bugs, they can be unpleasant in large numbers.",
            "ja": "枯葉の下などに生息する甲殻類。むしではありませんが、大量に発生すると不快に感じられます。"
        }
    },
    {
        id: "mealybug",
        img: "images/bugs/mealybug.png",
        names: {
            "zh-TW": "粉介殼蟲",
            "en": "Mealybug",
            "ja": "コナカイガラムシ"
        },
        descriptions: {
            "zh-TW": "身體覆蓋白色蠟粉，會吸食植物汁液，是植物愛好者的噩夢。",
            "en": "Body covered in white waxy powder, sucks plant sap, a nightmare for plant lovers.",
            "ja": "体が白いロウ状の粉で覆われており、植物の汁を吸います。植物愛好家にとっては天敵です。"
        }
    },
    {
        id: "caterpillar",
        img: "images/bugs/caterpillar.png",
        names: {
            "zh-TW": "毛毛蟲",
            "en": "Caterpillar",
            "ja": "ケムシ"
        },
        descriptions: {
            "zh-TW": "鱗翅目昆蟲的幼蟲，食量巨大，身上可能有引起皮膚紅腫的刺毛。",
            "en": "Larvae of Lepidoptera insects with a huge appetite, may have stinging hairs that cause skin swelling.",
            "ja": "チョウやガの幼虫で非常に食欲旺盛。皮膚の腫れを引き起こす刺毛（しもう）を持つものもいます。"
        }
    },
    {
        id: "grasshopper",
        img: "images/bugs/grasshopper.png",
        names: {
            "zh-TW": "蚱蜢",
            "en": "Grasshopper",
            "ja": "バッタ"
        },
        descriptions: {
            "zh-TW": "擅長跳躍的昆蟲，會啃食園藝植物的葉片與莖部。",
            "en": "Insects specialized at jumping, devouring leaves and stems of horticultural plants.",
            "ja": "ジャンプが得意な昆虫。園芸植物の葉や茎を食べてしまいます。"
        }
    },
    {
        id: "cricket",
        img: "images/bugs/cricket.png",
        names: {
            "zh-TW": "蟋蟀",
            "en": "Cricket",
            "ja": "コオロギ"
        },
        descriptions: {
            "zh-TW": "會發出鳴叫聲的昆蟲，有時會成群出現並對幼苗造成傷害。",
            "en": "Chirping insects that sometimes appear in swarms and cause damage to seedlings.",
            "ja": "鳴き声を出す昆虫。時として集団で現れ、苗木にダメージを与えることがあります。"
        }
    },
    {
        id: "wasp",
        img: "images/bugs/wasp.png",
        names: {
            "zh-TW": "黃蜂",
            "en": "Wasp",
            "ja": "スズメバチ"
        },
        descriptions: {
            "zh-TW": "具備強烈攻擊性與毒性的昆蟲，在生活區域築巢時會對人類造成威脅。",
            "en": "Highly aggressive and venomous insects, posing a threat to humans when nesting in living areas.",
            "ja": "攻撃性が高く毒を持つ昆虫。生活圏に巣を作ると人間に危害を及ぼす恐れがあります。"
        }
    },
    {
        id: "horsefly",
        img: "images/bugs/horsefly.png",
        names: {
            "zh-TW": "虻",
            "en": "Horsefly",
            "ja": "アブ"
        },
        descriptions: {
            "zh-TW": "體型較大的蒼蠅類昆蟲，雌性會切開皮膚吸食家畜或人類的血液。",
            "en": "Larger fly-like insects whose females cut skin to suck blood from livestock or humans.",
            "ja": "大型のハエに似た昆蟲。メスは皮膚を切り裂いて家畜や人間の血を吸います。"
        }
    },
    {
        id: "gnat",
        img: "images/bugs/gnat.png",
        names: {
            "zh-TW": "蚋",
            "en": "Gnat",
            "ja": "ブユ"
        },
        descriptions: {
            "zh-TW": "體型微小且常成群飛舞的昆蟲，叮咬後會造成劇烈的紅腫與騷癢。",
            "en": "Tiny insects that often fly in swarms; their bites cause severe swelling and itching.",
            "ja": "極めて小さく、集団で飛び回る昆虫。刺されると激しい腫れや痒みを引き起こします。"
        }
    },
    {
        id: "thrips",
        img: "images/bugs/thrips.png",
        names: {
            "zh-TW": "薊馬",
            "en": "Thrips",
            "ja": "アザミウマ"
        },
        descriptions: {
            "zh-TW": "體型極細微的蟲蟲，會吸食花卉或葉片的汁液導致枯萎萎縮。",
            "en": "Miniscule bugs that suck sap from flowers or leaves, causing wilting and shrinking.",
            "ja": "極めて微細なむし。花や葉の汁を吸い、萎縮や枯死の原因となります。"
        }
    },
    {
        id: "scaleinsect",
        img: "images/bugs/scaleinsect.png",
        names: {
            "zh-TW": "介殼蟲",
            "en": "Scale Insect",
            "ja": "カイガラムシ"
        },
        descriptions: {
            "zh-TW": "固定附著在植物枝幹上並吸食汁液，難以被一般殺蟲劑噴灑殺死。",
            "en": "Fixedly attached to plant branches sucking sap, difficult to kill with general insecticides.",
            "ja": "植物の枝などに固着して汁を吸います。一般的な殺虫剤が効きにくい厄介なむしです。"
        }
    }
];
