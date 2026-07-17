export type ServiceAxis = "emotional" | "technical" | "hybrid";
export type BillingUnit =
  | "per_game"
  | "per_30_minutes"
  | "per_60_minutes"
  | "package";

export interface SeedGame {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  accent: string;
}

export interface SeedProvider {
  id: string;
  slug: string;
  displayName: string;
  publicGender: "女性" | "男性" | "其他" | "不公開";
  imageUrl: string;
  axis: ServiceAxis;
  headline: string;
  biography: string;
  games: string[];
  rankLabel?: string;
  personaTags: string[];
  voiceTags: string[];
  interactionTags: string[];
  voiceIntro: string;
  emotionalScore: number;
  technicalScore: number;
  reviewCount: number;
  repeatRate: number;
  priceAmountMinor: number;
  currency: "TWD";
  billingUnit: BillingUnit;
  onlineStatus: "online" | "busy" | "offline";
  responseTimeMinutes: number;
  verifiedPhoto: boolean;
  verifiedVoice: boolean;
  verifiedSkill: boolean;
  featured?: boolean;
}

export interface SeedReview {
  id: string;
  providerId: string;
  reviewerName: string;
  createdAt: string;
  gameId: string;
  serviceLabel: string;
  rating: number;
  emotionalScore: number;
  technicalScore: number;
  text: string;
  repeatCustomer: boolean;
}

export const seedGames: SeedGame[] = [
  {
    id: "game_lol",
    slug: "league-of-legends",
    name: "英雄聯盟",
    shortName: "LOL",
    accent: "#d4a855",
  },
  {
    id: "game_valorant",
    slug: "valorant",
    name: "特戰英豪",
    shortName: "VAL",
    accent: "#ff5964",
  },
  {
    id: "game_wildrift",
    slug: "wild-rift",
    name: "英雄聯盟：激鬥峽谷",
    shortName: "激鬥峽谷",
    accent: "#4ba3ff",
  },
];

export const seedProviders: SeedProvider[] = [
  {
    id: "provider_an",
    slug: "xiao-an",
    displayName: "小安",
    publicGender: "女性",
    imageUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1200&q=86",
    axis: "emotional",
    headline: "溫柔陪伴・甜聲・不讓空氣冷掉",
    biography:
      "很會接住話題，也尊重你想安靜的時候。適合下班後放鬆、第一次找陪玩，或只想有人一起打幾場。",
    games: ["game_lol", "game_wildrift"],
    personaTags: ["溫柔", "甜妹", "新手友善"],
    voiceTags: ["清甜", "慢語速"],
    interactionTags: ["主動開話題", "不催單"],
    voiceIntro: "嗨，我是小安。你今天想輕鬆玩，還是想找人好好聊聊？",
    emotionalScore: 4.9,
    technicalScore: 4.1,
    reviewCount: 128,
    repeatRate: 68,
    priceAmountMinor: 14900,
    currency: "TWD",
    billingUnit: "per_30_minutes",
    onlineStatus: "online",
    responseTimeMinutes: 3,
    verifiedPhoto: true,
    verifiedVoice: true,
    verifiedSkill: false,
    featured: true,
  },
  {
    id: "provider_zhe",
    slug: "a-zhe",
    displayName: "阿哲",
    publicGender: "男性",
    imageUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1200&q=86",
    axis: "technical",
    headline: "高端教學・戰術指揮・不嘴人",
    biography:
      "Immortal 段位，會先看你的習慣再給一個能立刻用的重點。沒有吼叫，也不保證不合理的上分結果。",
    games: ["game_valorant"],
    rankLabel: "Immortal・技術證明已驗證",
    personaTags: ["冷靜", "教練型", "不嘴人"],
    voiceTags: ["沉穩", "清楚"],
    interactionTags: ["戰術指揮", "賽後復盤"],
    voiceIntro: "我是阿哲。先打一局讓我看你的決策，我會給你一個最值得先改的重點。",
    emotionalScore: 4.3,
    technicalScore: 4.9,
    reviewCount: 96,
    repeatRate: 61,
    priceAmountMinor: 29900,
    currency: "TWD",
    billingUnit: "per_game",
    onlineStatus: "online",
    responseTimeMinutes: 5,
    verifiedPhoto: true,
    verifiedVoice: true,
    verifiedSkill: true,
    featured: true,
  },
  {
    id: "provider_yu",
    slug: "yu-qing",
    displayName: "雨晴",
    publicGender: "女性",
    imageUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=86",
    axis: "hybrid",
    headline: "有梗不吵・能聊天也能穩穩補位",
    biography:
      "聊天和遊戲節奏各半，不會一直查戶口。你想認真就配合報點，想耍廢也能一起笑。",
    games: ["game_lol", "game_valorant"],
    rankLabel: "鑽石・全能局",
    personaTags: ["自然系", "有梗", "社恐友善"],
    voiceTags: ["自然", "微低音"],
    interactionTags: ["看氣氛", "穩定報點"],
    voiceIntro: "哈囉，我是雨晴。你不用先想好要聊什麼，開遊戲後自然來就好。",
    emotionalScore: 4.8,
    technicalScore: 4.6,
    reviewCount: 184,
    repeatRate: 72,
    priceAmountMinor: 39900,
    currency: "TWD",
    billingUnit: "per_60_minutes",
    onlineStatus: "busy",
    responseTimeMinutes: 12,
    verifiedPhoto: true,
    verifiedVoice: true,
    verifiedSkill: true,
    featured: true,
  },
  {
    id: "provider_mu",
    slug: "xia-mu",
    displayName: "夏木",
    publicGender: "不公開",
    imageUrl:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=86",
    axis: "emotional",
    headline: "安靜傾聽・低刺激・陪你慢慢玩",
    biography:
      "適合不喜歡太熱鬧的人。可以一起排、一起看遊戲內容，也可以不尬聊，只在你想說的時候回應。",
    games: ["game_wildrift"],
    personaTags: ["安靜", "傾聽", "低刺激"],
    voiceTags: ["輕柔", "慢節奏"],
    interactionTags: ["不查戶口", "尊重界線"],
    voiceIntro: "我是夏木。今天不想一直說話也沒關係，我可以安靜陪你玩。",
    emotionalScore: 4.9,
    technicalScore: 3.9,
    reviewCount: 67,
    repeatRate: 76,
    priceAmountMinor: 19900,
    currency: "TWD",
    billingUnit: "per_60_minutes",
    onlineStatus: "online",
    responseTimeMinutes: 4,
    verifiedPhoto: true,
    verifiedVoice: true,
    verifiedSkill: false,
  },
  {
    id: "provider_kai",
    slug: "kai-wen",
    displayName: "凱文",
    publicGender: "男性",
    imageUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=86",
    axis: "hybrid",
    headline: "可靠隊友・會報點・輸了也不甩鍋",
    biography:
      "偏團隊型的全能陪玩。想爬分會一起溝通，想休閒也不會把每局弄得像比賽。",
    games: ["game_valorant", "game_lol"],
    rankLabel: "Ascendant・穩定報點",
    personaTags: ["可靠", "隊友感", "不甩鍋"],
    voiceTags: ["低音", "有精神"],
    interactionTags: ["團隊溝通", "主動補位"],
    voiceIntro: "我是凱文。你告訴我今天想輕鬆還是認真，我會把隊友這個位置做好。",
    emotionalScore: 4.6,
    technicalScore: 4.7,
    reviewCount: 113,
    repeatRate: 64,
    priceAmountMinor: 34900,
    currency: "TWD",
    billingUnit: "per_60_minutes",
    onlineStatus: "offline",
    responseTimeMinutes: 28,
    verifiedPhoto: true,
    verifiedVoice: true,
    verifiedSkill: true,
  },
  {
    id: "provider_lin",
    slug: "lin-lin",
    displayName: "琳琳",
    publicGender: "女性",
    imageUrl:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=86",
    axis: "technical",
    headline: "節奏教學・新手上手・重點講人話",
    biography:
      "擅長把複雜觀念拆成一兩個容易練的目標。適合剛回鍋、換位置，或想知道自己為什麼卡住。",
    games: ["game_lol", "game_wildrift"],
    rankLabel: "Master・教學資格已驗證",
    personaTags: ["耐心", "講人話", "目標導向"],
    voiceTags: ["清晰", "有活力"],
    interactionTags: ["拆解目標", "賽後筆記"],
    voiceIntro: "嗨，我是琳琳。我不會一次塞很多理論，我們先找一個最有效的進步點。",
    emotionalScore: 4.5,
    technicalScore: 4.9,
    reviewCount: 142,
    repeatRate: 69,
    priceAmountMinor: 49900,
    currency: "TWD",
    billingUnit: "per_60_minutes",
    onlineStatus: "online",
    responseTimeMinutes: 6,
    verifiedPhoto: true,
    verifiedVoice: true,
    verifiedSkill: true,
  },
];

export const seedReviews: SeedReview[] = [
  {
    id: "review_an_01", providerId: "provider_an", reviewerName: "阿凱", createdAt: "2026-07-14", gameId: "game_lol",
    serviceLabel: "輕鬆雙排・60 分鐘", rating: 5, emotionalScore: 5, technicalScore: 4.2,
    text: "我本來很怕兩個人沒話講，結果她很會看氣氛。想聊天的時候會接，不想講話也不會一直問，整場很舒服。", repeatCustomer: true,
  },
  {
    id: "review_an_02", providerId: "provider_an", reviewerName: "Wen", createdAt: "2026-07-09", gameId: "game_wildrift",
    serviceLabel: "下班放鬆局・30 分鐘", rating: 4.8, emotionalScore: 5, technicalScore: 3.9,
    text: "聲音跟試聽差不多，沒有刻意裝可愛。輸兩場也不會硬找正能量，這點我反而很喜歡。", repeatCustomer: false,
  },
  {
    id: "review_an_03", providerId: "provider_an", reviewerName: "小宇", createdAt: "2026-07-02", gameId: "game_lol",
    serviceLabel: "新手陪玩・60 分鐘", rating: 4.9, emotionalScore: 4.9, technicalScore: 4.1,
    text: "第一次找陪玩。她會先問我想認真還是隨便玩，沒有亂加戲，也沒有推我再買時數。", repeatCustomer: true,
  },
  {
    id: "review_zhe_01", providerId: "provider_zhe", reviewerName: "Leo", createdAt: "2026-07-15", gameId: "game_valorant",
    serviceLabel: "積分複盤・2 場", rating: 4.9, emotionalScore: 4.3, technicalScore: 5,
    text: "沒有從頭念到尾，只抓我最常犯的兩個錯。第二場馬上少死很多，賽後還把重點打成三行給我。", repeatCustomer: true,
  },
  {
    id: "review_zhe_02", providerId: "provider_zhe", reviewerName: "晏", createdAt: "2026-07-07", gameId: "game_valorant",
    serviceLabel: "戰術陪練・1 場", rating: 4.7, emotionalScore: 4.1, technicalScore: 4.9,
    text: "講話很直接，但不會酸人。比較適合真的想改問題的人；如果只想聊天放鬆，可能選別位比較對。", repeatCustomer: false,
  },
  {
    id: "review_zhe_03", providerId: "provider_zhe", reviewerName: "K.K.", createdAt: "2026-06-29", gameId: "game_valorant",
    serviceLabel: "上分陪打・3 場", rating: 5, emotionalScore: 4.5, technicalScore: 5,
    text: "報點乾淨，不搶指揮，也不會輸一局就開始怪隊友。約的三場有準時打完。", repeatCustomer: true,
  },
  {
    id: "review_yu_01", providerId: "provider_yu", reviewerName: "Mori", createdAt: "2026-07-13", gameId: "game_lol",
    serviceLabel: "彈性陪玩・60 分鐘", rating: 5, emotionalScore: 4.9, technicalScore: 4.7,
    text: "聊天很自然，不是一直丟罐頭問題。該報技能的時候也有報，玩到後面真的像固定隊友。", repeatCustomer: true,
  },
  {
    id: "review_yu_02", providerId: "provider_yu", reviewerName: "庭", createdAt: "2026-07-06", gameId: "game_valorant",
    serviceLabel: "休閒五排・60 分鐘", rating: 4.8, emotionalScore: 4.8, technicalScore: 4.5,
    text: "我和朋友一起約，她進來不會搶話，也有把比較安靜的人帶進話題。時間到有先問要不要收尾。", repeatCustomer: false,
  },
  {
    id: "review_yu_03", providerId: "provider_yu", reviewerName: "Rin", createdAt: "2026-06-30", gameId: "game_lol",
    serviceLabel: "深夜雙排・90 分鐘", rating: 4.9, emotionalScore: 5, technicalScore: 4.6,
    text: "有梗但不吵，連敗也沒有突然安靜。唯一小缺點是熱門時段真的比較難約。", repeatCustomer: true,
  },
  {
    id: "review_mu_01", providerId: "provider_mu", reviewerName: "N", createdAt: "2026-07-12", gameId: "game_wildrift",
    serviceLabel: "安靜陪玩・60 分鐘", rating: 5, emotionalScore: 5, technicalScore: 3.9,
    text: "真的可以不用一直講話。我那天很累，只想有人排隊，她沒有把安靜當尷尬，這很難得。", repeatCustomer: true,
  },
  {
    id: "review_mu_02", providerId: "provider_mu", reviewerName: "小魚", createdAt: "2026-07-04", gameId: "game_wildrift",
    serviceLabel: "睡前兩場・45 分鐘", rating: 4.8, emotionalScore: 4.9, technicalScore: 3.8,
    text: "語速慢、音量也不會突然很大。比較少主動開很多話題，但這就是我選他的原因。", repeatCustomer: false,
  },
  {
    id: "review_mu_03", providerId: "provider_mu", reviewerName: "Chia", createdAt: "2026-06-27", gameId: "game_wildrift",
    serviceLabel: "放空局・60 分鐘", rating: 4.9, emotionalScore: 5, technicalScore: 3.9,
    text: "有先講清楚不做感情承諾，也不會問太私人的事。界線清楚反而讓人比較放鬆。", repeatCustomer: true,
  },
  {
    id: "review_kai_01", providerId: "provider_kai", reviewerName: "Allen", createdAt: "2026-07-10", gameId: "game_valorant",
    serviceLabel: "團隊陪打・60 分鐘", rating: 4.8, emotionalScore: 4.6, technicalScore: 4.8,
    text: "報點很穩，不會每一波都要別人照他的打法。輸的時候也有把鍋接住，隊伍氣氛很好。", repeatCustomer: true,
  },
  {
    id: "review_kai_02", providerId: "provider_kai", reviewerName: "花生", createdAt: "2026-07-01", gameId: "game_lol",
    serviceLabel: "彈性雙排・60 分鐘", rating: 4.7, emotionalScore: 4.5, technicalScore: 4.7,
    text: "技術跟頁面寫的差不多，話不算多但不會冷場。回訊息慢一點，開打後就很可靠。", repeatCustomer: false,
  },
  {
    id: "review_kai_03", providerId: "provider_kai", reviewerName: "J.C.", createdAt: "2026-06-25", gameId: "game_valorant",
    serviceLabel: "排位陪打・2 場", rating: 4.9, emotionalScore: 4.7, technicalScore: 4.8,
    text: "不會為了展現實力一直搶輸出，是真的把隊友的位置做好。下次五排缺人會再找。", repeatCustomer: true,
  },
  {
    id: "review_lin_01", providerId: "provider_lin", reviewerName: "安仔", createdAt: "2026-07-11", gameId: "game_lol",
    serviceLabel: "觀念教學・60 分鐘", rating: 5, emotionalScore: 4.6, technicalScore: 5,
    text: "我一直以為自己是操作差，她看完說其實是回城時間亂掉。只改這件事就明顯好很多。", repeatCustomer: true,
  },
  {
    id: "review_lin_02", providerId: "provider_lin", reviewerName: "Sora", createdAt: "2026-07-03", gameId: "game_wildrift",
    serviceLabel: "新手教學・60 分鐘", rating: 4.9, emotionalScore: 4.7, technicalScore: 5,
    text: "完全新手也聽得懂。沒有一次塞十個名詞，打完只叫我先練一個習慣，壓力小很多。", repeatCustomer: false,
  },
  {
    id: "review_lin_03", providerId: "provider_lin", reviewerName: "可樂", createdAt: "2026-06-28", gameId: "game_lol",
    serviceLabel: "賽後復盤・45 分鐘", rating: 4.8, emotionalScore: 4.4, technicalScore: 4.9,
    text: "會指出問題，但也會說哪裡其實做對了。筆記很短，隔天自己排位還記得要看什麼。", repeatCustomer: true,
  },
];

export function getSeedReviews(providerId: string) {
  return seedReviews.filter((review) => review.providerId === providerId);
}

export const seedOwnerQueues = {
  applications: [
    { id: "app_001", name: "Mina", submitted: "今天 16:20", status: "待審核" },
    { id: "app_002", name: "周周", submitted: "今天 14:05", status: "需補語音" },
    { id: "app_003", name: "Rex", submitted: "昨天 22:48", status: "待驗證戰績" },
  ],
  concierge: [
    { id: "match_001", request: "今晚 21:30｜特戰英豪｜想認真上分", status: "新需求" },
    { id: "match_002", request: "週六 20:00｜英雄聯盟｜怕尷尬的新手", status: "媒合中" },
  ],
  support: [
    { id: "case_001", title: "訂單時間需要改期", risk: "一般", status: "待回覆" },
    { id: "case_002", title: "服務描述與實際不符", risk: "中", status: "調查中" },
  ],
};
