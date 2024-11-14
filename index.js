require('dotenv').config();
const express = require('express');
const app = express();


const PORT = process.env.PORT || 8080;
const userRoutes = require('./routes/user-routes.js');
// const authRoutes = require('./routes/auth-routes.js');
app.use('/', userRoutes)
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

