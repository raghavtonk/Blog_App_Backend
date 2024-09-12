const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require("../models/userModel");
const userSchema = require("../schemas/userSchema");
const { userDataValidation, loginDataValidation } = require("../utils/authUtil");

const registerController = async(req,res)=>{
    const {name,email,username,password} = req.body;
    //Data Validation
    try {
        await userDataValidation({email,username,password});
    } catch (error) {
        return res.send({status: 400, message: "Data invalid",error:error})
    }
    //register user in DB
    const userModelObj = new userModel({name,email,username,password})
    try{
        const userDB = await userModelObj.registerUserClassFunc();

        return res.send({status: 201, message: "User registered successfully",data:userDB});
    }catch(error){
        console.log(error)
        return res.send({status: 500, message: "Internal server Error", error: error});
    }
}

const verifyTokenController = async(req,res)=>{
    const token = req .params.token;
    try {
        const email = jwt.verify(token,process.env.SECRET_KEY);
   
    
    try {
        const userVerifiedDB = await userModel.verifyTokenfunc(email);
        return res.send({status: 200, message: "Email verified successfully"});
    } catch (error) {
        console.log(error)
        return res.send({status: 500, message: "Internal server Error", error: error});
    }
} catch (error) {
    console.log(error)
    return res.send({status: 400, message:"invalid signature", error:error})
}
    
}

const loginController = async(req,res)=>{
    const {loginId, password} = req.body
    try {
        await loginDataValidation({loginId,password});
    } catch (error) {
       return res.send({status: 400, message: "Data invalid",error:error})
    }
    try{
       const userDB = await userModel.findUserWithKey({key:loginId});
       //check if user varified email or not 
       if(!userDB.isEmailVerified){
        return res.send({status: 400, message: "Please verify your email, before login"})
       }
        //matching password
        const isMatched = await bcrypt.compare(password, userDB.password)
        if(!isMatched){
            return res.send({status: 400, message: "Incorrect password"});
        }
        req.session.isAuth = true;
        req.session.user = {userId: userDB._id,username: userDB.username , userEmail: userDB.email}
       
        return res.send({status: 200, message: "login successfully", data: userDB});
   
    }catch(error){
        console.log(error)
        return res.send({status: 500, message: "Internal server Error", error: error});
    }
}
const logoutController = (req,res)=>{
    req.session.destroy((error)=>{
        if(error) return res.send({status: 400, message: "logout unseccessfull"});
        else {
            res.clearCookie('connect.sid', {
                httpOnly: true,
                secure: true,  // Set to true if you're using HTTPS
                sameSite: 'None',  // Adjust according to your needs
                expires: new Date(0)  // Expiration date in the past
            });
            return res.send({status: 200, message: "logout successfull"});
        }
    })
}

const getUsers = async (req,res)=>{
    let userId = null;
    if(req.session.user){
       userId = req.session.user.userId;
    }
    try {
        const userDB = await userModel.getUser(userId)
        return res.send({status: 200, message:"Users Info retrieve", data:userDB})
    } catch (error) {
        console.log(error)
        return res.send({status: 500, message: "Internal server Error", error: error});
    }
}
module.exports = {registerController, loginController, logoutController,verifyTokenController, getUsers};