import { MIN_OPERANDS } from "../../../types.js";
import type { UiBehaviorTestData } from "../../../types.js";
import { BaseTestStep } from "../../../utils/testFramework/BaseTestStep.js";

/**
 * TestStep: verifies the initial state of the calculator page
 * (title, heading, idle hint, two empty operand fields, default operation, focus, empty history)
 */
export class InitialPageStateVerificationTestStep extends BaseTestStep<UiBehaviorTestData> {
    async execute(): Promise<void> {
        const expected = this.testData.expected ?? {};
        const calculatorPage = this.pages.calculatorPage;
        const getForm = calculatorPage.getCalculatorForm;
        const initialOperandCount = expected.initialOperandCount ?? MIN_OPERANDS;

        await this.executeStep("Verifikation des initialen Seitenzustands", async () => {
            await calculatorPage.expect(calculatorPage.page).toHaveTitle(expected.pageTitle ?? "Calculator");
            const titleInfo = await this.assertionReporter.expectEqual(
                await calculatorPage.getTitle(),
                expected.pageTitle ?? "Calculator",
                "Seitentitel",
                "Initialzustand",
            );
            this.addAssertion(titleInfo);

            const headingInfo = await this.assertionReporter.expectText(
                calculatorPage.getHeading(),
                expected.heading ?? "Calculator",
                "Überschrift (h1)",
                "Initialzustand",
            );
            this.addAssertion(headingInfo);

            const hintInfo = await this.assertionReporter.expectText(
                calculatorPage.getResultPanel.getHint(),
                expected.idleHint ?? "Gib zwei Zahlen ein und wähle eine Operation.",
                "Hinweistext im Ergebnis-Panel",
                "Initialzustand",
            );
            this.addAssertion(hintInfo);

            const operationInfo = await this.assertionReporter.expectEqual(
                await getForm.getSelectedOperation(),
                expected.defaultOperation ?? "add",
                "Vorausgewählte Operation",
                "Initialzustand",
            );
            this.addAssertion(operationInfo);

            await calculatorPage.expect(getForm.getOperandInputs()).toHaveCount(initialOperandCount);
            const countInfo = await this.assertionReporter.expectEqual(
                await getForm.getOperandCount(),
                initialOperandCount,
                "Anzahl der Eingabefelder (Minimum)",
                "Initialzustand",
            );
            this.addAssertion(countInfo);

            const emptyInputsInfo = await this.assertionReporter.expectEqual(
                await getForm.getOperandValues(),
                Array.from({ length: initialOperandCount }, () => ""),
                "Leere Eingabefelder",
                "Initialzustand",
            );
            this.addAssertion(emptyInputsInfo);

            const noRemoveInfo = await this.assertionReporter.expectHidden(
                getForm.getRemoveOperandButtons(),
                "Entfernen-Buttons",
                "Initialzustand – am Minimum nicht vorhanden",
            );
            this.addAssertion(noRemoveInfo);

            const addVisibleInfo = await this.assertionReporter.expectVisible(
                getForm.getAddOperandButton(),
                'Button "Zahl hinzufügen"',
                "Initialzustand",
            );
            this.addAssertion(addVisibleInfo);

            await calculatorPage.expect(getForm.getOperandInput(1)).toBeFocused();
            const focusInfo = await this.assertionReporter.expectEqual(
                await getForm.isFocused(getForm.getOperandInput(1)),
                true,
                "Autofokus auf Zahl 1",
                "Initialzustand",
            );
            this.addAssertion(focusInfo);

            const buttonInfo = await this.assertionReporter.expectText(
                getForm.getSubmitButton(),
                expected.idleButtonText ?? "Berechnen",
                "Button-Text",
                "Initialzustand",
            );
            this.addAssertion(buttonInfo);

            const noHistoryInfo = await this.assertionReporter.expectHidden(
                calculatorPage.getHistory.getSection(),
                "Verlaufs-Bereich",
                "Initialzustand",
            );
            this.addAssertion(noHistoryInfo);

            await this.assertionReporter.createSummaryReport(this.assertions);
        });
    }
}
