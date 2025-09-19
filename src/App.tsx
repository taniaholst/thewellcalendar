import React, { useState } from "react";
import Calendar from "./components/Calendar";
import BookingModal, { DayBookings, Slot } from "./components/BookingModal";

type MonthMap = Record<string, DayBookings>; // key: YYYY-MM-DD
type MyVotes = Record<
    string,
    { morning?: boolean; afternoon?: boolean; fullday?: boolean }
>; // per dateKey

function startOfMonth(d: Date) {
    const x = new Date(d);
    x.setDate(1);
    x.setHours(0, 0, 0, 0);
    return x;
}
const pad = (n: number) => String(n).padStart(2, "0");
const monthKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
const storageKey = (d: Date) => `bookings:${monthKey(d)}`;
const votesKey = "myvotes"; // global per user

function loadMonth(firstOfMonth: Date): MonthMap {
    try {
        return JSON.parse(
            localStorage.getItem(storageKey(firstOfMonth)) || "{}",
        );
    } catch {
        return {};
    }
}
function saveMonth(firstOfMonth: Date, data: MonthMap) {
    localStorage.setItem(storageKey(firstOfMonth), JSON.stringify(data));
}

function loadMyVotes(): MyVotes {
    try {
        return JSON.parse(localStorage.getItem(votesKey) || "{}");
    } catch {
        return {};
    }
}
function saveMyVotes(data: MyVotes) {
    localStorage.setItem(votesKey, JSON.stringify(data));
}

export default function App() {
    const [cursor, setCursor] = useState(() => startOfMonth(new Date()));
    const [monthMap, setMonthMap] = useState<MonthMap>(() => loadMonth(cursor));
    const [myVotes, setMyVotes] = useState<MyVotes>(() => loadMyVotes());
    const [selected, setSelected] = useState<string | null>(null);

    const onPrev = () => {
        const next = new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1);
        setCursor(next);
        setMonthMap(loadMonth(next));
    };
    const onNext = () => {
        const next = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
        setCursor(next);
        setMonthMap(loadMonth(next));
    };

    function openDay(dateKey: string) {
        setSelected(dateKey);
    }
    function closeModal() {
        setSelected(null);
    }

    // +1 only if I haven't voted this slot yet
    function book(slot: Slot) {
        if (!selected) return;
        const my = { ...myVotes };
        const myForDay = { ...(my[selected] || {}) };

        if (myForDay[slot]) {
            alert(
                "You already voted for this slot on this day from this device.",
            );
            return;
        }

        const copy: MonthMap = {
            ...monthMap,
            [selected]: { ...(monthMap[selected] || {}) },
        };
        const day = copy[selected];
        const current = (day as any)[slot] ?? 0;

        // Optional conflict rules (keep them if you want Full-day to replace halves and vice versa)
        if (
            slot === "fullday" &&
            ((day.morning ?? 0) > 0 || (day.afternoon ?? 0) > 0)
        ) {
            if (
                !confirm(
                    "Morning/Afternoon already have votes. Replace with Full day count?",
                )
            )
                return;
            delete day.morning;
            delete day.afternoon;
        } else if (slot !== "fullday" && (day.fullday ?? 0) > 0) {
            if (
                !confirm(
                    "Full day already has votes. Replace with selected half-day count?",
                )
            )
                return;
            delete day.fullday;
        }

        (day as any)[slot] = current + 1;

        // mark my vote
        myForDay[slot] = true;
        my[selected] = myForDay;

        setMonthMap(copy);
        saveMonth(cursor, copy);
        setMyVotes(my);
        saveMyVotes(my);
    }

    // -1 only if I had voted this slot
    function undo(slot: Slot) {
        if (!selected) return;
        const my = { ...myVotes };
        const myForDay = { ...(my[selected] || {}) };

        if (!myForDay[slot]) {
            alert("You can only undo your own vote from this device.");
            return;
        }

        const copy: MonthMap = {
            ...monthMap,
            [selected]: { ...(monthMap[selected] || {}) },
        };
        const day = copy[selected];
        const current = (day as any)[slot] ?? 0;
        const next = Math.max(0, current - 1);

        if (next === 0) {
            delete (day as any)[slot];
            if (!Object.keys(day).length) delete copy[selected];
        } else {
            (day as any)[slot] = next;
        }

        // clear my vote
        delete myForDay[slot];
        if (Object.keys(myForDay).length) {
            my[selected] = myForDay;
        } else {
            delete my[selected];
        }

        setMonthMap(copy);
        saveMonth(cursor, copy);
        setMyVotes(my);
        saveMyVotes(my);
    }

    const myVotedForSelected = selected ? myVotes[selected] : undefined;

    return (
        <>
            <header className="app-header">
                <h1>The Well Calendar</h1>
                <p>
                    Per-person vote limit: one +1 per slot per day (with undo)
                </p>
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
                    <div className="legend-item">
                        <span className="legend-swatch morning" /> Morning
                    </div>
                    <div className="legend-item">
                        <span className="legend-swatch afternoon" /> Afternoon
                    </div>
                    <div className="legend-item">
                        <span className="legend-swatch fullday" /> Full day
                    </div>
                </section>
            </main>

            <BookingModal
                dateKey={selected}
                data={selected ? monthMap[selected] : undefined}
                myVoted={myVotedForSelected}
                onClose={closeModal}
                onBook={book}
                onUndo={undo}
            />
        </>
    );
}
