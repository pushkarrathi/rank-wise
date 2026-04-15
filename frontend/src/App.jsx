import { useState, useEffect } from 'react';
import axios from 'axios';
import InputForm from './components/InputForm';
import ResultsView from './components/ResultsView';
import PreferenceList from './components/PreferenceList';
import './App.css';

const API_BASE = 'http://localhost:8000';

function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('rankwise-theme') || 'light';
  });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPreferenceList, setShowPreferenceList] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('rankwise-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handlePredict = async (formData) => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await axios.post(`${API_BASE}/predict`, formData);
      setResults(response.data);
    } catch (err) {
      console.error('Prediction failed:', err);
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Failed to connect to the server. Make sure the backend is running on port 8000.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Flatten all results for preference list
  const allResults = results
    ? [...results.dream, ...results.safe, ...results.backup].sort((a, b) => b.score - a.score)
    : [];

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <div className="logo-icon">🎓</div>
            <div>
              <h1>Rank Wise</h1>
              <div className="logo-subtitle">Smart JEE College Predictor & Preference Builder</div>
            </div>
          </div>
          <button className="theme-toggle" onClick={toggleTheme} id="theme-toggle-btn">
            <span className="theme-toggle-icon">{theme === 'light' ? '🌙' : '☀️'}</span>
            {theme === 'light' ? 'Dark' : 'Light'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {/* Input Form */}
        <InputForm onSubmit={handlePredict} loading={loading} />

        {/* Error Message */}
        {error && (
          <div className="form-container" style={{ borderColor: '#dc2626', background: 'rgba(220, 38, 38, 0.05)' }}>
            <p style={{ color: '#dc2626', fontWeight: 500, fontSize: '0.9rem' }}>⚠️ {error}</p>
          </div>
        )}

        {/* Results */}
        {results && (
          <ResultsView
            results={results}
            onGenerateList={() => setShowPreferenceList(true)}
          />
        )}

        {/* Empty state when no results yet */}
        {!results && !loading && !error && (
          <div className="empty-state">
            <div className="empty-icon">🏫</div>
            <div className="empty-title">Find Your Perfect College</div>
            <div className="empty-subtitle">
              Enter your JEE rank and preferences above to get personalized college recommendations
            </div>
          </div>
        )}
      </main>

      {/* Preference List Modal */}
      {showPreferenceList && (
        <PreferenceList
          colleges={allResults}
          onClose={() => setShowPreferenceList(false)}
        />
      )}
    </div>
  );
}

export default App;
