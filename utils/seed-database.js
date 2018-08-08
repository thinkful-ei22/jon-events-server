'use strict';

const mongoose = require('mongoose');

const { DATABASE_URL } = require('../config');
const Note = require('../models/note');

const seedNotes = require('../db/seed/notes');
 
mongoose.connect(DATABASE_URL)
  .then(() => mongoose.connection.db.dropDatabase())
  .then(() => Note.insertMany(seedNotes))
  .then(results => {
    console.info(`Inserted ${results.length} Notes`);
  })
  .then(() => mongoose.disconnect())
  .catch(err => {
    console.error(err);
  });