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
import multer from "multer";
import fs from "fs";
import {PlaceModel} from './models/Place.js'
import {BookingModel} from './models/Booking.js'
import { error } from 'console';

const __dirname = dirname(fileURLToPath(import.meta.url));

dotenv.config();
const app = express();
app.use('/uploads', express.static(__dirname + '/uploads'));


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
    if (!link.startsWith('http://') && !link.startsWith('https://')) {
        return res.status(400).json({ error: 'Invalid URL. Must start with http:// or https://' });
    }

    const newName = "photo" + Date.now() +'.jpg'
    await imageDownloader.image({
        url: link,
        dest : __dirname + '/uploads/' + newName,
    })
    res.json(newName)
} )


const photosMiddleware = multer({dest:'uploads/'})
app.post('/upload', photosMiddleware.array('photos',100), async (req,res)=>{
    if(!req.files){
        return res.status(400).json({error: 'No files uploaded'})
    }
    try {
        // console.log(req.files)
        const uploadedFiles = []
        for(let i = 0;i<req.files.length;i++){
            const {path, originalname} = req.files[i] ;
            const parts = originalname.split('.')
            const ext = parts[parts.length - 1] ;
            const newPath = path.replace(/\\/g, '/') + '.' + ext;
            fs.renameSync(path, newPath)
            uploadedFiles.push(newPath.replace('uploads/', ''))
        
        }
        res.json(uploadedFiles)
    }catch (error) {
        console.error("Upload Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
} )

app.post('/places', async (req, res) => {
    try {
        const { title, address, addedPhotos, description, perks, extraInfo, checkIn, checkOut, maxGuests, price } = req.body;

        const token = req.cookies["jwt-authorization"];
        if (!token) {
            return res.status(401).json({ error: "Unauthorized: No token provided" });
        }

        jwt.verify(token, process.env.JWT_SECRET, async (err, userData) => {
            if (err) {
                return res.status(403).json({ error: "Forbidden: Invalid token" });
            }

            const placeDoc = await PlaceModel.create({
                owner: userData.userId, 
                title,
                address,
                photos:addedPhotos,
                description,
                perks,
                extraInfo,
                checkIn,
                checkOut,
                maxGuests,
                price
            });
            // console.log(placeDoc)
            return res.json(placeDoc);
        });

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get('/user-places', (req,res)=>{
    try {
        const token = req.cookies["jwt-authorization"];
        if (!token) {
            return res.status(401).json({ error: "Unauthorized: No token provided" });
        }

        jwt.verify(token, process.env.JWT_SECRET, async (err, userData) => {
            if (err) {
                return res.status(403).json({ error: "Forbidden: Invalid token" });
            }
            const {userId} = userData
            res.json(await PlaceModel.find({owner:userId}))
        });

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
})

app.get('/places/:id', async (req,res)=>{
    const {id} = req.params
    res.json(await PlaceModel.findById(id));
})

app.put('/places', async (req,res)=>{
    try {
        const token = req.cookies["jwt-authorization"];
        const {
            id,
            title,
            address,
            addedPhotos:photos,
            description,
            perks,
            extraInfo,
            checkIn,
            checkOut,
            maxGuests,
            price
        } = req.body ;
        console.log("Here is the request body ", req.body)

        jwt.verify(token, process.env.JWT_SECRET, async (err, userData) => {
            if (err) {
                return res.status(403).json({ error: "Forbidden: Invalid token" });
            }
            const {userId} = userData
            const placeDoc = await PlaceModel.findById(id)
            if(userId === placeDoc.owner.toString()) {
                placeDoc.set({
                    title,
                    address,
                    photos,
                    description,
                    perks,
                    extraInfo,
                    checkIn,
                    checkOut,
                    maxGuests,
                    price
                })
                await placeDoc.save()
                res.json(placeDoc)
            }
        });

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
})

app.get('/places', async (req,res)=>{
    res.json(await PlaceModel.find())
})

app.post('/bookings', (req,res)=>{
    const {
    place,
    checkIn,
    checkOut,
    numberOfGuests,
    name,
    phone,
    price} = req.body 
    
    BookingModel.create({
        place, checkIn, checkOut, numberOfGuests, name, phone, price
    }).then((err,doc)=>{
        if(err){
            throw error
        }
        res.json(doc)
    })
    

})
app.listen(3000, (req, res)=>{
    console.log("Server listening on port 3000")
    connectDb();
})
