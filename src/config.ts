import { z } from 'zod';

const configSchema = z.object({
  NEXT_PUBLIC_API_ENDPOINT: z.string(),
  NEXT_PUBLIC_URL: z.string(),
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: z.string(),
  NEXT_PUBLIC_GOOGLE_AUTHORIZED_REDIRECT_URI: z.string(),
  NEXT_PUBLIC_BANK: z.string(),
  NEXT_PUBLIC_ACCOUNT_NAME: z.string(),
  NEXT_PUBLIC_ACCOUNT_NUMBER: z.string(),
  NEXT_PUBLIC_CODE: z.string()
});

const configProject = configSchema.safeParse({
  NEXT_PUBLIC_API_ENDPOINT: process.env.NEXT_PUBLIC_API_ENDPOINT,
  NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  NEXT_PUBLIC_GOOGLE_AUTHORIZED_REDIRECT_URI: process.env.NEXT_PUBLIC_GOOGLE_AUTHORIZED_REDIRECT_URI,
  NEXT_PUBLIC_BANK: process.env.NEXT_PUBLIC_BANK,
  NEXT_PUBLIC_ACCOUNT_NAME: process.env.NEXT_PUBLIC_ACCOUNT_NAME,
  NEXT_PUBLIC_ACCOUNT_NUMBER: process.env.NEXT_PUBLIC_ACCOUNT_NUMBER,
  NEXT_PUBLIC_CODE: process.env.NEXT_PUBLIC_CODE
});

if (!configProject.success) {
  console.error(configProject.error.errors);
  throw new Error('Invalid config');
}

const envConfig = configProject.data;

export default envConfig;
export const locales = ['vi', 'en'] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale = 'vi';
