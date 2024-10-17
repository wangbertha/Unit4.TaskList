const prisma = require("../prisma");

/**
 * Seed function shell if app administrators
 * would like to set up initial users and tasks
 */
const seed = async () => {

};

seed()
    .then(async () => await prisma.$disconnect())
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });