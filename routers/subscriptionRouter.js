const express = require("express");
const router = express.Router();
const subscriptionController = require("../controllers/subscriptionController");
const subscriptionValidator = require("../validators/subscriptionValidator");


router.post("/add-subscription", 
    subscriptionValidator.addSubscriptionValidator, 
    subscriptionController.addSubscription);

module.exports = router;
