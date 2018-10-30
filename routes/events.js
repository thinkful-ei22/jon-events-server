'use strict';

const express = require('express');

const EventModel= require('../models/event');


const router = express.Router();

router.get('/', (req, res, next) => {
  const {searchTerm} = req.query;
  // console.log(req.query);
  let filter = {};

  if (searchTerm) {
    const re = new RegExp(searchTerm, 'i');
    filter.$or  = [{ 'title': re}, {'description': re}];
  }

  EventModel.find(filter)
    .sort({createdAt: 'desc'})
    .limit(10)
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      next(err);
    });
});

//   EventModel.find({$or:[
//     {"title": { $regex: searchTerm, $options: 'ig'}},
//     {"description": {$regex: searchTerm, $options: 'ig'}}
//   ]})
//     .sort({createdAt: 'desc'})
//     .limit(10)
//     .then(results => {
//       res.json(results);
//     })
//     .catch(err => {
//       next(err);
//     });
// });

router.post('/', (req, res, next) => {
  const { title, description, info, dateOfEvent, imageUrl} = req.body;
  // console.log(req.body);
  if (typeof title !== 'string') {
    res.status(400).json({message: 'title is a required field'});
  }

  if (typeof info !== 'string') {
    res.status(400).json({message: 'info is a required field'});
  }

  if (typeof description !== 'string') {
    res.status(400).json({message: 'description is a required field'});
  }
  if (!dateOfEvent) {
    res.status(400).json({message: 'dateOfEvent is a required field'});
  }
  const timeStamp = Date.parse(dateOfEvent);
  if (isNaN(timeStamp))  {
    // console.log('isNan');
    res.status(400).json({message: 'dateOfEvent is not a valid date'});
  }
  EventModel.create({
    title, description, info, dateOfEvent, imageUrl
  })
    .then(result => {
      res.status(201).json(result);
    })
    .catch(err => {
      next(err);
    });
});


module.exports = router;