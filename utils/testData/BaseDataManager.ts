import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export type Environment = "DEV" | "STAGING";

export interface DataFileConfig {
    /** Base name for the data files */
    baseName: string;
    /** Optional subdirectory under data/ */
    subDirectory?: string;
    /** Optional custom dev file name */
    devFile?: string;
    /** Optional custom staging file name */
    stagingFile?: string;
}

const DATA_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "data");

/**
 * Base class for managing data files with common functionality
 * Provides environment detection, file path resolution, and JSON file operations
 */
export class BaseDataManager {
    /**
     * Determines the current environment (DEV or STAGING)
     */
    getEnvironment(): Environment {
        const envVar = process.env["TEST_ENVIRONMENT"] ?? process.env["NODE_ENV"];
        if (envVar) {
            const upper = envVar.toUpperCase();
            return upper.includes("STAGING") || upper.includes("PROD") ? "STAGING" : "DEV";
        }
        return "DEV";
    }

    /**
     * Resolves the data file path based on environment and configuration
     */
    resolveDataFilePath(config: DataFileConfig, environment: Environment): string {
        if (!config?.baseName) {
            throw new Error("baseName is required in config");
        }

        const fileName =
            environment === "STAGING"
                ? (config.stagingFile ?? `${config.baseName}_staging.json`)
                : (config.devFile ?? `${config.baseName}_dev.json`);

        return config.subDirectory
            ? path.resolve(DATA_ROOT, config.subDirectory, fileName)
            : path.resolve(DATA_ROOT, fileName);
    }

    /**
     * Loads data from a JSON file
     * @param filePath - Path to the JSON file
     * @param throwOnMissing - Whether to throw if the file is missing (otherwise returns [])
     */
    loadJsonFile<T = unknown>(filePath: string, throwOnMissing = true): T | [] {
        try {
            if (!fs.existsSync(filePath)) {
                if (throwOnMissing) {
                    throw new Error(`Data file not found at path: ${filePath}`);
                }
                console.warn(`Warning: Data file not found at ${filePath}. Creating new file.`);
                return [];
            }

            const rawData = fs.readFileSync(filePath, "utf-8");

            if (!rawData || rawData.trim() === "") {
                console.warn(`Warning: Data file ${filePath} is empty.`);
                return [];
            }

            const parsedData: unknown = JSON.parse(rawData);

            if (!parsedData) {
                console.warn(`Warning: Data file ${filePath} contains null.`);
                return [];
            }

            return parsedData as T;
        } catch (error) {
            if (error instanceof Error && error.message.includes("not found")) {
                throw error;
            }
            throw new Error(
                `Error loading data from ${filePath}: ${error instanceof Error ? error.message : String(error)}`,
                { cause: error },
            );
        }
    }

    /**
     * Saves data to a JSON file (creates the directory if necessary)
     */
    saveJsonFile(filePath: string, data: unknown, prettyPrint = true): void {
        try {
            const directory = path.dirname(filePath);
            if (!fs.existsSync(directory)) {
                fs.mkdirSync(directory, { recursive: true });
            }

            const jsonString = prettyPrint ? JSON.stringify(data, null, 2) : JSON.stringify(data);
            fs.writeFileSync(filePath, jsonString, "utf-8");
            console.log(`✓ Data saved successfully to ${filePath}`);
        } catch (error) {
            throw new Error(
                `Error saving data to ${filePath}: ${error instanceof Error ? error.message : String(error)}`,
                { cause: error },
            );
        }
    }
}
