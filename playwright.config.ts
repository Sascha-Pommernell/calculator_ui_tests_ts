import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

export const DEFAULT_UI_BASE_URL = "http://localhost:5173";
export const DEFAULT_API_BASE_URL = "http://localhost:3000";

const isCI = process.env["CI"] === "true";

export default defineConfig({
    testDir: "./tests",
    globalSetup: "./tests/global-setup.ts",
    fullyParallel: true,
    forbidOnly: isCI,
    retries: isCI ? 1 : 0,
    workers: 2,
    reporter: [
        ["html", { outputFolder: "playwright-report", open: isCI ? "never" : "on-failure" }],
        ["json", { outputFile: "test-results/test-results.json" }],
        ["junit", { outputFile: "test-results/junit.xml" }],
        ["list"],
    ],

    use: {
        baseURL: process.env["UI_BASE_URL"] ?? DEFAULT_UI_BASE_URL,
        trace: "on-first-retry",
        screenshot: "only-on-failure",
        video: "retain-on-failure",
        actionTimeout: isCI ? 15_000 : 10_000,
        navigationTimeout: isCI ? 30_000 : 15_000,
        locale: "de-DE",
    },

    projects: [
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"] },
        },
        /*{
            name: "firefox",
            use: { ...devices["Desktop Firefox"] },
        },
        {
            name: "webkit",
            use: { ...devices["Desktop Safari"] },
        },*/
    ],

    expect: {
        timeout: 10_000,
    },

    timeout: isCI ? 60_000 : 45_000,
});
