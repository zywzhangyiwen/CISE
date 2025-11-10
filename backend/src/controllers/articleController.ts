import { Request, Response } from 'express';
import Article, { IArticle } from '../models/Article';
import { AuthRequest } from '../middleware/auth';

// 提交新文章
export const submitArticle = async (req: Request, res: Response) => {
  try {
    const articleData = {
      ...req.body,
      submissionDate: new Date(),
      moderationStatus: 'pending',
      analysisStatus: 'pending'
    };
    
    const article = new Article(articleData);
    await article.save();
    
    res.status(201).json({
      message: 'Article submitted successfully',
      article: {
        id: article._id,
        title: article.title,
        status: article.moderationStatus
      }
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Error submitting article', 
      error: error.message 
    });
  }
};

// 获取待审核文章
export const getPendingArticles = async (req: AuthRequest, res: Response) => {
  try {
    const articles = await Article.find({ moderationStatus: 'pending' })
      .select('-ratings -analysisDate -analyst -moderationReason')
      .sort({ submissionDate: 1 });
    
    res.json(articles);
  } catch (error: any) {
    // Log the full error server-side for easier debugging
    console.error('Error in getPendingArticles:', error);
    res.status(500).json({ 
      message: 'Error fetching pending articles', 
      error: error.message 
    });
  }
};

// 审核文章
export const moderateArticle = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const article = await Article.findByIdAndUpdate(
      id,
      {
        moderationStatus: status,
        moderationDate: new Date(),
        moderator: req.user?.email,
        ...(reason && { moderationReason: reason })
      },
      { new: true }
    );
    
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }
    
    res.json({
      message: `Article ${status} successfully`,
      article
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Error moderating article', 
      error: error.message 
    });
  }
};

// 搜索文章
export const searchArticles = async (req: Request, res: Response) => {
  try {
    const { 
      sePractice, 
      claim, 
      minYear, 
      maxYear, 
      result,
      page = 1, 
      limit = 10 
    } = req.query;
    
    const query: any = { moderationStatus: 'approved', analysisStatus: 'analyzed' };
    
    if (sePractice) query.sePractice = sePractice;
    if (result) query.result = result;
    if (minYear || maxYear) {
      query.pubyear = {};
      if (minYear) query.pubyear.$gte = minYear;
      if (maxYear) query.pubyear.$lte = maxYear;
    }
    
    // 文本搜索
    if (claim) {
      query.$or = [
        { claim: { $regex: claim, $options: 'i' } },
        { title: { $regex: claim, $options: 'i' } }
      ];
    }
    
    const articles = await Article.find(query)
      .select('-ratings -moderationReason')
      .sort({ pubyear: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));
    
    const total = await Article.countDocuments(query);
    
    res.json({
      articles,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Error searching articles', 
      error: error.message 
    });
  }
};

// 获取当前登录用户的提交（用于提交者查看自己提交的待审核与已审核记录）
export const getMySubmissions = async (req: AuthRequest, res: Response) => {
  try {
    const userEmail = req.user?.email;
    if (!userEmail) return res.status(401).json({ message: 'Unauthorized' });

    const articles = await Article.find({ submitter: userEmail })
      .select('-ratings -analysisDate -analyst -moderationReason')
      .sort({ submissionDate: -1 });

    res.json(articles);
  } catch (error: any) {
    console.error('Error in getMySubmissions:', error);
    res.status(500).json({ message: 'Error fetching user submissions', error: error.message });
  }
};

// 获取待分析文章（审核通过但未分析）
export const getPendingAnalysis = async (req: AuthRequest, res: Response) => {
  try {
    const articles = await Article.find({ moderationStatus: 'approved', analysisStatus: 'pending' })
      .select('-ratings -moderationReason')
      .sort({ moderationDate: 1 });
    res.json(articles);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching pending analysis articles', error: error.message });
  }
};

// 录入分析结果
export const analyzeArticle = async (req: AuthRequest, res: Response) => {
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
    const normalizeParticipant = (p?: string) => {
      if (!p) return undefined;
      const v = String(p).toLowerCase();
      if (v === 'students') return 'student';
      if (v === 'practitioners') return 'practitioner';
      return v;
    };

    const update: any = {
      sePractice,
      claim,
      result,
      ...(researchType ? { researchType } : {}),
      ...(participantType ? { participantType: normalizeParticipant(participantType) } : {}),
      analysisStatus: 'analyzed',
      analysisDate: new Date(),
      analyst: req.user?.email,
    };

    const article = await Article.findByIdAndUpdate(id, update, { new: true });
    if (!article) return res.status(404).json({ message: 'Article not found' });

    res.json({ message: 'Analysis saved', article });
  } catch (error: any) {
    res.status(500).json({ message: 'Error saving analysis', error: error.message });
  }
};