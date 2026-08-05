const mongoose = require('mongoose');
const userSChema= new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true},
    password:{
        type:String,
        required:true
    },
    role:{
        type: String,
    enum: ['user', 'admin'],
    default: 'user'
    }
},{timestamps:true})


const userModel=mongoose.model("User",userSChema)

module.exports=userModel