import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();


const SECRET = process.env.JWT_SECRET;

function isLogged(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json;

  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

export default isLogged;