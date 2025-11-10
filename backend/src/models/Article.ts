import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IArticle extends Document {
  title: string;
  authors: string[];
  source: string;
  pubyear: string;
  doi: string;
  claim: string;
  evidence: string;
  
  // 新增字段
  submissionDate: Date;
  submitter: string; // 提交者邮箱
  moderationStatus: 'pending' | 'approved' | 'rejected';
  moderationDate?: Date;
  moderator?: string;
  moderationReason?: string; // 拒绝理由
  
  analysisStatus: 'pending' | 'analyzed';
  analysisDate?: Date;
  analyst?: string;
  
  // 分析相关字段
  sePractice?: string; // 软件工程实践 - 改为可选
  researchType?: string; // 研究类型 - 改为可选
  participantType?: string; // 参与者类型 - 改为可选
  result?: 'agree' | 'disagree' | 'mixed'; // 证据结果 - 改为可选
  
  // 用户评分
  ratings: Array<{
    userId: string;
    rating: number;
    date: Date;
  }>;
}

// 添加虚拟字段到接口
export interface IArticleVirtuals {
  averageRating: number;
}

type ArticleModel = Model<IArticle, {}, IArticleVirtuals>;

const ArticleSchema: Schema<IArticle> = new Schema<IArticle>({
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
ArticleSchema.virtual('averageRating').get(function(this: IArticle) {
  // ratings may be excluded from queries (e.g. select('-ratings')) or be undefined,
  // so guard against missing values here to avoid runtime errors when virtuals are accessed.
  if (!Array.isArray(this.ratings) || this.ratings.length === 0) return 0;
  const sum = this.ratings.reduce((acc, rating) => acc + (rating?.rating || 0), 0);
  return sum / this.ratings.length;
});

export default mongoose.model<IArticle, ArticleModel>('Article', ArticleSchema);