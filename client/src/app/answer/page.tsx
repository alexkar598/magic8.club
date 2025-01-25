import Image from "next/image";
import ballImage from "@/images/placeholder-ball.png"

export default function Page() {
    return (
        <div
            className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
                <h1>Magic 8 Ball</h1>
                <div className="flex flex-col gap-8 items-center">
                    <Image src={ballImage} alt="Magic 8 Ball" width={640}/>
                    <div className="rounded bg-blue-300 block w-fit py-2 px-3">Click the ball!</div>
                </div>
            </main>
        </div>
    );
}
