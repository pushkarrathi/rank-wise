"""
Database module — SQLite setup and data access layer.
Loads real JoSAA college data from CSVs and provides query functions.
"""

import sqlite3
import csv
import os
import glob

DB_PATH = os.path.join(os.path.dirname(__file__), "rank_wise.db")
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")


def get_connection():
    """Get a new SQLite connection with row factory."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Create tables and seed data from CSV files."""
    conn = get_connection()
    cursor = conn.cursor()

    # Create colleges table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS colleges (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            institute TEXT NOT NULL,
            program TEXT NOT NULL,
            quota TEXT NOT NULL,
            seat_type TEXT NOT NULL,
            gender TEXT NOT NULL,
            opening_rank INTEGER NOT NULL,
            closing_rank INTEGER NOT NULL,
            round INTEGER NOT NULL
        )
    """)

    # Check if data already exists
    cursor.execute("SELECT COUNT(*) FROM colleges")
    count = cursor.fetchone()[0]

    if count == 0:
        print("[INFO] Seeding database from CSVs...")
        inserted = 0
        csv_files = glob.glob(os.path.join(DATA_DIR, "2024_Round_*.csv"))
        for file_path in csv_files:
            # Extract round number from filename (e.g., 2024_Round_1.csv -> 1)
            filename = os.path.basename(file_path)
            try:
                round_no = int(filename.split('_')[-1].split('.')[0])
            except ValueError:
                continue

            with open(file_path, "r", encoding="utf-8") as f:
                reader = csv.reader(f)
                next(reader)  # Skip header
                for row in reader:
                    if len(row) < 7:
                        continue
                    
                    try:
                        opening_rank = int(row[5].replace('P', ''))
                        closing_rank = int(row[6].replace('P', ''))
                    except ValueError:
                        continue

                    cursor.execute("""
                        INSERT INTO colleges 
                        (institute, program, quota, seat_type, gender, opening_rank, closing_rank, round)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        row[0].strip(),
                        row[1].strip(),
                        row[2].strip(),
                        row[3].strip(),
                        row[4].strip(),
                        opening_rank,
                        closing_rank,
                        round_no
                    ))
                    inserted += 1

        conn.commit()
        print(f"[OK] Seeded {inserted} college entries into database.")
    else:
        print(f"[INFO] Database already has {count} entries, skipping seed.")

    conn.close()


def get_colleges(round_no: int, seat_type: str, gender: str, quota: str):
    """Fetch colleges matching the given round, seat type, gender, and quota."""
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT * FROM colleges 
        WHERE round = ? AND seat_type = ? AND gender = ? AND quota = ?
    """, (round_no, seat_type, gender, quota))

    rows = cursor.fetchall()
    conn.close()

    # Convert Row objects to dicts
    return [dict(row) for row in rows]


def get_all_programs():
    """Return a distinct list of programs available."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT DISTINCT program FROM colleges ORDER BY program")
    programs = [row[0] for row in cursor.fetchall()]
    conn.close()
    return programs

def get_all_institutes():
    """Return a distinct list of institutes available."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT DISTINCT institute FROM colleges ORDER BY institute")
    institutes = [row[0] for row in cursor.fetchall()]
    conn.close()
    return institutes
