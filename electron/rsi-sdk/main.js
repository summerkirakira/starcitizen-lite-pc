"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const fs = __importStar(require("fs"));
const electron_1 = require("electron");
const fluture_1 = require("fluture");
const app_shared_1 = require("@rsilauncher/app-shared");
const MDFile_1 = require("node-multi-downloader/dist/MDFile");
const Remote_1 = require("node-multi-downloader/dist/Remote");
const url_1 = require("url");
const cpu_features_1 = __importDefault(require("@cig/cpu-features"));
const sudo_prompt_1 = require("sudo-prompt");
const promises_1 = __importDefault(require("fs/promises"));
const electron_log_1 = __importDefault(require("electron-log"));
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const util_1 = require("util");
const rimraf_1 = __importDefault(require("rimraf"));
const check_minimum_requirements_1 = __importDefault(require("./check-minimum-requirements"));
const check_vcredist_1 = __importDefault(require("./check-vcredist"));
const basic_auth_login_1 = require("./basic-auth-login");
const launcher_tray_1 = require("./launcher-tray");
const game_launcher_1 = require("./game-launcher");
const game_files_manager_1 = __importDefault(require("./game-files-manager"));
const logger_1 = require("./logger");
const rsi_window_1 = require("./rsi-window");
const globalConfig = __importStar(require("./global-config"));
const IEWS = __importStar(require("./install-eac-windows-service"));
const ESU = __importStar(require("./eac-settings-utilities"));
const analytics_1 = require("./analytics");
const auto_update_1 = __importDefault(require("./auto-update"));
electron_1.crashReporter.start({
    uploadToServer: false,
});
const execPromise = (0, util_1.promisify)(sudo_prompt_1.exec);
const cigDataPatcher = require('cig-data-patcher');
const { install, createEmptySparseFile, patcherVersion } = cigDataPatcher;
(0, app_shared_1.sentryInit)();
try {
    const USER_AGENT = `${electron_1.app.getName()}-${electron_1.app.getVersion()}`;
    const WINDOW_PADDING = 0;
    const WINDOW_DIMENSIONS = [1100, 545];
    const AUTO_UPDATER_CHECK_INTERVAL = 10 * 60 * 1000; // 10 minutes
    const debugMode = process.argv.find((arg) => arg === '--debug') && true;
    const pkg = fs.readFileSync(`${__dirname}/../package.json`, 'utf8');
    const { description, version: launcherVersion, configuration: pkgConfiguration } = JSON.parse(pkg);
    const cfg = {
        description,
        configuration: app_shared_1.configuration,
        launcherVersion,
        patcherVersion,
        cpuCapabilities: (0, cpu_features_1.default)(),
        osMetMinimumRequirements: (0, check_minimum_requirements_1.default)(os_1.default.release()),
        appPath: electron_1.app.getAppPath(),
        identity: null,
    };
    globalConfig.initializeInstance(cfg);
    const rsiEnvSchemes = Object.keys(app_shared_1.configuration.env).map((envName) => `rsi+${envName}`);
    const allRsiSchemes = ['rsi', ...rsiEnvSchemes];
    const customSchemes = allRsiSchemes.map((scheme) => ({
        scheme,
        privileges: { bypassCSP: true, supportFetchAPI: true, corsEnabled: true },
    }));
    electron_1.protocol.registerSchemesAsPrivileged([{ scheme: 'file' }, ...customSchemes]);
    (0, logger_1.setupLogger)({ level: debugMode ? 'debug' : 'info' });
    let { resourcesPath } = process;
    let runningInstaller;
    if (process.env.NODE_ENV === 'development') {
        resourcesPath = path_1.default.resolve(__dirname, '../');
    }
    const installerOptions = {};
    let mainWindow;
    let systemTray;
    let gameLauncher;
    let gameFilesManager;
    const handleDeepLink = (argv) => {
        const deeplinkingUrl = argv.find((arg) => arg.startsWith('rsilauncher://'));
        if (deeplinkingUrl) {
            systemTray.displayBalloon({
                title: `Deep link to ${deeplinkingUrl}`,
                content: deeplinkingUrl,
            });
        }
    };
    const focusWindow = (window) => {
        if (process.env.NODE_ENV === 'development') {
            return;
        }
        window.setAlwaysOnTop(true);
        window.focus();
        window.setAlwaysOnTop(false);
    };
    if (process.env.NODE_ENV === 'development') {
        const jsFileArg = process.argv.find((arg) => arg.endsWith('.js'));
        if (jsFileArg) {
            const jsFilePath = path_1.default.resolve(jsFileArg);
            electron_log_1.default.info(`Registering rsilauncher protocol handler with execPath ${process.execPath}
                and entry point ${jsFilePath}`);
            electron_1.app.setAsDefaultProtocolClient('rsilauncher', process.execPath, [path_1.default.resolve(jsFilePath)]);
        }
        else {
            electron_log_1.default.error('Did not register as rsilauncher protocol handler ' +
                'because no path to a javascript file was found in the process arguments');
        }
    }
    const shouldQuit = !electron_1.app.requestSingleInstanceLock();
    electron_1.app.on('second-instance', (e, argv) => {
        handleDeepLink(argv);
        if (mainWindow) {
            if (!mainWindow.isVisible()) {
                mainWindow.show();
                mainWindow.webContents.send(app_shared_1.IpcEvents.UI_SHOW_SUCCESSFUL);
            }
            if (mainWindow.isMinimized()) {
                mainWindow.restore();
            }
            focusWindow(mainWindow);
        }
    });
    if (shouldQuit) {
        electron_1.app.quit();
    }
    const createWindow = () => {
        const [windowWidth, windowHeight] = WINDOW_DIMENSIONS;
        const config = {
            productName: 'RSI Launcher',
            companyName: 'Cloud Imperium Games',
            submitURL: app_shared_1.configuration.sentry.minidumpUrl,
            uploadToServer: true,
        };
        electron_1.crashReporter.start(config);
        mainWindow = new electron_1.BrowserWindow({
            title: description,
            width: windowWidth + WINDOW_PADDING * 2,
            height: windowHeight + WINDOW_PADDING * 2,
            show: false,
            resizable: false,
            frame: false,
            transparent: false,
            webPreferences: {
                devTools: process.env.NODE_ENV === 'development',
                preload: path_1.default.join(__dirname, '/preload.js'),
                experimentalFeatures: true,
                nodeIntegration: true,
                contextIsolation: false,
            },
        });
        // This is being executed with ts-dist as the working directory so we need to reefr
        // to the index file in the parent directory.
        // TODO: Find a better solution for this, maybe change the CWD of the electron process
        // to be the root of the project instead of ts-build
        const indexFilePath = electron_1.app.isPackaged
            ? `file://${path_1.default.resolve(__dirname, '../', 'app/index.html')}`
            : 'http://localhost:6001';
        mainWindow.loadURL(indexFilePath);
        mainWindow.once('ready-to-show', () => {
            if (mainWindow) {
                mainWindow.show();
                focusWindow(mainWindow);
            }
        });
        const filter = {
            urls: [
                '*://robertsspaceindustries.com/*',
                '*://*.robertsspaceindustries.com/*',
                '*://*.cloudimperiumgames.com/*',
                '*://cloudimperiumgames.com/*',
                '*://*.local.dev/*',
            ],
        };
        if (process.env.NODE_ENV === 'development') {
            filter.urls.push('*://*.turbulent.ca/*');
        }
        mainWindow.webContents.session.webRequest.onBeforeSendHeaders(filter, (details, callback) => {
            details.requestHeaders['User-Agent'] = USER_AGENT; // eslint-disable-line no-param-reassign
            delete details.requestHeaders.Cookie; // eslint-disable-line no-param-reassign
            callback({ cancel: false, requestHeaders: details.requestHeaders });
        });
        /* Prevent dropping items on the application from navigating. */
        mainWindow.webContents.on('will-navigate', (e) => {
            e.preventDefault();
        });
        mainWindow.on('closed', () => {
            mainWindow = null;
        });
        return mainWindow;
    };
    const createWindowForEnv = () => {
        if (process.env.NODE_ENV === 'development') {
            const { default: installExtension, REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS,
            // eslint-disable-next-line global-require
             } = require('electron-devtools-installer');
            const extensions = [REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS];
            const installExtensions = () => Promise.all(extensions.map((extensionName) => installExtension(extensionName)));
            return installExtensions()
                .catch((err) => electron_log_1.default.warn(`Could not install extension: ${err}`))
                .then(() => createWindow())
                .finally(() => mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.webContents.openDevTools({ mode: 'detach' }));
        }
        const window = createWindow();
        return Promise.resolve(window);
    };
    // protocol.registerSchemesAsPrivileged([  ]);
    const apiProtocolFactory = (scheme) => {
        const schemeLen = scheme.length;
        const envSeparatorIdx = scheme.indexOf('+');
        const envName = envSeparatorIdx >= 0 ? scheme.substr(scheme.indexOf('+') + 1) : pkgConfiguration.environment;
        // @ts-ignore
        const { apiUrl } = envName && app_shared_1.configuration.env[envName] ? app_shared_1.configuration.env[envName] : { apiUrl: '<not-set>' };
        const passwordRegexp = /("password")+(:)+(".+")/gm;
        // eslint-disable-next-line no-unused-vars
        return (request, callback) => {
            const resourcePath = request.url.slice(schemeLen + 3);
            const redirectPath = `${apiUrl}/${resourcePath}`;
            let uploadData;
            if (request.uploadData && request.uploadData.length > 0) {
                const payloadStr = request.uploadData[0].bytes.toString();
                uploadData = {
                    contentType: 'application/json',
                    data: payloadStr,
                };
            }
            // Hide all data containing password as key
            const logUploadData = Object.assign(Object.assign({}, uploadData), { data: uploadData === null || uploadData === void 0 ? void 0 : uploadData.data.replace(passwordRegexp, '"password":"<HIDDEN>"') });
            electron_log_1.default.debug({ request: redirectPath, payload: logUploadData });
            callback({
                method: request.method,
                referrer: request.referrer,
                url: redirectPath,
                uploadData,
            });
        };
    };
    electron_1.app.on('ready', () => __awaiter(void 0, void 0, void 0, function* () {
        handleDeepLink(process.argv);
        // Disable shortcut for devtools if we are not in dev
        electron_1.globalShortcut.register('Control+Shift+I', () => process.env.NODE_ENV === 'development');
        mainWindow = yield createWindowForEnv();
        systemTray = new launcher_tray_1.LauncherTray(electron_1.app, mainWindow, { description });
        const autoUpdater = (0, auto_update_1.default)(mainWindow, AUTO_UPDATER_CHECK_INTERVAL);
        autoUpdater.start();
        gameLauncher = new game_launcher_1.GameLauncher(mainWindow);
        (0, check_vcredist_1.default)();
        electron_1.ipcMain.on(app_shared_1.IpcEvents.LAUNCHER_LAUNCH, (event, data) => {
            var _a;
            gameFilesManager === null || gameFilesManager === void 0 ? void 0 : gameFilesManager.stopFileWatcher();
            const TMid = ((_a = globalConfig.getInstance().identity) === null || _a === void 0 ? void 0 : _a.trackingMetricsId) || -1;
            const payload = Object.assign(Object.assign({}, data), { TMid });
            gameLauncher.start(payload);
        });
        electron_1.ipcMain.on(app_shared_1.IpcEvents.LAUNCHER_IS_GAME_RUNNING, (event) => {
            // eslint-disable-next-line no-param-reassign
            event.returnValue = gameLauncher.isGameRunning;
        });
        electron_1.ipcMain.handle(app_shared_1.IpcEvents.LAUNCHER_KILL_GAME_PROCESS, (event, signal) => __awaiter(void 0, void 0, void 0, function* () {
            gameLauncher.kill(signal);
            gameFilesManager === null || gameFilesManager === void 0 ? void 0 : gameFilesManager.startFileWatcher();
            // Notify the client of the current state at start up
            const gameFilesState = yield gameFilesManager.getGameFilesState();
            mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.webContents.send(app_shared_1.IpcEvents.GAME_FILES_CHANGED, gameFilesState);
        }));
        electron_1.ipcMain.handle(app_shared_1.IpcEvents.LAUNCHER_GET_RELEASE_OBJECT, (event, params) => {
            return gameLauncher.getGameClientReleaseObject(params);
        });
        electron_1.ipcMain.handle(app_shared_1.IpcEvents.AUTOUPDATER_CHECK_NOW, () => autoUpdater.checkNow());
        electron_1.ipcMain.handle(app_shared_1.IpcEvents.GAME_FILES_INITIALIZE_WATCHER, (event, data) => __awaiter(void 0, void 0, void 0, function* () {
            const { libraryFolder, channelId, installDir } = data;
            const gamePath = path_1.default.resolve(libraryFolder, installDir, channelId);
            // If watcher already exists, update path instead of invoke a new watcher
            if (gameFilesManager) {
                gameFilesManager.setGamePath(libraryFolder, gamePath);
            }
            else {
                gameFilesManager = new game_files_manager_1.default(libraryFolder, gamePath);
                gameFilesManager.startFileWatcher();
            }
            gameFilesManager.on('game-files-changed', (filesState) => {
                mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.webContents.send(app_shared_1.IpcEvents.GAME_FILES_CHANGED, filesState);
            });
            // Notify the client of the current state at start up
            const gameFilesState = yield gameFilesManager.getGameFilesState();
            mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.webContents.send(app_shared_1.IpcEvents.GAME_FILES_CHANGED, gameFilesState);
        }));
        electron_1.ipcMain.handle(app_shared_1.IpcEvents.GAME_FILES_REMOVE_USER_FOLDER, (event, { deleteKeyBindings }) => __awaiter(void 0, void 0, void 0, function* () {
            yield gameFilesManager.deleteUserFolderForChannel(deleteKeyBindings);
            // Notify the client of the current state at start up
            const gameFilesState = yield gameFilesManager.getGameFilesState();
            mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.webContents.send(app_shared_1.IpcEvents.GAME_FILES_CHANGED, gameFilesState);
        }));
        electron_1.ipcMain.handle(app_shared_1.IpcEvents.GAME_FILES_REMOVE_SHADERS_FOLDER, () => __awaiter(void 0, void 0, void 0, function* () {
            yield gameFilesManager.deleteShadersFolderForChannel();
        }));
        electron_1.ipcMain.handle(app_shared_1.IpcEvents.GAME_FILES_CHECK_USER_FOLDER_EXISTS, () => __awaiter(void 0, void 0, void 0, function* () {
            return gameFilesManager.userFolderExists();
        }));
        electron_1.ipcMain.handle(app_shared_1.IpcEvents.GAME_FILES_CHECK_SHADERS_FOLDER_EXISTS, () => __awaiter(void 0, void 0, void 0, function* () {
            return gameFilesManager.shadersFolderExists();
        }));
        electron_1.ipcMain.handle(app_shared_1.IpcEvents.CHANGE_LIBRARY_FOLDER, (event, data) => {
            try {
                gameFilesManager === null || gameFilesManager === void 0 ? void 0 : gameFilesManager.setLibraryFolder(data.libraryFolder);
            }
            catch (e) {
                electron_log_1.default.error('An error occured while picking directory folder, ', e);
            }
        });
        electron_1.ipcMain.on(app_shared_1.IpcEvents.USER_SIGNIN, (event, data) => {
            const { accountName, heapAccountId, trackingMetricsId } = data;
            globalConfig.getInstance().identity = { accountName, heapAccountId, trackingMetricsId };
        });
        electron_1.ipcMain.on(app_shared_1.IpcEvents.USER_SIGNOUT, () => {
            globalConfig.getInstance().identity = null;
        });
    }));
    electron_1.app.whenReady().then(() => {
        allRsiSchemes.forEach((envScheme) => {
            const successfullyRegistered = electron_1.protocol.registerHttpProtocol(envScheme, apiProtocolFactory(envScheme));
            if (!successfullyRegistered) {
                electron_log_1.default.error(`Unable to register HTTP protocol handler for scheme "${envScheme}}"`);
            }
        });
    });
    electron_1.app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            electron_1.app.quit();
        }
    });
    electron_1.app.on('activate', () => {
        if (mainWindow === null) {
            createWindow();
        }
    });
    electron_1.ipcMain.on(app_shared_1.IpcEvents.OPEN_WINDOW, (event, data) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { url, options, cookies, targetOptions } = data;
            const { target, reload } = targetOptions || { reload: true };
            let isNewWindow = false;
            let window = (0, rsi_window_1.retrieveExistingWindowByTarget)(target);
            if (!window) {
                window = new rsi_window_1.RsiBrowserWindow(options);
                (0, rsi_window_1.saveExistingWindow)(target, window);
                isNewWindow = true;
            }
            // @ts-ignore
            yield window.setCookies(url, cookies);
            // await setCookies(window.webContents.session.cookies, cookies);
            if (isNewWindow || reload) {
                window.loadURL(url);
            }
            window.focus();
        }
        catch (error) {
            electron_log_1.default.error(error);
        }
    }));
    electron_1.app.on('login', (0, basic_auth_login_1.basicAuthLogin)({ directory: resourcesPath, filename: 'credentials.json' }));
    let percentProgress = 0;
    let isPaused = false;
    let statistics;
    const sampleTime = 1000;
    electron_1.ipcMain.on(app_shared_1.IpcEvents.INSTALLER_PAUSE, () => {
        if (isPaused) {
            return;
        }
        electron_log_1.default.info('Installer paused.');
        if (runningInstaller) {
            isPaused = true;
            mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.setProgressBar(percentProgress, { mode: 'paused' });
            if (runningInstaller.type === 'initial') {
                runningInstaller.execution();
            }
            else {
                runningInstaller.controls.pause();
            }
            mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.webContents.send('installer@pause-successful');
            gameFilesManager === null || gameFilesManager === void 0 ? void 0 : gameFilesManager.startFileWatcher();
        }
        else {
            mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.webContents.send('installer@pause-failed');
        }
    });
    electron_1.ipcMain.on(app_shared_1.IpcEvents.INSTALLER_RESUME, () => {
        if (!isPaused) {
            return;
        }
        electron_log_1.default.info('Installer resumed.');
        if (runningInstaller) {
            isPaused = false;
            mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.setProgressBar(percentProgress);
            if (runningInstaller.type === 'initial') {
                runningInstaller.execution = runningInstaller.task();
            }
            else {
                runningInstaller.controls.resume();
            }
            if (statistics) {
                statistics.lastPeriodTime = Date.now();
            }
            mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.webContents.send('installer@resume-successful');
            gameFilesManager === null || gameFilesManager === void 0 ? void 0 : gameFilesManager.startFileWatcher();
        }
        else {
            mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.webContents.send('installer@resume-failed');
        }
    });
    electron_1.ipcMain.on(app_shared_1.IpcEvents.INSTALLER_CANCEL, () => {
        electron_log_1.default.info('Installer cancelled.');
        if (runningInstaller) {
            isPaused = false;
            percentProgress = 0;
            if (runningInstaller.type === 'initial') {
                runningInstaller.execution();
            }
            else {
                runningInstaller.controls.pause();
            }
            mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.webContents.send('installer@cancel-successful');
            gameFilesManager === null || gameFilesManager === void 0 ? void 0 : gameFilesManager.startFileWatcher();
        }
        else {
            mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.webContents.send('installer@cancel-failed');
        }
    });
    electron_1.ipcMain.on(app_shared_1.IpcEvents.INSTALLER_SET_OPTIONS, (event, data) => {
        electron_log_1.default.info(`Installer Option: ${data.name} to ${data.value}`);
        installerOptions[data.name] = data.value;
        if (runningInstaller && !isPaused) {
            if (runningInstaller.type === 'initial') {
                if (data.value === 0) {
                    delete installerOptions[data.name];
                }
                runningInstaller.execution();
                setImmediate(() => {
                    if (runningInstaller) {
                        runningInstaller.execution = runningInstaller.task();
                    }
                });
            }
            else {
                runningInstaller.controls.setOption(data.name, data.value);
            }
        }
        mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.webContents.send('installer@set-option-successful', data);
    });
    /**
     * Attempts to create directories necessary for the game installation
     * @param  {...string} directories The directories to create
     * @throws {Error}
     */
    const createDirectories = (...directories) => __awaiter(void 0, void 0, void 0, function* () {
        const installerSupportExecutable = path_1.default.resolve(resourcesPath, 'installer-support.exe');
        const args = directories
            .filter((directory) => !fs.existsSync(directory))
            .map((directory) => `--create-installation-directory "${directory}"`);
        if (!args.length) {
            return false;
        }
        const cmd = `"${installerSupportExecutable}" ${args.join(' ')}`;
        try {
            yield execPromise(cmd);
            return true;
        }
        catch (error) {
            electron_log_1.default.error(`Error while attempting to create directories with command: ${cmd}, ${error}`);
            return false;
        }
    });
    /**
     * Attempts fixing the permissions for the game installation on a given directory
     * @param directory The directory of which to fix the permissions
     * @throws {Error}
     */
    const fixPermissions = (directory) => {
        const installerSupportExecutable = path_1.default.resolve(resourcesPath, 'installer-support.exe');
        const cmd = `"${installerSupportExecutable}" --fix-library-permissions "${directory}"`;
        return execPromise(cmd);
    };
    const initialDownload = (url, verificationFileURL, destinationDirectory, progressCallback) => {
        electron_log_1.default.info('Initial download start');
        const initialP4kName = 'Data.p4k.part';
        const destinationP4kPath = path_1.default.join(destinationDirectory, initialP4kName);
        const finalP4kPath = path_1.default.join(destinationDirectory, 'Data.p4k');
        const chunkSize = 20 * 1024 * 1024;
        const isNewDownload = !fs.existsSync(destinationP4kPath);
        const onProgress = (stream) => stream.on('data', (info) => {
            const newInfo = {
                downloaded: info.alreadyDownloaded + info.downloaded,
                total: info.total,
            };
            progressCallback('installer@initial-download-progress', newInfo);
        });
        const retrieveInitialDownloadVerificationFile = (verificationFileUrl) => {
            if (!verificationFileUrl) {
                return (0, fluture_1.resolve)(null);
            }
            return (0, fluture_1.race)((0, Remote_1.retrieveContent)(verificationFileUrl))((0, fluture_1.rejectAfter)(5000)(new Error('Could not retrieve the verification file within 5 seconds')))
                .pipe((0, fluture_1.chain)((stream) => (0, fluture_1.Future)((rej, res) => {
                let result = '';
                stream.on('data', (buffer) => {
                    result += buffer.toString();
                });
                stream.on('end', () => res(JSON.parse(result.trim())));
                stream.on('error', () => rej(Error(result)));
                // cancellation function
                return () => { };
            })))
                .pipe((0, fluture_1.chainRej)(() => (0, fluture_1.resolve)(null)));
        };
        const createInitialDownload = (initialDownloadUrl, hashUrl, destination) => {
            return (0, fluture_1.both)((0, Remote_1.retrieveContentLength)(initialDownloadUrl))(retrieveInitialDownloadVerificationFile(hashUrl)).pipe((0, fluture_1.chain)(([size, verificationHeader]) => {
                if (verificationHeader && verificationHeader !== null) {
                    electron_log_1.default.info(
                    // eslint-disable-next-line max-len
                    `Verification header found for initial download: Filename: ${verificationHeader.file.name} FileSize: ${verificationHeader.file.size}`);
                }
                else {
                    electron_log_1.default.info('Verification header not found for initial download');
                }
                const defaultConfig = { chunkSize, noResize: true, concurrentDownloads: 16 };
                const config = verificationHeader ? Object.assign({ verificationHeader }, defaultConfig) : defaultConfig;
                return createEmptySparseFile(destination, size)
                    .pipe((0, fluture_1.chainRej)((err) => {
                    if (fs.existsSync(destinationP4kPath)) {
                        fs.unlinkSync(destinationP4kPath);
                    }
                    return (0, fluture_1.reject)(err);
                }))
                    .pipe((0, fluture_1.chain)(() => (0, MDFile_1.create)(destination, initialDownloadUrl, config)));
            }));
        };
        progressCallback('installer@initial-download-start', {});
        const downloadOptions = 'maximumDownloadBandwidth' in installerOptions ? { rateLimit: installerOptions.maximumDownloadBandwidth } : {};
        if (!verificationFileURL) {
            return (0, fluture_1.resolve)(null);
        }
        const callDownload = isNewDownload
            ? createInitialDownload(url, verificationFileURL, destinationP4kPath)
            : (0, MDFile_1.open)(destinationP4kPath, { url });
        return (0, fluture_1.hook)(callDownload)(MDFile_1.close)((file) => (0, MDFile_1.download)(file, onProgress, downloadOptions))
            .pipe((0, fluture_1.chainRej)((error) => {
            if (error.name === 'InvalidMDFileHeader') {
                electron_log_1.default.info('Invalid MDFile Header, p4k is possibly complete but was not renamed properly');
                return (0, fluture_1.resolve)(null);
            }
            return (0, fluture_1.reject)(error);
        }))
            .pipe((0, fluture_1.chain)(() => (0, fluture_1.encaseP)(() => promises_1.default.rename(destinationP4kPath, finalP4kPath))(finalP4kPath)))
            .pipe((0, fluture_1.chain)(() => {
            electron_log_1.default.info('************************INITIAL DOWNLOAD DONE');
            progressCallback('installer@initial-download-end', {});
            return (0, fluture_1.resolve)(undefined);
        }));
    };
    const patchInstallation = (destinationDirectory, manifestInfo, objectStoreInfo, progressCallback) => {
        return install('install', destinationDirectory, { url: manifestInfo.url, suffix: `?${manifestInfo.signatures}` }, { url: objectStoreInfo.url, suffix: `?${objectStoreInfo.signatures}` }, Object.assign({ progressCallback }, installerOptions)).pipe((0, fluture_1.chain)((installer) => {
            electron_log_1.default.info('************************PATCHING DOWNLOAD START');
            const easyAntiCheatDirectory = `${destinationDirectory}/EasyAntiCheat`;
            // Delete easy anti cheat folder if it exist
            (0, rimraf_1.default)(easyAntiCheatDirectory, (error) => {
                if (error) {
                    electron_log_1.default.info('************************EAC DIRECTORY FAILED TO DELETE ', error);
                }
                else {
                    electron_log_1.default.info('************************EAC DIRECTORY SUCCESSFULLY DELETED');
                }
            });
            if (runningInstaller) {
                runningInstaller.controls = installer;
            }
            return installer.start();
        }));
    };
    const singleFilePhases = ['installer@initial-download-progress', 'installer@retrieve-remote-file-list-progress'];
    const downloadProgressCallback = (phase, info) => {
        if (isPaused) {
            return;
        }
        if (mainWindow && mainWindow.webContents) {
            if ([
                'installer@initial-download-start',
                'installer@update-files-inside-p4k-start',
                'installer@update-loose-files-start',
                'installer@retrieve-remote-file-list-start',
            ].includes(phase)) {
                mainWindow.setProgressBar(0.01);
            }
            if ([
                'installer@initial-download-progress',
                'installer@update-files-inside-p4k-progress',
                'installer@update-loose-files-progress',
                'installer@retrieve-remote-file-list-progress',
                'installer@update-p4k-structure-start',
                'installer@update-p4k-structure-end',
            ].includes(phase)) {
                const filesTotal = singleFilePhases.includes(phase) ? 1 : info.filesTotal;
                const valid = info.total > 0 && info.total < 100 * 1024 * 1024 * 1024 && filesTotal > 0;
                const downloaded = valid ? info.downloaded : 0;
                const total = valid ? info.total : 0;
                percentProgress = valid ? downloaded / total : 0;
                if (valid) {
                    const period = Date.now() - statistics.lastPeriodTime;
                    if (period >= sampleTime) {
                        const periodDownloaded = downloaded - statistics.lastPeriodSize;
                        statistics.lastPeriodTime = Date.now();
                        statistics.lastPeriodSize = downloaded;
                        statistics.lastSpeed = (periodDownloaded * 1000) / period;
                    }
                }
                if (phase === 'installer@retrieve-remote-file-list-progress' && info.total > 0) {
                    statistics.manifest.size = info.total;
                }
                if (phase === 'installer@update-loose-files-progress' && info.total > 0) {
                    statistics.looseFiles.size = info.total;
                    statistics.looseFiles.files = info.filesTotal;
                }
                if (phase === 'installer@update-files-inside-p4k-progress' && info.total > 0) {
                    statistics.objectFiles.size = info.total;
                    statistics.objectFiles.files = info.filesTotal;
                }
                if (valid) {
                    mainWindow.setProgressBar(percentProgress);
                }
                else if (phase === 'installer@initial-download-progress') {
                    mainWindow.setProgressBar(info.downloaded / info.total);
                }
                if ([
                    'installer@initial-download-end',
                    'installer@update-files-inside-p4k-end',
                    'installer@update-loose-files-end',
                    'installer@retrieve-remote-file-list-end',
                ].includes(phase)) {
                    mainWindow.setProgressBar(-1);
                }
                mainWindow.webContents.send('installer@install-progress', {
                    phase,
                    info: Object.assign(Object.assign({}, info), { speed: statistics.lastSpeed }),
                });
            }
        }
    };
    electron_1.ipcMain.on(app_shared_1.IpcEvents.GET_GLOBAL, (ev) => {
        // Return synchronously by setting returnValue
        // eslint-disable-next-line no-param-reassign
        ev.returnValue = globalConfig.getInstance();
    });
    electron_1.ipcMain.on(app_shared_1.IpcEvents.INSTALLER_INSTALL, (event, data) => __awaiter(void 0, void 0, void 0, function* () {
        const { libraryFolder, installDir, gameId, channelId, verify, gameName, versionLabel, forcePatcher } = data;
        const rootInstallationPath = path_1.default.resolve(libraryFolder);
        const gameDirectory = path_1.default.resolve(rootInstallationPath, installDir);
        const channelDirectory = path_1.default.join(gameDirectory, channelId);
        const baseP4kUrl = data.p4kBase ? new url_1.URL(`${data.p4kBase.url}?${data.p4kBase.signatures}`) : null;
        const baseP4kVerificationFileUrl = data.p4kBaseVerificationFile
            ? new url_1.URL(`${data.p4kBaseVerificationFile.url}?${data.p4kBaseVerificationFile.signatures}`)
            : null;
        if (runningInstaller) {
            electron_log_1.default.info('Installer already running, ignore second install request.');
            return;
        }
        gameFilesManager === null || gameFilesManager === void 0 ? void 0 : gameFilesManager.stopFileWatcher();
        electron_log_1.default.info(`${verify ? 'Verifying' : 'Installing'} ${gameName} ${channelId} ${versionLabel} at ${gameDirectory}`);
        try {
            yield createDirectories(gameDirectory, channelDirectory);
        }
        catch (e) {
            electron_log_1.default.error(`Error creating installation directories: ${gameDirectory}  ${channelDirectory} - ${e}`);
            mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.webContents.send(app_shared_1.IpcEvents.INSTALLER_INSTALL_FAILED, new Error('Could not create channel installation directory'));
            return;
        }
        if (verify) {
            electron_log_1.default.info(`Verifying permissions on ${gameDirectory}`);
            try {
                yield fixPermissions(gameDirectory);
            }
            catch (e) {
                electron_log_1.default.error(`Could not fix permissions on directory: ${gameDirectory}`);
                mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.webContents.send(app_shared_1.IpcEvents.INSTALLER_INSTALL_FAILED, new Error('Could not fix permissions'));
                return;
            }
        }
        if (forcePatcher) {
            electron_log_1.default.debug('FORCING PATCHER DOWNLOAD');
        }
        const isInitialDownload = !forcePatcher && !!baseP4kUrl && !fs.existsSync(`${channelDirectory}/Data.p4k`);
        if (forcePatcher && fs.existsSync(`${channelDirectory}/Data.p4k.part`)) {
            fs.unlinkSync(`${channelDirectory}/Data.p4k.part`);
        }
        if (isInitialDownload) {
            electron_log_1.default.info(`Starting download of base pack (${gameId} ${channelId} ${versionLabel}) in ${gameDirectory}`);
        }
        else {
            electron_log_1.default.info(`Starting delta update (${gameId} (${channelId} ${versionLabel}) in ${gameDirectory}`);
        }
        statistics = {
            gameId,
            channelId,
            isInitialDownload,
            startTime: Date.now(),
            endTime: null,
            lastPeriodTime: Date.now(),
            lastPeriodSize: 0,
            lastSpeed: 0,
            manifest: { size: null },
            looseFiles: { files: null, size: null },
            objectFiles: { files: null, size: null },
        };
        const installerTask = () => (isInitialDownload
            ? initialDownload(baseP4kUrl, baseP4kVerificationFileUrl, channelDirectory, downloadProgressCallback)
            : patchInstallation(channelDirectory, data.manifest, data.objects, downloadProgressCallback))
            .pipe((0, fluture_1.chain)(() => {
            return (0, fluture_1.attemptP)(() => ESU.isAvailable(channelDirectory).then((available) => {
                if (!available) {
                    electron_log_1.default.info(`Anti Cheat files not available`);
                    return Promise.resolve();
                }
                return ESU.readSettings(channelDirectory).then((settings) => {
                    return IEWS.installWindowsService({
                        gameDirectory: channelDirectory,
                        gameName,
                        environment: channelId,
                        force: verify,
                        productId: settings.productid,
                    });
                });
            }));
        }))
            .pipe((0, fluture_1.fork)((error) => {
            mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.setProgressBar(-1);
            electron_log_1.default.info(`Error installing at ${channelDirectory}: ${error}`);
            runningInstaller = null;
            mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.webContents.send('installer@install-failed', {
                error: { name: 'InstallerError', message: error.message },
            });
        })(() => {
            mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.setProgressBar(-1);
            if (isInitialDownload) {
                electron_log_1.default.info(`Initial pack installed (${gameId} ${channelId} ${versionLabel}) in ${channelDirectory}`);
            }
            else {
                electron_log_1.default.info(`Delta update applied (${gameId} ${channelId} ${versionLabel}) in ${channelDirectory}`);
            }
            runningInstaller = null;
            if (statistics.manifest.size === null) {
                statistics.manifest.size = 0;
            }
            if (statistics.looseFiles.size === null) {
                statistics.looseFiles.size = 0;
                statistics.looseFiles.files = 0;
            }
            if (statistics.objectFiles.size === null) {
                statistics.objectFiles.size = 0;
                statistics.objectFiles.files = 0;
            }
            statistics.endTime = Date.now();
            mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.webContents.send('installer@install-successful', statistics);
        }));
        try {
            // @ts-ignore
            runningInstaller = {
                type: isInitialDownload ? 'initial' : 'patch',
                task: installerTask,
                execution: installerTask(),
            };
        }
        catch (e) {
            electron_log_1.default.error('Installer error: ', e);
        }
    }));
    // eslint-disable-next-line consistent-return
    electron_1.ipcMain.handle(app_shared_1.IpcEvents.SHOW_OPEN_DIALOG, (event, data) => {
        if (mainWindow) {
            return electron_1.dialog.showOpenDialog(mainWindow, data);
        }
    });
    electron_1.ipcMain.on(app_shared_1.IpcEvents.INSTALLER_FIX_PERMISSIONS, (event, data) => {
        const { libraryFolder, installDir, channelId } = data;
        const rootInstallationPath = path_1.default.resolve(libraryFolder);
        const installationPath = path_1.default.resolve(rootInstallationPath, path_1.default.join(installDir, channelId));
        if (fs.existsSync(installationPath)) {
            try {
                fixPermissions(installationPath);
                mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.webContents.send(app_shared_1.IpcEvents.INSTALLER_FIX_PERMISSIONS_SUCCESSFUL);
            }
            catch (e) {
                electron_log_1.default.error(`Error fixing game directory permissions: ${e}`);
                mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.webContents.send(app_shared_1.IpcEvents.INSTALLER_FIX_PERMISSIONS_FAILED, new Error('Could not fix permissions of game directory.'));
            }
        }
    });
    electron_1.ipcMain.on(app_shared_1.IpcEvents.TRAY_REFRESH_MENU, (event, data) => {
        systemTray.refreshMenu(data);
    });
    electron_1.ipcMain.on(app_shared_1.IpcEvents.TRAY_UPDATE_VISIBILITIES, (event, data) => {
        systemTray.updateVisibilities(data);
    });
    electron_1.ipcMain.on(app_shared_1.IpcEvents.WINDOW_MINIMIZE, () => {
        mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.minimize();
    });
    electron_1.ipcMain.on(app_shared_1.IpcEvents.WINDOW_RESTORE, () => {
        if (!(mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.isVisible())) {
            mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.show();
        }
        if (mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.isMinimized()) {
            mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.restore();
        }
        mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.setAlwaysOnTop(true);
        mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.focus();
        mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.setAlwaysOnTop(false);
    });
    electron_1.ipcMain.on(app_shared_1.IpcEvents.UI_HIDE, () => {
        mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.hide();
        mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.webContents.send(app_shared_1.IpcEvents.UI_HIDE_SUCCESSFUL);
    });
    electron_1.ipcMain.on(app_shared_1.IpcEvents.UI_SHOW, () => {
        mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.show();
        mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.webContents.send(app_shared_1.IpcEvents.UI_SHOW_SUCCESSFUL);
    });
    electron_1.ipcMain.on(app_shared_1.IpcEvents.UI_QUIT, () => {
        if (gameLauncher && gameLauncher.isGameRunning) {
            gameLauncher.kill('SIGTERM');
        }
        if (mainWindow && mainWindow.webContents) {
            mainWindow.webContents.send(app_shared_1.IpcEvents.UI_QUIT_SUCCESSFUL);
            mainWindow.hide();
        }
        systemTray.quit();
    });
    electron_1.app.on('will-quit', () => {
        if (gameLauncher) {
            gameLauncher.removeAllLoginData();
        }
    });
    electron_1.ipcMain.on(app_shared_1.IpcEvents.NATIVE_NOTIFICATION_SHOW, (event, { title, content }) => {
        if (!(mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.isFocused()) && !systemTray.isDestroyed()) {
            systemTray.displayBalloon({ title, content });
        }
    });
    electron_1.ipcMain.on(app_shared_1.IpcEvents.LOGGER_LOG_EVENT, (event, { name, data }) => {
        (0, logger_1.logEvent)(name, data);
    });
    electron_1.ipcMain.on(app_shared_1.IpcEvents.ANALYTICS_SEND_EVENT, (event, { name, data }) => {
        (0, analytics_1.sendAnalytics)({ name, data }, mainWindow)
            .then(() => {
            if (mainWindow && mainWindow.webContents) {
                mainWindow.webContents.send(app_shared_1.IpcEvents.ANALYTICS_SEND_EVENT_SUCCESSFUL);
            }
        })
            .catch((error) => {
            if (mainWindow && mainWindow.webContents) {
                mainWindow.webContents.send(app_shared_1.IpcEvents.ANALYTICS_SEND_EVENT_FAILED, {
                    name: error.name,
                    message: error.message,
                });
            }
        });
    });
}
catch (error) {
    electron_log_1.default.error(error);
}
//# sourceMappingURL=main.js.map