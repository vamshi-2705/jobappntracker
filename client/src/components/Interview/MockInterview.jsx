import { useEffect, useState } from 'react';

const MockInterview = ({ questions, onExit }) => {
  const [index, setIndex] = useState(0);
  const [seconds, setSeconds] = useState(120);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    if (!running || seconds <= 0) return;
    const t = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [running, seconds]);

  if (!questions.length) return null;

  const current = questions[index];
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return (
    <div className="mock-interview profile-section-card">
      <div className="section-title-row">
        <h3>Mock interview</h3>
        <span className={`timer ${seconds < 30 ? 'timer-warn' : ''}`}>
          {mins}:{secs.toString().padStart(2, '0')}
        </span>
      </div>
      <p className="item-meta">
        Question {index + 1} of {questions.length}
      </p>
      <h4 className="mock-question">{current.question}</h4>
      <div className="cert-card-actions">
        <button type="button" className="btn btn-secondary" onClick={() => setRunning((r) => !r)}>
          {running ? 'Pause' : 'Resume'}
        </button>
        <button
          type="button"
          className="btn btn-primary"
          disabled={index >= questions.length - 1}
          onClick={() => {
            setIndex((i) => i + 1);
            setSeconds(120);
            setRunning(true);
          }}
        >
          Next question
        </button>
        <button type="button" className="btn btn-secondary" onClick={onExit}>
          End session
        </button>
      </div>
    </div>
  );
};

export default MockInterview;
