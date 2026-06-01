import Button from './Button';

const EmptyState = ({ emoji = '📭', title, description, actionLabel, onAction }) => (
  <div style={{ textAlign: 'center', padding: '48px 24px' }}>
    <div style={{ fontSize: '3rem', marginBottom: 16 }}>{emoji}</div>
    <h3 style={{ margin: '0 0 8px' }}>{title}</h3>
    <p style={{ color: 'var(--text-secondary)', margin: '0 0 20px' }}>{description}</p>
    {actionLabel && onAction && (
      <Button variant="primary" onClick={onAction}>
        {actionLabel}
      </Button>
    )}
  </div>
);

export default EmptyState;
