const { errorLog } = require("../../middlewares/errorLog");
const Responses = require("../../helpers/response");
const emailLogService = require("../services/emailLogService");
const messages = require("../../constants/constantMessages");


/** FUNC - TO GET EMAIL LOG LIST **/
const getEmailLogs = async (req, res) => {
    try {
        const emailLogList = await emailLogService.emailLogList(req.body, req.query);

        if (!emailLogList || emailLogList.totalCount === 0 || !emailLogList.data.length) {
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
            emailLogList,
            messages.emailLogsFetched,
            200
        );
    } catch (error) {
        errorLog(error);
        console.error("Error fetching email log list:", error);
        return Responses.errorResponse(req, res, error);
    }
};

module.exports = { getEmailLogs };
