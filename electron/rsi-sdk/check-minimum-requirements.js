"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const compare_versions_1 = __importDefault(require("compare-versions"));
exports.default = (release = '') => {
    const MINIMUM_WINDOWS_VERSION = '6.3';
    if (!release) {
        return false;
    }
    return compare_versions_1.default.compare(release, MINIMUM_WINDOWS_VERSION, '>=');
};
//# sourceMappingURL=check-minimum-requirements.js.map