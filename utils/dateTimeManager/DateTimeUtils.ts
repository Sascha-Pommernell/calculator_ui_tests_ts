/**
 * Date/time helper functions used for template variables and reporting.
 */
export class DateTimeUtils {
    /** Current date as YYYYMMDD (e.g. 20251105). */
    static getDateNow(date: Date = new Date()): string {
        return date.toISOString().slice(0, 10).replace(/-/g, "");
    }

    /** Current date in German format dd.mm.yyyy. */
    static getCurrentDate(date: Date = new Date()): string {
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    }

    /** Current time in format hh:mm. */
    static getCurrentTime(date: Date = new Date()): string {
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${hours}:${minutes}`;
    }

    /** Combined date and time, e.g. "05.11.2025 14:30". */
    static getCurrentDateTime(date: Date = new Date()): string {
        return `${DateTimeUtils.getCurrentDate(date)} ${DateTimeUtils.getCurrentTime(date)}`;
    }

    /** Date `days` days in the future, German format. */
    static getFutureDate(days: number, from: Date = new Date()): string {
        const future = new Date(from);
        future.setDate(future.getDate() + days);
        return DateTimeUtils.getCurrentDate(future);
    }

    /** ISO timestamp used for attachments and summaries. */
    static getTimestamp(): string {
        return new Date().toISOString();
    }
}
