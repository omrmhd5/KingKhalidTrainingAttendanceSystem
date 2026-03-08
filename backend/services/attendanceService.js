const Attendance = require("../models/Attendance");
const Trainee = require("../models/Trainee");
const Shift = require("../models/Shift");

class AttendanceService {
  async recordEntry(militaryId, shiftId, date) {
    if (!militaryId || !shiftId || !date) {
      throw {
        code: "MISSING_FIELDS",
        message: "الرقم العسكري والشفت والتاريخ مطلوبة",
      };
    }

    // Find trainee
    const trainee = await Trainee.findOne({
      military_id: militaryId.trim(),
    });
    if (!trainee) {
      throw {
        code: "TRAINEE_NOT_FOUND",
        message: `لم يتم العثور على متدرب برقم عسكري ${militaryId}`,
      };
    }

    // Find shift
    const shift = await Shift.findById(shiftId);
    if (!shift) {
      throw {
        code: "SHIFT_NOT_FOUND",
        message: "لم يتم العثور على الشفت",
      };
    }

    // Check if entry already exists for this date
    const dateObj = new Date(date);
    const startOfDay = new Date(
      dateObj.getFullYear(),
      dateObj.getMonth(),
      dateObj.getDate(),
    );
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const existingEntry = await Attendance.findOne({
      military_id: militaryId,
      date: { $gte: startOfDay, $lt: endOfDay },
      entry_time: { $exists: true, $ne: null },
    });

    if (existingEntry) {
      throw {
        code: "DUPLICATE_ENTRY",
        message: "تم تسجيل الدخول لهذا المتدرب اليوم",
      };
    }

    // Parse shift start time (format: "HH:mm")
    const [shiftHours, shiftMinutes] = shift.start_time.split(":");
    const shiftStartTime = new Date(dateObj);
    shiftStartTime.setHours(parseInt(shiftHours), parseInt(shiftMinutes), 0);

    // Calculate grace period
    const graceTime = new Date(shiftStartTime);
    graceTime.setMinutes(graceTime.getMinutes() + shift.grace_minutes);

    // Create new attendance record
    const now = new Date();
    const status = now <= graceTime ? "on-time" : "late";

    const attendance = await Attendance.create({
      trainee_id: trainee._id,
      military_id: trainee.military_id,
      shift_id: shiftId,
      date: startOfDay,
      entry_time: now,
      status,
    });

    return {
      id: attendance._id,
      militaryId: attendance.military_id,
      shiftId: attendance.shift_id,
      date: attendance.date,
      entryTime: attendance.entry_time,
      status: attendance.status,
    };
  }

  async recordExit(militaryId, date) {
    if (!militaryId || !date) {
      throw {
        code: "MISSING_FIELDS",
        message: "الرقم العسكري والتاريخ مطلوبة",
      };
    }

    // Find trainee
    const trainee = await Trainee.findOne({
      military_id: militaryId.trim(),
    });
    if (!trainee) {
      throw {
        code: "TRAINEE_NOT_FOUND",
        message: `لم يتم العثور على متدرب برقم عسكري ${militaryId}`,
      };
    }

    // Find attendance record for this date
    const dateObj = new Date(date);
    const startOfDay = new Date(
      dateObj.getFullYear(),
      dateObj.getMonth(),
      dateObj.getDate(),
    );
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const attendance = await Attendance.findOne({
      military_id: militaryId,
      date: { $gte: startOfDay, $lt: endOfDay },
      entry_time: { $exists: true, $ne: null },
    });

    if (!attendance) {
      throw {
        code: "NO_ENTRY",
        message:
          "لم يتم العثور على سجل دخول لهذا المتدرب اليوم. لا يمكن تسجيل الخروج بدون دخول",
      };
    }

    // Check if exit already exists
    if (attendance.exit_time) {
      throw {
        code: "DUPLICATE_EXIT",
        message: "تم تسجيل الخروج لهذا المتدرب اليوم",
      };
    }

    // Calculate duration
    const now = new Date();
    const durationMs = now - attendance.entry_time;
    const durationMinutes = Math.floor(durationMs / (1000 * 60));

    // Update record
    attendance.exit_time = now;
    attendance.duration_minutes = durationMinutes;
    await attendance.save();

    return {
      id: attendance._id,
      militaryId: attendance.military_id,
      entryTime: attendance.entry_time,
      exitTime: attendance.exit_time,
      durationMinutes: attendance.duration_minutes,
      status: attendance.status,
    };
  }

  async getAttendanceByDate(date, shiftId) {
    if (!date) {
      throw {
        code: "MISSING_FIELDS",
        message: "التاريخ مطلوب",
      };
    }

    const dateObj = new Date(date);
    const startOfDay = new Date(
      dateObj.getFullYear(),
      dateObj.getMonth(),
      dateObj.getDate(),
    );
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const query = {
      date: { $gte: startOfDay, $lt: endOfDay },
    };

    if (shiftId) {
      query.shift_id = shiftId;
    }

    const records = await Attendance.find(query)
      .populate("trainee_id", "full_name military_id rank_id")
      .populate("shift_id", "name start_time end_time")
      .sort({ entry_time: 1 });

    return {
      date,
      recordCount: records.length,
      records,
    };
  }

  async getDailySummary(date) {
    if (!date) {
      throw {
        code: "MISSING_FIELDS",
        message: "التاريخ مطلوب",
      };
    }

    const dateObj = new Date(date);
    const startOfDay = new Date(
      dateObj.getFullYear(),
      dateObj.getMonth(),
      dateObj.getDate(),
    );
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    // Get all attendance records for the day
    const records = await Attendance.find({
      date: { $gte: startOfDay, $lt: endOfDay },
    }).populate("shift_id", "name");

    // Calculate summary
    const totalRecords = records.length;
    const attendedCount = records.filter((r) => r.entry_time).length;
    const exitedCount = records.filter((r) => r.exit_time).length;
    const onTimeCount = records.filter((r) => r.status === "on-time").length;
    const lateCount = records.filter((r) => r.status === "late").length;

    // Group by shift
    const byShift = {};
    records.forEach((record) => {
      const shiftName = record.shift_id?.name || "Unknown";
      if (!byShift[shiftName]) {
        byShift[shiftName] = {
          attended: 0,
          exited: 0,
          onTime: 0,
          late: 0,
        };
      }
      if (record.entry_time) byShift[shiftName].attended++;
      if (record.exit_time) byShift[shiftName].exited++;
      if (record.status === "on-time") byShift[shiftName].onTime++;
      if (record.status === "late") byShift[shiftName].late++;
    });

    return {
      date,
      summary: {
        totalRecords,
        attended: attendedCount,
        exited: exitedCount,
        onTime: onTimeCount,
        late: lateCount,
        byShift,
      },
    };
  }
}

module.exports = new AttendanceService();
