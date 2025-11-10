"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateArticle = exports.getArticleDetails = exports.getSearchFilters = exports.searchArticles = void 0;
const Article_1 = __importDefault(require("../models/Article"));
const searchArticles = async (req, res) => {
    try {
        const { sePractice, claim, minYear, maxYear, result, researchType, participantType, page = 1, limit = 10, sortBy = 'pubyear', sortOrder = 'desc' } = req.query;
        // 构建查询条件
        const query = {
            moderationStatus: 'approved',
            analysisStatus: 'analyzed'
        };
        // 添加筛选条件
        if (sePractice)
            query.sePractice = { $regex: sePractice, $options: 'i' };
        if (result)
            query.result = result;
        if (researchType)
            query.researchType = researchType;
        if (participantType)
            query.participantType = participantType;
        // 年份范围筛选
        if (minYear || maxYear) {
            query.pubyear = {};
            if (minYear)
                query.pubyear.$gte = minYear;
            if (maxYear)
                query.pubyear.$lte = maxYear;
        }
        // 文本搜索（在标题、声明、证据中搜索）
        if (claim) {
            query.$or = [
                { claim: { $regex: claim, $options: 'i' } },
                { title: { $regex: claim, $options: 'i' } },
                { evidence: { $regex: claim, $options: 'i' } }
            ];
        }
        // 排序配置
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
        const articles = await Article_1.default.find(query)
            // include ratings so averageRating virtual can compute correctly
            .select('-moderationReason -moderator -analyst')
            .sort(sortOptions)
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
            },
            filters: {
                sePractice,
                claim,
                minYear,
                maxYear,
                result,
                researchType,
                participantType
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
const getSearchFilters = async (req, res) => {
    try {
        // 获取所有可用的 SE Practices
        const sePractices = await Article_1.default.distinct('sePractice', {
            moderationStatus: 'approved',
            analysisStatus: 'analyzed',
            sePractice: { $ne: null }
        });
        // 获取所有可用的研究类型
        const researchTypes = await Article_1.default.distinct('researchType', {
            moderationStatus: 'approved',
            analysisStatus: 'analyzed',
            researchType: { $ne: null }
        });
        // 获取所有可用的参与者类型
        const participantTypes = await Article_1.default.distinct('participantType', {
            moderationStatus: 'approved',
            analysisStatus: 'analyzed',
            participantType: { $ne: null }
        });
        // 获取年份范围
        const yearStats = await Article_1.default.aggregate([
            {
                $match: {
                    moderationStatus: 'approved',
                    analysisStatus: 'analyzed',
                    pubyear: { $ne: null }
                }
            },
            {
                $group: {
                    _id: null,
                    minYear: { $min: '$pubyear' },
                    maxYear: { $max: '$pubyear' }
                }
            }
        ]);
        res.json({
            sePractices: sePractices.filter(p => p), // 过滤掉空值
            researchTypes: researchTypes.filter(t => t),
            participantTypes: participantTypes.filter(t => t),
            yearRange: yearStats.length > 0 ? yearStats[0] : { minYear: 2000, maxYear: new Date().getFullYear() }
        });
    }
    catch (error) {
        res.status(500).json({
            message: 'Error fetching search filters',
            error: error.message
        });
    }
};
exports.getSearchFilters = getSearchFilters;
const getArticleDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const article = await Article_1.default.findById(id)
            .select('-moderationReason');
        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }
        res.json(article);
    }
    catch (error) {
        res.status(500).json({
            message: 'Error fetching article details',
            error: error.message
        });
    }
};
exports.getArticleDetails = getArticleDetails;
const rateArticle = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId, rating } = req.body;
        if (!userId || !rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Invalid rating data' });
        }
        const article = await Article_1.default.findById(id);
        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }
        // 检查用户是否已经评过分
        const existingRatingIndex = article.ratings.findIndex(r => r.userId === userId);
        if (existingRatingIndex > -1) {
            // 更新现有评分
            article.ratings[existingRatingIndex].rating = rating;
            article.ratings[existingRatingIndex].date = new Date();
        }
        else {
            // 添加新评分
            article.ratings.push({
                userId,
                rating,
                date: new Date()
            });
        }
        await article.save();
        res.json({
            message: 'Rating submitted successfully',
            averageRating: article.averageRating,
            totalRatings: Array.isArray(article.ratings) ? article.ratings.length : 0
        });
    }
    catch (error) {
        res.status(500).json({
            message: 'Error submitting rating',
            error: error.message
        });
    }
};
exports.rateArticle = rateArticle;
