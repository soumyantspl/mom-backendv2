const express = require("express");
const router = express.Router();
const DemoClientValidator = require("../validators/demoClientValidator");
const demoClientController = require("../controllers/demoClientController");
router.post(
  "/createDemoClient",
  DemoClientValidator.createDemoClientValidator,
  demoClientController.createDemoClient
);
router.post(
  "/demoSendOtp",
  DemoClientValidator.sendOtpValidator,
  demoClientController.demoSendOtp
);
router.post(
  "/verifyOtp",
  DemoClientValidator.verifyOtpValidator,
  demoClientController.verifyOtp
);

router.post(
  "/saveContactUsDetails",
  DemoClientValidator.saveContactUsDetailsValidator,
  demoClientController.saveContactUsDetails
);

router.post(
  "/contactUsendOtp",
  DemoClientValidator.contactUsendOtpValidator,
  demoClientController.contactUsendOtp
);

router.post(
  "/verifyContactUsOtp",
  DemoClientValidator.verifyContactUsOtpValidator,
  demoClientController.verifyContactUsOtp
);

module.exports = router;
