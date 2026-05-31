import { User } from '@prisma/client';

export type SafeUser = Omit<User, 'password'>;

export interface ArticleWithRelations {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featuredImage: string | null;
  categoryId: string;
  category: {
    id: string;
    name: string;
    nameUrdu: string;
    slug: string;
  };
  authorId: string;
  author: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  status: string;
  publishedAt: Date | null;
  views: number;
  isBreaking: boolean;
  isFeatured: boolean;
  tags: {
    tag: {
      id: string;
      name: string;
      slug: string;
    };
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface DailyLimitInfo {
  canPublish: boolean;
  currentCount: number;
  limit: number;
  message: string;
}

export interface DashboardStats {
  totalArticles: number;
  publishedToday: number;
  dailyLimit: number;
  totalViews: number;
  totalCategories: number;
  totalTags: number;
  totalUsers: number;
  draftCount: number;
  scheduledCount: number;
  publishedCount: number;
  breakingCount: number;
}
