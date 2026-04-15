"""
Scoring engine — filters, scores, and classifies colleges for a given user profile.
"""

from models import PredictionRequest, CollegeResult

def compute_branch_score(preferred_branch: str, program_name: str) -> float:
    """Keyword matching on program name. Example: 'Computer Science' in 'Computer Science and Engineering' -> 1.0"""
    if preferred_branch.lower() == "any" or not preferred_branch:
        return 0.5
    
    # Simple matching (can be improved with fuzzing)
    if preferred_branch.lower() in program_name.lower():
        return 1.0
    return 0.0

def compute_institute_prestige(institute_name: str) -> float:
    """Give higher weight to IITs > NITs > IIITs > GFTIs"""
    name_lower = institute_name.lower()
    if "indian institute of technology" in name_lower and "information" not in name_lower:
        return 1.0
    elif "national institute of technology" in name_lower:
        return 0.8
    elif "indian institute of information technology" in name_lower:
        return 0.6
    else:
        return 0.4 # GFTIs or others

def compute_cutoff_safety(rank: int, opening_rank: int, closing_rank: int) -> float:
    """
    How safely the rank fits within the cutoff range.
    Higher = rank is well within closing rank (more margin).
    """
    if closing_rank == opening_rank:
        if rank <= closing_rank:
            return 1.0
        return 0.5
    
    if rank <= opening_rank:
        return 1.0
        
    safety = (closing_rank - rank) / (closing_rank - opening_rank)
    return max(0.0, min(1.0, safety))

def classify_college(rank: int, opening_rank: int, closing_rank: int) -> str:
    """
    Classify based on where the rank falls in the cutoff range.
    Dream: rank is near opening (top 30% of range)
    Safe: rank is in the middle
    Backup: rank is near closing (bottom 30% of range)
    """
    if closing_rank == opening_rank:
        return "Safe"

    if rank <= opening_rank:
        return "Safe" # Safe conceptually

    position = (closing_rank - rank) / (closing_rank - opening_rank)

    if position > 0.7:
        return "Dream"
    elif position < 0.3:
        return "Backup"
    else:
        return "Safe"

def get_match_level(score: float) -> str:
    """Convert numeric score to human-readable match level."""
    if score >= 0.7:
        return "High Match"
    elif score >= 0.45:
        return "Medium Match"
    else:
        return "Low Match"

def determine_institute_type(institute_name: str) -> str:
    name_lower = institute_name.lower()
    if "indian institute of technology" in name_lower and "information" not in name_lower:
        return "IIT"
    elif "national institute of technology" in name_lower:
        return "NIT"
    elif "indian institute of information technology" in name_lower:
        return "IIIT"
    else:
        return "GFTI"

def build_reason(request: PredictionRequest, college: dict, classification: str, score: float) -> str:
    """Generate a human-readable reason for the recommendation."""
    reasons = []

    # Branch match
    if request.preferred_branch.lower() != "any" and request.preferred_branch.strip():
        if request.preferred_branch.lower() in college["program"].lower():
            reasons.append("Matches preferred branch")
    
    # Classification context
    if classification == "Dream":
        reasons.append("Your rank is comfortably within the cutoff — aspirational pick")
    elif classification == "Safe":
        reasons.append("Comfortable rank margin — solid choice")
    else:
        reasons.append("Rank is close to cutoff — good backup option")

    return ". ".join(reasons) + "."

def predict_colleges(request: PredictionRequest, colleges: list) -> dict:
    """
    Main prediction pipeline:
    1. Filter eligible colleges (rank <= closing_rank)
    2. Filter by institute_type
    3. Filter by region and state
    4. Score each college
    5. Classify into Dream / Safe / Backup
    6. Return sorted results
    """
    results = {"dream": [], "safe": [], "backup": []}

    allowed_types = [t.lower() for t in request.institute_types] if request.institute_types else []

    pref_region = request.preferred_region.lower()
    pref_state = request.preferred_state.lower()

    for college in colleges:
        # Step 1: Filter by rank eligibility
        if request.rank > college["closing_rank"]:
            continue

        # Step 2: Institute Type filtering
        inst_type = determine_institute_type(college["institute"])
        if allowed_types and inst_type.lower() not in allowed_types:
            continue

        # Step 3: Region and State filtering
        if pref_region != "any" and college["region"].lower() != pref_region:
            continue
        if pref_state != "any" and college["state"].lower() != pref_state:
            continue

        # Step 4: Compute weighted score
        branch_score = compute_branch_score(request.preferred_branch, college["program"])
        safety_score = compute_cutoff_safety(request.rank, college["opening_rank"], college["closing_rank"])
        prestige_score = compute_institute_prestige(college["institute"])

        total_score = (
            0.40 * branch_score +
            0.30 * safety_score +
            0.30 * prestige_score
        )
        total_score = round(total_score, 3)

        # Step 5: Classify
        classification = classify_college(request.rank, college["opening_rank"], college["closing_rank"])
        match_level = get_match_level(total_score)

        # Step 6: Build reason
        reason = build_reason(request, college, classification, total_score)

        result = CollegeResult(
            institute=college["institute"],
            program=college["program"],
            quota=college["quota"],
            seat_type=college["seat_type"],
            gender=college["gender"],
            opening_rank=college["opening_rank"],
            closing_rank=college["closing_rank"],
            state=college["state"],
            region=college["region"],
            score=total_score,
            classification=classification,
            match_level=match_level,
            reason=reason,
            institute_type=inst_type,
        )

        results[classification.lower()].append(result)

    # Sort each category by score descending
    for key in results:
        results[key].sort(key=lambda x: x.score, reverse=True)

    return results
