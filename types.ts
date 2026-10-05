/**
 * Shared type definitions for the UI test framework.
 */
import type { CalculatorPage } from "./pages/calculator/CalculatorPage.js";
import type { NotFoundPage } from "./pages/notFound/NotFoundPage.js";

export const OPERATIONS = ["add", "subtract", "multiply", "divide"] as const;

export type Operation = (typeof OPERATIONS)[number];

/** The UI (and the API) require at least two operands. */
export const MIN_OPERANDS = 2;

/** Human-readable label of each operation as rendered by the UI (radio button text). */
export const OPERATION_LABELS: Readonly<Record<Operation, string>> = {
    add: "Addieren",
    subtract: "Subtrahieren",
    multiply: "Multiplizieren",
    divide: "Dividieren",
};

/** All Page Object instances created by the PageObjectFactory. */
export interface Pages {
    calculatorPage: CalculatorPage;
    notFoundPage: NotFoundPage;
}

/** Priority tags as used in the test concept (Testkonzept, chapter 3.4). */
export type PriorityTag = "@prio-hoch" | "@prio-mittel";

export interface Urls {
    baseUrl: string;
    calculatorPath: string;
}

/** Common part of every test data record. */
export interface BaseTestData {
    urls: Urls;
    tags: PriorityTag[];
}

/** Operands as typed into the UI (strings, may contain a comma as decimal separator); at least two. */
export interface CalculationInput {
    operation: Operation;
    operands: string[];
}

export interface ExpectedResult {
    /** Exact result literal as rendered in the result panel. */
    result: string;
    /** Expression line above the result, e.g. "1 + 2 + 3 =". */
    expression: string;
    /** Text content of the corresponding history entry, e.g. "1 + 2 + 3 =6". */
    historyEntry: string;
}

/** 01 – Happy path and 02 – decimal precision. */
export interface CalculationTestData extends BaseTestData {
    calculation: CalculationInput;
    expected: ExpectedResult;
}

/** 03 – Errors returned by the API (overflow, division by zero, range validation). */
export interface ApiErrorTestData extends BaseTestData {
    calculation: CalculationInput;
    expected: {
        errorMessage: string;
    };
}

export interface FieldExpectation {
    /** Error text below the field; `null` if the field must not show an error. */
    error: string | null;
}

/** 04 – Client-side validation (no API call). */
export interface ClientValidationTestData extends BaseTestData {
    calculation: CalculationInput;
    expected: {
        /** One expectation per operand field, in field order. */
        fields: FieldExpectation[];
        /** Hint text shown while the result panel is idle. */
        idleHint: string;
    };
}

export interface ApiStatusExpectation {
    text: string;
    dataStatus: "checking" | "online" | "offline";
}

/** 05 – UI behaviour (status indicator, network errors, pending state, history, navigation). */
export interface UiBehaviorTestData extends BaseTestData {
    scenario:
        | "api-status-online"
        | "api-status-offline"
        | "network-error"
        | "gateway-error"
        | "pending-state"
        | "history-order-and-clear"
        | "history-limit"
        | "field-error-clears-on-edit"
        | "operand-fields-add-remove"
        | "not-found-route"
        | "initial-page-state";
    calculations?: CalculationInput[];
    apiStatus?: ApiStatusExpectation;
    network?: {
        /** Glob pattern of the requests to intercept. */
        urlPattern: string;
        /** Delay in ms before the intercepted response is forwarded (pending-state). */
        delayMs?: number;
        /** HTTP status used to fulfil the intercepted request (gateway-error). */
        status?: number;
    };
    /** Scenario "operand-fields-add-remove". */
    operandFields?: {
        /** Number of fields to add via "Zahl hinzufügen". */
        add: number;
        /** Values typed into the fields after adding (field order). */
        values: string[];
        /** 1-based position of the field to remove. */
        removePosition: number;
        /** Expected values of the remaining fields after removal. */
        valuesAfterRemove: string[];
    };
    expected?: {
        errorMessage?: string;
        results?: string[];
        historyEntries?: string[];
        historyLimit?: number;
        pendingButtonText?: string;
        idleButtonText?: string;
        notFoundHeading?: string;
        backLinkText?: string;
        unknownPath?: string;
        pageTitle?: string;
        heading?: string;
        idleHint?: string;
        defaultOperation?: Operation;
        /** Number of operand fields shown initially (= minimum). */
        initialOperandCount?: number;
        fieldError?: string;
        operandAfterEdit?: string;
    };
}

/** Wrapper record as stored in the data/*.json files. */
export interface TestDataSet<TData extends BaseTestData = BaseTestData> {
    testCase: string;
    testData: TData;
}

/** Information collected for every assertion (attached to the Playwright report). */
export interface AssertionInfo {
    timestamp: string;
    description: string;
    context: string;
    success: boolean;
    type: string;
    [key: string]: unknown;
}
