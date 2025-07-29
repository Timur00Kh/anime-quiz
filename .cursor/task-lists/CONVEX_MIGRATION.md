# Convex Migration Implementation

Миграция проекта с Supabase на Convex с созданием независимого модуля парсера World-Art.

## Completed Tasks

- [x] Создать независимый модуль парсера World-Art
- [x] Настроить Convex Backend схему БД
- [x] Добавить тестовые скрипты для валидации
- [x] Обновить package.json скрипты
- [x] Создать документацию миграции
- [x] Настроить базовую архитектуру Convex
- [x] Добавить кеширование в парсер
- [x] Создать типизацию для всех компонентов

## In Progress Tasks

- [ ] Настроить environment variables
- [ ] Интегрировать парсер в Convex actions
- [ ] Обновить клиентский код для использования Convex

## Future Tasks

- [ ] Заменить Supabase на Convex в компонентах
- [ ] Добавить ConvexProvider в layout
- [ ] Заменить API endpoints на Convex functions
- [ ] Протестировать полный flow
- [ ] Проверить производительность
- [ ] Удалить Supabase зависимости
- [ ] Настроить Convex deployment
- [ ] Настроить Telegram бота

## Implementation Plan

### Архитектура
1. **Независимый модуль парсера** - `src/lib/world-art-parser/`
2. **Convex Backend** - `convex/` с функциями и схемой БД
3. **Клиентская интеграция** - замена Supabase на Convex hooks

### Тестирование
- Парсер работает независимо ✅
- Convex схема настроена ✅
- Нужно интегрировать компоненты

### Environment Setup
- NEXT_PUBLIC_CONVEX_URL
- TELEGRAM_BOT_TOKEN  
- TELEGRAM_GAME_SHORT_NAME

## Relevant Files

- `src/lib/world-art-parser/` - ✅ Независимый модуль парсера
- `convex/schema.ts` - ✅ Схема БД
- `convex/worldArt.ts` - ✅ Functions для парсера
- `convex/telegram.ts` - ✅ Telegram handlers
- `convex/http.ts` - ✅ HTTP endpoints
- `scripts/validate-migration.ts` - ✅ Валидация миграции
- `scripts/simple-test.ts` - ✅ Быстрый тест парсера
- `MIGRATION.md` - ✅ Документация
- `src/utils/convex.ts` - 🔄 Клиентская интеграция
- `src/app/layout.tsx` - 🔄 ConvexProvider
- `.env.local` - ❌ Environment variables 