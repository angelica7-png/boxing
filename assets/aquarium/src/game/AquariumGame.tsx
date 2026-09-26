import { useEffect, useRef, useState } from "react";
import {
  MAP_H,
  MAP_W,
  PROPS,
  SPAWN,
  WALLS,
  areaTitle,
  propBlocker,
  talkZone,
  type Facing,
  type PropDef,
  type Rect,
  type Talk,
} from "./world";

const PLAYER_H = 96;
const SPEED = 280;

type Hud = {
  place: string;
  talk: Talk | null;
  inZone: boolean;
};

type Probe = {
  getX: () => number;
  getY: () => number;
  getYaw: () => number;
  getSpeed: () => number;
  setKeys: (codes: string[]) => void;
};

declare global {
  interface Window {
    __controlsTest?: Probe;
  }
}

function hits(a: Rect, b: Rect) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function feetBox(x: number, y: number): Rect {
  return { x: x - 12, y: y - 14, w: 24, h: 14 };
}

const BLOCKERS: Rect[] = [...WALLS, ...PROPS.map(propBlocker)];
const SORTED = [...PROPS].sort((a, b) => a.y - b.y);

const FACING_YAW: Record<Facing, number> = {
  right: 0,
  down: Math.PI / 2,
  left: Math.PI,
  up: -Math.PI / 2,
};

export function AquariumGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [hud, setHud] = useState<Hud>({ place: "エントランス", talk: null, inZone: false });
  const hudRef = useRef(hud);
  hudRef.current = hud;
  const [line, setLine] = useState("");
  useEffect(() => {
    const full = hud.talk?.body ?? "";
    if (!full) {
      setLine("");
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setLine(full);
      return;
    }
    let i = 0;
    setLine("");
    const id = window.setInterval(() => {
      i += 1;
      setLine(full.slice(0, i));
      if (i >= full.length) window.clearInterval(id);
    }, 46);
    return () => window.clearInterval(id);
  }, [hud.talk]);
  const talkRef = useRef<Talk | null>(null);
  const wantTalk = useRef(false);
  const stick = useRef({ x: 0, y: 0, active: false });
  const knobRef = useRef<HTMLSpanElement>(null);
  const origin = useRef({ x: 0, y: 0, id: -1 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let dead = false;
    const images = new Map<string, HTMLImageElement>();
    const urls = new Set<string>(["/aquarium/base.png", ...PROPS.map((p) => p.src)]);
    for (const f of ["down", "left", "right", "up"] as const) {
      urls.add(`/aquarium/props/player-${f}.png`);
      urls.add(`/aquarium/props/follower-${f}.png`);
    }
    for (const extra of ["whale-shark.png", "manta.png", "jelly-0.png", "jelly-1.png", "jelly-2.png"]) {
      urls.add(`/aquarium/props/${extra}`);
    }

    let loaded = 0;
    const finish = () => {
      loaded += 1;
      if (loaded >= urls.size && !dead) setReady(true);
    };
    for (const url of urls) {
      const img = new Image();
      img.decoding = "async";
      let settled = false;
      const done = () => {
        if (settled) return;
        settled = true;
        finish();
      };
      img.onload = done;
      img.onerror = done;
      img.src = url;
      if (img.complete) done();
      images.set(url, img);
    }

    const keys = new Set<string>();
    let forced: Set<string> | null = null;
    const pos = { x: SPAWN.x, y: SPAWN.y };
    const follow = { x: SPAWN.x, y: SPAWN.y + 64 };
    let facing: Facing = "up";
    let camX = SPAWN.x - 200;
    let camY = SPAWN.y - 280;
    let speed = 0;
    let time = 0;
    let last = performance.now();

    const onDown = (e: KeyboardEvent) => {
      keys.add(e.code);
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code)) {
        e.preventDefault();
      }
      if (e.code === "Space" || e.code === "Enter" || e.code === "KeyZ") wantTalk.current = true;
    };
    const onUp = (e: KeyboardEvent) => keys.delete(e.code);
    const clearKeys = () => keys.clear();
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    window.addEventListener("blur", clearKeys);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    window.__controlsTest = {
      getX: () => pos.x,
      getY: () => pos.y,
      getYaw: () => FACING_YAW[facing],
      getSpeed: () => speed,
      setKeys: (codes) => {
        forced = new Set(codes);
      },
    };

    const loop = (now: number) => {
      if (dead) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      time += dt;

      const held = forced ?? keys;
      let ix = 0;
      let iy = 0;
      if (held.has("KeyA") || held.has("ArrowLeft")) ix -= 1;
      if (held.has("KeyD") || held.has("ArrowRight")) ix += 1;
      if (held.has("KeyW") || held.has("ArrowUp")) iy -= 1;
      if (held.has("KeyS") || held.has("ArrowDown")) iy += 1;
      ix += stick.current.x;
      iy += stick.current.y;
      const len = Math.hypot(ix, iy);
      if (len > 1) {
        ix /= len;
        iy /= len;
      }

      const moving = len > 0.08;
      if (moving) {
        if (Math.abs(ix) > Math.abs(iy)) facing = ix < 0 ? "left" : "right";
        else facing = iy < 0 ? "up" : "down";
      }
      speed = moving ? SPEED * Math.min(1, len) : 0;

      const stepX = ix * SPEED * dt;
      const stepY = iy * SPEED * dt;
      if (!hits(feetBox(pos.x + stepX, pos.y), blocked(pos.x + stepX, pos.y))) pos.x += stepX;
      if (!hits(feetBox(pos.x, pos.y + stepY), blocked(pos.x, pos.y + stepY))) pos.y += stepY;
      pos.x = Math.max(78, Math.min(MAP_W - 78, pos.x));
      pos.y = Math.max(70, Math.min(MAP_H - 36, pos.y));

      const behind =
        facing === "up"
          ? { x: 0, y: 64 }
          : facing === "down"
            ? { x: 0, y: -64 }
            : facing === "left"
              ? { x: 70, y: 10 }
              : { x: -70, y: 10 };
      const goalX = pos.x + behind.x;
      const goalY = pos.y + behind.y;
      const fk = reduced ? 1 : 1 - Math.exp(-5 * dt);
      const nextFx = follow.x + (goalX - follow.x) * fk;
      const nextFy = follow.y + (goalY - follow.y) * fk;
      if (!hits(feetBox(nextFx, follow.y), blocked(nextFx, follow.y))) follow.x = nextFx;
      if (!hits(feetBox(follow.x, nextFy), blocked(follow.x, nextFy))) follow.y = nextFy;

      let zoneTalk: Talk | null = null;
      let zoneTitle = "";
      for (const prop of PROPS) {
        const zone = talkZone(prop);
        if (!zone || !prop.talk) continue;
        if (hits(feetBox(pos.x, pos.y), zone)) {
          zoneTalk = prop.talk;
          zoneTitle = prop.talk.title;
          break;
        }
      }
      if (wantTalk.current) {
        wantTalk.current = false;
        talkRef.current = zoneTalk && talkRef.current?.title === zoneTalk.title ? null : zoneTalk;
      }

      const place = zoneTitle || areaTitle(pos.y);
      const talk = talkRef.current;
      const inZone = Boolean(zoneTalk);
      const prev = hudRef.current;
      if (prev.place !== place || prev.talk !== talk || prev.inZone !== inZone) {
        setHud({ place, talk, inZone });
      }

      const cssW = canvas.clientWidth;
      const cssH = canvas.clientHeight;
      if (cssW < 2 || cssH < 2) {
        requestAnimationFrame(loop);
        return;
      }
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const bw = Math.round(cssW * dpr);
      const bh = Math.round(cssH * dpr);
      if (canvas.width !== bw || canvas.height !== bh) {
        canvas.width = bw;
        canvas.height = bh;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      let viewH = MAP_H / 2;
      let viewW = viewH * (cssW / cssH);
      if (viewW > MAP_W) {
        viewW = MAP_W;
        viewH = viewW * (cssH / cssW);
      }
      if (viewH > MAP_H) viewH = MAP_H;

      const targetX = clamp(pos.x - viewW / 2, 0, Math.max(0, MAP_W - viewW));
      const targetY = clamp(pos.y - viewH * 0.58, 0, Math.max(0, MAP_H - viewH));
      const k = reduced ? 1 : 1 - Math.exp(-7 * dt);
      camX += (targetX - camX) * k;
      camY += (targetY - camY) * k;
      const scale = cssW / viewW;

      ctx.imageSmoothingEnabled = true;
      ctx.fillStyle = "#0e1624";
      ctx.fillRect(0, 0, cssW, cssH);
      const base = images.get("/aquarium/base.png");
      if (base && base.complete && base.naturalWidth) {
        ctx.drawImage(base, -camX * scale, -camY * scale, MAP_W * scale, MAP_H * scale);
      }
      drawWallGlow();

      const bob = moving && !reduced ? Math.sin(time * 9) * 1.6 : 0;
      const actors = [
        { y: pos.y, draw: drawPlayer },
        { y: follow.y, draw: drawFollow },
      ].sort((a, b) => a.y - b.y);
      let actorI = 0;
      for (const prop of SORTED) {
        while (actorI < actors.length && actors[actorI].y <= prop.y) {
          actors[actorI].draw();
          actorI += 1;
        }
        drawProp(prop);
      }
      while (actorI < actors.length) {
        actors[actorI].draw();
        actorI += 1;
      }

      function drawWallGlow() {
        const pulse = reduced ? 0.28 : 0.2 + Math.sin(time * 1.15) * 0.08;
        ctx!.save();
        ctx!.globalCompositeOperation = "screen";
        const bands = [
          { from: 0, to: 150 },
          { from: MAP_W, to: MAP_W - 150 },
        ];
        for (const band of bands) {
          const x0 = (band.from - camX) * scale;
          const x1 = (band.to - camX) * scale;
          const g = ctx!.createLinearGradient(x0, 0, x1, 0);
          g.addColorStop(0, `rgba(110, 225, 255, ${pulse})`);
          g.addColorStop(0.55, `rgba(70, 190, 230, ${pulse * 0.45})`);
          g.addColorStop(1, "rgba(70, 190, 230, 0)");
          ctx!.fillStyle = g;
          ctx!.fillRect(Math.min(x0, x1), -camY * scale, Math.abs(x1 - x0), MAP_H * scale);
        }
        ctx!.restore();
      }

      function drawProp(prop: PropDef) {
        const img = images.get(prop.src);
        if (!img || !img.naturalWidth) return;
        const w = prop.w * scale;
        const h = (prop.w * img.naturalHeight * scale) / img.naturalWidth;
        const sx = (prop.x - camX) * scale - w / 2;
        const sy = (prop.y - camY) * scale - h;
        ctx!.drawImage(img, sx, sy, w, h);
        if (prop.id === "whale-wall") drawSwimmers(prop, img);
        if (prop.id === "jelly") drawJellies(sx, sy, w, h);
      }

      function drawSwimmers(prop: PropDef, img: HTMLImageElement) {
        const spriteH = (prop.w * img.naturalHeight) / img.naturalWidth;
        const left = prop.x - prop.w / 2;
        const top = prop.y - spriteH;
        const water = {
          x: left + prop.w * 0.09,
          y: top + spriteH * 0.14,
          w: prop.w * 0.82,
          h: spriteH * 0.54,
        };
        ctx!.save();
        ctx!.beginPath();
        ctx!.rect((water.x - camX) * scale, (water.y - camY) * scale, water.w * scale, water.h * scale);
        ctx!.clip();
        const anim = reduced ? 3 : time;
        drawFish("/aquarium/props/whale-shark.png", water, 0.62, 340, 18, 0.2, 7, anim);
        drawFish("/aquarium/props/manta.png", water, 0.28, 220, 28, 4.5, 11, anim);
        ctx!.restore();
      }

      function drawFish(
        src: string,
        water: Rect,
        yFrac: number,
        spriteW: number,
        speed: number,
        phase: number,
        bobAmp: number,
        anim: number,
      ) {
        const fish = images.get(src);
        if (!fish || !fish.naturalWidth) return;
        const sh = (spriteW * fish.naturalHeight) / fish.naturalWidth;
        const travel = Math.max(24, water.w - spriteW);
        const dist = travel * 2;
        const p = (((anim * speed + phase * 40) % dist) + dist) % dist;
        const goingRight = p <= travel;
        const off = goingRight ? p : dist - p;
        const x = water.x + spriteW / 2 + off;
        const y = water.y + water.h * yFrac + Math.sin(anim * 0.5 + phase) * bobAmp;
        const dw = spriteW * scale;
        const dh = sh * scale;
        ctx!.save();
        ctx!.translate((x - camX) * scale, (y - camY) * scale);
        if (!goingRight) ctx!.scale(-1, 1);
        ctx!.drawImage(fish, -dw / 2, -dh / 2, dw, dh);
        ctx!.restore();
      }

      function drawJellies(sx: number, sy: number, w: number, h: number) {
        const specs = [
          { src: "/aquarium/props/jelly-0.png", fx: 0.38, fy: 0.3, size: 38, phase: 0.4, amp: 12 },
          { src: "/aquarium/props/jelly-1.png", fx: 0.64, fy: 0.4, size: 28, phase: 2.2, amp: 16 },
          { src: "/aquarium/props/jelly-2.png", fx: 0.5, fy: 0.5, size: 32, phase: 3.8, amp: 10 },
          { src: "/aquarium/props/jelly-1.png", fx: 0.74, fy: 0.24, size: 22, phase: 5.1, amp: 14 },
        ];
        ctx!.save();
        ctx!.beginPath();
        ctx!.rect(sx + w * 0.16, sy + h * 0.08, w * 0.68, h * 0.58);
        ctx!.clip();
        const anim = reduced ? 1.2 : time;
        for (const spec of specs) {
          const jelly = images.get(spec.src);
          if (!jelly || !jelly.naturalWidth) continue;
          const jw = spec.size * scale;
          const jh = (jw * jelly.naturalHeight) / jelly.naturalWidth;
          const bob = Math.sin(anim * 0.85 + spec.phase) * spec.amp * scale;
          const drift = Math.sin(anim * 0.33 + spec.phase * 1.3) * 8 * scale;
          const jx = sx + w * spec.fx + drift - jw / 2;
          const jy = sy + h * spec.fy + bob - jh / 2;
          ctx!.drawImage(jelly, jx, jy, jw, jh);
        }
        ctx!.restore();
      }

      function drawActor(url: string, x: number, y: number, bobY: number) {
        const img = images.get(url);
        if (!img || !img.naturalWidth) return;
        const h = PLAYER_H * scale;
        const w = (h * img.naturalWidth) / img.naturalHeight;
        const sx = (x - camX) * scale - w / 2;
        const sy = (y - camY) * scale - h + bobY * scale;
        ctx!.save();
        ctx!.fillStyle = "rgba(8, 12, 18, 0.35)";
        ctx!.beginPath();
        ctx!.ellipse((x - camX) * scale, (y - camY) * scale - 3 * scale, w * 0.38, 5 * scale, 0, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.restore();
        ctx!.drawImage(img, sx, sy, w, h);
      }

      function drawPlayer() {
        drawActor(`/aquarium/props/player-${facing}.png`, pos.x, pos.y, bob);
      }

      function drawFollow() {
        const sway = moving && !reduced ? Math.sin(time * 9 + 1.2) * 1.6 : 0;
        drawActor(`/aquarium/props/follower-${facing}.png`, follow.x, follow.y, sway);
      }

      requestAnimationFrame(loop);
    };

    const frame = requestAnimationFrame(loop);
    return () => {
      dead = true;
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      window.removeEventListener("blur", clearKeys);
      delete window.__controlsTest;
    };
  }, []);

  const moveStick = (clientX: number, clientY: number) => {
    const dx = clientX - origin.current.x;
    const dy = clientY - origin.current.y;
    const max = 46;
    const len = Math.hypot(dx, dy) || 1;
    const cl = Math.min(max, len);
    const nx = (dx / len) * cl;
    const ny = (dy / len) * cl;
    stick.current.x = nx / max;
    stick.current.y = ny / max;
    if (knobRef.current) knobRef.current.style.transform = `translate(${nx}px, ${ny}px)`;
  };

  return (
    <main className="relative h-full w-full overflow-hidden bg-bg text-fg">
      <canvas ref={canvasRef} className="h-full w-full touch-none" />

      <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center p-4">
        <p className="rounded-full border border-border bg-surface/90 px-4 py-2 font-display text-sm tracking-wide text-fg shadow-lg">
          {hud.place}
        </p>
      </div>

      {hud.talk && (
        <div className="absolute inset-x-0 bottom-28 z-10 mx-auto w-[min(100%-2rem,28rem)] rounded-2xl border border-border bg-surface/95 p-4 shadow-xl">
          <p className="font-display text-lg text-primary">{hud.talk.title}</p>
          <p className="mt-2 text-sm leading-relaxed text-fg">{line}</p>
          <button
            type="button"
            className="mt-3 rounded-full bg-primary px-4 py-2 text-sm font-medium text-bg"
            onClick={() => {
              talkRef.current = null;
              setHud((h) => ({ ...h, talk: null }));
            }}
          >
            閉じる
          </button>
        </div>
      )}

      {!hud.talk && hud.inZone && (
        <p className="pointer-events-none absolute inset-x-0 bottom-28 text-center text-sm text-accent">
          スペースでしらべる
        </p>
      )}

      <div className="touch-only absolute bottom-6 left-5 z-10">
        <div
          className="relative grid h-28 w-28 place-items-center rounded-full border border-border bg-surface/80"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            origin.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
            stick.current.active = true;
            moveStick(e.clientX, e.clientY);
          }}
          onPointerMove={(e) => {
            if (origin.current.id !== e.pointerId) return;
            moveStick(e.clientX, e.clientY);
          }}
          onPointerUp={(e) => {
            if (origin.current.id !== e.pointerId) return;
            origin.current.id = -1;
            stick.current.x = 0;
            stick.current.y = 0;
            if (knobRef.current) knobRef.current.style.transform = "translate(0px, 0px)";
          }}
        >
          <span ref={knobRef} className="h-12 w-12 rounded-full bg-primary shadow-md" />
        </div>
      </div>

      <button
        type="button"
        className="touch-only absolute right-5 bottom-8 z-10 h-16 min-w-16 rounded-full border border-accent bg-surface/90 px-4 text-sm text-accent"
        onPointerDown={(e) => {
          e.preventDefault();
          wantTalk.current = true;
        }}
      >
        しらべる
      </button>

      {!ready && (
        <p className="absolute inset-0 grid place-items-center bg-bg text-muted">館内を開いています</p>
      )}
    </main>
  );
}

function blocked(x: number, y: number): Rect {
  const box = feetBox(x, y);
  for (const rect of BLOCKERS) {
    if (hits(box, rect)) return rect;
  }
  return { x: -1, y: -1, w: 0, h: 0 };
}

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}
