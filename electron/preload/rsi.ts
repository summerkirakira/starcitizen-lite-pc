import { getHangarItemPrice, getHangarUpgradePrice, translateHangarItemName, translateHangerItemType } from '../uitils/hangar-util';
import { ipcRenderer } from 'electron';
import { ShipAlias, Translation } from '../network/CirnoAPIProperty';
import { getShipAliasList, getTranslation, setShipAliasList, setTranslation, updateLocalizationSettings } from '../uitils/files';

// ipcRenderer.on('share-data', (event, data) => {
//     window.fileManager = data
//     console.log('share data', data)
// })

function convertShipAliasListToMap(shipAliasList: ShipAlias[]): Map<string, ShipAlias> {
    const shipAliasMap = new Map<string, ShipAlias>()
        for (const shipAlias of shipAliasList) {
            shipAliasMap.set(shipAlias.name, shipAlias)
            for (const alias of shipAlias.alias) {
                shipAliasMap.set(alias, shipAlias)
            }
        }
    return shipAliasMap
}

export function convertTranslationToMap(tranlationList: Translation[]): Map<string, string> {
    const translationMap = new Map<string, string>()
    for (const translation of tranlationList) {
        translationMap.set(translation.english_title, translation.title)
    }
    return translationMap
}

function initData() {
    window.fileManager = {
        getZipFile: null,
        shipAliasMap: convertShipAliasListToMap(getShipAliasList()),
        translationMap: convertTranslationToMap(getTranslation())
    }
}

function init() {
    initData()
}

document.addEventListener('DOMContentLoaded', () => {
    init()
    const titles = document.querySelectorAll('h3')
    // console.log(titles)
    // console.log(window.fileManager.shipAliasMap)
    titles.forEach(title => {
        const titleText = title.textContent.trim()
        console.log(translateHangarItemName(titleText))
        title.textContent = translateHangarItemName(titleText)
    })
});