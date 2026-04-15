"""
Scoring engine — filters, scores, and classifies colleges for a given user profile.
"""

from models import PredictionRequest, CollegeResult

# Related branches for partial matching
RELATED_BRANCHES = {
    "CSE": ["ECE", "Electrical"],
    "ECE": ["CSE", "Electrical"],
    "Electrical": ["ECE", "CSE"],
    "Mechanical": ["Civil"],
    "Civil": ["Mechanical"],
    "Chemical": ["Mechanical"],
}


def compute_branch_score(preferred: str, college_branch: str) -> float:
    """1.0 for exact match, 0.5 for related branch, 0.0 otherwise."""
    if preferred.lower() == college_branch.lower():
        return 1.0
    related = RELATED_BRANCHES.get(preferred, [])
    if college_branch in related:
        return 0.5
    return 0.0


def compute_region_score(preferred: str, college_region: str) -> float:
    """1.0 for exact match, 0.5 for 'Any', 0.0 otherwise."""
    if preferred == "Any":
        return 0.5
    if preferred.lower() == college_region.lower():
        return 1.0
    return 0.0


def compute_cutoff_safety(rank: int, opening_rank: int, closing_rank: int) -> float:
    """
    How safely the rank fits within the cutoff range.
    Higher = rank is well within closing rank (more margin).
    """
    if closing_rank == opening_rank:
        return 0.5
    # Normalize: 1.0 means rank equals opening (dream), 0.0 means rank equals closing
    safety = (closing_rank - rank) / (closing_rank - opening_rank)
    return max(0.0, min(1.0, safety))


def compute_campus_score(preferred: str, college_campus: str) -> float:
    """1.0 for exact match, 0.5 for no preference, 0.0 otherwise."""
    if preferred == "No preference":
        return 0.5
    mapping = {"Large campus": "large", "Small campus": "small", "Medium campus": "medium"}
    pref_val = mapping.get(preferred, preferred.lower())
    if pref_val == college_campus.lower():
        return 1.0
    return 0.0


def compute_food_score(preferred: str, college_food: str) -> float:
    """1.0 for match, 0.5 for no preference or mixed, 0.0 otherwise."""
    if preferred == "No preference":
        return 0.5
    if preferred == "Veg only" and college_food in ("veg", "mixed"):
        return 1.0 if college_food == "veg" else 0.7
    if preferred == "Non-veg ok":
        return 1.0 if college_food in ("non-veg", "mixed") else 0.3
    return 0.0


def classify_college(rank: int, opening_rank: int, closing_rank: int) -> str:
    """
    Classify based on where the rank falls in the cutoff range.
    Dream: rank is near opening (top 30% of range)
    Safe: rank is in the middle
    Backup: rank is near closing (bottom 30% of range)
    """
    if closing_rank == opening_rank:
        return "Safe"

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


def build_reason(request: PredictionRequest, college: dict, classification: str, score: float) -> str:
    """Generate a human-readable reason for the recommendation."""
    reasons = []

    # Branch match
    if request.preferred_branch.lower() == college["branch"].lower():
        reasons.append(f"Exact branch match ({college['branch']})")
    elif college["branch"] in RELATED_BRANCHES.get(request.preferred_branch, []):
        reasons.append(f"Related branch ({college['branch']})")

    # Region
    if request.preferred_region == "Any":
        reasons.append(f"Located in {college['region']} India")
    elif request.preferred_region.lower() == college["region"].lower():
        reasons.append(f"Matches your preferred region ({college['region']})")

    # Classification context
    if classification == "Dream":
        reasons.append("Your rank is well within the cutoff — aspirational pick")
    elif classification == "Safe":
        reasons.append("Comfortable rank margin — solid choice")
    else:
        reasons.append("Rank is close to cutoff — good backup option")

    # Fees
    if request.max_fee and college["average_fees"] <= request.max_fee:
        reasons.append(f"Within your fee budget (₹{college['average_fees']:,})")

    return ". ".join(reasons) + "."


def predict_colleges(request: PredictionRequest, colleges: list) -> dict:
    """
    Main prediction pipeline:
    1. Filter eligible colleges (rank <= closing_rank)
    2. Optionally filter by max fee
    3. Score each college
    4. Classify into Dream / Safe / Backup
    5. Return sorted results
    """
    results = {"dream": [], "safe": [], "backup": []}

    for college in colleges:
        # Step 1: Filter by rank eligibility
        if request.rank > college["closing_rank"]:
            continue

        # Step 2: Filter by max fee (if specified)
        if request.max_fee and college["average_fees"] > request.max_fee:
            continue

        # Step 3: Compute weighted score
        branch_score = compute_branch_score(request.preferred_branch, college["branch"])
        region_score = compute_region_score(request.preferred_region, college["region"])
        cutoff_safety = compute_cutoff_safety(request.rank, college["opening_rank"], college["closing_rank"])
        campus_score = compute_campus_score(request.campus_preference, college["campus_size"])
        food_score = compute_food_score(request.food_preference, college["food_option"])

        total_score = (
            0.40 * branch_score +
            0.20 * region_score +
            0.15 * cutoff_safety +
            0.15 * campus_score +
            0.10 * food_score
        )
        total_score = round(total_score, 3)

        # Step 4: Classify
        classification = classify_college(request.rank, college["opening_rank"], college["closing_rank"])
        match_level = get_match_level(total_score)

        # Step 5: Build reason
        reason = build_reason(request, college, classification, total_score)

        result = CollegeResult(
            college_name=college["college_name"],
            branch=college["branch"],
            opening_rank=college["opening_rank"],
            closing_rank=college["closing_rank"],
            region=college["region"],
            average_fees=college["average_fees"],
            campus_size=college["campus_size"],
            food_option=college["food_option"],
            score=total_score,
            classification=classification,
            match_level=match_level,
            reason=reason,
        )

        results[classification.lower()].append(result)

    # Sort each category by score descending
    for key in results:
        results[key].sort(key=lambda x: x.score, reverse=True)

    return results
