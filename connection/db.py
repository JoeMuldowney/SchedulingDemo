# db.py

import sqlite3
from datetime import datetime, timedelta, time


def get_connection():
    conn = sqlite3.connect("/app/data/timewise.db")
    # conn = sqlite3.connect("timewise.db")
    conn.row_factory = sqlite3.Row  # 👈 magic line
    return conn


def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS time_slots (
        id INTEGER PRIMARY KEY,
        date TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        is_booked INTEGER DEFAULT 0
    )
    """)

    conn.commit()
    conn.close()

# init values in the appointment table
def seed_slots():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("DELETE FROM time_slots")

    start_hour = 6
    end_hour = 12
    slot_minutes = 60

    base_date = datetime.now().date()

    slots = []
    weekday_count = 0
    day_offset = 0

    while weekday_count < 5:
        current_day = base_date + timedelta(days=day_offset)
        day_offset += 1

        if current_day.weekday() >= 5:
            continue

        weekday_count += 1
        date_str = current_day.isoformat()

        current_time = datetime.combine(current_day, time(start_hour, 0))
        end_limit = datetime.combine(current_day, time(end_hour, 0))

        while current_time < end_limit:
            start = current_time
            end = current_time + timedelta(minutes=slot_minutes)

            slots.append((
                date_str,
                start.time().isoformat(),
                end.time().isoformat(),
                0
            ))

            current_time = end

    cursor.executemany("""
    INSERT INTO time_slots (date, start_time, end_time, is_booked)
    VALUES (?, ?, ?, ?)
    """, slots)

    conn.commit()
    conn.close()

def get_available_slots():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT id, date, start_time, end_time
    FROM time_slots
    WHERE is_booked = 0
    """)

    rows = cursor.fetchall()

    results = [dict(row) for row in rows]

    conn.close()
    return results

def book_slot(slot_id):
    conn = get_connection()
    cursor = conn.cursor()

    # safety: only book if not already booked
    cursor.execute("""
        UPDATE time_slots
        SET is_booked = 1
        WHERE id = ? AND is_booked = 0
    """, (slot_id,))

    conn.commit()

    # check if anything was updated
    if cursor.rowcount == 0:
        conn.close()
        return False

    conn.close()
    return True