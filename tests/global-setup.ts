import { request } from "@playwright/test";
import type { FullConfig } from "@playwright/test";
import { HealthService } from "../api/service/calculatorService/HealthService.js";
import { DEFAULT_UI_BASE_URL } from "../playwright.config.js";

/**
 * Entry criterion: UI and API must be reachable before any test runs
 * (fail fast, never "green without tests").
 */
export default async function globalSetup(config: FullConfig): Promise<void> {
    const uiBaseUrl = config.projects[0]?.use.baseURL ?? DEFAULT_UI_BASE_URL;

    const healthService = new HealthService();
    try {
        await healthService.assertHealthy();
        console.log("✓ Calculator API is healthy");
    } finally {
        await healthService.dispose();
    }

    const context = await request.newContext({ baseURL: uiBaseUrl });
    try {
        const response = await context.get("/", { timeout: 5_000 });
        if (!response.ok()) {
            throw new Error(`GET / answered ${response.status()}`);
        }
        console.log(`✓ Calculator UI is reachable at ${uiBaseUrl}`);
    } catch (err) {
        const reason = err instanceof Error ? err.message : String(err);
        throw new Error(
            `Calculator UI is not reachable at ${uiBaseUrl} (${reason}). ` +
                "Start the UI (e.g. `npm run dev` in calculator_ui_ts) or set UI_BASE_URL.",
            { cause: err },
        );
    } finally {
        await context.dispose();
    }
}
