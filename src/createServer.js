'use strict';

const express = require('express');
const { sequelize } = require('./db');
const { models } = require('./models');
const { Expense, User } = models;

const createServer = () => {
  const app = express();
  app.use(express.json());

  // Create expense
  app.post('/expenses', async (req, res) => {
    try {
      const { spentAt, title, amount, category, note, userId } = req.body;
      
      if (!spentAt || !title || !amount || !category || !userId) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(400).json({ error: 'User not found' });
      }

      const expense = await Expense.create({
        spentAt,
        title,
        amount,
        category,
        note,
        userId,
      });

      res.status(201).json(expense);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get all expenses with filters
  app.get('/expenses', async (req, res) => {
    try {
      const { userId, categories, from, to } = req.query;
      const where = {};

      if (userId) where.userId = userId;
      if (categories) where.category = categories;
      if (from && to) {
        where.spentAt = {
          [Op.between]: [new Date(from), new Date(to)],
        };
      } else if (from) {
        where.spentAt = {
          [Op.gte]: new Date(from),
        };
      } else if (to) {
        where.spentAt = {
          [Op.lte]: new Date(to),
        };
      }

      const expenses = await Expense.findAll({ where });
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get single expense
  app.get('/expenses/:id', async (req, res) => {
    try {
      const expense = await Expense.findByPk(req.params.id);
      if (!expense) {
        return res.status(404).json({ error: 'Expense not found' });
      }
      res.json(expense);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update expense
  app.patch('/expenses/:id', async (req, res) => {
    try {
      const expense = await Expense.findByPk(req.params.id);
      if (!expense) {
        return res.status(404).json({ error: 'Expense not found' });
      }

      await expense.update(req.body);
      res.json(expense);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // Delete expense
  app.delete('/expenses/:id', async (req, res) => {
    try {
      const expense = await Expense.findByPk(req.params.id);
      if (!expense) {
        return res.status(404).json({ error: 'Expense not found' });
      }

      await expense.destroy();
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return app;
};

module.exports = {
  createServer,
};
