const mongoose = require("mongoose");
const { Schema } = mongoose;
const { ObjectId } = mongoose.Schema.Types;

mongoose.connect(process.env.MONGO_URI);

const userSchema = new Schema({
    name: String,
    email: {type: String, unique: true},
    password: String,
    courses: {type: [ObjectId], ref: "courses"}
})

const adminSchema = new Schema({
    name: String,
    email: {type: String, unique: true},
    password: String,
    courses: {type: [ObjectId], ref: "courses"}
})

const courseSchema = new Schema({
    name: String,
    description: String,
    author: String,
    cost: Number,
    content: [{
        title: String, 
        body: String,
        duration: String,
        videoUrl: String
    }]
})

const purchaseSchema = new Schema({
    purchaser: {type: [ObjectId], ref: "courses"},
    courseId: {type: [ObjectId], ref: "courses"},
    date: Date
})

const user = mongoose.model("user", userSchema);
const admin = mongoose.model("admin", adminSchema);
const course = mongoose.model("courses", courseSchema);
const purchase = mongoose.model("purchases", purchaseSchema);

module.exports = {
    user,
    admin,
    course,
    purchase
}