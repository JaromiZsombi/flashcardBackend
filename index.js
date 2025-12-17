import express from "express";
import jwt from "jsonwebtoken";
import cors from "cors";
import dotenv from "dotenv"; 
import cookieParser from "cookie-parser";
dotenv.config()

const app = express()
app.use(cors({
    origin:"http://localhost:5173",//frontend címe
    credentials:true//engedélyezzük a sütik közlését
}))
app.use(express.json())
app.use(cookieParser())
//A HTML cookie: cookie: theme = dark, token = anbcubsd
//request.cookie={theme:"...", token:"..."}

app.post("/login",(req,resp)=>{
    const {key} = req.body
    if(key!==process.env.AUTH_KEY) return resp.status(401).json({error:"Invalid key!!!"})
    const token=jwt.sign({access:true}, process.env.JWT_SECRET,{expiresIn:"2h"})
    resp.cookie("token", token,{
        httpOnly:true,//JS nem fér hozzá
        secure:false,//prod-ban true : https
        sameSite:"strict",
        maxAge:2*60*60*1000//2h-t él a kukim
    })
    resp.sendStatus(200)
})

//get végpont: ami csak akkor ad választ ha kéréshez érvényes JWT token tartozik
app.get("/protected",(req, resp)=>{
    console.log("protected")
    try {
        const token = req.cookies.token
        if(!token) throw new Error();
        jwt.verify(token, process.env.JWT_SECRET)
        resp.sendStatus(200)
    } catch (error) {
        resp.send(401)
    }
})

app.post("/logout", (req, resp)=>{
    resp.clearCookie("token")
    resp.sendStatus(200)
})

const port = process.env.PORT || 3001
app.listen(port, ()=>console.log(`server is listening on port: ${port}`))