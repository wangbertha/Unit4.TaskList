const express = require("express");
const router = express.Router();

const prisma = require("../prisma");

const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Generates a unique token
 * @param {number} id User ID
 * @returns Token object with 1-day expiration
 */
function createToken(id) {
    return jwt.sign({ id }, JWT_SECRET, { expiresIn: "1d" });
}

// Process token into user information in the request
router.use(async (req, res, next) => {
    const authorization = req.headers.authorization;
    const token = authorization?.slice(7);
    if (!token) return next();

    // Store user in req.user
    try {
        const { id } = jwt.verify(token, JWT_SECRET);
        const user = await prisma.user.findUniqueOrThrow({
            where: { id },
        });
        req.user = user;
        next();
    } catch (e) {
        next(e);
    }
})

// Creates a new user in database and responds with a token object
router.post("/register", async (req, res, next) => {
    try {
        const { username, password } = req.body;
        const user = await prisma.user.register(username, password);
        const token = createToken(user.id);
        res.status(201).json({ token });
    } catch (e) {
        next(e);
    }
});

// Checks user credentials against user database and if valid, response with a token object
router.post("/login", async (req, res, next) => {
    try {
        const { username, password } = req.body;
        const user = await prisma.user.login(username, password);
        const token = createToken(user.id);
        res.json({ token });
    } catch (e) {
        next(e);
    }
});

/**
 * Checks whether any user is logged in successfully
 * @param {Object} req HTTP Request
 * @param {Object} res HTTP Response
 * @param {function()} next Express middleware function that 
 * navigates to the next middleware function
 */
function authenticate(req, res, next) {
    if (req.user) {
        next();
    } else {
        next({ status: 401, message: "You must be logged in." });
    }
}

module.exports = {
    router,
    authenticate
}