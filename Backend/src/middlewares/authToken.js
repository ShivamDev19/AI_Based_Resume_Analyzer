const jwt =require("jsonwebtoken")

const authToken=async(req,res,next)=>{
    try {
        const Token=req.header("token")
        if(!Token){
           return res.status(400).json({message:"Acess Denied!",success:false})
        }

        const decode=jwt.verify(Token,process.env.JWT_SECRET)
        if(!decode){
            return res.status(400).json({message:"Invalid Token",success:false})
        }
         req.user = decode
        next()
        
    } catch (error) {
        return res.status(500).json({message:"Internal Server error",success:false})
    }

}

module.exports=authToken