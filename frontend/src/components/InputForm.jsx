import { useState, useEffect } from 'react';
import axios from 'axios';

const SEAT_TYPES = ["OPEN", "EWS", "OBC-NCL", "SC", "ST", "OPEN (PwD)", "EWS (PwD)", "OBC-NCL (PwD)", "SC (PwD)", "ST (PwD)"];
const GENDERS = ["Gender-Neutral", "Female-only (including Supernumerary)"];
const QUOTAS = ["AI", "HS", "OS", "GO", "JK", "LA"];
const ROUNDS = [1, 2, 3, 4, 5];
const INSTITUTE_TYPES = ["IIT", "NIT", "IIIT", "GFTI"];
const REGIONS = ["Any", "North", "South", "East", "West"];
const STATES_MAP = {
  "Any": [],
  "North": ["Delhi", "Punjab", "Haryana", "Uttar Pradesh", "Uttarakhand", "Himachal Pradesh", "Jammu & Kashmir", "Chandigarh", "Rajasthan", "Madhya Pradesh"],
  "South": ["Tamil Nadu", "Karnataka", "Telangana", "Andhra Pradesh", "Kerala", "Puducherry"],
  "East": ["West Bengal", "Odisha", "Bihar", "Jharkhand", "Assam", "Meghalaya", "Mizoram", "Nagaland", "Tripura", "Arunachal Pradesh", "Sikkim", "Manipur", "Chhattisgarh"],
  "West": ["Maharashtra", "Gujarat", "Goa"]
};

function InputForm({ onSubmit, loading }) {
  const [formData, setFormData] = useState({
    rank: '',
    round_no: 5,
    seat_type: 'OPEN',
    gender: 'Gender-Neutral',
    quota: 'AI',
    preferred_branch: '',
    preferred_region: 'Any',
    preferred_state: 'Any',
    institute_types: {
      IIT: true,
      NIT: true,
      IIIT: true,
      GFTI: true,
    }
  });

  const [programs, setPrograms] = useState([]);

  useEffect(() => {
    // Fetch programs for autocomplete
    const fetchPrograms = async () => {
      try {
        const res = await axios.get('http://localhost:8000/programs');
        setPrograms(res.data.programs);
      } catch (e) {
        console.error("Failed to load programs", e);
      }
    };
    fetchPrograms();
  }, []);

  const handleChange = (field, value) => {
    if (field === 'preferred_region') {
      setFormData(prev => ({ ...prev, preferred_region: value, preferred_state: 'Any' }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleInstTypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      institute_types: {
        ...prev.institute_types,
        [type]: !prev.institute_types[type]
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.rank || parseInt(formData.rank) <= 0) return;

    // Convert institute_types object to array of selected strings
    const selectedInstTypes = Object.entries(formData.institute_types)
      .filter(([_, isSelected]) => isSelected)
      .map(([type, _]) => type);

    const payload = {
      ...formData,
      rank: parseInt(formData.rank),
      round_no: parseInt(formData.round_no),
      institute_types: selectedInstTypes
    };

    onSubmit(payload);
  };

  const availableStates = STATES_MAP[formData.preferred_region] || [];

  return (
    <form className="form-container" onSubmit={handleSubmit} id="prediction-form">
      <h2 className="form-title">🔍 Enter Your Details</h2>
      <p className="form-subtitle">Fill in your JEE rank and preferences to get personalized college recommendations</p>

      <div className="form-grid">
        {/* JEE Rank */}
        <div className="form-group">
          <label className="form-label" htmlFor="rank-input">JEE Rank (Category/CRL Rank)</label>
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

        {/* Round */}
        <div className="form-group">
          <label className="form-label" htmlFor="round-select">JoSAA Round</label>
          <select
            id="round-select"
            className="form-select"
            value={formData.round_no}
            onChange={(e) => handleChange('round_no', e.target.value)}
          >
            {ROUNDS.map(r => (
              <option key={r} value={r}>Round {r}</option>
            ))}
          </select>
        </div>

        {/* Seat Type */}
        <div className="form-group">
          <label className="form-label" htmlFor="seat-type-select">Seat Type</label>
          <select
            id="seat-type-select"
            className="form-select"
            value={formData.seat_type}
            onChange={(e) => handleChange('seat_type', e.target.value)}
          >
            {SEAT_TYPES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        
        {/* Gender */}
        <div className="form-group">
          <label className="form-label" htmlFor="gender-select">Gender</label>
          <select
            id="gender-select"
            className="form-select"
            value={formData.gender}
            onChange={(e) => handleChange('gender', e.target.value)}
          >
            {GENDERS.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        {/* Quota */}
        <div className="form-group">
          <label className="form-label" htmlFor="quota-select">Quota</label>
          <select
            id="quota-select"
            className="form-select"
            value={formData.quota}
            onChange={(e) => handleChange('quota', e.target.value)}
          >
            {QUOTAS.map(q => (
              <option key={q} value={q}>{q} {q === 'AI' ? '(All India)' : q === 'HS' ? '(Home State)' : q === 'OS' ? '(Other State)' : ''}</option>
            ))}
          </select>
        </div>

        {/* Preferred Branch */}
        <div className="form-group">
          <label className="form-label" htmlFor="branch-input">Preferred Branch (Keyword)</label>
          <input
            type="text"
            id="branch-input"
            className="form-input"
            placeholder="e.g. Computer Science, Any"
            value={formData.preferred_branch}
            onChange={(e) => handleChange('preferred_branch', e.target.value)}
            list="program-suggestions"
          />
          <datalist id="program-suggestions">
            {programs.map(p => (
              <option key={p} value={p} />
            ))}
          </datalist>
        </div>

        {/* Preferred Region */}
        <div className="form-group">
          <label className="form-label" htmlFor="region-select">Preferred Region</label>
          <select
            id="region-select"
            className="form-select"
            value={formData.preferred_region}
            onChange={(e) => handleChange('preferred_region', e.target.value)}
          >
            {REGIONS.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* Preferred State */}
        <div className="form-group">
          <label className="form-label" htmlFor="state-select">Preferred State</label>
          <select
            id="state-select"
            className="form-select"
            value={formData.preferred_state}
            onChange={(e) => handleChange('preferred_state', e.target.value)}
            disabled={formData.preferred_region === 'Any'}
          >
            <option value="Any">Any</option>
            {availableStates.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Institute Types */}
        <div className="form-group full-width">
          <label className="form-label">Institute Types</label>
          <div className="radio-group" style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            {INSTITUTE_TYPES.map(type => (
              <div className="radio-option" key={type} style={{ width: 'auto' }}>
                <input
                  type="checkbox"
                  id={`inst-${type}`}
                  checked={formData.institute_types[type]}
                  onChange={() => handleInstTypeChange(type)}
                />
                <label className="radio-label" htmlFor={`inst-${type}`} style={{ paddingLeft: '5px' }}>
                  {type}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="form-group full-width" style={{ alignItems: 'center', marginTop: '1rem' }}>
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
