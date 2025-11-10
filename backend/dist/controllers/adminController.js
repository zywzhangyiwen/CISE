"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeRating = exports.patchArticle = exports.upsertConfig = exports.getConfig = void 0;
const Config_1 = __importDefault(require("../models/Config"));
const Article_1 = __importDefault(require("../models/Article"));
const getConfig = async (_req, res) => {
    try {
        const cfg = await Config_1.default.findOne();
        res.json(cfg || { practices: {}, defaultColumns: [], notifications: {} });
    }
    catch (e) {
        res.status(500).json({ message: 'Error fetching config', error: e.message });
    }
};
exports.getConfig = getConfig;
const upsertConfig = async (req, res) => {
    try {
        const { practices, defaultColumns, notifications } = req.body || {};
        const cfg = await Config_1.default.findOne();
        if (cfg) {
            if (practices)
                cfg.practices = practices;
            if (defaultColumns)
                cfg.defaultColumns = defaultColumns;
            if (notifications)
                cfg.notifications = { ...cfg.notifications, ...notifications };
            await cfg.save();
            return res.json(cfg);
        }
        const created = await Config_1.default.create({ practices, defaultColumns, notifications });
        res.status(201).json(created);
    }
    catch (e) {
        res.status(500).json({ message: 'Error updating config', error: e.message });
    }
};
exports.upsertConfig = upsertConfig;
const patchArticle = async (req, res) => {
    try {
        const { idOrDoi } = req.params;
        const update = req.body || {};
        const query = idOrDoi.startsWith('10.') ? { doi: idOrDoi } : { _id: idOrDoi };
        const doc = await Article_1.default.findOneAndUpdate(query, update, { new: true });
        if (!doc)
            return res.status(404).json({ message: 'Article not found' });
        res.json(doc);
    }
    catch (e) {
        res.status(500).json({ message: 'Error updating article', error: e.message });
    }
};
exports.patchArticle = patchArticle;
const removeRating = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.body || {};
        if (!userId)
            return res.status(400).json({ message: 'userId is required' });
        const article = await Article_1.default.findById(id);
        if (!article)
            return res.status(404).json({ message: 'Article not found' });
        article.ratings = Array.isArray(article.ratings) ? article.ratings.filter(r => r.userId !== userId) : [];
        await article.save();
        res.json({ message: 'Rating removed', averageRating: article.averageRating });
    }
    catch (e) {
        res.status(500).json({ message: 'Error removing rating', error: e.message });
    }
};
exports.removeRating = removeRating;
