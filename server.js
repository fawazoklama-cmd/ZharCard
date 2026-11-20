// server.ts
import "dotenv/config";
import crypto from "node:crypto";
import path from "node:path";
import express from "express";

// src/data/seedData.ts
var PACK_ARTWORK_URL = "/src/assets/images/pack_artwork_celestial_1795133633051.jpg";
var OFFICIAL_CARDS = [
  {
    id: "zhar_secret_aetherion",
    name: "Aetherion Sang Penjaga Langit",
    nameEn: "Aetherion, Sky Seraph",
    description: "Ksatria bersayap kristal yang menjaga gerbang tertinggi istana awan ZharWorld.",
    descriptionEn: "Crystal-winged knight guarding the highest portal of ZharWorld Cloud Citadel.",
    imageUrl: "/src/assets/images/card_sky_seraph_1795133632808.jpg",
    rarity: "SECRET",
    element: "Light",
    hp: 340,
    attack: 96,
    defense: 74,
    skillName: "Cahaya Kubah Langit",
    skillNameEn: "Celestial Aegis",
    skillDescription: "Memancarkan bilah cahaya suci menembus pertahanan lawan dan memulihkan energi.",
    skillDescriptionEn: "Unleashes a prism blade of pure sky light, piercing enemy guard.",
    template: "Sky Guardian",
    frameStyle: "aurora-prism",
    isHolographic: true,
    isOfficial: true,
    moderationStatus: "approved",
    creatorId: "zharworld_official",
    creatorName: "ZharWorld Official"
  },
  {
    id: "zhar_mythic_solari",
    name: "Ignis Solari Phoenix",
    nameEn: "Ignis Solari Phoenix",
    description: "Phoenix mistik berbulu aurora merah muda dan emas yang lahir di puncak benteng awan.",
    descriptionEn: "Mythic phoenix with rose-gold aurora plumage born atop the crystal cloud citadel.",
    imageUrl: "/src/assets/images/card_mystic_phoenix_1795133632474.jpg",
    rarity: "MYTHIC",
    element: "Fire",
    hp: 310,
    attack: 92,
    defense: 62,
    skillName: "Reinkarnasi Awan",
    skillNameEn: "Aurora Rebirth",
    skillDescription: "Semburan api prismatik yang membakar pertahanan dan menggetarkan arena.",
    skillDescriptionEn: "Prismatic flame burst that scorches enemy armor across the sky arena.",
    template: "Mystic Creature",
    frameStyle: "aurora-prism",
    isHolographic: true,
    isOfficial: true,
    moderationStatus: "approved",
    creatorId: "zharworld_official",
    creatorName: "ZharWorld Official"
  },
  {
    id: "zhar_legend_lumina",
    name: "Lumina Naga Kristal",
    nameEn: "Lumina, Crystal Dragon",
    description: "Naga bersisik safir dan sayap aurora ungu yang melintasi reruntuhan pulau melayang.",
    descriptionEn: "Sapphire-scaled dragon with violet aurora wings soaring across floating sky ruins.",
    imageUrl: "/src/assets/images/card_crystal_dragon_1795133633088.jpg",
    rarity: "LEGENDARY",
    element: "Ice",
    hp: 295,
    attack: 88,
    defense: 68,
    skillName: "Napas Prisma Es",
    skillNameEn: "Prism Frost Breath",
    skillDescription: "Membekukan energi lawan dengan badai serpihan kristal safir.",
    skillDescriptionEn: "Freezes opposing momentum with a storm of sapphire crystal shards.",
    template: "Dragon",
    frameStyle: "gold-celestial",
    isHolographic: true,
    isOfficial: true,
    moderationStatus: "approved",
    creatorId: "zharworld_official",
    creatorName: "ZharWorld Official"
  },
  {
    id: "zhar_legend_vaelis",
    name: "Vaelis Penjelajah Portal",
    nameEn: "Vaelis, Portal Weaver",
    description: "Penyihir astral yang membuka portal biru antar pulau langit menggunakan tongkat runik.",
    descriptionEn: "Astral archmage weaving azure sky portals between floating islands.",
    imageUrl: "/src/assets/images/card_portal_mage_1795133633848.jpg",
    rarity: "LEGENDARY",
    element: "Dark",
    hp: 270,
    attack: 90,
    defense: 58,
    skillName: "Gerbang Dimensi",
    skillNameEn: "Astral Rift",
    skillDescription: "Membuka celah ruang yang membalikkan serangan elemen lawan.",
    skillDescriptionEn: "Tears an astral rift to amplify arcane strike power.",
    template: "Fantasy Hero",
    frameStyle: "gold-celestial",
    isHolographic: true,
    isOfficial: true,
    moderationStatus: "approved",
    creatorId: "zharworld_official",
    creatorName: "ZharWorld Official"
  },
  {
    id: "zhar_epic_voltia",
    name: "Voltia Valkyrie Petir",
    nameEn: "Voltia, Thunder Valkyrie",
    description: "Prajurit cyber-fantasi bersayap badai dengan bilah energi petir biru elektrik.",
    descriptionEn: "Cyber-fantasy storm valkyrie wielding twin electric sky-blue energy blades.",
    imageUrl: "/src/assets/images/card_thunder_valkyrie_1795133633128.jpg",
    rarity: "EPIC",
    element: "Thunder",
    hp: 255,
    attack: 82,
    defense: 54,
    skillName: "Tebasan Kilat Langit",
    skillNameEn: "Skyline Volt Slash",
    skillDescription: "Serangan ganda berkecepatan kilat dengan peluang kritikal tinggi.",
    skillDescriptionEn: "Twin high-voltage blade strike that overwhelms slow defenders.",
    template: "Cyber Warrior",
    frameStyle: "sky-crystal",
    isHolographic: false,
    isOfficial: true,
    moderationStatus: "approved",
    creatorId: "zharworld_official",
    creatorName: "ZharWorld Official"
  },
  {
    id: "zhar_epic_zephyra",
    name: "Zephyra Penari Angin",
    nameEn: "Zephyra, Wind Dancer",
    description: "Penjaga arus angin selatan yang mengendalikan badai awan dengan kipas giok.",
    descriptionEn: "Guardian of southern sky currents dancing atop sunlit cumulus clouds.",
    imageUrl: "/src/assets/images/card_portal_mage_1795133633848.jpg",
    rarity: "EPIC",
    element: "Wind",
    hp: 235,
    attack: 76,
    defense: 52,
    skillName: "Pusaran Badai Awan",
    skillNameEn: "Cloudburst Vortex",
    skillDescription: "Menyerang cepat sambil meningkatkan kelincahan bertahan.",
    skillDescriptionEn: "Sweeps the enemy in a roaring sky vortex.",
    template: "Angel",
    frameStyle: "sky-crystal",
    isHolographic: false,
    isOfficial: true,
    moderationStatus: "approved",
    creatorId: "zharworld_official",
    creatorName: "ZharWorld Official"
  },
  {
    id: "zhar_rare_kairo",
    name: "Kairo Penjaga Samudra Awan",
    nameEn: "Kairo, Sky Tide Knight",
    description: "Ksatria air langit yang mengalirkan air terjun dari pulau-pulau tertinggi.",
    descriptionEn: "Sky tide knight channeling crystal waterfalls across floating islands.",
    imageUrl: "/src/assets/images/card_sky_seraph_1795133632808.jpg",
    rarity: "RARE",
    element: "Water",
    hp: 220,
    attack: 68,
    defense: 55,
    skillName: "Gelombang Safir",
    skillNameEn: "Sapphire Surge",
    skillDescription: "Menghantam lawan dengan tekanan air kristal dari ketinggian.",
    skillDescriptionEn: "Crashes a concentrated tide of sky water onto the opponent.",
    template: "Sky Guardian",
    frameStyle: "sky-crystal",
    isHolographic: false,
    isOfficial: true,
    moderationStatus: "approved",
    creatorId: "zharworld_official",
    creatorName: "ZharWorld Official"
  },
  {
    id: "zhar_rare_terra",
    name: "Golem Batu Melayang",
    nameEn: "Floating Bastion Golem",
    description: "Penjaga kuno yang menyusun fondasi pulau kristal ZharWorld.",
    descriptionEn: "Ancient bastion golem holding together the floating islands of ZharWorld.",
    imageUrl: "/src/assets/images/card_crystal_dragon_1795133633088.jpg",
    rarity: "RARE",
    element: "Earth",
    hp: 260,
    attack: 58,
    defense: 72,
    skillName: "Benteng Granit Langit",
    skillNameEn: "Skyline Bastion",
    skillDescription: "Menghantam tanah sekaligus memperkuat perisai batu.",
    skillDescriptionEn: "Crushes foes with floating monoliths.",
    template: "Mystic Creature",
    frameStyle: "obsidian-void",
    isHolographic: false,
    isOfficial: true,
    moderationStatus: "approved",
    creatorId: "zharworld_official",
    creatorName: "ZharWorld Official"
  },
  {
    id: "zhar_uncommon_spark",
    name: "Pemburu Kilat Awan",
    nameEn: "Cloudstorm Striker",
    description: "Pengintai cepat dari armada udara ZharWorld yang bersenjatakan tombak petir.",
    descriptionEn: "Agile airship scout armed with a crackling sky-volt lance.",
    imageUrl: "/src/assets/images/card_thunder_valkyrie_1795133633128.jpg",
    rarity: "UNCOMMON",
    element: "Thunder",
    hp: 185,
    attack: 56,
    defense: 40,
    skillName: "Tombak Petir",
    skillNameEn: "Volt Lance",
    skillDescription: "Serangan menusuk cepat dengan arus listrik statis.",
    skillDescriptionEn: "Quick piercing strike charged with cloud static.",
    template: "Cyber Warrior",
    frameStyle: "sky-crystal",
    isHolographic: false,
    isOfficial: true,
    moderationStatus: "approved",
    creatorId: "zharworld_official",
    creatorName: "ZharWorld Official"
  },
  {
    id: "zhar_uncommon_ember",
    name: "Penjaga Lentera Matahari",
    nameEn: "Sunlantern Warden",
    description: "Pembawa api suci yang menjaga mercusuar langit di batas awan senja.",
    descriptionEn: "Keeper of the eternal twilight beacon along the outer sky islands.",
    imageUrl: "/src/assets/images/card_mystic_phoenix_1795133632474.jpg",
    rarity: "UNCOMMON",
    element: "Fire",
    hp: 190,
    attack: 58,
    defense: 42,
    skillName: "Kobaran Senja",
    skillNameEn: "Twilight Flare",
    skillDescription: "Melepaskan pijar api emas ke target.",
    skillDescriptionEn: "Launches golden ember flares at the rival card.",
    template: "Fantasy Hero",
    frameStyle: "sky-crystal",
    isHolographic: false,
    isOfficial: true,
    moderationStatus: "approved",
    creatorId: "zharworld_official",
    creatorName: "ZharWorld Official"
  },
  {
    id: "zhar_common_breeze",
    name: "Roh Awan Cumulus",
    nameEn: "Cumulus Cloud Sprite",
    description: "Makhluk mungil ramah yang menemani penjelajah baru di pulau pemula.",
    descriptionEn: "Friendly sky spirit guiding new collectors across the starter islands.",
    imageUrl: "/src/assets/images/zharworld_hero_sky_1795133633282.jpg",
    rarity: "COMMON",
    element: "Wind",
    hp: 150,
    attack: 44,
    defense: 34,
    skillName: "Tiupan Segar",
    skillNameEn: "Breeze Gust",
    skillDescription: "Hembusan angin ringan yang mendorong lawan mundur.",
    skillDescriptionEn: "Light sky gust pushing rivals back.",
    template: "Mystic Creature",
    frameStyle: "sky-crystal",
    isHolographic: false,
    isOfficial: true,
    moderationStatus: "approved",
    creatorId: "zharworld_official",
    creatorName: "ZharWorld Official"
  },
  {
    id: "zhar_common_frost",
    name: "Pengawal Embun Es",
    nameEn: "Frostdew Squire",
    description: "Prajurit muda istana salju melayang yang berlatih setiap fajar.",
    descriptionEn: "Young squire of the floating glacier citadel training at dawn.",
    imageUrl: "/src/assets/images/card_sky_seraph_1795133632808.jpg",
    rarity: "COMMON",
    element: "Ice",
    hp: 160,
    attack: 42,
    defense: 38,
    skillName: "Tameng Embun",
    skillNameEn: "Frost Guard",
    skillDescription: "Hantaman perisai berlapis es tipis.",
    skillDescriptionEn: "Chilling shield bash with crisp frost impact.",
    template: "Sky Guardian",
    frameStyle: "sky-crystal",
    isHolographic: false,
    isOfficial: true,
    moderationStatus: "approved",
    creatorId: "zharworld_official",
    creatorName: "ZharWorld Official"
  },
  {
    id: "zhar_common_aqua",
    name: "Penyelam Awan Biru",
    nameEn: "Azure Skydrop",
    description: "Penjelajah aliran air langit yang mengumpulkan kristal embun murni.",
    descriptionEn: "Sky stream explorer harvesting pure crystal dew.",
    imageUrl: "/src/assets/images/card_portal_mage_1795133633848.jpg",
    rarity: "COMMON",
    element: "Water",
    hp: 155,
    attack: 45,
    defense: 36,
    skillName: "Percikan Kristal",
    skillNameEn: "Crystal Splash",
    skillDescription: "Tembakan tetesan air bertekanan tinggi.",
    skillDescriptionEn: "Pressurized crystal droplet volley.",
    template: "Fantasy Hero",
    frameStyle: "sky-crystal",
    isHolographic: false,
    isOfficial: true,
    moderationStatus: "approved",
    creatorId: "zharworld_official",
    creatorName: "ZharWorld Official"
  },
  {
    id: "zhar_custom_featured_1",
    name: "Seraphina Sayap Awan (Custom)",
    nameEn: "Seraphina Cloudwing (Custom)",
    description: "Kartu komunitas populer karya kreator ZharWorld dengan aura langit cerah.",
    descriptionEn: "Community showcase card forged in the ZharWorld Creator Studio.",
    imageUrl: "/src/assets/images/card_sky_seraph_1795133632808.jpg",
    rarity: "EPIC",
    element: "Light",
    hp: 240,
    attack: 78,
    defense: 56,
    skillName: "Nyanyian Fajar",
    skillNameEn: "Dawn Chorus",
    skillDescription: "Memancarkan gelombang cahaya yang melemahkan serangan gelap.",
    skillDescriptionEn: "Radiates dawn harmonics across the battlefield.",
    template: "Angel",
    frameStyle: "gold-celestial",
    isHolographic: true,
    isOfficial: false,
    moderationStatus: "approved",
    creatorId: "creator_wazzz",
    creatorName: "@wazzz.dotcom"
  }
];
var OFFICIAL_PACKS = [
  {
    id: "starter_pack",
    name: "Starter Pack",
    nameEn: "Starter Pack",
    description: "Pack ramah pemula berisi 3 kartu ZharWorld untuk memulai dek pertamamu.",
    descriptionEn: "Beginner-friendly booster with 3 ZharWorld cards to launch your first deck.",
    price: 100,
    cardCount: 3,
    guaranteedMinRarity: "UNCOMMON",
    dropRates: { COMMON: 55, UNCOMMON: 28, RARE: 11, EPIC: 4, LEGENDARY: 1.5, MYTHIC: 0.4, SECRET: 0.1 },
    artworkUrl: PACK_ARTWORK_URL,
    accentHex: "#75C9FF"
  },
  {
    id: "silver_pack",
    name: "Silver Pack",
    nameEn: "Silver Pack",
    description: "Pack perak dengan peluang lebih tinggi mendapatkan kartu Rare dan Epic.",
    descriptionEn: "Silver sky-forged booster with boosted Rare and Epic pull rates.",
    price: 220,
    cardCount: 4,
    guaranteedMinRarity: "RARE",
    dropRates: { COMMON: 35, UNCOMMON: 32, RARE: 20, EPIC: 9, LEGENDARY: 3, MYTHIC: 0.8, SECRET: 0.2 },
    artworkUrl: PACK_ARTWORK_URL,
    accentHex: "#BDEBFF"
  },
  {
    id: "gold_pack",
    name: "Gold Pack",
    nameEn: "Gold Pack",
    description: "Berisi 4 kartu pilihan dengan jaminan minimal Rare dan peluang besar Epic.",
    descriptionEn: "Contains 4 curated cards with a guaranteed Rare+ slot and elevated Epic odds.",
    price: 420,
    cardCount: 4,
    guaranteedMinRarity: "EPIC",
    dropRates: { COMMON: 20, UNCOMMON: 26, RARE: 28, EPIC: 17, LEGENDARY: 7, MYTHIC: 1.6, SECRET: 0.4 },
    artworkUrl: PACK_ARTWORK_URL,
    accentHex: "#FFD76A"
  },
  {
    id: "diamond_pack",
    name: "Diamond Pack",
    nameEn: "Diamond Pack",
    description: "Kristal langit murni berisi 5 kartu termasuk jaminan Epic atau lebih tinggi.",
    descriptionEn: "Pure sky-crystal booster with 5 cards and guaranteed Epic+ drop.",
    price: 750,
    cardCount: 5,
    guaranteedMinRarity: "EPIC",
    dropRates: { COMMON: 10, UNCOMMON: 18, RARE: 28, EPIC: 26, LEGENDARY: 13, MYTHIC: 4, SECRET: 1 },
    artworkUrl: PACK_ARTWORK_URL,
    accentHex: "#2377B9"
  },
  {
    id: "legendary_pack",
    name: "Legendary Pack",
    nameEn: "Legendary Pack",
    description: "Pack elit Istana Kristal dengan jaminan 1 kartu Legendary atau di atasnya.",
    descriptionEn: "Elite Crystal Citadel pack guaranteeing at least one Legendary+ card.",
    price: 1200,
    cardCount: 5,
    guaranteedMinRarity: "LEGENDARY",
    dropRates: { COMMON: 0, UNCOMMON: 12, RARE: 24, EPIC: 32, LEGENDARY: 22, MYTHIC: 7.5, SECRET: 2.5 },
    artworkUrl: PACK_ARTWORK_URL,
    accentHex: "#A78BFA"
  },
  {
    id: "mystery_pack",
    name: "Mystery Pack",
    nameEn: "Mystery Pack",
    description: "Portal misterius ZharWorld dengan peluang mengejutkan kartu Mythic & Secret.",
    descriptionEn: "Mysterious ZharWorld portal pack with heightened Mythic and Secret odds.",
    price: 950,
    cardCount: 4,
    guaranteedMinRarity: "RARE",
    dropRates: { COMMON: 12, UNCOMMON: 18, RARE: 22, EPIC: 20, LEGENDARY: 15, MYTHIC: 9, SECRET: 4 },
    artworkUrl: PACK_ARTWORK_URL,
    accentHex: "#FFAED2"
  }
];

// src/utils/gameLogic.ts
var RARITY_ORDER = [
  "COMMON",
  "UNCOMMON",
  "RARE",
  "EPIC",
  "LEGENDARY",
  "MYTHIC",
  "SECRET"
];
var RARITY_RANK = {
  COMMON: 1,
  UNCOMMON: 2,
  RARE: 3,
  EPIC: 4,
  LEGENDARY: 5,
  MYTHIC: 6,
  SECRET: 7
};
var ELEMENT_STRENGTHS = {
  Fire: ["Ice", "Wind"],
  Water: ["Fire", "Earth"],
  Wind: ["Earth", "Thunder"],
  Earth: ["Thunder", "Fire"],
  Ice: ["Wind", "Water"],
  Thunder: ["Water", "Ice"],
  Light: ["Dark"],
  Dark: ["Light"]
};
function getElementalMultiplier(attacker, defender) {
  if (ELEMENT_STRENGTHS[attacker]?.includes(defender)) {
    return 1.35;
  }
  if (ELEMENT_STRENGTHS[defender]?.includes(attacker)) {
    return 0.8;
  }
  return 1;
}
function rollRarityFromRates(dropRates, randomFloat01, minRarity = "COMMON") {
  const total = RARITY_ORDER.reduce((acc, r) => acc + Math.max(0, dropRates[r] || 0), 0);
  const clamped = Math.min(0.999999, Math.max(0, randomFloat01));
  let cursor = 0;
  let picked = "COMMON";
  for (const rarity of RARITY_ORDER) {
    const weight = total > 0 ? Math.max(0, dropRates[rarity] || 0) / total : 0;
    cursor += weight;
    if (clamped <= cursor) {
      picked = rarity;
      break;
    }
  }
  if (RARITY_RANK[picked] < RARITY_RANK[minRarity]) {
    return minRarity;
  }
  return picked;
}
function rollPackCards(pack, officialPool, rngFloat) {
  const cards = [];
  let highest = "COMMON";
  for (let i = 0; i < pack.cardCount; i++) {
    const isLastCard = i === pack.cardCount - 1;
    const minRarity = isLastCard ? pack.guaranteedMinRarity : "COMMON";
    const rolledRarity = rollRarityFromRates(pack.dropRates, rngFloat(), minRarity);
    let matching = officialPool.filter((c) => c.rarity === rolledRarity && c.isOfficial);
    if (matching.length === 0) {
      matching = officialPool.filter(
        (c) => RARITY_RANK[c.rarity] >= RARITY_RANK[minRarity] && c.isOfficial
      );
    }
    if (matching.length === 0) {
      matching = officialPool;
    }
    const idx = Math.min(matching.length - 1, Math.floor(rngFloat() * matching.length));
    const chosen = matching[idx];
    cards.push(chosen);
    if (RARITY_RANK[chosen.rarity] > RARITY_RANK[highest]) {
      highest = chosen.rarity;
    }
  }
  return { cards, highestRarity: highest };
}
function resolveBattleTurn(input) {
  const {
    playerCard,
    enemyCard,
    playerAction,
    mode,
    turnCount,
    rngFloat
  } = input;
  let playerHp = Math.max(0, input.playerHp);
  let enemyHp = Math.max(0, input.enemyHp);
  let playerEnergy = Math.min(100, Math.max(0, input.playerEnergy));
  let enemyEnergy = Math.min(100, Math.max(0, input.enemyEnergy));
  const playerMult = getElementalMultiplier(playerCard.element, enemyCard.element);
  const enemyMult = getElementalMultiplier(enemyCard.element, playerCard.element);
  let enemyAction = "attack";
  if (enemyEnergy >= 50 && rngFloat() > 0.38) {
    enemyAction = "skill";
  } else if (enemyHp < enemyCard.hp * 0.35 && rngFloat() > 0.55) {
    enemyAction = "defense";
  }
  const enemyDefending = enemyAction === "defense";
  const playerDefending = playerAction === "defense";
  let playerDamageDealt = 0;
  let playerHealed = 0;
  let enemyDamageDealt = 0;
  if (playerAction === "attack") {
    const raw = playerCard.attack * playerMult - enemyCard.defense * 0.38;
    const variance = 0.92 + rngFloat() * 0.16;
    const base = Math.max(12, Math.round(raw * variance));
    playerDamageDealt = enemyDefending ? Math.max(6, Math.round(base * 0.45)) : base;
    enemyHp = Math.max(0, enemyHp - playerDamageDealt);
    playerEnergy = Math.min(100, playerEnergy + 25);
  } else if (playerAction === "defense") {
    playerHealed = Math.round(playerCard.hp * 0.08);
    playerHp = Math.min(playerCard.hp, playerHp + playerHealed);
    playerEnergy = Math.min(100, playerEnergy + 35);
  } else if (playerAction === "skill") {
    if (playerEnergy >= 50) {
      playerEnergy -= 50;
      const raw = playerCard.attack * 1.65 * playerMult - enemyCard.defense * 0.25;
      const base = Math.max(24, Math.round(raw));
      playerDamageDealt = enemyDefending ? Math.max(12, Math.round(base * 0.55)) : base;
      enemyHp = Math.max(0, enemyHp - playerDamageDealt);
    } else {
      const raw = playerCard.attack * playerMult - enemyCard.defense * 0.38;
      playerDamageDealt = Math.max(10, Math.round(raw));
      enemyHp = Math.max(0, enemyHp - playerDamageDealt);
      playerEnergy = Math.min(100, playerEnergy + 20);
    }
  }
  if (enemyHp > 0) {
    if (enemyAction === "attack") {
      const raw = enemyCard.attack * enemyMult - playerCard.defense * 0.38;
      const variance = 0.9 + rngFloat() * 0.16;
      const base = Math.max(10, Math.round(raw * variance));
      enemyDamageDealt = playerDefending ? Math.max(5, Math.round(base * 0.42)) : base;
      playerHp = Math.max(0, playerHp - enemyDamageDealt);
      enemyEnergy = Math.min(100, enemyEnergy + 25);
    } else if (enemyAction === "defense") {
      enemyHp = Math.min(enemyCard.hp, enemyHp + Math.round(enemyCard.hp * 0.07));
      enemyEnergy = Math.min(100, enemyEnergy + 35);
    } else if (enemyAction === "skill" && enemyEnergy >= 50) {
      enemyEnergy -= 50;
      const raw = enemyCard.attack * 1.55 * enemyMult - playerCard.defense * 0.25;
      const base = Math.max(20, Math.round(raw));
      enemyDamageDealt = playerDefending ? Math.max(10, Math.round(base * 0.5)) : base;
      playerHp = Math.max(0, playerHp - enemyDamageDealt);
    }
  }
  let status = "active";
  let winner = "none";
  let rewardCoins = 0;
  let rewardExp = 0;
  if (enemyHp <= 0) {
    status = "finished";
    winner = "player";
    rewardCoins = mode === "ranked" ? 240 : mode === "casual" ? 140 : 80;
    rewardExp = mode === "ranked" ? 180 : mode === "casual" ? 110 : 60;
  } else if (playerHp <= 0) {
    status = "finished";
    winner = "opponent";
    rewardCoins = mode === "ranked" ? 40 : 25;
    rewardExp = 35;
  }
  return {
    playerHp,
    enemyHp,
    playerEnergy,
    enemyEnergy,
    playerDamageDealt,
    enemyDamageDealt,
    playerHealed,
    enemyAction,
    playerEffective: playerMult > 1,
    enemyEffective: enemyMult > 1,
    status,
    winner,
    rewardCoins,
    rewardExp,
    turnCount: turnCount + 1
  };
}

// server.ts
var app = express();
var PORT = Number(process.env.PORT || 3e3);
var SERVER_SECRET = process.env.ZHARCARD_SIGNING_SECRET || "zharworld-crystal-citadel-secret";
app.use(express.json({ limit: "256kb" }));
var activeTradeLocks = /* @__PURE__ */ new Set();
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "ZharCard Server", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
});
app.post("/api/packs/open", (req, res) => {
  try {
    const { packId, userCoins, customPool, customPacks } = req.body;
    const packCatalog = Array.isArray(customPacks) && customPacks.length > 0 ? customPacks : OFFICIAL_PACKS;
    const pack = packCatalog.find((p) => p.id === packId);
    if (!pack) {
      return res.status(404).json({ error: "Pack not found" });
    }
    const availableCoins = typeof userCoins === "number" && Number.isFinite(userCoins) ? userCoins : 0;
    if (availableCoins < pack.price) {
      return res.status(400).json({ error: "Insufficient virtual coins" });
    }
    const officialPool = Array.isArray(customPool) && customPool.length > 0 ? customPool.filter((c) => c.isOfficial) : OFFICIAL_CARDS.filter((c) => c.isOfficial);
    const csprngFloat = () => crypto.randomInt(0, 1e6) / 1e6;
    const result = rollPackCards(pack, officialPool, csprngFloat);
    const openingId = `po_${crypto.randomUUID().replace(/-/g, "").slice(0, 20)}`;
    const cardIds = result.cards.map((c) => c.id);
    const payloadToSign = `${openingId}:${pack.id}:${pack.price}:${cardIds.join(",")}`;
    const serverSignature = crypto.createHmac("sha256", SERVER_SECRET).update(payloadToSign).digest("hex");
    return res.json({
      openingId,
      packId: pack.id,
      packName: pack.name,
      cost: pack.price,
      cards: result.cards,
      cardIds,
      highestRarity: result.highestRarity,
      serverSignature,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (err) {
    console.error("Pack open error:", err);
    return res.status(500).json({ error: "Failed to process pack opening" });
  }
});
app.post("/api/battle/turn", (req, res) => {
  try {
    const {
      playerCard,
      enemyCard,
      playerHp,
      enemyHp,
      playerEnergy,
      enemyEnergy,
      playerAction,
      mode,
      turnCount
    } = req.body;
    if (!playerCard || !enemyCard || !playerAction) {
      return res.status(400).json({ error: "Missing battle parameters" });
    }
    if (mode === "ranked" && !playerCard.isOfficial) {
      return res.status(403).json({ error: "Custom cards cannot enter Ranked Battle" });
    }
    const csprngFloat = () => crypto.randomInt(0, 1e6) / 1e6;
    const resolution = resolveBattleTurn({
      playerCard,
      enemyCard,
      playerHp: typeof playerHp === "number" ? playerHp : playerCard.hp,
      enemyHp: typeof enemyHp === "number" ? enemyHp : enemyCard.hp,
      playerEnergy: typeof playerEnergy === "number" ? playerEnergy : 0,
      enemyEnergy: typeof enemyEnergy === "number" ? enemyEnergy : 0,
      playerAction,
      mode: mode || "practice",
      turnCount: typeof turnCount === "number" ? turnCount : 0,
      rngFloat: csprngFloat
    });
    return res.json(resolution);
  } catch (err) {
    console.error("Battle turn error:", err);
    return res.status(500).json({ error: "Failed to compute battle turn" });
  }
});
app.post("/api/trades/validate", (req, res) => {
  const { tradeId, sellerId, buyerId } = req.body;
  if (!tradeId || !sellerId || !buyerId) {
    return res.status(400).json({ error: "Missing trade fields" });
  }
  if (sellerId === buyerId) {
    return res.status(400).json({ error: "Cannot trade with yourself" });
  }
  if (activeTradeLocks.has(tradeId)) {
    return res.status(409).json({ error: "Trade already in progress" });
  }
  activeTradeLocks.add(tradeId);
  setTimeout(() => activeTradeLocks.delete(tradeId), 5e3);
  const lockToken = crypto.createHmac("sha256", SERVER_SECRET).update(`${tradeId}:${sellerId}:${buyerId}`).digest("hex");
  return res.json({ approved: true, lockToken });
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer } = await import("vite");
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), "dist");
    app.use(express.static(distDir));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distDir, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ZharCard server listening on http://localhost:${PORT}`);
  });
}
startServer().catch((err) => {
  console.error("Failed to start ZharCard server:", err);
  process.exit(1);
});
