const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const app = express();
const admin = require('./routes/admin')
const user = require('./routes/user')
const course = require('./routes/course')

const PORT = process.env.PORT;

app.use(express.json());

app.use('/admin', admin);
app.use('/user', user)
app.use('/course', user)

app.listen(PORT, () => {console.log(`Server is running on port: ${PORT}`)})