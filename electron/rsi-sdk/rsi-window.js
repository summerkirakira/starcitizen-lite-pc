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
exports.saveExistingWindow = exports.retrieveExistingWindowByTarget = exports.RsiBrowserWindow = void 0;
const path_1 = __importDefault(require("path"));
const open_1 = __importDefault(require("open"));
const glob_to_regexp_1 = __importDefault(require("glob-to-regexp"));
const url_1 = require("url");
const electron_1 = require("electron");
const electron_util_1 = require("./electron-util");
const URL_FILTERS = [
    'htt*://robertsspaceindustries.com?(/)*',
    'htt*://*.robertsspaceindustries.com?(/)*',
    'htt*://*.cloudimperiumgames.com?(/)*',
    'htt*://cloudimperiumgames.com?(/)*',
    'htt*://*.local.dev/?(/)*',
];
const shouldNavigateToURL = (url) => {
    const allowed = URL_FILTERS.reduce((acc, glob) => {
        const reg = new RegExp((0, glob_to_regexp_1.default)(glob), 'i');
        return acc || reg.test(url);
    }, false);
    return allowed;
};
const isSafeToOpenURL = (url) => {
    const parsed = new url_1.URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
};
class RsiBrowserWindow extends electron_1.BrowserWindow {
    constructor(options) {
        const windowOptions = Object.assign({}, options);
        Object.assign(windowOptions.webPreferences || {}, {
            devTools: process.env.NODE_ENV === 'development',
            nodeIntegration: false,
        });
        if (windowOptions.icon && typeof windowOptions.icon === 'string') {
            if (require.main && require.main.filename) {
                const root = path_1.default.dirname(require.main.filename);
                windowOptions.icon = path_1.default.join(root, windowOptions.icon);
            }
        }
        super(windowOptions);
        this.webContents.setWindowOpenHandler((details) => {
            if (isSafeToOpenURL(details.url)) {
                (0, open_1.default)(details.url);
            }
            return { action: 'deny' }; // equivalent to preventDefault()
        });
        this.webContents.on('will-navigate', (ev, newUrl) => {
            if (!shouldNavigateToURL(newUrl) && isSafeToOpenURL(newUrl)) {
                ev.preventDefault();
                (0, open_1.default)(newUrl);
            }
        });
        this.once('ready-to-show', () => {
            this.show();
        });
        if (process.env.NODE_ENV === 'development') {
            this.webContents.openDevTools();
        }
    }
    setCookies(url, cookies) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!cookies) {
                return false;
            }
            const urlParsed = new url_1.URL(url);
            const baseUrl = `${urlParsed.protocol}//${urlParsed.hostname}`;
            const decorateCookie = (cookie) => ({
                url: baseUrl,
                name: cookie.name,
                value: cookie.value,
                domain: urlParsed.hostname,
                path: '/',
            });
            const sessionCookies = this.webContents.session.cookies;
            // Existing cookies are removed because we may have duplicates between environments.
            const existingCookies = (yield Promise.all(cookies.map((cookie) => sessionCookies.get({ name: cookie.name })))).flat();
            if (existingCookies.length > 0) {
                yield Promise.all(existingCookies.map((existingCookie) => (0, electron_util_1.removeCookie)(sessionCookies, baseUrl, existingCookie.name)));
            }
            yield (0, electron_util_1.setCookies)(sessionCookies, cookies.map((cookie) => decorateCookie(cookie)));
            return true;
        });
    }
}
exports.RsiBrowserWindow = RsiBrowserWindow;
const targetToWindowId = {};
const retrieveExistingWindowByTarget = (target) => {
    if (!targetToWindowId[target]) {
        return null;
    }
    const window = electron_1.BrowserWindow.fromId(targetToWindowId[target]);
    if (!window) {
        delete targetToWindowId[target];
    }
    return window;
};
exports.retrieveExistingWindowByTarget = retrieveExistingWindowByTarget;
const saveExistingWindow = (target, window) => {
    if (target) {
        targetToWindowId[target] = window.id;
    }
};
exports.saveExistingWindow = saveExistingWindow;
//# sourceMappingURL=rsi-window.js.map