const Rooms = require("../models/roomModel");
const Units = require("../models/unitModel");
const logService = require("./logsService");
const logMessages = require("../constants/logsConstants");
const commonHelper = require("../helpers/commonHelper");
const ObjectId = require("mongoose").Types.ObjectId;
const { masterData } = require("./employeeService");

/**FUNC- CREATE ROOM */
const createRoom = async (userId, data, ipAddress) => {
  const roomDetails = await checkDuplicateEntry(
    data.title,
    data.organizationId
  );
  if (!roomDetails) {
    const unitAggregationResult = await Units.aggregate([
      {
        $match: { _id: new ObjectId(data.unitId) },
      },
      {
        $project: {
          unitId: "$_id",
          unitName: 1,
        },
      },
    ]);

    if (unitAggregationResult.length === 0) {
      return { error: "Unit not found" };
    }
    const unitDetails = unitAggregationResult[0];
    const inputData = {
      title: data.title,
      organizationId: data.organizationId,
      location: data.location,
      unitId: unitDetails.unitId,
    };

    const roomData = new Rooms(inputData);
    const result = await roomData.save();
    const logData = {
      moduleName: logMessages.Room.moduleName,
      userId,
      action: logMessages.Room.createRoom,
      ipAddress,
      details: "Room title: " + `<strong>${data.title}</strong>`,
      organizationId: result.organizationId,
    };
    await logService.createLog(logData);
    /////////////////////LOGGING END
    return result;
  }

  return false;
};

/**FUNC- TO VERIFY DUPLICATE ROOM */
const checkDuplicateEntry = async (title, organizationId) => {
  const normalizedRoomTitle = title.trim().toLowerCase();
  return await Rooms.findOne(
    {
      organizationId,
      title: { $regex: `^${normalizedRoomTitle}$`, $options: "i" },
      isActive: true,
      isDelete: false,
    },
    {
      organizationId: 1,
      title: 1,
    }
  );
};

/**FUNC- EDIT ROOM */
const editRoom = async (userId, id, data, ipAddress) => {
  // Check for duplicate room title
  const roomDetails = await checkDuplicateEntry(data.title, data.organizationId);
  if (roomDetails && roomDetails.title.toLowerCase() === data.title.toLowerCase() && roomDetails._id.toString() !== id) {
    return { isDuplicate: true };
  }

  // Fetch current room details
  const currentRoom = await Rooms.findById(id);
  if (!currentRoom) {
    return { error: "Room not found" };
  }

  // Check for unit change and log the change
  let unitChangeLog = "";
  if (currentRoom.unitId.toString() !== data.unitId) {
    const oldUnit = await Units.findById(currentRoom.unitId, { name: 1 });
    const newUnit = await Units.findById(data.unitId, { name: 1 });
    if (oldUnit && newUnit) {
      unitChangeLog = `Unit changed from <strong>${oldUnit.name}</strong> to <strong>${newUnit.name}</strong>`;
    }
  }

  // Update the room
  const result = await Rooms.findByIdAndUpdate(id, data, { new: false });
  if (!result) {
    return { error: "Error updating room" };
  }

  // Generate logs for all fields (changed or not)
  let details = await commonHelper.generateLogObjectForMeetingRoom(result, data);

  // Filter out the "Meeting Room Unitid changed" log entry
  details = details.filter(log => !log.includes("Unitid changed"));

  // Add the unit change log if applicable
  if (unitChangeLog) {
    details.push(unitChangeLog);
  }

  if (details.length > 0) {
    const logData = {
      moduleName: logMessages.Room.moduleName,
      userId,
      action: logMessages.Room.updateRoom,
      ipAddress,
      details: details.join(" , "),
      organizationId: result.organizationId,
    };
    const resultLog = await logService.createLog(logData);
    console.log(resultLog); // Log the result of log creation
  }

  return { isDuplicate: false };
};

/**FUNC- TO VIEW ROOMS */
const viewRoom = async (bodyData, queryData) => {
  const { order } = queryData;
  const { organizationId, searchKey, updatedAt } = bodyData;
  let query = searchKey
    ? {
      $and: [
        {
          $or: [{ title: { $regex: searchKey, $options: "i" } }],
        },
        {
          organizationId: new ObjectId(organizationId),
          isActive: true,
          isDelete: false,
        },
      ],
    }
    : {
      organizationId: new ObjectId(organizationId),
      isActive: true,
      isDelete: false,
    };

  if (updatedAt) {
    query.updatedAt = updatedAt;
  }
  const limit = queryData.limit ? parseInt(queryData.limit) : 0;
  const skip = queryData.page ? (parseInt(queryData.page) - 1) * limit : 0;
  const aggregationPipelineForTotalCount = [
    { $match: query },
    {
      $lookup: {
        from: "units",
        localField: "unitId",
        foreignField: "_id",
        as: "unitDetails",
      },
    },
    {
      $unwind: {
        path: "$unitDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
  ];
  const aggregationPipeline = [
    { $match: query },
    {
      $lookup: {
        from: "units",
        localField: "unitId",
        foreignField: "_id",
        as: "unitDetails",
      },
    },
    {
      $unwind: {
        path: "$unitDetails",
        preserveNullAndEmptyArrays: true,
      },
    },
    { $sort: { createdAt: parseInt(order) || -1 } },
    { $skip: skip },
    { $limit: limit },
  ];

  const totalCount = await Rooms.aggregate(aggregationPipelineForTotalCount);
  const roomsDatas = await Rooms.aggregate(aggregationPipeline);
  const formattedRoomData = roomsDatas.map((t) => {
    const { formattedTime, formattedDate } = commonHelper.formatDateTimeFormat(
      t.updatedAt
    );
    return {
      ...t,
      formattedDate: formattedDate,
      formattedTime: formattedTime,
      unitName: t.unitDetails ? t.unitDetails.unitName : null,
    };
  });
  return { totalCount: totalCount.length, roomsDatas: formattedRoomData };
};
/**FUNC- TO VIEW ROOMS */
const viewRoomsForMeeting = async (bodyData) => {
  const { organizationId, unitId } = bodyData;
  let query = {
    organizationId,
    unitId,
    isActive: true,
    isDelete: false,
  };
  const totalCount = await Rooms.countDocuments(query);
  const roomsDatas = await Rooms.find(query);
  const formattedRoomData = roomsDatas.map((t) => {
    const { formattedTime, formattedDate } = commonHelper.formatDateTimeFormat(
      t.updatedAt
    );
    return {
      ...t.toObject(),
      formattedDate: formattedDate,
      formattedTime: formattedTime,
    };
  });
  return {
    totalCount,
    roomsDatas: formattedRoomData,
  };
};
/**FUNC- DELETE ROOM */
const deleteRoom = async (userId, id, ipAddress) => {
  const result = await Rooms.findByIdAndUpdate(
    { _id: id },
    { isDelete: true },
    { new: true }
  );
  ////////////////////LOGER START
  const logData = {
    moduleName: logMessages.Room.moduleName,
    userId,
    action: logMessages.Room.deleteRoom,
    ipAddress,
    details:
      logMessages.Room.deleteRoomDetails + `<strong>${result.title}</strong>`,
    organizationId: result.organizationId,
  };
  await logService.createLog(logData);
  ///////////////////// LOGER END
  return result;
};
module.exports = {
  createRoom,
  editRoom,
  viewRoom,
  deleteRoom,
  viewRoomsForMeeting,
};
