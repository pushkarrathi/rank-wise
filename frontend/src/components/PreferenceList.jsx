import { useState } from 'react';

function PreferenceList({ colleges, onClose }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = colleges
      .map((c, i) => `${i + 1}. ${c.institute} (${c.state}, ${c.region}) — ${c.program} - ${c.quota} - ${c.seat_type} (Score: ${Math.round(c.score * 100)}%)`)
      .join('\n');

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      // Fallback for clipboard API failure
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content" id="preference-list-modal">
        {/* Header */}
        <div className="modal-header">
          <h3 className="modal-title">📋 Rank Wise Preference List</h3>
          <button className="modal-close" onClick={onClose} id="close-modal-btn">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {colleges.length === 0 ? (
            <div className="no-results-msg">No colleges to display</div>
          ) : (
            colleges.map((college, index) => (
              <div className="preference-item" key={index}>
                <div className="preference-rank">{index + 1}</div>
                <div className="preference-info">
                  <div className="preference-college">{college.institute} <span style={{ fontSize: '0.85em', color: '#666' }}>({college.state})</span></div>
                  <div className="preference-branch">
                    {college.program} · Quota: {college.quota} · closing: {college.closing_rank.toLocaleString()}
                  </div>
                </div>
                <div className="preference-score">
                  {Math.round(college.score * 100)}%
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="copy-btn" onClick={handleCopy} id="copy-list-btn">
            {copied ? '✅ Copied!' : '📋 Copy to Clipboard'}
          </button>
        </div>
      </div>

      {/* Toast notification */}
      {copied && (
        <div className="toast">
          ✅ Preference list copied to clipboard!
        </div>
      )}
    </div>
  );
}

export default PreferenceList;
