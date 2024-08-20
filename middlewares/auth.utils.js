const bcrypt = require('bcryptjs')

const hashPassword = async (password) => {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
};

const comparePassword = async (password, hashedPassword) => {
    try {
        const isMatch = await bcrypt.compare(password, hashedPassword);
        if (!isMatch) {
            return {
                success: false,
                status: StatusCodes.UNAUTHORIZED,
                message: "Invalid Credentials",
            };
        }
        return {
            success: true,
        };
    } catch (error) {
        return {
            success: false,
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: "Error in Password Comparison",
            error,
        };
    }
};



module.exports = {hashPassword , comparePassword};