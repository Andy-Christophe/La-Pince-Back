import { Sequelize } from 'sequelize';
import * as dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(process.env.PG_URL, { dialect: 'postgres' });
 
export default sequelize;

// configure et export la connexion à la base de données PostgreSQL
// vérifier le .env pour mettre le bon mot de passe du superutilisateur postgres