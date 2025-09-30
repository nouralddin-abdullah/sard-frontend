import { defineConfig, devices } from "@playwright/test";

const devServerCommand = "npm run dev -- --host 127.0.0.1 --port 5173";

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
		},
	],
	webServer: {
		command: devServerCommand,
		url: "http://127.0.0.1:5173",
		timeout: 90 * 1000,
		reuseExistingServer: !process.env.CI,
	},
});
