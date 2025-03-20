const express = require("express");
const router = express.Router();
const adminPanelValidator = require("../validators/adminPanelValidator");
const adminPanelController = require("../controllers/adminPanelController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/contact-list",
    adminPanelValidator.contactListValidator,
    adminPanelController.getAllContacts);

router.post("/organization-list",
    adminPanelValidator.organizationListValidator,
    adminPanelController.getOrganizations);


    router.post("/add-admin",
        adminPanelValidator.addAdminValidator,
        adminPanelController.addAdminController);

    router.post("/loginByPassword", 
        adminPanelValidator.loginByPasswordValidator, 
        adminPanelController.loginByPassword);
    
    router.post("/set-password", 
        adminPanelValidator.setPasswordValidator,
       // authMiddleware.verifyUserToken, 
        adminPanelController.setPassword);


module.exports = router;