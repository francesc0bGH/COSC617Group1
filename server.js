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
db.once('open', () => {
    console.log('Db connection successfully established');
});
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
//UserDetail.set('autoIndex', true);

var UserDetails = require('./models/userModel.js');
var BlogDetails = require('./models/blogModel.js');
var MeetupDetails = require('./models/meetupModel.js');

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

//code winsum is trying to add but he doesn't understand passport and needs help with this
/*app.post('/login', checkNotAuthenticated, async (req, res) =>{
    var enteredEmail = req.body.email;
    var enteredPassword = req.body.password;

    var userEmail;
    var userPassword;
    var found = true;
    UserDetails.find({ 'email': req.body.email }, 'email password', function (err, specialUser) {
        if (err) return handleError(err);

        if(specialUser == null) {                       //if we found a user with duplicate email
            found = false;
        }
        else{
            userEmail = specialUser.email;
            userPassword = specialUser.password;
        }
      })

      try{
        if(found == true){
            if(enteredEmail == userEmail){
                if(enteredPassword == userPassword){
                    
                }
                else{
                    console.log('wrong password');
                }
            }
            else{
                console.log('wrong email');
            }
        }
        else{
            console.log('No user found');//needs to send a message of not found email
        }
      }
      catch{
        res.redirect('/login'); 
      }
})*/

app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs');
})

app.post('/register', checkNotAuthenticated, async (req, res) => {
    //code to keep from adding duplicate emails
    var email = req.body.email;                         //takes entered email
    var query = UserDetails.findOne({'email': email});  //finds an user with same email
    query.select('email');                              //selects the email category
    var isDuplicate = false;                            

    query.exec(function(err, specialUser){
        if(err) return handleError(err);

        if(specialUser != null) {                       //if we found a user with duplicate email
            console.log('duplicate user');
            isDuplicate = true;//needs to send a message of duplicate email to user
        }
    })
    //code to keep from adding duplicate emails

    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })//legacy code

        var user_instance = new UserDetails(
            {
             name: req.body.name,
             email: req.body.email,
             password: hashedPassword
            }
        );

        if(isDuplicate == false){
            user_instance.save(function (err){
                if(err){
                    //console.log('It didnt work');
                    console.log(err);
                    return (err);
                } 
                console.log('User record inserted successfully');
            });
        }
        else{
            //some message telling the user there is a duplicate message
        }
        
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
    res.render('event.ejs', {
        name: req.user.name,
        page: 'Meetup',
        cname: companyname
    });
}) 

app.post('/submittedEvent', function (req, res) {
    var eventname = req.body.ename;
    var location = req.body.location;
    var description = req.body.description;
    var keywords = req.body.keywords;
    var start = req.body.start;
    var end = req.body.end;

    var data = {
        "eventname": eventname,
        "location": location,
        "description": description,
        "keywords": keywords,
        "start": start,
        "end": end
    }

    db.collection('eventDetails').insertOne(data, function(err, collection) {
        if(err) throw err;
        console.log("Record inserted successfully");
    });

    return res.redirect('userhome');
})

app.get('/blog', checkAuthenticated, (req, res) => {
    res.render('editor.ejs', {
        name: req.user.name,
        page: 'Blog',
        cname: companyname
    });
}) 

app.get('/soccer', checkAuthenticated, (req, res) => {
    res.render('soccer.ejs', {
        name: req.user.name,
        cname: companyname
    });
}) 

app.get('/rockclimbing', checkAuthenticated, (req, res) => {
    res.render('rockclimbing.ejs', {
        name: req.user.name,
        cname: companyname
    });
}) 

app.get('/bjj', checkAuthenticated, (req, res) => {
    res.render('bjj.ejs', {
        name: req.user.name,
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