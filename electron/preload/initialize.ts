import Store from 'electron-store'


const store = new Store()


export function initialize() {
    checkUUID()
    initializeGameSettings()
}


function checkUUID() {
    const uuid = store.get('uuid', null)

    console.log(uuid)

    if (!uuid) {
        const uuid = require('uuid').v4()
        store.set('uuid', require('uuid').v4())
    }
}

function initializeGameSettings() {
    store.set('refuge_settings', {
        gameSettings: {
            currentGamePath: "C:\\Users\\Administrator\\AppData\\Local\\Programs\\refuge\\refuge.exe",
            currentGameVersion: null,
            otherGamePaths: [
                "C:\\Users\\Administrator\\AppData\\Local\\Programs\\refuge\\refuge1.exe",
                "C:\\Users\\Administrator\\AppData\\refuge.exe",
                "C:\\Users\\AppData\\Local\\Programs\\refuge\\refuge.exe"
            ],
        },
        localizationSettings: null,
    })
}
