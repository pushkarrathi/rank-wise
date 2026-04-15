"""
Pydantic models for request/response validation.
"""

from pydantic import BaseModel, Field
from typing import Optional, List


class PredictionRequest(BaseModel):
    """Input from the user form."""
    rank: int = Field(..., gt=0, description="JEE rank")
    exam_type: str = Field(..., description="JEE Main or Advanced")
    category: str = Field(..., description="General, OBC, SC, ST, EWS")
    preferred_branch: str = Field(..., description="Preferred branch like CSE, ECE, etc.")
    preferred_region: str = Field(default="Any", description="North, South, East, West, Any")
    max_fee: Optional[int] = Field(default=None, description="Maximum fee range (optional)")
    campus_preference: str = Field(default="No preference", description="Large / Small / No preference")
    food_preference: str = Field(default="No preference", description="Veg only / Non-veg ok / No preference")


class CollegeResult(BaseModel):
    """A single college result with scoring details."""
    college_name: str
    branch: str
    opening_rank: int
    closing_rank: int
    region: str
    average_fees: int
    campus_size: str
    food_option: str
    score: float = Field(..., ge=0.0, le=1.0)
    classification: str  # Dream, Safe, or Backup
    match_level: str  # High Match, Medium Match, Low Match
    reason: str  # Human-readable explanation


class PredictionResponse(BaseModel):
    """Full prediction response with categorized results."""
    dream: List[CollegeResult] = []
    safe: List[CollegeResult] = []
    backup: List[CollegeResult] = []
    total_matches: int = 0
