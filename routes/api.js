/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;

var db;

MongoClient.connect(process.env.DATABASE, (err, database) => {
  if (err) return console.log('DB error' + err);
  db = database.db();
})

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      db.collection('books').find()
        .toArray((err, result) => {
        if (err) throw err;
        if (result) {
          res.status(200).send(result);
        }
      })
    })
    
    .post(function (req, res){
      var title = req.body.title;
      if (title == null || title == '') {
        return res.status(400).send('no title');
      }
      //response will contain new book object including atleast _id and title
      db.collection('books').findOneAndUpdate({title: title}, {$setOnInsert: {title: title, commentCount: 0}}, {upsert: true, returnOriginal: false}, (err, result) => {
        if (err) throw err;
        if (result) {
          res.status(200).json(result.value);
        }
        else {
          res.status(400).send('error')
        }
      })
    })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
      db.collection('books').deleteMany({}, (err, result) => {
        if (err) throw err;
        res.status(200).send('complete delete successful');
      })
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      try {
        var bookid = ObjectId(req.params.id);
      }
      catch(err) {
        res.status(400).send('id error')
      }
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      db.collection('books').findOne({_id: bookid}, (err, result) => {
        if (err) throw err;
        if (result) {
          res.status(200).json(result);
        }
        else {
          res.status(400).send('does not exist')
        }
      })
    })
    
    .post(function(req, res){
      try {
        var bookid = ObjectId(req.params.id);
      }
      catch(err) {
        res.status(400).send('id error')
      }
      var comment = req.body.comment;
      //json res format same as .get
      db.collection('books').findOneAndUpdate({_id: bookid}, {$inc: {commentCount: 1}, $push: {comments: {comment} } }, {returnOriginal: false}, (err, result) => {
        if (err) throw err;
        if (result.value) {
          res.status(200).json(result.value);
        }
        else {
          res.status(400).send('does not exist');
        }
      })
    })
    
    .delete(function(req, res){
      try {
        var bookid = ObjectId(req.params.id);
      }
      catch(err) {
        res.status(400).send('id error')
      }
      //if successful response will be 'delete successful'
      db.collection('books').findOneAndDelete({_id: bookid}, (err, result) => {
        if (err) throw err;
        if (result.value) {
          res.status(200).send('delete successful');
        }
        else {
          res.status(400).send('does not exist');
        }
      })
    });
  
};
