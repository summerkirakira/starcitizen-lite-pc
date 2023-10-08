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
// @ts-check
const electron_1 = require("electron");
const electron_log_1 = __importDefault(require("electron-log"));
const electron_updater_1 = require("electron-updater");
// eslint-disable-next-line no-promise-executor-return
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
exports.default = (window, checkInterval = 15 * 60 * 1000) => {
    let updateInProgress = false;
    electron_updater_1.autoUpdater.on('error', (err) => {
        electron_log_1.default.error('Error occured auto-updating', err);
        window.setProgressBar(-1);
        window.webContents.send('error', err);
    });
    electron_updater_1.autoUpdater.on('checking-for-update', () => window.webContents.send('checking-for-update'));
    electron_updater_1.autoUpdater.on('update-available', (updateInfo) => {
        const { version } = updateInfo;
        electron_log_1.default.info(`Launcher update available (${version})`);
        updateInProgress = true;
        window.setProgressBar(0.01);
        window.webContents.send('update-available', updateInfo);
    });
    electron_updater_1.autoUpdater.on('update-not-available', () => window.webContents.send('update-not-available'));
    electron_updater_1.autoUpdater.on('download-progress', (progressInfo) => {
        const percentProgress = progressInfo.percent > 0 ? progressInfo.percent / 100 : 0.01;
        window.setProgressBar(percentProgress);
        window.webContents.send('download-progress', progressInfo);
    });
    electron_updater_1.autoUpdater.on('update-downloaded', (updateInfo) => {
        const { version } = updateInfo;
        electron_log_1.default.info(`Launcher update downloaded (${version})`);
        window.setProgressBar(-1);
        window.webContents.send('update-downloaded', updateInfo);
    });
    electron_1.ipcMain.on('auto-updater@update-restart', () => {
        electron_log_1.default.info('Quitting and installing latest launcher update');
        electron_updater_1.autoUpdater.quitAndInstall(false, true);
    });
    function checkForUpdateLoop() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                electron_updater_1.autoUpdater.checkForUpdates();
                if (!updateInProgress) {
                    yield delay(checkInterval);
                    checkForUpdateLoop();
                }
            }
            catch (e) {
                electron_log_1.default.info('Error while checking for latest launcher update: ', e);
                yield delay(checkInterval);
                checkForUpdateLoop();
            }
        });
    }
    return {
        start: () => delay(1000)
            .then(checkForUpdateLoop)
            .catch((e) => electron_log_1.default.error(e)),
        checkNow: () => electron_updater_1.autoUpdater.checkForUpdates(),
    };
};
//# sourceMappingURL=auto-update.js.map