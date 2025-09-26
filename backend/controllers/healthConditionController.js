import asyncHandler from 'express-async-handler';
import HealthCondition from '../models/healthConditionModel.js';

// @description  Get all active health conditions
// @route        GET /api/health-conditions
// @access       Public
const getHealthConditions = asyncHandler(async (req, res) => {
  const healthConditions = await HealthCondition.find({ isActive: true }).sort({
    name: 1,
  });
  res.json(healthConditions);
});

// @description  Get single health condition by ID
// @route        GET /api/health-conditions/:id
// @access       Public
const getHealthConditionById = asyncHandler(async (req, res) => {
  const healthCondition = await HealthCondition.findById(req.params.id);

  if (healthCondition) {
    res.json(healthCondition);
  } else {
    res.status(404);
    throw new Error('Health condition not found');
  }
});

// @description  Create a health condition
// @route        POST /api/health-conditions
// @access       Private/Admin
const createHealthCondition = asyncHandler(async (req, res) => {
  const { name, icon, color, description } = req.body;

  const healthConditionExists = await HealthCondition.findOne({ name });

  if (healthConditionExists) {
    res.status(400);
    throw new Error('Health condition already exists');
  }

  const healthCondition = new HealthCondition({
    name,
    icon,
    color,
    description,
  });

  const createdHealthCondition = await healthCondition.save();
  res.status(201).json(createdHealthCondition);
});

// @description  Update a health condition
// @route        PUT /api/health-conditions/:id
// @access       Private/Admin
const updateHealthCondition = asyncHandler(async (req, res) => {
  const { name, icon, color, description, isActive } = req.body;

  const healthCondition = await HealthCondition.findById(req.params.id);

  if (healthCondition) {
    healthCondition.name = name || healthCondition.name;
    healthCondition.icon = icon || healthCondition.icon;
    healthCondition.color = color || healthCondition.color;
    healthCondition.description = description || healthCondition.description;
    healthCondition.isActive =
      isActive !== undefined ? isActive : healthCondition.isActive;

    const updatedHealthCondition = await healthCondition.save();
    res.json(updatedHealthCondition);
  } else {
    res.status(404);
    throw new Error('Health condition not found');
  }
});

// @description  Delete a health condition
// @route        DELETE /api/health-conditions/:id
// @access       Private/Admin
const deleteHealthCondition = asyncHandler(async (req, res) => {
  const healthCondition = await HealthCondition.findById(req.params.id);

  if (healthCondition) {
    await healthCondition.deleteOne();
    res.json({ message: 'Health condition removed' });
  } else {
    res.status(404);
    throw new Error('Health condition not found');
  }
});

export {
  getHealthConditions,
  getHealthConditionById,
  createHealthCondition,
  updateHealthCondition,
  deleteHealthCondition,
};
