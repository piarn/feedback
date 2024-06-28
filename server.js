const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const { body, validationResult } = require('express-validator');
const db = require('./db');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 3000;

// Middleware
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser()); // Use cookie-parser to handle cookies

app.use(morgan('dev'));
morgan.token('req-body', (req, res) => JSON.stringify(req.body));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :req-body'));

app.use(cors());

// Validation middleware for feedback creation
const validateFeedback = [
  body('email').isEmail().normalizeEmail(),
  body('rating').isInt({ min: 1, max: 5 }),
  body('message').isString().trim().isLength({ max: 1000 }), 
  body('agent').isString().trim().isLength({ max: 1000 }), 
];

// Rate Limiting middleware for POST /feedback
const createFeedbackLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 1000, // limit each IP to 1 request per windowMs
  message: { error: 'Too many requests, please try again after 24 hours :)' }
});

// create feedback
app.post('/feedback', createFeedbackLimiter, validateFeedback, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, rating, message, agent } = req.body; // Include agent in the request body
  try {
    const stmt = db.prepare('INSERT INTO feedback (email, rating, message, agent) VALUES (?, ?, ?, ?)');
    const info = stmt.run(email, rating, message, agent);
    res.status(201).json({ id: info.lastInsertRowid, email, rating, message, agent });
  } catch (error) {
    console.error('Error inserting feedback:', error.message);
    res.status(500).json({ error: 'Failed to process feedback' });
  }
});

// Read all feedback (no authentication required)
app.get('/feedback', (req, res) => {
  try {
    const stmt = db.prepare('SELECT email, rating, message, agent FROM feedback');
    const feedbacks = stmt.all();
    res.json(feedbacks);
  } catch (error) {
    console.error('Error retrieving feedback:', error.message);
    res.status(500).json({ error: 'Failed to retrieve feedback' });
  }
});

// Read single feedback (no authentication required)
app.get('/feedback/:id', (req, res) => {
  const { id } = req.params;
  try {
    const stmt = db.prepare('SELECT email, rating, message, agent FROM feedback WHERE id = ?');
    const feedback = stmt.get(id);
    if (feedback) {
      res.json(feedback);
    } else {
      res.status(404).json({ error: 'Feedback not found' });
    }
  } catch (error) {
    console.error('Error retrieving feedback:', error.message);
    res.status(500).json({ error: 'Failed to retrieve feedback' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
