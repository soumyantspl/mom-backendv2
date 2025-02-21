const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const validator = require("../validators/authValidator");

/* SEND OTP AT SIGN IN USER BY OTP */
router.post("/sendOtp", validator.sendOtpValidator, authController.sendOtp);

/* VERIFY OTP FOR SIGN IN  */
router.post(
  "/verifyOtp",
  validator.verifyOtpValidator,
  authController.verifyOtp
);

/* RESEND OTP TO USER BY EMAIL */
router.post("/reSendOtp", validator.sendOtpValidator, authController.reSendOtp);

/* SET PASSWORD */
router.post(
  "/setPassword",
  validator.setPasswordValidator,
  authController.setPassword
);

/* SET PASSWORD FOR FORGOT*/
router.post(
  "/forgotPassword",
  validator.setPasswordValidator,
  authController.forgotPassword
);
/* SIGN IN BY PASSWORD */
router.post(
  "/signInByPassword",
  validator.signInByPasswordValidator,
  authController.signInByPassword
);

/* SIGN IN BY GMAIL */
router.post(
  "/logInByGmail",
  //validator.signInByPasswordValidator,
  authController.loginByGmail
);

module.exports = router;
