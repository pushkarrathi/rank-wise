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
        <h3 className="college-name">{college.institute}</h3>
        <span className={`classification-badge ${classLower}`}>
          {college.classification}
        </span>
      </div>

      {/* Detail chips */}
      <div className="card-details">
        <span className="detail-chip" title={college.program}>
          <span className="detail-chip-icon">📚</span>
          {college.program.length > 50 ? college.program.substring(0, 47) + '...' : college.program}
        </span>
        <span className="detail-chip" title="Institute Type">
          <span className="detail-chip-icon">🏫</span>
          {college.institute_type}
        </span>
        <span className="detail-chip" title="Opening & Closing Rank">
          <span className="detail-chip-icon">🎯</span>
          {college.opening_rank.toLocaleString()} → {college.closing_rank.toLocaleString()}
        </span>
        <span className="detail-chip" title="Quota">
          <span className="detail-chip-icon">📍</span>
          Quota: {college.quota}
        </span>
        <span className="detail-chip" title="Seat Type & Gender">
          <span className="detail-chip-icon">📋</span>
          {college.seat_type} ({college.gender === 'Gender-Neutral' ? 'GN' : 'Female'})
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
