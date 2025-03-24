const express = require("express");
const router = express.Router();
const emailLogValidator = require("../validators/emailLogValidator");
const authMiddleware = require("../../middlewares/authMiddleware");
const emailLogController = require("../controllers/emailLogController");

router.post(
    "/emailLogs-list",
    emailLogValidator.emailLogListValidator,
    emailLogController.getEmailLogs
);

module.exports = router;
