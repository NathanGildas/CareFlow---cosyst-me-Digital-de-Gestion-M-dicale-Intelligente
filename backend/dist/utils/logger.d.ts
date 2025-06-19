export declare class Logger {
    static info(message: string, ...args: any[]): void;
    static error(message: string, ...args: any[]): void;
    static warn(message: string, ...args: any[]): void;
    static success(message: string, ...args: any[]): void;
    static debug(message: string, obj?: any): void;
}
export declare const logger: typeof Logger;
