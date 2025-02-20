const Joi = require("joi");
const Responses = require("../helpers/response");
const { errorLog } = require("../middlewares/errorLog");
const regularExpression = /^[0-9a-zA-Z .,:;()/\-_&\n]+$/;

const regularExpressionForHtml = /^(?!.*<[^>]*>).*$/;
const linkRegEx =
  /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;
const meetingStatusValues = [
  "closed",
  "scheduled",
  "rescheduled",
  "cancelled",
  "draft",
];
const attendanceTypeValues = ["FULL", "PARTIAL"];
// CREATE MEETING VALIDATOR ///////////
const createMeetingValidator = async (req, res, next) => {
  try {
    const headerSchema = Joi.object({
      headers: Joi.object({
        authorization: Joi.required(),
        ip: Joi.string(),
      }).unknown(true),
    });
    const bodySchema = Joi.object({
      sendNotification: Joi.boolean(),
      title: Joi.string()
        .trim()
        .min(3)
        .max(100)
        .pattern(regularExpression)
        .messages({
          "string.pattern.base": `HTML tags & Special letters are not allowed!`,
        })
        .required(),
      organizationId: Joi.string().trim().alphanum().required(),
      parentMeetingId: Joi.string().trim().alphanum(),
      mode: Joi.string().trim().valid("VIRTUAL", "PHYSICAL").required(),
      linkType: Joi.any().when("mode", {
        is: "VIRTUAL",
        then: Joi.string().trim().valid("MANUAL", "ZOOM").required(),
        otherwise: Joi.string().trim().valid("MANUAL", "ZOOM"),
        //.allow(null, ""),
      }),

      // link: Joi.any().when("linkType", {
      //   is: "MANUAL",
      //   then: Joi.string()
      //     .trim()
      //     .min(3)
      //     .max(250)
      //     .pattern(linkRegEx)
      //     .messages({
      //       "string.pattern.base": `Link must be a valid url!`,
      //     })
      //     .required(),
      //   otherwise: Joi.string()
      //     .trim()
      //     .min(3)
      //     .max(250)
      //     .pattern(linkRegEx)
      //     .messages({
      //       "string.pattern.base": `Link must be a valid url!`,
      //     })
      //     .allow(null, ""),
      // }),

      // c: Joi.string().when(
      //   'a', {
      //     is: 'avalue',
      //     then: Joi.when(
      //       'b', {
      //         is: 'bvalue',
      //         then: Joi.string().required()
      //       }
      //     )
      //   }
      // )
      link: Joi.string().when("mode", {
        is: "VIRTUAL",
        then: Joi.when("linkType", {
          is: "MANUAL",
          then: Joi.string()
            .trim()
            .min(3)
            .max(250)
            .pattern(linkRegEx)
            .messages({
              "string.pattern.base": `Link must be a valid url!`,
            })
            .required(),
          otherwise: Joi.string()
            .trim()
            .min(3)
            .max(250)
            .pattern(linkRegEx)
            .messages({
              "string.pattern.base": `Link must be a valid url!`,
            })
            .allow(null, ""),
        }),
        otherwise: Joi.string()
          .trim()
          .min(3)
          .max(250)
          .pattern(linkRegEx)
          .messages({
            "string.pattern.base": `Link must be a valid url!`,
          })
          .allow(null, ""),
      }),
      date: Joi.string().trim().required(),
      fromTime: Joi.string().trim().required(),
      toTime: Joi.string().trim().required(),
      locationDetails: Joi.object({
        isMeetingRoom: Joi.boolean().required().strict(),
        location: Joi.string().trim().pattern(regularExpression).messages({
          "Allowed Inputs": `(a-z, A-Z, 0-9, space, comma, dash)`,
        }),
        location: Joi.when("isMeetingRoom", {
          is: Joi.boolean().valid(false),
          then: Joi.string()
            .trim()
            .pattern(regularExpression)
            .messages({
              "Allowed Inputs": `(a-z, A-Z, 0-9, space, comma, dash)`,
            })
            .required(),
          otherwise: Joi.string().trim().pattern(regularExpression).messages({
            "Allowed Inputs": `(a-z, A-Z, 0-9, space, comma, dash)`,
          }),
        }),
        roomId: Joi.when("isMeetingRoom", {
          is: Joi.boolean().valid(true),
          then: Joi.string().trim().alphanum().required(),
          otherwise: Joi.string().trim().alphanum(),
        }),
      }).required(),
    });

    await headerSchema.validateAsync({ headers: req.headers });
    await bodySchema.validateAsync(req.body);
    next();
  } catch (error) {
    console.log(error);
    errorLog(error);
    return Responses.errorResponse(req, res, error, 200);
  }
};
// CANCEL MEETING VALIDATOR
const cancelMeetingValidator = async (req, res, next) => {
  try {
    const headerSchema = Joi.object({
      headers: Joi.object({
        authorization: Joi.required(),
        ip: Joi.string(),
      }).unknown(true),
    });
    const paramsSchema = Joi.object({
      id: Joi.string().trim().alphanum().required(),
    });
    const bodySchema = Joi.object({
      remarks: Joi.string().trim(),
    }).required();
    await bodySchema.validateAsync(req.body);
    await headerSchema.validateAsync({ headers: req.headers });
    next();
  } catch (error) {
    console.log(error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};
//UPDATE MEETING VALIDATOR
const updateMeetingValidator = async (req, res, next) => {
  try {
    const headerSchema = Joi.object({
      headers: Joi.object({
        authorization: Joi.required(),
      }).unknown(true),
    });
    const bodySchema = Joi.object({
      isEditMeeting: Joi.boolean(),
      sendSingleNotification: Joi.boolean(),
      reScheduled: Joi.boolean(),
      isUpdate: Joi.boolean().required(),
      sendNotification: Joi.boolean().required(),
      title: Joi.string()
        .trim()
        .min(3)
        .max(100)
        .pattern(regularExpression)
        .messages({ "Allowed Inputs": `(a-z, A-Z, 0-9, space, comma, dash)` }),

      organizationId: Joi.string().trim().alphanum().required(),
      mode: Joi.string().trim().valid("VIRTUAL", "PHYSICAL"),
      // link: Joi.any().when("mode", {
      //   is: "VIRTUAL",
      //   then: Joi.string()
      //     .trim()
      //     .min(3)
      //     .max(250)
      //     .pattern(linkRegEx)
      //     .messages({
      //       "string.pattern.base": `Link must be a valid url!`,
      //     })
      //     .required(),
      //   otherwise: Joi.string()
      //     .trim()
      //     .min(3)
      //     .max(250)
      //     .pattern(linkRegEx)
      //     .messages({
      //       "string.pattern.base": `Link must be a valid url!`,
      //     })
      //     .allow(null, ""),
      // }),
      linkType: Joi.any().when("mode", {
        is: "VIRTUAL",
        then: Joi.string().trim().valid("MANUAL", "ZOOM").required(),
        otherwise: Joi.string().trim().valid("MANUAL", "ZOOM"),
        //.allow(null, ""),
      }),

      link: Joi.string().when("mode", {
        is: "VIRTUAL",
        then: Joi.when("linkType", {
          is: "MANUAL",
          then: Joi.string()
            .trim()
            .min(3)
            .max(250)
            .pattern(linkRegEx)
            .messages({
              "string.pattern.base": `Link must be a valid url!`,
            })
            .required(),
          otherwise: Joi.string()
            .trim()
            .min(3)
            .max(250)
            .pattern(linkRegEx)
            .messages({
              "string.pattern.base": `Link must be a valid url!`,
            })
            .allow(null, ""),
        }),
        otherwise: Joi.string()
          .trim()
          .min(3)
          .max(250)
          .pattern(linkRegEx)
          .messages({
            "string.pattern.base": `Link must be a valid url!`,
          })
          .allow(null, ""),
      }),
      date: Joi.string().trim(),
      fromTime: Joi.string().trim(),
      toTime: Joi.string().trim(),
      meetingStatus: Joi.string()
        .trim()
        .valid(...meetingStatusValues),
      locationDetails: Joi.object({
        isMeetingRoom: Joi.boolean().required().strict(),
        location: Joi.string().trim().pattern(regularExpression).messages({
          "Allowed Inputs": `(a-z, A-Z, 0-9, space, comma, dash)`,
        }),
        location: Joi.when("isMeetingRoom", {
          is: Joi.boolean().valid(false),
          then: Joi.string()
            .trim()
            .pattern(regularExpression)
            .messages({
              "Allowed Inputs": `(a-z, A-Z, 0-9, space, comma, dash)`,
            })
            .required(),
          otherwise: Joi.string().trim().pattern(regularExpression).messages({
            "string.pattern.base": `HTML tags & Special letters are not allowed!`,
          }),
        }),
        roomId: Joi.when("isMeetingRoom", {
          is: Joi.boolean().valid(true),
          then: Joi.string().trim().alphanum().required(),
          otherwise: Joi.string().trim().alphanum(),
        }),
      }),
      step: Joi.number().valid(1, 2, 3).required(),
      attendees: Joi.when("step", {
        is: Joi.number().valid(2),
        then: Joi.array()
          .min(1)
          .messages({
            "array.min": "attendees can't be empty!",
          })
          .items({
            isEmployee: Joi.boolean(),
            _id: Joi.when("isEmployee", {
              is: Joi.boolean().valid(true),
              then: Joi.string().trim().required(),
              otherwise: Joi.string().trim(),
            }),
            email: Joi.when("isEmployee", {
              is: Joi.boolean().valid(false),
              then: Joi.string()
                .email({ tlds: { allow: false } })
                .required(),
              otherwise: Joi.string().email({ tlds: { allow: false } }),
            }),
            name: Joi.when("isEmployee", {
              is: Joi.boolean().valid(false),
              then: Joi.string().trim().required(),
              otherwise: Joi.string().trim(),
            }),
            designation: Joi.string().trim().allow(null, ""),
            companyName: Joi.string().trim().allow(null, ""),
          })
          .required(),
        otherwise: Joi.array()
          .min(1)
          .messages({
            "array.min": "attendees can't be empty!",
          })
          .items({
            _id: Joi.string().trim(),
            email: Joi.string()
              .email({ tlds: { allow: false } })
              .required(),
            name: Joi.string().trim(),
            isEmployee: Joi.boolean(),
          }),
      }),
      agendas: Joi.when("step", {
        is: Joi.number().valid(3),
        then: Joi.array()
          .min(1)
          .messages({
            "array.min": "agendas can't be empty!",
          })
          .items({
            _id: Joi.string().trim().allow(null, ""),
            title: Joi.string().trim().required(),
            // topic: Joi.string().trim().allow(null, ""),
            topic: Joi.string()
              .trim()
              // .min(5)
              // .max(200)
              // .pattern(regularExpressionForHtml)
              // .messages({
              //   "string.pattern.base": `HTML tags & Special letters are not allowed!`,
              // })
              .allow(null, ""),
            timeLine: Joi.string().trim().allow(null, ""),
          })
          .required(),
        otherwise: Joi.array()
          .min(1)
          .messages({
            "array.min": "agendas can't be empty!",
          })
          .items({
            _id: Joi.string().trim().allow(null, ""),
            title: Joi.string().trim().required(),
            // topic: Joi.string().trim().allow(null, ""),
            topic: Joi.string()
              .trim()
              // .min(5)
              // .max(200)
              // .pattern(regularExpressionForHtml)
              // .messages({
              //   "string.pattern.base": `HTML tags & Special letters are not allowed!`,
              // })
              .allow(null, ""),
            timeLine: Joi.string().trim().allow(null, ""),
          }),
      }),
    });
    const paramsSchema = Joi.object({
      id: Joi.string().trim().alphanum().required(),
    });
    await headerSchema.validateAsync({ headers: req.headers });
    await paramsSchema.validateAsync(req.params);
    await bodySchema.validateAsync(req.body);
    next();
  } catch (error) {
    console.log(error);
    return Responses.errorResponse(req, res, error, 200);
  }
};
// VIEW SINGLE MEETING VALIDATOR
const viewMeetingValidator = async (req, res, next) => {
  try {
    const headerSchema = Joi.object({
      headers: Joi.object({
        authorization: Joi.required(),
      }).unknown(true),
    });
    const paramsSchema = Joi.object({
      id: Joi.string().trim().alphanum().required(),
    });
    await headerSchema.validateAsync({ headers: req.headers });
    await paramsSchema.validateAsync(req.params);
    next();
  } catch (error) {
    console.log(error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};
// VIEW ALL MEETING VALIDATOR
const viewAllMeetingsValidator = async (req, res, next) => {
  try {
    const headerSchema = Joi.object({
      headers: Joi.object({
        authorization: Joi.required(),
      }).unknown(true),
    });

    const bodySchema = Joi.object({
      searchKey: Joi.string()
        .trim()
        .pattern(regularExpression)
        .messages({ "Allowed Inputs": `(a-z, A-Z, 0-9, space, comma, dash)` }),
      meetingStatus: Joi.string()
        .trim()
        .valid(...meetingStatusValues),
      fromDate: Joi.date().iso(),
      toDate: Joi.date().iso(),
      attendeeId: Joi.string().trim().alphanum(),
      organizationId: Joi.string().trim().alphanum().required(),
    });
    const paramsSchema = Joi.object({
      limit: Joi.number().required(),
      page: Joi.number().required(),
      order: Joi.number().required(),
    });
    await headerSchema.validateAsync({ headers: req.headers });
    await paramsSchema.validateAsync(req.query);
    await bodySchema.validateAsync(req.body);
    next();
  } catch (error) {
    console.log(error);
    return Responses.errorResponse(req, res, error, 200);
  }
};
// UPDATE USER RSVP FOR MEETING VALIDATOR
const updateRsvpValidator = async (req, res, next) => {
  try {
    const enumValues = ["YES", "NO", "AWAITING", "MAYBE"];
    const headerSchema = Joi.object({
      headers: Joi.object({
        authorization: Joi.required(),
        ip: Joi.string(),
      }).unknown(true),
    });
    const bodySchema = Joi.object({
      rsvp: Joi.string()
        .trim()
        .valid(...enumValues)
        .required(),
    }).required();
    await headerSchema.validateAsync({ headers: req.headers });
    await bodySchema.validateAsync(req.body);
    next();
  } catch (error) {
    console.log(error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};
//LIST ATTENDEES FROM PREVIOUS MEETING//
const listAttendeesFromPreviousMeetingValidator = async (req, res, next) => {
  try {
    const headerSchema = Joi.object({
      headers: Joi.object({
        authorization: Joi.required(),
      }).unknown(true),
    });
    const paramsSchema = Joi.object({
      organizationId: Joi.string().trim().alphanum().required(),
    }).required();
    await headerSchema.validateAsync({ headers: req.headers });
    await paramsSchema.validateAsync(req.params);
    next();
  } catch (error) {
    console.log(error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};
// FUCNTION TO LIST MEETING ACTIVITIES
const meetingActivitieslist = async (req, res, next) => {
  try {
    const headerSchema = Joi.object({
      headers: Joi.object({
        authorization: Joi.required(),
      }).unknown(true),
    });
    const paramsSchema = Joi.object({
      id: Joi.string().trim().alphanum().required(),
    }).required();

    await headerSchema.validateAsync({ headers: req.headers });
    await paramsSchema.validateAsync(req.params);
    next();
  } catch (error) {
    console.log(error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};
// FUNCTION TO GET MEETING CREATE STEP STATUS
const getCreateMeetingStep = async (req, res, next) => {
  try {
    const headerSchema = Joi.object({
      headers: Joi.object({
        authorization: Joi.required(),
      }).unknown(true),
    });
    const paramsSchema = Joi.object({
      organizationId: Joi.string().trim().alphanum().required(),
    }).required();

    await headerSchema.validateAsync({ headers: req.headers });
    await paramsSchema.validateAsync(req.params);
    next();
  } catch (error) {
    console.log(error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};
//UPDATE MEETING ATTENDANCE VALIDATOR
const updateMeetingAttendanceValidator = async (req, res, next) => {
  try {
    const headerSchema = Joi.object({
      headers: Joi.object({
        authorization: Joi.required(),
        ip: Joi.string(),
      }).unknown(true),
    });
    const bodySchema = Joi.object({
      isSendNotification: Joi.boolean().required(),
      fromTime: Joi.string().trim().required(),
      toTime: Joi.string().trim().required(),
      attendees: Joi.array()
        .min(1)
        .messages({
          "array.min": "attendees can't be empty!",
        })
        .items({
          _id: Joi.string().trim(),
          isAttended: Joi.boolean(),
          rsvp: Joi.string().trim().valid("YES", "NO", "AWAITING", "MAYBE"),
          canWriteMOM: Joi.boolean(),
        })
        .required(),
      attendanceData: Joi.array()
        .min(1)
        .messages({
          "array.min": "attendees can't be empty!",
        })
        .items({
          _id: Joi.string().trim(),
          fromTime: Joi.string().trim().required(),
          toTime: Joi.string().trim().required(),
          name: Joi.string().trim().required(),
          email: Joi.string()
            .email({ tlds: { allow: false } })
            .required(),
          isAttended: Joi.boolean(),
          attendanceType: Joi.string().valid(...attendanceTypeValues),
        })
        .required(),
    });
    const paramsSchema = Joi.object({
      id: Joi.string().trim().alphanum().required(),
    });
    await headerSchema.validateAsync({ headers: req.headers });
    await paramsSchema.validateAsync(req.params);
    await bodySchema.validateAsync(req.body);
    next();
  } catch (error) {
    console.log(error);
    return Responses.errorResponse(req, res, error, 200);
  }
};
// FUNCTION TO GENERATE MOM VALIDATOR
const generateMOMValidator = async (req, res, next) => {
  try {
    const headerSchema = Joi.object({
      headers: Joi.object({
        authorization: Joi.required(),
        ip: Joi.string(),
      }).unknown(true),
    });
    const paramsSchema = Joi.object({
      meetingId: Joi.string().trim().alphanum().required(),
    });
    const bodySchema = Joi.object({
      organizationId: Joi.string().trim().alphanum().required(),
      attendees: Joi.array()
        .min(1)
        .messages({
          "array.min": "attendees can't be empty!",
        })
        .items({
          _id: Joi.string().trim().alphanum().required(),
          // email: Joi.string().trim().email().required(),
          email: Joi.string()
            .email({ tlds: { allow: false } })
            .required(),
          name: Joi.string().trim().required(),
          canWriteMOM: Joi.boolean(),
        })
        .required(),
    });
    await headerSchema.validateAsync({ headers: req.headers });
    await paramsSchema.validateAsync(req.params);
    await bodySchema.validateAsync(req.body);
    next();
  } catch (error) {
    console.log(error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};
// FUNCTION TO DOWNLOAD MOM VALIDATOR
const downloadMomValidator = async (req, res, next) => {
  try {
    const headerSchema = Joi.object({
      headers: Joi.object({
        authorization: Joi.required(),
        ip: Joi.string(),
      }).unknown(true),
    });
    const paramsSchema = Joi.object({
      meetingId: Joi.string().trim().alphanum().required(),
    });

    await headerSchema.validateAsync({ headers: req.headers });
    await paramsSchema.validateAsync(req.params);

    next();
  } catch (error) {
    console.log(error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};

//RESCHEDULE MEETING VALIDATOR
const rescheduleMeetingValidator = async (req, res, next) => {
  try {
    const headerSchema = Joi.object({
      headers: Joi.object({
        authorization: Joi.required(),
        ip: Joi.string(),
      }).unknown(true),
    });
    const bodySchema = Joi.object({
      fromTime: Joi.string().trim().required(),
      toTime: Joi.string().trim().required(),
      date: Joi.string().trim().required(),
      remarks: Joi.string()
        .trim()
        .min(3)
        .max(200)
        .pattern(regularExpression)
        .messages({ "Allowed Inputs": `(a-z, A-Z, 0-9, space, comma, dash)` })
        .required(),
      attendees: Joi.array()
        .min(1)
        .messages({
          "array.min": "attendees can't be empty!",
        })
        .items({
          _id: Joi.string().trim().alphanum().required(),
          email: Joi.string()
            .email({ tlds: { allow: false } })
            .required(),
          name: Joi.string().trim().required(),
          canWriteMOM: Joi.boolean(),
        })
        .required(),
    });
    const paramsSchema = Joi.object({
      id: Joi.string().trim().alphanum().required(),
    });
    await headerSchema.validateAsync({ headers: req.headers });
    await paramsSchema.validateAsync(req.params);
    await bodySchema.validateAsync(req.body);
    next();
  } catch (error) {
    console.log(error);
    return Responses.errorResponse(req, res, error, 200);
  }
};
//GIVE MOM WRITE PERMISSION VALIDATOR
const giveMomWritePermissionValidator = async (req, res, next) => {
  try {
    const headerSchema = Joi.object({
      headers: Joi.object({
        authorization: Joi.required(),
        ip: Joi.string(),
      }).unknown(true),
    });
    const bodySchema = Joi.object({
      attendees: Joi.array()
        .min(1)
        .messages({
          "array.min": "attendees can't be empty!",
        })
        .items({
          _id: Joi.string().trim().alphanum().required(),
          canWriteMOM: Joi.boolean().required(),
          rsvp: Joi.string().valid("YES", "NO", "AWAITING").required(),
          isAttended: Joi.boolean().required(),
        })
        .required(),
    });
    const paramsSchema = Joi.object({
      meetingId: Joi.string().trim().alphanum().required(),
    });
    await headerSchema.validateAsync({ headers: req.headers });
    await paramsSchema.validateAsync(req.params);
    await bodySchema.validateAsync(req.body);
    next();
  } catch (error) {
    console.log(error);
    return Responses.errorResponse(req, res, error, 200);
  }
};

//GET TIME LIST VALIDATOR
const getTimelineListValidator = async (req, res, next) => {
  try {
    const headerSchema = Joi.object({
      headers: Joi.object({
        authorization: Joi.required(),
        ip: Joi.string(),
      }).unknown(true),
    });

    const paramsSchema = Joi.object({
      meetingId: Joi.string().trim().alphanum().required(),
    });
    await headerSchema.validateAsync({ headers: req.headers });
    await paramsSchema.validateAsync(req.params);
    next();
  } catch (error) {
    console.log(error);
    return Responses.errorResponse(req, res, error, 200);
  }
};
//UPDATE MEETING STATUS
const updateMeetingStatusValidator = async (req, res, next) => {
  try {
    const headerSchema = Joi.object({
      headers: Joi.object({
        authorization: Joi.required(),
        ip: Joi.string(),
      }).unknown(true),
    });

    const paramsSchema = Joi.object({
      meetingId: Joi.string().trim().alphanum().required(),
    });
    const bodySchema = Joi.object({
      meetingStatus: Joi.string()
        .trim()
        .valid(...meetingStatusValues),
    });

    await headerSchema.validateAsync({ headers: req.headers });
    await paramsSchema.validateAsync(req.params);
    await bodySchema.validateAsync(req.body);
    next();
  } catch (error) {
    console.log(error);
    return Responses.errorResponse(req, res, error, 200);
  }
};
//GET PARENT MEETING DETAILS VALIDATOR
const viewParentMeeting = async (req, res, next) => {
  try {
    const headerSchema = Joi.object({
      headers: Joi.object({
        authorization: Joi.required(),
      }).unknown(true),
    });

    const paramsSchema = Joi.object({
      meetingId: Joi.string().trim().alphanum().required(),
    });

    await headerSchema.validateAsync({ headers: req.headers });
    await paramsSchema.validateAsync(req.params);
    next();
  } catch (error) {
    console.log(error);
    return Responses.errorResponse(req, res, error, 200);
  }
};
//GET MEETING STATUSTICS DETAILS VALIDATOR
const meetingStatisticsValidator = async (req, res, next) => {
  try {
    const headerSchema = Joi.object({
      headers: Joi.object({
        authorization: Joi.required(),
      }).unknown(true),
    });

    const paramsSchema = Joi.object({
      organizationId: Joi.string().trim().alphanum().required(),
    });
    await headerSchema.validateAsync({ headers: req.headers });
    await paramsSchema.validateAsync(req.params);
    next();
  } catch (error) {
    console.log(error);
    return Responses.errorResponse(req, res, error, 200);
  }
};
/*GET MEETING WITH ORGANIZATION DETAILS FOR UPDATE RSVP */
const viewMeetingDetailsForRsvpValidator = async (req, res, next) => {
  try {
    const bodySchema = Joi.object({
      meetingId: Joi.string().trim().alphanum().required(),
      userId: Joi.string().trim().alphanum().required(),
    });
    await bodySchema.validateAsync(req.body);
    next();
  } catch (error) {
    console.log(error);
    return Responses.errorResponse(req, res, error, 200);
  }
};
// UPDATE USER RSVP FOR MEETING VALIDATOR BY EMAIL
const updateRsvpByEmailValidator = async (req, res, next) => {
  try {
    const enumValues = ["YES", "NO", "AWAITING", "MAYBE"];
    const bodySchema = Joi.object({
      userId: Joi.string().trim().alphanum().required(),
      rsvp: Joi.string()
        .trim()
        .valid(...enumValues)
        .required(),
    }).required();
    await bodySchema.validateAsync(req.body);
    next();
  } catch (error) {
    console.log(error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};
const sendMeetingDetailsValidator = async (req, res, next) => {
  try {
    const bodySchema = Joi.object({
      meetingId: Joi.string().trim().alphanum().required(),
      attendees: Joi.array()
        .min(1)
        .messages({
          "array.min": "attendees can't be empty!",
        })
        .items(Joi.string().trim())
        .required(),
    }).required();

    await bodySchema.validateAsync(req.body);
    next();
  } catch (error) {
    console.log(error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};
// LIST ALL ATTENDESS FROM PARENTS MEETING
const fetchCurrentAttendeesListValidator = async (req, res, next) => {
  try {
    const headerSchema = Joi.object({
      headers: Joi.object({
        authorization: Joi.required(),
      }).unknown(true),
    });
    const bodySchema = Joi.object({
      parentMeetingId: Joi.string().trim().alphanum().required(),
      organizationId: Joi.string().trim().alphanum().required(),
    });
    await headerSchema.validateAsync({ headers: req.headers });
    await bodySchema.validateAsync(req.body);
    next();
  } catch (error) {
    console.log(error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};

//RESCHEDULE MEETING VALIDATOR
const rescheduleNewMeetingValidator = async (req, res, next) => {
  try {
    const headerSchema = Joi.object({
      headers: Joi.object({
        authorization: Joi.required(),
        ip: Joi.string(),
      }).unknown(true),
    });
    const bodySchema = Joi.object({
      fromTime: Joi.string().trim().required(),
      toTime: Joi.string().trim().required(),
      date: Joi.string().trim().required(),
      remarks: Joi.string()
        .trim()
        .min(5)
        .max(100)
        .pattern(regularExpression)
        .messages({ "Allowed Inputs": `(a-z, A-Z, 0-9, space, comma, dash)` })
        .required(),
      attendees: Joi.array()
        .min(1)
        .messages({
          "array.min": "attendees can't be empty!",
        })
        .items({
          _id: Joi.string().trim().alphanum().required(),
          email: Joi.string()
            .email({ tlds: { allow: false } })
            .required(),
          name: Joi.string().trim().required(),
          canWriteMOM: Joi.boolean(),
        })
        .required(),
    });
    const paramsSchema = Joi.object({
      id: Joi.string().trim().alphanum().required(),
    });
    await headerSchema.validateAsync({ headers: req.headers });
    await paramsSchema.validateAsync(req.params);
    await bodySchema.validateAsync(req.body);
    next();
  } catch (error) {
    console.log(error);
    return Responses.errorResponse(req, res, error, 200);
  }
};

//RESCHEDULE AND CREATE A NEW MEETING VALIDATOR
const newMeetingAsRescheduledValidator = async (req, res, next) => {
  try {
    const headerSchema = Joi.object({
      headers: Joi.object({
        authorization: Joi.required(),
        ip: Joi.string(),
      }).unknown(true),
    });
    const bodySchema = Joi.object({
      fromTime: Joi.string().trim().required(),
      toTime: Joi.string().trim().required(),
      date: Joi.string().trim().required(),
      remarks: Joi.string()
        .trim()
        .min(5)
        .max(100)
        .pattern(regularExpression)
        .messages({ "Allowed Inputs": `(a-z, A-Z, 0-9, space, comma, dash)` })
        .required(),
      attendees: Joi.array()
        .min(1)
        .messages({
          "array.min": "attendees can't be empty!",
        })
        .items({
          _id: Joi.string().trim().alphanum().required(),
          email: Joi.string()
            .email({ tlds: { allow: false } })
            .required(),
          name: Joi.string().trim().required(),
          canWriteMOM: Joi.boolean(),
        })
        .required(),
    });
    const paramsSchema = Joi.object({
      id: Joi.string().trim().alphanum().required(),
    });
    await headerSchema.validateAsync({ headers: req.headers });
    await paramsSchema.validateAsync(req.params);
    await bodySchema.validateAsync(req.body);
    next();
  } catch (error) {
    console.log(error);
    return Responses.errorResponse(req, res, error, 200);
  }
};

// MEETING STATUS DATA
const totalMeetingListForChartValidator = async (req, res, next) => {
  try {
    const headerSchema = Joi.object({
      headers: Joi.object({
        authorization: Joi.required(),
        ip: Joi.string(),
      }).unknown(true),
    });

    const paramsSchema = Joi.object({
      organizationId: Joi.string().trim().alphanum().required(),
    });

    await headerSchema.validateAsync({ headers: req.headers });
    await paramsSchema.validateAsync(req.params);
    next();
  } catch (error) {
    console.log(error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};

// VIEW ALL MEETING ACTION PRIORITY DETAILS VALIDATOR
const getMeetingActionPriotityDetailsValidator = async (req, res, next) => {
  try {
    const headerSchema = Joi.object({
      headers: Joi.object({
        authorization: Joi.required(),
      }).unknown(true),
    });

    const bodySchema = Joi.object({
      organizationId: Joi.string().trim().alphanum().required(),
      searchKey: Joi.string()
        .trim()
        .pattern(regularExpression)
        .messages({ "Allowed Inputs": `(a-z, A-Z, 0-9, space, comma, dash)` }),
    });
    const paramsSchema = Joi.object({
      limit: Joi.number().required(),
      page: Joi.number().required(),
      order: Joi.number().required(),
    });
    await headerSchema.validateAsync({ headers: req.headers });
    await paramsSchema.validateAsync(req.query);
    await bodySchema.validateAsync(req.body);
    next();
  } catch (error) {
    console.log(error);
    return Responses.errorResponse(req, res, error, 200);
  }
};

// DELETE ZOOM RECORDING VALIDATOR
const deleteZoomRecordingValidator = async (req, res, next) => {
  try {
    const headerSchema = Joi.object({
      headers: Joi.object({
        authorization: Joi.required(),
      }).unknown(true),
    });

    const bodySchema = Joi.object({
      organizationId: Joi.string().trim().alphanum().required(),
      meetingId: Joi.string().trim().alphanum().required(),
      recordingId: Joi.string().trim().required(),
    });

    await headerSchema.validateAsync({ headers: req.headers });
    await bodySchema.validateAsync(req.body);
    next();
  } catch (error) {
    console.log(error);
    return Responses.errorResponse(req, res, error, 200);
  }
};

// FUNCTION TO DOWNLOAD ZOOM VIDEOS ALL IN ZIP
const downloadZoomRecordingsInZipValidaor = async (req, res, next) => {
  try {
    const headerSchema = Joi.object({
      headers: Joi.object({
        authorization: Joi.required(),
        ip: Joi.string(),
      }).unknown(true),
    });

    const bodySchema = Joi.object({
      // downloadUrls:Joi.array().items(Joi.string())
      downloadUrls: Joi.array()
        .min(1)
        .messages({
          "array.min": "download urls can't be empty!",
        })
        .items(Joi.string())
        .required(),
    });
    await headerSchema.validateAsync({ headers: req.headers });
    await bodySchema.validateAsync(req.body);
    next();
  } catch (error) {
    console.log(error);
    errorLog(error);
    return Responses.errorResponse(req, res, error);
  }
};

const forChartClick = async (req, res, next) => {
  try {
    const headerSchema = Joi.object({
      headers: Joi.object({
        authorization: Joi.required(),
      }).unknown(true),
    });

    const bodySchema = Joi.object({
      organizationId: Joi.string().trim().alphanum().required(),
      meetingId:Joi.string().trim().required(),
      searchKey: Joi.string()
        .trim()
        .pattern(regularExpression)
        .messages({ "Allowed Inputs": `(a-z, A-Z, 0-9, space, comma, dash)` }),
    });
    const paramsSchema = Joi.object({
      limit: Joi.number().required(),
      page: Joi.number().required(),
      order: Joi.number().required(),
    });
    await headerSchema.validateAsync({ headers: req.headers });
    await paramsSchema.validateAsync(req.query);
    await bodySchema.validateAsync(req.body);
    next();
  } catch (error) {
    console.log(error);
    return Responses.errorResponse(req, res, error, 200);
  }
};

// attendee availability validator
const checkAttendeeAvailabilityValidator = async (req, res, next) => {
  try {
    const headerSchema = Joi.object({
      headers: Joi.object({
        authorization: Joi.required()
      }).unknown(true),
    });
    const bodySchema = Joi.object({
      email: Joi.string().email().optional(),
      attendeeId: Joi.string().optional(),
    }).or("email", "attendeeId");

    await headerSchema.validateAsync({ headers: req.headers });
    await bodySchema.validateAsync(req.body);
    next();
  } catch (error) {
    console.log(error);
    errorLog(error);
    return Responses.errorResponse(req, res, error, 200);
  }
};

// room availability validator
const checkRoomAvailabilityValidator = async (req, res, next) => {
  try {
    const headerSchema = Joi.object({
      headers: Joi.object({
        authorization: Joi.required()
      }).unknown(true),
    });
    const bodySchema = Joi.object({
      organizationId: Joi.string().required(),
      date: Joi.date().iso().required(),
      roomId: Joi.string().required(),
      fromTime: Joi.string().required(),
      toTime: Joi.string().required(),
    });

    await headerSchema.validateAsync({ headers: req.headers });
    await bodySchema.validateAsync(req.body);
    next();
  } catch (error) {
    console.log(error);
    errorLog(error);
    return Responses.errorResponse(req, res, error, 200);
  }
};

// attendee array availability validator
const checkAttendeeArrayAvailabilityValidator = async (req, res, next) => {
  try {
    const headerSchema = Joi.object({
      headers: Joi.object({
        authorization: Joi.required()
      }).unknown(true),
    });
    const bodySchema = Joi.object({
      date: Joi.date().iso().required(),
      fromTime: Joi.string()
        .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
        .required(),
      toTime: Joi.string()
        .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
        .required(),
      attendees: Joi.array()
        .items(
          Joi.object({
            _id: Joi.string().required(), 
          }).unknown(true)
        )
        .min(1)
        .required(),
    });
    await headerSchema.validateAsync({ headers: req.headers });
    await bodySchema.validateAsync(req.body);
    next();
  } catch (error) {
    console.log(error);
    errorLog(error);
    return Responses.errorResponse(req, res, error, 200);
  }
};
module.exports = {
  forChartClick,
  updateMeetingStatusValidator,
  createMeetingValidator,
  updateMeetingValidator,
  viewMeetingValidator,
  viewAllMeetingsValidator,
  updateRsvpValidator,
  cancelMeetingValidator,
  listAttendeesFromPreviousMeetingValidator,
  meetingActivitieslist,
  getCreateMeetingStep,
  updateMeetingAttendanceValidator,
  generateMOMValidator,
  downloadMomValidator,
  rescheduleMeetingValidator,
  giveMomWritePermissionValidator,
  getTimelineListValidator,
  viewParentMeeting,
  meetingStatisticsValidator,
  viewMeetingDetailsForRsvpValidator,
  updateRsvpByEmailValidator,
  sendMeetingDetailsValidator,
  fetchCurrentAttendeesListValidator,
  rescheduleNewMeetingValidator,
  newMeetingAsRescheduledValidator,
  totalMeetingListForChartValidator,
  getMeetingActionPriotityDetailsValidator,
  deleteZoomRecordingValidator,
  downloadZoomRecordingsInZipValidaor,
  checkAttendeeAvailabilityValidator,
  checkRoomAvailabilityValidator,
  checkAttendeeArrayAvailabilityValidator
};
