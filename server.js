const express = require('express');
require('dotenv').config();
const cors = require('cors');
const clc = require('cli-color');
const mongoose = require('mongoose');
const session = require('express-session');
const mongoDBSession = require('connect-mongodb-session')(session);

// File Imports
const authRoutes = require('./routers/authRouter');
const blogRouter = require('./routers/blogRouter');
const followRouter = require('./routers/followRouter');

// Constants
const app = express();
const PORT = process.env.PORT || 5000; // Default port if not specified
const store = new mongoDBSession({
    uri: process.env.MONGO_URI,
    collection: 'sessions'
});



app.use(cors({
    origin: ['http://localhost:3000','https://blog-app-omega-coral.vercel.app'],
    credentials: true 
}))


// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log(clc.yellowBright('Mongoose DataBase connected successfully'));
        startServer(); // Start the server after successful DB connection
    })
    .catch((error) => {
        console.log(clc.redBright('DB connection error'));
        console.log(clc.redBright(error));
    });

// Middlewares
app.set('trust proxy',1);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
console.log('env',process.env.NODE_ENV)
// Session Middleware
app.use(session({
    secret: process.env.SECRET_KEY,
    store: store,
    saveUninitialized: false,
    resave: false,
    name: "connectsid",
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
        httpOnly: true, 
        maxAge: 1000 * 60 * 60 * 24 
    }
}));


// Routes Middleware
app.use('/auth', authRoutes);
app.use('/blog', blogRouter);
app.use('/follow', followRouter);

// Home route
app.get('/', (req, res) => {
    res.send({ status: 200, message: `Server is running on PORT:${PORT}` });
});

// Server listener function
const startServer = () => {
    app.listen(PORT, () => {
        console.log(clc.yellowBright.bold.underline(`Server is up and running on PORT:${PORT}`));
    });
};
