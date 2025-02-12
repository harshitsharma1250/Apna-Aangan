import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const generateToken = (user, res) => {
    const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET, 
        { expiresIn: "7d" }
    );

    res.cookie("jwt-authorization", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000, 
        httpOnly: true, 
        sameSite: "strict",
        secure: process.env.NODE_ENV !== "development", 
    });
};
