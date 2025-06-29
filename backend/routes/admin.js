const jwt = require("jsonwebtoken");
const ADMIN_SECRET = process.env.JWT_ADMIN_SECRET;
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
                id: adminFound._id
            }, ADMIN_SECRET, {
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
                cost: cost,
                creatorId: adminId
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

Router.delete('/course/:id', adminAuth, async(req, res) => {
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

Router.put('/courseContent', adminAuth, async (req, res) => {
    try{
        const bodySchema = z.object({
            courseId: z.string().regex(/^[a-f\d]{24}$/, {
                    message: "Invalid course ID format"
                }),
            title: z.string().min(10).max(50),
            body: z.string().min(10).max(150),
            duration: z.string(),
            videoUrl: z.string().url()
        })

        const validatedBody = bodySchema.safeParse(req.body);

        if(!validatedBody.success){
            res.status(400).json({
                error: validatedBody.error.issues[0].message,
            })
            return;
        }

        const { courseId, title, body, duration, videoUrl } = validatedBody.data;

        const adminId = req.adminId;
        const courseFound = await course.findById(courseId);

        if(courseFound && courseFound.creatorId == adminId){
            const courseContent = courseFound.content
            console.log({
                courseFound,
                courseContent
            })
            const contentExists = courseContent.find(obj => obj.title === title && obj.body === body)
            if(!contentExists){
                courseFound.content.push({
                    title: title,
                    body: body,
                    duration: duration,
                    videoUrl: videoUrl
                })

                await courseFound.save();

                console.log(courseFound);
                res.status(201).json({message: "Content added successfully!"});
            }else{
                res.status(403).json({message: "Course content already exists!"});
            }
        }else{
            res.status(404).json({error: "Course not found!"});
        }

    }catch(err){
        res.status(500).json({ message: err.message });
        console.log(err.message);
    }
})

Router.delete('/courseContent', adminAuth, async (req, res) => {
    try{
        const bodySchema = z.object({
            courseId: z.string().regex(/^[a-f\d]{24}$/, {
                    message: "Invalid course ID format"
                }),
            title: z.string().min(10).max(50),
            body: z.string().min(10).max(150)
        })

        const validatedBody = bodySchema.safeParse(req.body);

        if(!validatedBody.success){
            res.status(400).json({
                error: validatedBody.error.issues[0].message,
            })
            return;
        }

        const { courseId, title, body } = validatedBody.data;

        const courseFound = await course.findById(courseId);

        if(courseFound){
            courseFound.content = courseFound.content.filter((x) => {
                x.title !== title && x.body !== body
            })

            await courseFound.save();

            console.log(courseFound);
            res.status(201).json({message: "Content deleted successfully!"});
        }else{
            res.status(404).json({error: "Course not found!"});
        }

    }catch(err){
        res.status(500).json({ message: err.message });
        console.log(err.message);
    }
})

module.exports = Router;