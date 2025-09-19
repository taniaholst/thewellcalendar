import type { MonthMap, Slot } from './types'

const pad = (n: number) => String(n).padStart(2, '0')
export const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
export const monthKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`

function loadMonth(key: string): MonthMap {
    try { return JSON.parse(localStorage.getItem('bookings:' + key) || '{}') } catch { return {} }
}
function saveMonth(key: string, data: MonthMap) {
    localStorage.setItem('bookings:' + key, JSON.stringify(data))
}

export const store = {
    async getMonth(firstOfMonth: Date): Promise<MonthMap> {
        return loadMonth(monthKey(firstOfMonth))
    },
    async upsert(dateKey: string, slot: Slot, name?: string) {
        const mk = dateKey.slice(0, 7)
        const data = loadMonth(mk)
        data[dateKey] = data[dateKey] || {}
        ;(data[dateKey] as any)[slot] = { name }
        saveMonth(mk, data)
    },
    async remove(dateKey: string, slot: Slot) {
        const mk = dateKey.slice(0, 7)
        const data = loadMonth(mk)
        if (data[dateKey]) {
            delete (data[dateKey] as any)[slot]
            if (!Object.keys(data[dateKey]).length) delete data[dateKey]
            saveMonth(mk, data)
        }
    },
    async clearMonth(firstOfMonth: Date) {
        localStorage.removeItem('bookings:' + monthKey(firstOfMonth))
    }
}