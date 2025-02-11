const express = require("express");
const router = express.Router();
const validator = require("../validators/configValidator");
const authMiddleware = require("../middlewares/authMiddleware");
const alertController = require("../controllers/alertController");

/* EDIT CONFIGURATION  */
router.post(
  "/editAlert",
  // validator.updateConfigValidator,
  authMiddleware.verifyUserToken,
  alertController.createAlert
);

module.exports = router;
