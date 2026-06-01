const Tabs = ({ tabs, active, onChange }) => (
  <div className="ui-tabs">
    {tabs.map((tab) => (
      <button
        key={tab.id}
        type="button"
        className={`ui-tab ${active === tab.id ? 'ui-tab-active' : ''}`}
        onClick={() => onChange(tab.id)}
      >
        {tab.label}
      </button>
    ))}
  </div>
);

export default Tabs;
