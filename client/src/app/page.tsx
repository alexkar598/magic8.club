import Image from "next/image";
import ballImage from "@/images/placeholder-ball.png"
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import Form from "next/form";
import {useRouter} from "next/navigation";

export default function Page() {
    const router = useRouter()

    async function submit(formData: FormData) {
        const question = formData.get("question");
        await fetch("https://webhook.site/0daffc67-36c2-43c1-96f3-183f24cd104f", {
            "method": "POST",
            body: JSON.stringify({question}),
        })
        const id = "5435"
        router.push(`/ask/${id}`)
    }

    return (
        <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
            <h1 className="sr-only">Magic 8 Ball</h1>
            <h2 className="text-2xl">What do you want to ask the 8ball?</h2>
            <Button asChild variant="ghost">
                <Link href="/answer">Answer someone's question instead</Link>
            </Button>
            <Form action={submit}>
                <Input name="question" placeholder="Should I..."/>
            </Form>
            <div className="flex flex-col gap-8 items-center">
                <Image src={ballImage} alt="Magic 8 Ball" width={640}/>
            </div>
        </main>
    );
}
