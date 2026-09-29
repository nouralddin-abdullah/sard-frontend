import { defineConfig, devices } from "@playwright/test";

const devServerCommand = "npm run dev -- --host 127.0.0.1 --port 5173";

// Specs named *.build.spec.js run against a production build instead: they check page meta (title, canonical), and in
// the dev server React's StrictMode unmounts and remounts react-helmet-async, which then drops every tag but <title>.
const buildServerPort = 4179;
const buildServerCommand = `npm run build && npx vite preview --host 127.0.0.1 --port ${buildServerPort} --strictPort`;
const BUILD_SPECS = /\.build\.spec\.js$/;

export default defineConfig({
	testDir: "./tests",
	timeout: 60 * 1000,
	expect: {
		timeout: 10 * 1000,
	},
	fullyParallel: true,
	retries: process.env.CI ? 2 : 0,
	reporter: process.env.CI ? [["html", { open: "never" }], ["list"]] : "line",
	use: {
		baseURL: "http://127.0.0.1:5173",
		trace: "on-first-retry",
		video: "retain-on-failure",
		screenshot: "only-on-failure",
	},
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
			testIgnore: BUILD_SPECS,
		},
		{
			name: "chromium-build",
			use: { ...devices["Desktop Chrome"], baseURL: `http://127.0.0.1:${buildServerPort}` },
			testMatch: BUILD_SPECS,
		},
	],
	webServer: [
		{
			command: devServerCommand,
			url: "http://127.0.0.1:5173",
			timeout: 90 * 1000,
			reuseExistingServer: !process.env.CI,
		},
		{
			// Always a fresh build of the current code.
			command: buildServerCommand,
			url: `http://127.0.0.1:${buildServerPort}`,
			timeout: 180 * 1000,
			reuseExistingServer: false,
		},
	],
});
