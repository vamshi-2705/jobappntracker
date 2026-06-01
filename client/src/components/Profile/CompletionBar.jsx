const CompletionBar = ({ percent = 0 }) => {
  const value = Math.min(100, Math.max(0, percent));

  return (
    <div className="completion-bar-wrap">
      <div className="completion-bar-header">
        <span>Profile completion</span>
        <strong>{value}%</strong>
      </div>
      <div className="completion-bar-track" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
        <div className="completion-bar-fill" style={{ width: `${value}%` }} />
      </div>
      {value < 100 && (
        <p className="completion-hint">Complete your profile to stand out to recruiters.</p>
      )}
    </div>
  );
};

export default CompletionBar;
