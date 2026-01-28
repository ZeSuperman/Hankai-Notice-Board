
export enum RoleCategory {
  TOP_MANAGEMENT = 'Top Management',
  MIDDLE_MANAGEMENT = 'Middle Management',
  SUBJECT_TEACHER = 'Subject Teachers',
  STAFF = 'Staff'
}

export interface Attachment {
  name: string;
  type: string;
  data: string; 
}

export interface User {
  id: string;
  chineseName: string;
  englishName: string;
  post: string;
  discipline: string;
  telephone: string;
  office: string;
  department: string;
  category: RoleCategory;
}

export interface Notice {
  id: string;
  content: string;
  senderId: string;
  category: RoleCategory;
  date: string; 
  taggedUserIds: string[];
  attachments?: Attachment[];
  createdAt: number;
}

export interface ReadStatus {
  [compositeId: string]: boolean; 
}

export interface AppNotification {
  id: string;
  noticeId: string;
  message: string;
  timestamp: number;
  isRead: boolean;
  isPriority: boolean;
}
