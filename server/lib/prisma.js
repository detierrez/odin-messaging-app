require("dotenv/config");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("../generated/prisma/client");

const { NODE_ENV, DATABASE_URL, TEST_DATABASE_URL } = process.env;

const DB_URL = NODE_ENV === "test" ? TEST_DATABASE_URL : DATABASE_URL;
const adapter = new PrismaPg({ connectionString: `${DB_URL}` });
const prisma = new PrismaClient({ adapter });

module.exports = prisma;
