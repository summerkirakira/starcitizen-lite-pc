import { dialog } from "electron";
import { AdmZip } from "adm-zip";
import fs from "fs";
import { LocalizationSettings } from "../settings/refuge_settings";
import Store from "electron-store";

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

export const writeLocalizationInfo = (filePath: string, json: LocalizationSettings) => {
    writeJsonFile(filePath, json)
}

export function loadLocalizationInfo(path: string): LocalizationSettings {
    return readLocalizationInfo(path)
}