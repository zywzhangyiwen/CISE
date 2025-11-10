import { Request, Response } from 'express';
import Config from '../models/Config';
import Article from '../models/Article';

export const getConfig = async (_req: Request, res: Response) => {
  try {
    const cfg = await Config.findOne();
    res.json(cfg || { practices: {}, defaultColumns: [], notifications: {} });
  } catch (e: any) {
    res.status(500).json({ message: 'Error fetching config', error: e.message });
  }
};

export const upsertConfig = async (req: Request, res: Response) => {
  try {
    const { practices, defaultColumns, notifications } = req.body || {};
    const cfg = await Config.findOne();
    if (cfg) {
      if (practices) cfg.practices = practices;
      if (defaultColumns) cfg.defaultColumns = defaultColumns;
      if (notifications) cfg.notifications = { ...cfg.notifications, ...notifications };
      await cfg.save();
      return res.json(cfg);
    }
    const created = await Config.create({ practices, defaultColumns, notifications });
    res.status(201).json(created);
  } catch (e: any) {
    res.status(500).json({ message: 'Error updating config', error: e.message });
  }
};

export const patchArticle = async (req: Request, res: Response) => {
  try {
    const { idOrDoi } = req.params as any;
    const update = req.body || {};
    const query = idOrDoi.startsWith('10.') ? { doi: idOrDoi } : { _id: idOrDoi };
    const doc = await Article.findOneAndUpdate(query, update, { new: true });
    if (!doc) return res.status(404).json({ message: 'Article not found' });
    res.json(doc);
  } catch (e: any) {
    res.status(500).json({ message: 'Error updating article', error: e.message });
  }
};

export const removeRating = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.body || {};
    if (!userId) return res.status(400).json({ message: 'userId is required' });
    const article = await Article.findById(id);
    if (!article) return res.status(404).json({ message: 'Article not found' });
    article.ratings = Array.isArray(article.ratings) ? article.ratings.filter(r => r.userId !== userId) : [];
    await article.save();
    res.json({ message: 'Rating removed', averageRating: article.averageRating });
  } catch (e: any) {
    res.status(500).json({ message: 'Error removing rating', error: e.message });
  }
};


