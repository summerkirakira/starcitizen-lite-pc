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
    'OVERVIEW': '概览',
    'PROFILE': '个人资料',
    'Security': '账户安全',
    'REFERRAL PROGRAM': '邀请计划',
    'ADDRESS BOOK': '地址簿',
    'PLEDGE SHIPMENT': '快递查询',
    'REDEEM A CODE': '兑换码',
    'PUBLIC TEST UNIVERSE': '公共测试宇宙',
    'Character Repair': '角色修复',
    'ACCOUNT OVERVIEW': '账户概览',
    'Community Moniker': '社区昵称',
    'Handle': '游戏ID',
    'Birthdate': '出生日期',
    'Default Language': '默认语言',
    'Timezone': '时区',
    'Block Org Invitations': '屏蔽舰队邀请',
    'Opt-Out Leaderboards': '屏蔽排行榜',
    'Newsletters': '邮件订阅',
    'Weekly Newsletter': '每周邮件',
    'Squadron 42 Updates': '42中队更新',
    'Personalized Special Offers': '个人特别优惠',
    'Concierge Newsletter': '礼宾邮件',
    'View and manage your account settings and public identifiers.': '查看和管理您的账户公开设置。',
    'Display Title': '显示徽章',
    'Country': '国家',
    'Region': '地区',
    'Spoken Languages': '语言',
    'Website': '个人网站',
    'Short Bio': '个人简介',
    'CHANGE': '修改',
    'REMOVE': '删除',
    'Password protected': '请输入密码',
    'Login ID': '登录ID',
    'Password': '密码',
    'Email Address': '邮箱地址',
    'Login with Login ID': '使用登录ID登录',
    'Two-step authentication': '两步验证',
    'Method of authentication': '验证方式',
    'Backup codes': '备用码',
    'Manage your backup codes': '管理您的备用码',
    'Connected devices': '已验证设备',
    'SECURITY LOGS': '安全日志',
    'View your progress and recruits list, and share your referral code': '查看您的邀请进度和邀请列表，分享您的邀请码',
    'Share Your Referral Code': '分享您的邀请码',
    'Referral Progress': '邀请进度',
    'Address Name': '地址名称',
    'Address (required)': '地址（必填）',
    'Company': '公司',
    'Country (required)': '国家（必填）',
    'First Name (required)': '名字（必填）',
    'Last Name (required)': '姓氏（必填）',
    'City (required)': '城市（必填）',
    'Phone (required)': '电话（必填）',
    'Postal Code (required)': '邮编（必填）',
    'Shipping Now': '立即发货',
    'Click on the "Ship Now" button to update your shipping address.': '点击“立即发货”按钮更新您的快递地址。',
    'You’ve got an item to redeem?': '您有兑换码吗？',
    'CHARACTER REPAIR': '角色修复',
    'Request Repair': '申请修复',
    'Identification': '身份验证',
    'Copy account to PTU': '复制账户到测试服',
    'Erase account from PTU': '删除测试服账户',
    'Apps': '应用',
    'Games': '游戏',
    'Learn How to Play': '学习如何游玩',
    'Support': '支持',
    'Account': '账户',
    'STORE': '信用点',
    'Join us for the Intergalactic Aerospace Expo 2953, the biggest ship show in the \'verse! Play Star Citizen for FREE and try out over 120 ships and ground vehicles from November 17 to 30.': '参加2953年星际航空博览会，这是宇宙中最大的飞船展！从11月17日到30日，免费游玩《星际公民》，试用超过120艘飞船和地面载具。',
    'IAE 2953': '2953年周年庆',
    'More info': '更多信息',
    'Close': '关闭',
    'MY GEAR': '我的装备'
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
    document.querySelector('.top').querySelectorAll('p').forEach(title => {
        const titleText = title.textContent.trim()
        if (other_dict[titleText] !== undefined) {
            title.textContent = other_dict[titleText]
        }
    })
    document.querySelector('.inner-content').querySelectorAll('label').forEach(title => {
        const titleText = title.textContent.trim()
        if (other_dict[titleText] !== undefined) {
            title.textContent = other_dict[titleText]
        }
    })
    document.querySelector('.c-platform-navigation--rsi').querySelectorAll('span').forEach(title => {
        const titleText = title.textContent.trim()
        if (other_dict[titleText] !== undefined) {
            title.textContent = other_dict[titleText]
        }
    })
    document.querySelectorAll('.c-notification__title').forEach(title => {
        const titleText = title.textContent.trim()
        if (other_dict[titleText] !== undefined) {
            title.textContent = other_dict[titleText]
        }
    })
    document.querySelectorAll('.c-notification__message').forEach(title => {
        const titleText = title.textContent.replace('\n', '').trim()
        if (other_dict[titleText] !== undefined) {
            title.textContent = other_dict[titleText]
        }
    })
    document.querySelectorAll('.c-notification__button-text').forEach(title => {
        const titleText = title.textContent.trim()
        if (other_dict[titleText] !== undefined) {
            title.textContent = other_dict[titleText]
        }
    })
    document.querySelectorAll('.c-account-sidebar__links-link-label').forEach(title => {
        const titleText = title.textContent.replace('\n', '').trim()
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