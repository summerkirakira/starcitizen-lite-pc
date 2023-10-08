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
exports.sendAnalytics = void 0;
const url_1 = require("url");
const app_shared_1 = require("@rsilauncher/app-shared");
const https_1 = __importDefault(require("https"));
const os_1 = __importDefault(require("os"));
const global_config_1 = require("./global-config");
const getWineVersion_1 = __importDefault(require("./utils/getWineVersion"));
let cigDataPatcher;
try {
    // eslint-disable-next-line global-require
    cigDataPatcher = require('cig-data-patcher');
}
catch (e) {
    cigDataPatcher = { patcherVersion: '<unavailable>' };
}
const { patcherVersion } = cigDataPatcher;
const { version: launcherVersion } = require('../package.json');
const sendAnalytics = (info, mainWindow) => __awaiter(void 0, void 0, void 0, function* () {
    const localHeapAccountId = yield (mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.webContents.executeJavaScript('localStorage.getItem("heapAccountId");', true));
    const localTrackingMetricsId = yield (mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.webContents.executeJavaScript('localStorage.getItem("trackingMetricsId");', true));
    return new Promise((resolve, reject) => {
        const { identity } = (0, global_config_1.getInstance)();
        const { name, data } = info;
        const wineVersion = (0, getWineVersion_1.default)();
        const accountName = (data === null || data === void 0 ? void 0 : data.AccountName) || (identity === null || identity === void 0 ? void 0 : identity.accountName);
        const heapAccountId = (data === null || data === void 0 ? void 0 : data.HeapAccountID) || (identity === null || identity === void 0 ? void 0 : identity.heapAccountId);
        const trackingMetricsId = (data === null || data === void 0 ? void 0 : data.TrackingMetricsID) || (identity === null || identity === void 0 ? void 0 : identity.trackingMetricsId);
        const payload = Object.assign(Object.assign({}, data), { Product: 'launcher', OperatingSystem: `Windows ${os_1.default.release()}`, LauncherVersion: (data === null || data === void 0 ? void 0 : data.LauncherVersion) || launcherVersion, PatcherVersion: (data === null || data === void 0 ? void 0 : data.PatcherVersion) || patcherVersion, AccountName: accountName || 'Unknown', HeapAccountID: heapAccountId || -1, TMId: trackingMetricsId || -1, Event: name, usingEmulator: !!wineVersion });
        if (wineVersion) {
            payload.emulatorSystem = wineVersion;
        }
        // @todo: aguimard - migrate this with electron-store in the revamp
        if (localHeapAccountId) {
            payload.HeapAccountID = Buffer.from(localHeapAccountId, 'base64').toString();
        }
        if (localTrackingMetricsId) {
            payload.TMId = Buffer.from(localTrackingMetricsId, 'base64').toString();
        }
        // remove old occurence
        delete payload.TrackingMetricsID;
        const { hostname, pathname } = new url_1.URL(app_shared_1.configuration.analyticsUrl);
        const content = Buffer.from(JSON.stringify(payload));
        const options = {
            hostname,
            path: pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': content.length,
            },
            rejectUnauthorized: false,
            timeout: 2000,
        };
        const r = https_1.default.request(options, (response) => {
            const result = [];
            response.on('data', (responseData) => result.push(responseData));
            response.on('end', () => resolve(result.join()));
        });
        r.on('error', (error) => reject(new Error(`Could not send analytics data: ${error.message}`)));
        r.on('timeout', () => r.destroy(new Error(`Request to send anylitics data timed out`)));
        r.write(content);
        r.end();
    });
});
exports.sendAnalytics = sendAnalytics;
//# sourceMappingURL=analytics.js.map