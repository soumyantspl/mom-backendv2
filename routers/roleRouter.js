const express = require("express");
const router = express.Router();
const roleController = require("../controllers/roleController");
const validator = require("../validators/roleValidator");
const authMiddleware = require("../middlewares/authMiddleware");

/* CREATE ROLE */
router.post(
  "/createRole",
  validator.createRoleValidator,
  authMiddleware.verifyUserToken,
  roleController.createRole
);

/* EDIT ROLE  */
router.put(
  "/updateRole/:id",
  validator.updateRoleValidator,
  authMiddleware.verifyUserToken,
  roleController.editRole
);

/* VIEW ROLE  */
router.get(
  "/viewRole",
  validator.viewRoleValidator,
  authMiddleware.verifyUserToken,
  roleController.viewRole
);

/* DELETE ROLE  */
router.delete(
  "/deleteRole/:id",
  validator.deleteRoleValidator,
  authMiddleware.verifyUserToken,
  roleController.deleteRole
);
module.exports = router;
