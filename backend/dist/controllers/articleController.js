"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeArticle = exports.getPendingAnalysis = exports.getMySubmissions = exports.searchArticles = exports.moderateArticle = exports.getPendingArticles = exports.submitArticle = void 0;
const Article_1 = __importDefault(require("../models/Article"));
// 提交新文章
const submitArticle = async (req, res) => {
    try {
        const articleData = {
            ...req.body,
            submissionDate: new Date(),
            moderationStatus: 'pending',
            analysisStatus: 'pending'
        };
        const article = new Article_1.default(articleData);
        await article.save();
        res.status(201).json({
            message: 'Article submitted successfully',
            article: {
                id: article._id,
                title: article.title,
                status: article.moderationStatus
            }
        });
    }
    catch (error) {
        res.status(500).json({
            message: 'Error submitting article',
            error: error.message
        });
    }
};
exports.submitArticle = submitArticle;
// 获取待审核文章
const getPendingArticles = async (req, res) => {
    try {
        const articles = await Article_1.default.find({ moderationStatus: 'pending' })
            .select('-ratings -analysisDate -analyst -moderationReason')
            .sort({ submissionDate: 1 });
        res.json(articles);
    }
    catch (error) {
        // Log the full error server-side for easier debugging
        console.error('Error in getPendingArticles:', error);
        res.status(500).json({
            message: 'Error fetching pending articles',
            error: error.message
        });
    }
};
exports.getPendingArticles = getPendingArticles;
// 审核文章
const moderateArticle = async (req, res) => {
    var _a;
    try {
        const { id } = req.params;
        const { status, reason } = req.body;
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }
        const article = await Article_1.default.findByIdAndUpdate(id, {
            moderationStatus: status,
            moderationDate: new Date(),
            moderator: (_a = req.user) === null || _a === void 0 ? void 0 : _a.email,
            ...(reason && { moderationReason: reason })
        }, { new: true });
        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }
        res.json({
            message: `Article ${status} successfully`,
            article
        });
    }
    catch (error) {
        res.status(500).json({
            message: 'Error moderating article',
            error: error.message
        });
    }
};
exports.moderateArticle = moderateArticle;
// 搜索文章
const searchArticles = async (req, res) => {
    try {
        const { sePractice, claim, minYear, maxYear, result, page = 1, limit = 10 } = req.query;
        const query = { moderationStatus: 'approved', analysisStatus: 'analyzed' };
        if (sePractice)
            query.sePractice = sePractice;
        if (result)
            query.result = result;
        if (minYear || maxYear) {
            query.pubyear = {};
            if (minYear)
                query.pubyear.$gte = minYear;
            if (maxYear)
                query.pubyear.$lte = maxYear;
        }
        // 文本搜索
        if (claim) {
            query.$or = [
                { claim: { $regex: claim, $options: 'i' } },
                { title: { $regex: claim, $options: 'i' } }
            ];
        }
        const articles = await Article_1.default.find(query)
            .select('-ratings -moderationReason')
            .sort({ pubyear: -1 })
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit));
        const total = await Article_1.default.countDocuments(query);
        res.json({
            articles,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    }
    catch (error) {
        res.status(500).json({
            message: 'Error searching articles',
            error: error.message
        });
    }
};
exports.searchArticles = searchArticles;
// 获取当前登录用户的提交（用于提交者查看自己提交的待审核与已审核记录）
const getMySubmissions = async (req, res) => {
    var _a;
    try {
        const userEmail = (_a = req.user) === null || _a === void 0 ? void 0 : _a.email;
        if (!userEmail)
            return res.status(401).json({ message: 'Unauthorized' });
        const articles = await Article_1.default.find({ submitter: userEmail })
            .select('-ratings -analysisDate -analyst -moderationReason')
            .sort({ submissionDate: -1 });
        res.json(articles);
    }
    catch (error) {
        console.error('Error in getMySubmissions:', error);
        res.status(500).json({ message: 'Error fetching user submissions', error: error.message });
    }
};
exports.getMySubmissions = getMySubmissions;
// 获取待分析文章（审核通过但未分析）
const getPendingAnalysis = async (req, res) => {
    try {
        const articles = await Article_1.default.find({ moderationStatus: 'approved', analysisStatus: 'pending' })
            .select('-ratings -moderationReason')
            .sort({ moderationDate: 1 });
        res.json(articles);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching pending analysis articles', error: error.message });
    }
};
exports.getPendingAnalysis = getPendingAnalysis;
// 录入分析结果
const analyzeArticle = async (req, res) => {
    var _a;
    try {
        const { id } = req.params;
        const { sePractice, claim, result, researchType, participantType } = req.body || {};
        if (!sePractice || !claim || !result) {
            return res.status(400).json({ message: 'Missing required fields: sePractice, claim, result' });
        }
        if (!['agree', 'disagree', 'mixed'].includes(result)) {
            return res.status(400).json({ message: 'Invalid result value' });
        }
        // 归一化可选值，避免前端同义词/复数造成验证失败
        const normalizeParticipant = (p) => {
            if (!p)
                return undefined;
            const v = String(p).toLowerCase();
            if (v === 'students')
                return 'student';
            if (v === 'practitioners')
                return 'practitioner';
            return v;
        };
        const update = {
            sePractice,
            claim,
            result,
            ...(researchType ? { researchType } : {}),
            ...(participantType ? { participantType: normalizeParticipant(participantType) } : {}),
            analysisStatus: 'analyzed',
            analysisDate: new Date(),
            analyst: (_a = req.user) === null || _a === void 0 ? void 0 : _a.email,
        };
        const article = await Article_1.default.findByIdAndUpdate(id, update, { new: true });
        if (!article)
            return res.status(404).json({ message: 'Article not found' });
        res.json({ message: 'Analysis saved', article });
    }
    catch (error) {
        res.status(500).json({ message: 'Error saving analysis', error: error.message });
    }
};
exports.analyzeArticle = analyzeArticle;
