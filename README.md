# Project Setup

## Environment Variables

This project uses environment variables for configuration. Follow these steps to set up your environment:

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Update the values in `.env` with your Supabase credentials:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase project anon/public key
   - `SUPABASE_PASSWORD`: Your database password (for local development)

You can find these values in your Supabase project settings under the "API" section.

### Security Notes
- Never commit your `.env` file to version control
- Keep your service role key secure and never use it in client-side code
- Share sensitive credentials through secure channels only

## Development

Start the development server:
```bash
yarn dev
```

## Building for Production

```bash
yarn build
``` 