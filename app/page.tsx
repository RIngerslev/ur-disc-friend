"use client"
import Link from "next/link";
import Image from "next/image";
import Finger from "../public/finger-click-svgrepo-com.svg"
import Dice from "../public/dice-svgrepo-com.svg"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#7A9E9F]">
      <main className="flex flex-grow flex-col gap-7 text-center justify-center items-center">

      </main>
      <footer>
        <nav className="flex justify-between items-center bg-[#4f6367]">
        <Link href="/" className="flex flex-1 justify-center bg-[#7A9E9F] rounded-b-xl mb-2 mx-3 py-5">
            <Image src={Finger} alt="Finger" width={32} height={32}/>
        </Link>
        <Link href="/dice" className="flex flex-1 justify-center bg-[#4f6367]">
            <Image src={Dice} alt="Dice" width={32} height={32}/>
        </Link>
        </nav>
      </footer>
    </div>
  );
}
