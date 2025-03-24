const express = require("express");
const router = express.Router();
const adminAuthValidator = require("../validators/adminAuthValidator");
const authMiddleware = require("../../middlewares/authMiddleware");
const adminAuthController = require("../controllers/adminAuthController");


router.post("/add-admin",
    adminAuthValidator.addAdminValidator,
    adminAuthController.addAdminController);

router.post("/loginByPassword", 
    adminAuthValidator.loginByPasswordValidator, 
    adminAuthController.loginByPassword);

router.post("/setPassword", 
    adminAuthValidator.setPasswordValidator,
   // authMiddleware.verifyUserToken, 
    adminAuthController.setPassword);

/* SEND OTP AT SIGN IN USER BY OTP */
router.post("/sendOtp", 
    adminAuthValidator.sendOtpValidator, 
    adminAuthController.sendOtp);

/* VERIFY OTP FOR SIGN IN  */
router.post(
  "/verifyOtp",
  adminAuthValidator.verifyOtpValidator,
  adminAuthController.verifyOtp
);

/* RESEND OTP TO USER BY EMAIL */
router.post("/reSendOtp", 
    adminAuthValidator.sendOtpValidator, 
    adminAuthController.reSendOtp);



 module.exports = router;