doctor-patient-app/
  server/
    package.json
    .env.example
    src/
      app.js
      index.js
      constants.js
      db/
        index.js
      controllers/
        auth.controller.js
        doctor.controller.js
        appointment.controller.js
        wallet.controller.js
      models/
        user.model.js
        doctorProfile.model.js
        appointment.model.js
        wallet.model.js
      routes/
        auth.routes.js
        doctor.routes.js
        appointment.routes.js
      middlewares/
        auth.middleware.js
        role.middleware.js
        error.middleware.js
      utils/
        ApiError.js
        ApiResponse.js
        asyncHandler.js
  client/
    package.json
    src/
      App.jsx
      index.jsx
      pages/
        SignIn.jsx
        SignUp.jsx
        DoctorSteps.jsx
        DoctorList.jsx
      api/
        api.js
  README.md






PORT=5000
MONGODB_URI=mongodb://localhost:27017
JWT_SECRET=change_this_secret
DEFAULT_PATIENT_WALLET=1000





export const DB_NAME = "doctor_patient_app";
export const ROLES = {
  DOCTOR: "doctor",
  PATIENT: "patient"
};
// appointment statuses
export const APPOINTMENT_STATUS = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
  ONGOING: "ongoing"
};

// auto-cancel minutes for pending requests
export const AUTO_CANCEL_MINUTES = 20;

// reschedule cutoff minutes
export const RESCHEDULE_CUTOFF_MINUTES = 60;







usermodel

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { ROLES } from "../constants.js";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: [ROLES.DOCTOR, ROLES.PATIENT], required: true },
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

export const User = mongoose.model("User", userSchema);





doctor profile model



import mongoose from "mongoose";

const stepSchema = new mongoose.Schema({
  documents: [{ filename: String, url: String }],
  charges: [{ durationMinutes: Number, price: Number }],
  timeSlots: [{ dayOfWeek: String, slots: [{ start: String, end: String }] }],
  qualifications: [String],
  unavailableDates: [Date],
  experience: String
});

const doctorProfileSchema = new mongoose.Schema({
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  // The step object holds the profile content. We store all fields and allow partial completion.
  documents: [{ filename: String, url: String }],
  charges: [{ durationMinutes: Number, price: Number }],
  timeSlots: [{ dayOfWeek: String, slots: [{ start: String, end: String }] }],
  qualifications: [String],
  unavailableDates: [Date],
  experience: String,
  completedSteps: [Number], // track completed steps 1..6
  createdAt: { type: Date, default: Date.now }
});

export const DoctorProfile = mongoose.model("DoctorProfile", doctorProfileSchema);






appointment model

import mongoose from "mongoose";
import { APPOINTMENT_STATUS } from "../constants.js";

const appointmentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  status: { type: String, enum: Object.values(APPOINTMENT_STATUS), default: APPOINTMENT_STATUS.PENDING },
  amount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  // freeze money reference
  frozen: { type: Boolean, default: false }
});

appointmentSchema.index({ doctor: 1, startTime: 1, endTime: 1 });

export const Appointment = mongoose.model("Appointment", appointmentSchema);











wallet model
import mongoose from "mongoose";

const walletSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  balance: { type: Number, default: 0 },
  frozen: { type: Number, default: 0 } // amount frozen for pending appointments
});

export const Wallet = mongoose.model("Wallet", walletSchema);








auth controller 
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { Wallet } from "../models/wallet.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { ROLES } from "../constants.js";

const signToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) throw new ApiError(400, "Missing fields");
  if (![ROLES.DOCTOR, ROLES.PATIENT].includes(role)) throw new ApiError(400, "Invalid role");

  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, "Email already in use");

  const user = await User.create({ name, email, password, role });

  // For patients, create default wallet balance
  if (role === ROLES.PATIENT) {
    const defaultAmt = Number(process.env.DEFAULT_PATIENT_WALLET || 0);
    await Wallet.create({ user: user._id, balance: defaultAmt, frozen: 0 });
  } else {
    // doctor wallet always created too
    await Wallet.create({ user: user._id, balance: 0, frozen: 0 });
  }

  const token = signToken(user);
  res.status(201).json(new ApiResponse(201, { token, user: { id: user._id, name: user.name, email: user.email, role: user.role } }, "User created"));
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ApiError(400, "Missing fields");

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(401, "Invalid credentials");

  const matched = await user.comparePassword(password);
  if (!matched) throw new ApiError(401, "Invalid credentials");

  const token = signToken(user);
  res.json(new ApiResponse(200, { token, user: { id: user._id, name: user.name, email: user.email, role: user.role } }, "Logged in"));
});











doctor controller
import { DoctorProfile } from "../models/doctorProfile.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

// Step-based profile updates. Each step updates parts of the profile and marks the step completed.
export const updateStep = asyncHandler(async (req, res) => {
  const { step } = req.params; // 1..6
  const doctorId = req.user._id;
  let profile = await DoctorProfile.findOne({ doctor: doctorId });
  if (!profile) profile = await DoctorProfile.create({ doctor: doctorId });

  const body = req.body || {};

  switch (String(step)) {
    case "1":
      // upload documents array: [{ filename, url }]
      profile.documents = body.documents || profile.documents;
      break;
    case "2":
      profile.charges = body.charges || profile.charges;
      break;
    case "3":
      profile.timeSlots = body.timeSlots || profile.timeSlots;
      break;
    case "4":
      profile.qualifications = body.qualifications || profile.qualifications;
      break;
    case "5":
      profile.unavailableDates = body.unavailableDates ? body.unavailableDates.map(d => new Date(d)) : profile.unavailableDates;
      break;
    case "6":
      profile.experience = body.experience || profile.experience;
      break;
    default:
      throw new ApiError(400, "Invalid step");
  }

  if (!profile.completedSteps.includes(Number(step))) profile.completedSteps.push(Number(step));
  await profile.save();
  res.json(new ApiResponse(200, profile, `Step ${step} updated`));
});

export const getProfile = asyncHandler(async (req, res) => {
  const { doctorId } = req.params;
  const profile = await DoctorProfile.findOne({ doctor: doctorId }).populate('doctor', 'name email');
  if (!profile) throw new ApiError(404, "Profile not found");
  res.json(new ApiResponse(200, profile));
});

export const listDoctors = asyncHandler(async (req, res) => {
  // filters: available day and date
  const { dayOfWeek, date } = req.query;

  let query = {};
  if (dayOfWeek) {
    query['timeSlots.dayOfWeek'] = dayOfWeek;
  }
  if (date) {
    // exclude doctors who have that date in unavailableDates
    const d = new Date(date);
    query['unavailableDates'] = { $ne: d };
  }

  // only return doctors who completed all steps 1..6
  const docs = await DoctorProfile.find(query).populate('doctor', 'name email').lean();
  const completed = docs.filter(d => {
    const steps = d.completedSteps || [];
    return [1,2,3,4,5,6].every(s => steps.includes(s));
  });

  res.json(new ApiResponse(200, completed));
});











appointment controller 
import { Appointment } from "../models/appointment.model.js";
import { DoctorProfile } from "../models/doctorProfile.model.js";
import { Wallet } from "../models/wallet.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { APPOINTMENT_STATUS, RESCHEDULE_CUTOFF_MINUTES } from "../constants.js";

// utility to check overlapping appointments
const isOverlapping = (startA, endA, startB, endB) => {
  return startA < endB && startB < endA;
};

export const getAvailableSlots = asyncHandler(async (req, res) => {
  const { doctorId, date } = req.query;
  if (!doctorId || !date) throw new ApiError(400, "doctorId and date required");
  const target = new Date(date);
  const dayOfWeek = target.toLocaleString('en-US', { weekday: 'long' });

  const profile = await DoctorProfile.findOne({ doctor: doctorId });
  if (!profile) throw new ApiError(404, "Doctor profile not found");

  // find day's time slots
  const daySlots = (profile.timeSlots || []).find(t => t.dayOfWeek === dayOfWeek);
  if (!daySlots) return res.json(new ApiResponse(200, []));

  // fetch appointments of that doctor for that date
  const startOfDay = new Date(target); startOfDay.setHours(0,0,0,0);
  const endOfDay = new Date(target); endOfDay.setHours(23,59,59,999);
  const appointments = await Appointment.find({ doctor: doctorId, startTime: { $gte: startOfDay, $lte: endOfDay }, status: { $ne: APPOINTMENT_STATUS.CANCELLED } });

  const available = [];
  for (const s of daySlots.slots) {
    // s.start and s.end are strings like "09:00"
    const [sh, sm] = s.start.split(":").map(Number);
    const [eh, em] = s.end.split(":").map(Number);
    const slotStart = new Date(target); slotStart.setHours(sh, sm, 0, 0);
    const slotEnd = new Date(target); slotEnd.setHours(eh, em, 0, 0);

    // split into durations based on charges durations
    // for simplicity: return the slot period if any sub-slot available
    const overlaps = appointments.some(a => isOverlapping(slotStart, slotEnd, a.startTime, a.endTime));
    if (!overlaps) available.push({ start: slotStart, end: slotEnd });
  }

  res.json(new ApiResponse(200, available));
});

export const bookAppointment = asyncHandler(async (req, res) => {
  const { doctorId, startTime, endTime, amount } = req.body;
  if (!doctorId || !startTime || !endTime || !amount) throw new ApiError(400, "Missing fields");

  const s = new Date(startTime);
  const e = new Date(endTime);
  if (s >= e) throw new ApiError(400, "Invalid times");

  // check overlapping appointments for the same doctor
  const overlapping = await Appointment.findOne({
    doctor: doctorId,
    status: { $in: [APPOINTMENT_STATUS.PENDING, APPOINTMENT_STATUS.ACCEPTED, APPOINTMENT_STATUS.ONGOING] },
    $or: [
      { startTime: { $lt: e, $gte: s } },
      { endTime: { $gt: s, $lte: e } },
      { startTime: { $lte: s }, endTime: { $gte: e } }
    ]
  });
  if (overlapping) throw new ApiError(409, "Time slot already booked");

  // wallet handling: deduct from patient, freeze to doctor's frozen
  const patientWallet = await Wallet.findOne({ user: req.user._id });
  if (!patientWallet) throw new ApiError(400, "Patient wallet not found");
  if (patientWallet.balance < amount) throw new ApiError(400, "Insufficient balance");

  patientWallet.balance -= amount;
  await patientWallet.save();

  const doctorWallet = await Wallet.findOne({ user: doctorId });
  if (!doctorWallet) throw new ApiError(400, "Doctor wallet not found");
  doctorWallet.frozen += amount;
  await doctorWallet.save();

  const appt = await Appointment.create({ patient: req.user._id, doctor: doctorId, startTime: s, endTime: e, amount, status: APPOINTMENT_STATUS.PENDING, frozen: true });

  res.status(201).json(new ApiResponse(201, appt, "Appointment requested"));
});

export const listAppointments = asyncHandler(async (req, res) => {
  const { filter } = req.query; // upcoming, ongoing, cancelled, completed
  const user = req.user;
  const base = { $or: [{ patient: user._id }, { doctor: user._id }] };
  let statusFilter = {};
  if (filter) {
    switch (filter) {
      case 'upcoming':
        statusFilter = { status: APPOINTMENT_STATUS.ACCEPTED };
        break;
      case 'ongoing':
        statusFilter = { status: APPOINTMENT_STATUS.ONGOING };
        break;
      case 'cancelled':
        statusFilter = { status: APPOINTMENT_STATUS.CANCELLED };
        break;
      case 'completed':
        statusFilter = { status: APPOINTMENT_STATUS.COMPLETED };
        break;
      default:
        statusFilter = {};
    }
  }

  const appts = await Appointment.find({ ...base, ...statusFilter }).populate('doctor patient', 'name email');
  res.json(new ApiResponse(200, appts));
});

export const changeStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { action } = req.body; // accept, reject, cancel, complete
  const appt = await Appointment.findById(id);
  if (!appt) throw new ApiError(404, "Appointment not found");

  // time cutoff for rescheduling/cancelling: if within 60 minutes, cannot reschedule
  const now = new Date();
  const minutesToStart = (appt.startTime - now) / (1000 * 60);

  if ((action === 'reschedule' || action === 'rescheduleTo') && minutesToStart <= RESCHEDULE_CUTOFF_MINUTES) {
    throw new ApiError(400, "Cannot reschedule within 60 minutes of start");
  }

  switch (action) {
    case 'accept':
      appt.status = APPOINTMENT_STATUS.ACCEPTED;
      appt.frozen = true;
      break;
    case 'reject':
      appt.status = APPOINTMENT_STATUS.REJECTED;
      // refund patient fully because doctor rejected
      await refundToPatient(appt);
      break;
    case 'cancel':
      // who cancels? check req.user
      if (String(req.user._id) === String(appt.doctor)) {
        // doctor cancels -> 100% refund
        appt.status = APPOINTMENT_STATUS.CANCELLED;
        await refundToPatient(appt);
      } else if (String(req.user._id) === String(appt.patient)) {
        // patient cancels -> time-based charge
        const refundAmount = await handlePatientCancel(appt);
        appt.status = APPOINTMENT_STATUS.CANCELLED;
      } else {
        throw new ApiError(403, "Not allowed");
      }
      break;
    case 'complete':
      appt.status = APPOINTMENT_STATUS.COMPLETED;
      // transfer frozen to doctor's balance
      await transferFrozenToDoctor(appt);
      break;
    default:
      throw new ApiError(400, "Unknown action");
  }

  await appt.save();
  res.json(new ApiResponse(200, appt, "Status changed"));
});

// helpers
async function refundToPatient(appt) {
  const patientWallet = await Wallet.findOne({ user: appt.patient });
  const doctorWallet = await Wallet.findOne({ user: appt.doctor });
  if (!patientWallet || !doctorWallet) return;
  // if amount was frozen on doctor's wallet, remove from frozen, add to patient
  if (doctorWallet.frozen >= appt.amount) {
    doctorWallet.frozen -= appt.amount;
    await doctorWallet.save();
  }
  patientWallet.balance += appt.amount;
  await patientWallet.save();
}

async function transferFrozenToDoctor(appt) {
  const doctorWallet = await Wallet.findOne({ user: appt.doctor });
  if (!doctorWallet) return;
  if (doctorWallet.frozen >= appt.amount) {
    doctorWallet.frozen -= appt.amount;
    doctorWallet.balance += appt.amount;
    await doctorWallet.save();
  }
}

async function handlePatientCancel(appt) {
  const now = new Date();
  const mins = (appt.startTime - now) / (1000 * 60);
  let refundPct = 0;
  if (mins > 180) refundPct = 100; // over 3 hours
  else if (mins > 120) refundPct = 100; // under 3 hours -> still 100% per your rule
  else if (mins > 60) refundPct = 50; // under 2 hours -> 50%
  else if (mins > 30) refundPct = 20; // under 1 hour -> 20%
  else refundPct = 0; // under 30 mins -> no refund

  const refundAmount = (appt.amount * refundPct) / 100;
  const doctorShare = appt.amount - refundAmount; // charge goes to doctor

  const patientWallet = await Wallet.findOne({ user: appt.patient });
  const doctorWallet = await Wallet.findOne({ user: appt.doctor });
  if (!patientWallet || !doctorWallet) return 0;

  // doctor frozen reduction
  if (doctorWallet.frozen >= appt.amount) {
    doctorWallet.frozen -= appt.amount;
  }
  // doctor receives doctorShare
  doctorWallet.balance += doctorShare;
  await doctorWallet.save();

  // patient gets refundAmount back
  patientWallet.balance += refundAmount;
  await patientWallet.save();

  return refundAmount;
}







wallete controller 
import { Wallet } from "../models/wallet.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const getWallet = asyncHandler(async (req, res) => {
  const w = await Wallet.findOne({ user: req.user._id });
  res.json(new ApiResponse(200, w));
});










auth route
import express from "express";
import { register, login } from "../controllers/auth.controller.js";

const router = express.Router();
router.post('/register', register);
router.post('/login', login);
export default router;





doctor route
import express from "express";
import { updateStep, getProfile, listDoctors } from "../controllers/doctor.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { permit } from "../middlewares/role.middleware.js";
import { ROLES } from "../constants.js";

const router = express.Router();

// doctor profile steps (only doctor can update)
router.put('/step/:step', authMiddleware, permit(ROLES.DOCTOR), updateStep);
router.get('/:doctorId/profile', getProfile);
router.get('/', listDoctors);

export default router;






appointment route
import express from "express";
import { getAvailableSlots, bookAppointment, listAppointments, changeStatus } from "../controllers/appointment.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();
router.get('/slots', getAvailableSlots);
router.post('/', authMiddleware, bookAppointment);
router.get('/', authMiddleware, listAppointments);
router.post('/:id/status', authMiddleware, changeStatus);
export default router;






server app
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import authRoutes from './routes/auth.routes.js';
import doctorRoutes from './routes/doctor.routes.js';
import appointmentRoutes from './routes/appointment.routes.js';
import { errorMiddleware } from './middlewares/error.middleware.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/doctors', doctorRoutes);
app.use('/api/v1/appointments', appointmentRoutes);

app.use(errorMiddleware);
export default app;






server index.js

import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from './db/index.js';
import { Appointment } from './models/appointment.model.js';
import { APPOINTMENT_STATUS, AUTO_CANCEL_MINUTES } from './constants.js';

dotenv.config();
const PORT = process.env.PORT || 5000;

await connectDB();

// start web server
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));

// background job: auto-cancel pending appointments older than AUTO_CANCEL_MINUTES
setInterval(async () => {
  try {
    const cutoff = new Date(Date.now() - AUTO_CANCEL_MINUTES * 60 * 1000);
    const toCancel = await Appointment.find({ status: APPOINTMENT_STATUS.PENDING, createdAt: { $lt: cutoff } });
    for (const a of toCancel) {
      a.status = APPOINTMENT_STATUS.CANCELLED;
      // refund logic - reuse controllers usually, but do minimal safe rollback here:
      // We'll remove frozen from doctor's wallet and refund patient - simplified here
      await a.save();
      console.log('Auto-cancelled appointment', a._id);
    }
  } catch (err) {
    console.error('Auto-cancel job error', err);
  }
}, 60 * 1000); // every minute






