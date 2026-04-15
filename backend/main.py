"""
FastAPI application — Rank Wise API.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from database import init_db, get_colleges, get_all_programs, get_all_institutes
from models import PredictionRequest, PredictionResponse
from scoring import predict_colleges


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database on startup."""
    init_db()
    yield


app = FastAPI(
    title="Rank Wise API",
    description="Predicts best colleges based on JEE rank and preferences",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "message": "Rank Wise API is running"}


@app.get("/programs")
async def list_programs():
    """Return available programs."""
    programs = get_all_programs()
    return {"programs": programs}

@app.get("/institutes")
async def list_institutes():
    """Return available institutes."""
    institutes = get_all_institutes()
    return {"institutes": institutes}


@app.post("/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    """
    Main prediction endpoint.
    Accepts user rank + preferences, returns categorized college list.
    """
    valid_seat_types = ("OPEN", "EWS", "OBC-NCL", "SC", "ST", "OPEN (PwD)", "EWS (PwD)", "OBC-NCL (PwD)", "SC (PwD)", "ST (PwD)")
    if request.seat_type not in valid_seat_types:
        raise HTTPException(status_code=400, detail=f"seat_type must be one of {valid_seat_types}")

    valid_genders = ("Gender-Neutral", "Female-only (including Supernumerary)")
    if request.gender not in valid_genders:
        raise HTTPException(status_code=400, detail=f"gender must be one of {valid_genders}")

    valid_quotas = ("AI", "HS", "OS", "GO", "JK", "LA")
    if request.quota not in valid_quotas:
        raise HTTPException(status_code=400, detail=f"quota must be one of {valid_quotas}")

    colleges = get_colleges(request.round_no, request.seat_type, request.gender, request.quota)

    if not colleges:
        return PredictionResponse(dream=[], safe=[], backup=[], total_matches=0)

    # Run prediction engine
    results = predict_colleges(request, colleges)

    total = len(results["dream"]) + len(results["safe"]) + len(results["backup"])

    return PredictionResponse(
        dream=results["dream"],
        safe=results["safe"],
        backup=results["backup"],
        total_matches=total,
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
