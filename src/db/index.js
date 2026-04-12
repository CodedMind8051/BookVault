import mongoose from "mongoose";
import { DbName, ClusterName } from "../constants.js";


const ConnectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DbName}/?appName=${ClusterName}`)
        console.log(`\nMongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.error("MongoDb connection failed :", error?.message)
        process.exit(1)
    }
}

export { ConnectDB }

