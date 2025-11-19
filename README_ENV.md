# Environment Variables Setup

## Required Environment Variables

Create a `.env.local` file in the root directory of your project with the following variables:

```env
# Crypto key for decrypting URL parameters (must match backend)
NEXT_PUBLIC_CRYPTO_KEY_SECRET=your-secret-key-here

# API Base URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

## Important Notes:

1. **File Name**: The file must be named `.env.local` (not `.env` or `.env.local.example`)
2. **NEXT_PUBLIC_ Prefix**: All environment variables used in client-side code must start with `NEXT_PUBLIC_`
3. **Restart Required**: After creating or modifying `.env.local`, you MUST restart your Next.js development server:
   ```bash
   # Stop the server (Ctrl+C) and restart:
   npm run dev
   ```
4. **Git Ignore**: The `.env.local` file is already in `.gitignore` and won't be committed to version control

## Troubleshooting:

- If environment variables are not loading:
  1. Make sure the file is named `.env.local` (not `.env`)
  2. Make sure variable names start with `NEXT_PUBLIC_`
  3. Restart the dev server completely
  4. Check the browser console for warnings about missing environment variables

- To verify variables are loaded, check the browser console when the LoginHandler component runs - it will log whether the CRYPTO_KEY_SECRET exists (in development mode only)

