require("dotenv").config();

const app = require("./src/app.js");
const { PORT } = require("./src/config/env.js");
const { connectDB } = require("./src/config/db.js");

const ttsRoutes = require("./src/routes/ttsRoutes.js");
const authRoutes = require("./src/routes/authRoutes.js");

app.use("/api", ttsRoutes);
app.use("/api/auth", authRoutes);

const start = async () => {
  try {
    await connectDB();
    console.log("Database initialization complete.");

    const server = app.listen(PORT, () => {
      console.log(`App listening on port ${PORT}`);
    });

    server.keepAliveTimeout = 65000;
    server.headersTimeout = 66000;
    server.requestTimeout = 30000;
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

start();
