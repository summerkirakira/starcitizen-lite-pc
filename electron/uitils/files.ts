import { LocalizationSettings } from './../settings/refuge_settings.d';
const { dialog } = require('electron')
const AdmZip = require("adm-zip")
import fs from "fs";
import { LocalizationSettings } from "../settings/refuge_settings";
import path from "path";
import { getRefugeSettings, setRefugeSettings } from "./settings";
import { FileSturcture } from "../network/CirnoAPIProperty";
import CryptoJS from "crypto-js";

declare class Filter {
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
    return path.join(window.appPath, 'cache')
}

function readJsonFile (filePath: string): any {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function writeJsonFile (filePath: string, json: any) {
    fs.writeFileSync(filePath, JSON.stringify(json, null, 4))
}


export const readLocalizationInfo = (filePath: string): LocalizationSettings => {
    const json = readJsonFile(filePath)
    return json
}

export const writeLocalizationInfo = () => {
    const refugeSettings = getRefugeSettings()
    console.log(refugeSettings)
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

async function calculateFileHash(filePath): Promise<string> {
    const data = await fs.promises.readFile(filePath);
    const hash = CryptoJS.MD5(CryptoJS.lib.WordArray.create(data));
  
    return hash.toString();
  }

export async function validateFolder(folder_path: string, files: FileSturcture[]): Promise<string[]> {
    const missingFiles = []
    for (const file of files) {
        const filePath = path.join(folder_path, file.name)
        if (!fs.existsSync(filePath)) {
            missingFiles.push(file.name)
            continue
        }
        const fileHash = await calculateFileHash(filePath)
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
    const localizationPath = path.join(refugeSettings.gameSettings.currentGamePath, localizationInfo.path)
    fs.mkdirSync(localizationPath, { recursive: true })
    const missing_files = await validateFolder(localizationPath, localizationInfo.hashes)
    let downloadGlobalFlag = false
    let downloadFontFlag = false
    if (missing_files.length == 0) {
        refugeSettings.localizationSettings.latestVersion = localizationInfo.localization_version
        refugeSettings.localizationSettings.latestFontVersion = localizationInfo.localization_font_version
        refugeSettings.localizationSettings.hashes = localizationInfo.hashes
        refugeSettings.localizationSettings.path = localizationInfo.path
        refugeSettings.localizationSettings.version = localizationInfo.localization_version
        refugeSettings.localizationSettings.fontVersion = localizationInfo.localization_font_version
        setRefugeSettings(refugeSettings)
        writeLocalizationInfo()
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
        const zipPath = await window.CirnoApi.downloadGameZip(localizationInfo.localization_url, getCachePath())
        console.log("find global.ini missing")
        extractZipToPath(zipPath, localizationPath)
    }
    if (downloadFontFlag) {
        const zipPath = await window.CirnoApi.downloadGameZip(localizationInfo.localization_font_url, getCachePath())
        console.log("find font missing")
        extractZipToPath(zipPath, localizationPath)
    }
    const validFiles = await validateFolder(localizationPath, localizationInfo.hashes)
    if (validFiles.length != 0) {
        throw new Error('Failed to install localization')
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
    writeLocalizationInfo()
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
    return fs.promises.rmdir(localizationFolderPath, { recursive: true })
}