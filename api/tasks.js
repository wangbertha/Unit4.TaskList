const express = require("express");
const router = express.Router();
module.exports = router;

const prisma = require("../prisma");

router
    .route("/")
    .get(async (req, res, next) => {
        try {
            const tasks = await prisma.task.findMany();
            res.json(tasks);
        } catch (e) {
            next(e);
        }
    })
    .post(async (req, res, next) => {
        try {
            const { name, done } = req.body;
            const task = await prisma.task.create({
                data: { name, done, ownerId: 1 },
            });
            res.status(201).json(task);
        } catch (e) {
            next(e);
        }
    });

router.param("id", async (req, res, next, id) => {
    try {
        const task = await prisma.task.findUnique({ where: { id: +id } });
        if (task) {
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
    .delete(async (req, res, next) => {
        try {
            await prisma.task.delete({
                where: { id: req.task.id },
            });
            res.sendStatus(204)
        } catch (e) {
            next(e);
        }
    })
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