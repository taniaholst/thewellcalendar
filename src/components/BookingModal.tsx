import React from 'react'

export type Slot = 'morning' | 'afternoon' | 'fullday'
export type DayBookings = {
    morning?: number
    afternoon?: number
    fullday?: number
}

type Props = {
    dateKey: string | null
    data: DayBookings | undefined
    onClose: () => void
    onBook: (slot: Slot) => void          // +1
    onDeleteOne: (slot: Slot) => void      // -1
}

export default function BookingModal({ dateKey, data, onClose, onBook, onDeleteOne }: Props) {
    if (!dateKey) return null
    const title = new Date(dateKey + 'T00:00:00').toDateString()

    const morningCount = data?.morning ?? 0
    const afternoonCount = data?.afternoon ?? 0
    const fullCount = data?.fullday ?? 0

    return (
        <div className="modal open" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal-content">
                <button className="close" onClick={onClose} aria-label="Close">×</button>
                <h3>{title}</h3>

                <div className="current-bookings">
                    <h4>Current bookings</h4>
                    <ul className="current-list">
                        <li>
                            Morning: <strong>{morningCount}</strong>
                            {morningCount > 0 && <button className="link danger" onClick={() => onDeleteOne('morning')}>-1</button>}
                        </li>
                        <li>
                            Afternoon: <strong>{afternoonCount}</strong>
                            {afternoonCount > 0 && <button className="link danger" onClick={() => onDeleteOne('afternoon')}>-1</button>}
                        </li>
                        <li>
                            Full day: <strong>{fullCount}</strong>
                            {fullCount > 0 && <button className="link danger" onClick={() => onDeleteOne('fullday')}>-1</button>}
                        </li>
                    </ul>
                </div>

                <div className="booking-options">
                    <button className="booking-btn" onClick={() => onBook('morning')}>+1 Morning</button>
                    <button className="booking-btn" onClick={() => onBook('afternoon')}>+1 Afternoon</button>
                    <button className="booking-btn" onClick={() => onBook('fullday')}>+1 Full day</button>
                </div>
            </div>
        </div>
    )
}