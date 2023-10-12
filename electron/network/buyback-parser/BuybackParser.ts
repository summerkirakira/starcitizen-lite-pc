import Store from 'electron-store'

const store = new Store()

export interface BuybackItem {
    id: number,
    title: string,
    contains: string,
    image: string,
    url: string,
    date: Date,
    isUpgrade: boolean
}

function parseStringToHtml(html: string): HTMLElement {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    return doc.body
}

function parseDate(date_str: string): Date {
    const date = new Date(date_str.trim())
    return date
}

function convertDomToBuybackItem(dom: Element): BuybackItem {
    const image = dom.querySelector('img')?.[0]?.getAttribute('src') ?? ''
    const title = dom.querySelector('h1')?.textContent ?? ''
    const url = dom.querySelector('.holosmallbtn')?.getAttribute('href') ?? ''
    let id = 0
    let isUpgrade = false
    if (url === '') {
        id = parseInt(dom.querySelector('.holosmallbtn')?.getAttribute('data-pledgeid') ?? '0')
        isUpgrade = true
    } else {
        id = parseInt(url.split('/').pop() ?? '0')
    }
    
    const contains = dom.querySelectorAll('dd')?.[2]?.textContent?? ''
    const date = parseDate(dom.querySelectorAll('dd')?.[0]?.textContent ?? '')
    return {
        id: id,
        title: title,
        contains: contains,
        image: image,
        url: url,
        date: date,
        isUpgrade: isUpgrade
    }
}

function parseHtmlToBuybackItem(html: string): BuybackItem[] {
    const dom = parseStringToHtml(html)
    const buybackItems: BuybackItem[] = []
    dom.querySelector('#billing > div > div.inner-content > section.available-pledges > ul')?.querySelectorAll('article')
    .forEach((item) => {
        // console.log(item)
        // throw new Error('Not implemented')
        buybackItems.push(convertDomToBuybackItem(item))
    })
    return buybackItems
}


export function getStoredBuybackItems(): BuybackItem[] {
    const buybackItems = store.get('buybackItems', []) as BuybackItem[]
    return buybackItems
}


export async function refreshBuybackItems(): Promise<BuybackItem[]> {
    let page = 1
    let url = `account/buy-back-pledges?page=${page}&pagesize=100`
    let html = await window.RsiApi.getPage(url)
    const buybackItems: BuybackItem[] = []
    let items_on_page = parseHtmlToBuybackItem(html)
    while (items_on_page.length > 0) {
        buybackItems.push(...items_on_page)
        page += 1
        url = `account/buy-back-pledges?page=${page}&pagesize=100`
        html = await window.RsiApi.getPage(url)
        items_on_page = parseHtmlToBuybackItem(html)
        console.log(`Got ${items_on_page.length} items on page ${page}`)
    }
    store.set('buybackItems', buybackItems)
    return buybackItems
}

