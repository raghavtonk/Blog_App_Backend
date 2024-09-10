const express = require("express");
const authRoutes = express.Router();

//file-imports
const { registerController, loginController, logoutController, verifyTokenController, getUsers } = require("../controllers/authController");
const isAuth = require('../middlewares/isAuthMiddleware')
//apis

authRoutes
    .post('/register',registerController)
    .get('/verify/:token',verifyTokenController)
    .post('/login',loginController)
    .post("/logout",isAuth,logoutController)
    .get("/getUsers",getUsers)
module.exports = authRoutes;