export type NotificationType =
  | 0  // PostLike
  | 1  // Comment
  | 2  // Reply
  | 3  // CommentLike
  | 4; // System

export type NotificationActor = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string | null;
};

export type AppNotification = {
  id: string;
  type: NotificationType;
  actor: NotificationActor | null;
  postId: string | null;
  commentId: string | null;
  message: string | null;
  isRead: boolean;
  createdAt: string;
};
