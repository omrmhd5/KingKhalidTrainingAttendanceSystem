const express = require("express");
const traineeController = require("../controllers/traineeController");

const router = express.Router();

router.get("/", traineeController.getAllTrainees);
router.get("/:id", traineeController.getTrainee);
router.post("/", traineeController.createTrainee);
router.put("/:id", traineeController.updateTrainee);
router.delete("/:id", traineeController.deleteTrainee);

module.exports = router;
