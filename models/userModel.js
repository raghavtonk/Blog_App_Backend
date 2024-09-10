const bcrypt = require('bcryptjs');
const ObjectId = require('mongodb').ObjectId;
//file-imports
const userSchema = require("../schemas/userSchema");
const { genrateToken, sendEmailVerificationMail } = require('../utils/authUtil');
const { accessSync } = require('fs');
const userModel = class{
    constructor({name,email,username,password}){
        this.name = name;
        this.email = email;
        this.username = username;
        this.password = password;
    }

    registerUserClassFunc(){
        return new Promise(async(resolve,reject)=>{
            //check if username and email exist or not
            const userExist = await userSchema.findOne({
                $or: [{email: this.email},{username: this.username}]
            });
            if(userExist?.email === this.email){
                return reject("Email already exist");
            }
            if(userExist?.username === this.username){
                return reject("Username already exist");
            }
            //hashed the Password
            const hashPassword = await bcrypt.hash(this.password,Number(process.env.SALT))
            //saving the data in mongoDB
            try {
                const userDBOjt = userSchema.create({
                    name: this.name,
                    email: this.email,
                    username: this.username,
                    password: hashPassword
                });
                const token = genrateToken(this.email);
                console.log('token',token);
                sendEmailVerificationMail(this.email,token);
                resolve(userDBOjt);
            } catch (error) {
                reject(error);
            }
        })
    }

    static  findUserWithKey({key}){
        return new Promise(async(resolve,reject)=>{
            try{
                const userExist = await userSchema.findOne({
                    $or: [ ObjectId.isValid(key) ? {_id: key}: {email: key},{username: key}]
                }).select("+password");
                if(!userExist) reject("User not found");
                resolve(userExist);
            }catch(error){
                reject(error)
            }
          
        })
    }

    static verifyTokenfunc(email){
        new Promise(async (resolve,reject)=>{
            try {
                const userDBUpdated = await userSchema.findOneAndUpdate({email},{isEmailVerified : true});
                console.log(userDBUpdated);
                resolve();
            } catch (error) {
                reject(error)
            }
           
        })
    }

    static getUser(userId){
        return new Promise(async (resolve,reject)=>{
            try {
                if(userId){
                    const userDB = await userSchema.find({_id:{$nin:[userId]}})
                    if(!userDB) {return reject('users data not found')};
                     return resolve(userDB)
                }else{
                    const userDB = await userSchema.find({_id:{$nin:[]}})

                    if(!userDB){return reject('users data not found')};
                    return resolve(userDB)
                }
            } catch (error) {
                return reject(error)
            }
        })
    }
}

module.exports = userModel;