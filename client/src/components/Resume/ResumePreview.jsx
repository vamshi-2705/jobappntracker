const ResumePreview = ({ resume, previewRef }) => (
  <div className="resume-preview-wrap" ref={previewRef}>
    <pre className="resume-preview-text">{resume}</pre>
  </div>
);

export default ResumePreview;
