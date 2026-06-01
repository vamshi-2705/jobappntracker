const GENDERS = ['Male', 'Female', 'Non-binary', 'Prefer not to say', 'Other'];

const BasicInfo = ({ user, form, onChange }) => (
  <div className="profile-section-card">
    <h3>Basic information</h3>
    <div className="form-grid">
      <div>
        <label>Full name</label>
        <input type="text" value={user?.name || ''} disabled className="input-disabled" />
      </div>
      <div>
        <label>Email</label>
        <input type="email" value={user?.email || ''} disabled className="input-disabled" />
      </div>
      <div className="form-grid-full">
        <label htmlFor="headline">Headline</label>
        <input
          id="headline"
          name="headline"
          value={form.headline}
          onChange={onChange}
          placeholder="e.g. Full Stack Developer | React & Node.js"
          maxLength={200}
        />
      </div>
      <div className="form-grid-full">
        <label htmlFor="bio">Bio</label>
        <textarea
          id="bio"
          name="bio"
          rows={4}
          value={form.bio}
          onChange={onChange}
          placeholder="Tell recruiters about yourself..."
        />
      </div>
      <div>
        <label htmlFor="phone">Phone</label>
        <input id="phone" name="phone" value={form.phone} onChange={onChange} placeholder="+1 234 567 8900" />
      </div>
      <div>
        <label htmlFor="location">Location</label>
        <input id="location" name="location" value={form.location} onChange={onChange} placeholder="City, Country" />
      </div>
      <div>
        <label htmlFor="date_of_birth">Date of birth</label>
        <input
          id="date_of_birth"
          name="date_of_birth"
          type="date"
          value={form.date_of_birth}
          onChange={onChange}
        />
      </div>
      <div>
        <label htmlFor="gender">Gender</label>
        <select id="gender" name="gender" value={form.gender} onChange={onChange}>
          <option value="">Select</option>
          {GENDERS.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>
    </div>
  </div>
);

export default BasicInfo;
