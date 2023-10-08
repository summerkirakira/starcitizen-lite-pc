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
const fs_1 = require("fs");
const events_1 = require("events");
const os_1 = __importDefault(require("os"));
const throttle_debounce_1 = require("throttle-debounce");
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
/**
 * Allows to manage the files that are specific to the end user (the player) of a game
 * i.e. The directory that contains user credentials and settings and shader cache.
 *
 * This class emits events when the files for the game that is currently being watched change.
 * @example
 * ```
 *    gameFilesManager = new GameFilesManager(libraryFolder, gamePath);
 *    gameFilesManager.on('game-files-changed', (filesState) => {
 *       mainWindow?.webContents.send(IpcEvents.GAME_FILES_CHANGED, filesState);
 *    });
 * ```
 */
export class GameFilesManager extends events_1.EventEmitter {
    constructor(libraryFolder, gamePath) {
        super();
        this.libraryFolder = libraryFolder;
        this.gamePath = gamePath;
        this.fsWatcher = null;
        this.userFolderPath = GameFilesManager.getUserFolderPath(gamePath);
        this.shadersFolderPath = GameFilesManager.getShadersFolderPath(gamePath);
        this.keyBindingsPath = GameFilesManager.getKeyBindingsFolderPath(gamePath);
        this.setGamePath(libraryFolder, this.gamePath);
    }
    static getUserFolderPath(gamePath) {
        return path_1.default.join(gamePath, 'USER');
    }
    static getShadersFolderPath(gamePath) {
        return path_1.default.join(GameFilesManager.getUserFolderPath(gamePath), 'Client', '0', 'shaders');
    }
    static getKeyBindingsFolderPath(gamePath) {
        return path_1.default.join(GameFilesManager.getUserFolderPath(gamePath), 'Client', '0', 'Controls');
    }
    static checkDirectoryExists(directory) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield promises_1.default.access(directory);
                return true;
            }
            catch (e) {
                return false;
            }
        });
    }
    getGameFilesState() {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                userFolderExists: yield this.userFolderExists(),
                shadersFolderExists: yield this.shadersFolderExists(),
            };
        });
    }
    /**
     * Starts a file watcher on the library folder.
     * Will start emitting events when the game files for the specified game path change.
     * If a file watcher is already running, it is destroyed.
     * @param libraryFolder The absolute path to the library
     * @param gamePath The absolute path to the game i.e. `<library>/<channel>/<game>`
     */
    setGamePath(libraryFolder, gamePath) {
        if (this.fsWatcher) {
            this.stopFileWatcher();
        }
        this.libraryFolder = libraryFolder;
        this.gamePath = gamePath;
        this.userFolderPath = GameFilesManager.getUserFolderPath(gamePath);
        this.shadersFolderPath = GameFilesManager.getShadersFolderPath(gamePath);
        this.startFileWatcher();
        this.emitFilesChangedEvent();
    }
    /**
     * Changes the library folder while preserving the same relative `gamepath`
     * @param newLibraryFolder Path to the newly selected library folder
     */
    setLibraryFolder(newLibraryFolder) {
        const relGamePath = path_1.default.relative(this.libraryFolder, this.gamePath);
        const newGamePath = path_1.default.resolve(newLibraryFolder, relGamePath);
        this.setGamePath(newLibraryFolder, newGamePath);
    }
    /**
     * Starts a file watcher for the current game and channel,
     * in the current `libraryFolder`
     * @returns Whether the file watcher could be started
     */
    startFileWatcher() {
        if (this.fsWatcher) {
            this.stopFileWatcher();
        }
        try {
            const handler = (0, throttle_debounce_1.debounce)(500, this.emitFilesChangedEvent).bind(this);
            this.fsWatcher = (0, fs_1.watch)(this.libraryFolder, { recursive: true }, handler);
            return true;
        }
        catch (e) {
            return false;
        }
    }
    /**
     * Stops and destroys the current file watcher
     * vents will no longer be emitted if the game files change
     */
    stopFileWatcher() {
        var _a;
        (_a = this.fsWatcher) === null || _a === void 0 ? void 0 : _a.close();
        this.fsWatcher = null;
    }
    /**
     * Attempts to delete the folder that holds the cached shders
     * for the specified game and channel, in the current `libraryFolder`
     * @throws if the folder cannot be deleted
     */
    deleteUserFolderForChannel(deleteKeyBindings = false) {
        return __awaiter(this, void 0, void 0, function* () {
            if (deleteKeyBindings) {
                yield promises_1.default.rm(this.userFolderPath, { recursive: true });
                return;
            }
            if (!(yield GameFilesManager.checkDirectoryExists(this.keyBindingsPath)))
                yield promises_1.default.rm(this.userFolderPath, { recursive: true });
            const uuid = (0, uuid_1.v4)();
            const tempDirPath = path_1.default.join(os_1.default.tmpdir(), `${uuid}-tmp-RSI-Controls`);
            yield promises_1.default.rename(this.keyBindingsPath, tempDirPath);
            yield promises_1.default.rm(this.userFolderPath, { recursive: true });
            yield promises_1.default.mkdir(path_1.default.resolve(this.keyBindingsPath, '..'), { recursive: true });
            yield promises_1.default.rename(tempDirPath, this.keyBindingsPath);
        });
    }
    /**
     * Attempts to delete the folder that holds the cached shders
     * for the specified game and channel, in the current `libraryFolder`
     * @throws if the folder cannot be deleted
     */
    deleteShadersFolderForChannel() {
        return __awaiter(this, void 0, void 0, function* () {
            return promises_1.default.rm(this.shadersFolderPath, { recursive: true });
        });
    }
    /**
     * Returns whether the Controls folder is the only siblings in the 0 directory
     *   if the user deletes the file (without deleting the key bindings) the button needs to be
     *   disabled even if key bindings folder exists.
     *   we check if it includes other folders than the 'Controls' one
     */
    keyBindingsFolderHasSiblings() {
        return __awaiter(this, void 0, void 0, function* () {
            const listFolders = yield promises_1.default.readdir(path_1.default.resolve(this.keyBindingsPath, '..'));
            return !(listFolders.length === 1 && listFolders[0] === 'Controls');
        });
    }
    userFolderExists() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return (yield GameFilesManager.checkDirectoryExists(this.userFolderPath)) && this.keyBindingsFolderHasSiblings();
            }
            catch (e) {
                return false;
            }
        });
    }
    shadersFolderExists() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return GameFilesManager.checkDirectoryExists(this.shadersFolderPath);
            }
            catch (e) {
                return false;
            }
        });
    }
    emitFilesChangedEvent() {
        const _super = Object.create(null, {
            emit: { get: () => super.emit }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const filesState = yield this.getGameFilesState().catch(() => {
                return {
                    userFolderExists: false,
                    shadersFolderExists: false,
                };
            });
            _super.emit.call(this, 'game-files-changed', filesState);
        });
    }
}
// exports.default = GameFilesManager;
//# sourceMappingURL=game-files-manager.js.map