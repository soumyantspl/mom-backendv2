const express = require("express");
const router = express.Router();
const configController = require("../controllers/configController");
const validator = require("../validators/configValidator");
const authMiddleware = require("../middlewares/authMiddleware");
const alertsCron = require("../cronJob/index");
/* CREATE CONFIGURATION  */
router.post(
  "/createConfiguration",
  // validator.createConfigValidator,
  authMiddleware.verifyUserToken,
  configController.createConfig
);

/* EDIT CONFIGURATION  */
router.post(
  "/editConfiguration/:id",
  validator.updateConfigValidator,
  authMiddleware.verifyUserToken,
  configController.editConfig
);

/* VIEW CONFIGURATION  */
router.get(
  "/viewConfiguration/:organizationId",
  validator.viewConfigValidator,
  authMiddleware.verifyUserToken,
  configController.viewConfig
);

/* DELETE CONFIGURATION  */
router.delete(
  "/deleteConfiguration/:id",
  validator.deleteConfigValidator,
  authMiddleware.verifyUserToken,
  configController.deleteConfig
);

// Get Days option
router.get(
  "/getDaysOption",
  validator.getDaysOptionValidator,
  authMiddleware.verifyUserToken,
  configController.fetchDaysOptionLimit
);
// ("/* Create Alert */");
// router.post("/alertTest",alertsCron.alertsCron);
module.exports = router;
