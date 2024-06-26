"use client"
import { useEffect, useState, useRef, useCallback } from "react";
import NavBar from "./navBar";
import Link from "next/link";
import Image from "next/image";
import Finger from "../public/finger-click-svgrepo-com.svg";
import Dice from "../public/dice-svgrepo-com.svg";

const MIN_PLAYERS = 2;
const CHOOSE_DELAY_MS = 2000;
const RESET_DELAY_MS = 1000;

const easeOutQuint = (t) => 1 + --t * t * t * t * t;

const color = (index, alpha = 1) =>
  `hsla(${index * 222.5 + 348}, 100%, 51.4%, ${alpha})`;

const pickUnusedColor = (players) => {
  const alreadyChosenColors = Array.from(players.values()).map(
    (p) => p.color
  );
  let color = 0;
  while (alreadyChosenColors.includes(color)) {
    color++;
  }
  return color;
};

const useCanvas = (draw, options = {}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    const resizeCanvas = () => {
      canvas.width = Math.floor(window.innerWidth);
      canvas.height = Math.floor(window.innerHeight);
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    let animationFrameId;

    const render = () => {
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
  const [players, setPlayers] = useState(new Map());
  const [chosenPlayer, setChosenPlayer] = useState();
  const [chosenPlayerAnimation, setChosenPlayerAnimation] = useState({
    startTime: 0,
    startValue: 0,
  });
  const [ariaLiveLog, setAriaLiveLog] = useState([]);
  const descriptionRef = useRef(null);
  const ariaLiveRef = useRef(null);
  const versionRef = useRef(null);
  const updateAvailableRef = useRef(null);

  const drawPlayer = (ctx, player) => {
    ctx.beginPath();
    ctx.strokeStyle = color(player.color);
    ctx.lineWidth = 10;
    ctx.arc(player.x, player.y, 50, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.fillStyle = color(player.color);
    ctx.arc(player.x, player.y, 35, 0, 2 * Math.PI);
    ctx.fill();
  };

  const draw = useCallback((ctx) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    if (chosenPlayer !== undefined) {
      descriptionRef.current.hidden = true;
      const player = players.get(chosenPlayer);
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
    } else if (players.size > 0) {
      descriptionRef.current.hidden = true;
      for (const player of players.values()) {
        drawPlayer(ctx, player);
      }
    } else {
      descriptionRef.current.hidden = false;
    }
  }, [chosenPlayer, chosenPlayerAnimation, players]);

  const canvasRef = useCanvas(draw);

  const handleAddPlayer = (id, x, y) => {
    const newPlayers = new Map(players);
    const color = pickUnusedColor(newPlayers);
    newPlayers.set(id, { x, y, color });
    setPlayers(newPlayers);
    setAriaLiveLog([...ariaLiveLog, `Player ${id} added`]);
  };

  const handleUpdatePlayer = (id, x, y) => {
    const newPlayers = new Map(players);
    const player = newPlayers.get(id);
    if (player) {
      player.x = x;
      player.y = y;
      setPlayers(newPlayers);
    }
  };

  const handleRemovePlayer = (id) => {
    const newPlayers = new Map(players);
    newPlayers.delete(id);
    setPlayers(newPlayers);
    setAriaLiveLog([...ariaLiveLog, `Player ${id} removed`]);
  };

  const choosePlayer = () => {
    if (players.size < MIN_PLAYERS) return;

    const choosen = Math.floor(Math.random() * players.size);
    const newChosenPlayer = Array.from(players.keys())[choosen];

    const player = players.get(newChosenPlayer);
    setChosenPlayerAnimation({
      startTime: Date.now(),
      startValue: Math.max(
        player.x,
        canvasRef.current.width - player.x,
        player.y,
        canvasRef.current.height - player.y
      ),
    });
    setChosenPlayer(newChosenPlayer);
    setAriaLiveLog([...ariaLiveLog, `Player ${newChosenPlayer} chosen`]);
  };

  const reset = () => {
    setChosenPlayer(undefined);
    setPlayers(new Map());
    setAriaLiveLog(["Reset"]);
  };

  const handlePointerDown = (e) => {
    handleAddPlayer(e.pointerId, e.clientX, e.clientY);
    choosePlayer();
  };

  const handlePointerMove = (e) => {
    handleUpdatePlayer(e.pointerId, e.clientX, e.clientY);
  };

  const handlePointerRemove = (e) => {
    if (chosenPlayer === e.pointerId) {
      reset();
    } else {
      handleRemovePlayer(e.pointerId);
      choosePlayer();
    }
  };

  useEffect(() => {
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerup", handlePointerRemove);
    document.addEventListener("pointercancel", handlePointerRemove);

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
        updateAvailableRef.current.hidden = false;
      });

      navigator.serviceWorker.addEventListener("message", (e) => {
        if (e.data.version) {
          versionRef.current.textContent = e.data.version;
        }
      });

      navigator.serviceWorker.ready.then((sw) => {
        sw.active.postMessage("version");
      });
    }

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerRemove);
      document.removeEventListener("pointercancel", handlePointerRemove);
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

