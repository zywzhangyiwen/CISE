import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const validateArticleSubmission = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    title: Joi.string().required().min(1).max(500),
    authors: Joi.array().items(Joi.string().min(1)).min(1).required(),
    source: Joi.string().required().min(1).max(200),
    pubyear: Joi.string().required().min(4).max(4),
    doi: Joi.string().required().min(1),
    claim: Joi.string().required().min(1),
    evidence: Joi.string().required().min(1),
    submitter: Joi.string().email().required()
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

export const validateArticleModeration = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    status: Joi.string().valid('approved', 'rejected').required(),
    reason: Joi.string().max(500).optional()
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

export const validateUserRegistration = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    name: Joi.string().min(1).max(100).required(),
    role: Joi.string().valid('submitter', 'moderator', 'analyst', 'admin').optional()
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

export const validateUserLogin = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
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

export const validateSearchParams = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    sePractice: Joi.string().optional(),
    claim: Joi.string().optional(),
    minYear: Joi.string().length(4).optional(),
    maxYear: Joi.string().length(4).optional(),
    result: Joi.string().valid('agree', 'disagree', 'mixed').optional(),
    researchType: Joi.string().valid('case study', 'experiment', 'survey', 'other').optional(),
    participantType: Joi.string().valid('student', 'practitioner', 'mixed').optional(),
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
    sortBy: Joi.string().valid('title', 'authors', 'pubyear', 'source').optional(),
    sortOrder: Joi.string().valid('asc', 'desc').optional()
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