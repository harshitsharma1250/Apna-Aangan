import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv' ;
import mongoose from 'mongoose';
import { User } from './models/User.js';
import bcryptjs from 'bcryptjs';
import { generateToken } from './generateToken.js';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken'
import imageDownloader from 'image-downloader'
import {dirname} from 'path'
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

dotenv.config();
const app = express();
app.use('/uploads', express.static(__dirname+'/uploads'));


const connectDb = async () =>{
    try{
        const connection = await mongoose.connect(process.env.MONGO_URL)
        console.log('Database connected')
    }
    catch(error){
        console.log("Can't connect to Database ", error.message)
        process.exit(1)
    }
}


app.use(cors({
    credentials:true,
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
})) ;

app.use(express.json());
app.use(cookieParser())

app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    const salt = await bcryptjs.genSalt(10)
    const hashedPassword = await bcryptjs.hash(password, salt)
    
    const newUser = await User.create({
        name: name,
        email: email,
        password: hashedPassword,
    })

    res.status(201).json(newUser);

});

app.post('/login', async (req, res) => {
    try {
        const {email, password} = req.body ;
        if(!password || !email){
            console.log("Error : All fields are required")
            return res.status(400).json({ success: false, message: "Please fill in all fields."});
        }
        const user = await User.findOne({
            email:email
        })
        if(!user){
            return res.status(400).json({success:false, message:"Email not found"})
        }
        const isPasswordCorrect = await bcryptjs.compare(password, user.password)
        if(!isPasswordCorrect){
            return res.status(400).json({success:false, message:"Password is incorrect"})
        }

        generateToken(user, res)
        return res.status(200).json({success: true, message: "Login success", user:{
            ...user._doc,
            password:"",
        }})

    } catch (error) {
        console.log(error)
        return res.status(500).json({success: false, message:"Error occured while login"}) 
    }

});

app.get('/profile', (req, res) => {
    const token = req.cookies["jwt-authorization"];  
    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, {}, async (err, userData) => {
            if (err) {
                console.error("JWT Verification Error:", err);
                return res.status(401).json({ error: "Unauthorized" });
            }
            const user = await User.findById(userData.userId); 
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }
            const { name, email, _id } = user;
            res.json({ name, email, _id });
        });
    } else {
        res.json(null);
    }
});


app.post('/logout', (req,res)=>{
    res.cookie('jwt-authorization','').json(true)
})

app.post('/upload-by-link', async (req, res)=>{
    const {link} = req.body ;
    const newName = Date.now() +'.jpg'
    await imageDownloader.image({
        url: link,
        dest : __dirname + '/uploads/' + newName,
    })
    res.json(__dirname + '/uploads/' + newName)
} )

app.listen(3000, (req, res)=>{
    console.log("Server listening on port 3000")
    connectDb();
})
