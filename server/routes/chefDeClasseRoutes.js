const express = require("express");
const router = express.Router();
const chefController = require("../controllers/chefDeClasseController");
const auth = require('../middleware/auth');

// Route publique pour l'authentification
router.post("/login", chefController.login);

// Route temporaire pour créer le premier chef (NON PROTÉGÉE)
router.post("/creer-premier", chefController.creerChef);

// Routes protégées
router.post("/creer", auth, chefController.creerChef);
router.get("/", auth, chefController.getAllChefs);
router.get("/:id", auth, chefController.getChefById);
router.put("/:id", auth, chefController.updateChef);
router.delete("/:id", auth, chefController.deleteChef);

module.exports = router;
