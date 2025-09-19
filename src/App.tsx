import React, { useState } from 'react'
import Calendar from './components/Calendar'
import BookingModal, { DayBookings, Slot } from './components/BookingModal'


type MonthMap = Record<string, DayBookings> // key: YYYY-MM-DD

function startOfMonth(d: Date) { const x = new Date(d); x.setDate(1); x.setHours(0,0,0,0); return x }
const pad = (n: number) => String(n).padStart(2, '0')
const monthKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`
const storageKey = (d: Date) => `bookings:${monthKey(d)}`

function loadMonth(firstOfMonth: Date): MonthMap {
    try { return JSON.parse(localStorage.getItem(storageKey(firstOfMonth)) || '{}') }
    catch { return {} }
}
function saveMonth(firstOfMonth: Date, data: MonthMap) {
    localStorage.setItem(storageKey(firstOfMonth), JSON.stringify(data))
}

export default function App() {
    const [cursor, setCursor] = useState(() => startOfMonth(new Date()))
    const [monthMap, setMonthMap] = useState<MonthMap>(() => loadMonth(cursor))
    const [selected, setSelected] = useState<string | null>(null)

    const onPrev = () => {
        const next = new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1)
        setCursor(next); setMonthMap(loadMonth(next))
    }
    const onNext = () => {
        const next = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1)
        setCursor(next); setMonthMap(loadMonth(next))
    }

    function openDay(dateKey: string) { setSelected(dateKey) }
    function closeModal() { setSelected(null) }

    // increment by 1
    function book(slot: Slot) {
        if (!selected) return
        const copy: MonthMap = { ...monthMap, [selected]: { ...(monthMap[selected] || {}) } }
        const day = copy[selected]
        const current = (day as any)[slot] ?? 0

        // Conflict logic (optional): if booking full day, clear halves; if booking half when full exists, confirm replace.
        if (slot === 'fullday' && ((day.morning ?? 0) > 0 || (day.afternoon ?? 0) > 0)) {
            if (!confirm('Morning/Afternoon already booked. Replace with Full day count?')) return
            delete day.morning
            delete day.afternoon
        } else if (slot !== 'fullday' && (day.fullday ?? 0) > 0) {
            if (!confirm('Full day already booked. Replace with selected half-day count?')) return
            delete day.fullday
        }

        (day as any)[slot] = current + 1
        setMonthMap(copy)
        saveMonth(cursor, copy)
    }

    // decrement by 1
    function deleteOne(slot: Slot) {
        if (!selected) return
        const copy: MonthMap = { ...monthMap, [selected]: { ...(monthMap[selected] || {}) } }
        const day = copy[selected]
        const current = (day as any)[slot] ?? 0
        const next = Math.max(0, current - 1)
        if (next === 0) {
            delete (day as any)[slot]
            if (!Object.keys(day).length) delete copy[selected]
        } else {
            (day as any)[slot] = next
        }
        setMonthMap(copy)
        saveMonth(cursor, copy)
    }

    return (
        <>
            <header className="app-header">
                <h1>The Well Calendar</h1>
                <p>Counts per slot; Morning/Afternoon labels; no names</p>
            </header>

            <main>
                <Calendar
                    cursor={cursor}
                    monthMap={monthMap}
                    onPrev={onPrev}
                    onNext={onNext}
                    onDayClick={openDay}
                />

                <section className="legend">
                    <div className="legend-item"><span className="legend-swatch morning" /> Morning</div>
                    <div className="legend-item"><span className="legend-swatch afternoon" /> Afternoon</div>
                    <div className="legend-item"><span className="legend-swatch fullday" /> Full day</div>
                </section>
            </main>

            <BookingModal
                dateKey={selected}
                data={selected ? monthMap[selected] : undefined}
                onClose={closeModal}
                onBook={book}
                onDeleteOne={deleteOne}
            />
        </>
    )
}