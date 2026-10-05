import { request } from "@playwright/test";
import type { APIRequestContext, APIResponse } from "@playwright/test";

export const DEFAULT_API_BASE_URL = "http://localhost:3000";

export interface ApiRequestOptions {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    /** Serialised as JSON (objects) or sent as-is (strings) */
    data?: unknown;
    headers?: Record<string, string>;
    timeout?: number;
}

/**
 * API Client for the Calculator API based on Playwright's APIRequestContext.
 * Used for the health probe (global setup) and as result oracle in UI tests.
 */
export class ApiClient {
    readonly baseUrl: string;
    readonly timeout: number;
    private readonly debugMode: boolean;
    private context: APIRequestContext | null = null;

    constructor(baseUrl?: string) {
        this.baseUrl = this.resolveEnvironmentUrl(baseUrl ?? process.env["API_BASE_URL"] ?? DEFAULT_API_BASE_URL);
        this.timeout = Number.parseInt(process.env["API_TIMEOUT"] ?? "15000", 10);
        this.debugMode = process.env["DEBUG_API_CALLS"] === "true";

        if (!this.baseUrl) {
            throw new Error("API_BASE_URL must be set in environment variables");
        }
    }

    /**
     * Resolves environment placeholders in URLs ({TEST_ENVIRONMENT})
     */
    resolveEnvironmentUrl(url: string): string {
        if (!url) return url;
        const envVar = process.env["TEST_ENVIRONMENT"] ?? process.env["NODE_ENV"] ?? "dev";
        return url.replace(/\{TEST_ENVIRONMENT\}/gi, envVar.toLowerCase()).replace(/\/+$/, "");
    }

    private async getContext(): Promise<APIRequestContext> {
        if (!this.context) {
            this.context = await request.newContext({
                baseURL: this.baseUrl,
                extraHTTPHeaders: { Accept: "application/json" },
            });
        }
        return this.context;
    }

    /**
     * Sends a request relative to the base URL
     */
    async makeRequest(endpoint: string, options: ApiRequestOptions = {}): Promise<APIResponse> {
        const context = await this.getContext();
        const method = options.method ?? "GET";
        const url = `${this.baseUrl}${endpoint}`;

        if (this.debugMode) {
            console.log(`🌐 ${method} ${url}`);
            if (options.data !== undefined) {
                console.log("📤 Request Body:", JSON.stringify(options.data, null, 2));
            }
        }

        try {
            const response = await context.fetch(endpoint, {
                method,
                ...(options.data !== undefined ? { data: options.data } : {}),
                ...(options.headers ? { headers: options.headers } : {}),
                timeout: options.timeout ?? this.timeout,
            });

            if (this.debugMode) {
                console.log(`📥 Response: ${response.status()} ${response.statusText()}`);
            }

            return response;
        } catch (error) {
            console.error(`❌ Request failed: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }

    /**
     * Releases the underlying request context
     */
    async dispose(): Promise<void> {
        if (this.context) {
            await this.context.dispose();
            this.context = null;
        }
    }
}
