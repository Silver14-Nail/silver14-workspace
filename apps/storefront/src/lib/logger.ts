type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: string;
  data?: unknown;
  timestamp: string;
}

const isDev = process.env.NODE_ENV !== 'production';

function serialize(entry: LogEntry): string {
  const ctx = entry.context ? ` [${entry.context}]` : '';
  const base = `[${entry.timestamp}] [${entry.level.toUpperCase()}]${ctx} ${entry.message}`;
  if (entry.data === undefined) return base;
  try {
    return `${base} ${JSON.stringify(entry.data)}`;
  } catch {
    return `${base} [unserializable data]`;
  }
}

function makeEntry(level: LogLevel, message: string, data?: unknown, context?: string): LogEntry {
  return { level, message, data, context, timestamp: new Date().toISOString() };
}

// ── Monitoring hook ────────────────────────────────────────────────────────────
// Replace the no-op with your provider (Sentry, Datadog, etc.) without
// touching any call sites.
function reportToMonitoring(_entry: LogEntry, _raw?: unknown): void {
  // Example Sentry wiring (uncomment when SDK is installed):
  // if (typeof window !== 'undefined' && raw instanceof Error) {
  //   Sentry.captureException(raw, { extra: { context: _entry.context } });
  // }
}

// ── Public API ─────────────────────────────────────────────────────────────────

export const logger = {
  debug(message: string, data?: unknown, context?: string): void {
    if (!isDev) return;
    const entry = makeEntry('debug', message, data, context);
    console.debug(serialize(entry));
  },

  info(message: string, data?: unknown, context?: string): void {
    const entry = makeEntry('info', message, data, context);
    console.info(serialize(entry));
  },

  warn(message: string, data?: unknown, context?: string): void {
    const entry = makeEntry('warn', message, data, context);
    console.warn(serialize(entry));
  },

  error(message: string, error?: unknown, context?: string): void {
    const data =
      error instanceof Error
        ? { message: error.message, stack: isDev ? error.stack : undefined }
        : error;
    const entry = makeEntry('error', message, data, context);
    console.error(serialize(entry));
    reportToMonitoring(entry, error);
  },
};
