export interface BillingItem {
    id:string,
    status: string,
    fullfillment: boolean,
    time: string,
    total: number,
    item_price: number,
    tax: number,
    credit_used: number,
    items: {
        name: string,
        price: number,
        quantity: number,
        total: number,
        discount: number
    }
}

function parseDate(date_str: string): Date {
    const date = new Date(date_str.trim())
    return date
}