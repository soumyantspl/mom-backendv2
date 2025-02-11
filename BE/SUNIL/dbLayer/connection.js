const mongoose = require("mongoose");
const dbUrl = `${process.env.DATABASE_CLUSTER_URL}/${process.env.DB_NAME}`;
console.log("URL-------------", dbUrl);
const { errorLog } = require("../middlewares/errorLog");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(dbUrl);
    console.info(`Database connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
    errorLog(error);
    console.info(`Error while connecting to database',${error}`);
    process.exit(1);
  }
};

module.exports = connectDB;
