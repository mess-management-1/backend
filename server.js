    const express = require("express");
    const app = express();
    const dotenv = require('dotenv');
    const getRoutes  = require('./routes/getRoutes');
    const authRoutes = require('./routes/authRoutes');
    const cors = require('cors');
    app.use(cors());
    
    dotenv.config();

    const PORT = process.env.PORT;
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use("/users", getRoutes);
    app.use('/auth', authRoutes);

    app.get("/", (req, res)=>{
        res.send(`server is running successfully on ${PORT} port`);
    });

    app.listen(PORT, ()=>{
        console.log("server is running on ",PORT);
    })









    // index.js
    // const express = require('express');
    // const { Pool } = require('pg');

    // const app = express();
    // app.use(express.json());

    // const pool = new Pool({
    //   user: 'your_db_user',
    //   host: 'localhost',
    //   database: 'your_db_name',
    //   password: 'your_password',
    //   port: 5432,
    // });

    // // Sample route
    // app.get('/users', async (req, res) => {
    //   const result = await pool.query('SELECT * FROM users');
    //   res.json(result.rows);
    // });

    // app.listen(3000, () => {
    //   console.log('Server running on port 3000');
    // });
