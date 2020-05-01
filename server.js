if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');
const router = express.Router();

//start new code block 1
const mongoose = require('mongoose');
//end new code block 1

const initializePassport = require('./passport-config')
initializePassport(
    passport, 
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
);

//start new code block 2
mongoose.set('useCreateIndex', true);
//mongodb+srv://dbUser:password1987@allfit-m1aeh.mongodb.net/test
//mongodb+srv://allfit-m1aeh.mongodb.net/test
//"mongodb+srv://<username>:<password>@<your-cluster-url>/test?retryWrites=true&w=majority"
//'mongo "mongodb+srv://allfit-m1aeh.mongodb.net/test"  --username dbUser'
mongoose.connect("mongodb+srv://dbUser:password1987@allfit-m1aeh.mongodb.net/test", 
  { useNewUrlParser: true, useUnifiedTopology: true });

var db = mongoose.connection;
db.connect;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
//UserDetail.set('autoIndex', true);

var UserDetails = require('./models/userModel.js');
var BlogDetails = require('./models/blogModel.js');

//end new code block 2

const users = []
const companyname = 'Total Sports'

app.set('view-engine', 'ejs');
app.use(express.urlencoded({extended: false}));
app.use(flash());
app.use(session({
    secret: 'hi',//process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));
app.use(express.static(__dirname + '/public'));

// app.get('/', checkAuthenticated, (req, res) => {
//     res.render('index.ejs', {
//         name: req.user.name
//     });
// })

app.get('/', (req, res) => {
    res.render('landing.ejs');
})

app.get('/index', checkAuthenticated, (req, res) => {
    res.render('index.ejs', {
        name: req.user.name
    });
})

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs');
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local',{
    successRedirect: '/index',
    failureRedirect: '/login',
    failureFlash: true
}))

app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs');
})

app.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })//how do i put this data in userdb

        var user_instance = new UserDetails(
            {
             name: req.body.name,
             email: req.body.email,
             password: hashedPassword
            }
        );

        user_instance.save(function (err){
            if(err){
                //console.log('It didnt work');
                console.log(err);
                return (err);
            } 
            //console.log('Here');
        });
        
        res.redirect('/login')

    } catch {
        res.redirect('/register')
    }
    console.log(users);
})

// Start Group Session: April 12

app.get('/userhome', checkAuthenticated, (req, res) => {
    res.render('userhome.ejs', {
        name: req.user.name,
        cname: companyname
    });
}) 

app.get('/editor', checkAuthenticated, (req, res) => {
    res.render('editor.ejs', {
        name: req.user.name,
        cname: companyname
    });
}) 

app.post('/editor', checkAuthenticated, (req, res) => {
    res.render('editor.ejs', {
        name: req.user.name,
        
    });
}) 

app.get('/meetup', checkAuthenticated, (req, res) => {
    res.render('editor.ejs', {
        name: req.user.name,
        page: 'Meetup',
        cname: companyname
    });
}) 

app.get('/blog', checkAuthenticated, (req, res) => {
    res.render('editor.ejs', {
        name: req.user.name,
        page: 'Blog',
        cname: companyname
    });
}) 

// End Group Session: April 12



app.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/login')
})

function checkAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }

    res.redirect('/login');
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/index')
    }
    next();
}

app.listen(3000);