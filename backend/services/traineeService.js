const Trainee = require("../models/Trainee");
const Shift = require("../models/Shift");
const Rank = require("../models/Rank");
const Specialization = require("../models/Specialization");
const shiftService = require("./shiftService");
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

    try {
      await trainee.save();
    } catch (error) {
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        if (field === "military_id") {
          throw new Error(
            `المتدرب برقم عسكري ${data.military_id} مسجل بالفعل في النظام`,
          );
        } else if (field === "civil_id") {
          throw new Error(
            `المتدرب برقم مدني ${data.civil_id} مسجل بالفعل في النظام`,
          );
        }
      }
      throw error;
    }

    // Add trainee to shift's trainees array
    await Shift.findByIdAndUpdate(
      data.shift_id,
      { $push: { trainees: trainee._id } },
      { new: true },
    );

    // Update trainees count
    await shiftService.updateTraineesCount(data.shift_id);

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
        await shiftService.updateTraineesCount(currentTrainee.shift_id);

        // Add trainee to new shift
        await Shift.findByIdAndUpdate(
          data.shift_id,
          { $push: { trainees: id } },
          { new: true },
        );
        await shiftService.updateTraineesCount(data.shift_id);
      }
    }

    try {
      return await Trainee.findByIdAndUpdate(id, data, { new: true })
        .populate("shift_id", "name start_time end_time")
        .populate("rank_id", "name")
        .populate("specialty_id", "name")
        .exec();
    } catch (error) {
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        if (field === "military_id") {
          throw new Error(
            `الرقم العسكري ${data.military_id} مستخدم بالفعل من قبل متدرب آخر`,
          );
        } else if (field === "civil_id") {
          throw new Error(
            `السجل المدني ${data.civil_id} مستخدم بالفعل من قبل متدرب آخر`,
          );
        }
      }
      throw error;
    }
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

    // Update trainees count
    await shiftService.updateTraineesCount(trainee.shift_id);

    return trainee;
  }

  async searchByIds(ids, searchType) {
    if (!ids || ids.length === 0) {
      return [];
    }

    const field = searchType === "military" ? "military_id" : "civil_id";
    const query = { [field]: { $in: ids } };

    return await Trainee.find(query)
      .populate("shift_id", "name start_time end_time")
      .populate("rank_id", "name")
      .populate("specialty_id", "name")
      .sort({ createdAt: 1 });
  }

  async bulkImportTrainees(traineesData) {
    if (!Array.isArray(traineesData) || traineesData.length === 0) {
      throw new Error("Trainees data array is required");
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [],
    };

    // Process each trainee
    for (let i = 0; i < traineesData.length; i++) {
      const data = traineesData[i];
      const rowNumber = i + 2;

      try {
        // Validate required fields
        if (!data.military_id || !data.military_id.trim()) {
          throw new Error("Military ID is required");
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

        // Validate that rank, specialty, shift actually exist
        const rank = await Rank.findById(data.rank_id);
        if (!rank) {
          throw new Error(`Rank with ID ${data.rank_id} not found`);
        }

        const specialty = await Specialization.findById(data.specialty_id);
        if (!specialty) {
          throw new Error(`Specialty with ID ${data.specialty_id} not found`);
        }

        const shift = await Shift.findById(data.shift_id);
        if (!shift) {
          throw new Error(`Shift with ID ${data.shift_id} not found`);
        }

        // Check if military ID already exists
        const existing = await Trainee.findOne({
          military_id: data.military_id.trim(),
        });
        if (existing) {
          throw new Error(
            `المتدرب برقم عسكري ${data.military_id.trim()} مسجل بالفعل`,
          );
        }

        // Check if civil ID already exists (if provided)
        if (data.civil_id && data.civil_id.trim()) {
          const civilIdExists = await Trainee.findOne({
            civil_id: data.civil_id.trim(),
          });
          if (civilIdExists) {
            throw new Error(
              `المتدرب برقم مدني ${data.civil_id.trim()} مسجل بالفعل`,
            );
          }
        }

        // Create trainee object
        const traineeObj = {
          military_id: data.military_id.trim(),
          full_name: data.full_name.trim(),
          civil_id: data.civil_id ? data.civil_id.trim() : "",
          rank_id: data.rank_id,
          specialty_id: data.specialty_id,
          shift_id: data.shift_id,
        };

        // Create and save trainee
        const trainee = new Trainee(traineeObj);
        await trainee.save();

        // Add trainee to shift's trainees array
        await Shift.findByIdAndUpdate(
          data.shift_id,
          { $push: { trainees: trainee._id } },
          { new: true },
        );
        await shiftService.updateTraineesCount(data.shift_id);

        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          row: rowNumber,
          militaryId: data.military_id,
          error: error.message,
        });
      }
    }

    return results;
  }
}

module.exports = new TraineeService();
