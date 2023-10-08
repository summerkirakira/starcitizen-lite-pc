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