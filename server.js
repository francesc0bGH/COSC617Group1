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
//const expressLayouts = require('express-ejs-layouts');
const router = express.Router();
var localStrategy = require('passport-local').Strategy;

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
var createdDetails = require('./models/blogModel.js');
var MeetupDetails = require('./models/meetupModel.js');

//end new code block 2

const users = []
const companyname = 'Total Sports'

app.set('view-engine', 'ejs');
//app.use(expressLayouts);
//app.use(bodyParser.json());
app.use(express.urlencoded({extended: false}));
app.use(flash());
app.use(session({
    secret: 'hi',//process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));
app.use(express.static(__dirname + '/public'));
passport.use(new localStrategy({usernameField: 'email'}, function(email, password, done)  {
    UserDetails.findOne({'email': email}).then(user => {
        if(!user){
            return done(null, false, {message: "User doesn't exist"});
        }

        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) throw err;

            if (isMatch){
                return done(null, user);
            } else{
                return done(null, false, {message: 'password is not correct'});
            }


        });
        passport.serializeUser(function(user, done) {
            done(null, user.id);
          });
          
          passport.deserializeUser(function(id, done) {
            UserDetails.findById(id, function(err, user) {
              done(err, user);
            });
          });
    }).catch(err => console.log('It not working'));
}))
    
// app.get('/', checkAuthenticated, (req, res) => {
//     res.render('index.ejs', {
//         name: req.user.name
//     });
// })

app.get('/', (req, res) => {
    res.render('landing.ejs');
})

app.get('/logout', (req, res) => {
    req.session.destroy(function(err) {
        res.redirect('/');
    });
})

app.get('/index', checkAuthenticated, (req, res) => {
    res.render('index.ejs', {
        name: req.user.name
    });
})

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs');
})

app.post('/login', checkNotAuthenticated, (req, res, next) => { passport.authenticate('local',{
    successRedirect: '/userhome', // 20200503: changing to root ('/')
    failureRedirect: '/login',
    failureFlash: true
})  (req,res,next);
})



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
        


        if(isDuplicate == false){
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
            user_instance.save(function (err){
                if(err){
                    //console.log('It didnt work');
                    console.log(err);
                    return (err);
                } 
                console.log('User record inserted successfully');
            });
            res.redirect('/login')
        }
        else{
            //some message telling the user there is a duplicate message
            res.redirect('/register', {messsage: 'Email already in use'});
        }
        
        

    } catch {
        res.redirect('/register')
    }
    console.log(users);
})

// Start Group Session: April 12

app.get('/userhome', checkAuthenticated, (req, res) => {
    var email = req.user.email;
    var query = { createdBy : email }
    db.collection('createdDetails').find(query).toArray(function(err, result1) {
        if(err) throw err;   
        res.render('userhome.ejs', {
            name: req.user.name,
            ename: result1
    
        });
    
    })
   
}) 

app.get('/contactus', (req, res) => {
    res.render('contactus.ejs');
})

app.get('/editor', checkAuthenticated, (req, res) => {

    res.render('editor.ejs', {
        name: req.user.name,
        cname: companyname,
        email: req.user.email
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
        cname: companyname,
        email: req.user.email
    });
}) 

app.post('/submittedEvent', function (req, res) {
    var eventname = req.body.ename;
    var location = req.body.location;
    var description = req.body.description;
    var keywords = req.body.sports;
    var start = req.body.start;
    var end = req.body.end;
    var createdByEmail = req.body.email;

    var data = {
        "eventname": eventname,
        "location": location,
        "description": description,
        "keywords": keywords,
        "start": start,
        "end": end,
        "createdBy": createdByEmail
    }
    
    var isDuplicate = false;
    db.collection('createdDetails').findOne( data, function(err, result){
        if(err) throw err;

        if(result == null){
            db.collection('createdDetails').insertOne(data, function(err, collection) {
                if(err) throw err;
                console.log("Record inserted successfully");
            });
        }
        else{
            isDuplicate = true;
        }
    })

    if(isDuplicate == true){
        res.redirect('userhome', {messsage: 'Record already created, try again'});
    }
    else{
        return res.redirect('userhome');
    }
})

app.post('/submittedBlog', function(req, res){
    var title = req.body.title;
    var location = req.body.location;
    var description = req.body.description;
    var activity = req.body.activity;
    var createdByEmail = req.user.email;
    

    var data = {
        "title": title,
        "location": location,
        "description": description,
        "keywords": activity,
        "createdBy": createdByEmail
        
    }
    
    var isDuplicate = false;
    db.collection('createdDetails').findOne( data, function(err, result){
        if(err) throw err;

        if(result == null){
            db.collection('createdDetails').insertOne(data, function(err, collection) {
                if(err) throw err;
                console.log("Record inserted successfully");
            });
        }
        else{
            isDuplicate = true;
        }
    })

    if(isDuplicate == true){
        res.redirect('userhome', {messsage: 'Record already created, try again'});
    }
    else{
        return res.redirect('userhome');
    }
})

app.post('/deleteEvent', function(req, res){
    var eventname = req.body.ename;
    var createdBy = req.body.email;
    var location = req.body.location;
    var start = req.body.start;
    var end = req.body.end;

    var data = {
        'eventname': eventname,
        'createdBy': createdBy,
        'location': location,
        'start': start,
        'end': end
    }

    db.collection('createdDetails').deleteOne(data, function(err, collection){
        if(err) throw err;
        console.log("Record successfully deleted")
    })

    return res.redirect('userhome');
})

app.post('/deleteBlog', function(req, res){
    var title = req.body.title;

    var data = {
        'title': title,
    }

    db.collection('createdDetails').deleteOne(data, function(err, collection){
        if(err) throw err;
        console.log("Record successfully deleted")
    })

    return res.redirect('userhome');
})

app.get('/blog', checkAuthenticated, (req, res) => {
    res.render('editor.ejs', {
        name: req.user.name,
        page: 'Blog',
        cname: companyname,
        email: req.user.email
    });
}) 

app.get('/soccer', checkAuthenticated, (req, res) => {
    var email = req.user.email;
    var query = { keywords : "Soccer", createdBy : email }
    db.collection('createdDetails').find(query).toArray(function(err, result) {
        if(err) throw err;
        res.render('soccer.ejs', {
            name: req.user.name,
            cname: companyname,
            ename: result
        });
    })
}) 

app.get('/rockclimbing', checkAuthenticated, (req, res) => {
    var email = req.user.email;
    var query = { keywords : "Rock Climbing", createdBy : email }
    db.collection('createdDetails').find(query).toArray(function(err, result) {
        res.render('rockclimbing.ejs', {
            name: req.user.name,
            cname: companyname,
            ename: result
        });
    })
}) 

app.get('/bjj', checkAuthenticated, (req, res) => {
    var email = req.user.email;
    var query = { keywords : "Brazilian Jiu-Jitsu", createdBy : email }
    db.collection('createdDetails').find(query).toArray(function(err, result) {
        res.render('bjj.ejs', {
            name: req.user.name,
            cname: companyname,
            ename: result
        });
    })
}) 

// End Group Session: April 12
app.get('/publicSoccerView', (req, res) => {
    var query = { keywords: "Soccer"};
    db.collection('createdDetails').find(query).toArray(function(err, result) {
        if(err) throw err;
        res.render('publicSoccerView.ejs', {
            cname: companyname,
            ename: result
        });
        // db.close();
    })
})

app.get('/publicRockClimbingView', (req, res) => {
    var query = { keywords: "Rock Climbing" };
    db.collection('createdDetails').find(query).toArray(function(err, result) {
        if(err) throw err;
        res.render('publicRockClimbingView.ejs', {
            cname: companyname,
            ename: result
        });
        // db.close();
    })
})

app.get('/publicBJJView', (req, res) => {
    var query = { keywords: "Brazilian Jiu-Jitsu" };
    db.collection('createdDetails').find(query).toArray(function(err, result) {
        if(err) throw err;
        res.render('publicBJJView.ejs', {
            cname: companyname,
            ename: result,
        });
        // db.close();
    })
})


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
        return res.redirect('/')
    }
    next();
}

app.listen(3000);