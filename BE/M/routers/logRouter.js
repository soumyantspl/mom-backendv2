const express = require("express");
const router = express.Router();
const logController = require("../controllers/logController");
const validator = require("../validators/logValidator");
const authMiddleware = require("../middlewares/authMiddleware");

/* VIEW LOG LIST  */
router.post(
  "/viewLogs",
  validator.viewLogsValidator,
  authMiddleware.verifyUserToken,
  logController.viewLogs
);

module.exports = router;
