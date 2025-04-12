const express = require("express");
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require("../models/User");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser = require("../middleware/fetchuser");

//this is the secret signature which is matched to verify auth token we can hide it later
const JWTS = "yadav@2183";



//createUser
router.post("/createuser",
    [
        body('name').isLength({ min: 3 }),
        body('email').isEmail(),
        body('password').isLength({ min: 6 }),
        
    ],
    (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }


        async function createuser() {
            //to create ans save hash of a pswd instead of plain text
            const salt = await bcrypt.genSalt(10);
            const secPass = await bcrypt.hash(req.body.password, salt);
            


            const user = new User({
                name: req.body.name,
                email: req.body.email,
                password: secPass,
            });
            try {
                const User = await user.save();

                //this authtoken is generated by signing using JWTS and sent as a response
                const data = ({ user: { id: user.id } });
                const authtoken = jwt.sign(data, JWTS);
                res.json({ authtoken });
            }
            catch (err) {
                res.status(500).json({error: "Internal server error occured"});
            }
        }
        createuser();
    });


//login a user
router.post("/login",
    [
        body('email', 'Enter a valid email').isEmail(),
        body('password', 'Password cannot be blank').notEmpty(),
    ],
    (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }


        async function loginuser() {

            const email = req.body.email;
            const password = req.body.password;

            try {

                //check username/email
                const user = await User.findOne({ email });
                if (!user) {
                    return res.status(400).json({ error: "Invalid credentials" });
                }


                //check password
                //bcrypt internally checks for the password automatically it takes input pas string and stored hash value as input to check so
                const passComapre = await bcrypt.compare(password, user.password);
                if (!passComapre) {
                    return res.status(400).json({ error: "Invalid credentials" });
                }

                //this authtoken is generated by signing using JWTS and sent as a response when login correctly
                const data = ({ user: { id: user.id } });
                const authtoken = jwt.sign(data, JWTS);
                res.json({ authtoken });
            }
            catch (err) {
                console.error(err.message);
                res.status(500).json({error: "Internal server error occured"});
            }
        }
        loginuser();
    });



//get user details 
router.post('/getuser',fetchuser, async (req, res) => {
    try {

        const userId = req.user.id;
        const user = await User.findById(userId).select("-password");
        res.send(user);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).json({error: "Internal server error occured"});
    }

});


module.exports = router;