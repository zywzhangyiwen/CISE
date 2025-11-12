import { Request, Response } from 'express';
import User from '../models/User';

/**
 * @description Get all users
 * @route GET /api/admin/users
 * @access Private/Admin
 */
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

/**
 * @description Update user details (e.g., role)
 * @route PUT /api/admin/users/:userId
 * @access Private/Admin
 */
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { name, role } = req.body;

    const user = await User.findById(userId);

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
  } catch (error: any) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};