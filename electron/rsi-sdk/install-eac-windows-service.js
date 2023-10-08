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
exports.installWindowsService = exports.isInstalled = void 0;
const winreg_1 = __importDefault(require("winreg"));
const path = __importStar(require("path"));
const electron_log_1 = __importDefault(require("electron-log"));
const child_process_1 = require("child_process");
const eac_settings_utilities_1 = require("./eac-settings-utilities");
function isInstalled(gameName, environment) {
    const key = `\\SOFTWARE\\Roberts Space Industries\\${gameName}\\${environment}`;
    const registryKey = new winreg_1.default({
        hive: winreg_1.default.HKCU,
        key,
    });
    return new Promise((resolve) => {
        registryKey.get('EACServiceInstalled', (err, item) => {
            resolve(!err && parseInt(item.value, 16) > 0);
        });
    });
}
exports.isInstalled = isInstalled;
// eslint-disable-next-line consistent-return
function installWindowsService(options) {
    return __awaiter(this, void 0, void 0, function* () {
        const available = yield (0, eac_settings_utilities_1.isAvailable)(options.gameDirectory);
        if (available) {
            const installed = isInstalled(options.gameName, options.environment);
            if (!installed || !!options.force) {
                const eacDir = path.resolve(options.gameDirectory, 'EasyAntiCheat');
                try {
                    (0, child_process_1.execSync)(`Start-Process -Verb RunAs -FilePath "${path.resolve(eacDir, 'EasyAntiCheat_EOS_Setup.exe')}" -ArgumentList "install ${options.productId}"`, { shell: 'powershell.exe' });
                }
                catch (e) {
                    throw new Error(`Unable to register game ${options.gameName} with environment ${options.environment} to the EAC service`);
                }
                const key = `\\SOFTWARE\\Roberts Space Industries\\${options.gameName}\\${options.environment}`;
                const registryKey = new winreg_1.default({
                    hive: winreg_1.default.HKCU,
                    key,
                });
                return new Promise((resolve, reject) => {
                    registryKey.set('EACServiceInstalled', winreg_1.default.REG_DWORD, '1', (err) => {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve();
                        }
                    });
                });
            }
        }
        else {
            electron_log_1.default.info('No Anti-Cheat distribution was found in this build');
            return Promise.resolve();
        }
    });
}
exports.installWindowsService = installWindowsService;
//# sourceMappingURL=install-eac-windows-service.js.map