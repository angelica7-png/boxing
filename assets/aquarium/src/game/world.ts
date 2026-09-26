export const MAP_W = 1008;
export const MAP_H = 3480;

export const SPAWN = { x: 504, y: 3320 };

export type Facing = "down" | "left" | "right" | "up";

export type Talk = { title: string; body: string };

export type PropDef = {
  id: string;
  src: string;
  x: number;
  y: number;
  w: number;
  blockW: number;
  blockH: number;
  talk?: Talk;
  talkW?: number;
  talkH?: number;
};

const P = "/aquarium/props";

export const PROPS: PropDef[] = [
  {
    id: "whale-wall",
    src: `${P}/whale-wall.png`,
    x: 504,
    y: 400,
    w: 920,
    blockW: 860,
    blockH: 72,
    talk: {
      title: "ジンベイザメエリア",
      body: "奥の壁一面が大水槽だ。ジンベイザメとマンタが、青い光の中をゆっくり横切っていく。",
    },
  },
  {
    id: "penguin",
    src: `${P}/penguin-tank.png`,
    x: 190,
    y: 640,
    w: 230,
    blockW: 180,
    blockH: 48,
    talk: {
      title: "ペンギンエリア",
      body: "岩場の水槽。ペンギンが一羽、こちらを見ている。",
    },
  },
  {
    id: "jelly",
    src: `${P}/jelly-tank.png`,
    x: 830,
    y: 660,
    w: 220,
    blockW: 170,
    blockH: 48,
    talk: {
      title: "クラゲエリア",
      body: "暗い水の中を、小さなクラゲがぷかぷかと漂っている。",
    },
  },
  {
    id: "stairs",
    src: `${P}/stairs.png`,
    x: 200,
    y: 780,
    w: 150,
    blockW: 110,
    blockH: 70,
    talk: {
      title: "2F 階段",
      body: "2階への階段。上のフロアはまだ準備中だ。",
    },
  },
  {
    id: "pano-l",
    src: `${P}/panorama-tank.png`,
    x: 240,
    y: 1040,
    w: 360,
    blockW: 300,
    blockH: 48,
    talk: {
      title: "大水槽",
      body: "壁一面の水槽。サメの影が、磨いた木の床に映っている。",
    },
  },
  {
    id: "pano-r",
    src: `${P}/panorama-tank.png`,
    x: 770,
    y: 1040,
    w: 360,
    blockW: 300,
    blockH: 48,
    talk: {
      title: "大水槽",
      body: "反対側の大水槽。小さな魚の群れがライトの中を流れていく。",
    },
  },
  { id: "bench-a", src: `${P}/bench.png`, x: 340, y: 760, w: 150, blockW: 120, blockH: 28 },
  { id: "sit-a", src: `${P}/sit-couple-a.png`, x: 340, y: 768, w: 64, blockW: 0, blockH: 0 },
  { id: "bench-b", src: `${P}/bench.png`, x: 690, y: 1280, w: 150, blockW: 120, blockH: 28 },
  { id: "sit-b", src: `${P}/sit-family.png`, x: 690, y: 1288, w: 74, blockW: 0, blockH: 0 },
  { id: "plant-a", src: `${P}/plant.png`, x: 110, y: 800, w: 72, blockW: 36, blockH: 22 },
  { id: "plant-b", src: `${P}/plant.png`, x: 910, y: 1240, w: 72, blockW: 36, blockH: 22 },
  { id: "bench-e", src: `${P}/bench.png`, x: 200, y: 1560, w: 150, blockW: 120, blockH: 28 },
  { id: "sit-e", src: `${P}/sit-couple-b.png`, x: 200, y: 1568, w: 82, blockW: 0, blockH: 0 },
  { id: "bench-f", src: `${P}/bench.png`, x: 800, y: 1780, w: 150, blockW: 120, blockH: 28 },
  { id: "sit-f", src: `${P}/sit-family.png`, x: 800, y: 1788, w: 74, blockW: 0, blockH: 0 },
  { id: "bench-c", src: `${P}/bench.png`, x: 300, y: 2100, w: 150, blockW: 120, blockH: 28 },
  { id: "sit-c", src: `${P}/sit-couple-a.png`, x: 300, y: 2108, w: 64, blockW: 0, blockH: 0 },
  { id: "bench-g", src: `${P}/bench.png`, x: 780, y: 2280, w: 150, blockW: 120, blockH: 28 },
  { id: "sit-g", src: `${P}/sit-couple-b.png`, x: 780, y: 2288, w: 82, blockW: 0, blockH: 0 },
  { id: "bench-d", src: `${P}/bench.png`, x: 730, y: 2460, w: 150, blockW: 120, blockH: 28 },
  { id: "sit-d", src: `${P}/sit-family.png`, x: 730, y: 2468, w: 74, blockW: 0, blockH: 0 },
  { id: "plant-c", src: `${P}/plant.png`, x: 130, y: 2200, w: 72, blockW: 36, blockH: 22 },
  { id: "plant-d", src: `${P}/plant.png`, x: 890, y: 2500, w: 72, blockW: 36, blockH: 22 },
  { id: "bench-h", src: `${P}/bench.png`, x: 220, y: 2680, w: 150, blockW: 120, blockH: 28 },
  { id: "sit-h", src: `${P}/sit-couple-a.png`, x: 220, y: 2688, w: 64, blockW: 0, blockH: 0 },
  {
    id: "shop",
    src: `${P}/shop.png`,
    x: 250,
    y: 3000,
    w: 340,
    blockW: 280,
    blockH: 110,
    talk: {
      title: "売店",
      body: "木のカウンターと棚。海の小物が、暖かい照明の下に並んでいる。",
    },
  },
  {
    id: "toilet-w",
    src: `${P}/door-w.png`,
    x: 799,
    y: 3088,
    w: 46,
    blockW: 42,
    blockH: 30,
    talk: {
      title: "トイレ",
      body: "女性用。木の扉に、赤いマークがついている。",
    },
  },
  {
    id: "toilet-m",
    src: `${P}/door-m.png`,
    x: 862,
    y: 3088,
    w: 45,
    blockW: 42,
    blockH: 30,
    talk: {
      title: "トイレ",
      body: "男性用。木の扉に、黒いマークがついている。",
    },
  },
  {
    id: "kiosk",
    src: `${P}/kiosk.png`,
    x: 340,
    y: 3260,
    w: 170,
    blockW: 140,
    blockH: 64,
  },
  {
    id: "receptionist",
    src: `${P}/receptionist.png`,
    x: 404,
    y: 3276,
    w: 28,
    blockW: 22,
    blockH: 14,
    talkW: 150,
    talkH: 100,
    talk: {
      title: "受付",
      body: "ようこそいらっしゃいました",
    },
  },
  {
    id: "entrance",
    src: `${P}/entrance.png`,
    x: 504,
    y: 3468,
    w: 260,
    blockW: 200,
    blockH: 40,
    talk: {
      title: "入口",
      body: "ガラスの自動ドア。外は夜で、館内の木の床だけが暖かい。",
    },
  },
  { id: "sign-shark", src: `${P}/sign-shark.png`, x: 504, y: 436, w: 220, blockW: 0, blockH: 0 },
  { id: "sign-penguin", src: `${P}/sign-penguin.png`, x: 190, y: 668, w: 180, blockW: 0, blockH: 0 },
  { id: "sign-jelly", src: `${P}/sign-jelly.png`, x: 830, y: 688, w: 170, blockW: 0, blockH: 0 },
  { id: "sign-stairs", src: `${P}/sign-stairs.png`, x: 200, y: 804, w: 130, blockW: 0, blockH: 0 },
  { id: "sign-shop", src: `${P}/sign-shop.png`, x: 250, y: 3028, w: 100, blockW: 0, blockH: 0 },
  { id: "sign-toilet", src: `${P}/sign-toilet.png`, x: 830, y: 3136, w: 90, blockW: 0, blockH: 0 },
];

export type Rect = { x: number; y: number; w: number; h: number };

export const WALLS: Rect[] = [
  { x: 0, y: 0, w: 62, h: MAP_H },
  { x: MAP_W - 62, y: 0, w: 62, h: MAP_H },
  { x: 0, y: 0, w: MAP_W, h: 52 },
  { x: 0, y: MAP_H - 20, w: MAP_W, h: 20 },
];

export const BLOCKERS: Rect[] = [...WALLS, ...PROPS.filter((p) => p.blockW > 0).map(propBlocker)];

export function propBlocker(p: PropDef): Rect {
  return {
    x: p.x - p.blockW / 2,
    y: p.y - p.blockH,
    w: p.blockW,
    h: p.blockH,
  };
}

export function talkZone(p: PropDef): Rect | null {
  if (!p.talk) return null;
  const w = p.talkW ?? Math.max(110, p.blockW);
  const h = p.talkH ?? 78;
  return { x: p.x - w / 2, y: p.y + 4, w, h };
}

export function areaTitle(y: number): string {
  if (y < 520) return "ジンベイザメ水槽";
  if (y < 980) return "展示フロア";
  if (y < 1600) return "大水槽ホール";
  if (y < 2700) return "通路";
  return "エントランス";
}
