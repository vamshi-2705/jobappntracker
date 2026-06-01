const Badge = ({ children, variant = 'gray', dot = false, className = '' }) => (
  <span className={`ui-badge ui-badge-${variant} ${className}`}>
    {dot && <span className="pulse-badge">●</span>}
    {children}
  </span>
);

export default Badge;
