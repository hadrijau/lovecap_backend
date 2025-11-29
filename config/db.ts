import { connect } from "mongoose";

const connectDB = async () => {
  if (process.env.NODE_ENV === "dev") {
    console.log("ENV", process.env.MONGO_URI);
  } else {
    console.log("MONGO PROD, do not log the URI");
  }
  try {
    if (!process.env.MONGO_URI) {
      return;
    }
    const conn = await connect(process.env.MONGO_URI);
    console.log(`MongoDB connected : ${conn.connection.host}`);
  } catch (err) {
    let errorMessage = "";
    if (err instanceof Error) {
      errorMessage = err.message;
    }
    console.log(`Error: ${errorMessage}`);
    process.exit(1);
  }
};

export default connectDB;
