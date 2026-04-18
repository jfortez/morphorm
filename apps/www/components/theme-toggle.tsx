/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import { useEffect, useState } from "react";

export function ThemeToggle() {
	const [isDark, setIsDark] = useState(true);

	useEffect(() => {
		const stored = localStorage.getItem("theme");
		const dark = stored ? stored === "dark" : true;
		setIsDark(dark);
		document.documentElement.classList.toggle("dark", dark);
	}, []);

	const toggle = () => {
		const next = !isDark;
		setIsDark(next);
		document.documentElement.classList.toggle("dark", next);
		localStorage.setItem("theme", next ? "dark" : "light");
	};

	return (
		<button
			onClick={toggle}
			aria-label="Toggle theme"
			className="w-8 h-8 flex items-center justify-center rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 dark:text-neutral-500 dark:hover:text-neutral-200 dark:hover:bg-neutral-800 transition-colors"
		>
			{isDark ? (
				<svg
					width="15"
					height="15"
					viewBox="0 0 15 15"
					fill="none"
				>
					<path
						d="M7.5 0a.5.5 0 01.5.5v1a.5.5 0 01-1 0v-1a.5.5 0 01.5-.5zm0 12a.5.5 0 01.5.5v1a.5.5 0 01-1 0v-1a.5.5 0 01.5-.5zm-6.5-4.5a.5.5 0 000 1h1a.5.5 0 000-1h-1zm12 0a.5.5 0 000 1h1a.5.5 0 000-1h-1zM2.4 2.4a.5.5 0 01.7 0l.7.7a.5.5 0 01-.7.7l-.7-.7a.5.5 0 010-.7zm9.2 9.2a.5.5 0 01.7 0l.7.7a.5.5 0 01-.7.7l-.7-.7a.5.5 0 010-.7zm.7-9.2a.5.5 0 00-.7 0l-.7.7a.5.5 0 00.7.7l.7-.7a.5.5 0 000-.7zM3.1 11.6a.5.5 0 00-.7 0l-.7.7a.5.5 0 00.7.7l.7-.7a.5.5 0 000-.7zM7.5 4a3.5 3.5 0 100 7 3.5 3.5 0 000-7z"
						fill="currentColor"
					/>
				</svg>
			) : (
				<svg
					width="15"
					height="15"
					viewBox="0 0 15 15"
					fill="none"
				>
					<path
						d="M2.9 0.5C2.7 0.5 2.6 0.6 2.5 0.8C2.1 1.8 1.9 2.9 1.9 4C1.9 8.5 5.5 12 10 12C11.1 12 12.1 11.8 13.1 11.4C13.3 11.3 13.4 11.1 13.3 10.9C12.7 9.8 12.1 8.8 11.3 7.9C10.1 6.6 8.4 5.8 6.6 5.8C5.4 5.8 4.3 6.2 3.5 6.8C3.2 5.3 3.2 3.7 3.6 2.1C3.7 1.8 3.6 1.5 3.3 1.4L2.9 0.5Z"
						fill="currentColor"
					/>
				</svg>
			)}
		</button>
	);
}
