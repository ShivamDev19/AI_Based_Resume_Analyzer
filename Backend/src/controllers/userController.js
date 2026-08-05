
const {validationResult}=require("express-validator")
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require("../models/user");


const user_register=async(req,res)=>{
 try {
    const errors=validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({message:errors.array()[0].msg,success:false})
    }

    const {name,email,password,conform_password}=req.body

    const user_exists=await UserModel.findOne({email:email})
    if(user_exists){
         return res.status(400).json({message:"User Already exists with this email",success:false})
    }
    
    if(password!=conform_password){
        return res.status(400).json({message:"Password is not matching check again!",success:false})

    }

   const saltRounds = 10;
   const salt = bcrypt.genSaltSync(saltRounds);
   const encrypted_password= await bcrypt.hash(password, salt)
   const token = jwt.sign({ email: email, 
        name: name,
        _id:user_exists?._id}, process.env.JWT_SECRET,{ expiresIn: process.env.JWT_EXPIRES_IN })
  const newUser= await UserModel.create({
    name:name,
    email:email,
    password:encrypted_password
  })
  
return res.status(200).json({message:'user created sucessfully!',success:true,token: token})

    
 } catch (error) {
    console.log(error)
    return res.status(500).json({message:"Interal Server error",success:false})
 }
}


const user_login=async(req,res)=>{
    try {
         const errors=validationResult(req)
    if(!errors.isEmpty()){
        return  res.status(400).json({message:errors.array()[0].msg,success:false})
    }
      const{email,password}=req.body

    const user_exists=await UserModel.findOne({email:email})

    if(!user_exists){
        return res.status(400).json({message:"User not found!",success:false})
    }
    
    const user_pass= await bcrypt.compare(password,user_exists.password)
    if(!user_pass){
        return res.status(400).json({message:"Invalid Pass",success:false})
    }
     const token = jwt.sign({ email: email, 
        name: user_exists.name,
        _id: user_exists._id  }, process.env.JWT_SECRET,{ expiresIn: process.env.JWT_EXPIRES_IN })

return res.status(200).json({message:'loggedIn sucessfully!',success:true,token: token})

        
    } catch (error) {
         return res.status(500).json({message:"Interal Server error",success:false})
    }
}

module.exports={
    user_register,
    user_login
}