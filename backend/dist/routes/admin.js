"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const adminController_1 = require("../controllers/adminController");
const userController_1 = require("../controllers/userController");
const router = express_1.default.Router();
// First, authenticate all requests to this router
router.use(auth_1.authenticate);
// Then, ensure only admins can access them
router.use((0, auth_1.authorize)('admin'));
// User Management Routes
router.get('/users', userController_1.getUsers);
router.put('/users/:userId', userController_1.updateUser);
// System Configuration Routes
router.get('/config', adminController_1.getConfig);
router.put('/config', adminController_1.upsertConfig);
// Article Management Routes
router.patch('/articles/:idOrDoi', adminController_1.patchArticle);
router.delete('/articles/:id/ratings', adminController_1.removeRating);
exports.default = router;
