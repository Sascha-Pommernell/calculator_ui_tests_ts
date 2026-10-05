import type { Page } from "@playwright/test";
import type { Pages, UiBehaviorTestData } from "../../../types.js";
import type { ApiRouteManager } from "../../../utils/networkManager/ApiRouteManager.js";
import type { AssertionReporter } from "../../../utils/report/AssertionReporter.js";
import { BaseTestStep } from "../../../utils/testFramework/BaseTestStep.js";

/**
 * TestStep: configures network interception (offline API, gateway error, slow response)
 * according to the scenario in the test data. Must run before the page is opened.
 */
export class NetworkInterceptionTestStep extends BaseTestStep<UiBehaviorTestData> {
    constructor(
        page: Page,
        pages: Pages,
        testData: UiBehaviorTestData,
        assertionReporter: AssertionReporter,
        private readonly routeManager: ApiRouteManager,
    ) {
        super(page, pages, testData, assertionReporter);
    }

    async execute(): Promise<void> {
        const network = this.testData.network;
        if (!network) return;

        await this.executeStep(`Netzwerk-Interception einrichten (${this.testData.scenario})`, async () => {
            switch (this.testData.scenario) {
                case "api-status-offline":
                case "network-error":
                    await this.routeManager.abortRequests(network.urlPattern);
                    this.reportProgress(`Requests auf ${network.urlPattern} werden abgebrochen`);
                    break;
                case "gateway-error":
                    await this.routeManager.fulfillWithStatus(network.urlPattern, network.status ?? 503);
                    this.reportProgress(`Requests auf ${network.urlPattern} antworten mit HTTP ${network.status ?? 503}`);
                    break;
                case "pending-state":
                    await this.routeManager.delayResponses(network.urlPattern, network.delayMs ?? 2000);
                    this.reportProgress(`Antworten auf ${network.urlPattern} werden um ${network.delayMs ?? 2000} ms verzögert`);
                    break;
                default:
                    throw new Error(`Szenario "${this.testData.scenario}" benötigt keine Netzwerk-Interception`);
            }
        });
    }
}
