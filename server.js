const express = require('express');
require('dotenv').config();
const cors = require('cors');
const clc = require("cli-color")
const mongoose = require("mongoose");
const session = require('express-session')
const mongoDBSession = require('connect-mongodb-session')(session);

//File-Imports
const authRoutes = require('./routers/authRouter');
const blogRouter = require('./routers/blogRouter');
const followRouter = require('./routers/followRouter');


//constants 
const app = express();
const PORT = process.env.PORT;
const store = new mongoDBSession({
    uri: process.env.MONGO_URI,
    collection: "sessions"
})
//mongoDB connection 
mongoose.connect(process.env.MONGO_URI)
.then(()=>{
    console.log(clc.yellowBright("Mongoose DataBase connected successfully"))
    startServer(); // Start the server after successful DB connection
})
.catch((error)=>{
    console.log(clc.redBright("DB connection error"));
    console.log(clc.redBright(error));
});
// middlewares
app.use(cors({
    origin: ['http://localhost:3000'],
    credentials: true 
}))
app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use(session({
    secret: process.env.SECRET_KEY,
    store: store,
    saveUninitialized: false,
    resave: false,
   
}))
// Routes middleware
app.use('/auth',authRoutes);
app.use('/blog',blogRouter);
app.use('/follow',followRouter);
//Home route
app.get('/',(req,res)=>{
    res.send({status:200, message: `server is running on PORT:${PORT}`});
})


// Server listener function
const startServer = ()=>{
    app.listen(PORT,()=>{
        console.log(clc.yellowBright.bold.underline(`server is up and running on PORT:${PORT}`));
    })
}
