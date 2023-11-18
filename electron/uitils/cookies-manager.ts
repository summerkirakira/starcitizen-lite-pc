export function getCookie(): string {
    let cookie = "CookieConsent={stamp:%27-1%27%2Cnecessary:true%2Cpreferences:true%2Cstatistics:true%2Cmarketing:true%2Cmethod:%27implied%27%2Cver:1%2Cutc:1695456095624%2Cregion:%27CN%27};";
    if (window.webSettings.rsi_device.length != 0) {
        cookie += ` _rsi_device=${window.webSettings.rsi_device};`;
    }
    if (window.webSettings.rsi_token.length != 0) {
        cookie += ` Rsi-Token=${window.webSettings.rsi_token};`;
    }
    return cookie;
}

export function getSessionCookies() {
    const rsi_device = window.webSettings.rsi_device
    const rsi_token = window.webSettings.rsi_token
    console.log(rsi_device, rsi_token)
    const cookies = [
        {
            url: 'https://robertsspaceindustries.com',
            name: '_rsi_device',
            value: rsi_device,
            domain: '.robertsspaceindustries.com',
            path: '/',
            secure: true,
            httpOnly: false,
            sameSite: 'no_restriction',
        },
        {
            url: 'https://robertsspaceindustries.com',
            name: 'Rsi-Token',
            value: rsi_token,
            domain: '.robertsspaceindustries.com',
            path: '/',
            secure: true,
            httpOnly: false,
            sameSite: 'no_restriction',
        },
        {
            url: 'https://robertsspaceindustries.com',
            name: 'CookieConsent',
            value: `{stamp:%27-1%27%2Cnecessary:true%2Cpreferences:true%2Cstatistics:true%2Cmarketing:true%2Cmethod:%27implied%27%2Cver:1%2Cutc:1695456095624%2Cregion:%27CN%27}`,
            domain: '.robertsspaceindustries.com',
            path: '/',
            secure: true,
            httpOnly: false,
            sameSite: 'no_restriction',
        }
    ]
    return cookies
}