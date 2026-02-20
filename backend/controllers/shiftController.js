const shiftService = require("../services/shiftService");

// Get all shifts
exports.getAllShifts = async (req, res) => {
  try {
    const shifts = await shiftService.getAllShifts();
    res.json(shifts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single shift
exports.getShift = async (req, res) => {
  try {
    const shift = await shiftService.getShiftById(req.params.id);
    if (!shift) {
      return res.status(404).json({ message: "Shift not found" });
    }
    res.json(shift);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create shift
exports.createShift = async (req, res) => {
  try {
    const shift = await shiftService.createShift(req.body);
    res.status(201).json(shift);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update shift
exports.updateShift = async (req, res) => {
  try {
    const shift = await shiftService.updateShift(req.params.id, req.body);
    res.json(shift);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete shift
exports.deleteShift = async (req, res) => {
  try {
    await shiftService.deleteShift(req.params.id);
    res.json({ message: "Shift deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
