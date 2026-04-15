import { useState } from 'react';

const BRANCHES = ['CSE', 'ECE', 'Electrical', 'Mechanical', 'Civil', 'Chemical'];
const CATEGORIES = ['General', 'OBC', 'SC', 'ST', 'EWS'];
const REGIONS = ['Any', 'North', 'South', 'East', 'West'];

function InputForm({ onSubmit, loading }) {
  const [formData, setFormData] = useState({
    rank: '',
    exam_type: 'Main',
    category: 'General',
    preferred_branch: 'CSE',
    preferred_region: 'Any',
    max_fee: '',
    campus_preference: 'No preference',
    food_preference: 'No preference',
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.rank || parseInt(formData.rank) <= 0) return;

    const payload = {
      ...formData,
      rank: parseInt(formData.rank),
      max_fee: formData.max_fee ? parseInt(formData.max_fee) : null,
    };

    onSubmit(payload);
  };

  return (
    <form className="form-container" onSubmit={handleSubmit} id="prediction-form">
      <h2 className="form-title">🔍 Enter Your Details</h2>
      <p className="form-subtitle">Fill in your JEE rank and preferences to get personalized college recommendations</p>

      <div className="form-grid">
        {/* JEE Rank */}
        <div className="form-group">
          <label className="form-label" htmlFor="rank-input">JEE Rank</label>
          <input
            type="number"
            id="rank-input"
            className="form-input"
            placeholder="e.g. 5000"
            min="1"
            value={formData.rank}
            onChange={(e) => handleChange('rank', e.target.value)}
            required
          />
        </div>

        {/* Exam Type */}
        <div className="form-group">
          <label className="form-label">Exam Type</label>
          <div className="radio-group">
            {['Main', 'Advanced'].map(type => (
              <div className="radio-option" key={type}>
                <input
                  type="radio"
                  id={`exam-${type}`}
                  name="exam_type"
                  value={type}
                  checked={formData.exam_type === type}
                  onChange={(e) => handleChange('exam_type', e.target.value)}
                />
                <label className="radio-label" htmlFor={`exam-${type}`}>
                  JEE {type}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Category */}
        <div className="form-group">
          <label className="form-label" htmlFor="category-select">Category</label>
          <select
            id="category-select"
            className="form-select"
            value={formData.category}
            onChange={(e) => handleChange('category', e.target.value)}
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Branch */}
        <div className="form-group">
          <label className="form-label" htmlFor="branch-select">Preferred Branch</label>
          <select
            id="branch-select"
            className="form-select"
            value={formData.preferred_branch}
            onChange={(e) => handleChange('preferred_branch', e.target.value)}
          >
            {BRANCHES.map(branch => (
              <option key={branch} value={branch}>{branch}</option>
            ))}
          </select>
        </div>

        {/* Region */}
        <div className="form-group">
          <label className="form-label" htmlFor="region-select">Preferred Region</label>
          <select
            id="region-select"
            className="form-select"
            value={formData.preferred_region}
            onChange={(e) => handleChange('preferred_region', e.target.value)}
          >
            {REGIONS.map(region => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>
        </div>

        {/* Max Fee */}
        <div className="form-group">
          <label className="form-label" htmlFor="fee-input">Max Fee Range (₹/year)</label>
          <input
            type="number"
            id="fee-input"
            className="form-input"
            placeholder="e.g. 300000 (optional)"
            min="0"
            value={formData.max_fee}
            onChange={(e) => handleChange('max_fee', e.target.value)}
          />
        </div>

        {/* Campus Preference */}
        <div className="form-group">
          <label className="form-label">Campus Preference</label>
          <div className="radio-group">
            {['Large campus', 'Small campus', 'No preference'].map(option => (
              <div className="radio-option" key={option}>
                <input
                  type="radio"
                  id={`campus-${option}`}
                  name="campus_preference"
                  value={option}
                  checked={formData.campus_preference === option}
                  onChange={(e) => handleChange('campus_preference', e.target.value)}
                />
                <label className="radio-label" htmlFor={`campus-${option}`}>
                  {option === 'Large campus' ? '🏛️ ' : option === 'Small campus' ? '🏠 ' : '🤷 '}
                  {option}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Food Preference */}
        <div className="form-group">
          <label className="form-label">Food Preference</label>
          <div className="radio-group">
            {['Veg only', 'Non-veg ok', 'No preference'].map(option => (
              <div className="radio-option" key={option}>
                <input
                  type="radio"
                  id={`food-${option}`}
                  name="food_preference"
                  value={option}
                  checked={formData.food_preference === option}
                  onChange={(e) => handleChange('food_preference', e.target.value)}
                />
                <label className="radio-label" htmlFor={`food-${option}`}>
                  {option === 'Veg only' ? '🥬 ' : option === 'Non-veg ok' ? '🍗 ' : '🤷 '}
                  {option}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="form-group full-width" style={{ alignItems: 'center' }}>
          <button type="submit" className="submit-btn" disabled={loading} id="predict-btn">
            {loading ? (
              <>
                <div className="spinner" />
                Analyzing Colleges...
              </>
            ) : (
              <>
                🚀 Predict Colleges
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}

export default InputForm;
