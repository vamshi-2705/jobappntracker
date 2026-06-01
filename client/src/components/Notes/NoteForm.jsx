import { useEffect, useState } from 'react';

const COLORS = ['yellow', 'blue', 'green', 'pink'];

const NoteForm = ({ note, onSubmit, onCancel }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState('yellow');

  useEffect(() => {
    setTitle(note?.title || '');
    setContent(note?.content || '');
    setColor(note?.color || 'yellow');
  }, [note]);

  return (
    <form
      className="note-form-inline"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ title, content, color });
      }}
    >
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
      <textarea
        rows={3}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your note..."
      />
      <select value={color} onChange={(e) => setColor(e.target.value)}>
        {COLORS.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          Save
        </button>
      </div>
    </form>
  );
};

export default NoteForm;
