const express = require("express");
const router = express.Router();
const unitController = require("../controllers/unitController");
const unitValidator = require("../validators/unitValidator");
const authMiddleware = require("../middlewares/authMiddleware");

// CREATE UNIT
router.post(
  "/createUnit",
  unitValidator.createUnitValidator,
  authMiddleware.verifyUserToken,
  unitController.createUnit
);
//EDIT UNIT
router.put(
  "/editUnit/:id",
  unitValidator.editUnitValidator,
  authMiddleware.verifyUserToken,
  unitController.editUnit
);
//DELETE UNIT
router.delete(
  "/deleteUnit/:id",
  unitValidator.deleteUnitValidator,
  authMiddleware.verifyUserToken,
  unitController.deleteUnit
);
//LIST UNIT API
router.post(
  "/listUnit",
  unitValidator.listUnitValidator,
  authMiddleware.verifyUserToken,
  unitController.listUnit
);
//LIST UNIT API
router.post("/createEvent", unitController.createEvent);
//LIST UNIT API
router.post(
  "/listAllUnitForMeeting",
  unitValidator.listUnitValidator,
  authMiddleware.verifyUserToken,
  unitController.listAllUnitForMeeting
);
module.exports = router;
