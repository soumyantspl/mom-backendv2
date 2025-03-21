const express = require("express");
const app = express();
const leadRouter = require("./leadRouter")
const subscriptionRouter = require("./subscriptionRouter")
const organizationRouter = require ("./organizationRoter")
const adminAuthRouter = require ("./adminAuthRouter")



app.use(`/adminAuth`,adminAuthRouter);
app.use(`/organization`,organizationRouter);
app.use(`/lead`,leadRouter);
app.use(`/subscription`,subscriptionRouter);

module.exports = app;
