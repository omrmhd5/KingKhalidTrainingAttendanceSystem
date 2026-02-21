const Rank = require("../models/Rank");

class RankService {
  async getAllRanks() {
    return await Rank.find().sort({ createdAt: 1 });
  }

  async getRankById(id) {
    return await Rank.findById(id);
  }

  async createRank(data) {
    if (!data.name || !data.name.trim()) {
      throw new Error("Rank name is required");
    }
    const rank = new Rank({
      name: data.name,
    });
    return await rank.save();
  }

  async updateRank(id, data) {
    if (!data.name || !data.name.trim()) {
      throw new Error("Rank name is required");
    }
    return await Rank.findByIdAndUpdate(id, { name: data.name }, { new: true });
  }

  async deleteRank(id) {
    const rank = await Rank.findByIdAndDelete(id);
    if (!rank) {
      throw new Error("Rank not found");
    }
    return rank;
  }
}

module.exports = new RankService();
