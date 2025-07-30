import "dotenv/config";
import sequelize from "./app/database.js";
import "./app/models/associations.js";

async function main() {
  try {
    console.log("🚀 PRODUCTION : Synchronisation sans suppression");

    await sequelize.sync({
      alter: true,
      force: false,
    });

    console.log("✅ Base de données synchronisée en production");
  } catch (error) {
    console.error("❌ Erreur BDD :", error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

main();
