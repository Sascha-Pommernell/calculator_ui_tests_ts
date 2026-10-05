import type { BaseTestData } from "../../../types.js";
import { BaseTestStep } from "../../../utils/testFramework/BaseTestStep.js";

/**
 * TestStep: verifies the history list (entries newest first, optional limit)
 */
export class HistoryVerificationTestStep<TData extends BaseTestData = BaseTestData> extends BaseTestStep<TData> {
    /**
     * @param expectedEntries - Expected text of all history entries (newest first)
     * @param expectedLimit - Optional maximum number of entries
     */
    async execute(expectedEntries: string[], expectedLimit?: number): Promise<void> {
        await this.executeStep("Verifikation des Verlaufs", async () => {
            const history = this.pages.calculatorPage.getHistory;

            const headingInfo = await this.assertionReporter.expectVisible(
                history.getHeading(),
                "Verlaufs-Überschrift",
                "Verlauf",
            );
            this.addAssertion(headingInfo);

            await this.pages.calculatorPage.expect(history.getItems()).toHaveCount(expectedEntries.length);
            const entriesInfo = await this.assertionReporter.expectEqual(
                await history.getEntries(),
                expectedEntries,
                "Verlaufseinträge (neueste zuerst)",
                "Verlauf",
            );
            this.addAssertion(entriesInfo);

            if (expectedLimit !== undefined) {
                const limitInfo = await this.assertionReporter.expectEqual(
                    await history.getEntryCount(),
                    expectedLimit,
                    "Maximale Anzahl Verlaufseinträge",
                    "Verlauf",
                );
                this.addAssertion(limitInfo);
            }
        });
    }
}
