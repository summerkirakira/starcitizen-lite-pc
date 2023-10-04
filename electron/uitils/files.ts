import { dialog } from "electron";

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