"""
Pydantic models for request/response validation.
"""

from pydantic import BaseModel, Field
from typing import Optional, List


class PredictionRequest(BaseModel):
    """Input from the user form."""
    rank: int = Field(..., gt=0, description="JEE rank")
    round_no: int = Field(default=5, ge=1, le=5, description="Which round (1-5), default last round")
    seat_type: str = Field(..., description="OPEN, EWS, OBC-NCL, SC, ST")
    gender: str = Field(..., description="Gender-Neutral or Female-only")
    quota: str = Field(default="AI", description="AI, HS, OS, etc.")
    preferred_branch: str = Field(default="Any", description="Keyword filter on program name")
    institute_types: List[str] = Field(default=[], description="Filter: IIT, NIT, IIIT, GFTI")


class CollegeResult(BaseModel):
    """A single college result with scoring details."""
    institute: str
    program: str
    quota: str
    seat_type: str
    gender: str
    opening_rank: int
    closing_rank: int
    score: float = Field(..., ge=0.0, le=1.0)
    classification: str  # Dream, Safe, Backup
    match_level: str  # High Match, Medium Match, Low Match
    reason: str 
    institute_type: str  # IIT, NIT, IIIT, GFTI


class PredictionResponse(BaseModel):
    """Full prediction response with categorized results."""
    dream: List[CollegeResult] = []
    safe: List[CollegeResult] = []
    backup: List[CollegeResult] = []
    total_matches: int = 0
