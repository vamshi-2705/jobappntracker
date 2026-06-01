const Skeleton = ({ className = '', style = {} }) => (
  <div className={`skeleton ${className}`} style={style} />
);

export const DashboardSkeleton = () => (
  <div>
    <div className="skeleton skeleton-title" />
    <div className="stat-grid">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="ui-card ui-card-pad">
          <div className="skeleton" style={{ height: 48, width: 48, marginBottom: 12 }} />
          <div className="skeleton skeleton-text" />
        </div>
      ))}
    </div>
  </div>
);

export default Skeleton;
