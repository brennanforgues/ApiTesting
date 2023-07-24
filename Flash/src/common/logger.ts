import file from "k6/x/file";

export enum LogLevel {
  INFO,
  WARN,
  ERROR,
}

export interface LoggerOptions {
  logLevel?: LogLevel;
  fileName?: string;
  consoleOutput?: boolean;
}

class Logger {
  private logLevel: LogLevel;
  private fileName: string | undefined;
  private consoleOutputEnabled: boolean;

  constructor(options: LoggerOptions) {
    this.logLevel = options.logLevel ?? LogLevel.INFO;
    this.fileName = options.fileName;
    this.consoleOutputEnabled = options.consoleOutput ?? true;
  }

  info(...messages: any[]) {
    if (this.logLevel <= LogLevel.INFO) {
      this.log("INFO", ...messages);
    }
  }

  warn(...messages: any[]) {
    if (this.logLevel <= LogLevel.WARN) {
      this.log("WARN", ...messages);
    }
  }

  error(...messages: any[]) {
    if (this.logLevel <= LogLevel.ERROR) {
      this.log("ERROR", ...messages);
    }
  }

  private log(level: string, ...messages: any[]) {
    const formattedMessages = messages.map((message) => (typeof message === "object" ? JSON.stringify(message) : message));

    if (this.consoleOutputEnabled) {
      console.log(...formattedMessages);
    }

    if (this.fileName) {
      try {
        const timestamp = new Date().toString();
        const fileMessage = formattedMessages.map((message) => `${timestamp} [${level}]: ${message}`).join(" ");
        file.appendString(this.fileName, fileMessage + "\n");
      } catch (err) {
        console.error("Failed to write log to file: ", err);
      }
    }
  }
}

export default Logger;
