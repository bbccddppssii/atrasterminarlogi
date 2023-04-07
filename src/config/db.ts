import mongoose from "mongoose";

const connectDB = async () => {
    mongoose.set("strictQuery", true);
    try {
        const connection = await mongoose.connect(process.env.MONGOURI as string)
        console.log("Connected to ", connection.connection.db.databaseName)
    } catch (error) {
        console.log(error)
        process.exit(1);
    }
};

export default connectDB;