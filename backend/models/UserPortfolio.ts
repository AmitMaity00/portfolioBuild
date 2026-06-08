import mongoose, { Schema, Document } from 'mongoose';

// ------------------------------------
// 1. Sub-Schemas for nested data
// ------------------------------------

// Project Schema
const ProjectSchema: Schema = new Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  techStack: { type: [String], default: [] },
  link: { type: String, trim: true },
  imageUrl: { type: String, trim: true },
});

// Social Links Schema
const SocialLinksSchema: Schema = new Schema({
  github: { type: String, trim: true, default: '' },
  linkedin: { type: String, trim: true, default: '' },
  twitter: { type: String, trim: true, default: '' },
  website: { type: String, trim: true, default: '' },
});

// Theme Schema
const ThemeSchema: Schema = new Schema({
  primaryColor: { type: String, default: '#3b82f6', trim: true },
  backgroundColor: { type: String, default: '#ffffff', trim: true },
  font: { type: String, default: 'Inter', trim: true },
  mode: { type: String, enum: ['light', 'dark'], default: 'light' },
});

// GitHub Connection Schema
const GitHubConnectionSchema: Schema = new Schema({
  connected: { type: Boolean, default: false },
  username: { type: String, trim: true, default: '' },
  accessToken: { type: String, default: '' }, // Will be encrypted before storing
  deployedUrl: { type: String, default: '' },
  repositoryName: { type: String, default: '' },
  deployedAt: { type: Date, default: null },
});

// ------------------------------------
// 2. Main User / Portfolio Schema
// ------------------------------------

export interface IUserPortfolio extends Document {
  // Auth Data
  email: string;
  password?: string;
  username: string;

  // Portfolio Data
  fullName: string;
  bio: string;
  profileImage: string;
  skills: string[];
  socialLinks: any;
  
  // Array of Projects
  projects: any[];

  // Customization
  template: string;
  theme: any;

  // Additional Features
  isPublished: boolean;
  customDomain?: string;

  // GitHub Deployment
  github: {
    connected: boolean;
    username: string;
    accessToken: string;
    deployedUrl: string;
    repositoryName: string;
    deployedAt: Date | null;
  };
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const UserPortfolioSchema: Schema = new Schema(
  {
    // 1. Authentication
    email: { 
      type: String, 
      required: [true, 'Email is required'], 
      unique: true, 
      lowercase: true,
      trim: true,
      index: true
    },
    password: { 
      type: String, 
      required: [true, 'Password is required'],
      select: false // Prevent password from accidentally being sent to frontend
    },
    username: { 
      type: String, 
      required: [true, 'Username is required'], 
      unique: true, 
      lowercase: true,
      trim: true,
      index: true
    },

    // 2. Portfolio Data
    fullName: { type: String, required: true, trim: true },
    bio: { type: String, default: '', trim: true },
    profileImage: { type: String, default: '' },
    skills: { type: [String], default: [] },
    socialLinks: { type: SocialLinksSchema, default: () => ({}) },

    // 3. Projects Array
    projects: { type: [ProjectSchema], default: [] },

    // 4. Template & Theme
    template: { type: String, default: 'minimal', trim: true },
    theme: { type: ThemeSchema, default: () => ({}) },

    // 5. Additional Features
    isPublished: { type: Boolean, default: false },
    customDomain: { type: String, sparse: true, trim: true },

    // 6. GitHub Deployment
    github: { type: GitHubConnectionSchema, default: () => ({}) },
  },
  { 
    timestamps: true 
  }
);

export default mongoose.models.UserPortfolio || mongoose.model<IUserPortfolio>('UserPortfolio', UserPortfolioSchema);
