const jwt = require("jsonwebtoken");
const USER_SECRET = process.env.JWT_USER_SECRET;
const { course, user, purchase } = require("../database/index");
const express = require("express");
const Router = express.Router();
const userAuth = require("../middlewares/userAuth");
const { z } = require("zod");
const bcrypt = require("bcrypt");

Router.post("/signup", async (req, res) => {
    try {
        const userBody = z.object({
            name: z
                .string()
                .min(2, {
                    message: "Name is required!",
                })
                .max(30),
            email: z.string().email().max(50),
            password: z
                .string()
                .regex(
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,18}$/,
                    {
                        message:
                            "Password should contain atleast a lowercase, uppercase, number and a special character(!@#$%^&*)",
                    }
                ),
        });

        const validatedBody = userBody.safeParse(req.body);

        if (!validatedBody.success) {
            res.status(400).json({
                error: validatedBody.error.issues[0].message,
            });
            return;
        }

        const { name, email, password } = validatedBody.data;

        const userFound = await user.findOne({
            email: email,
        });

        if (!userFound) {
            const hashedPass = await bcrypt.hash(password, 10);
            await user.create({
                name: name,
                email: email,
                password: hashedPass,
            });
            res.status(201).json({ message: "Signup Successful!" });
        }else{
            res.status(403).json({error: "User already exits"});
        }

        
    } catch (err) {
        res.status(401).json({ error: err.message });
        console.log(err.message);
    }
});

Router.post("/signin", async (req, res) => {
    try {
        const userBody = z.object({
            email: z.string().email().max(50),
            password: z
                .string()
                .regex(
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,18}$/,
                    {
                        message:
                            "Password should contain atleast a lowercase, uppercase, number and a special character(!@#$%^&*)",
                    }
                ),
        });

        const validatedBody = userBody.safeParse(req.body);

        if (!validatedBody.success) {
            res.status(400).json({
                error: validatedBody.error.issues[0].message,
            });
            return;
        }

        const { email, password } = validatedBody.data;

        const userFound = await user.findOne({
            email: email,
        });

        const hashedPass = await bcrypt.compare(password, userFound.password);
        if (userFound && hashedPass) {
            const token = jwt.sign({
                id: userFound._id
            }, USER_SECRET, {
                expiresIn: "1h"
            })

            res.status(200).json({message: "Signin successful!", token: token})
        }else{
            res.status(401).json({error: "Unauthorized!"})
        }

    } catch (err) {
        res.status(401).json({ error: err.message });
        console.log(err.message);
    }
});

Router.get("/purchases", userAuth, async(req, res) => {
    const userId = req.userId;

    const userInfo = await user.findById(userId).populate("courses")

    if(userInfo){
        res.status(200).json({courses: userInfo.courses})
    }else{
        res.status(401).json({error: "User not found."});
    }
})

module.exports = Router;