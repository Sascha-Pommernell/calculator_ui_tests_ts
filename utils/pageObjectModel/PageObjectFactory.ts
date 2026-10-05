import type { Expect, Page } from "@playwright/test";
import { CalculatorPage } from "../../pages/calculator/CalculatorPage.js";
import { NotFoundPage } from "../../pages/notFound/NotFoundPage.js";
import type { Pages } from "../../types.js";

type PageName = keyof PageRegistry;

interface PageRegistry {
    calculator: CalculatorPage;
    notFound: NotFoundPage;
}

/**
 * Factory class to manage Page Object instances (lazy, cached per page)
 */
export class PageObjectFactory {
    private readonly pages: Partial<PageRegistry> = {};

    constructor(
        private readonly page: Page,
        private readonly expect: Expect,
    ) {}

    /**
     * Creates and returns a Page Object instance
     */
    getPage<K extends PageName>(pageName: K): PageRegistry[K] {
        if (!this.pages[pageName]) {
            switch (pageName) {
                case "calculator":
                    this.pages.calculator = new CalculatorPage(this.page, this.expect);
                    break;
                case "notFound":
                    this.pages.notFound = new NotFoundPage(this.page, this.expect);
                    break;
                default:
                    throw new Error(`Unknown page: ${String(pageName)}`);
            }
        }
        return this.pages[pageName] as PageRegistry[K];
    }

    /**
     * Returns all initialized pages
     */
    getAllPages(): Pages {
        return {
            calculatorPage: this.getPage("calculator"),
            notFoundPage: this.getPage("notFound"),
        };
    }
}
