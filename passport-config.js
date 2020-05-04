const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

/**
 * Initializes passport functionality.
 * @constructor
 * @param {string} passport - The imported passport.
 * @param {string} getUserByEmail - The user's email address.
 * @param {string} getUserById - The user's Id.
 */
function initialize(passport, getUserByEmail, getUserById) {
    const authenticateUser = async (email, password, done) => {
        const user = getUserByEmail(email);
        if(user == null) {
            return done(null, false, {message: 'User not found.'});
        }

        try {
            if (await bcrypt.compare(password, user.password)) {
                return done(null, user);

            } else {
                return done(null, false, {message: 'Password doesn\'t match user'});
            }
        } catch (e) {
            return done(e);
        }


    }

    passport.use(new LocalStrategy({usernameField: 'email'}, authenticateUser));
    passport.serializeUser((user,done) => done(null, user.id))
    passport.deserializeUser((id,done) => { 
        done(null, getUserById(id))
    })
}

module.exports = initialize