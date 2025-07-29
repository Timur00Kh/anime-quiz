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
- [x] Настроить environment variables
- [x] Исправить ошибки TypeScript с OstType
- [x] Интегрировать парсер в Convex actions
- [x] Добавить ConvexProvider в layout
- [x] Обновить клиентский код для использования Convex
- [x] Исправить TypeScript ошибки в парсере
- [x] Протестировать парсер (работает с ID 10)
- [x] Протестировать приложение (Next.js работает на порту 3001)

## In Progress Tasks

- [ ] Заменить старые API endpoints на Convex functions
- [ ] Протестировать генерацию квиза с Convex

## Future Tasks

- [ ] Заменить Supabase на Convex в компонентах
- [ ] Проверить производительность
- [ ] Удалить Supabase зависимости
- [ ] Настроить Convex deployment
- [ ] Настроить Telegram бота (не начинать без одобрения)

## Implementation Plan

### Архитектура
1. **Независимый модуль парсера** - `src/lib/world-art-parser/`
2. **Convex Backend** - `convex/` с функциями и схемой БД
3. **Клиентская интеграция** - замена Supabase на Convex hooks

### Текущий статус
- ✅ Convex запущен локально (http://127.0.0.1:3210)
- ✅ Dashboard доступен (http://127.0.0.1:6790)
- ✅ Environment variables настроены
- ✅ Парсер интегрирован в Convex actions
- ✅ ConvexProvider добавлен в layout
- ✅ ostAPI.ts обновлен для использования Convex
- ✅ TypeScript ошибки исправлены
- ✅ Парсер протестирован (работает с ID 10)
- ✅ Приложение работает (http://localhost:3001)
- 🔄 Нужно заменить старые API endpoints

### Следующие шаги
1. Заменить `/api/getOst` на Convex functions
2. Протестировать квиз с новыми endpoints
3. Удалить Supabase зависимости

## Relevant Files

- `src/lib/world-art-parser/` - ✅ Независимый модуль парсера
- `convex/schema.ts` - ✅ Схема БД
- `convex/worldArt.ts` - ✅ Functions для парсера (интегрирован)
- `convex/telegram.ts` - ✅ Telegram handlers
- `convex/http.ts` - ✅ HTTP endpoints
- `scripts/validate-migration.ts` - ✅ Валидация миграции
- `scripts/simple-test.ts` - ✅ Быстрый тест парсера
- `MIGRATION.md` - ✅ Документация
- `src/utils/convex.ts` - ✅ Клиентская интеграция
- `src/app/ClientLayout.tsx` - ✅ ConvexProvider добавлен
- `src/utils/ostAPI.ts` - ✅ Обновлен для Convex
- `src/lib/world-art-parser/parser.ts` - ✅ TypeScript ошибки исправлены
- `src/app/api/getOst/route.ts` - 🔄 Нужно заменить на Convex 