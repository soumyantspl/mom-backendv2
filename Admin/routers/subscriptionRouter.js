const express = require("express");
const router = express.Router();
const subscriptionController = require("../controllers/subscriptionController");
const subscriptionValidator = require("../validators/subscriptionValidator");

/** ROUTE - TO ADD SUBSCRIPTION  **/
router.post(
  "/add-subscription",
  subscriptionValidator.addSubscriptionValidator,
  subscriptionController.addSubscription
);

/** ROUTE - TO GET SUBSCRIPTION LIST **/
router.get(
  "/subscriptions-list", 
  // subscriptionValidator.subscriptionListValidator,
  subscriptionController.getSubscriptions
);

router.put(
  "/update-subscription/:id",
  subscriptionValidator.updateSubscriptionValidator,
  subscriptionController.updateSubscription
);

router.delete(
  "/delete-subscription/:id",
  subscriptionValidator.deleteSubscriptionValidator,
  subscriptionController.deleteSubscription
);

router.get(
  "/subscriptionbyid/:id",
  subscriptionValidator.getSubscriptionByIdValidator,
  subscriptionController.getSubscriptionById
);

module.exports = router;
