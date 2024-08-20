const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: [true, "User Name is required!"]
    },
    email: {
        type: String,
        required: [true, "Email is required!"],
        unique: true,
    },
    password: {
        type: String,
        required: [true, "Password number is required!"]
    }
})

module.exports = mongoose.model("User", userSchema);