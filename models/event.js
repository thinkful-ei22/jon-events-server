'use strict';

const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  info: {type: String, required: true},
  dateOfEvent: { type: Date, required: true },
  imageUrl: String
}, {timestamps: true});



module.exports = mongoose.model('Event', eventSchema);