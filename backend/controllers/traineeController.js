const traineeService = require("../services/traineeService");

exports.getAllTrainees = async (req, res) => {
  try {
    const trainees = await traineeService.getAllTrainees();
    res.json(trainees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTrainee = async (req, res) => {
  try {
    const trainee = await traineeService.getTraineeById(req.params.id);
    if (!trainee) {
      return res.status(404).json({ error: "Trainee not found" });
    }
    res.json(trainee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createTrainee = async (req, res) => {
  try {
    const trainee = await traineeService.createTrainee(req.body);
    res.status(201).json(trainee);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateTrainee = async (req, res) => {
  try {
    const trainee = await traineeService.updateTrainee(req.params.id, req.body);
    if (!trainee) {
      return res.status(404).json({ error: "Trainee not found" });
    }
    res.json(trainee);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteTrainee = async (req, res) => {
  try {
    const trainee = await traineeService.deleteTrainee(req.params.id);
    res.json(trainee);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.searchByIds = async (req, res) => {
  try {
    const { ids, searchType } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "IDs array is required" });
    }
    if (!searchType || !["military", "civil"].includes(searchType)) {
      return res.status(400).json({ error: "Invalid search type" });
    }
    const trainees = await traineeService.searchByIds(ids, searchType);
    res.json(trainees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.bulkImportTrainees = async (req, res) => {
  try {
    const { trainees } = req.body;
    if (!trainees || !Array.isArray(trainees)) {
      return res.status(400).json({ error: "Trainees array is required" });
    }
    const results = await traineeService.bulkImportTrainees(trainees);
    res.status(201).json(results);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
