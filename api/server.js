import express from 'express';
import cors from 'cors';
const app = express();

app.use(express.json());
app.use(cors({
    credentials:true,
    origin: 'http://localhost:5173',
})) ;

app.get('/test', (req, res)=>{
    res.send("Hello, world!");
    console.log("Hello, world!");
})
app.listen(3000, (req, res)=>{
    console.log("Server listening on port 3000")
})