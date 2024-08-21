const JWT = require("jsonwebtoken");
const dotenv = require('dotenv');
const { StatusCodes } = require("http-status-codes");
dotenv.config();

module.exports = async (req, res, next) => {
    try {
        // get token
        const token = req.headers["authorization"].split(" ")[1];
        JWT.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                return res.status(StatusCodes.UNAUTHORIZED).send({
                    success: false,
                    message: "Un-Authorize User",
                });
            } else {
                // req.body.id = decode.id;
                req.user = user;
                next();
            }
        });
    } catch (error) {
        console.log(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
            success: false,
            message: "Please provide Auth Token",
            error,
        });
    }
};