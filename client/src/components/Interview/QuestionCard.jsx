import { useState } from 'react';

const QuestionCard = ({ item, index, onFavorite }) => {
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <article className="cert-card question-card">
      <div className="cert-card-header">
        <h4>
          {index + 1}. {item.question}
        </h4>
        <button type="button" className="btn btn-sm btn-secondary" onClick={() => onFavorite(item)}>
          ★ Save
        </button>
      </div>
      <button
        type="button"
        className="link-btn"
        onClick={() => setShowAnswer((v) => !v)}
      >
        {showAnswer ? 'Hide answer' : 'Show answer'}
      </button>
      {showAnswer && <p className="item-desc answer-text">{item.answer}</p>}
    </article>
  );
};

export default QuestionCard;
