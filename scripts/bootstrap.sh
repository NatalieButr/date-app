#!/usr/bin/env bash
# Одноразовая установка зависимостей. Версии фиксируются в package.json и package-lock.json.
set -euo pipefail
cd "$(dirname "$0")/.."

npm install \
  next@16 react@19 react-dom@19 \
  zod@4 \
  @supabase/supabase-js @supabase/ssr \
  @anthropic-ai/sdk \
  server-only \
  framer-motion \
  clsx tailwind-merge class-variance-authority lucide-react tw-animate-css shadcn

npm install -D \
  typescript@5 @types/node @types/react @types/react-dom \
  tailwindcss@4 @tailwindcss/postcss \
  eslint@9 eslint-config-next@16 \
  steiger @feature-sliced/steiger-plugin \
  vitest vite-tsconfig-paths \
  tsx \
  supabase

# Базовый компонент shadcn/ui — проверяет, что components.json и алиасы FSD настроены верно
npx shadcn@latest add button --yes

npm run check
echo "Готово. Дальше: cp .env.example .env.local и npm run dev"
