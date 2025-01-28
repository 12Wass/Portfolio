import React, { useState, useEffect } from 'react';
import { Route, Link, Routes } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { motion } from 'framer-motion';
import { Trash2, Edit, Plus, Check } from 'react-feather';

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'];

// Utility functions (unchanged)
const loadFromLocalStorage = (key, defaultValue) => {
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) : defaultValue;
};

const saveToLocalStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Animated Card Component
const AnimatedCard = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="bg-white rounded-lg shadow-lg p-3 sm:p-6 mb-4 sm:mb-6"
  >
    {children}
  </motion.div>
);

// Custom Button Component
const Button = ({ onClick, className, children }) => (
  <button 
    onClick={onClick} 
    className={`px-4 py-2 rounded-full font-semibold text-white shadow-md hover:shadow-lg transition duration-300 flex items-center justify-center ${className}`}
  >
    {children}
  </button>
);

const NotificationBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('hasDismissedBanner');
    if (!dismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('hasDismissedBanner', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      className="
        fixed top-0 left-0 w-full bg-blue-600 text-white text-center
        py-3 px-4 shadow-lg z-50 
        transition-transform duration-500
        animate-slide-down
      "
    >
      <p>Je ne garde aucune données, tout est stocké localement dans votre navigateur. Bonnes économies !</p>
      <button
        onClick={handleDismiss}
        className="bg-white text-blue-600 font-semibold px-4 py-2 rounded mt-2 hover:bg-gray-100 transition"
      >
        Got it
      </button>
    </div>
  );

};


// Dashboard Component
const Dashboard = ({ expenses, salary, categories }) => {
  const activeExpenses = expenses.filter(expense => 
    !categories.find(cat => cat.name === expense.category && cat.muted)
  );

  const totalExpenses = activeExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const remaining = salary - totalExpenses;

  const categoryData = activeExpenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});

  const pieChartData = Object.entries(categoryData).map(([name, value]) => ({ name, value }));

  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-semibold mb-4 sm:mb-6 text-indigo-800">Dashboard</h2>
      <AnimatedCard>
        <h3 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-indigo-700">Summary</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-center">
          <div className="bg-blue-100 p-3 sm:p-4 rounded-lg">
            <p className="text-sm text-blue-800">Monthly Salary</p>
            <p className="text-xl sm:text-2xl font-bold text-blue-600">${salary.toFixed(2)}</p>
          </div>
          <div className="bg-red-100 p-3 sm:p-4 rounded-lg">
            <p className="text-sm text-red-800">Total Expenses (Active)</p>
            <p className="text-xl sm:text-2xl font-bold text-red-600">${totalExpenses.toFixed(2)}</p>
          </div>
          <div className="bg-green-100 p-3 sm:p-4 rounded-lg">
            <p className="text-sm text-green-800">Remaining</p>
            <p className="text-xl sm:text-2xl font-bold text-green-600">${remaining.toFixed(2)}</p>
          </div>
        </div>
      </AnimatedCard>
      <AnimatedCard>
        <h3 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-indigo-700">Expense Distribution</h3>
        <div className="h-64 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieChartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius="80%"
                fill="#8884d8"
                label
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </AnimatedCard>
      <AnimatedCard>
        <h3 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-indigo-700">Monthly Expense Breakdown</h3>
        <div className="h-64 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={pieChartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </AnimatedCard>
    </div>
  );
};

// Expense Management Component
const ExpenseManagement = ({ expenses, setExpenses, categories, salary, setSalary }) => {
  const [newExpense, setNewExpense] = useState({ name: '', amount: '', category: '', date: '', isRecurring: false });

  const handleExpenseChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewExpense(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const addExpense = () => {
    if (newExpense.name && newExpense.amount && newExpense.category && newExpense.date) {
      setExpenses(prev => [...prev, { ...newExpense, amount: parseFloat(newExpense.amount), id: Date.now() }]);
      setNewExpense({ name: '', amount: '', category: '', date: '', isRecurring: false });
    }
  };

  const deleteExpense = (id) => {
    setExpenses(prev => prev.filter(expense => expense.id !== id));
  };

  return (
    <div>
      <h2 className="text-3xl font-semibold mb-6 text-indigo-800">Expense Management</h2>
      <AnimatedCard>
        <div className="mb-6">
          <label className="block mb-2 text-indigo-700">Monthly Salary:</label>
          <input
            type="number"
            value={salary}
            onChange={(e) => setSalary(parseFloat(e.target.value))}
            className="w-full p-2 border border-indigo-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <h3 className="text-2xl font-semibold mb-4 text-indigo-700">Add New Expense</h3>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Expense Name"
            name="name"
            value={newExpense.name}
            onChange={handleExpenseChange}
            className="p-2 border border-indigo-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="number"
            placeholder="Amount"
            name="amount"
            value={newExpense.amount}
            onChange={handleExpenseChange}
            className="p-2 border border-indigo-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <select
            name="category"
            value={newExpense.category}
            onChange={handleExpenseChange}
            className="p-2 border border-indigo-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select Category</option>
            {categories.map((category, index) => (
              <option key={index} value={category.name}>{category.name}</option>
            ))}
          </select>
          <input
            type="date"
            name="date"
            value={newExpense.date}
            onChange={handleExpenseChange}
            className="p-2 border border-indigo-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="col-span-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="isRecurring"
                checked={newExpense.isRecurring}
                onChange={handleExpenseChange}
                className="mr-2"
              />
              Recurring Expense
            </label>
          </div>
        </div>
        <Button 
          onClick={addExpense} 
          className="mt-4 bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus size={18} className="mr-2" /> Add Expense
        </Button>
      </AnimatedCard>
      <AnimatedCard>
        <h3 className="text-2xl font-semibold mb-4 text-indigo-700">Expense List</h3>
        <ul className="divide-y divide-gray-200">
          {expenses.map((expense) => (
            <li key={expense.id} className="py-4 flex justify-between items-center">
              <div>
                <p className="font-semibold">{expense.name}</p>
                <p className="text-sm text-gray-500">{expense.category} - {expense.date}</p>
              </div>
              <div className="flex items-center">
                <p className="font-bold text-indigo-600 mr-4">${expense.amount}</p>
                {expense.isRecurring && <p className="text-xs text-indigo-500 mr-4">Recurring</p>}
                <Button 
                  onClick={() => deleteExpense(expense.id)} 
                  className="bg-red-500 hover:bg-red-600"
                >
                  <Trash2 size={18} />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </AnimatedCard>
    </div>
  );
};

// Category Management Component
const CategoryManagement = ({ categories, setCategories, expenses, setExpenses }) => {
  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);

  const addCategory = () => {
    if (newCategory && !categories.find(cat => cat.name === newCategory)) {
      setCategories(prev => [...prev, { name: newCategory, muted: false }]);
      setNewCategory('');
    }
  };

  const startEditCategory = (category) => {
    setEditingCategory(category.name);
    setNewCategory(category.name);
  };

  const updateCategory = () => {
    if (newCategory && !categories.find(cat => cat.name === newCategory && cat.name !== editingCategory)) {
      setCategories(prev => prev.map(c => c.name === editingCategory ? { ...c, name: newCategory } : c));
      setExpenses(prev => prev.map(e => e.category === editingCategory ? {...e, category: newCategory} : e));
      setEditingCategory(null);
      setNewCategory('');
    }
  };

  const deleteCategory = (categoryToDelete) => {
    setCategories(prev => prev.filter(c => c.name !== categoryToDelete));
    setExpenses(prev => prev.filter(e => e.category !== categoryToDelete));
  };

  const toggleMute = (categoryName) => {
    setCategories(prev => prev.map(c => 
      c.name === categoryName ? { ...c, muted: !c.muted } : c
    ));
  };

  return (
    <div>
      <h2 className="text-3xl font-semibold mb-6 text-indigo-800">Category Management</h2>
      <AnimatedCard>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="New Category"
            className="p-2 border border-indigo-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-grow"
          />
          {editingCategory ? (
            <Button 
              onClick={updateCategory} 
              className="bg-green-500 hover:bg-green-600"
            >
              <Check size={18} className="mr-2" /> Update
            </Button>
          ) : (
            <Button 
              onClick={addCategory} 
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus size={18} className="mr-2" /> Add Category
            </Button>
          )}
        </div>
        <ul className="divide-y divide-gray-200">
          {categories.map((category, index) => (
            <li key={index} className="py-4 flex items-center justify-between">
              <span className={category.muted ? "text-gray-400" : ""}>{category.name}</span>
              <div className="flex items-center">
                <Button 
                  onClick={() => toggleMute(category.name)} 
                  className={`mr-2 ${category.muted ? 'bg-gray-400 hover:bg-gray-500' : 'bg-blue-500 hover:bg-blue-600'}`}
                >
                  {category.muted ? 'Unmute' : 'Mute'}
                </Button>
                <Button 
                  onClick={() => startEditCategory(category)} 
                  className="bg-yellow-500 hover:bg-yellow-600 mr-2"
                >
                  <Edit size={18} />
                </Button>
                <Button 
                  onClick={() => deleteCategory(category.name)} 
                  className="bg-red-500 hover:bg-red-600"
                >
                  <Trash2 size={18} />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </AnimatedCard>
    </div>
  );
};

// Main App Component
const ExpenseTracker = () => {
  const [expenses, setExpenses] = useState(() => loadFromLocalStorage('expenses', []));
  const [salary, setSalary] = useState(() => loadFromLocalStorage('salary', 0));
  const [categories, setCategories] = useState(() => loadFromLocalStorage('categories', [
    { name: 'Housing', muted: false },
    { name: 'Transportation', muted: false },
    { name: 'Food', muted: false },
    { name: 'Utilities', muted: false },
    { name: 'Entertainment', muted: false },
    { name: 'Other', muted: false }
  ]));

  useEffect(() => {
    saveToLocalStorage('expenses', expenses);
    saveToLocalStorage('salary', salary);
    saveToLocalStorage('categories', categories);
  }, [expenses, salary, categories]);

  return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-200">
        <NotificationBanner />
        {/* Animated wave background */}
        
        <div className="wave-container absolute inset-0 z-0">
          <svg className="waves" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"
            viewBox="0 24 150 28" preserveAspectRatio="none" shapeRendering="auto">
            <defs>
              <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
            </defs>
            <g className="parallax">
              <use xlinkHref="#gentle-wave" x="48" y="0" fill="rgba(129, 140, 248, 0.7)" />
              <use xlinkHref="#gentle-wave" x="48" y="3" fill="rgba(167, 139, 250, 0.5)" />
              <use xlinkHref="#gentle-wave" x="48" y="5" fill="rgba(199, 210, 254, 0.3)" />
              <use xlinkHref="#gentle-wave" x="48" y="7" fill="rgba(224, 231, 255, 0.1)" />
            </g>
          </svg>
        </div>
        <div className="relative z-10 p-4 sm:p-6 max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-8 text-center text-indigo-900">Expense Tracker</h1>
          <nav className="mb-4 sm:mb-8">
            <ul className="flex flex-wrap justify-center space-x-2 sm:space-x-6">
              <li className="mb-2 sm:mb-0">
                <Link to="/expense-tracker" className="text-indigo-700 hover:text-indigo-900 font-semibold transition duration-300">Dashboard</Link>
              </li>
              <li className="mb-2 sm:mb-0">
                <Link to="expenses" className="text-indigo-700 hover:text-indigo-900 font-semibold transition duration-300">Manage Expenses</Link>
              </li>
              <li className="mb-2 sm:mb-0">
                <Link to="categories" className="text-indigo-700 hover:text-indigo-900 font-semibold transition duration-300">Manage Categories</Link>
              </li>
            </ul>
          </nav>
          <Routes>
          <Route index element={<Dashboard expenses={expenses} salary={salary} categories={categories} />} />
          <Route
            path="expenses"
            element={
              <ExpenseManagement
                expenses={expenses}
                setExpenses={setExpenses}
                categories={categories}
                salary={salary}
                setSalary={setSalary}
              />
            }
          />
          <Route
            path="categories"
            element={
              <CategoryManagement
                categories={categories}
                setCategories={setCategories}
                expenses={expenses}
                setExpenses={setExpenses}
              />
            }
          />
        </Routes>
      </div>
    </div>
  );
};

export default ExpenseTracker;