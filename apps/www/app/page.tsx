import {
	FormWithArray,
	FormWithFunction,
	FormWithObject,
	FormWithContext,
} from "@/components/form";

export default function Home() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
			<main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
				<h2>Array Mode</h2>
				<FormWithArray />
				<h2>Function Mode</h2>
				<FormWithFunction />
				<h2>Object Mode</h2>
				<FormWithObject />
				<h2>With Context</h2>
				<FormWithContext />
			</main>
		</div>
	);
}
