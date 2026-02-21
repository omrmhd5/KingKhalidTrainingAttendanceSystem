const Trainee = require("../models/Trainee");
const Shift = require("../models/Shift");
const Rank = require("../models/Rank");
const Specialization = require("../models/Specialization");
const mongoose = require("mongoose");

class TraineeService {
  async getAllTrainees() {
    return await Trainee.find()
      .populate("shift_id", "name start_time end_time")
      .populate("rank_id", "name")
      .populate("specialty_id", "name")
      .sort({ createdAt: 1 });
  }

  async getTraineeById(id) {
    return await Trainee.findById(id)
      .populate("shift_id", "name start_time end_time")
      .populate("rank_id", "name")
      .populate("specialty_id", "name");
  }

  async createTrainee(data) {
    if (!data.civil_id || !data.civil_id.trim()) {
      throw new Error("Civil ID is required");
    }
    if (!/^\d+$/.test(data.civil_id.trim())) {
      throw new Error("Civil ID must contain only numbers");
    }
    if (!data.military_id || !data.military_id.trim()) {
      throw new Error("Military ID is required");
    }
    if (!/^\d+$/.test(data.military_id.trim())) {
      throw new Error("Military ID must contain only numbers");
    }
    if (!data.full_name || !data.full_name.trim()) {
      throw new Error("Full name is required");
    }
    if (!data.rank_id) {
      throw new Error("Rank is required");
    }
    if (!data.specialty_id) {
      throw new Error("Specialty is required");
    }
    if (!data.shift_id) {
      throw new Error("Shift is required");
    }

    // Verify shift exists
    const shift = await Shift.findById(data.shift_id);
    if (!shift) {
      throw new Error("Shift not found");
    }

    // Verify rank exists
    const rank = await Rank.findById(data.rank_id);
    if (!rank) {
      throw new Error("Rank not found");
    }

    // Verify specialization exists
    const specialization = await Specialization.findById(data.specialty_id);
    if (!specialization) {
      throw new Error("Specialization not found");
    }

    const trainee = new Trainee({
      civil_id: data.civil_id,
      military_id: data.military_id,
      full_name: data.full_name,
      rank_id: data.rank_id,
      specialty_id: data.specialty_id,
      shift_id: data.shift_id,
    });
    await trainee.save();

    // Add trainee to shift's trainees array
    await Shift.findByIdAndUpdate(
      data.shift_id,
      { $push: { trainees: trainee._id } },
      { new: true },
    );

    // Fetch with populated references
    const populated = await Trainee.findById(trainee._id)
      .populate("shift_id", "name start_time end_time")
      .populate("rank_id", "name")
      .populate("specialty_id", "name")
      .exec();
    return populated;
  }

  async updateTrainee(id, data) {
    if (data.civil_id && !data.civil_id.trim()) {
      throw new Error("Civil ID cannot be empty");
    }
    if (data.civil_id && !/^\d+$/.test(data.civil_id.trim())) {
      throw new Error("Civil ID must contain only numbers");
    }
    if (data.military_id && !data.military_id.trim()) {
      throw new Error("Military ID cannot be empty");
    }
    if (data.military_id && !/^\d+$/.test(data.military_id.trim())) {
      throw new Error("Military ID must contain only numbers");
    }
    if (data.full_name && !data.full_name.trim()) {
      throw new Error("Full name cannot be empty");
    }

    // Get current trainee to check if shift is changing
    const currentTrainee = await Trainee.findById(id);
    if (!currentTrainee) {
      throw new Error("Trainee not found");
    }

    if (data.rank_id) {
      const rank = await Rank.findById(data.rank_id);
      if (!rank) {
        throw new Error("Rank not found");
      }
    }

    if (data.specialty_id) {
      const specialization = await Specialization.findById(data.specialty_id);
      if (!specialization) {
        throw new Error("Specialization not found");
      }
    }

    if (data.shift_id) {
      const shift = await Shift.findById(data.shift_id);
      if (!shift) {
        throw new Error("Shift not found");
      }

      // If shift is changing, update both shifts
      if (currentTrainee.shift_id.toString() !== data.shift_id) {
        // Remove trainee from old shift
        await Shift.findByIdAndUpdate(
          currentTrainee.shift_id,
          { $pull: { trainees: id } },
          { new: true },
        );
        // Add trainee to new shift
        await Shift.findByIdAndUpdate(
          data.shift_id,
          { $push: { trainees: id } },
          { new: true },
        );
      }
    }

    return await Trainee.findByIdAndUpdate(id, data, { new: true })
      .populate("shift_id", "name start_time end_time")
      .populate("rank_id", "name")
      .populate("specialty_id", "name")
      .exec();
  }

  async deleteTrainee(id) {
    const trainee = await Trainee.findByIdAndDelete(id);
    if (!trainee) {
      throw new Error("Trainee not found");
    }

    // Remove trainee from shift's trainees array
    await Shift.findByIdAndUpdate(
      trainee.shift_id,
      { $pull: { trainees: id } },
      { new: true },
    );

    return trainee;
  }
}

module.exports = new TraineeService();
