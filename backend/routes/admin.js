const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET;
const { course, admin } = require("../database/index");
const express = require("express");
const Router = express.Router();
const adminAuth = require("../middlewares/adminAuth");
const { z } = require("zod");
const bcrypt = require("bcrypt");

Router.post("/signup", async (req, res) => {
    try {
        const adminBody = z.object({
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

        const validatedBody = adminBody.safeParse(req.body);

        if (!validatedBody.success) {
            res.status(400).json({
                error: validatedBody.error.issues[0].message,
            });
            return;
        }

        const { name, email, password } = validatedBody.data;

        const adminFound = await admin.findOne({
            email: email,
        });

        if (!adminFound) {
            const hashedPass = await bcrypt.hash(password, 10);
            await admin.create({
                name: name,
                email: email,
                password: hashedPass,
            });
            res.status(201).json({ message: "Signup Successful!" });
        }else{
            res.status(403).json({error: "Admin already exits"});
        }

        
    } catch (err) {
        res.status(401).json({ error: err.message });
        console.log(err.message);
    }
});

Router.post("/signin", async (req, res) => {
    try {
        const adminBody = z.object({
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

        const validatedBody = adminBody.safeParse(req.body);

        if (!validatedBody.success) {
            res.status(400).json({
                error: validatedBody.error.issues[0].message,
            });
            return;
        }

        const { email, password } = validatedBody.data;

        const adminFound = await admin.findOne({
            email: email,
        });

        const hashedPass = await bcrypt.compare(password, adminFound.password);
        if (adminFound && hashedPass) {
            const token = jwt.sign({
                id: adminFound._id,
                role: "admin"
            }, SECRET, {
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

Router.post('/create', adminAuth, async(req, res) =>{
    try{
        const body = z.object({
            name: z.string().min(10).max(50),
            description: z.string().min(15).max(150),
            cost: z.number()
        })

        const validatedBody = body.safeParse(req.body)

        if (!validatedBody.success) {
            res.status(400).json({
                error: validatedBody.error.issues[0].message,
            });
            return;
        }

        const {name, description, cost} = validatedBody.data;
        const adminId = req.adminId;
        console.log(adminId)

        const adminFound = await admin.findById(adminId)

        if(adminFound){
            const createdCourse = await course.create({
                name: name,
                description: description,
                author: adminFound.name,
                date: new Date(),
                cost: cost
            })
            console.log(createdCourse)
            console.log(adminFound);
            const courses = adminFound.courses

            courses.push(createdCourse._id);

            await admin.findByIdAndUpdate(
                adminId,
                {courses: courses}
            )

            res.status(201).json({message: "Course created successfully!", courseId: createdCourse._id});
        }else{
            res.status(401).json({error: "Admin not found!"})
        }

    }catch(err){
        res.status(500).json({ error: err.message });
        console.log(err);
    }
})

Router.delete('/delete/:id', adminAuth, async(req, res) => {
    try{
        const paramsSchema = z.object({
            id: z.string().regex(/^[a-f\d]{24}$/, {
                message: "Invalid course ID format"
            })
        })

        const validatedParams = paramsSchema.safeParse(req.params);

        if(!validatedParams.success){
            res.status(400).json({
                error: validatedParams.error.issues[0].message,
            });
            return;
        }

        const adminId = req.adminId;
        const foundAdmin = await admin.findById(adminId)

        const courseId = validatedParams.data.id;
        const deletedCourse = await course.findByIdAndDelete(courseId)
        
        if(deletedCourse){
            const courses = foundAdmin.courses.filter(x => x != courseId);

            await admin.findByIdAndUpdate(
                adminId,
                {courses: courses}
            )

            res.status(200).json({message: "Course deleted successfully!"})
        }else{
            res.status(404).json({error: "Course not found!"})
        }

    }catch(err){
        res.status(500).json({ message: err.message });
        console.log(err.message);
    }
})

module.exports = Router;