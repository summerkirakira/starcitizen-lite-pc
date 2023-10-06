
const { dialog } = require('electron')
import { AdmZip } from "adm-zip";
import fs from "fs";
import { LocalizationSettings } from "../settings/refuge_settings";
import Store from "electron-store";
import path from "path";
import { getRefugeSettings } from "./settings";
import { FileSturcture } from "../network/CirnoAPIProperty";
import CryptoJS from "crypto-js"

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

function calculateFileHash(filePath) {
    const data = fs.readFileSync(filePath);
    const hash = CryptoJS.MD5(CryptoJS.lib.WordArray.create(data));
  
    return hash.toString();
  }

export function validateFolder(folder_path: string, files: FileSturcture[]): string[] {
    const missingFiles = []
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
    return []
}