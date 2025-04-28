import { connect } from "mongoose";

const connectDB = async () => {
  console.log("ENV", process.env.MONGO_URI);
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
