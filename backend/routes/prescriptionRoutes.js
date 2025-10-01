import express from 'express';
import {
  createPrescription,
  getUserPrescriptions,
  getPrescriptionById,
  updatePrescription,
  deletePrescription,
  getAllPrescriptions,
} from '../controllers/prescriptionController.js';
import { protect, admin } from '../middleWare/authMiddleware.js';
import {
  uploadPrescription,
  compressPrescriptionImage,
} from '../middleWare/prescriptionUploadMiddleware.js';

const router = express.Router();

// Public/User routes
router
  .route('/')
  .get(protect, getUserPrescriptions)
  .post(protect, createPrescription);

router
  .route('/:id')
  .get(protect, getPrescriptionById)
  .put(protect, updatePrescription)
  .delete(protect, deletePrescription);

// Admin routes
router.route('/admin/all').get(protect, admin, getAllPrescriptions);

// File upload route for prescriptions
router.post(
  '/upload',
  protect,
  uploadPrescription.single('prescription'),
  compressPrescriptionImage,
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    res.json({
      message: 'Prescription image uploaded successfully',
      image: `/uploads/prescriptions/${req.file.filename}`,
      originalName: req.file.originalname,
      size: req.file.size,
    });
  }
);

export default router;
