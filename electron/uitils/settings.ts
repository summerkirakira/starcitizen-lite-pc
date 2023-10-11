import Store from 'electron-store'
import { User } from '../database/DatabaseEntities'
import { GameStartUpSettings, RefugeSettings } from '../settings/refuge_settings'


const store = new Store()


export function getRefugeSettings(): RefugeSettings {
    return store.get('refuge_settings') as RefugeSettings
}

export function setRefugeSettings(settings: RefugeSettings) {
    store.set('refuge_settings', settings)
}

export function addUserToDatabase(new_user: User) {
    const users = store.get('users', []) as User[] 
    for (const user of users) {
        if (user.id === new_user.id) {
            return
        }
    }
    users.push(new_user)
    store.set('users', users)
}

export function getUsersFromDatabase(): User[] {
    return store.get('users', []) as User[]
}

export function removeUserFromDatabase(user: User) {
    const users = store.get('users', []) as User[]
    const new_users = users.filter((u) => {
        return u.id !== user.id
    })
    store.set('users', new_users)
}

export function getUserFromDatabase(id: number): User | null {
    const users = store.get('users', []) as User[]
    for (const user of users) {
        if (user.id === id) {
            return user
        }
    }
    return null
}