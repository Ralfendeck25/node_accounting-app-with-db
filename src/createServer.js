'use strict';

const express = require('express');
const { sequelize } = require('./db');
const { models } = require('./models');
const { Category } = models;

const createServer = () => {
  const app = express();
  app.use(express.json());

  // CRUD for Categories
  // Create
  app.post('/categories', async (req, res) => {
    try {
      const { name } = req.body;
      const category = await Category.create({ name });
      res.status(201).json(category);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // Read all
  app.get('/categories', async (req, res) => {
    try {
      const categories = await Category.findAll();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Read one
  app.get('/categories/:id', async (req, res) => {
    try {
      const category = await Category.findByPk(req.params.id);
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }
      res.json(category);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update
  app.put('/categories/:id', async (req, res) => {
    try {
      const [updated] = await Category.update(req.body, {
        where: { id: req.params.id },
      });
      if (updated) {
        const updatedCategory = await Category.findByPk(req.params.id);
        return res.json(updatedCategory);
      }
      res.status(404).json({ error: 'Category not found' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // Delete
  app.delete('/categories/:id', async (req, res) => {
    try {
      const deleted = await Category.destroy({
        where: { id: req.params.id },
      });
      if (deleted) {
        return res.status(204).send();
      }
      res.status(404).json({ error: 'Category not found' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Sync database
  app.use(async (req, res, next) => {
    try {
      await sequelize.sync();
      next();
    } catch (error) {
      console.error('Database sync error:', error);
      res.status(500).json({ error: 'Database error' });
    }
  });

  return app;
};

module.exports = {
  createServer,
};
