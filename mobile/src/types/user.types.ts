export type AuthUser = {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatarUrl?: string | null;
  role: number;
};

export type UserMe = AuthUser & {
  bio?: string | null;
  createdAt: string;
  postCount: number;
  savedCount: number;
};

export type UserProfile = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string | null;
  bio?: string | null;
  createdAt: string;
  postCount: number;
};
