"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
// Object.defineProperty(exports, "__esModule", { value: true });
// exports.writeSettings = exports.readSettings = exports.isAvailable = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const SETTINGS_FILENAME = 'Settings.json';
function getAntiCheatDirectory(gameDirectory) {
    return `${gameDirectory}\\EasyAntiCheat`;
}
export function isAvailable(gameDirectory) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield promises_1.default.access(getAntiCheatDirectory(gameDirectory));
            return true;
        }
        catch (e) {
            return false;
        }
    });
}
// exports.isAvailable = isAvailable;
export function readSettings(gameDirectory) {
    return __awaiter(this, void 0, void 0, function* () {
        const content = yield promises_1.default.readFile(`${getAntiCheatDirectory(gameDirectory)}\\${SETTINGS_FILENAME}`, {
            encoding: 'utf-8',
        });
        return JSON.parse(content);
    });
}
// exports.readSettings = readSettings;
export function writeSettings(gameDirectory, settings) {
    const filePath = `${getAntiCheatDirectory(gameDirectory)}\\${SETTINGS_FILENAME}`;
    const data = JSON.stringify(settings, null, 4);
    return promises_1.default.writeFile(filePath, data, { encoding: 'utf-8' });
}
// exports.writeSettings = writeSettings;
//# sourceMappingURL=eac-settings-utilities.js.map