/**
 * Formats a date into a human-readable string with multiple formatting options
 *
 * @param date - The date to format (Date object, ISO string, or timestamp)
 * @param options - Formatting options
 * @param options.format - The format style to use: 'short' (MM/DD/YYYY), 'long' (Month DD, YYYY), or 'relative' (e.g., "2 hours ago")
 * @param options.includeTime - Whether to include the time in the formatted string
 * @returns Formatted date string
 *
 * @example
 * // Default (short) format: 04/15/2023
 * formatDate(new Date('2023-04-15'))
 *
 * @example
 * // Long format: April 15, 2023
 * formatDate(new Date('2023-04-15'), { format: 'long' })
 *
 * @example
 * // Relative format: 2 days ago
 * formatDate(new Date(Date.now() - 172800000), { format: 'relative' })
 *
 * @example
 * // With time: 04/15/2023, 03:30 PM
 * formatDate(new Date('2023-04-15T15:30:00'), { includeTime: true })
 */
export function formatDate(
  date: Date | string | number,
  options: {
    format?: 'short' | 'long' | 'relative';
    includeTime?: boolean;
  } = {}
): string {
  const { format = 'short', includeTime = false } = options;
  const dateObj = date instanceof Date ? date : new Date(date);

  if (format === 'relative') {
    return getRelativeTimeString(dateObj);
  }

  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: format === 'short' ? '2-digit' : 'long',
    year: 'numeric',
    hour: includeTime ? '2-digit' : undefined,
    minute: includeTime ? '2-digit' : undefined,
  });

  return dateFormatter.format(dateObj);
}

/**
 * Returns a relative time string (e.g., "2 hours ago")
 *
 * @param date - The date to calculate the relative time from
 * @returns A string representing the relative time
 *
 * @example
 * // "just now"
 * getRelativeTimeString(new Date())
 *
 * @example
 * // "5 minutes ago"
 * getRelativeTimeString(new Date(Date.now() - 300000))
 */
function getRelativeTimeString(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInSecs = Math.floor(diffInMs / 1000);
  const diffInMins = Math.floor(diffInSecs / 60);
  const diffInHours = Math.floor(diffInMins / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInSecs < 60) {
    return 'just now';
  } else if (diffInMins < 60) {
    return `${diffInMins} minute${diffInMins > 1 ? 's' : ''} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  } else {
    return formatDate(date, { format: 'short' });
  }
}
