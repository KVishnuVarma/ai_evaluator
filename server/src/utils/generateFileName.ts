import crypto from 'crypto';
import path from 'path';

export const generateFileName = (originalName: string, prefix?: string): string => {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  const extension = path.extname(originalName);
  const baseName = path.basename(originalName, extension);
  
  const sanitizedBaseName = baseName.replace(/[^a-zA-Z0-9]/g, '_');
  const finalPrefix = prefix ? `${prefix}_` : '';
  
  return `${finalPrefix}${sanitizedBaseName}_${timestamp}_${randomString}${extension}`;
};

export const generateUniqueId = (): string => {
  return crypto.randomBytes(16).toString('hex');
};

export const sanitizeFileName = (fileName: string): string => {
  return fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
};

export const validateFileType = (fileName: string, allowedTypes: string[]): boolean => {
  const extension = path.extname(fileName).toLowerCase();
  return allowedTypes.includes(extension);
};

export const getFileExtension = (fileName: string): string => {
  return path.extname(fileName).toLowerCase();
};

export const createFilePath = (directory: string, fileName: string): string => {
  return path.join(directory, fileName);
};
