"use client"
import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import Finger from "../public/finger-click-svgrepo-com.svg";
import Dice from "../public/dice-svgrepo-com.svg";

type Player = {
  x: number;
  y: number;
  color: number;
};

type ChosenPlayerAnimation = {
  startTime: number;
  startValue: number;
};

const MIN_PLAYERS = 2;
const CHOOSE_DELAY_MS = 2000;
const RESET_DELAY_MS = 1000;

const easeOutQuint = (t: number) => 1 + --t * t * t * t * t;

const color = (index: number, alpha = 1): string =>
  `hsla(${index * 222.5 + 348}, 100%, 51.4%, ${alpha})`;

const pickUnusedColor = (players: Map<number, Player>): number => {
  const alreadyChosenColors = Array.from(players.values()).map(
    (p) => p.color
  );
  let color = 0;
  while (alreadyChosenColors.includes(color)) {
    color++;
  }
  return color;
};

const useCanvas = (draw: (ctx: CanvasRenderingContext2D) => void) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");

    const resizeCanvas = () => {
      if (!canvas) return;
      canvas.width = Math.floor(window.innerWidth);
      canvas.height = Math.floor(window.innerHeight);
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    let animationFrameId: number;

    const render = () => {
      if (!context) return;
      draw(context);
      animationFrameId = window.requestAnimationFrame(render);
    };

    render();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [draw]);

  return canvasRef;
};

export default function Home() {
  const [players, setPlayers] = useState<Map<number, Player>>(new Map());
  const [chosenPlayer, setChosenPlayer] = useState<number | undefined>();
  const [chosenPlayerAnimation, setChosenPlayerAnimation] = useState<ChosenPlayerAnimation>({
    startTime: 0,
    startValue: 0,
  });
  const [ariaLiveLog, setAriaLiveLog] = useState<string[]>([]);
  const descriptionRef = useRef<HTMLDivElement>(null);
  const ariaLiveRef = useRef<HTMLDivElement>(null);
  const versionRef = useRef<HTMLDivElement>(null);
  const updateAvailableRef = useRef<HTMLDivElement>(null);

  const drawPlayer = useCallback((ctx: CanvasRenderingContext2D, player: Player) => {
    ctx.beginPath();
    ctx.strokeStyle = color(player.color);
    ctx.lineWidth = 10;
    ctx.arc(player.x, player.y, 50, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.fillStyle = color(player.color);
    ctx.arc(player.x, player.y, 35, 0, 2 * Math.PI);
    ctx.fill();
  }, []);

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      if (chosenPlayer !== undefined) {
        if (descriptionRef.current) descriptionRef.current.hidden = true;
        const player = players.get(chosenPlayer);
        if (player) {
          drawPlayer(ctx, player);

          const { startTime, startValue } = chosenPlayerAnimation;
          const endValue = 90;
          const elapsed = Date.now() - startTime;
          const duration = RESET_DELAY_MS;
          const t = elapsed / duration;
          const value =
            t < 1
              ? startValue - (startValue - endValue) * easeOutQuint(t)
              : endValue;

          ctx.beginPath();
          ctx.fillStyle = color(player.color);
          ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height);
          ctx.arc(player.x, player.y, value, 0, 2 * Math.PI);
          ctx.fill("evenodd");
        }
      } else if (players.size > 0) {
        if (descriptionRef.current) descriptionRef.current.hidden = true;
        for (const player of Array.from(players.values())) {
          drawPlayer(ctx, player);
        }
      } else {
        if (descriptionRef.current) descriptionRef.current.hidden = false;
      }
    },
    [chosenPlayer, chosenPlayerAnimation, players, drawPlayer]
  );

  const canvasRef = useCanvas(draw);

  const handleAddPlayer = (id: number, x: number, y: number) => {
    const newPlayers = new Map(players);
    const newColor = pickUnusedColor(newPlayers);
    newPlayers.set(id, { x, y, color: newColor });
    setPlayers(newPlayers);
    setAriaLiveLog([...ariaLiveLog, `Player ${id} added`]);
  };

  const handleUpdatePlayer = (id: number, x: number, y: number) => {
    const newPlayers = new Map(players);
    const player = newPlayers.get(id);
    if (player) {
      player.x = x;
      player.y = y;
      setPlayers(newPlayers);
    }
  };

  const handleRemovePlayer = (id: number) => {
    const newPlayers = new Map(players);
    newPlayers.delete(id);
    setPlayers(newPlayers);
    setAriaLiveLog([...ariaLiveLog, `Player ${id} removed`]);
  };

  const choosePlayer = () => {
    if (players.size < MIN_PLAYERS) return;

    const chosenIndex = Math.floor(Math.random() * players.size);
    const newChosenPlayer = Array.from(players.keys())[chosenIndex];

    const player = players.get(newChosenPlayer);
    if (player) {
      setChosenPlayerAnimation({
        startTime: Date.now(),
        startValue: Math.max(
          player.x,
          canvasRef.current?.width ? canvasRef.current.width - player.x : 0,
          player.y,
          canvasRef.current?.height ? canvasRef.current.height - player.y : 0
        ),
      });
      setChosenPlayer(newChosenPlayer);
      setAriaLiveLog([...ariaLiveLog, `Player ${newChosenPlayer} chosen`]);
    }
  };

  const reset = () => {
    setChosenPlayer(undefined);
    setPlayers(new Map());
    setAriaLiveLog(["Reset"]);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    handleAddPlayer(e.pointerId, e.clientX, e.clientY);
    choosePlayer();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    handleUpdatePlayer(e.pointerId, e.clientX, e.clientY);
  };

  const handlePointerRemove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (chosenPlayer === e.pointerId) {
      reset();
    } else {
      handleRemovePlayer(e.pointerId);
      choosePlayer();
    }
  };

  useEffect(() => {
    const handlePointerDownWrapper = (e: PointerEvent) =>
      handlePointerDown(e as unknown as React.PointerEvent<HTMLDivElement>);
    const handlePointerMoveWrapper = (e: PointerEvent) =>
      handlePointerMove(e as unknown as React.PointerEvent<HTMLDivElement>);
    const handlePointerRemoveWrapper = (e: PointerEvent) =>
      handlePointerRemove(e as unknown as React.PointerEvent<HTMLDivElement>);

    document.addEventListener("pointerdown", handlePointerDownWrapper);
    document.addEventListener("pointermove", handlePointerMoveWrapper);
    document.addEventListener("pointerup", handlePointerRemoveWrapper);
    document.addEventListener("pointercancel", handlePointerRemoveWrapper);

    document.addEventListener(
      "touchmove",
      (e) => {
        e.preventDefault();
      },
      { passive: false }
    );

    if ("serviceWorker" in navigator && location.hostname !== "localhost") {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").catch((err) => {
          console.warn("ServiceWorker registration failed: ", err);
        });
      });

      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (updateAvailableRef.current)
          updateAvailableRef.current.hidden = false;
      });

      navigator.serviceWorker.addEventListener("message", (e) => {
        if (e.data.version && versionRef.current) {
          versionRef.current.textContent = e.data.version;
        }
      });

      navigator.serviceWorker.ready.then((sw) => {
        sw.active?.postMessage("version");
      });
    }

    return () => {
      document.removeEventListener("pointerdown", handlePointerDownWrapper);
      document.removeEventListener("pointermove", handlePointerMoveWrapper);
      document.removeEventListener("pointerup", handlePointerRemoveWrapper);
      document.removeEventListener("pointercancel", handlePointerRemoveWrapper);
    };
  }, [players, chosenPlayer, chosenPlayerAnimation, ariaLiveLog]);

  return (
    <div className="flex flex-col min-h-screen bg-[#7A9E9F]">
      <main className="flex flex-grow flex-col gap-7 text-center justify-center items-center">
        <div className="relative h-screen w-screen">
          <canvas ref={canvasRef} className="absolute top-0 left-0 h-full w-full" />
          <div ref={descriptionRef} id="description" className="absolute inset-0 flex items-center justify-center text-2xl">
            Add players by clicking or touching the screen.
          </div>
          <div ref={ariaLiveRef} id="live-region" className="sr-only" aria-live="assertive">
            {ariaLiveLog.map((msg, index) => (
              <div key={index}>{msg}</div>
            ))}
          </div>
          <div ref={versionRef} id="version" className="absolute top-0 right-0 p-4">
            Version
          </div>
          <div ref={updateAvailableRef} id="update-available" className="hidden absolute top-0 left-0 p-4 bg-red-500 text-white">
            Update available
          </div>
        </div>
      </main>
      <footer>
        <nav className="flex justify-between items-center bg-[#4f6367]">
          <Link href="/" className="flex flex-1 justify-center bg-[#7A9E9F] rounded-b-xl mb-2 mx-3 py-5">
            <Image src={Finger} alt="Finger" width={32} height={32} />
          </Link>
          <Link href="/dice" className="flex flex-1 justify-center bg-[#4f6367]">
            <Image src={Dice} alt="Dice" width={32} height={32} />
          </Link>
        </nav>
      </footer>
    </div>
  );
}