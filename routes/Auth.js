const express = require("express");
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require("../models/User");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser = require("../middleware/fetchuser");

const JWTS = process.env.JWT_SECRET;

//createUser
router.post("/createuser",
    [
        body('name').isLength({ min: 3 }),
        body('email').isEmail(),
        body('password').isLength({ min: 6 }),
    ],
    (req, res) => {
        console.log("[createuser] Request received:", { name: req.body.name, email: req.body.email });

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.warn("[createuser] Validation failed:", errors.array());
            return res.status(400).json({ errors: errors.array() });
        }

        async function createuser() {
            try {
                console.log("[createuser] Hashing password...");
                const salt = await bcrypt.genSalt(10);
                const secPass = await bcrypt.hash(req.body.password, salt);

                const user = new User({
                    name: req.body.name,
                    email: req.body.email,
                    password: secPass,
                });

                console.log("[createuser] Saving user to DB...");
                const savedUser = await user.save();
                console.log("[createuser] User saved successfully, id:", savedUser.id);

                const data = ({ user: { id: user.id } });
                const authtoken = jwt.sign(data, JWTS);
                console.log("[createuser] Auth token generated for user id:", savedUser.id);

                res.json({ authtoken });
            }
            catch (err) {
                console.error("[createuser] Error:", err.message);
                res.status(500).json({ error: "Internal server error occured" });
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
        console.log("[login] Request received for email:", req.body.email);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.warn("[login] Validation failed:", errors.array());
            return res.status(400).json({ errors: errors.array() });
        }

        async function loginuser() {
            const email = req.body.email;
            const password = req.body.password;

            try {
                console.log("[login] Looking up user in DB...");
                const user = await User.findOne({ email });
                if (!user) {
                    console.warn("[login] No user found for email:", email);
                    return res.status(400).json({ error: "Invalid credentials" });
                }
                console.log("[login] User found, id:", user.id);

                console.log("[login] Comparing password...");
                const passCompare = await bcrypt.compare(password, user.password);
                if (!passCompare) {
                    console.warn("[login] Password mismatch for email:", email);
                    return res.status(400).json({ error: "Invalid credentials" });
                }

                const data = ({ user: { id: user.id } });
                const authtoken = jwt.sign(data, JWTS);
                console.log("[login] Login successful, token generated for user id:", user.id);

                res.json({ authtoken });
            }
            catch (err) {
                console.error("[login] Error:", err.message);
                res.status(500).json({ error: "Internal server error occured" });
            }
        }
        loginuser();
    });


//get user details
router.post('/getuser', fetchuser, async (req, res) => {
    console.log("[getuser] Request received for user id:", req.user.id);
    try {
        const userId = req.user.id;

        console.log("[getuser] Fetching user from DB...");
        const user = await User.findById(userId).select("-password");

        if (!user) {
            console.warn("[getuser] No user found for id:", userId);
            return res.status(404).json({ error: "User not found" });
        }

        console.log("[getuser] User fetched successfully:", user.email);
        res.send(user);
    }
    catch (err) {
        console.error("[getuser] Error:", err.message);
        res.status(500).json({ error: "Internal server error occured" });
    }
});


module.exports = router;