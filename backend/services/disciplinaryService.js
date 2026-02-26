const Disciplinary = require("../models/Disciplinary");
const Trainee = require("../models/Trainee");

class DisciplinaryService {
  async createDisciplinary(trainee_id) {
    const disciplinary = new Disciplinary({
      trainee_id,
    });

    const savedDisciplinary = await disciplinary.save();

    // Update trainee: add disciplinary to array and set hasDisciplinary to true
    await Trainee.findByIdAndUpdate(
      trainee_id,
      {
        $push: { disciplinary: savedDisciplinary._id },
        hasDisciplinary: true,
      },
      { new: true },
    );

    // Return the disciplinary with populated trainee_id
    return await Disciplinary.findById(savedDisciplinary._id).populate(
      "trainee_id",
    );
  }

  async getDisciplinaryByTraineeId(trainee_id) {
    return await Disciplinary.find({ trainee_id }).populate("trainee_id");
  }

  async getAllDisciplinary() {
    return await Disciplinary.find()
      .populate("trainee_id")
      .sort({ createdAt: -1 });
  }

  async deleteDisciplinary(disciplinaryId) {
    const disciplinary = await Disciplinary.findById(disciplinaryId);

    if (!disciplinary) {
      throw new Error("Disciplinary request not found");
    }

    // Remove disciplinary from trainee's disciplinary array and get updated trainee
    const updatedTrainee = await Trainee.findByIdAndUpdate(
      disciplinary.trainee_id,
      {
        $pull: { disciplinary: disciplinaryId },
      },
      { new: true },
    );

    // If no disciplinary requests remain in the trainee's array, set hasDisciplinary to false
    if (updatedTrainee.disciplinary.length === 0) {
      await Trainee.findByIdAndUpdate(
        disciplinary.trainee_id,
        { hasDisciplinary: false },
        { new: true },
      );
    }

    return await Disciplinary.findByIdAndDelete(disciplinaryId);
  }

  async deleteAllDisciplinaryByTraineeId(trainee_id) {
    // Get all disciplinary requests for this trainee
    const disciplinaryRequests = await Disciplinary.find({ trainee_id });

    // Delete all disciplinary requests
    await Disciplinary.deleteMany({ trainee_id });

    // Update trainee: clear disciplinary array and set hasDisciplinary to false
    await Trainee.findByIdAndUpdate(
      trainee_id,
      {
        disciplinary: [],
        hasDisciplinary: false,
      },
      { new: true },
    );

    return disciplinaryRequests;
  }
}

module.exports = new DisciplinaryService();
