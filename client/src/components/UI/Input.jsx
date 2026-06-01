const Input = ({
  label,
  name,
  type = 'text',
  icon: Icon,
  error,
  className = '',
  ...props
}) => (
  <div className={`ui-field ${error ? 'ui-field-error' : ''}`}>
    {label && (
      <label className="ui-label" htmlFor={name}>
        {label}
      </label>
    )}
    <div className="ui-input-wrap">
      {Icon && <span className="ui-input-icon">{<Icon />}</span>}
      <input
        id={name}
        name={name}
        type={type}
        className={`ui-input ${Icon ? 'ui-input-with-icon' : ''} ${className}`}
        {...props}
      />
    </div>
    {error && <p className="ui-error-text">{error}</p>}
  </div>
);

export default Input;
