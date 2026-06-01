const sizes = { sm: 18, md: 24, lg: 36 };

const LoadingSpinner = ({ size = 'md', className = '' }) => (
  <span
    className={`spinner-ring ${className}`}
    style={{
      width: sizes[size],
      height: sizes[size],
      borderWidth: size === 'sm' ? 2 : 3,
    }}
    aria-label="Loading"
  />
);

export default LoadingSpinner;
