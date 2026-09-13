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
  "طالب فني",
  "وكيل رقيب فني",
  "رقيب فني",
  "رقيب أول فني",
  "رئيس رقباء فني",
];

const SPECIALIZATIONS = [
  "إلكترونيات",
  "محطات",
  "حساسات",
  "تسليح",
  "محركات",
  "صيانة عامة",
  "كهرباء وهوائيات",
  "كراسي إنقاذ",
  "هيدروليك",
  "وقود",
  "معدات أرضية",
  "مظلات",
  "وسائل إنقاذ",
];

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
    start_time: "06:00",
    end_time: "12:00",
    grace_minutes: 60,
    effective_start_time: calculateEffectiveStartTime("06:00", 60),
    trainees: [],
    trainees_count: 0,
  });
  const shiftB = await Shift.create({
    name: "B",
    start_time: "12:00",
    end_time: "19:00",
    grace_minutes: 60,
    effective_start_time: calculateEffectiveStartTime("12:00", 60),
    trainees: [],
    trainees_count: 0,
  });

  const classSchedule = await ClassTimeSchedule.create({
    name: "جدول الفصل الصباحي",
    start_time: "08:00",
    end_time: "14:00",
    classes: [],
  });

  const klass = await Class.create({
    name: "فصل 1",
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
      full_name: "أحمد محمد",
      rank_id: ranks[0]._id,
      specialty_id: specs[0]._id,
      shift_id: shiftA._id,
      class: klass._id,
    },
    {
      civil_id: "1010000002",
      military_id: "2010000002",
      full_name: "خالد العتيبي",
      rank_id: ranks[2]._id,
      specialty_id: specs[4]._id,
      shift_id: shiftA._id,
      class: klass._id,
    },
    {
      civil_id: "1010000003",
      military_id: "2010000003",
      full_name: "سالم القرشي",
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
    description: "تأخير عن الطابور الصباحي",
  });
  trainees[0].hasViolation = true;
  trainees[0].violations = [violation._id];
  await trainees[0].save();

  const disciplinary = await Disciplinary.create({
    trainee_id: trainees[1]._id,
    reason: "طلب متابعة انضباط للغياب المتكرر",
  });
  trainees[1].hasDisciplinary = true;
  trainees[1].disciplinary = [disciplinary._id];
  await trainees[1].save();

  console.log(`Seeded ${mode}:`);
  console.log("  admin@admin.com / admin123");
  console.log("  teacher@teacher.com / teacher123");
  console.log(`  ranks ${ranks.length}, specializations ${specs.length}`);
  console.log("  shifts A + B, 1 class, 3 trainees");
  console.log("  1 violation, 1 disciplinary request");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
