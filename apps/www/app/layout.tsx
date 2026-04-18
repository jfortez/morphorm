import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";

import "morphorm/styles.css";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Morphorm — Type-safe forms for React",
	description:
		"Build type-safe, schema-driven forms with zero boilerplate. Powered by Zod and React.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			className="dark"
			suppressHydrationWarning
		>
			<head>
				<Script
					src="//unpkg.com/react-scan/dist/auto.global.js"
					crossOrigin="anonymous"
					strategy="beforeInteractive"
				/>
				<script
					dangerouslySetInnerHTML={{
						__html: `(function(){var t=localStorage.getItem('theme');if(t==='light'){document.documentElement.classList.remove('dark')}else{document.documentElement.classList.add('dark')}})()`,
					}}
				/>
			</head>
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
		</html>
	);
}
