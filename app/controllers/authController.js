import validator from "validator";
import bcrypt from "bcrypt";
import Utilisateur from "../models/Utilisateur.js";
import Compte from "../models/Compte.js";
import { createUserWithValidation } from "../utils/validationRegister.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const authController = {
  login: function (req, res) {
    res.status(200).json({
      page: "login",
      title: "Connexion",
    });
  },

  loginAction: async function (req, res) {
    try {
      const email = req.body.email.trim().toLowerCase();
      const foundUser = await Utilisateur.findOne({ where: { email } });
      if (foundUser) {
        const isPasswordValid = await bcrypt.compare(
          req.body.mot_de_passe,
          foundUser.mot_de_passe
        );

        if (isPasswordValid) {
          const userAccount = await Compte.findOne({
            where: { utilisateurId: foundUser.id },
          });

          const SECRET = process.env.JWT_SECRET;
          const token = jwt.sign(
            { id: foundUser.id, email: foundUser.email },
            SECRET,
            { expiresIn: "2h" }
          );

          let redirectUrl;
          if (userAccount) {
            redirectUrl = "/dashboard";
          } else {
            redirectUrl = "/config";
          }

          res.status(200).json({
            token,
            success: true,
            message: "Connexion réussie",
            redirectUrl,
            user: {
              id: foundUser.id,
              email: foundUser.email,
              prenom: foundUser.prenom,
              nom: foundUser.nom,
            },
          });
        } else {
          res.status(401).json({
            success: false,
            error: "Mauvais couple identifiant/mot de passe",
          });
        }
      } else {
        res.status(401).json({
          success: false,
          error: "Mauvais couple identifiant/mot de passe",
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  signup: function (req, res) {
    res.status(200).json({
      page: "register",
      title: "Inscription",
    });
  },

  signupAction: async function (req, res) {
    try {
      const newUser = await createUserWithValidation(req.body);

      res.status(201).json({
        success: true,
        message: "Inscription réussie",
        redirectUrl: "/login",
        user: {
          id: newUser.id,
          email: newUser.email,
          prenom: newUser.prenom,
          nom: newUser.nom,
        },
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  },

  logout: function (req, res) {
    res.status(200).json({
      success: true,
      message: "Déconnexion réussie",
      redirectUrl: "/",
    });
  },
};

export default authController;
