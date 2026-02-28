import { defineConfig } from "tsdown";

export default defineConfig({
	entry: ["./src/index.ts"],
	format: ["esm", "cjs"],
	outDir: "dist",
	dts: true,
	clean: true,
	sourcemap: true,
	minify: false,
	treeshake: true,
	platform: "neutral",
	target: "es2020",
	external: ["react", "react-dom", "@tanstack/react-form", "zod", "@radix-ui/react-slot"],
});
