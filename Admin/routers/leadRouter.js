const express = require("express");
const router = express.Router();
const leadValidator = require("../validators/leadValidator");
const authMiddleware = require("../../middlewares/authMiddleware");
const leadController = require("../controllers/leadController");


router.post("/contact-list", 
    leadValidator.contactListValidator,
    leadController.getAllContacts);


 router.put("/cancel-lead/:contactId",
    leadValidator.cancelLeadValidator, 
    leadController.cancelLead);

router.put("/close-lead/:contactId",
    leadValidator.closeLeadValidator,  
    leadController.closeLead);


router.put("/reject-lead/:contactId",
    leadValidator.rejectLeadValidator,  
    leadController.rejectLead);

 router.post("/forward-lead/:contactId", 
    leadValidator.forwardLeadValidator,
    leadController.forwardLead);

router.get("/lead/:contactId", 
    leadValidator.viewSingleLeadValidator, 
    leadController.viewSingleLeadById);


 module.exports = router;