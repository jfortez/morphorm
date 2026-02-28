import { defineConfig } from "tsdown";

export default defineConfig({
	entry: [
		"./src/index.ts",
		"./src/types.ts",
		"./src/schema/schema.ts",
		"./src/schema/zod/index.ts",
		"./src/schema/zod/v4/index.ts",
		"./src/schema/valibot/index.ts",
	],
	format: ["esm"],
	dts: true,
	clean: true,
	outDir: "dist",
});
