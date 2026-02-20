const Shift = require("../models/Shift");

class ShiftService {
  async getAllShifts() {
    return await Shift.find().sort({ createdAt: -1 });
  }

  async getShiftById(id) {
    return await Shift.findById(id);
  }

  async createShift(data) {
    const { name, start_time, end_time, grace_minutes } = data;

    if (!name || !start_time || !end_time) {
      throw new Error("Missing required fields: name, start_time, end_time");
    }

    const shift = new Shift({
      name,
      start_time,
      end_time,
      grace_minutes: grace_minutes || 0,
    });

    return await shift.save();
  }

  async updateShift(id, data) {
    const { name, start_time, end_time, grace_minutes } = data;
    const shift = await Shift.findById(id);

    if (!shift) {
      throw new Error("Shift not found");
    }

    if (name !== undefined) shift.name = name;
    if (start_time !== undefined) shift.start_time = start_time;
    if (end_time !== undefined) shift.end_time = end_time;
    if (grace_minutes !== undefined) shift.grace_minutes = grace_minutes;

    return await shift.save();
  }

  async deleteShift(id) {
    const shift = await Shift.findById(id);

    if (!shift) {
      throw new Error("Shift not found");
    }

    return await Shift.deleteOne({ _id: id });
  }
}

module.exports = new ShiftService();
