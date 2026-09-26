import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AquariumGame } from "@/game/AquariumGame";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const [entered, setEntered] = useState(false);

  return (
    <div className="relative h-full">
      <AquariumGame />
      {!entered && (
        <div className="absolute inset-0 z-20 flex items-end justify-center bg-bg/55 p-6 sm:items-center">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl">
            <p className="text-xs tracking-[0.2em] text-accent">NIGHT HALL</p>
            <h1 className="mt-2 font-display text-3xl text-fg">碧光アクアリウム</h1>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              夜の館内。木の床に水槽の光が落ちる。入口からホール、売店、トイレ、三つのエリア、2階への階段まで歩ける。
            </p>
            <button
              type="button"
              className="mt-6 w-full rounded-full bg-primary px-4 py-3 text-base font-medium text-bg"
              onClick={() => setEntered(true)}
            >
              館内へ
            </button>
            <p className="mt-3 text-xs text-muted">WASD または矢印。近くでスペース。</p>
          </div>
        </div>
      )}
    </div>
  );
}
