export interface QueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  filter?: string;
  search?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface IPagination {
  totalItems: number;
  perPage: number;
  totalPages: number;
  currentPage: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}

export interface IUser {
  _id: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  name: string;
  role: "user" | "admin";
  avatar?: string;
  hasNotifications: boolean;
  isEmailVerified: boolean;
}

export interface Message {
  id: string;
  sender: "user" | "bot" | "system";
  text: string;
  files?: File[]; // Files sent by the user
  fileNames?: string[]; // Or just filenames if displaying bot's "awareness" of files
  timestamp: Date;
  isLoading?: boolean; // For bot's temporary "typing" message
}