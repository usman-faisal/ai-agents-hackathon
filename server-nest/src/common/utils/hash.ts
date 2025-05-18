import * as crypto from 'crypto';
import { MulterFile } from '../types/type';


export const hashPassword = (password: string) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
    .toString('hex');
  return { salt, hash };
};

export const verifyPassword = ({
  password,
  salt,
  hash,
}: {
  password: string;
  salt: string;
  hash: string;
}) => {
  const candidateHash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
    .toString('hex');
  return hash === candidateHash;
};


export const getFileContentParts = (files: MulterFile[]) => {
  return files.map((file) => {
    const arrayBuffer = file.buffer.buffer.slice(
      file.buffer.byteOffset,
      file.buffer.byteOffset + file.buffer.byteLength,
    );

    return {
      type: 'file' as const,
      data: arrayBuffer,
      mimeType: file.mimetype,
    };
    
  });
};