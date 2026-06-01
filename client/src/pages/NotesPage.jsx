import { useCallback, useEffect, useState } from 'react';
import api from '../utils/api';
import NoteCard from '../components/Notes/NoteCard';
import NoteForm from '../components/Notes/NoteForm';

const NotesPage = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/notes');
      setNotes(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleSubmit = async (form) => {
    if (editing) await api.put(`/notes/${editing.id}`, form);
    else await api.post('/notes', form);
    setShowForm(false);
    setEditing(null);
    fetchNotes();
  };

  const handleDelete = async (note) => {
    if (!window.confirm('Delete this note?')) return;
    await api.delete(`/notes/${note.id}`);
    fetchNotes();
  };

  return (
    <div className="dashboard">
      <div className="section-header">
        <h2>Sticky notes</h2>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
        >
          + New note
        </button>
      </div>
      {showForm && (
        <div className="profile-section-card">
          <NoteForm
            note={editing}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditing(null);
            }}
          />
        </div>
      )}
      {loading ? (
        <div className="page-center">
          <div className="spinner" />
        </div>
      ) : (
        <div className="notes-masonry">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={(n) => {
                setEditing(n);
                setShowForm(true);
              }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
      {!loading && !notes.length && (
        <p className="empty-inline">No notes yet. Add your first sticky note!</p>
      )}
    </div>
  );
};

export default NotesPage;
