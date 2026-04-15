import CollegeCard from './CollegeCard';

const SECTIONS = [
  {
    key: 'dream',
    label: 'Dream Colleges',
    icon: '🌟',
    description: 'Aspirational picks — your rank is near the top of the cutoff range',
  },
  {
    key: 'safe',
    label: 'Safe Colleges',
    icon: '✅',
    description: 'Solid choices — comfortable rank margin',
  },
  {
    key: 'backup',
    label: 'Backup Colleges',
    icon: '🛡️',
    description: 'Safety net — rank is close to the cutoff limit',
  },
];

function ResultsView({ results, onGenerateList }) {
  const totalMatches = results.total_matches || 0;

  return (
    <div className="results-container" id="results-section">
      {/* Results Header */}
      <div className="results-header">
        <div>
          <h2 className="results-title">
            📊 College Predictions
            <span className="results-count"> — {totalMatches} matches found</span>
          </h2>
        </div>
        {totalMatches > 0 && (
          <button
            className="generate-list-btn"
            onClick={onGenerateList}
            id="generate-list-btn"
          >
            📋 Generate JoSAA Preference List
          </button>
        )}
      </div>

      {totalMatches === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">😔</div>
          <div className="empty-title">No Matching Colleges Found</div>
          <div className="empty-subtitle">
            Try adjusting your rank, category, or preferences to see more results
          </div>
        </div>
      ) : (
        SECTIONS.map(section => {
          const colleges = results[section.key] || [];
          return (
            <div className="category-section" key={section.key} id={`section-${section.key}`}>
              <div className="category-header">
                <div className={`category-icon ${section.key}`}>
                  {section.icon}
                </div>
                <div>
                  <div className="category-name">{section.label}</div>
                </div>
                <span className={`category-count ${section.key}`}>
                  {colleges.length}
                </span>
              </div>

              {colleges.length > 0 ? (
                <div className="cards-grid">
                  {colleges.map((college, idx) => (
                    <CollegeCard key={`${section.key}-${idx}`} college={college} />
                  ))}
                </div>
              ) : (
                <div className="no-results-msg">
                  No {section.key} colleges found for your profile
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

export default ResultsView;
