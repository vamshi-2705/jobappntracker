const TOPICS = [
  'DSA',
  'System Design',
  'React',
  'Node.js',
  'PostgreSQL',
  'HR Questions',
  'Behavioral',
];

const TopicSelector = ({ value, onChange }) => (
  <div>
    <label htmlFor="interview-topic">Interview topic</label>
    <select id="interview-topic" value={value} onChange={(e) => onChange(e.target.value)}>
      {TOPICS.map((t) => (
        <option key={t} value={t}>
          {t}
        </option>
      ))}
    </select>
  </div>
);

export default TopicSelector;
