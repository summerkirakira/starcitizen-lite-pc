"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setCookies = exports.setCookie = exports.removeCookie = exports.findCookies = void 0;
/**
 * Finds cookies that match a given filter within a cookie collection
 * @param sessionCookies The cookie collection to search in
 * @param filter The filters to search by
 * @returns A promise that resolves when the search operation is complete
 */
const findCookies = (sessionCookies, filter) => sessionCookies.get(filter);
exports.findCookies = findCookies;
/**
 * Removes a cookie with the given name from a cookie collection
 * @param sessionCookies The cookie collection ro remove from
 * @param url The url that the cookie pertains to
 * @param name The name of the cokie to remove
 * @returns A promise that resolves when the given cookie is removed
 */
const removeCookie = (sessionCookies, url, name) => sessionCookies.remove(url, name);
exports.removeCookie = removeCookie;
/**
 * Sets a new cookie in a given cookie collection
 * @param sessionCookies The cookie collection to add thenew cookie to
 * @param details The details of the cookie to set
 * @returns A promise that resolves when the cookie has been set
 */
const setCookie = (sessionCookies, details) => sessionCookies.set(details);
exports.setCookie = setCookie;
/**
 * Sets amultiple cookies in a given cookie collection
 * @param sessionCookies The cookie collection to add thenew cookie to
 * @param details The details of the cookie to set
 * @returns A promise that resolves when all cookies have been set
 */
const setCookies = (sessionCookies, cookies) => Promise.all(cookies.map((details) => (0, exports.setCookie)(sessionCookies, details)));
exports.setCookies = setCookies;
//# sourceMappingURL=electron-util.js.map