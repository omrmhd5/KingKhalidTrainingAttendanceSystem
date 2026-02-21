const rankService = require("../services/rankService");

exports.getAllRanks = async (req, res) => {
  try {
    const ranks = await rankService.getAllRanks();
    res.json(ranks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getRank = async (req, res) => {
  try {
    const rank = await rankService.getRankById(req.params.id);
    if (!rank) {
      return res.status(404).json({ error: "Rank not found" });
    }
    res.json(rank);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createRank = async (req, res) => {
  try {
    const rank = await rankService.createRank(req.body);
    res.status(201).json(rank);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateRank = async (req, res) => {
  try {
    const rank = await rankService.updateRank(req.params.id, req.body);
    if (!rank) {
      return res.status(404).json({ error: "Rank not found" });
    }
    res.json(rank);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteRank = async (req, res) => {
  try {
    const rank = await rankService.deleteRank(req.params.id);
    res.json(rank);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
