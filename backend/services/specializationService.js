const Specialization = require("../models/Specialization");

class SpecializationService {
  async getAllSpecializations() {
    return await Specialization.find().sort({ createdAt: 1 });
  }

  async getSpecializationById(id) {
    return await Specialization.findById(id);
  }

  async createSpecialization(data) {
    if (!data.name || !data.name.trim()) {
      throw new Error("Specialization name is required");
    }
    const specialization = new Specialization({
      name: data.name,
    });
    return await specialization.save();
  }

  async updateSpecialization(id, data) {
    if (!data.name || !data.name.trim()) {
      throw new Error("Specialization name is required");
    }
    return await Specialization.findByIdAndUpdate(
      id,
      { name: data.name },
      { new: true },
    );
  }

  async deleteSpecialization(id) {
    const specialization = await Specialization.findByIdAndDelete(id);
    if (!specialization) {
      throw new Error("Specialization not found");
    }
    return specialization;
  }
}

module.exports = new SpecializationService();
