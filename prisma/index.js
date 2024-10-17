const { PrismaClient } = require("@prisma/client")

const bcrypt = require("bcrypt");

const prisma = new PrismaClient().$extends({
    model: {
        user: {
            /**
             * Creates new user in database
             * @param {string} username Must be unique in database
             * @param {string} password Hashed password will be stored in database
             * @returns Newly created user
             */
            async register(username, password) {
                const hashedPassword = await bcrypt.hash(password, 10);
                const user = await prisma.user.create({
                    data: {
                        username, password: hashedPassword
                    },
                });
                return user;
            },
            async login(username, password) {
                const user = await prisma.user.findUniqueOrThrow({
                    where: { username },
                });
                console.log(user);
                const valid = await bcrypt.compare(password, user.password);
                if (!valid) throw Error("Invalid password.");
                return user;
            },
        },
    },
});
module.exports = prisma;