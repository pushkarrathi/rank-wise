"""
Database module — SQLite setup and data access layer.
Loads mock college data from JSON and provides query functions.
"""

import sqlite3
import json
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "college_predictor.db")
DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "colleges.json")


def get_connection():
    """Get a new SQLite connection with row factory."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Create tables and seed data from colleges.json."""
    conn = get_connection()
    cursor = conn.cursor()

    # Create colleges table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS colleges (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            college_name TEXT NOT NULL,
            branch TEXT NOT NULL,
            opening_rank INTEGER NOT NULL,
            closing_rank INTEGER NOT NULL,
            category TEXT NOT NULL,
            exam_type TEXT NOT NULL,
            region TEXT NOT NULL,
            average_fees INTEGER NOT NULL,
            campus_size TEXT NOT NULL,
            food_option TEXT NOT NULL
        )
    """)

    # Check if data already exists
    cursor.execute("SELECT COUNT(*) FROM colleges")
    count = cursor.fetchone()[0]

    if count == 0:
        # Load and insert mock data
        with open(DATA_PATH, "r", encoding="utf-8") as f:
            colleges = json.load(f)

        for c in colleges:
            cursor.execute("""
                INSERT INTO colleges 
                (college_name, branch, opening_rank, closing_rank, category, exam_type, region, average_fees, campus_size, food_option)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                c["college_name"],
                c["branch"],
                c["opening_rank"],
                c["closing_rank"],
                c["category"],
                c["exam_type"],
                c["region"],
                c["average_fees"],
                c["campus_size"],
                c["food_option"],
            ))

        conn.commit()
        print(f"[OK] Seeded {len(colleges)} college entries into database.")
    else:
        print(f"[INFO] Database already has {count} entries, skipping seed.")

    conn.close()


def get_colleges(exam_type: str, category: str):
    """Fetch colleges matching the given exam type and category."""
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT * FROM colleges 
        WHERE exam_type = ? AND category = ?
    """, (exam_type, category))

    rows = cursor.fetchall()
    conn.close()

    # Convert Row objects to dicts
    return [dict(row) for row in rows]


def get_all_branches():
    """Return a distinct list of branches available."""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT DISTINCT branch FROM colleges ORDER BY branch")
    branches = [row[0] for row in cursor.fetchall()]
    conn.close()
    return branches
