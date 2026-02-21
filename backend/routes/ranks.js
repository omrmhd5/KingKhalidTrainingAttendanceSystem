const express = require("express");
const rankController = require("../controllers/rankController");

const router = express.Router();

router.get("/", rankController.getAllRanks);
router.get("/:id", rankController.getRank);
router.post("/", rankController.createRank);
router.put("/:id", rankController.updateRank);
router.delete("/:id", rankController.deleteRank);

module.exports = router;
