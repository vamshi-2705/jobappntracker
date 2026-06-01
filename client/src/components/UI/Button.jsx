import LoadingSpinner from './LoadingSpinner';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className = '',
  block = false,
  type = 'button',
  ...props
}) => (
  <button
    type={type}
    className={`ui-btn ui-btn-${variant} ui-btn-${size} ${block ? 'ui-btn-block' : ''} ${className}`}
    disabled={loading || props.disabled}
    {...props}
  >
    {loading ? <LoadingSpinner size="sm" /> : icon}
    {children}
  </button>
);

export default Button;
