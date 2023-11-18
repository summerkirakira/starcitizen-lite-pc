import { getHangarItemPrice, getHangarUpgradePrice, translateHangarItemName, translateHangerItemType } from '../uitils/hangar-util';
import { ipcRenderer, app } from 'electron';
import { ShipAlias, Translation } from '../network/CirnoAPIProperty';
import { getShipAliasList, getTranslation, setShipAliasList, setTranslation, updateLocalizationSettings } from '../uitils/files';

window.nodeRequire = require
delete window.require
delete window.exports
delete window.module

// ipcRenderer.on('share-data', (event, data) => {
//     window.fileManager = data
//     console.log('share data', data)
// })

const other_dict = {
    'SETTINGS': '设置',
    'MY HANGAR': '我的机库',
    'BILLING & SUBSCRIPTION': '账单与订阅',
    'COMMS': '通讯',
    'ORGANIZATIONS': '舰队',
    'CONCIERGE': '礼宾服务',
    'SUBSCRIBERS': '订阅者',
    'My Gear': '我的装备',
    'MY ROMS': '我的ROM',
    'Buy Back Pledges': '回购',
    'Pledge': '捐赠',
    'Electronic Access': '电子通行证',
    'Reacquire your converted pledges': '重新获得您的机库物品',
    'Play now': '立即游玩',
    'MY ACCOUNT': '我的账户',
}

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

function translationBasicItems(items) {
    items.forEach(title => {
        const titleText = title.textContent.trim()
        title.textContent = translateHangarItemName(titleText)
        if (other_dict[titleText] !== undefined) {
            title.textContent = other_dict[titleText]
        }
    })
}

function translateDateCols(cols) {
    cols.forEach(col => {
        const colText = col.textContent.replace('Created:', '').replace('\n', '').trim()
        const date = new Date(colText)
        const dateString = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
        col.innerHTML = col.innerHTML.replace(colText, dateString).replace('Created:', '创建于:')
    })
}

function translationItemCols(cols) {
    cols.forEach(col => {
        const colText = col.textContent.replace('Contains:', '').replace('\n', '').trim()
        const chineseName = translateHangarItemName(colText)
        col.innerHTML = col.innerHTML.replace(colText, chineseName).replace('Contains:', '包含:').replace('and', ' 和 ').replace('items', '件物品')
    })
}

function translateOthers() {
    document.querySelectorAll('.availability').forEach(availability => {
        const availabilityText = availability.textContent.trim()
        if (availabilityText == 'Gifted') {
            availability.textContent = '已赠送'
        } else if (availabilityText == 'Attributed') {
            availability.textContent = '在库'
        }
    })
    document.querySelectorAll('.js-label').forEach(label => {
        const labelText = label.textContent.trim()
        if (labelText == 'Gift') {
            label.textContent = '赠送'
        } else if (labelText == 'Exchange') {
            label.textContent = '融船'
        } else if (labelText == 'Apply upgrade') {
            label.textContent = '升级'
        }
    })
    document.querySelector('.item-7').querySelectorAll('a').forEach(title => {
        const titleText = title.textContent.trim()
        if (other_dict[titleText] !== undefined) {
            title.textContent = other_dict[titleText]
        }
    })
    document.querySelector('.sidenav').querySelectorAll('.bg').forEach(title => {
        const titleText = title.textContent.trim()
        if (other_dict[titleText] !== undefined) {
            title.textContent = other_dict[titleText]
        }
    })
}

function translateHangar() {
    translationBasicItems(document.querySelectorAll('h3'))
    translationBasicItems(document.querySelectorAll('h2'))
    translationBasicItems(document.querySelectorAll('h1'))
    translationBasicItems(document.querySelectorAll('strong'))
    translationBasicItems(document.querySelectorAll('.title'))
    translateDateCols(document.querySelectorAll('.date-col'))
    translationItemCols(document.querySelectorAll('.items-col'))
    translateOthers()
}

document.addEventListener('DOMContentLoaded', () => {
    init()
    translateHangar()
    
});