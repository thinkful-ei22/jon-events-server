'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const express = require('express');
const User = require('../models/users');
const jwt = require('jsonwebtoken');

const app = require('../index');
const Events = require('../models/event');
const {DATABASE_URL, JWT_SECRET} = require('../config');

chai.use(chaiHttp);
const expect = chai.expect;

describe('GET /api/events', () => {

  let user={};
  let token;

  before(function () {
    return mongoose.connect(DATABASE_URL)
      .then(() => mongoose.connection.db.dropDatabase());
  });

  afterEach(function() {
    return mongoose.connection.db.dropDatabase();
  });

  after(function () {
    return mongoose.disconnect();
  });



  describe('GET /api/events', function () {

    it('should return all events', () => { 
      return Promise.all([
        Events.find(),
        chai.request(app).get('/api/events')
      ])
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(data.length);
        });
    });


   
    it('should return a list with the correct right fields', function () {
      return Promise.all([
        Events.find().sort({ updatedAt: 'desc' }),
        chai.request(app).get('/api/Events')
      ])
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(data.length);
          res.body.forEach(function (item, i) {
            expect(item).to.be.a('object');
            // Event: folderId and content are optional
            expect(item).to.include.all.keys('id', 'title', 'createdAt', 'updatedAt', 'tags');
            expect(item.id).to.equal(data[i].id);
            expect(item.title).to.equal(data[i].title);
            expect(item.content).to.equal(data[i].content);
            expect(new Date(item.createdAt)).to.eql(data[i].createdAt);
            expect(new Date(item.updatedAt)).to.eql(data[i].updatedAt);
          });
        });
    });

    it('should return correct search results for a searchTerm query', function () {
      const searchTerm = 'tournament';
      // const re = new RegExp(searchTerm, 'i');
      const dbPromise = Events.find({
        title: { $regex: searchTerm, $options: 'i' }
      // $or: [{ title: re }, { content: re }]
      });
      const apiPromise = chai.request(app)
        .get(`/api/events?searchTerm=${searchTerm}`);

      return Promise.all([dbPromise, apiPromise])
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          res.body.forEach(function (item, i) {
            expect(item).to.be.a('object');
            expect(item).to.include.keys('id', 'dateOfEvent', 'description', 'title', 'createdAt', 'updatedAt'); // Event: folderId and content are optional
            expect(item.id).to.equal(data[i].id);
            expect(item.title).to.equal(data[i].title);
            expect(item.content).to.equal(data[i].content);
            expect(new Date(item.createdAt)).to.eql(data[i].createdAt);
            expect(new Date(item.updatedAt)).to.eql(data[i].updatedAt);
          });
        });
    });
  
    describe('POST /api/events', function () {
      it('should create and return a new event when provided valid data', function () {
        const newEvent = {
          title: 'Testing',
          description: 'Working?',
          info: 'hello'
        };
        let res;

        return chai.request(app)
          .post('/api/events')
          .set('Authorization', `Bearer ${token}`)
          .send(newEvent)
          .then(function (_res) {
            res=_res;
            expect(res).to.have.status(400);
            expect(res).to.be.json;
            expect(res.body).to.be.a('object');
            return Events.findOne({ _id: res.body.id, userId: user.id });
          });
      });
    });
  });
});