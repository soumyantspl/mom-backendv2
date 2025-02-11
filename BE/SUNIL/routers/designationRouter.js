const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const designationValidator = require("../validators/designationValidator");
const designationController = require("../controllers/designationController");

//FUNCTION TO CREATING DESIGNATION
router.post(
  "/createDesignation",
  designationValidator.validateCreateDesignation,
  authMiddleware.verifyUserToken,
  designationController.createDesignationController
);
//FUNCTION TO EDIT DESIGNATION
router.post(
  "/editDesignation/:id",
  designationValidator.editDesignationValidator,
  authMiddleware.verifyUserToken,
  designationController.editDesignationController
);
//FUNCTION TO DELETE DESIGNATION
router.delete(
  "/deleteDesignation/:id",
  designationValidator.deleteDesignationValidator,
  authMiddleware.verifyUserToken,
  designationController.deleteDesignationController
);
//FUNCTION GET TO LIST DESIGNATION
router.post(
  "/listDesignation",
  designationValidator.listDesignationValidator,
  authMiddleware.verifyUserToken,
  designationController.listDesignationController
);
module.exports = router;
