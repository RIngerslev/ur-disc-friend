"use client"
import Image from "next/image";
import Link from "next/link";
import Finger from "../../public/finger-click-svgrepo-com.svg"
import Dice from "../../public/dice-svgrepo-com.svg"
import { useState } from "react";

export default function DicePage() {
    const [toss, setToss] = useState("DRIVER");
    const [tossArray] = useState(["FORHAND", "BACKHAND", "ROLLER", "HYZER", "ANHYZER", "WILD"]);

    const [disc, setDisc] = useState("DRIVER");
    const [discArray] = useState(["DRIVER", "MIDRANGE", "PUTTER", "UNDERSTABLE", "OVERSTABLE", "WILD"]);

    function randomDisc() {
      setToss(tossArray[Math.floor(Math.random() * 6)]);
      setDisc(discArray[Math.floor(Math.random() * 6)]);
    }

    return (
      <div className="flex flex-col min-h-screen bg-[#7A9E9F]">
        <main className="flex flex-grow flex-col gap-7 text-center justify-center items-center">
          <div className="bg-[#4f6367] text-[#EEF5DB] text-3xl p-4 rounded-xl w-64">Ur Disc Friend!</div>
          <div className="text-[#EEF5DB] text-1xl rounded-xl w-72">By Ingerslev Software</div>
          <div className="bg-[#EEF5DB] text-[#4f6367] text-4xl p-4 rounded-xl w-80">{toss}</div>
          <div className="bg-[#EEF5DB] text-[#4f6367] text-4xl p-4 rounded-xl w-80">{disc}</div>
          <button className="bg-[#FE5F55] text-[#EEF5DB] text-4xl p-3 px-5 rounded-xl justify-center items-center flex shadow-2xl active:opacity-50 transition-opacity duration-300" onClick={() => randomDisc()}>
            ROLL
          </button>
        </main>
        <footer>
          <nav className="flex justify-between items-center bg-[#4f6367] text-white">
            <Link href="/" className="flex flex-1 justify-center bg-[#4f6367]">
                <Image src={Finger} alt="Finger" width={32} height={32}/>
            </Link>
            <Link href="/dice" className="flex flex-1 justify-center bg-[#7A9E9F] rounded-b-xl mb-2 mx-3 py-5">
                <Image src={Dice} alt="Dice" width={32} height={32}/>
            </Link>
          </nav>
        </footer>
      </div>
    );
  }