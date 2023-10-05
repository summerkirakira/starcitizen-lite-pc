import { dialog } from "electron";
import { AdmZip } from "adm-zip";

export const chooseFile = () => { 
    return dialog.showOpenDialogSync(
        {
            filters: [
                {name: "EXE", extensions: ["exe"]},
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