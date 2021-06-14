const passportLocal = require('passport-local');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const initilizePassport = require('../config/passport-config');
const User = require('../models/studentModel').StudentSchema;
const LocalStrategy = passportLocal.Strategy;

function initialize(passport) {
    const authenticateUser = async (req, email, password, done) => {

        await User.findOne({ where: { emailId: email.toLowerCase() }, raw: true })
            .then(async function (data) {
                if (data == null) {
                    return done(null, false, { message: 'Incorrect email address', status: true })
                } else if (data.password == null) {
                    return done(null, false, { message: 'Please create an account before logging in.', status: true, })
                }

                try {
                    if (await bcrypt.compare(password, data.password)) {
                        return done(null, data, { message: 'Login Successfully', status: true, userData: data })
                    } else {
                        return done(null, false, {
                            message: 'Invalid password', status: true,
                        })
                    }
                } catch (e) {
                    console.log("catch", e)
                    return done(e);
                }
            })
            .catch(function (err) {
                console.log(err);
                return done(null, false, { message: 'Invalid password', status: false })
            });
    }

    passport.use(new LocalStrategy({ usernameField: 'emailId', passReqToCallback: true }, authenticateUser))
    passport.serializeUser((user, done) => done(null, user.id))

    passport.deserializeUser(async (id, done) => {
        await User.findByPk(id)
            .then((user) => done(null, user))
            .catch((err) => done(err, null));
    })
}

module.exports = initialize;