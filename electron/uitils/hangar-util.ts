import { ShipAlias } from "../network/CirnoAPIProperty";


function getHighestShipPrice(shipAlias: ShipAlias): number {
    let highestPrice = 0
    for (const sku of shipAlias.skus) {
        if (sku.price > highestPrice) {
            highestPrice = sku.price
        }
    }
    return highestPrice
}

function getFormattedShipName(itemName: string): string {
    const formattedTitle = itemName.replace('Banu', '').replace('Drake', '').replace('Crusader', '').replace('Argo', '').replace('Esperia', '').replace('Upgrade', '').replace('CNOU', '').replace('AEGIS', '').replace('Mercury Star Runner', 'Mercury').replace('ORIGIN 600i Exploration Module', '600i Explorer').replace('ORIGIN 600i Touring Module', '600i Touring').replace('RSI', '').replace('Anvil', '').replace('Retaliator Base', 'Retaliator').replace('Mole Carbon Edition', 'Mole').replace('Genesis Starliner', 'Genesis').replace('Hercules Starship', '').replace('Standard Edition', '').replace('Mole', 'MOLE')
    return formattedTitle.trim() 
}

function getFullUpgradeName(itemName: string): string[] {
    const formattedTitle = itemName.replace('Upgrade - ', '').replace('Upgrade', '').trim()
    return formattedTitle.split(' to ').map((item) => {
        return getFormattedShipName(item.trim())
    })
}

export function translateHangerItemType(itemName: string): string {
    switch (itemName) {
        case "Hanger decoration": 
            return "机库装饰"
        case "Ship":
            return "舰船"
        case "Hangar pass":
            return "机库通行证"
        case "Component":
            return "组件"
        case "FPS Equipment":
            return "FPS装备"
        case "Skin":
            return "涂装"
        case "Hangar decoration":
            return "机库装饰"
    }
}

export function getHangarItemPrice(itemName: string): number {
    if (window.fileManager.shipAliasMap.has(itemName)) {
        return getHighestShipPrice(window.fileManager.shipAliasMap.get(itemName))
    }
    return 0
}

export function getHangarUpgradePrice(itemName: string): number {
    const upgradeList = getFullUpgradeName(itemName)
    if (upgradeList.length != 2) {
        console.log('upgrade not found', upgradeList)
        return 0
    }
    const fromShipName = upgradeList[0]
    const toShipName = upgradeList[1]
    if (window.fileManager.shipAliasMap.has(fromShipName) && window.fileManager.shipAliasMap.has(toShipName)) {
        const fromShipPrice = getHighestShipPrice(window.fileManager.shipAliasMap.get(fromShipName))
        const toShipPrice = getHighestShipPrice(window.fileManager.shipAliasMap.get(toShipName))
        return toShipPrice - fromShipPrice
    }
    console.log('upgrade not found', fromShipName, toShipName)
    return 0
}

function translationItemName(itemName: string): string {
    if (window.fileManager.translationMap.has(itemName)) {
        return window.fileManager.translationMap.get(itemName)
    }
    return itemName
}

function formatTranslationItemName(itemName: string, isWarbond, isBIS): string {
    if (isWarbond && !isBIS) {
        itemName = `${itemName} [战争债券版]`
    }
    if (isBIS) {
        itemName = `${itemName} [BIS战争债券版]`
    }
    return itemName
}

export function translateHangarItemName(itemName: string): string {
    let isWarbond = false
    let isBIS = false
    if (itemName.endsWith('BIS Warbond Edition')) {
        isBIS= true
        itemName = itemName.replace('BIS Warbond Edition', '').trim()
    }
    if (itemName.endsWith('Warbond Edition')) {
        isWarbond = true
        itemName = itemName.replace('Warbond Edition', '').trim()
    }
    if (itemName.startsWith('Standalone Ship -')) {
        return formatTranslationItemName(`单船 - ${translationItemName(itemName.replace('Standalone Ship -', '').trim())}`, isWarbond, isBIS)
    }
    if (itemName.includes('Upgrade')) {
        const upgradeInfo = getFullUpgradeName(itemName)
        if (upgradeInfo.length != 2) {
            return formatTranslationItemName(translationItemName(itemName.replace('Upgrade -', '').replace('upgrade', '').trim()), isWarbond, isBIS)
        }
        return formatTranslationItemName(`升级 - ${translationItemName(upgradeInfo[0])} 到 ${translationItemName(upgradeInfo[1])}`,isWarbond, isBIS)
    }
    return formatTranslationItemName(translationItemName(itemName), isWarbond, isBIS)
}