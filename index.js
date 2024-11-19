require('dotenv').config();
const express = require('express');
const session = require('express-session');
const app = express();

app.use(express.json());
app.use(
    session({
        secret: 'your-secret-key', 
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false } 
    })
);

const PORT = process.env.PORT || 8080;
const userRoutes = require('./routes/user-routes.js');
const authRoutes = require('./routes/auth-routes.js');
const postRoutes = require('./routes/post-routes.js');
app.use('/posts', postRoutes)
app.use('/', userRoutes)

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

