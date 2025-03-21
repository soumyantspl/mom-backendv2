const mongoose = require("mongoose");
const validator = require("validator");

const AdminPanelSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, 
        required: true, 
        unique: true ,
        validate: {
            validator: validator.isEmail, 
        }
    },
    password: { type: String, required: true },
    isSuperAdmin:{ type:Boolean , default: true},
    isActive:{ type:Boolean , default: true},
}, 
{ timestamps: true });

module.exports = mongoose.model("AdminPanel", AdminPanelSchema);
