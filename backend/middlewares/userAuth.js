const jwt = require("jsonwebtoken");
const USER_SECRET = process.env.JWT_USER_SECRET;

function userAuth(req, res, next){
    try{
        const token = req.headers.authorization?.split(" ")[1];
        const verifiedToken = jwt.verify(token, USER_SECRET);

        if(verifiedToken){
            req.userId = verifiedToken.id;
            next()
        }else{
            res.status(403).json({Error: "Not a valid user."})
        }
    }catch(err){
        res.status(401).json({Error: "Access denied!"});
        console.log(`Error in auth: ${err}`);
    }
}

module.exports = userAuth;