const express = require("express");
const router = express.Router();
const adminPanelValidator = require("../validators/adminPanelValidator");
const adminPanelController = require("../controllers/adminPanelController");




router.post("/contact-list", 
    adminPanelValidator.contactListValidator,
    adminPanelController.getAllContacts);

    router.post("/organization-list", 
        adminPanelValidator.organizationListValidator,
        adminPanelController.getOrganizations);
    
   
 module.exports = router;