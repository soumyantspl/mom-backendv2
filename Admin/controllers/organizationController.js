const { errorLog } = require("../../middlewares/errorLog");
const Responses = require("../../helpers/response");
const organizationService = require("../services/organizationService");
const messages = require("../../constants/constantMessages");
const commonHelper = require("../../helpers/commonHelper");


/** FUNC- TO GET ORGANIZATION LIST **/
const getOrganizations = async (req, res) => {
    try {
        const organizationList = await organizationService.organizationList(req.body, req.query);

        if (!organizationList || organizationList.totalCount === 0 || !organizationList.data.length) {
            return Responses.failResponse(
                req,
                res,
                { totalCount: 0, data: [] },
                messages.recordNotFound,
                200
            );
        }

        return Responses.successResponse(
            req,
            res,
            organizationList,
            messages.organizationsFetched,
            200
        );
    } catch (error) {
        errorLog(error);
        console.error("Error fetching organization list:", error);
        return Responses.errorResponse(req, res, error);
    }
};


module.exports ={
    getOrganizations,
}