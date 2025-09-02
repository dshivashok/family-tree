#!/bin/bash
set -e

npm install
if [ ! -f .env.local ]; then
  cp .env.example .env.local
  echo "Created .env.local with sample Supabase credentials. Edit if you have your own."
fi

echo "Setup complete. Run 'npm run dev' to start the development server."
