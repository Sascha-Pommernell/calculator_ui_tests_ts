# calculator_ui_tests_ts – E2E UI Tests

[English](#english) | [Deutsch](#deutsch)

---

## English

### 🎯 Overview

Automated end-to-end UI test framework for the [calculator_ui_ts](https://github.com/Sascha-Pommernell/calculator_ui_ts)
React application running against the [calculator_api_ts](https://github.com/Sascha-Pommernell/calculator_api_ts)
backend. The project uses Playwright and follows the same architecture as the *E2E-Tests-PA-Leadmanagement*
framework: Page Objects with separated selectors, modular test steps, environment-specific JSON test data and a
reporting layer that attaches every assertion to the Playwright report.

**Author:** Sascha Pommernell
**Framework:** Playwright v1.63
**Language:** TypeScript 7 (ESM, strict)
**Node.js:** >=24

### ✨ Features

- 🎭 **Playwright-based**: Chromium (Firefox/WebKit configurable), traces, videos and screenshots on failure
- 📄 **Page Object Model**: Pages → components (`Get*`/`Set*`/`Is*`) → selector classes
- 🔄 **Modular Test Steps**: Reusable `BaseTestStep` subclasses wrapped in `test.step()`
- 📊 **Data-driven Testing**: One test per record in `data/**/*_Dev.json` / `*_Staging.json`, template variables (`{{BASE_URL}}`, `{{dateNow}}`, `{{currentDateDE}}`)
- 🏷️ **Priority tags**: `@prio-hoch` / `@prio-mittel` taken from the test data (filterable via `--grep`)
- 🔍 **API oracle**: The UI result is cross-checked against the raw API response (exact 28-digit decimals)
- 🌐 **Network simulation**: Offline API, gateway errors and slow responses via `page.route()`
- 📈 **Reports**: HTML, JSON, JUnit, list + per-assertion JSON attachments and summary report
- 🚦 **Fail fast**: `globalSetup` probes `GET /health` (API) and `GET /` (UI) before any test runs

### 🛠 Prerequisites

- Node.js ≥ 24, npm ≥ 10
- Running `calculator_api_ts` (default `http://localhost:3000`)
- Running `calculator_ui_ts` (default `http://localhost:5173`, dev server or `vite preview`)

### 📦 Installation

```bash
git clone https://github.com/Sascha-Pommernell/calculator_ui_tests_ts.git
cd calculator_ui_tests_ts
npm install
npm run install:browsers
```

### ⚙️ Configuration

Create a `.env` file (see `.env.example`):

```env
TEST_ENVIRONMENT=DEV            # DEV or STAGING → selects *_Dev.json / *_Staging.json
UI_BASE_URL=http://localhost:5173
API_BASE_URL=http://localhost:3000
DEBUG_API_CALLS=false
```

Main settings in `playwright.config.ts`: `testDir: ./tests`, `globalSetup`, `fullyParallel`, 2 workers,
retries `1` in CI / `0` locally, reporters HTML (`on-failure` locally, `never` in CI), JSON, JUnit, list;
trace `on-first-retry`, screenshot `only-on-failure`, video `retain-on-failure`.

### 📁 Project Structure

```
calculator_ui_tests_ts/
├── 📁 api/                               # API clients and services (health probe, result oracle)
│   ├── clients/ApiClient.ts
│   └── service/calculatorService/
│       ├── CalculatorService.ts          # POST /api/calculate/{operation}, raw result literal
│       └── HealthService.ts              # GET /health
├── 📁 data/                              # Test data (environment-specific, one array per spec)
│   ├── happyPathTestData/                # happyPath_Dev.json, happyPath_Staging.json
│   ├── decimalPrecisionTestData/
│   ├── apiErrorTestData/
│   ├── clientValidationTestData/
│   └── uiBehaviorTestData/
├── 📁 pages/                             # Page Objects
│   ├── calculator/
│   │   ├── CalculatorPage.ts
│   │   ├── CalculatorPageSelectors.ts
│   │   └── components/
│   │       ├── calculatorForm/           # SetCalculatorForm, GetCalculatorForm, IsCalculatorFormDisabled, *Selectors
│   │       ├── resultPanel/              # GetResultPanel, IsResultPanelVisible, *Selectors
│   │       ├── history/                  # GetHistory, SetHistory, IsHistoryVisible, *Selectors
│   │       └── apiStatus/                # GetApiStatus, *Selectors
│   └── notFound/
│       ├── NotFoundPage.ts
│       └── NotFoundPageSelectors.ts
├── 📁 tests/                             # Test specifications
│   ├── 01_HappyPath.spec.ts
│   ├── 02_DecimalPrecision.spec.ts
│   ├── 03_ApiErrors.spec.ts
│   ├── 04_ClientValidation.spec.ts
│   ├── 05_UiBehavior.spec.ts
│   ├── global-setup.ts                   # Health probes (API + UI)
│   └── steps/                            # Modular test steps
│       ├── calculation/
│       ├── navigation/
│       ├── network/
│       ├── verification/
│       └── index.ts
├── 📁 utils/                             # Utility modules
│   ├── dateTimeManager/DateTimeUtils.ts
│   ├── networkManager/ApiRouteManager.ts # page.route() helpers + request recording
│   ├── pageObjectModel/PageObjectFactory.ts
│   ├── report/AssertionReporter.ts
│   ├── testData/BaseDataManager.ts
│   ├── testData/TestDataManager.ts
│   └── testFramework/BaseTestStep.ts, TestCaseRunner.ts
├── types.ts                              # Shared types (Pages, test data records, …)
├── playwright.config.ts
├── .oxlintrc.json
└── package.json
```

### 🚀 Usage

```bash
npm test                   # all tests
npm run test:headed        # visible browser
npm run test:parallel      # 4 workers
npm run test:ui            # Playwright UI mode
npm run test:debug         # debug mode
npm run test:report        # open the HTML report
npm run test:with-report   # run + open report
npm run test:prio-hoch     # only @prio-hoch
npm run test:prio-mittel   # only @prio-mittel
npm run typecheck          # tsc --noEmit
npm run lint               # oxlint
```

```bash
npx playwright test 01_HappyPath.spec.ts          # one spec file
npx playwright test -g "TC-DEC-04"                # one test case by ID
npx playwright test --project=chromium
```

### 📊 Test Scenarios

The IDs follow the test concept of `calculator_api_ts` (`docs/Testkonzept.md`, chapter 4). Cases that
cannot be triggered through the UI (request body structure, HTTP method, headers) remain API-level only;
UI-specific cases carry the prefix `TC-UI-`.

| Spec | Test cases | Workflow |
|---|---|---|
| `01_HappyPath` | TC-ADD-01/02/03, TC-SUB-01/02/03, TC-MUL-01/02/03/04, TC-DIV-01/02/03/04 (02 = variadic, 3–4 operands) | Open page → add fields as needed & enter operands → select operation → submit → verify result & expression → verify history → API oracle |
| `02_DecimalPrecision` | TC-DEC-01/02/03/04/09, TC-UI-DEC-01/02 (comma separator), TC-UI-DEC-03 (multi-step precision) | same as 01, exact string comparison of up to 28 decimal places |
| `03_ApiErrors` | TC-DEC-05–08/11 (overflow, incl. later step), TC-DIV0-01/02/03, TC-VAL-10/11 (range) | Open page → enter → select → submit → verify API error alert, no result, no history entry |
| `04_ClientValidation` | TC-UI-VAL-01–08, TC-UI-VAL-10/11 (added fields) | Open page → enter → select → submit → verify field errors per field, `aria-invalid`, idle hint, **0 API requests** |
| `05_UiBehavior` | TC-UI-PAGE-01, TC-UI-OPS-01 (add/remove operand fields, min. 2), TC-UI-STAT-01 (= TC-CON-06), TC-UI-STAT-02, TC-UI-NET-01/02, TC-UI-PEND-01, TC-UI-HIST-01/02, TC-UI-VAL-09, TC-UI-NAV-01 | Scenario-based: initial state, operand fields, API status, offline API, network/gateway errors, pending state, history order/limit/clear, error clears on edit, 404 route |

### 🗂 Test Data Management

```ts
const testCaseRunner = new TestCaseRunner<CalculationTestData>({
  baseName: "happyPath",
  subDirectory: "happyPathTestData",
  devFile: "happyPath_Dev.json",
  stagingFile: "happyPath_Staging.json",
});
const processedTestData = testCaseRunner.setupTestCase(testCaseName); // template variables resolved
```

Each record: `{ "testCase": "<ID + title>", "testData": { "urls", "tags", ... } }`. The `tags` array is
passed to Playwright's `tag` option, the `testCase` name becomes the test title.

### 🏗 Architecture Patterns

```ts
// Page Object with separated selectors
export class NotFoundPage {
  constructor(readonly page: Page, readonly expect: Expect) {}
  getHeading(): Locator { return this.page.getByRole("heading", { name: NotFoundPageSelectors.HEADING_TEXT }); }
}

// Test step
export class SubmitCalculationTestStep extends BaseTestStep {
  async execute(): Promise<void> {
    await this.executeStep('Berechnung über "Berechnen" absenden', async () => {
      await this.pages.calculatorPage.setCalculatorForm.clickSubmit();
    });
  }
}
```

### 🔁 CI (GitHub Actions)

`.github/workflows/ui-tests.yml` checks out API and UI repos (refs selectable via `workflow_dispatch`), builds and
starts the API (`npm start`, port 3000) and the UI (`vite preview`, port 5173, proxy to the API), runs
`npm run lint`, `npm run typecheck`, `npm test` and uploads `playwright-report/` and `test-results/`
(server logs on failure).

---

## Deutsch

### 🎯 Übersicht

Automatisiertes End-to-End-UI-Test-Framework für die React-Anwendung
[calculator_ui_ts](https://github.com/Sascha-Pommernell/calculator_ui_ts), betrieben gegen das Backend
[calculator_api_ts](https://github.com/Sascha-Pommernell/calculator_api_ts). Das Projekt verwendet Playwright
und folgt derselben Architekturlogik wie das Framework *E2E-Tests-PA-Leadmanagement*: Page Objects mit getrennten
Selektoren, modulare Test-Schritte, umgebungsspezifische JSON-Testdaten und ein Reporting-Layer, der jede
Assertion an den Playwright-Report anhängt.

**Autor:** Sascha Pommernell
**Framework:** Playwright v1.63
**Sprache:** TypeScript 7 (ESM, strict)
**Node.js:** >=24

### ✨ Features

- 🎭 **Playwright-basiert**: Chromium (Firefox/WebKit konfigurierbar), Traces, Videos und Screenshots bei Fehlern
- 📄 **Page Object Model**: Pages → Komponenten (`Get*`/`Set*`/`Is*`) → Selector-Klassen
- 🔄 **Modulare Test-Schritte**: Wiederverwendbare `BaseTestStep`-Ableitungen in `test.step()`
- 📊 **Datengetriebene Tests**: Ein Test je Datensatz in `data/**/*_Dev.json` / `*_Staging.json`, Template-Variablen (`{{BASE_URL}}`, `{{dateNow}}`, `{{currentDateDE}}`)
- 🏷️ **Prioritäts-Tags**: `@prio-hoch` / `@prio-mittel` aus den Testdaten (filterbar über `--grep`)
- 🔍 **API-Orakel**: Das UI-Ergebnis wird mit der rohen API-Antwort abgeglichen (exakte 28-stellige Dezimalzahlen)
- 🌐 **Netzwerk-Simulation**: Offline-API, Gateway-Fehler und langsame Antworten via `page.route()`
- 📈 **Reports**: HTML, JSON, JUnit, Liste + JSON-Anhang je Assertion und Summary-Report
- 🚦 **Fail fast**: `globalSetup` prüft `GET /health` (API) und `GET /` (UI) vor dem ersten Test

### 🛠 Voraussetzungen

- Node.js ≥ 24, npm ≥ 10
- Laufende `calculator_api_ts` (Standard `http://localhost:3000`)
- Laufende `calculator_ui_ts` (Standard `http://localhost:5173`, Dev-Server oder `vite preview`)

### 📦 Installation

```bash
git clone https://github.com/Sascha-Pommernell/calculator_ui_tests_ts.git
cd calculator_ui_tests_ts
npm install
npm run install:browsers
```

### ⚙️ Konfiguration

`.env`-Datei anlegen (siehe `.env.example`):

```env
TEST_ENVIRONMENT=DEV            # DEV oder STAGING → wählt *_Dev.json / *_Staging.json
UI_BASE_URL=http://localhost:5173
API_BASE_URL=http://localhost:3000
DEBUG_API_CALLS=false
```

Haupteinstellungen in `playwright.config.ts`: `testDir: ./tests`, `globalSetup`, `fullyParallel`, 2 Worker,
Retries `1` in CI / `0` lokal, Reporter HTML (`on-failure` lokal, `never` in CI), JSON, JUnit, Liste;
Trace `on-first-retry`, Screenshot `only-on-failure`, Video `retain-on-failure`.

### 📁 Projektstruktur

Siehe englischer Abschnitt – identische Struktur: `api/` (Clients/Services), `data/` (Testdaten je Spec,
Dev/Staging), `pages/` (Page Objects + Komponenten + Selektoren), `tests/` (Specs 01–05, `global-setup.ts`,
`steps/`), `utils/` (DateTimeUtils, ApiRouteManager, PageObjectFactory, AssertionReporter, BaseDataManager,
TestDataManager, BaseTestStep, TestCaseRunner), `types.ts`.

### 🚀 Verwendung

```bash
npm test                   # alle Tests
npm run test:headed        # sichtbarer Browser
npm run test:parallel      # 4 Worker
npm run test:ui            # Playwright-UI-Modus
npm run test:debug         # Debug-Modus
npm run test:report        # HTML-Report öffnen
npm run test:with-report   # Lauf + Report
npm run test:prio-hoch     # nur @prio-hoch
npm run test:prio-mittel   # nur @prio-mittel
npm run typecheck          # tsc --noEmit
npm run lint               # oxlint
```

### 📊 Testszenarien

Die IDs folgen dem Testkonzept von `calculator_api_ts` (`docs/Testkonzept.md`, Kapitel 4). Fälle, die über die UI
nicht auslösbar sind (Body-Struktur, HTTP-Methode, Header), bleiben reine API-Tests; UI-spezifische Fälle tragen
das Präfix `TC-UI-`.

| Spec | Testfälle | Ablauf |
|---|---|---|
| `01_HappyPath` | TC-ADD-01/02/03, TC-SUB-01/02/03, TC-MUL-01/02/03/04, TC-DIV-01/02/03/04 (02 = variadisch, 3–4 Operanden) | Seite öffnen → Felder bei Bedarf hinzufügen & Operanden eingeben → Operation wählen → absenden → Ergebnis & Ausdruck prüfen → Verlauf prüfen → API-Orakel |
| `02_DecimalPrecision` | TC-DEC-01/02/03/04/09, TC-UI-DEC-01/02 (Komma), TC-UI-DEC-03 (mehrstufige Präzision) | wie 01, exakter String-Vergleich mit bis zu 28 Nachkommastellen |
| `03_ApiErrors` | TC-DEC-05–08/11 (Überlauf, auch im späteren Schritt), TC-DIV0-01/02/03, TC-VAL-10/11 (Wertebereich) | Seite öffnen → eingeben → wählen → absenden → API-Fehlermeldung prüfen, kein Ergebnis, kein Verlaufseintrag |
| `04_ClientValidation` | TC-UI-VAL-01–08, TC-UI-VAL-10/11 (hinzugefügte Felder) | Seite öffnen → eingeben → wählen → absenden → Feldfehler je Feld, `aria-invalid`, Idle-Hinweis, **0 API-Requests** |
| `05_UiBehavior` | TC-UI-PAGE-01, TC-UI-OPS-01 (Felder hinzufügen/entfernen, Minimum 2), TC-UI-STAT-01 (= TC-CON-06), TC-UI-STAT-02, TC-UI-NET-01/02, TC-UI-PEND-01, TC-UI-HIST-01/02, TC-UI-VAL-09, TC-UI-NAV-01 | Szenario-basiert: Initialzustand, Operandenfelder, API-Status, Offline-API, Netzwerk-/Gateway-Fehler, Pending-Zustand, Verlauf (Reihenfolge/Limit/Leeren), Fehler verschwindet bei Eingabe, 404-Route |

### 🧰 Utility-Module

- **BaseDataManager** – Umgebungs-Erkennung (DEV/STAGING), Pfadauflösung, JSON-Dateioperationen
- **TestDataManager** – Umgebungsspezifisches Laden, Template-Variablen, Testfall-Auswahl (generisch typisiert)
- **TestCaseRunner** – Testfall-Orchestrierung, Tags, Validierung der Datenstruktur
- **BaseTestStep** – Basisklasse aller Schritte (`executeStep`, Assertion-Sammlung, Wartehelfer)
- **AssertionReporter** – `expectEqual`, `expectVisible`, `expectHidden`, `expectText`, `expectContainsText`, `expectUrl`, `createSummaryReport`
- **PageObjectFactory** – Zentrale, gecachte Erstellung der Page Objects
- **ApiRouteManager** – `page.route()`-Helfer (abbrechen, Status erzwingen, verzögern) und Request-Aufzeichnung
- **DateTimeUtils** – Datum/Zeit für Template-Variablen und Zeitstempel

### 🔁 CI (GitHub Actions)

`.github/workflows/ui-tests.yml` checkt API- und UI-Repo aus (Refs per `workflow_dispatch` wählbar), baut und startet
API (`npm start`, Port 3000) und UI (`vite preview`, Port 5173, Proxy zur API), führt `npm run lint`,
`npm run typecheck`, `npm test` aus und lädt `playwright-report/` und `test-results/` hoch (bei Fehlschlag zusätzlich
die Server-Logs).
