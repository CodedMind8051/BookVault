import dotenv from "dotenv"
import { app } from "./app.js"
import { ConnectDB } from "./db/index.js"

dotenv.config({
    path: "../.env"
})

try {
    ConnectDB()
        .then(() => {
            app.listen(
                process.env.PORT || 8000, () => {
                    console.log(`⚙️  Server is running at port : ${process.env.PORT || 8000}`);
                }
            )
        }).catch((error)=>{
            console.error("Failed to Start server :", error?.message)
        })

} catch (error) {
      console.error("Failed to Start server : ", error?.message)
}


