// This page is the logic behind the REGISTER view and LOGIN view

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

// Import user schema model
const User = require('../models/User');

// Login Page
router.get('/login', (req, res) => res.render('login'));

// Register Page
router.get('/register', (req, res) => res.render('register'));

router.post('/register', (req, res) => {
    const { name, email, password, password2 } = req.body;
    let errors = []
    
    // Check for empty fields
    if(!name || !email || !password || !password2) {
        errors.push({ msg: 'Please fill in all fields' })
    }

    // Check for matching passwords
    if(password !== password2) {
        errors.push({ msg: 'Passwords do not match' })
    }

    // Check password length
    if(password.length < 6) {
        errors.push({ msg: 'Password should be AT LEAST 6 characters' })
    }

    // Check if there are any errors in registration
    // If there are errors in `errors` array
    if(errors.length > 0) {
        // Render error messages, along with previous field values
        res.render('register', {
            errors,
            name,
            email,
            password,
            password2
        });
    } else {
        // If there are NO errors, check if email is already registered
        User.findOne({ email: email })
            .then(user => {
                // If there is already a user in database
                if(user) {
                    // Render new error msg, along with previous field values
                    errors.push({ msg: 'Email is already registered' })
                    res.render('register', {
                        errors,
                        name,
                        email,
                        password,
                        password2
                    });
                } 
                // If user is new
                else {
                    // Store values in user schema
                    const newUser = new User({
                        name,
                        email,
                        password
                    });
                    // Encrypt password, then save new user
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(newUser.password, salt, (err,hash) => {
                            if(err) throw err;

                            newUser.password = hash

                            newUser.save()
                                .then(user => {
                                    req.flash('success_msg', 'Registration complete')
                                    res.redirect('/users/login')
                                })
                                .catch(err => console.log(err))
                        })
                    });
                }
            });
    }
})

module.exports = router;