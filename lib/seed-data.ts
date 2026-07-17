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
  priceAmountMinor: number;
  currency: "TWD";
  billingUnit: BillingUnit;
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
    headline: "下班想放空，我可以陪你慢慢打",
    biography:
      "我不怕安靜，也不會一進房就問東問西。你想聊我會接；累了只想排隊，我就陪你把幾場打完。",
    games: ["game_lol", "game_wildrift"],
    personaTags: ["溫柔", "甜妹", "新手友善"],
    voiceTags: ["清甜", "慢語速"],
    interactionTags: ["主動開話題", "不催單"],
    voiceIntro: "嗨，我小安；今天很累就安靜排，想聊我也在。",
    emotionalScore: 4.9,
    technicalScore: 4.1,
    priceAmountMinor: 14900,
    currency: "TWD",
    billingUnit: "per_30_minutes",
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
    headline: "先打給我看，問題一次抓一個",
    biography:
      "特戰英豪 Immortal。報點和決策有問題我會直接說，但不吼人；打完只留一件你下一場用得到的事。",
    games: ["game_valorant"],
    rankLabel: "Immortal・特戰英豪",
    personaTags: ["冷靜", "教練型", "不嘴人"],
    voiceTags: ["沉穩", "清楚"],
    interactionTags: ["戰術指揮", "賽後復盤"],
    voiceIntro: "先打一場吧。看完我再跟你說，最該改的是哪一件。",
    emotionalScore: 4.3,
    technicalScore: 4.9,
    priceAmountMinor: 29900,
    currency: "TWD",
    billingUnit: "per_game",
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
    headline: "能聊，也知道什麼時候該報點",
    biography:
      "朋友多的房我不搶話，兩個人排也不會硬撐場。認真時就報點，耍廢時一起笑，照當下走。",
    games: ["game_lol", "game_valorant"],
    rankLabel: "鑽石・彈性雙排",
    personaTags: ["自然系", "有梗", "社恐友善"],
    voiceTags: ["自然", "微低音"],
    interactionTags: ["看氣氛", "穩定報點"],
    voiceIntro: "雨晴。先開啦，話題通常打著打著就有了。",
    emotionalScore: 4.8,
    technicalScore: 4.6,
    priceAmountMinor: 39900,
    currency: "TWD",
    billingUnit: "per_60_minutes",
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
    headline: "安靜排也可以，不用一直找話說",
    biography:
      "我比較慢熱。你不講話時我不會逼著聊，想說一點，我就在。",
    games: ["game_wildrift"],
    personaTags: ["安靜", "傾聽", "低刺激"],
    voiceTags: ["輕柔", "慢節奏"],
    interactionTags: ["不查戶口", "尊重界線"],
    voiceIntro: "今天不想講很多？沒關係。你開，我跟著。",
    emotionalScore: 4.9,
    technicalScore: 3.9,
    priceAmountMinor: 19900,
    currency: "TWD",
    billingUnit: "per_60_minutes",
  },
  {
    id: "provider_kai",
    slug: "kai-wen",
    displayName: "凱文",
    publicGender: "男性",
    imageUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=86",
    axis: "hybrid",
    headline: "缺的是隊友，我就把隊友做好",
    biography:
      "會報點、會補位，輸了先看自己。想爬分我陪你認真溝通；只想打兩場放鬆，也行。",
    games: ["game_valorant", "game_lol"],
    rankLabel: "Ascendant・團隊補位",
    personaTags: ["可靠", "隊友感", "不甩鍋"],
    voiceTags: ["低音", "有精神"],
    interactionTags: ["團隊溝通", "主動補位"],
    voiceIntro: "想認真就報點。想放鬆的話，我不會把整場弄得很緊。",
    emotionalScore: 4.6,
    technicalScore: 4.7,
    priceAmountMinor: 34900,
    currency: "TWD",
    billingUnit: "per_60_minutes",
  },
  {
    id: "provider_lin",
    slug: "lin-lin",
    displayName: "琳琳",
    publicGender: "女性",
    imageUrl:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=86",
    axis: "technical",
    headline: "一次只改一件，比塞十個觀念有用",
    biography:
      "我會先看你怎麼打，不會一開口就念理論。找到最常掉分的地方後，我們拿下一場直接試。",
    games: ["game_lol", "game_wildrift"],
    rankLabel: "Master・教學示範",
    personaTags: ["耐心", "講人話", "目標導向"],
    voiceTags: ["清晰", "有活力"],
    interactionTags: ["拆解目標", "賽後筆記"],
    voiceIntro: "不用背一堆。打完我只留一個，你下一場就能試的重點。",
    emotionalScore: 4.5,
    technicalScore: 4.9,
    priceAmountMinor: 49900,
    currency: "TWD",
    billingUnit: "per_60_minutes",
  },
];

export const seedReviews: SeedReview[] = [
  {
    id: "review_an_01", providerId: "provider_an", reviewerName: "阿凱", createdAt: "2026-07-14", gameId: "game_lol",
    serviceLabel: "輕鬆雙排・60 分鐘", rating: 4.8, emotionalScore: 4.9, technicalScore: 4.2,
    text: "本來怕會尷尬，結果開場比我想像中自然。我中間去拿宵夜，房裡安靜了一下，她也沒硬找話題。回來就繼續排。", repeatCustomer: true,
  },
  {
    id: "review_an_02", providerId: "provider_an", reviewerName: "Wen", createdAt: "2026-07-09", gameId: "game_wildrift",
    serviceLabel: "下班放鬆局・30 分鐘", rating: 4.4, emotionalScore: 4.7, technicalScore: 3.9,
    text: "試聽聽起來怎樣，進房差不多就怎樣；那天連輸兩把，她只笑著說下一把再來。", repeatCustomer: false,
  },
  {
    id: "review_an_03", providerId: "provider_an", reviewerName: "小宇", createdAt: "2026-07-02", gameId: "game_lol",
    serviceLabel: "新手陪玩・60 分鐘", rating: 4.7, emotionalScore: 4.8, technicalScore: 4.1,
    text: "第一次約，開打前她先問我要認真還是亂玩。結束就結束，沒一直叫我續。", repeatCustomer: true,
  },
  {
    id: "review_zhe_01", providerId: "provider_zhe", reviewerName: "Leo", createdAt: "2026-07-15", gameId: "game_valorant",
    serviceLabel: "積分複盤・2 場", rating: 4.8, emotionalScore: 4.3, technicalScore: 5,
    text: "他只抓兩個問題，第二場我真的少送很多。賽後丟來三行筆記，很短，但有用。", repeatCustomer: true,
  },
  {
    id: "review_zhe_02", providerId: "provider_zhe", reviewerName: "晏", createdAt: "2026-07-07", gameId: "game_valorant",
    serviceLabel: "戰術陪練・1 場", rating: 4.3, emotionalScore: 3.9, technicalScore: 4.8,
    text: "講得很直接，我有一兩次覺得有點兇，不過沒有酸人；如果只是想聊天，別選這個。", repeatCustomer: false,
  },
  {
    id: "review_zhe_03", providerId: "provider_zhe", reviewerName: "K.K.", createdAt: "2026-06-29", gameId: "game_valorant",
    serviceLabel: "上分陪打・3 場", rating: 4.9, emotionalScore: 4.5, technicalScore: 5,
    text: "三場都準時，報點乾淨。第二局我少死很多，賽後也收到三行筆記。", repeatCustomer: true,
  },
  {
    id: "review_yu_01", providerId: "provider_yu", reviewerName: "Mori", createdAt: "2026-07-13", gameId: "game_lol",
    serviceLabel: "彈性陪玩・60 分鐘", rating: 4.7, emotionalScore: 4.8, technicalScore: 4.7,
    text: "不像面試，開了就打。後來聊到一半她還記得該報技能，這點滿加分。", repeatCustomer: true,
  },
  {
    id: "review_yu_02", providerId: "provider_yu", reviewerName: "庭", createdAt: "2026-07-06", gameId: "game_valorant",
    serviceLabel: "休閒五排・60 分鐘", rating: 4.5, emotionalScore: 4.7, technicalScore: 4.5,
    text: "朋友房裡她很會接節奏，平常最安靜那個也有被帶進話題。時間到前五分鐘提醒了一次。", repeatCustomer: false,
  },
  {
    id: "review_yu_03", providerId: "provider_yu", reviewerName: "Rin", createdAt: "2026-06-30", gameId: "game_lol",
    serviceLabel: "深夜雙排・90 分鐘", rating: 4.6, emotionalScore: 4.8, technicalScore: 4.6,
    text: "好笑，但不是一直丟梗的那種。熱門時間難約，晚一點比較有機會。", repeatCustomer: true,
  },
  {
    id: "review_mu_01", providerId: "provider_mu", reviewerName: "N", createdAt: "2026-07-12", gameId: "game_wildrift",
    serviceLabel: "安靜陪玩・60 分鐘", rating: 4.8, emotionalScore: 5, technicalScore: 3.9,
    text: "那天真的很累，我幾乎沒說話。她沒有把安靜當事故處理，謝天謝地。", repeatCustomer: true,
  },
  {
    id: "review_mu_02", providerId: "provider_mu", reviewerName: "小魚", createdAt: "2026-07-04", gameId: "game_wildrift",
    serviceLabel: "睡前兩場・45 分鐘", rating: 4.4, emotionalScore: 4.7, technicalScore: 3.8,
    text: "語速慢，音量也穩，睡前打很剛好。只是他不太會主動帶很多話題，介意的人要先知道。", repeatCustomer: false,
  },
  {
    id: "review_mu_03", providerId: "provider_mu", reviewerName: "Chia", createdAt: "2026-06-27", gameId: "game_wildrift",
    serviceLabel: "放空局・60 分鐘", rating: 4.9, emotionalScore: 5, technicalScore: 3.9,
    text: "一開始就講明不聊感情承諾，也不問住哪、做什麼。這樣反而放心。", repeatCustomer: true,
  },
  {
    id: "review_kai_01", providerId: "provider_kai", reviewerName: "Allen", createdAt: "2026-07-10", gameId: "game_valorant",
    serviceLabel: "團隊陪打・60 分鐘", rating: 4.6, emotionalScore: 4.6, technicalScore: 4.8,
    text: "報點穩，也不會每波都叫大家照他的打法。輸了他先說自己哪裡沒補到，房裡沒臭掉。", repeatCustomer: true,
  },
  {
    id: "review_kai_02", providerId: "provider_kai", reviewerName: "花生", createdAt: "2026-07-01", gameId: "game_lol",
    serviceLabel: "彈性雙排・60 分鐘", rating: 4.3, emotionalScore: 4.3, technicalScore: 4.7,
    text: "回訊息比我預期慢，差點以為約不到；開打後倒是很可靠。", repeatCustomer: false,
  },
  {
    id: "review_kai_03", providerId: "provider_kai", reviewerName: "J.C.", createdAt: "2026-06-25", gameId: "game_valorant",
    serviceLabel: "排位陪打・2 場", rating: 4.7, emotionalScore: 4.7, technicalScore: 4.8,
    text: "五排臨時少一個找他，兩場都很順。該補的位置有補，下次缺人會再問。", repeatCustomer: true,
  },
  {
    id: "review_lin_01", providerId: "provider_lin", reviewerName: "安仔", createdAt: "2026-07-11", gameId: "game_lol",
    serviceLabel: "觀念教學・60 分鐘", rating: 4.8, emotionalScore: 4.6, technicalScore: 5,
    text: "我一直以為自己操作差。她看完第一場只問：你是不是每次都太晚回城？被說中。", repeatCustomer: true,
  },
  {
    id: "review_lin_02", providerId: "provider_lin", reviewerName: "Sora", createdAt: "2026-07-03", gameId: "game_wildrift",
    serviceLabel: "新手教學・60 分鐘", rating: 4.6, emotionalScore: 4.7, technicalScore: 4.9,
    text: "完全新手也聽得懂，沒有一次塞十個名詞。打完只叫我先練看小地圖。", repeatCustomer: false,
  },
  {
    id: "review_lin_03", providerId: "provider_lin", reviewerName: "可樂", createdAt: "2026-06-28", gameId: "game_lol",
    serviceLabel: "賽後復盤・45 分鐘", rating: 4.5, emotionalScore: 4.5, technicalScore: 4.8,
    text: "她先說問題，再點出我做對的地方。筆記很短，隔天排位前掃一眼就記起來。", repeatCustomer: true,
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
