const SocialLinks = ({ form, onChange }) => (
  <div className="profile-section-card">
    <h3 className="profile-section-title">Social links</h3>
    <div className="profile-form-grid">
      <div className="form-field">
        <label htmlFor="github_url">GitHub</label>
        <input
          id="github_url"
          name="github_url"
          type="url"
          value={form.github_url}
          onChange={onChange}
          placeholder="https://github.com/username"
        />
      </div>
      <div className="form-field">
        <label htmlFor="linkedin_url">LinkedIn</label>
        <input
          id="linkedin_url"
          name="linkedin_url"
          type="url"
          value={form.linkedin_url}
          onChange={onChange}
          placeholder="https://linkedin.com/in/username"
        />
      </div>
      <div className="form-field form-grid-full">
        <label htmlFor="portfolio_url">Portfolio</label>
        <input
          id="portfolio_url"
          name="portfolio_url"
          type="url"
          value={form.portfolio_url}
          onChange={onChange}
          placeholder="https://yourportfolio.com"
        />
      </div>
    </div>
  </div>
);

export default SocialLinks;
