const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const departmentController = require("../controllers/departmentController");
const departmentValidator = require("../validators/departmentValidator");

//CREATING DEPARTMENT USING ORGANIZATION_ID
router.post(
  "/createDepartment",
  departmentValidator.createDepartmentValidator,
  authMiddleware.verifyUserToken,
  departmentController.createDepartmentController
);
//EDIT  DEPARTMENT USING ORGANIZATION_ID
router.post(
  "/editDepartment/:id",
  departmentValidator.editDepartmentValidator,
  authMiddleware.verifyUserToken,
  departmentController.editDepartmentController
);
//DELETE DEPARTMEMNT
router.delete(
  "/deleteDepartment/:id",
  departmentValidator.deleteDepartmentValidator,
  authMiddleware.verifyUserToken,
  departmentController.deleteDepartmentController
);
//LIST DEPARTMENT
router.post(
  "/listDepartment",
  departmentValidator.listDepartmentValidator,
  authMiddleware.verifyUserToken,
  departmentController.listDepartmentController
);

module.exports = router;
