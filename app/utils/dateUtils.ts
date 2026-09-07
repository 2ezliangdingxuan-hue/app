export interface EventDateLike {
    startDate?: string | null;
    endDate?: string | null;
    date?: string | null;
}

export interface FormatDateRangeOptions {
    includeWeekday?: boolean;
    compact?: boolean;
}

/**
 * Formats an event's date or start/end date-time range into a human-readable string.
 * Examples:
 * - Same day: "Tue, Sep 15, 2026 • 9:00 AM – 5:00 PM"
 * - Multi-day: "Sep 15, 2026, 9:00 AM – Sep 17, 2026, 6:00 PM"
 * - Single time: "Tue, Sep 15, 2026 • 9:00 AM"
 * - Legacy date only: "Jun 12, 2024"
 */
export function formatDateRange(
    event?: EventDateLike | null,
    options: FormatDateRangeOptions = {}
): string {
    if (!event) return "TBD";

    const { startDate, endDate, date } = event;

    if (startDate) {
        const start = new Date(startDate);
        const end = endDate ? new Date(endDate) : null;

        if (!isNaN(start.getTime())) {
            const hasEnd = end !== null && !isNaN(end.getTime());
            const sameDay =
                hasEnd &&
                start.getFullYear() === end!.getFullYear() &&
                start.getMonth() === end!.getMonth() &&
                start.getDate() === end!.getDate();

            const dateFmt = new Intl.DateTimeFormat("en-US", {
                weekday: options.includeWeekday ? "short" : undefined,
                month: "short",
                day: "numeric",
                year: "numeric",
            });

            const timeFmt = new Intl.DateTimeFormat("en-US", {
                hour: "numeric",
                minute: "2-digit",
            });

            if (sameDay) {
                const datePart = dateFmt.format(start);
                const separator = options.includeWeekday ? " • " : ", ";
                if (start.getTime() === end!.getTime()) {
                    return `${datePart}${separator}${timeFmt.format(start)}`;
                }
                return `${datePart}${separator}${timeFmt.format(start)} – ${timeFmt.format(end!)}`;
            } else if (hasEnd) {
                const startFullFmt = new Intl.DateTimeFormat("en-US", {
                    month: "short",
                    day: "numeric",
                    year: start.getFullYear() !== end!.getFullYear() ? "numeric" : undefined,
                    hour: "numeric",
                    minute: "2-digit",
                });
                const endFullFmt = new Intl.DateTimeFormat("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                });
                return `${startFullFmt.format(start)} – ${endFullFmt.format(end!)}`;
            } else {
                const datePart = dateFmt.format(start);
                const separator = options.includeWeekday ? " • " : ", ";
                return `${datePart}${separator}${timeFmt.format(start)}`;
            }
        }
    }

    if (date) {
        // If date already looks like a formatted range or custom string, keep it
        if (date.includes("–") || date.includes(" - ") || date.includes(" • ")) {
            return date;
        }

        // Handle YYYY-MM-DD
        if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            const [y, m, d] = date.split("-").map(Number);
            const localDate = new Date(y, m - 1, d);
            return localDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
            });
        }

        const parsed = new Date(date);
        if (!isNaN(parsed.getTime())) {
            return parsed.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
            });
        }
        return date;
    }

    return "TBD";
}

/**
 * Converts a date string or legacy YYYY-MM-DD string to YYYY-MM-DDTHH:mm for <input type="datetime-local">.
 */
export function toDateTimeLocalInput(str?: string | null, defaultTime = "09:00"): string {
    if (!str) return "";

    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(str)) {
        return str.slice(0, 16);
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
        return `${str}T${defaultTime}`;
    }

    const d = new Date(str);
    if (isNaN(d.getTime())) return "";

    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * Converts a date or datetime string to a Google Calendar UTC compact string: YYYYMMDDTHHmmssZ.
 */
export function toGoogleCalendarDateString(dateStr: string): string {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().replace(/-|:|\.\d\d\d/g, "");
}

/**
 * Validates a start and end datetime-local range.
 */
export function validateDateTimeRange(startDate?: string, endDate?: string): { valid: boolean; error?: string } {
    if (!startDate || !startDate.trim()) {
        return { valid: false, error: "Start date and time is required." };
    }
    if (!endDate || !endDate.trim()) {
        return { valid: false, error: "End date and time is required." };
    }
    if (endDate < startDate) {
        return { valid: false, error: "End date and time cannot be earlier than start date and time." };
    }
    return { valid: true };
}
