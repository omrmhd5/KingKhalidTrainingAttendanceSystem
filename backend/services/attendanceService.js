const Attendance = require("../models/Attendance");
const Trainee = require("../models/Trainee");
const Shift = require("../models/Shift");

class AttendanceService {
  async recordEntry(scannedId, shiftId, date) {
    if (!scannedId || !shiftId || !date) {
      throw {
        code: "MISSING_FIELDS",
        message: "الرقم المسح والشفت والتاريخ مطلوبة",
      };
    }

    // Validate that the provided date is today (KSA timezone)
    const now = new Date();
    const ksaNow = new Date(
      now.toLocaleString("en-US", { timeZone: "Asia/Riyadh" }),
    );
    const providedDate = new Date(date);
    const ksaToday = new Date(
      ksaNow.getFullYear(),
      ksaNow.getMonth(),
      ksaNow.getDate(),
    );
    const providedDateOnly = new Date(
      providedDate.getFullYear(),
      providedDate.getMonth(),
      providedDate.getDate(),
    );

    if (providedDateOnly.getTime() !== ksaToday.getTime()) {
      throw {
        code: "INVALID_DATE",
        message: "يمكن تسجيل الحضور لليوم الحالي فقط",
      };
    }

    // Find trainee - first try civil_id, then military_id
    let trainee = await Trainee.findOne({
      civil_id: scannedId.trim(),
    });

    if (!trainee) {
      trainee = await Trainee.findOne({
        military_id: scannedId.trim(),
      });
    }

    if (!trainee) {
      throw {
        code: "TRAINEE_NOT_FOUND",
        message: `لم يتم العثور على متدرب برقم مدني أو عسكري ${scannedId}`,
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
      military_id: trainee.military_id,
      date: { $gte: startOfDay, $lt: endOfDay },
      entry_time: { $exists: true, $ne: null },
    });

    if (existingEntry) {
      throw {
        code: "DUPLICATE_ENTRY",
        message: "تم تسجيل الدخول مسبقاً",
      };
    }

    // Parse shift effective start time (format: "HH:mm")
    // effective_start_time already includes grace period calculation
    const [shiftHours, shiftMinutes] = shift.effective_start_time.split(":");
    const effectiveStartTime = new Date(dateObj);
    effectiveStartTime.setHours(
      parseInt(shiftHours),
      parseInt(shiftMinutes),
      0,
    );

    // Create new attendance record using KSA time
    const status = ksaNow <= effectiveStartTime ? "on-time" : "late";

    const attendance = await Attendance.create({
      trainee_id: trainee._id,
      civil_id: trainee.civil_id,
      military_id: trainee.military_id,
      trainee_assigned_shift_id: trainee.shift_id,
      shift_id: shiftId,
      date: startOfDay,
      entry_time: now,
      status,
    });

    return {
      id: attendance._id,
      civilId: attendance.civil_id,
      militaryId: attendance.military_id,
      shiftId: attendance.shift_id,
      date: attendance.date,
      entryTime: attendance.entry_time,
      status: attendance.status,
    };
  }

  async recordExit(scannedId, date) {
    if (!scannedId || !date) {
      throw {
        code: "MISSING_FIELDS",
        message: "الرقم المسح والتاريخ مطلوبة",
      };
    }

    // Validate that the provided date is today (KSA timezone)
    const now = new Date();
    const ksaNow = new Date(
      now.toLocaleString("en-US", { timeZone: "Asia/Riyadh" }),
    );
    const providedDate = new Date(date);
    const ksaToday = new Date(
      ksaNow.getFullYear(),
      ksaNow.getMonth(),
      ksaNow.getDate(),
    );
    const providedDateOnly = new Date(
      providedDate.getFullYear(),
      providedDate.getMonth(),
      providedDate.getDate(),
    );

    if (providedDateOnly.getTime() !== ksaToday.getTime()) {
      throw {
        code: "INVALID_DATE",
        message: "يمكن تسجيل الحضور لليوم الحالي فقط",
      };
    }

    // Find trainee - first try civil_id, then military_id
    let trainee = await Trainee.findOne({
      civil_id: scannedId.trim(),
    });

    if (!trainee) {
      trainee = await Trainee.findOne({
        military_id: scannedId.trim(),
      });
    }

    if (!trainee) {
      throw {
        code: "TRAINEE_NOT_FOUND",
        message: `لم يتم العثور على متدرب برقم مدني أو عسكري ${scannedId}`,
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
      military_id: trainee.military_id,
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
        message: "تم تسجيل الخروج مسبقاً",
      };
    }

    // Calculate duration (reuse 'now' variable from validation above)
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
      .populate("trainee_id")
      .populate("trainee_assigned_shift_id", "name start_time end_time")
      .populate("shift_id", "name start_time end_time")
      .select("-notes")
      .lean()
      .sort({ entry_time: -1, exit_time: -1 });

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

    // Use aggregation pipeline to efficiently calculate all stats and shifts summary in one query
    const summaryData = await Attendance.aggregate([
      // Filter by date first
      {
        $match: {
          date: { $gte: startOfDay, $lt: endOfDay },
        },
      },
      // Join with trainee_assigned_shift_id for assigned shift name
      {
        $lookup: {
          from: "shifts",
          localField: "trainee_assigned_shift_id",
          foreignField: "_id",
          as: "assignedShift",
        },
      },
      {
        $unwind: {
          path: "$assignedShift",
          preserveNullAndEmptyArrays: true,
        },
      },
      // Join with shift_id for actual shift name
      {
        $lookup: {
          from: "shifts",
          localField: "shift_id",
          foreignField: "_id",
          as: "actualShift",
        },
      },
      {
        $unwind: {
          path: "$actualShift",
          preserveNullAndEmptyArrays: true,
        },
      },
      // Project needed fields
      {
        $project: {
          assignedShiftName: { $ifNull: ["$assignedShift.name", "Unknown"] },
          actualShiftName: { $ifNull: ["$actualShift.name", "Unknown"] },
          entry_time: 1,
          exit_time: 1,
          status: 1,
        },
      },
      // Calculate statistics and shift summary
      {
        $facet: {
          stats: [
            {
              $group: {
                _id: null,
                attended: {
                  $sum: { $cond: [{ $ne: ["$entry_time", null] }, 1, 0] },
                },
                exited: {
                  $sum: {
                    $cond: [
                      { $ne: [{ $type: "$exit_time" }, "missing"] },
                      1,
                      0,
                    ],
                  },
                },
                onTime: {
                  $sum: { $cond: [{ $eq: ["$status", "on-time"] }, 1, 0] },
                },
                late: {
                  $sum: { $cond: [{ $eq: ["$status", "late"] }, 1, 0] },
                },
              },
            },
          ],
          shiftSummary: [
            {
              $match: {
                entry_time: { $ne: null },
              },
            },
            {
              $group: {
                _id: {
                  assigned: "$assignedShiftName",
                  actual: "$actualShiftName",
                },
                count: { $sum: 1 },
              },
            },
            {
              $group: {
                _id: "$_id.assigned",
                shifts: {
                  $push: {
                    name: "$_id.actual",
                    count: "$count",
                  },
                },
              },
            },
            {
              $sort: { _id: 1 },
            },
          ],
        },
      },
    ]);

    // Extract stats
    const stats = summaryData[0]?.stats[0] || {
      attended: 0,
      exited: 0,
      onTime: 0,
      late: 0,
    };

    // Convert shift summary array to object format for frontend
    const shiftSummaryArray = summaryData[0]?.shiftSummary || [];
    const shiftSummary = {};
    shiftSummaryArray.forEach((assigned) => {
      shiftSummary[assigned._id] = {};
      assigned.shifts.forEach((shift) => {
        shiftSummary[assigned._id][shift.name] = shift.count;
      });
    });

    return {
      date,
      attended: stats.attended,
      exited: stats.exited,
      onTime: stats.onTime,
      late: stats.late,
      shiftSummary,
    };
  }

  async getAbsences(date) {
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

    // Use aggregation pipeline for efficient database-level processing
    const absences = await Trainee.aggregate([
      {
        // Left join with attendance records
        $lookup: {
          from: "attendances",
          let: { trainee_id: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$trainee_id", "$$trainee_id"] },
                date: { $gte: startOfDay, $lt: endOfDay },
                entry_time: { $ne: null },
              },
            },
          ],
          as: "attendance",
        },
      },
      // Filter: trainees with no attendance records (absences)
      {
        $match: { attendance: { $size: 0 } },
      },
      // Join with shift data
      {
        $lookup: {
          from: "shifts",
          localField: "shift_id",
          foreignField: "_id",
          as: "shift_id",
        },
      },
      {
        $unwind: { path: "$shift_id", preserveNullAndEmptyArrays: true },
      },
      // Project only needed fields
      {
        $project: {
          _id: 1,
          military_id: 1,
          civil_id: 1,
          full_name: 1,
          shift_id: {
            _id: "$shift_id._id",
            name: "$shift_id.name",
          },
        },
      },
    ]);

    return {
      date,
      absenceCount: absences.length,
      absences,
    };
  }
  async getEscapes(date) {
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

    // Get all attendance records with entry_time but no exit_time (escapes)
    const escapes = await Attendance.find({
      date: { $gte: startOfDay, $lt: endOfDay },
      entry_time: { $exists: true, $ne: null },
      exit_time: { $exists: false, $eq: null },
    })
      .populate("trainee_id", "full_name military_id civil_id")
      .populate("trainee_assigned_shift_id", "name")
      .select("military_id entry_time trainee_id trainee_assigned_shift_id")
      .lean()
      .sort({ entry_time: 1 });

    return {
      date,
      escapeCount: escapes.length,
      escapes: escapes.map((e) => ({
        _id: e._id,
        military_id: e.military_id,
        full_name: e.trainee_id?.full_name,
        civil_id: e.trainee_id?.civil_id,
        shift_id: e.trainee_assigned_shift_id,
        entry_time: e.entry_time,
      })),
    };
  }

  async getLates(date) {
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

    // Get all attendance records with status "late"
    const lates = await Attendance.find({
      date: { $gte: startOfDay, $lt: endOfDay },
      status: "late",
      entry_time: { $exists: true, $ne: null },
    })
      .populate("trainee_id", "full_name military_id civil_id")
      .populate("trainee_assigned_shift_id", "name")
      .select("military_id entry_time trainee_id trainee_assigned_shift_id")
      .lean()
      .sort({ entry_time: 1 });

    return {
      date,
      lateCount: lates.length,
      lates: lates.map((l) => ({
        _id: l._id,
        military_id: l.military_id,
        full_name: l.trainee_id?.full_name,
        civil_id: l.trainee_id?.civil_id,
        shift_id: l.trainee_assigned_shift_id,
        entry_time: l.entry_time,
      })),
    };
  }

  async clearExitData(ids) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new Error("Array of attendance IDs is required");
    }

    const result = await Attendance.updateMany(
      { _id: { $in: ids } },
      { $unset: { exit_time: "", duration_minutes: "" } },
    );
    return {
      message: `تم مسح بيانات الخروج لـ ${result.modifiedCount} سجل`,
      modifiedCount: result.modifiedCount,
    };
  }

  async deleteAttendance(id) {
    if (!id) {
      throw new Error("Attendance ID is required");
    }

    const attendance = await Attendance.findById(id);
    if (!attendance) {
      throw new Error("Attendance record not found");
    }

    await Attendance.findByIdAndDelete(id);
    return {
      message: "تم حذف السجل بنجاح",
      deletedId: id,
    };
  }

  async deleteMultipleAttendance(ids) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new Error("Array of attendance IDs is required");
    }

    const result = await Attendance.deleteMany({ _id: { $in: ids } });
    return {
      message: `تم حذف ${result.deletedCount} سجل`,
      deletedCount: result.deletedCount,
    };
  }
}

module.exports = new AttendanceService();
