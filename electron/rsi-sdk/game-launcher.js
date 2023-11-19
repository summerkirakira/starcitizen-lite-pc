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
// exports.GameLauncher = void 0;
const child_process_1 = require("child_process");
const electron_log_1 = __importDefault(require("electron-log"));
const promises_1 = require("fs/promises");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const util_1 = require("util");
// const app_shared_1 = require("@rsilauncher/app-shared");
console.log(__filename);
import { 
    isAvailable, readSettings, writeSettings
} from "./eac-settings-utilities";
const eac_settings_utilities_1 = {
    isAvailable,
    readSettings,
    writeSettings,
}
import { GameFilesManager } from "./game-files-manager";
// const game_files_manager_1 = __importDefault(require("./game-files-manager"));
// const { LAUNCHER_LAUNCH_FAILED, LAUNCHER_LAUNCH_STOPPED, LAUNCHER_LAUNCH_SUCCESSFUL } = app_shared_1.IpcEvents;
const execFilePromise = (0, util_1.promisify)(child_process_1.execFile);
/**
 * Checks that a given path exists
 * @param p The path to check
 * @returns Whether the path exists
 * @throws {Error} if an error occurs while performing the check
 */
const pathExists = (p) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, promises_1.stat)(p);
        return Promise.resolve(true);
    }
    catch (e) {
        if (e instanceof Error) {
            if (e.code === 'ENOENT') {
                // The path explicitely does not exist
                return Promise.resolve(false);
            }
        }
        // Another error occured
        throw e;
    }
});
// Default args options passed to Star Citizen client
const DEFAULT_ARGS = ['-no_login_dialog'];
const writePayloadFile = (file, fileData) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, promises_1.stat)(path_1.default.dirname(file));
    yield (0, promises_1.writeFile)(file, JSON.stringify(fileData));
});
const findLaunchExecutable = (files) => __awaiter(void 0, void 0, void 0, function* () {
    const existingFiles = yield Promise.all(files.map(pathExists));
    // eslint-disable-next-line no-restricted-syntax
    for (const [idx, exists] of existingFiles.entries()) {
        if (exists) {
            return files[idx];
        }
    }
    throw new Error('Could not find game launch executable');
});


export class GameLauncher {
    constructor() {
        // this.mainWindow = mainWindow;
        this.isGameRunning = false;
        this.defaultRunArgs = DEFAULT_ARGS;
        this.removeLoginDataTimeout = {};
        this.removeLoginData = {};
        this.gameProcess = null;
    }
    // eslint-disable-next-line class-methods-use-this
    getGameClientReleaseObject(key) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const rootInstallDirectory = path_1.default.resolve(key.libraryFolder);
                const filePath = path_1.default.resolve(rootInstallDirectory, key.installDir, key.channelId, 'f_win_game_client_release.id');
                const file = yield (0, promises_1.readFile)(filePath, 'utf8');
                return JSON.parse(file);
            }
            catch (error) {
                electron_log_1.default.error(`[Error] getGameClientReleaseObject - ${JSON.stringify(error)}`);
                return error;
            }
        });
    }
    start(opts) {
        return __awaiter(this, void 0, void 0, function* () {
            const { libraryFolder, gameName, channelId, nickname, token, authToken, hostname, port, installDir, executable, launchOptions, servicesEndpoint, network, TMid, } = opts;
            const payload = Object.assign({ username: nickname, token, auth_token: authToken, star_network: {
                    services_endpoint: servicesEndpoint,
                    hostname,
                    port: Number(port),
                }, TMid }, network);
            if (this.isGameRunning) {
                return;
            }
            const rootInstallDirectory = path_1.default.resolve(libraryFolder);
            const gamePath = path_1.default.resolve(rootInstallDirectory, installDir);
            const channelPath = path_1.default.resolve(gamePath, channelId);
            // const gameFilesManager = new game_files_manager_1.default(libraryFolder, channelPath);
            const gameFilesManager = new GameFilesManager(libraryFolder, channelPath);
            electron_log_1.default.info(`Launching ${gameName} ${channelId} from (${channelPath})`);
            const execPath = path_1.default.resolve(channelPath, executable);
            const executables = [execPath];
            const runArgs = launchOptions ? [...this.defaultRunArgs, ...launchOptions.split(' ')] : [...this.defaultRunArgs];
            const payloadFile = path_1.default.join(channelPath, 'loginData.json');
            this.removeLoginData[channelId] = () => {
                if (this.removeLoginDataTimeout[channelId]) {
                    electron_log_1.default.info(`Clearing login data removal timeout for ${channelId}`);
                    clearTimeout(this.removeLoginDataTimeout[channelId]);
                }
                if ((0, fs_1.existsSync)(payloadFile)) {
                    electron_log_1.default.info(`Deleting ${payloadFile} for ${channelId}`);
                    (0, fs_1.unlinkSync)(payloadFile);
                }
            };
            const launcherFile = path_1.default.join(channelPath, 'launcherData.json');
            const launcherData = {
                launcher_version: '1.0.0',
            };
            const runOptions = {
                timeout: 0,
                maxBuffer: 200 * 1024,
                killSignal: 'SIGTERM',
                cwd: channelPath,
                env: undefined,
            };
            const launchStatistics = {
                startTime: null,
                endTime: null,
            };
            try {
                this.removeLoginData[channelId]();
                yield writePayloadFile(launcherFile, launcherData);
                yield writePayloadFile(payloadFile, payload);
                const runFile = yield findLaunchExecutable(executables);
                launchStatistics.startTime = Date.now();
                // this.mainWindow.webContents.send(LAUNCHER_LAUNCH_SUCCESSFUL, Object.assign(opts, { runFile }));
                this.isGameRunning = true;
                if (yield (0, eac_settings_utilities_1.isAvailable)(channelPath)) {
                    const settingsFile = yield (0, eac_settings_utilities_1.readSettings)(channelPath);
                    yield (0, eac_settings_utilities_1.writeSettings)(channelPath, Object.assign(Object.assign({}, settingsFile), { parameters: runArgs.join(' ') }));
                }
                const execPromise = execFilePromise(runFile, runArgs, runOptions);
                this.gameProcess = execPromise.child;
                yield execPromise;
                launchStatistics.endTime = Date.now();
                // this.mainWindow.webContents.send(LAUNCHER_LAUNCH_STOPPED, Object.assign(opts, { statistics: launchStatistics }));
            }
            catch (error) {
                if (error instanceof Error) {
                    const { code, message } = error;
                    electron_log_1.default.error(`${gameName} process exited abnormally (code: ${code || -1}) : ${message}`);
                    debugger
                    window.ipcRenderer.send('start-game-error', {
                        name: `${gameName} process exited abnormally`,
                        code,
                        message,
                    });
                    // if (this.mainWindow.webContents) {
                    //     this.mainWindow.webContents.send(LAUNCHER_LAUNCH_FAILED, {
                    //         name: `${gameName} process exited abnormally`,
                    //         code,
                    //         message,
                    //     });
                    // }
                }
                else {
                    electron_log_1.default.error('Unknown error occurred while running game process', error);
                }
            }
            finally {
                // Notify the client of the current state at start up
                const gameFilesState = yield gameFilesManager.getGameFilesState();
                // this.mainWindow.webContents.send(app_shared_1.IpcEvents.GAME_FILES_CHANGED, gameFilesState);
                this.isGameRunning = false;
                // electron_log_1.default.info(`Setting timeout to delete login data for ${channelId} (${app_shared_1.configuration.loginDataRemovalTimeout / 1000} seconds)`);
                // this.removeLoginDataTimeout[channelId] = setTimeout(() => {
                //     if (this.removeLoginData[channelId]) {
                //         this.removeLoginData[channelId]();
                //         delete this.removeLoginData[channelId];
                //     }
                // }, app_shared_1.configuration.loginDataRemovalTimeout);
            }
        });
    }
    kill(signal = 'SIGTERM') {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isGameRunning && this.gameProcess) {
                electron_log_1.default.info(`Killing game process with pid ${this.gameProcess.pid}`);
                this.gameProcess.kill(signal);
            }
        });
    }
    removeAllLoginData() {
        electron_log_1.default.info(`Removing all remaining login data`);
        Object.values(this.removeLoginData).forEach((fn) => fn());
    }
}
// exports.GameLauncher = GameLauncher;
//# sourceMappingURL=game-launcher.js.map