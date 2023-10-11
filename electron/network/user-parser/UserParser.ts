import { User } from './../../database/DatabaseEntities';


function parseStringToHtml(html: string): HTMLElement {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    return doc.body
}

export async function getUser(login_id: number, email: string, password: string): Promise<User> {
    const user_page = parseStringToHtml(await window.RsiApi.getPage('account/referral-program'))
    const name = user_page.querySelector('.c-account-sidebar__profile-info-displayname').textContent
    const handle = user_page.querySelector('.c-account-sidebar__profile-info-handle').textContent
    const profile_image = user_page.querySelector('.c-account-sidebar__profile-metas-avatar').getAttribute('style').split("'")[1]
    const referral_code = user_page.querySelector('#share-referral-form > input[type=text]').getAttribute('value')
    const referral_count = parseInt(user_page.querySelector('#recruits-list-form > a:nth-child(2)').textContent.replace('Recruits (', '').replace(')', '').trim())
    const referral_prospects = parseInt(user_page.querySelector('#recruits-list-form > a.selected').textContent.replace('Prospects (', '').replace(')', '').trim())
    const usd = parseFloat(user_page.querySelector('#account-sidebar > div.c-account-sidebar__profile > div.c-account-sidebar__profile-info > div.c-account-sidebar__profile-info-credits > div:nth-child(1) > span.c-account-sidebar__profile-info-credits-amount.c-account-sidebar__profile-info-credits-amount--pledge').textContent.replace('$', '').replace(",", '').trim())
    const uec = parseInt(user_page.querySelector('#account-sidebar > div.c-account-sidebar__profile > div.c-account-sidebar__profile-info > div.c-account-sidebar__profile-info-credits > div:nth-child(2) > span.c-account-sidebar__profile-info-credits-amount.c-account-sidebar__profile-info-credits-amount--uec').textContent.replace("¤", '').replace("UEC", '').replace(",", '').trim())
    const rec = parseInt(user_page.querySelector('#account-sidebar > div.c-account-sidebar__profile > div.c-account-sidebar__profile-info > div.c-account-sidebar__profile-info-credits > div:nth-child(3) > span.c-account-sidebar__profile-info-credits-amount.c-account-sidebar__profile-info-credits-amount--rec').textContent.replace("¤", '').replace("REC", '').replace(",", '').trim())
    const hangar_value = 0

    const billing_page = parseStringToHtml(await window.RsiApi.getPage('account/billing'))

    const total_spent = parseFloat(billing_page.querySelector('#billing > div.content.inner-content.clearfix > div:nth-child(12) > em').textContent.replace('$', '').replace('USD', '').replace(",", '').trim())
    const is_concierge = billing_page.querySelector('.c-account-sidebar__links-link--concierge') != null
    const is_subscriber = billing_page.querySelector('.c-account-sidebar__links-link--subscriber') != null

    const personal_info_page = parseStringToHtml(await window.RsiApi.getPage(`citizens/${handle}`))
    const register_time = new Date(personal_info_page.querySelector('#public-profile > div.profile-content.overview-content.clearfix > div.left-col > div > p:nth-child(1) > strong').textContent.trim())
    const org_name = personal_info_page.querySelector('#public-profile > div.profile-content.overview-content.clearfix > div.box-content.profile-wrapper.clearfix > div > div.main-org.right-col.visibility-V > div > div.info > p:nth-child(1) > a')?.textContent ?? null
    const org_logo = personal_info_page.querySelector('#public-profile > div.profile-content.overview-content.clearfix > div.box-content.profile-wrapper.clearfix > div > div.main-org.right-col.visibility-V > div > div.thumb > a > img')?.getAttribute('src') ?? null
    const org_rank = personal_info_page.querySelector('#public-profile > div.profile-content.overview-content.clearfix > div.box-content.profile-wrapper.clearfix > div > div.main-org.right-col.visibility-V > div > div.info > p:nth-child(3) > strong')?.textContent ?? null

    return {
        id: Math.floor(Math.random() * 1000000000),
        name: name,
        login_id: login_id,
        email: email,
        password: password,
        rsi_token: window.webSettings.rsi_token,
        rsi_device: window.webSettings.rsi_device,
        handle: handle,
        profile_image: profile_image,
        referral_code: referral_code,
        referral_prospects: referral_prospects,
        referral_count: referral_count,
        usd: usd,
        uec: uec,
        rec: rec,
        hangar_value: hangar_value,
        total_spent: total_spent,
        is_concierge: is_concierge,
        is_subscriber: is_subscriber,
        register_time: register_time,
        org_name: org_name,
        org_logo: org_logo,
        org_rank: org_rank
    }
}