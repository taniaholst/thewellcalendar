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
    myVoted: { morning?: boolean; afternoon?: boolean; fullday?: boolean } | undefined
    onClose: () => void
    onBook: (slot: Slot) => void          // +1 (only if not yet voted by me)
    onUndo: (slot: Slot) => void          // -1 (only if I previously voted)
}

export default function BookingModal({ dateKey, data, myVoted, onClose, onBook, onUndo }: Props) {
    if (!dateKey) return null
    const title = new Date(dateKey + 'T00:00:00').toDateString()

    const morningCount = data?.morning ?? 0
    const afternoonCount = data?.afternoon ?? 0
    const fullCount = data?.fullday ?? 0

    const votedMorning = !!myVoted?.morning
    const votedAfternoon = !!myVoted?.afternoon
    const votedFull = !!myVoted?.fullday

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
                            {votedMorning
                                ? <button className="link danger" onClick={() => onUndo('morning')}>Undo</button>
                                : null}
                        </li>
                        <li>
                            Afternoon: <strong>{afternoonCount}</strong>
                            {votedAfternoon
                                ? <button className="link danger" onClick={() => onUndo('afternoon')}>Undo</button>
                                : null}
                        </li>
                        <li>
                            Full day: <strong>{fullCount}</strong>
                            {votedFull
                                ? <button className="link danger" onClick={() => onUndo('fullday')}>Undo</button>
                                : null}
                        </li>
                    </ul>
                </div>

                <div className="booking-options">
                    <button className="booking-btn" disabled={votedMorning} onClick={() => onBook('morning')}>
                        {votedMorning ? 'Voted' : '+1 Morning'}
                    </button>
                    <button className="booking-btn" disabled={votedAfternoon} onClick={() => onBook('afternoon')}>
                        {votedAfternoon ? 'Voted' : '+1 Afternoon'}
                    </button>
                    <button className="booking-btn" disabled={votedFull} onClick={() => onBook('fullday')}>
                        {votedFull ? 'Voted' : '+1 Full day'}
                    </button>
                </div>
            </div>
        </div>
    )
}