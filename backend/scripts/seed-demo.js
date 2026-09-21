require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const Shift = require("../models/Shift");
const Rank = require("../models/Rank");
const Specialization = require("../models/Specialization");
const Trainee = require("../models/Trainee");
const Violation = require("../models/Violation");
const Disciplinary = require("../models/Disciplinary");
const Class = require("../models/Class");
const ClassTimeSchedule = require("../models/ClassTimeSchedule");
const ClassReport = require("../models/ClassReport");
const Attendance = require("../models/Attendance");
const { calculateEffectiveStartTime } = require("../utils/timeUtils");

const LOCAL_URI =
  "mongodb://127.0.0.1:27017/king-khalid-training-attendance-system-demo";

const RANKS = [
  "Technical Student",
  "Technical Corporal",
  "Technical Sergeant",
  "Senior Technical Sergeant",
  "Technical Master Sergeant",
];

const SPECIALIZATIONS = [
  "Electronics",
  "Stations",
  "Sensors",
  "Armament",
  "Engines",
  "General Maintenance",
  "Electrical and Antennas",
  "Ejection Seats",
  "Hydraulics",
  "Fuel",
  "Ground Equipment",
  "Parachutes",
  "Rescue Equipment",
];

/** Calendar day in Asia/Riyadh, recomputed every time the seed runs. */
function getKSAToday() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Riyadh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const get = (type) => parts.find((p) => p.type === type).value;
  const year = Number(get("year"));
  const month = Number(get("month"));
  const day = Number(get("day"));
  const iso = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  return {
    iso,
    // Attendance queries use local midnight of this calendar day.
    attendanceDate: new Date(year, month - 1, day, 0, 0, 0, 0),
    // Class reports are matched with new Date("yyyy-MM-dd") (UTC midnight).
    reportDate: new Date(iso),
    at(hours, minutes) {
      return new Date(year, month - 1, day, hours, minutes, 0, 0);
    },
  };
}

function pickUri() {
  const mode = process.argv.includes("--remote") ? "remote" : "local";
  if (mode === "remote") {
    const uri = process.env.MONGO_URI_REMOTE || process.env.MONGODB_URI;
    if (!uri || uri.includes("127.0.0.1") || uri.includes("localhost")) {
      throw new Error(
        "Remote seed needs MONGO_URI_REMOTE (Atlas) for king-khalid-training-attendance-system-demo.",
      );
    }
    return { mode, uri };
  }
  return {
    mode,
    uri: process.env.MONGO_URI_LOCAL || LOCAL_URI,
  };
}

async function wipe() {
  await Promise.all([
    User.deleteMany({}),
    Shift.deleteMany({}),
    Rank.deleteMany({}),
    Specialization.deleteMany({}),
    Trainee.deleteMany({}),
    Violation.deleteMany({}),
    Disciplinary.deleteMany({}),
    Class.deleteMany({}),
    ClassTimeSchedule.deleteMany({}),
    ClassReport.deleteMany({}),
    Attendance.deleteMany({}),
  ]);
}

async function seed() {
  const { mode, uri } = pickUri();
  console.log(`Seeding ${mode} database...`);
  await mongoose.connect(uri);
  await wipe();

  const ranks = await Rank.insertMany(RANKS.map((name) => ({ name })));
  const specs = await Specialization.insertMany(
    SPECIALIZATIONS.map((name) => ({ name })),
  );

  const shiftA = await Shift.create({
    name: "A",
    start_time: "00:00",
    end_time: "12:00",
    grace_minutes: 60,
    effective_start_time: calculateEffectiveStartTime("00:00", 60),
    trainees: [],
    trainees_count: 0,
  });
  const shiftB = await Shift.create({
    name: "B",
    start_time: "12:00",
    end_time: "23:59",
    grace_minutes: 60,
    effective_start_time: calculateEffectiveStartTime("12:00", 60),
    trainees: [],
    trainees_count: 0,
  });

  const classSchedule = await ClassTimeSchedule.create({
    name: "Morning class schedule",
    start_time: "08:00",
    end_time: "14:00",
    classes: [],
  });

  const klass = await Class.create({
    name: "Class 1",
    assignedTeacherId: null,
    students: [],
    schedule: classSchedule._id,
  });
  classSchedule.classes.push(klass._id);
  await classSchedule.save();

  const admin = new User({
    username: "admin",
    email: "admin@admin.com",
    password: "admin123",
    role: "admin",
  });
  await admin.save();

  const teacher = new User({
    username: "teacher",
    email: "teacher@teacher.com",
    password: "teacher123",
    role: "teacher",
    class: klass._id,
  });
  await teacher.save();

  klass.assignedTeacherId = teacher._id;
  await klass.save();

  const traineesData = [
    {
      civil_id: "1010000001",
      military_id: "2010000001",
      full_name: "Ahmed Mohammed",
      rank_id: ranks[0]._id,
      specialty_id: specs[0]._id,
      shift_id: shiftA._id,
      class: klass._id,
    },
    {
      civil_id: "1010000002",
      military_id: "2010000002",
      full_name: "Khalid Al-Otaibi",
      rank_id: ranks[2]._id,
      specialty_id: specs[4]._id,
      shift_id: shiftA._id,
      class: klass._id,
    },
    {
      civil_id: "1010000003",
      military_id: "2010000003",
      full_name: "Salem Al-Qurashi",
      rank_id: ranks[1]._id,
      specialty_id: specs[5]._id,
      shift_id: shiftB._id,
      class: klass._id,
    },
  ];

  const trainees = await Trainee.insertMany(traineesData);
  klass.students = trainees.map((t) => t._id);
  await klass.save();

  shiftA.trainees = [trainees[0]._id, trainees[1]._id];
  shiftA.trainees_count = 2;
  await shiftA.save();
  shiftB.trainees = [trainees[2]._id];
  shiftB.trainees_count = 1;
  await shiftB.save();

  const violation = await Violation.create({
    trainee_id: trainees[0]._id,
    description: "Late for the morning formation",
  });
  trainees[0].hasViolation = true;
  trainees[0].violations = [violation._id];
  await trainees[0].save();

  const disciplinary = await Disciplinary.create({
    trainee_id: trainees[1]._id,
    reason: "Discipline follow-up for repeated absence",
  });
  trainees[1].hasDisciplinary = true;
  trainees[1].disciplinary = [disciplinary._id];
  await trainees[1].save();

  const today = getKSAToday();
  const onTimeEntry = today.at(6, 20);
  const onTimeExit = today.at(12, 0);
  const lateEntry = today.at(8, 15);

  await Attendance.insertMany([
    {
      trainee_id: trainees[0]._id,
      civil_id: trainees[0].civil_id,
      military_id: trainees[0].military_id,
      trainee_assigned_shift_id: shiftA._id,
      shift_id: shiftA._id,
      date: today.attendanceDate,
      entry_time: onTimeEntry,
      exit_time: onTimeExit,
      status: "on-time",
      duration_minutes: Math.round((onTimeExit - onTimeEntry) / 60000),
    },
    {
      trainee_id: trainees[1]._id,
      civil_id: trainees[1].civil_id,
      military_id: trainees[1].military_id,
      trainee_assigned_shift_id: shiftA._id,
      shift_id: shiftA._id,
      date: today.attendanceDate,
      entry_time: lateEntry,
      status: "late",
      duration_minutes: 0,
    },
  ]);

  await ClassReport.create({
    date: today.reportDate,
    teacherId: teacher._id,
    classId: klass._id,
    schedule: classSchedule._id,
    presentReports: [{ studentId: trainees[0]._id }],
    absenceReports: [{ studentId: trainees[2]._id }],
    escapeReports: [{ studentId: trainees[1]._id }],
    courseReports: [],
    violationReports: [
      {
        studentId: trainees[0]._id,
        violationType: 1,
        violationDescription: "Late for the morning formation",
      },
    ],
    submittedAt: today.at(9, 0),
    stats: {
      present: 1,
      absence: 1,
      escapes: 1,
      course: 0,
      violations: 1,
    },
  });

  console.log(`Seeded ${mode}:`);
  console.log("  admin@admin.com / admin123");
  console.log("  teacher@teacher.com / teacher123");
  console.log(`  ranks ${ranks.length}, specializations ${specs.length}`);
  console.log("  shifts A + B, 1 class, 3 trainees");
  console.log("  1 violation, 1 disciplinary request");
  console.log(
    `  today ${today.iso}: 1 on-time (with exit), 1 late (no exit), 1 absent, 1 class report`,
  );

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
