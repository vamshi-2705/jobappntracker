const NoteCard = ({ note, onEdit, onDelete }) => (
  <article className={`note-sticky ${note.color || 'yellow'}`}>
    <h4 style={{ margin: '0 0 8px' }}>{note.title || 'Untitled'}</h4>
    <p style={{ margin: '0 0 12px', fontSize: 'var(--text-sm)' }}>{note.content}</p>
    {note.created_at && (
      <time style={{ fontSize: 'var(--text-xs)', opacity: 0.7, display: 'block', marginBottom: 8 }}>
        {new Date(note.created_at).toLocaleDateString()}
      </time>
    )}
    <div className="cert-card-actions" style={{ opacity: 1 }}>
      <button type="button" className="btn btn-sm btn-secondary" onClick={() => onEdit(note)}>
        Edit
      </button>
      <button type="button" className="btn btn-sm btn-danger" onClick={() => onDelete(note)}>
        Delete
      </button>
    </div>
  </article>
);

export default NoteCard;
