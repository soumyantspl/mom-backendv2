const mongoose = require("mongoose");
const validator = require("validator");
const importEmployeeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            index: true,
        },
        empId: {
            type: String,
            index: true,
        },
        email: {
            type: String,
            validate: {
                validator: validator.isEmail,
                message: "{VALUE} is not a valid email",
            },
            default: null,
            required: true,
            index: true,
            unique: true,
        },
        designationName: {
            type: String,
            required: true,
        },
        departmentName: {
            type: String,
            required: true,
        },
        unitName: {
            type: String,
            required: true,
        },
        isActive: {
            type: Boolean,
            required: true,
            index: true,
            default: true,
        },
        isMeetingOrganiser: {
            type: Boolean,
            required: true,
            default: false,
        },
        isAdmin: {
            type: Boolean,
            required: true,
            index: true,
            default: false,
        },
        isEmployee: {
            type: Boolean,
            required: true,
            default: true,
        },
        isAdmin: {
            type: Boolean,
            required: true,
            default: false,
        },
        isDelete: {
            type: Boolean,
            required: true,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);
const ImportEmployee = mongoose.model("importEmployee", importEmployeeSchema);
module.exports = ImportEmployee;
