import { Role } from '@prisma/client';

export interface QueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  filter?: string;
  search?: string;
}

export interface PaginationInfo {
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
  filename: string;
}

export interface GoogleUser {
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
  accessToken: string;
  refreshToken: string;
}

export type JwtPayload = {
  id: string;
  email: string;
  role: Role;
};

// Text content type
export interface TextContent {
  type: 'text';
  text: string;
}

// File content type for handling uploaded files
export interface FileContent {
  type: 'file';
  source_type: string; // Default is 'base64'
  data: string; // Base64 encoded file data
  mime_type: string; // MIME type of the file (e.g., 'application/pdf')
}

export type ContentType = TextContent | FileContent;
