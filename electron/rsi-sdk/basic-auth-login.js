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
Object.defineProperty(exports, "__esModule", { value: true });
exports.basicAuthLogin = void 0;
const electron_log_1 = __importDefault(require("electron-log"));
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const getCredentials = (host, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { directory, filename } = options;
    const filePath = path_1.default.join(directory, filename);
    try {
        const data = (yield promises_1.default.readFile(filePath)).toString();
        let credentials;
        try {
            credentials = JSON.parse(data);
        }
        catch (error) {
            throw new Error(`File ${filename} is not a valid JSON`);
        }
        if (!credentials || !credentials[host]) {
            throw new Error(`No credentials found for host ${host}`);
        }
        const { username, password } = credentials[host];
        if (!username || !password) {
            throw new Error('No credentials found.');
        }
        return { username, password };
    }
    catch (e) {
        throw new Error(`Not able to read filename ${filename} in ${directory}`);
    }
});
const basicAuthLogin = (options) => (event, webContents, request, authInfo, 
// eslint-disable-next-line no-unused-vars
callback) => {
    event.preventDefault();
    const { host } = authInfo;
    try {
        (() => __awaiter(void 0, void 0, void 0, function* () {
            const { username, password } = yield getCredentials(host, options);
            callback(username, password);
        }))();
    }
    catch (error) {
        electron_log_1.default.error(error);
    }
};
exports.basicAuthLogin = basicAuthLogin;
//# sourceMappingURL=basic-auth-login.js.map