function CollegeCard({ college }) {
  const classLower = college.classification.toLowerCase();

  const matchClass = college.match_level === 'High Match'
    ? 'high'
    : college.match_level === 'Medium Match'
    ? 'medium'
    : 'low';

  const scorePercent = Math.round(college.score * 100);

  return (
    <div className={`college-card ${classLower}`}>
      {/* Top: Name + Badge */}
      <div className="card-top">
        <h3 className="college-name">{college.college_name}</h3>
        <span className={`classification-badge ${classLower}`}>
          {college.classification}
        </span>
      </div>

      {/* Detail chips */}
      <div className="card-details">
        <span className="detail-chip">
          <span className="detail-chip-icon">📚</span>
          {college.branch}
        </span>
        <span className="detail-chip">
          <span className="detail-chip-icon">🎯</span>
          Closing: {college.closing_rank.toLocaleString()}
        </span>
        <span className="detail-chip">
          <span className="detail-chip-icon">📍</span>
          {college.region}
        </span>
        <span className="detail-chip">
          <span className="detail-chip-icon">💰</span>
          ₹{college.average_fees.toLocaleString()}/yr
        </span>
        <span className="detail-chip">
          <span className="detail-chip-icon">🏛️</span>
          {college.campus_size}
        </span>
        <span className="detail-chip">
          <span className="detail-chip-icon">🍽️</span>
          {college.food_option}
        </span>
      </div>

      {/* Score bar */}
      <div className="score-section">
        <div className="score-header">
          <span className="score-label">Match Score</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className={`match-badge ${matchClass}`}>
              {college.match_level}
            </span>
            <span className="score-value" style={{ color: `var(--${matchClass === 'high' ? 'safe' : matchClass === 'medium' ? 'backup' : 'low-match'}-color)` }}>
              {scorePercent}%
            </span>
          </div>
        </div>
        <div className="score-bar">
          <div
            className={`score-fill ${matchClass}`}
            style={{ width: `${scorePercent}%` }}
          />
        </div>
      </div>

      {/* Reason */}
      <div className="card-reason">
        💡 {college.reason}
      </div>
    </div>
  );
}

export default CollegeCard;
