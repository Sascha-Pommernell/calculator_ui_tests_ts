import { ApiClient } from "../../clients/ApiClient.js";

/**
 * Service for the health endpoint of the Calculator API (`GET /health`)
 */
export class HealthService {
    private readonly apiClient: ApiClient;

    constructor(apiClient?: ApiClient) {
        this.apiClient = apiClient ?? new ApiClient();
    }

    /**
     * Returns true if the API answers `GET /health` with 200 and `{ "status": "ok" }`
     */
    async isHealthy(timeout = 5_000): Promise<boolean> {
        try {
            const response = await this.apiClient.makeRequest("/health", { timeout });
            if (!response.ok()) return false;
            const body = (await response.json()) as { status?: string };
            return body.status === "ok";
        } catch {
            return false;
        }
    }

    /**
     * Throws a descriptive error if the API is not reachable
     */
    async assertHealthy(): Promise<void> {
        if (!(await this.isHealthy())) {
            throw new Error(
                `Calculator API is not reachable at ${this.apiClient.baseUrl}. ` +
                    "Start the API (e.g. `npm run dev` in calculator_api_ts) or set API_BASE_URL.",
            );
        }
    }

    async dispose(): Promise<void> {
        await this.apiClient.dispose();
    }
}
