import asyncHandler from 'express-async-handler';
import Prescription from '../models/prescriptionModel.js';
import User from '../models/userModel.js';

// @description  Create a new prescription
// @route        POST /api/prescriptions
// @access       Private
const createPrescription = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    image,
    doctorName,
    hospitalName,
    prescriptionDate,
    validUntil,
    medications,
    notes,
  } = req.body;

  if (!title || !image) {
    res.status(400);
    throw new Error('Title and image are required');
  }

  const prescription = new Prescription({
    user: req.user._id,
    title,
    description,
    image,
    doctorName,
    hospitalName,
    prescriptionDate: prescriptionDate ? new Date(prescriptionDate) : null,
    validUntil: validUntil ? new Date(validUntil) : null,
    medications: medications || [],
    notes,
  });

  const createdPrescription = await prescription.save();

  // Add prescription to user's prescriptions array
  await User.findByIdAndUpdate(
    req.user._id,
    { $push: { prescriptions: createdPrescription._id } },
    { new: true }
  );

  res.status(201).json(createdPrescription);
});

// @description  Get user's prescriptions
// @route        GET /api/prescriptions
// @access       Private
const getUserPrescriptions = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const prescriptions = await Prescription.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('user', 'name email');

  const total = await Prescription.countDocuments({ user: req.user._id });

  res.json({
    prescriptions,
    page,
    pages: Math.ceil(total / limit),
    total,
  });
});

// @description  Get prescription by ID
// @route        GET /api/prescriptions/:id
// @access       Private
const getPrescriptionById = asyncHandler(async (req, res) => {
  const prescription = await Prescription.findById(req.params.id).populate(
    'user',
    'name email'
  );

  if (prescription) {
    // Check if the prescription belongs to the logged-in user or if user is admin
    if (
      prescription.user._id.toString() === req.user._id.toString() ||
      req.user.isAdmin
    ) {
      res.json(prescription);
    } else {
      res.status(403);
      throw new Error('Access denied');
    }
  } else {
    res.status(404);
    throw new Error('Prescription not found');
  }
});

// @description  Update prescription
// @route        PUT /api/prescriptions/:id
// @access       Private
const updatePrescription = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    image,
    doctorName,
    hospitalName,
    prescriptionDate,
    validUntil,
    medications,
    notes,
    isActive,
  } = req.body;

  const prescription = await Prescription.findById(req.params.id);

  if (prescription) {
    // Check if the prescription belongs to the logged-in user
    if (prescription.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Access denied');
    }

    prescription.title = title || prescription.title;
    prescription.description = description || prescription.description;
    prescription.image = image || prescription.image;
    prescription.doctorName = doctorName || prescription.doctorName;
    prescription.hospitalName = hospitalName || prescription.hospitalName;
    prescription.prescriptionDate = prescriptionDate
      ? new Date(prescriptionDate)
      : prescription.prescriptionDate;
    prescription.validUntil = validUntil
      ? new Date(validUntil)
      : prescription.validUntil;
    prescription.medications = medications || prescription.medications;
    prescription.notes = notes || prescription.notes;
    prescription.isActive =
      isActive !== undefined ? isActive : prescription.isActive;

    const updatedPrescription = await prescription.save();
    res.json(updatedPrescription);
  } else {
    res.status(404);
    throw new Error('Prescription not found');
  }
});

// @description  Delete prescription
// @route        DELETE /api/prescriptions/:id
// @access       Private
const deletePrescription = asyncHandler(async (req, res) => {
  const prescription = await Prescription.findById(req.params.id);

  if (prescription) {
    // Check if the prescription belongs to the logged-in user
    if (prescription.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Access denied');
    }

    await Prescription.findByIdAndDelete(req.params.id);

    // Remove prescription from user's prescriptions array
    await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { prescriptions: req.params.id } },
      { new: true }
    );

    res.json({ message: 'Prescription removed successfully' });
  } else {
    res.status(404);
    throw new Error('Prescription not found');
  }
});

// @description  Get all prescriptions (Admin only)
// @route        GET /api/prescriptions/admin/all
// @access       Private/Admin
const getAllPrescriptions = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const prescriptions = await Prescription.find({})
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('user', 'name email');

  const total = await Prescription.countDocuments({});

  res.json({
    prescriptions,
    page,
    pages: Math.ceil(total / limit),
    total,
  });
});

export {
  createPrescription,
  getUserPrescriptions,
  getPrescriptionById,
  updatePrescription,
  deletePrescription,
  getAllPrescriptions,
};
