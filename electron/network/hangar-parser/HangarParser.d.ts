export interface ContainItem {
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