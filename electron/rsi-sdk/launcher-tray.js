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
exports.LauncherTray = void 0;
const electron_1 = require("electron");
const app_shared_1 = require("@rsilauncher/app-shared");
const path_1 = __importDefault(require("path"));
const analytics_1 = require("./analytics");
const { TRAY_MENU_ITEM_CLICKED, UI_HIDE_SUCCESSFUL, UI_QUIT_SUCCESSFUL, UI_SHOW_SUCCESSFUL } = app_shared_1.IpcEvents;
class LauncherTray {
    constructor(app, mainWindow, config) {
        this.app = app;
        this.mainWindow = mainWindow;
        this.config = config;
        this.app = app;
        this.mainWindow = mainWindow;
        this.config = config;
        // We need to have the Tray instance as an instance member
        // because we cannot 'extend' Electron's Tray class because extending such classes is not
        // supported as they are backed by native objects. See https://github.com/electron/electron/issues/25721
        this.tray = new electron_1.Tray(path_1.default.resolve(`${__dirname}/../app/assets/icons/rsi.ico`));
        this.tray.setToolTip(this.config.description);
        this.buildWindowToggle();
        this.contextMenu = electron_1.Menu.buildFromTemplate([
            {
                label: 'Quit',
                click: () => this.quit(),
            },
        ]);
        this.tray.setContextMenu(this.contextMenu);
    }
    buildWindowToggle() {
        this.tray.on('click', () => {
            if (!this.mainWindow) {
                return;
            }
            if (this.mainWindow.isVisible()) {
                this.mainWindow.hide();
                this.mainWindow.webContents.send(UI_HIDE_SUCCESSFUL);
            }
            else {
                this.mainWindow.show();
                this.mainWindow.webContents.send(UI_SHOW_SUCCESSFUL);
            }
        });
    }
    updateVisibilities(visibilities) {
        visibilities.forEach((visibility) => {
            const { id, visible } = visibility;
            const menuItem = this.contextMenu.getMenuItemById(id);
            if (!menuItem) {
                throw new Error(`Menu item with id=${id} is not found.`);
            }
            menuItem.visible = visible;
        });
    }
    notifyRendererItemClicked(clickedItemId) {
        this.mainWindow.webContents.send(TRAY_MENU_ITEM_CLICKED, clickedItemId);
    }
    refreshMenu(menuItems) {
        const menuItemsWithClick = menuItems
            .filter((x) => x.id)
            .map((item) => (Object.assign(Object.assign({}, item), { click: () => this.notifyRendererItemClicked(item.id) })));
        this.contextMenu = electron_1.Menu.buildFromTemplate([
            ...menuItemsWithClick,
            {
                label: 'Quit',
                click: () => this.quit(),
            },
        ]);
        this.tray.setContextMenu(this.contextMenu);
    }
    isDestroyed() {
        return this.tray.isDestroyed();
    }
    displayBalloon(options) {
        const icon = path_1.default.resolve(`${__dirname}/../app/assets/icons/rsi.png`);
        this.tray.displayBalloon(Object.assign({ icon }, options));
    }
    quit() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.mainWindow) {
                return;
            }
            this.mainWindow.webContents.send(UI_QUIT_SUCCESSFUL);
            this.mainWindow.hide();
            this.tray.destroy();
            try {
                yield (0, analytics_1.sendAnalytics)({ name: 'App:Close' }, this.mainWindow);
            }
            finally {
                this.app.quit();
            }
        });
    }
}
exports.LauncherTray = LauncherTray;
//# sourceMappingURL=launcher-tray.js.map