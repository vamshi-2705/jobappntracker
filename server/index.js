const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check — verify the API is up before wiring routes
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'AI Job Tracker API is running',
  });
});

const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const aiRoutes = require('./routes/aiRoutes');
const profileRoutes = require('./routes/profileRoutes');
const { skillsRouter, languagesRouter } = require('./routes/skillsRoutes');
const {
  certificatesRouter,
  achievementsRouter,
  coursesRouter,
} = require('./routes/certificateRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const notesRoutes = require('./routes/notesRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const recommendRoutes = require('./routes/recommendRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/skills', skillsRouter);
app.use('/api/languages', languagesRouter);
app.use('/api/certificates', certificatesRouter);
app.use('/api/achievements', achievementsRouter);
app.use('/api/courses', coursesRouter);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/recommend', recommendRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack || err.message);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'Internal server error',
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
