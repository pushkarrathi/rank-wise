# JEE College Predictor & JoSAA Preference Builder

A full-stack web application that helps JEE Main/Advanced students predict the best engineering colleges based on their rank, category, and personal preferences. Outputs a personalized, ordered college list suitable for JoSAA counselling.

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Python + FastAPI
- **Database**: SQLite

## Features

- **Rank-based filtering** — shows only colleges where your rank qualifies
- **Weighted scoring** — branch match (40%), region (20%), cutoff safety (15%), campus (15%), food preference (10%)
- **3-tier classification** — Dream / Safe / Backup colleges
- **JoSAA Preference List** — generate an ordered preference list with copy-to-clipboard
- **Dark / Light mode** toggle
- **Responsive card-based UI** with glassmorphism design

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+

### 1. Start the Backend

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available at `http://localhost:8000`. The SQLite database is auto-created and seeded on first startup.

### 2. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

## Usage

1. Enter your JEE rank
2. Select exam type (Main / Advanced), category, and preferences
3. Click **"Predict Colleges"**
4. View categorized results (Dream / Safe / Backup)
5. Click **"Generate JoSAA Preference List"** for an ordered list

## Project Structure

```
josaa/
├── backend/
│   ├── main.py              # FastAPI app + routes
│   ├── database.py          # SQLite setup + queries
│   ├── models.py            # Pydantic models
│   ├── scoring.py           # Scoring + classification logic
│   ├── requirements.txt     # Python dependencies
│   └── data/
│       └── colleges.json    # Mock dataset (35 entries)
│
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx          # Main app + theme toggle
        ├── App.css          # Design system
        └── components/
            ├── InputForm.jsx       # User preference form
            ├── ResultsView.jsx     # Dream/Safe/Backup sections
            ├── CollegeCard.jsx     # Result card component
            └── PreferenceList.jsx  # JoSAA ordered list modal
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/branches` | List available branches |
| `POST` | `/predict` | Get college predictions |

## License

MIT
