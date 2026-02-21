const specializationService = require("../services/specializationService");

exports.getAllSpecializations = async (req, res) => {
  try {
    const specializations = await specializationService.getAllSpecializations();
    res.json(specializations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSpecialization = async (req, res) => {
  try {
    const specialization = await specializationService.getSpecializationById(
      req.params.id,
    );
    if (!specialization) {
      return res.status(404).json({ error: "Specialization not found" });
    }
    res.json(specialization);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createSpecialization = async (req, res) => {
  try {
    const specialization = await specializationService.createSpecialization(
      req.body,
    );
    res.status(201).json(specialization);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateSpecialization = async (req, res) => {
  try {
    const specialization = await specializationService.updateSpecialization(
      req.params.id,
      req.body,
    );
    if (!specialization) {
      return res.status(404).json({ error: "Specialization not found" });
    }
    res.json(specialization);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteSpecialization = async (req, res) => {
  try {
    const specialization = await specializationService.deleteSpecialization(
      req.params.id,
    );
    res.json(specialization);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
