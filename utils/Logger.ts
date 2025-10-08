import * as fs from 'fs';
import * as path from 'path';

export enum LogLevel {
  INFO = 'INFO',
  ERROR = 'ERROR',
  WARNING = 'WARNING',
  SUCCESS = 'SUCCESS',
  DEBUG = 'DEBUG'
}

export class Logger {
  private logs: string[] = [];
  private testName: string;
  private logFile: string;

  constructor(testName: string) {
    this.testName = testName;
    const logsDir = path.join(__dirname, '../reports/logs');
    
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
    this.logFile = path.join(logsDir, `${testName.replace(/\s+/g, '_')}_${timestamp}.log`);
  }

  /**
   * Log info message
   */
  info(message: string): void {
    this.log(LogLevel.INFO, message);
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error): void {
    const errorMessage = error 
      ? `${message} - ${error.message}\n${error.stack}` 
      : message;
    this.log(LogLevel.ERROR, errorMessage);
  }

  /**
   * Log warning message
   */
  warning(message: string): void {
    this.log(LogLevel.WARNING, message);
  }

  /**
   * Log success message
   */
  success(message: string): void {
    this.log(LogLevel.SUCCESS, message);
  }

  /**
   * Log debug message
   */
  debug(message: string): void {
    this.log(LogLevel.DEBUG, message);
  }

  /**
   * Generic log method
   */
  private log(level: LogLevel, message: string): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] ${message}`;
    
    this.logs.push(logMessage);
    
    // Console output with colors
    const coloredMessage = this.colorize(level, logMessage);
    console.log(coloredMessage);
    
    // Write to file
    this.writeToFile(logMessage);
  }

  /**
   * Colorize console output
   */
  private colorize(level: LogLevel, message: string): string {
    const colors = {
      INFO: '\x1b[36m',      // Cyan
      ERROR: '\x1b[31m',     // Red
      WARNING: '\x1b[33m',   // Yellow
      SUCCESS: '\x1b[32m',   // Green
      DEBUG: '\x1b[90m',     // Gray
      RESET: '\x1b[0m'
    };

    return `${colors[level]}${message}${colors.RESET}`;
  }

  /**
   * Write log to file
   */
  private writeToFile(message: string): void {
    try {
      fs.appendFileSync(this.logFile, message + '\n', 'utf-8');
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  /**
   * Get all logs
   */
  getLogs(): string[] {
    return [...this.logs];
  }

  /**
   * Get logs by level
   */
  getLogsByLevel(level: LogLevel): string[] {
    return this.logs.filter(log => log.includes(`[${level}]`));
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Get log file path
   */
  getLogFilePath(): string {
    return this.logFile;
  }

  /**
   * Save logs to custom file
   */
  saveToFile(filepath: string): void {
    try {
      const content = this.logs.join('\n');
      fs.writeFileSync(filepath, content, 'utf-8');
      console.log(`📝 Logs saved to: ${filepath}`);
    } catch (error) {
      console.error('Failed to save logs:', error);
    }
  }
}
