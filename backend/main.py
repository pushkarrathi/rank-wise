"""
FastAPI application — JEE College Predictor API.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from database import init_db, get_colleges, get_all_branches
from models import PredictionRequest, PredictionResponse
from scoring import predict_colleges


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database on startup."""
    init_db()
    yield


app = FastAPI(
    title="JEE College Predictor API",
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
    return {"status": "ok", "message": "JEE College Predictor API is running"}


@app.get("/branches")
async def list_branches():
    """Return available branches."""
    branches = get_all_branches()
    return {"branches": branches}


@app.post("/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    """
    Main prediction endpoint.
    Accepts user rank + preferences, returns categorized college list.
    """
    # Validate exam type
    if request.exam_type not in ("Main", "Advanced"):
        raise HTTPException(status_code=400, detail="exam_type must be 'Main' or 'Advanced'")

    # Validate category
    valid_categories = ("General", "OBC", "SC", "ST", "EWS")
    if request.category not in valid_categories:
        raise HTTPException(status_code=400, detail=f"category must be one of {valid_categories}")

    # Fetch eligible colleges from DB
    colleges = get_colleges(request.exam_type, request.category)

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
