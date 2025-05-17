const { db } = require('../config/db');
const { users } = require('../db/schema');

const getAllUsers = async (req, res) => {
    try {
        const allUsers = await db.select().from(users);
        res.status(200).json(allUsers);
    }
    catch(error) {
        console.error("Error fetching users:", error);
        res.status(500).send("can't get all users");
    }
}



module.exports = { getAllUsers };