import type { Page, Request, Route } from "@playwright/test";

/**
 * Manages network interception for the UI under test
 * (simulating offline API, gateway errors and slow responses) and
 * records outgoing API requests for "no API call" assertions.
 */
export class ApiRouteManager {
    private readonly recordedRequests: Request[] = [];
    private recording = false;

    constructor(private readonly page: Page) {}

    /**
     * Aborts all requests matching the pattern (simulates an unreachable API)
     */
    async abortRequests(urlPattern: string): Promise<void> {
        await this.page.route(urlPattern, (route: Route) => route.abort("connectionrefused"));
    }

    /**
     * Fulfils all matching requests with the given status and an empty body
     * (simulates a gateway error without API error contract)
     */
    async fulfillWithStatus(urlPattern: string, status: number, body = ""): Promise<void> {
        await this.page.route(urlPattern, (route: Route) =>
            route.fulfill({ status, body, headers: { "Content-Type": "text/plain" } }),
        );
    }

    /**
     * Forwards matching requests to the real backend but delays the response
     */
    async delayResponses(urlPattern: string, delayMs: number): Promise<void> {
        await this.page.route(urlPattern, async (route: Route) => {
            const response = await route.fetch();
            await new Promise((resolve) => setTimeout(resolve, delayMs));
            await route.fulfill({ response });
        });
    }

    /**
     * Removes all registered routes
     */
    async clearRoutes(): Promise<void> {
        await this.page.unrouteAll({ behavior: "ignoreErrors" });
    }

    /**
     * Starts recording requests whose URL matches the given predicate
     */
    startRecording(urlFilter: (url: string) => boolean): void {
        if (this.recording) return;
        this.recording = true;
        this.page.on("request", (request) => {
            if (urlFilter(request.url())) {
                this.recordedRequests.push(request);
            }
        });
    }

    /**
     * Returns all recorded requests
     */
    getRecordedRequests(): Request[] {
        return [...this.recordedRequests];
    }

    /**
     * Number of recorded requests
     */
    getRecordedRequestCount(): number {
        return this.recordedRequests.length;
    }
}
