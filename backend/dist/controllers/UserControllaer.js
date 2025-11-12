"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUser = exports.getUsers = void 0;
const User_1 = __importDefault(require("../models/User"));
/**
 * @description Get all users
 * @route GET /api/admin/users
 * @access Private/Admin
 */
const getUsers = async (req, res) => {
    try {
        const users = await User_1.default.find({}).select('-password');
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
exports.getUsers = getUsers;
/**
 * @description Update user details (e.g., role)
 * @route PUT /api/admin/users/:userId
 * @access Private/Admin
 */
const updateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { name, role } = req.body;
        const user = await User_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.name = name || user.name;
        user.role = role || user.role;
        const updatedUser = await user.save();
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
exports.updateUser = updateUser;
