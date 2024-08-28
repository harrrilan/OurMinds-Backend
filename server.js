const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Joi = require('joi');
require('dotenv').config();

const connectDB = require("./utils/database");
const Prompt = require('./models/Prompt');
const JournalEntry = require('./models/JournalEntry'); // Add this line

const app = express();
const port = process.env.PORT || 3001;

const promptSchema = Joi.object({
  text: Joi.string().required(),
  category: Joi.string().required()
});

// Middlewaref
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use('/login', (req, res) => {
  res.send({
    token: 'test123'
  });
});

// Connecting to MongoDB
connectDB().then(() => {
  console.log('Connected to MongoDB Atlas');
  
  // Start the server only after successfully connecting to the database
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}).catch(err => {
  console.error('Failed to connect to MongoDB Atlas', err);
  process.exit(1);
});

// CREATE
// Create prompts in Prompts page

// create journal entry in today's page
app.post('/api/journal-entries', async (req, res) => {
  console.log('Received journal entry data:', req.body);

  const journalEntrySchema = Joi.object({
    date: Joi.date().iso().required(),
    reflection: Joi.string().required(),
    mindfulness: Joi.string().required(),
    gratitude: Joi.string().required()
  });

  const { error } = journalEntrySchema.validate(req.body);
  if (error) {
    console.error('Validation error:', error.details[0].message);
    return res.status(400).json({ message: error.details[0].message });
  }

  const journalEntry = new JournalEntry({
    date: new Date(req.body.date),
    reflection: req.body.reflection,
    mindfulness: req.body.mindfulness,
    gratitude: req.body.gratitude
  });

  try {
    const newEntry = await journalEntry.save();
    console.log('Saved new entry:', newEntry);
    res.status(201).json(newEntry);
  } catch (err) {
    console.error('Error saving journal entry:', err);
    res.status(500).json({ message: 'Error saving journal entry', error: err.message });
  }
});

// READ
// Read multiple prompts for that day

// Read previous journal
app.get('/api/journal-entries/previous', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const entry = await JournalEntry.findOne({
      date: { $lt: today }
    }).sort({ date: -1 });

    if (!entry) {
      return res.status(404).json({ message: 'No previous journal entry found.' });
    }

    res.status(200).json(entry);
  } catch (err) {
    console.error('Error retrieving previous journal entry:', err);
    res.status(500).json({ message: 'Error retrieving previous journal entry.', error: err.message });
  }
});

app.get('/api/journal-entries/byDate/:date', async (req, res) => {
  try {
    const requestedDate = new Date(req.params.date);
    requestedDate.setHours(0, 0, 0, 0);

    const nextDay = new Date(requestedDate);
    nextDay.setDate(requestedDate.getDate() + 1);

    const entry = await JournalEntry.findOne({
      date: {
        $gte: requestedDate,
        $lt: nextDay
      }
    });

    if (!entry) {
      return res.status(404).json({ message: 'No journal entry found for the specified date.' });
    }

    res.status(200).json(entry);
  } catch (err) {
    console.error('Error retrieving journal entry by date:', err);
    res.status(500).json({ message: 'Error retrieving journal entry.', error: err.message });
  }
});

// Read User's Schedule

// Update
// 

// Delete
//

app.use((req, res, next) => {
    res.status(404).json({ message: "Route not found" });
  });
  
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
  });
