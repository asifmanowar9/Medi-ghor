import express from 'express';
import {
  getHealthConditions,
  getHealthConditionById,
  createHealthCondition,
  updateHealthCondition,
  deleteHealthCondition,
} from '../controllers/healthConditionController.js';
import { protect, admin } from '../middleWare/authMiddleware.js';

const router = express.Router();

router
  .route('/')
  .get(getHealthConditions)
  .post(protect, admin, createHealthCondition);
router
  .route('/:id')
  .get(getHealthConditionById)
  .put(protect, admin, updateHealthCondition)
  .delete(protect, admin, deleteHealthCondition);

export default router;
