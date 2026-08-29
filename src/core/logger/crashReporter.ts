import { logger } from './index';

export interface ErrorContext {
  screen?: string;
  userId?: string;
  action?: string;
  extra?: Record<string, any>;
}

export interface CrashReporterService {
  recordError: (error: Error | string, context?: ErrorContext) => void;
  setUser: (userId: string, metadata?: Record<string, string>) => void;
  logBreadcrumb: (message: string, category?: string) => void;
}

class PluggableCrashReporter implements CrashReporterService {
  recordError(error: Error | string, context?: ErrorContext): void {
    const errorMsg = error instanceof Error ? error.message : error;
    const errorStack = error instanceof Error ? error.stack : undefined;

    logger.error(
      'CrashReporter',
      `[Captured Crash/Exception]: ${errorMsg}`,
      context ? JSON.stringify(context) : '',
    );

    if (errorStack && __DEV__) {
      logger.error('CrashReporter', `[Stack]:\n${errorStack}`);
    }
  }

  setUser(userId: string, metadata?: Record<string, string>): void {
    logger.log('CrashReporter', `User identified: ${userId}`, metadata);
  }

  logBreadcrumb(message: string, category: string = 'ui'): void {
    logger.log('CrashReporter', `[Breadcrumb - ${category}]: ${message}`);
  }
}

export const crashReporter = new PluggableCrashReporter();
