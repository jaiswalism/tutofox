const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET;

function adminAuth(req, res, next){
    try{
        const token = req.headers.authorization?.split(" ")[1];

        const verifiedToken = jwt.verify(token, SECRET);

        if(verifiedToken.role == "admin"){
            req.adminId = verifiedToken.id;
            next()
        }else{
            res.status(403).json({Error: "Not a valid admin."})
        }

    }catch(err){
        res.status(401).json({Error: "Access denied!"});
        console.log(`Error in auth: ${err.message}`);
    }
}

module.exports = adminAuth;