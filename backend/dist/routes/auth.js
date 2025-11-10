"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
router.post('/register', validation_1.validateUserRegistration, authController_1.register);
router.post('/login', validation_1.validateUserLogin, authController_1.login);
exports.default = router; // 确保使用 export default
