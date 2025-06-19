import util from "util";

export class Logger {
  static info(message: string, ...args: any[]) {
    console.log(`🔵 [INFO] ${new Date().toISOString()} - ${message}`, ...args);
  }

  static error(message: string, ...args: any[]) {
    console.error(
      `🔴 [ERROR] ${new Date().toISOString()} - ${message}`,
      ...args
    );
  }

  static warn(message: string, ...args: any[]) {
    console.warn(`🟡 [WARN] ${new Date().toISOString()} - ${message}`, ...args);
  }

  static success(message: string, ...args: any[]) {
    console.log(
      `🟢 [SUCCESS] ${new Date().toISOString()} - ${message}`,
      ...args
    );
  }

  static debug(message: string, obj?: any) {
    if (process.env.NODE_ENV === "development") {
      console.log(`🔍 [DEBUG] ${new Date().toISOString()} - ${message}`);
      if (obj) {
        console.log(util.inspect(obj, { colors: true, depth: 3 }));
      }
    }
  }
}

export const logger = Logger;
