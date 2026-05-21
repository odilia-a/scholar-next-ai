const requiredEnvVars = ["MONGO_URI", "JWT_SECRET"];

const validateEnv = () => {
  requiredEnvVars.forEach((key) => {
    if (!process.env[key]) {
      console.error(`Missing environment variable: ${key}`);
      process.exit(1);
    }
  });

  console.log("Environment variables validated");
};

module.exports = validateEnv;