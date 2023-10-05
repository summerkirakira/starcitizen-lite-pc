import Store from 'electron-store'


const store = new Store()


export function initialize() {
    checkUUID()
}


function checkUUID() {
    const uuid = store.get('uuid', null)

    console.log(uuid)

    if (!uuid) {
        const uuid = require('uuid').v4()
        store.set('uuid', require('uuid').v4())
    }
}
