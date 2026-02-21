const express = require("express");
const specializationController = require("../controllers/specializationController");

const router = express.Router();

router.get("/", specializationController.getAllSpecializations);
router.get("/:id", specializationController.getSpecialization);
router.post("/", specializationController.createSpecialization);
router.put("/:id", specializationController.updateSpecialization);
router.delete("/:id", specializationController.deleteSpecialization);

module.exports = router;
