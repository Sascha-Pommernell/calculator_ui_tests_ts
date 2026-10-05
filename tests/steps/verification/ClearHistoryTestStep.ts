import type { BaseTestData } from "../../../types.js";
import { BaseTestStep } from "../../../utils/testFramework/BaseTestStep.js";

/**
 * TestStep: clears the history via "Leeren" and verifies that it disappears
 */
export class ClearHistoryTestStep<TData extends BaseTestData = BaseTestData> extends BaseTestStep<TData> {
    async execute(): Promise<void> {
        await this.executeStep('Verlauf über "Leeren" zurücksetzen', async () => {
            await this.pages.calculatorPage.setHistory.clickClear();

            const hiddenInfo = await this.assertionReporter.expectHidden(
                this.pages.calculatorPage.getHistory.getSection(),
                "Verlaufs-Bereich",
                "Nach Leeren",
            );
            this.addAssertion(hiddenInfo);
        });
    }
}
