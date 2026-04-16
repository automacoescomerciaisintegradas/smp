/**
 * Centralized logging system for SAMA
 * Provides consistent logging format across all services
 */

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  service: string;
  message: string;
  correlationId?: string;
  metadata?: Record<string, unknown>;
  stack?: string;
}

class Logger {
  private correlationId?: string;

  constructor(private serviceName: string, correlationId?: string) {
    this.serviceName = serviceName;
    this.correlationId = correlationId;
  }

  createChild(operation: string): Logger {
    return new Logger(`${this.serviceName}.${operation}`, this.correlationId);
  }

  debug(message: string, metadata?: Record<string, unknown>): void {
    this.log('DEBUG', message, metadata);
  }

  info(message: string, metadata?: Record<string, unknown>): void {
    this.log('INFO', message, metadata);
  }

  warn(message: string, metadata?: Record<string, unknown>): void {
    this.log('WARN', message, metadata);
  }

  error(message: string, error?: unknown, metadata?: Record<string, unknown>): void {
    const errorMetadata: Record<string, unknown> = {
      ...(metadata || {}),
    };

    if (error instanceof Error) {
      errorMetadata.stack = error.stack;
      errorMetadata.errorName = error.name;
    }

    this.log('ERROR', message, errorMetadata);
  }

  private log(level: LogLevel, message: string, metadata?: Record<string, unknown>): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      service: this.serviceName,
      message,
      correlationId: this.correlationId,
      metadata,
      stack: metadata?.stack as string | undefined,
    };

    // Console output (can be extended to file, external service, etc.)
    const logOutput = this.formatLogEntry(entry);

    switch (level) {
      case 'DEBUG':
        console.debug(logOutput);
        break;
      case 'INFO':
        console.info(logOutput);
        break;
      case 'WARN':
        console.warn(logOutput);
        break;
      case 'ERROR':
        console.error(logOutput);
        break;
    }
  }

  private formatLogEntry(entry: LogEntry): string {
    const metaStr = entry.metadata ? ` | ${JSON.stringify(entry.metadata)}` : '';
    const corrId = entry.correlationId ? ` [${entry.correlationId}]` : '';
    return `[${entry.timestamp}] ${entry.level} ${entry.service}${corrId}: ${entry.message}${metaStr}`;
  }
}

export function createLogger(serviceName: string, correlationId?: string): Logger {
  return new Logger(serviceName, correlationId);
}

export { Logger };
