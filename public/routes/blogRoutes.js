const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');
const router = express.Router();

const mongoose = require('mongoose');

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

mongoose.set('useCreateIndex', true);

router.get('/userhome.ejs', function(req, res, next){
    mongoose.connect('mongodb://localhost/totalsports', 
    { useNewUrlParser: true, useUnifiedTopology: true  }, function(err, db){
        var blogs =db.collection('blog-data').find()

        var meetups ={}
    });

});

router.get('/blogs/:id', function(req, res, next){
    
});

router.get('/get-data', function(req, res, next)){
    
}

router.get('/get-data', function(req, res, next)){
    
}