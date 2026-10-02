require("dotenv").config();

const app = require("./src/app.js");
const { PORT } = require("./src/config/env.js");
const { connectDB } = require("./src/config/db.js");

const ttsRoutes = require("./src/routes/ttsRoutes.js");
const authRoutes = require("./src/routes/authRoutes.js");

app.use("/api", ttsRoutes);
app.use("/api/auth", authRoutes);

const start = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
  });
};

start();
