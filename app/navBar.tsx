import Link from "next/link";
import Finger from "../public/finger-click-svgrepo-com.svg"
import Dice from "../public/dice-svgrepo-com.svg"
import Image from "next/image";

const NavBar = () => {
    return (
    <nav className="flex justify-between items-center bg-[#4f6367] text-white">
        <div className="flex flex-1 justify-center bg-[#4f6367]">
            <Link href="/about">
                <Image src={Finger} alt="Finger" width={32} height={32}/>
            </Link>
        </div>
        <div className="flex flex-1 justify-center bg-[#7A9E9F] rounded-b-xl mb-2 py-5">
            <Link href="/about">
                <Image src={Dice} alt="Dice" width={32} height={32}/>
            </Link>
        </div>
        <div className="flex flex-1 justify-center">
            <Link href="/about">
                <Image src={Finger} alt="Coin flip" width={32} height={32}/>
            </Link>
        </div>
     </nav>
    )
}

export default NavBar;
