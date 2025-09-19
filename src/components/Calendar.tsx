import React from 'react'

type DayBookings = {
    morning?: number
    afternoon?: number
    fullday?: number
}
type MonthMap = Record<string, DayBookings>

const WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const pad = (n: number) => String(n).padStart(2, '0')
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

function endOfMonth(d: Date) {
    const x = new Date(d)
    x.setMonth(x.getMonth() + 1, 0)
    x.setHours(23, 59, 59, 999)
    return x
}

type Props = {
    cursor: Date
    monthMap: MonthMap
    onPrev: () => void
    onNext: () => void
    onDayClick: (dateKey: string) => void
}

export default function Calendar({ cursor, monthMap, onPrev, onNext, onDayClick }: Props) {
    const blanks = new Date(cursor.getFullYear(), cursor.getMonth(), 1).getDay()
    const daysInMonth = endOfMonth(cursor).getDate()
    const todayKey = ymd(new Date())
    const monthLabel = cursor.toLocaleDateString('en', { month: 'long', year: 'numeric' })

    return (
        <div className="calendar-container">
            <div className="calendar-header">
                <button className="nav-btn" onClick={onPrev} aria-label="Previous month">&lt;</button>
                <h2 id="monthYear">{monthLabel}</h2>
                <button className="nav-btn" onClick={onNext} aria-label="Next month">&gt;</button>
            </div>

            <div className="calendar-weekdays">
                {WEEK.map(w => <div key={w} className="weekday">{w}</div>)}
            </div>

            <div className="calendar-grid">
                {Array.from({ length: blanks }).map((_, i) => <div key={'b'+i} className="day blank" />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1
                    const d = new Date(cursor.getFullYear(), cursor.getMonth(), day)
                    const key = ymd(d)
                    const isToday = key === todayKey
                    const data = monthMap[key] || {}

                    const morning = data.morning ?? 0
                    const afternoon = data.afternoon ?? 0
                    const fullday = data.fullday ?? 0

                    return (
                        <button key={key} className="day" onClick={() => onDayClick(key)}>
                            <div className={'day-number' + (isToday ? ' today' : '')}>{day}</div>
                            <div className="badges">
                                {morning > 0 && <span className="badge morning">Morning {morning}</span>}
                                {afternoon > 0 && <span className="badge afternoon">Afternoon {afternoon}</span>}
                                {fullday > 0 && <span className="badge fullday">Full {fullday}</span>}
                            </div>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}