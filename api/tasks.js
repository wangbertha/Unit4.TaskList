const express = require("express");
const router = express.Router();
module.exports = router;

const prisma = require("../prisma");

const { authenticate } = require("./auth");

// Protect all /tasks routes with valid login
router.use(authenticate);

router
    .route("/")
    // GET /tasks
    .get(async (req, res, next) => {
        try {
            const tasks = await prisma.task.findMany({
                where: { ownerId: req.user.id },
            });
            res.json(tasks);
        } catch (e) {
            next(e);
        }
    })
    // POST /tasks
    .post(async (req, res, next) => {
        try {
            const { name, done } = req.body;
            const task = await prisma.task.create({
                data: { name, done, ownerId: req.user.id },
            });
            res.status(201).json(task);
        } catch (e) {
            next(e);
        }
    });

// Find task that corresponds to /:id and store in req.task
router.param("id", async (req, res, next, id) => {
    try {
        const task = await prisma.task.findUnique({ where: { id: +id } });
        if (task) {
            if (task.ownerId !== req.user.id) {
                next({ status: 403, message: "You are not authorized to view this task."});
            }
            req.task = task;
            next();
        } else {
            next({ status: 404, message: `Task id ${id} does not exist.`});
        }
    } catch (e) {
        next(e);
    }
})

router
    .route("/:id")
    // GET /task/:id
    .delete(async (req, res, next) => {
        try {
            await prisma.task.delete({
                where: { id: req.task.id },
            });
            res.sendStatus(204);
        } catch (e) {
            next(e);
        }
    })
    // PUT /task/:id
    .put(async (req, res, next) => {
        try {
            const { name, done } = req.body;
            const task = await prisma.task.update({
                where: { id: req.task.id },
                data: { name, done },
            });
            res.status(200).json(task);
        } catch (e) {
            next(e);
        }
    })