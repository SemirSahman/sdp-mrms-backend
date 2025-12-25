const mongoose = require('mongoose');
const { Schema } = mongoose;
const AppointmentSchema = new Schema({
  patient: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctor: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },
  // Original datetime for compatibility
  slot: { type: Date, required: true },
  // Explicit local wall-clock fields to avoid timezone issues
  date: { type: String, required: true }, // YYYY-MM-DD
  hour: { type: Number, min: 0, max: 23, required: true }, // 0-23
  status: { type: String, enum: ['booked','cancelled','completed'], default: 'booked' },
  createdAt: { type: Date, default: Date.now }
});
// Ensure uniqueness per doctor per date/hour
AppointmentSchema.index({ doctor: 1, date: 1, hour: 1 }, { unique: true });
module.exports = mongoose.model('Appointment', AppointmentSchema);
