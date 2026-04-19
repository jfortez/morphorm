"use client";

import { useEffect, useState } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark, atomOneLight } from "react-syntax-highlighter/dist/cjs/styles/hljs";

interface CodeBlockProps {
	children: string;
	language?: string;
	customStyle?: React.CSSProperties;
}

export function CodeBlock({ children, language = "javascript", customStyle }: CodeBlockProps) {
	const [isDark, setIsDark] = useState(true);

	useEffect(() => {
		const check = () => setIsDark(document.documentElement.classList.contains("dark"));
		check();
		const obs = new MutationObserver(check);
		obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
		return () => obs.disconnect();
	}, []);

	return (
		<SyntaxHighlighter
			language={language}
			style={isDark ? atomOneDark : atomOneLight}
			customStyle={{ margin: 0, background: "transparent", padding: "20px 16px", ...customStyle }}
		>
			{children}
		</SyntaxHighlighter>
	);
}
