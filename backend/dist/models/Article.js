"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const ArticleSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    authors: [{ type: String, required: true }],
    source: { type: String, required: true },
    pubyear: { type: String, required: true },
    doi: { type: String, required: true },
    claim: { type: String, required: true },
    evidence: { type: String, required: true },
    submissionDate: { type: Date, default: Date.now },
    submitter: { type: String, required: true },
    moderationStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    moderationDate: { type: Date },
    moderator: { type: String },
    moderationReason: { type: String },
    analysisStatus: {
        type: String,
        enum: ['pending', 'analyzed'],
        default: 'pending'
    },
    analysisDate: { type: Date },
    analyst: { type: String },
    sePractice: { type: String },
    researchType: {
        type: String,
        enum: ['case study', 'experiment', 'survey', 'other']
    },
    participantType: {
        type: String,
        enum: ['student', 'practitioner', 'mixed']
    },
    result: {
        type: String,
        enum: ['agree', 'disagree', 'mixed']
    },
    ratings: [{
            userId: { type: String, required: true },
            rating: { type: Number, min: 1, max: 5, required: true },
            date: { type: Date, default: Date.now }
        }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
// 计算平均评分的虚拟字段
ArticleSchema.virtual('averageRating').get(function () {
    // ratings may be excluded from queries (e.g. select('-ratings')) or be undefined,
    // so guard against missing values here to avoid runtime errors when virtuals are accessed.
    if (!Array.isArray(this.ratings) || this.ratings.length === 0)
        return 0;
    const sum = this.ratings.reduce((acc, rating) => acc + ((rating === null || rating === void 0 ? void 0 : rating.rating) || 0), 0);
    return sum / this.ratings.length;
});
exports.default = mongoose_1.default.model('Article', ArticleSchema);
