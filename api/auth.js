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

module.exports = router;