const { dialog } = require('electron')
const AdmZip = require("adm-zip")
import fs from "fs";
import { LocalizationSettings } from "../settings/refuge_settings";
import path from "path";
import { getRefugeSettings, setRefugeSettings } from "./settings";
import { FileSturcture, ShipAlias, Translation } from "../network/CirnoAPIProperty";
import CryptoJS from "crypto-js";

import Store from 'electron-store'
const store = new Store()


export class Filter {
    name: string;
    extensions: string[];
}

export const chooseFile = (filter: Filter): string[] => { 
    return dialog.showOpenDialogSync(
        {
            filters: [
                filter
            ],
            properties: ["openFile"]
        }
    )
}

export const extractZipToPath = (zipPath: string, targetPath: string) => {
    const zip = new AdmZip(zipPath)
    zip.extractAllTo(targetPath, true)
}

export const extractZipToPathAsync = async (zipPath: string, targetPath: string) => {
    const zip = new AdmZip(zipPath)
    await zip.extractAllToAsync(targetPath, true)
}

export function getCachePath(): string {
    const cachePath = path.join(window.appPath, 'cache')
    if (!fs.existsSync(cachePath)) {
        fs.mkdirSync(cachePath)
    }
    // console.log(cachePath)
    return path.join(window.appPath, 'cache')
}

function readJsonFile (filePath: string): any {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function writeJsonFile (filePath: string, json: any) {
    fs.writeFileSync(filePath, JSON.stringify(json, null, 4))
}

function writeLanguageFile (filePath: string, language: string) {
    console.log(`write language file ${filePath}, ${language}`)
    fs.writeFileSync(filePath, `g_language=${language}`)
}


export const readLocalizationInfo = (filePath: string): LocalizationSettings => {
    const json = readJsonFile(filePath)
    return json
}

export const writeLocalizationInfo = () => {
    const refugeSettings = getRefugeSettings()
    // console.log(refugeSettings)
    if (refugeSettings.gameSettings.currentGamePath == null) {
        throw new Error('No game path found')
    }
    const localizationFolderPath = path.join(refugeSettings.gameSettings.currentGamePath, 'data')
    const filePath = path.join(localizationFolderPath, 'version.json')
    if (!fs.existsSync(localizationFolderPath)) {
        throw new Error('Localization folder not found')
    }
    writeJsonFile(filePath, refugeSettings.localizationSettings)
}

export function loadLocalizationInfoFromFile(path: string): LocalizationSettings | null {
    if (!fs.existsSync(path)) {
        return null
    }
    return readLocalizationInfo(path)
}

function calculateFileHash(filePath): string {
    const data = fs.readFileSync(filePath);
    const hash = CryptoJS.MD5(CryptoJS.lib.WordArray.create(data));
  
    return hash.toString();
  }

export function validateFolder(folder_path: string, files: FileSturcture[]): string[] {
    const missingFiles = []
    // console.log(files)
    for (const file of files) {
        const filePath = path.join(folder_path, file.name)
        if (!fs.existsSync(filePath)) {
            missingFiles.push(file.name)
            continue
        }
        const fileHash = calculateFileHash(filePath)
        if (fileHash != file.md5) {
            missingFiles.push(file.name)
        }
    }
    return missingFiles
}


export async function installLocalization(localizationId: string | null): Promise<void> {
    const localizationInfo = await window.CirnoApi.getLocalizationInfo({
        localization_id: localizationId
    })
    const refugeSettings = getRefugeSettings()
    if (refugeSettings.gameSettings.currentGamePath == null) {
        throw new Error('No game path found')
    }
    if (!fs.existsSync(refugeSettings.gameSettings.currentGamePath)) {
        throw new Error('Localization already installed')
    }

    const localizationFolderPath = path.join(refugeSettings.gameSettings.currentGamePath, 'data')

    const localizationPath = path.join(refugeSettings.gameSettings.currentGamePath, localizationInfo.path)
    try {
        if (fs.existsSync(localizationFolderPath)) {
            fs.rmdirSync(localizationFolderPath, { recursive: true })
        }
        fs.mkdirSync(localizationPath, { recursive: true })
    } catch (e) {
        throw new Error(`缺少对游戏目录的写权限或文件被占用，请使用管理员权限打开避难所并关闭其他占用汉化文件的程序（如文件夹窗口）也可尝试手动删除${localizationFolderPath}目录`)
    }
    // console.log(localizationInfo)
    const missing_files = validateFolder(localizationPath, localizationInfo.hashes)
    let downloadGlobalFlag = false
    let downloadFontFlag = false
    if (missing_files.length == 0) {
        refugeSettings.localizationSettings = {
            latestVersion: localizationInfo.localization_version,
            latestFontVersion: localizationInfo.localization_font_version,
            hashes: localizationInfo.hashes,
            path: localizationInfo.path,
            version: localizationInfo.localization_version,
            fontVersion: localizationInfo.localization_font_version,
            localizaitonId: localizationInfo.localization_id,
        }
        setRefugeSettings(refugeSettings)
        writeLocalizationInfo()
        writeLanguageFile(path.join(refugeSettings.gameSettings.currentGamePath, 'user.cfg'), 'chinese_(simplified)')
        return
    }
    for (const file of missing_files) {
        if (file.startsWith('global')) {
            downloadGlobalFlag = true
        } else {
            downloadFontFlag = true
        }
    }
    if (downloadGlobalFlag) {
        const zipPath = await window.fileManager.getZipFile(localizationInfo.localization_url, getCachePath())
        console.log("find global.ini missing")
        extractZipToPath(zipPath, localizationPath)
    }
    if (downloadFontFlag) {
        const zipPath = await window.fileManager.getZipFile(localizationInfo.localization_font_url, getCachePath())
        console.log("find font missing")
        extractZipToPath(zipPath, localizationPath)
    }
    const validFiles = validateFolder(localizationPath, localizationInfo.hashes)
    // console.log(validFiles)
    if (validFiles.length != 0) {
        throw new Error('哈希校验失败，请重新安装')
    }
    refugeSettings.localizationSettings = {
        localizaitonId: localizationInfo.localization_id,
        version: localizationInfo.localization_version,
        fontVersion: localizationInfo.localization_font_version,
        latestVersion: localizationInfo.localization_version,
        latestFontVersion: localizationInfo.localization_font_version,
        hashes: localizationInfo.hashes,
        path: localizationInfo.path,
    }
    setRefugeSettings(refugeSettings)
    // console.log(refugeSettings)
    writeLocalizationInfo()
    writeLanguageFile(path.join(refugeSettings.gameSettings.currentGamePath, 'user.cfg'), 'chinese_(simplified)')
}

export function updateLocalizationSettings() {
    const settings = getRefugeSettings()
    const localizationFolderPath = path.join(settings.gameSettings.currentGamePath, 'data')
    const localizationInfoFilePath = path.join(localizationFolderPath, 'version.json')
    const localizationInfo = loadLocalizationInfoFromFile(localizationInfoFilePath)
    settings.localizationSettings = localizationInfo
    setRefugeSettings(settings)
}

export async function uninstallLocalization(): Promise<void> {
    const refugeSettings = getRefugeSettings()
    if (refugeSettings.gameSettings.currentGamePath == null) {
        throw new Error('No game path found')
    }
    const localizationFolderPath = path.join(refugeSettings.gameSettings.currentGamePath, 'data')
    writeLanguageFile(path.join(refugeSettings.gameSettings.currentGamePath, 'user.cfg'), 'english')
    if (fs.existsSync(localizationFolderPath)) {
        try {
            fs.rmdirSync(localizationFolderPath, { recursive: true })
        } catch (e) {
            throw new Error(`缺少对游戏目录的写权限或文件被占用，请使用管理员权限打开避难所并关闭其他占用汉化文件的程序（如文件夹窗口）也可尝试手动删除${localizationFolderPath}目录`)
        }
        
    }
}


export function setShipAliasList(shipAliasList: ShipAlias[]) {
    store.set('shipAliasList', shipAliasList)
}

export function getShipAliasList(): ShipAlias[] {
    return store.get('shipAliasList', []) as ShipAlias[]
}

export function setTranslation(translationList: Translation[]) {
    store.set('translationList', translationList)
}

export function getTranslation(): Translation[] {
    return store.get('translationList', []) as Translation[]
}