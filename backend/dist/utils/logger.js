"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.Logger = void 0;
const util_1 = __importDefault(require("util"));
class Logger {
    static info(message, ...args) {
        console.log(`🔵 [INFO] ${new Date().toISOString()} - ${message}`, ...args);
    }
    static error(message, ...args) {
        console.error(`🔴 [ERROR] ${new Date().toISOString()} - ${message}`, ...args);
    }
    static warn(message, ...args) {
        console.warn(`🟡 [WARN] ${new Date().toISOString()} - ${message}`, ...args);
    }
    static success(message, ...args) {
        console.log(`🟢 [SUCCESS] ${new Date().toISOString()} - ${message}`, ...args);
    }
    static debug(message, obj) {
        if (process.env.NODE_ENV === "development") {
            console.log(`🔍 [DEBUG] ${new Date().toISOString()} - ${message}`);
            if (obj) {
                console.log(util_1.default.inspect(obj, { colors: true, depth: 3 }));
            }
        }
    }
}
exports.Logger = Logger;
exports.logger = Logger;
//# sourceMappingURL=logger.js.map