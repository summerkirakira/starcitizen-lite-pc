"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInstance = exports.initializeInstance = void 0;
class CIGGlobalConfig {
    constructor(cfg) {
        this.configuration = cfg.configuration;
        this.launcherVersion = cfg.launcherVersion;
        this.patcherVersion = cfg.patcherVersion;
        this.cpuCapabilities = cfg.cpuCapabilities;
        this.osMetMinimumRequirements = cfg.osMetMinimumRequirements;
        this.appPath = cfg.appPath;
        this.identity = cfg.identity;
    }
}
let instance;
/**
 * Initializes a single instanceof GlobalConfig if non exist yet
 */
function initializeInstance(cfg) {
    if (!instance) {
        instance = new CIGGlobalConfig(cfg);
    }
}
exports.initializeInstance = initializeInstance;
/**
 * Gets a single instance of GlobalConfig
 */
function getInstance() {
    if (instance) {
        return instance;
    }
    throw new Error('Tried to access global config instance before it was initialized');
}
exports.getInstance = getInstance;
//# sourceMappingURL=global-config.js.map