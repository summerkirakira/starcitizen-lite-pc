"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winreg_1 = __importDefault(require("winreg"));
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
const HKEY_VC_REDIST = '\\SOFTWARE\\Microsoft\\DevDiv\\VC\\Servicing\\14.0\\RuntimeMinimum';
const isDev = process.env.NODE_ENV === 'development';
const { resourcesPath } = process;
const vcRedistExecutable = 'VC_redist.x64.exe';
const vcRedistExecutablePath = isDev
    ? path_1.default.join(path_1.default.dirname(__dirname), '../build', 'windeps', vcRedistExecutable)
    : path_1.default.resolve(resourcesPath, vcRedistExecutable);
/**
 * Attempts to launch the EAC installation if not already intalled
 * @throws {Error} If an error occurs while running the installer
 */
exports.default = () => {
    const regKey = new winreg_1.default({
        hive: winreg_1.default.HKLM,
        key: HKEY_VC_REDIST,
    });
    regKey.values((err) => {
        // If we catch an error it means that VCRedist is not installed
        if (err) {
            (0, child_process_1.execSync)(
            // eslint-disable-next-line max-len
            `Start-Process -Verb RunAs -FilePath "${vcRedistExecutablePath}" -ArgumentList "/install /quiet /norestart" -WorkingDirectory "${resourcesPath}"`, { shell: 'powershell.exe' });
        }
    });
};
//# sourceMappingURL=check-vcredist.js.map