import Store from 'electron-store';

const store = new Store()

interface BillingSubItem {
    name: string,
    price: number,
    quantity: number,
    total: number,
    discount: number
}

export interface BillingItem {
    id:string,
    status: string,
    time: string,
    total: number,
    total_before_tax: number,
    credit_used: number,
    discount: number,
    items: BillingSubItem[]
}

function parseDate(date_str: string): Date {
    const date = new Date(date_str.trim())
    return date
}

function parseSpan(title: string, content: string): string {
    if (content.includes(title)) {
        return content.replace(title, '').replace('\n', '').trim()
    }
}

function parsePrice(price_str: string): number {
    const price = parseFloat(price_str.replace('$', '').replace(',', '').replace('USD', '').trim())
    return price * 100
}

function convertDomToBillingItem(dom: Element): BillingItem {
    const id = dom.querySelectorAll('.js-print-invoice')?.[0]?.getAttribute('data-order-slug') ?? '0'
    let time = dom.querySelectorAll('.col.date')?.[0]?.textContent?? ''
    time = parseSpan('Order Placed:', time)
    time = new Date(time).toString()
    let status = dom.querySelectorAll('.col.small')?.[0]?.textContent ?? ''
    status = parseSpan('Status:', status)
    let billing_summary = dom.querySelectorAll('.billing-summary')?.[0]
    let summary_items = billing_summary?.querySelectorAll('tr')
    const summarys = []
    if (summary_items === undefined) {
        return {
            id: id,
            status: status,
            time: time,
            total: 0,
            total_before_tax: 0,
            credit_used: 0,
            discount: 0,
            items: [] as any
        }
    }
    for (let i = 1; i < summary_items.length; i++) {
        let items = summary_items[i].querySelectorAll('td')
        const item_name = items[0].textContent ?? ''
        const item_price = items[1].textContent ?? ''
        const item_quantity = parseInt(items[2].textContent ?? '0')
        const discount = items[3].querySelector('span')?.textContent ?? ''
        const total = items[4].textContent ?? ''
        summarys.push({
            name: item_name,
            price: parsePrice(item_price),
            quantity: item_quantity,
            total: parsePrice(total),
            discount: parsePrice(discount)
        })
    }
    const discounts = dom.querySelectorAll('.discounted') ?? []
    let credit_used = 0
    let discount = 0
    if (discounts.length > 0) {
        if (discounts.length === 1) {
            credit_used = parsePrice(discounts[0].textContent ?? '')
        } else {
            discount = parsePrice(discounts[0].textContent ?? '')
            credit_used = parsePrice(discounts[1].textContent ?? '')
        }
    }
    let total_before_tax = dom.querySelectorAll('.s-row')?.[1]?.textContent ?? ''
    total_before_tax = parseSpan('Total before Tax:', total_before_tax)
    let total = dom.querySelectorAll('.s-row')?.[2]?.textContent ?? ''
    total = parseSpan('Total:', total)

    return {
        id: id,
        status: status,
        time: time,
        total: parsePrice(total),
        total_before_tax: parsePrice(total_before_tax),
        credit_used: credit_used,
        discount: discount,
        items: summarys as any
    }
}

function getBillingItems(billing_page: HTMLElement): BillingItem[] {
    const billing_list = billing_page.querySelector('.orders-item')
    const billings = billing_list?.querySelectorAll('li')
    const billing_items: BillingItem[] = []
    billings?.forEach((billing) => {
        const billing_item = convertDomToBillingItem(billing)
        if (billing_item.id == '0') {
            return
        }
        billing_items.push(billing_item)
    })
    return billing_items
}

function parseStringToHtml(html: string): HTMLElement {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    return doc.body
  }

export function parseHtmlToBillingItem(html: string): BillingItem[] {
    const dom = parseStringToHtml(html)
    return getBillingItems(dom)
}

export function getStoredBillingItems(): BillingItem[] {
    const billing_items = store.get('billing_items') as BillingItem[] ?? []
    return billing_items
}

export async function refreshBillingItems(): Promise<BillingItem[]> {
    let page = 1
    let url = `account/billing?page=${page}&pagesize=100`
    let response = await window.RsiApi.getPage(url)
    const hangar_items: BillingItem[] = []
    let items_on_page = parseHtmlToBillingItem(response)
    while (items_on_page.length > 0) {
        hangar_items.push(...items_on_page)
        page += 1
        url = `account/billing?page=${page}&pagesize=100`
        response = await window.RsiApi.getPage(url)
        items_on_page = parseHtmlToBillingItem(response)
    }
    store.set('billing_items', hangar_items)
    return hangar_items
}