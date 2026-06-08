import mongoose, { Schema, Document } from 'mongoose';

export interface IProject {
  title: string;
  description: string;
  link: string;
  imageUrl?: string;
}

export interface ISocialLinks {
  github?: string;
  twitter?: string;
  linkedin?: string;
  website?: string;
}

export interface IPortfolio extends Document {
  firebaseUid: string;  // Link to Firebase user
  username: string;
  name: string;
  bio: string;
  skills: string[];
  projects: IProject[];
  socialLinks: ISocialLinks;
  template: string;
  theme: {
    primaryColor: string;
    mode: 'light' | 'dark';
  };
}

const ProjectSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  link: { type: String, required: true },
  imageUrl: { type: String },
});

const SocialLinksSchema: Schema = new Schema({
  github: { type: String },
  twitter: { type: String },
  linkedin: { type: String },
  website: { type: String },
});

const PortfolioSchema: Schema = new Schema({
  firebaseUid: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true, lowercase: true, trim: true },
  name: { type: String, required: true },
  bio: { type: String, default: '' },
  skills: { type: [String], default: [] },
  projects: { type: [ProjectSchema], default: [] },
  socialLinks: { type: SocialLinksSchema, default: {} },
  template: { type: String, default: 'minimal' },
  theme: {
    primaryColor: { type: String, default: '#3b82f6' },
    mode: { type: String, enum: ['light', 'dark'], default: 'dark' },
  },
}, { timestamps: true });

export default mongoose.models.Portfolio || mongoose.model<IPortfolio>('Portfolio', PortfolioSchema);
