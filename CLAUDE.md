# CLAUDE.md — Spark

Spark — AI-дейтинг-приложение (Tinder-аналог), где ценность создаёт Claude: AI-онбординг, умный матчинг, icebreakers и коуч, модерация, агент Wingman, evals.

**Источник правды — [SPEC.md](./SPEC.md).** Перед любой задачей найди её в SPEC §14 и прочитай §4 (FSD) и §15 (правила для агентов). Если SPEC и этот файл расходятся, прав SPEC. Если в SPEC чего-то не хватает, ничего не придумывай: оставь `// TODO(spec): …` и опиши вопрос в отчёте.

## Стек

- **Next.js 16** (App Router) + **React 19** + **TypeScript 5** (strict)
- **Tailwind v4** + **shadcn/ui** + **framer-motion**
- **Zod 4** — валидация на всех границах
- **Supabase** — Postgres + pgvector, Auth (email), Realtime; клиенты через `@supabase/ssr`
- **Claude API** через `@anthropic-ai/sdk` (Sonnet — tier `smart`, Haiku — tier `fast`)
- **Voyage AI** — эмбеддинги
- **Vitest** — тесты; `npm run eval` — evals
- **Steiger** + ESLint — проверка архитектуры
- **Vercel** — деплой по push в `main`

## Архитектура: Feature-Sliced Design

```
app/          # только роутинг Next.js: page.tsx/route.ts — однострочные реэкспорты из src/
proxy.ts      # Next.js 16 (бывший middleware.ts): обновление сессии Supabase и редиректы
src/
  _app/       # провайдеры, глобальные стили
  _pages/     # композиция экранов
  widgets/    # крупные блоки UI
  features/   # пользовательские действия
  entities/   # бизнес-сущности
  shared/     # ui, lib, config, api/supabase, ai
```

- Слои `_app` и `_pages` с подчёркиванием — чтобы не конфликтовать с папками Next.js (рекомендация FSD для Next.js).
- Импорт только вниз по слоям: _app → _pages → widgets → features → entities → shared.
- Слайсы одного слоя друг друга не импортируют.
- Снаружи слайса — только его public API: `index.ts` (client-safe) или `server.ts` (server-only). Глубокие импорты (`@/features/x/ui/Y`) запрещены.
- `shared` импортируется по файлам: `@/shared/ui/button`, `@/shared/lib/utils`, `@/shared/config/env.server`, `@/shared/api/supabase/server`.
- Сегменты: `ui/`, `model/`, `api/` (клиентские запросы), `server/` (только сервер), `lib/`, `config/`.
- Алиас: `@/*` → `src/*`.

## Договорённости

### TypeScript

- `strict: true`, плюс `noUncheckedIndexedAccess`. Никаких `any`, `@ts-ignore` и `as` без комментария, почему иначе нельзя.
- Именованные экспорты. `default` — только там, где требует Next.js (`app/**`).
- Имена: компоненты — `PascalCase.tsx`, остальные файлы — `camelCase.ts`, папки слайсов — `kebab-case`.
- Типы БД — только из сгенерированного `src/shared/api/supabase/database.types.ts`, руками не правится.

### Zod

- Валидируются: тело и query каждого эндпоинта, каждый ответ LLM, env (`src/shared/config/env.ts`), входы инструментов агента.
- Схемы лежат в `model/schemas.ts` своего слайса; типы выводятся через `z.infer`, а не дублируются.
- Ошибка валидации эндпоинта → 400 в формате `{ error: { code, message } }` (хелпер `@/shared/lib/http`).

### Вызовы Claude

- **Все вызовы Claude и Voyage — только через `@/shared/ai`** (`src/shared/ai`, в плане проекта это `lib/claude.ts`). Импорт `@anthropic-ai/sdk` в любом другом месте запрещён линтером.
- Используй `complete()`, `stream()`, `structured(opts, schema)`, `embed()`. Каждый вызов передаёт `feature` и `promptVer`, чтобы он залогировался в `ai_calls` с токенами, стоимостью и латентностью.
- Модель выбирается через `tier: 'smart' | 'fast'`. ID моделей и цены берутся только из env/конфига, не хардкодятся.
- Пользовательский контент (био, сообщения, ответы в онбординге) передаётся в XML-тегах (`<profile>`, `<message>`, `<conversation>`) как данные, никогда как инструкции.
- ID из ответов модели сверяются со входными данными.
- Перед каждым AI-эндпоинтом — `rateLimit()`.

### Сервер и безопасность

- Серверный код — в `server/`, первая строка — `import 'server-only'`.
- Клиенты Supabase: `browser.ts` (клиент), `server.ts` (RLS от имени пользователя), `admin.ts` (secret key, обходит RLS — только в `server/`, `scripts/`, `evals/`, `shared/ai`).
- Env читается только через `publicEnv()` (`env.public.ts`) и `serverEnv()` (`env.server.ts`), не напрямую из `process.env`.
- Ключи — только в серверных env, никогда в `NEXT_PUBLIC_*`.
- Схема БД меняется только миграцией в `supabase/migrations/`, после неё — `npm run db:types`.

### UI

- Примитивы берутся из `@/shared/ui/*`. Новые компоненты — `npx shadcn@latest add <name>`: `components.json` настроен так, что они попадают в `src/shared/ui`.
- На каждом экране есть состояния загрузки (Skeleton), пустое и ошибочное.
- Mobile-first, от 360 px.

### Тесты

- Тесты лежат в `__tests__/` внутри слайса.
- Сетевые вызовы Claude/Voyage в тестах запрещены — только моки `@/shared/ai`.
- `server-only` в тестах подменён заглушкой (`vitest.config.ts`); скрипты `seed`/`eval` запускаются с `--conditions=react-server`.

## Зоны, которые пишет человек

Это код, который Natallia пишет сама. Агент делает только каркас: типы, сигнатуры, Zod-схемы и `throw new Error('TODO(human)')`. Реализацию не трогай без прямой просьбы.

- `src/features/*/server/prompts.ts` — тексты промптов
- `src/features/onboarding/server/extractProfile.ts`
- `src/features/rank-feed/server/rerank.ts`
- `src/entities/message/server/moderate.ts`
- `src/features/icebreakers/server/*`, `src/features/chat-coach/server/*` — сборка system-блоков с `cache_control`
- `src/features/wingman/server/loop.ts` и описания инструментов агента
- `evals/cases/*`, рубрика судьи

## Запуск

Нужны Node.js 20.9+ (см. `.nvmrc`), npm. Supabase CLI ставится как dev-зависимость. Для локального Supabase нужен Docker; без него используй облачный проект Supabase.

```bash
npm run bootstrap              # первый раз: ставит зависимости, добавляет button из shadcn, гоняет check
# дальше — просто npm install
cp .env.example .env.local     # заполнить ключи, список — SPEC §12

# База: вариант А — локально (Docker)
npx supabase init               # один раз, создаёт supabase/config.toml
npx supabase start             # выведет URL и ключи для .env.local
npx supabase db reset          # применит миграции

# База: вариант Б — облачный проект
npx supabase link --project-ref <ref>
npx supabase db push

npm run db:types               # сгенерировать типы БД
npm run seed                   # 50 профилей через Claude + эмбеддинги (тратит кредиты)
npm run dev                    # http://localhost:3000
```

## Команды

| Команда | Что делает |
|---|---|
| `npm run bootstrap` | Первичная установка зависимостей |
| `npm run dev` | Локальный запуск |
| `npm run build` | Продакшен-сборка |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run lint:fsd` | `steiger ./src` |
| `npm run test` | Vitest |
| `npm run check` | typecheck + lint + lint:fsd + test |
| `npm run db:types` | Генерация типов Supabase |
| `npm run seed` | Сид-профили (`--reset` — пересоздать) |
| `npm run eval` | Evals (тратит кредиты) |

## Когда задача готова

1. `npm run check` зелёный.
2. Изменены только слайсы из задачи; новые экспорты public API перечислены в отчёте.
3. Новые env-переменные добавлены в `.env.example`, `src/shared/config/env.ts` и SPEC §12.
4. Если поменялся контракт (схема, эндпоинт, таблица) — обновлён SPEC.md.
5. Не запускай `npm run seed` и `npm run eval` без просьбы: они тратят API-кредиты.
