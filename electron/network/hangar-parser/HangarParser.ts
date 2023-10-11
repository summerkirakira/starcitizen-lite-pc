import Store from 'electron-store';

const store = new Store()

export interface ContainItem {
    image: string,
    title: string,
    type: string,
    manufacturer: string
}

export interface UpgradeDetail {
    id: number,
    name: string,
    match_items: [
        {
            id: number,
            name: string
        }
    ],
    target_items: [
        {
            id: number,
            name: string
        }
    ]
}


export interface HangarItem {
    id: number,
    title: string,
    description: string,
    image: string,
    currentPrice: number,
    price: number,
    status: "Gifted" | "Attributed",
    is_upgrade: boolean,
    upgrade_detail: UpgradeDetail | null,
    can_gift: boolean,
    can_reclaim: boolean,
    date: Date,
    contains: ContainItem[]
    also_contains: string[]
}

function parseStringToHtml(html: string): HTMLElement {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  return doc.body
}

function parsePrice(price: string): number {

    if (price.includes('USD')) {
        return parseFloat(price.replace('USD', '').replace(',', '').replace('$', '').trim())
    } else {
        return 0
    }
}

function parseDate(date_str: string): Date {
    const date = new Date(date_str.trim())
    return date
}

function convertDomToHangarItem(dom: Element): HangarItem {
    const image = dom.querySelectorAll('.image')?.[0]?.getAttribute('style')?.split("'")[1] ?? ''
    const id = dom.querySelectorAll('.js-pledge-id')?.[0]?.getAttribute('value') ?? '0'
    const title = dom.querySelectorAll('.js-pledge-name')?.[0]?.getAttribute('value') ?? ''
    const price = dom.querySelectorAll('.js-pledge-value')?.[0]?.getAttribute('value') ?? '0'
    const status = dom.querySelectorAll('.availability')?.[0]?.textContent ?? ''
    const date_str = dom.querySelectorAll('.date-col')?.[0]?.textContent ?? ''
    const description = dom.querySelectorAll('.items-col')?.[0]?.textContent?.replace('Contains:', '').trim() ?? ''
    const upgrade_detail: UpgradeDetail | null = JSON.parse(dom.querySelectorAll('.js-upgrade-data')?.[0]?.getAttribute('value') ?? 'null')
    const canGift = dom.querySelectorAll('.js-gift')?.[0] ?? null
    const canMelt = dom.querySelectorAll('.js-reclaim')?.[0] ?? null
    const content_block = dom.querySelectorAll('.content-block1')?.[0]

    const items = content_block?.querySelectorAll('.with-images')?.[0]?.querySelectorAll('.item')
    const contains: ContainItem[] = []
    items?.forEach(item => {
        const image = item.querySelectorAll('.image')?.[0]?.getAttribute('style')?.split("'")[1] ?? ''
        const title = item.querySelectorAll('.title')?.[0]?.textContent ?? ''
        const type = item.querySelectorAll('.kind')?.[0]?.textContent ?? ''
        const manufacturer = item.querySelectorAll('.liner')?.[0]?.textContent ?? ''
        contains.push({
            image: image,
            title: title,
            type: type,
            manufacturer: manufacturer
        })
    })
    const also_contains: string[] = []
    const also_contains_items = content_block?.querySelectorAll('.without-images')?.[0]?.querySelectorAll('.item')
    also_contains_items?.forEach(item => {
        const title = item.querySelectorAll('.title')?.[0]?.textContent.trim() ?? ''
        also_contains.push(title)
    })

    return {
        id: parseInt(id),
        title: title,
        description: description,
        image: image,
        currentPrice: parsePrice(price),
        price: parsePrice(price) * 100,
        status: status as "Gifted" | "Attributed",
        is_upgrade: upgrade_detail != null,
        upgrade_detail: upgrade_detail,
        can_gift: canGift != null,
        can_reclaim: canMelt != null,
        date: parseDate(date_str),
        contains: contains,
        also_contains: also_contains
    }
}

function getHangarItems(hangar_page: HTMLElement): HangarItem[] {
    const ship_list = hangar_page.querySelector('#billing > div > div.inner-content > ul')
    const ships = ship_list?.querySelectorAll('li')
    const hangar_items: HangarItem[] = []
    ships?.forEach(ship => {
        const hangar_item = convertDomToHangarItem(ship)
        if (hangar_item.title.length === 0) {
            return
        }
        hangar_items.push(hangar_item)
    })
    return hangar_items
}

export function parseHtmlToHangarItem(html: string): HangarItem[] {
    const dom = parseStringToHtml(html)
    return getHangarItems(dom)
}

export function getStoredHangarItems(): HangarItem[] {
    const hangar_items = store.get('hangar_items') as HangarItem[] ?? []
    return hangar_items
}

export async function refreshHangarItems(): Promise<HangarItem[]> {
    let page = 1
    let url = `account/pledges?page=${page}&pagesize=10`
    let response = await window.RsiApi.getPage(url)
    const hangar_items: HangarItem[] = []
    let items_on_page = parseHtmlToHangarItem(response)
    while (items_on_page.length > 0) {
        hangar_items.push(...items_on_page)
        page += 1
        url = `account/pledges?page=${page}&pagesize=10`
        response = await window.RsiApi.getPage(url)
        items_on_page = parseHtmlToHangarItem(response)
    }
    store.set('hangar_items', hangar_items)
    return hangar_items
}