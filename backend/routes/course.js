const { course, user, purchase } = require("../database/index");
const express = require("express");
const Router = express.Router();
const userAuth = require("../middlewares/userAuth");
const { z } = require("zod");

Router.post("/purchase", userAuth, async(req, res) => {
    try{
        const bodySchema = z.object({
            courseId: z.string().regex(/^[a-f\d]{24}$/, {
                message: "Invalid course ID format"
            })
        })

        const validatedBody = bodySchema.safeParse(req.body);

        if(!validatedBody.success){
            res.status(400).json({
                error: validatedBody.error.issues[0].message,
            });
            return;
        }
        
        const userId = req.userId;
        const courseId = validatedBody.data.id

        const courseInfo = await course.findById(courseId);
        const userInfo = await user.findById(userId)

        if(courseInfo && userId){
            const purchasedCourse = await purchase.create({
                purchaser: userId,
                courseId: courseId,
                date: new Date()
            })

            const courses = userInfo.courses;
            courses.push(purchasedCourse._id);

            await user.findByIdAndUpdate(
                userId,
                {courses: courses}
            )

            res.status(201).json({message: "Course purchased successfully"})
        }

    }catch(err){
        res.status(500).json({ error: err.message });
        console.log(err.message);
    }
})


Router.get('/', async(req, res) => {
    const courses = await course.find({});

    if(courses.length > 0){
        res.status(200).json({courses : courses});
    }else{
        res.status(404).json({error: "Courses not available yet!"});
    }
})

module.exports = Router;