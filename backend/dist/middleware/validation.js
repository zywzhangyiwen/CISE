"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSearchParams = exports.validateUserLogin = exports.validateUserRegistration = exports.validateArticleModeration = exports.validateArticleSubmission = void 0;
const joi_1 = __importDefault(require("joi"));
const validateArticleSubmission = (req, res, next) => {
    const schema = joi_1.default.object({
        title: joi_1.default.string().required().min(1).max(500),
        authors: joi_1.default.array().items(joi_1.default.string().min(1)).min(1).required(),
        source: joi_1.default.string().required().min(1).max(200),
        pubyear: joi_1.default.string().required().min(4).max(4),
        doi: joi_1.default.string().required().min(1),
        claim: joi_1.default.string().required().min(1),
        evidence: joi_1.default.string().required().min(1),
        submitter: joi_1.default.string().email().required()
    });
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({
            message: 'Validation failed',
            errors: error.details
        });
    }
    next();
};
exports.validateArticleSubmission = validateArticleSubmission;
const validateArticleModeration = (req, res, next) => {
    const schema = joi_1.default.object({
        status: joi_1.default.string().valid('approved', 'rejected').required(),
        reason: joi_1.default.string().max(500).optional()
    });
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({
            message: 'Validation failed',
            errors: error.details
        });
    }
    next();
};
exports.validateArticleModeration = validateArticleModeration;
const validateUserRegistration = (req, res, next) => {
    const schema = joi_1.default.object({
        email: joi_1.default.string().email().required(),
        password: joi_1.default.string().min(6).required(),
        name: joi_1.default.string().min(1).max(100).required(),
        role: joi_1.default.string().valid('submitter', 'moderator', 'analyst', 'admin').optional()
    });
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({
            message: 'Validation failed',
            errors: error.details
        });
    }
    next();
};
exports.validateUserRegistration = validateUserRegistration;
const validateUserLogin = (req, res, next) => {
    const schema = joi_1.default.object({
        email: joi_1.default.string().email().required(),
        password: joi_1.default.string().required()
    });
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({
            message: 'Validation failed',
            errors: error.details
        });
    }
    next();
};
exports.validateUserLogin = validateUserLogin;
const validateSearchParams = (req, res, next) => {
    const schema = joi_1.default.object({
        sePractice: joi_1.default.string().optional(),
        claim: joi_1.default.string().optional(),
        minYear: joi_1.default.string().length(4).optional(),
        maxYear: joi_1.default.string().length(4).optional(),
        result: joi_1.default.string().valid('agree', 'disagree', 'mixed').optional(),
        researchType: joi_1.default.string().valid('case study', 'experiment', 'survey', 'other').optional(),
        participantType: joi_1.default.string().valid('student', 'practitioner', 'mixed').optional(),
        page: joi_1.default.number().integer().min(1).optional(),
        limit: joi_1.default.number().integer().min(1).max(100).optional(),
        sortBy: joi_1.default.string().valid('title', 'authors', 'pubyear', 'source').optional(),
        sortOrder: joi_1.default.string().valid('asc', 'desc').optional()
    });
    const { error } = schema.validate(req.query);
    if (error) {
        return res.status(400).json({
            message: 'Validation failed',
            errors: error.details
        });
    }
    next();
};
exports.validateSearchParams = validateSearchParams;
