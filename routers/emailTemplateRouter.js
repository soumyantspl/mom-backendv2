const express = require("express");
const router = express.Router();
const emailTemplateController = require("../controllers/emailTemplateController");
// const sendEmailController = require("../controllers/sendEmailController");
const validateEmailTemplate = require("../validators/emailtemplateValidator");

router.post(
  "/createTemplate",
  validateEmailTemplate.createTemplateValidator,
  emailTemplateController.createEmailTemplate
);

router.get(
  "/alltemplates/:organizationId",
//   validateEmailTemplate.allTemplateValidator,
  emailTemplateController.getAllEmailTemplates
);

router.get(
  "/:templateType",
  validateEmailTemplate.templateByTypeValidator,
  emailTemplateController.getEmailTemplateByType
);

router.post(
  "/email-templates/:organizationId",
  validateEmailTemplate.updateTemplateValidator,
  emailTemplateController.updateEmailTemplate
);

//router.post("/send-otp", sendEmailController.sendOtpEmail);

module.exports = router;