import type { Operation } from "../../../types.js";
import { ApiClient } from "../../clients/ApiClient.js";

export interface CalculationApiResult {
    status: number;
    /** Raw response body – keeps the exact 28-digit result literal */
    rawBody: string;
    /** Exact `result` literal extracted from the raw body (undefined on error responses) */
    resultLiteral: string | undefined;
    /** `error` text of the API error contract (undefined on success) */
    errorMessage: string | undefined;
}

// Matches the raw numeric literal of "result" in the JSON text, e.g. `"result":0.3333333333333333333333333333`
const RESULT_LITERAL = /"result"\s*:\s*(-?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)/;

/**
 * Service for the calculation endpoints (`POST /api/calculate/{operation}`, body `{ numbers: [...] }`).
 * Serves as oracle: the UI must render exactly what the API returns.
 */
export class CalculatorService {
    private readonly apiClient: ApiClient;

    constructor(apiClient?: ApiClient) {
        this.apiClient = apiClient ?? new ApiClient();
    }

    /**
     * Executes a calculation with two or more operands against the API
     */
    async calculate(operation: Operation, numbers: number[]): Promise<CalculationApiResult> {
        const response = await this.apiClient.makeRequest(`/api/calculate/${operation}`, {
            method: "POST",
            data: { numbers },
        });

        const rawBody = await response.text();
        let errorMessage: string | undefined;

        if (!response.ok()) {
            try {
                const body = JSON.parse(rawBody) as { error?: string };
                errorMessage = body.error;
            } catch {
                errorMessage = undefined;
            }
        }

        return {
            status: response.status(),
            rawBody,
            resultLiteral: response.ok() ? RESULT_LITERAL.exec(rawBody)?.[1] : undefined,
            errorMessage,
        };
    }

    async dispose(): Promise<void> {
        await this.apiClient.dispose();
    }
}
