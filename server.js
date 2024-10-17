const express = require("express");
const app = express();
const PORT = 3000;

// Allows Express App to access .env
require("dotenv").config();

// Logs request to console
app.use(require("morgan")("dev"));

// Parses incoming JSON into request body
app.use(express.json());

// Routing for auth-related endpoints /register and /login
app.use(require("./api/auth"));

// Routing for /tasks
app.use("/tasks", require("./api/tasks"));

// No endpoint match
app.use((req, res, next) => {
    next({ status: 404, message: "Endpoint not found :("});
});

// Catch-all error handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status ?? 500);
    res.json(err.message ?? "We ran into an issue :/");
});

// Serves endpoints in Port 3000
app.listen(PORT, () => {
    console.log(`Listening on Port ${PORT}`);
});