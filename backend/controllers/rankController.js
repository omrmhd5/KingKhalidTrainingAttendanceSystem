const rankService = require("../services/rankService");
const { sendError, sendCaught } = require("../lib/http");

exports.getAllRanks = async (req, res) => {
  try {
    const ranks = await rankService.getAllRanks();
    res.json(ranks);
  } catch (error) {
    sendCaught(req, res, error, 500);
  }
};

exports.getRank = async (req, res) => {
  try {
    const rank = await rankService.getRankById(req.params.id);
    if (!rank) {
      return sendError(req, res, 404, "errors.rankNotFound");
    }
    res.json(rank);
  } catch (error) {
    sendCaught(req, res, error, 500);
  }
};

exports.createRank = async (req, res) => {
  try {
    const rank = await rankService.createRank(req.body);
    res.status(201).json(rank);
  } catch (error) {
    sendCaught(req, res, error, 400);
  }
};

exports.updateRank = async (req, res) => {
  try {
    const rank = await rankService.updateRank(req.params.id, req.body);
    if (!rank) {
      return sendError(req, res, 404, "errors.rankNotFound");
    }
    res.json(rank);
  } catch (error) {
    sendCaught(req, res, error, 400);
  }
};

exports.deleteRank = async (req, res) => {
  try {
    const rank = await rankService.deleteRank(req.params.id);
    res.json(rank);
  } catch (error) {
    sendCaught(req, res, error, 400);
  }
};
