const express=require("express")
const {body}=require("express-validator")
const router=express.Router()
const {user_register,user_login}=require("../controllers/userController")

router.post("/user-register",[
    body("name").isString().withMessage("Name must be String").isLength({min:2,max:15}).withMessage("Name must be greater than 2 && less than 20 Characters"),
    body("email").isEmail().withMessage("Email is required"),
    body("password").isStrongPassword().withMessage("Password must be strong and unique"),
   body("conform_password").isStrongPassword().withMessage("Password must be strong and matching")
],user_register)

router.post("/user-login",[
    body("email").isEmail().withMessage("Enter registered Email"),
    body("password").isStrongPassword().withMessage("Enter password!")
],user_login)


module.exports=router