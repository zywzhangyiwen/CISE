import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IConfig extends Document {
  practices: Record<string, string[]>; // e.g., { TDD: [..claims], "Mob Programming": [..claims] }
  defaultColumns: string[]; // default visible columns on search page
  notifications: {
    notifyOnSubmission?: boolean;
    notifyOnModerationApproved?: boolean;
  };
  updatedAt?: Date;
}

type ConfigModel = Model<IConfig>;

const ConfigSchema: Schema<IConfig> = new Schema<IConfig>({
  practices: { type: Schema.Types.Mixed, default: {} },
  defaultColumns: { type: [String], default: ['title','authors','pubyear','source','sePractice','claim','result','researchType','participantType','rating'] },
  notifications: {
    notifyOnSubmission: { type: Boolean, default: false },
    notifyOnModerationApproved: { type: Boolean, default: true }
  }
}, {
  timestamps: true
});

export default mongoose.model<IConfig, ConfigModel>('Config', ConfigSchema);


