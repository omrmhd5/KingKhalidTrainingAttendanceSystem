const Violation = require("../models/Violation");
const Trainee = require("../models/Trainee");

class ViolationService {
  async createViolation(trainee_id, description) {
    const violation = new Violation({
      trainee_id,
      description,
    });

    const savedViolation = await violation.save();

    // Update trainee: add violation to array and set hasViolation to true
    await Trainee.findByIdAndUpdate(
      trainee_id,
      {
        $push: { violations: savedViolation._id },
        hasViolation: true,
      },
      { new: true },
    );

    // Return the violation with populated trainee_id
    return await Violation.findById(savedViolation._id).populate("trainee_id");
  }

  async getViolationsByTraineeId(trainee_id) {
    return await Violation.find({ trainee_id }).populate("trainee_id");
  }

  async getAllViolations() {
    return await Violation.find()
      .populate("trainee_id")
      .sort({ createdAt: -1 });
  }

  async updateViolation(violationId, description) {
    const violation = await Violation.findByIdAndUpdate(
      violationId,
      { description },
      { new: true },
    ).populate("trainee_id");

    if (!violation) {
      throw new Error("Violation not found");
    }

    return violation;
  }

  async deleteViolation(violationId) {
    const violation = await Violation.findById(violationId);

    if (!violation) {
      throw new Error("Violation not found");
    }

    // Remove violation from trainee's violations array and get updated trainee
    const updatedTrainee = await Trainee.findByIdAndUpdate(
      violation.trainee_id,
      {
        $pull: { violations: violationId },
      },
      { new: true },
    );

    // If no violations remain in the trainee's array, set hasViolation to false
    if (updatedTrainee.violations.length === 0) {
      await Trainee.findByIdAndUpdate(
        violation.trainee_id,
        { hasViolation: false },
        { new: true },
      );
    }

    return await Violation.findByIdAndDelete(violationId);
  }

  async deleteAllViolationsByTraineeId(trainee_id) {
    // Get all violations for this trainee
    const violations = await Violation.find({ trainee_id });

    // Delete all violations
    await Violation.deleteMany({ trainee_id });

    // Update trainee: clear violations array and set hasViolation to false
    await Trainee.findByIdAndUpdate(
      trainee_id,
      {
        violations: [],
        hasViolation: false,
      },
      { new: true },
    );

    return violations;
  }
}

module.exports = new ViolationService();
