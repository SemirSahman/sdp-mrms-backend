const Appointment = require("../models/Appointment");

module.exports = {
  async book(req, res) {
    try {
      const { doctorId, slot } = req.body;
      const Patient = require("../models/Patient");
      const patient = await Patient.findOne({ user: req.user.userId });
      if (!patient) return res.status(404).json({ error: "patient not found" });
      
      // Parse the time string and extract hour directly from string to avoid timezone issues
      const m = String(slot).match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/);
      if (!m) return res.status(400).json({ error: 'Invalid date format' });
      
      const year = Number(m[1]);
      const month = Number(m[2]) - 1;
      const day = Number(m[3]);
      const hour = Number(m[4]); // Extract hour directly from string
      const dateStr = `${m[1]}-${m[2]}-${m[3]}`;
      
      // Create slot date with clean hour boundary (00 minutes, 00 seconds)
      const slotDate = new Date(year, month, day, hour, 0, 0);
      
      const ap = new Appointment({
        patient: patient._id,
        doctor: doctorId,
        slot: slotDate,
        date: dateStr,
        hour: hour, // Use parsed hour directly, not from Date object
      });
      await ap.save();
      return res.status(201).json(ap);
      
    } catch (e) {
      if (e.code === 11000)
        return res.status(409).json({ error: "slot already booked" });
      res.status(500).json({ error: e.message });
    }
  },

  async listMy(req, res) {
    try {
      const role = req.user.role;
      let query = {};
      if (role === "patient") {
        const Patient = require("../models/Patient");
        const patient = await Patient.findOne({ user: req.user.userId });
        if (patient) query.patient = patient._id;
      } else if (role === "doctor") {
        const Doctor = require("../models/Doctor");
        const doctor = await Doctor.findOne({ user: req.user.userId });
        if (doctor) query.doctor = doctor._id;
      }
      // admin sees all
      const list = await Appointment.find(query)
        .populate({
          path: "doctor",
          populate: { path: "user", select: "name" },
        })
        .populate({
          path: "patient",
          populate: { path: "user", select: "name" },
        });
      res.json(list);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },

  async cancel(req, res) {
    try {
      const ap = await Appointment.findById(req.params.id);
      if (!ap) return res.status(404).json({ error: "not found" });
      
      // For patients, verify they own this appointment by checking their Patient record
      if (req.user.role === "patient") {
        const Patient = require("../models/Patient");
        const patient = await Patient.findOne({ user: req.user.userId });
        if (!patient || String(ap.patient) !== String(patient._id)) {
          return res.status(403).json({ error: "forbidden" });
        }
      } else if (req.user.role !== "admin") {
        return res.status(403).json({ error: "forbidden" });
      }
      
      ap.status = "cancelled";
      await ap.save();
      res.json(ap);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },

  async available(req, res) {
    try {
      const { doctorId, date } = req.query;
      // Query using explicit date/hour to avoid timezone effects
      const booked = await Appointment.find({
        doctor: doctorId,
        date,
        status: { $ne: "cancelled" },
      }).select("hour");
      const bookedTimes = booked.map((b) => b.hour);
      const allTimes = [];
      for (let h = 9; h < 17; h++) allTimes.push(h);
      const available = allTimes.filter((h) => !bookedTimes.includes(h));
      res.json(available);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  },
};
