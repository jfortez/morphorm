/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import { useEffect, useState } from "react";
import { SunIcon, MoonIcon } from "lucide-animated";

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
			className="w-8 h-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
		>
			{isDark ? <SunIcon size={15} /> : <MoonIcon size={15} />}
		</button>
	);
}
