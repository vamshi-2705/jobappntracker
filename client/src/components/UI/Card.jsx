const Card = ({ children, className = '', hover = false, padding = true, ...props }) => (
  <div
    className={`ui-card ${padding ? 'ui-card-pad' : ''} ${hover ? 'ui-card-hover' : ''} ${className}`}
    {...props}
  >
    {children}
  </div>
);

export default Card;
