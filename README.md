# Family Tree

A Next.js app backed by Supabase for collecting family information and displaying it as a tree. Each member stores English name, Chinese name, phone, email and a picture.

Relatives can add spouses and children directly from the tree so everyone can build out the family history together.

## Setup

1. **Install dependencies and create environment file**

   ```bash
   ./setup.sh
   ```

2. **Configure Supabase keys**

   `.env.example` is pre-populated with a sample Supabase project. The app will
   use those credentials by default, but you can edit `.env.local` with your own
   `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` if you prefer.

3. **Apply database schema**

   Use the Supabase SQL editor or CLI to run the SQL in `supabase/migrations/0001_create_family_members.sql`
   followed by `supabase/migrations/0002_add_spouse_id.sql`.

4. **Run the development server**

   ```bash
   npm run dev
   ```

## Deployment

Deploy the project to Vercel. Ensure the environment variables `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set in Vercel and that the database schema has been applied. The Supabase storage bucket `pictures` should also exist and be public.

Once the repo is linked, Vercel will run `npm install` and `npm run build` automatically. After the first deployment, share the Vercel URL with relatives so they can add their information.
