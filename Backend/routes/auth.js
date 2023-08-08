const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser');

const JWT_KEY = "mynameisvaish";

// ROUTE1: Create a user using POST: "/api/auth/createuser". No login required
router.post('/createuser', [
    body('name', 'Enter a valid name').isLength({ min: 3 }),
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password must be atleast 5 characters').isLength({ min: 5 })

], async (req, res) => {
    let success = false;
    // If there are errors, Return Bad request and the errors.
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() });
    }

    try {
        // Check wheather the user with this email already exists
        let user = await User.findOne({ email: req.body.email })
        if (user) {
            return res.status(400).json({ success, error: "Sorry user with this email already exists" })
        }

        // Generating Salt and Hash for passwords
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password, salt);

        // Create a new user
        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: secPass,
        })

        // authoken is created to return the user as a response
        const data = {
            user: {
                id: user.id
            }
        }
        const authtoken = jwt.sign(data, JWT_KEY);
        success=true;
        res.json({ success,authtoken })

    } catch (error) {
        console.log(error.message);
        res.status(500).send("some error occured");
    }

})

// ROUTE2: Authenticate a user using POST: "/api/auth/login". No login required
router.post('/login', [
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'password cannot be blank').exists()

], async (req, res) => {
    // If there are errors, Return Bad request and the errors.
    const errors = validationResult(req);
    let success = false;
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email })
        if (!user) {
            success = false;
            res.status(400).json("Please try to login with correct credentials")
        }

        let comparePass = await bcrypt.compare(password, user.password)
        if (!comparePass) {
            success= false;
            res.status(400).json({success, error:"Please try to login with correct credentials"})
        }

        const data = {
            user: {
                id: user.id
            }
        }
        const authtoken = jwt.sign(data, JWT_KEY);
        success = true;
        res.json({ success, authtoken })
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal server error");
    }
})

// ROUTE3: Get logged in user detail using POST: "/api/auth/getuser". Login required
router.post('/getuser', fetchuser, async (req, res) => {

    try {
        const userid = req.user.id;
        const user = await User.findById(userid).select("-password");
        res.send({ user })
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal server error");
    }
})



module.exports = router

