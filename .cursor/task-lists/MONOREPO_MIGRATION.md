# Monorepo Migration with npm Workspaces

Миграция проекта Anime Quiz на монорепо структуру с использованием npm workspaces для разделения фронтенда, бэкенда и микросервисов.

## Completed Tasks

- [x] Создать структуру монорепо с npm workspaces
- [x] Настроить корневой package.json с workspaces
- [x] Создать пакеты: web, convex-backend, shiki-api, shared
- [x] Перенести существующий код в соответствующие пакеты
- [x] Настроить TypeScript конфигурации для каждого пакета
- [x] Вынести world-art-parser в отдельный пакет
- [x] Обновить все импорты для работы с новой структурой
- [x] Добавить tsconfig.tsbuildinfo в .gitignore
- [x] Настроить path aliases для cross-package импортов
- [x] Создать базовые package.json для всех пакетов
- [x] Мигрировать shiki-api с Express на Fastify
- [x] Добавить rate limiting с bottleneck (5 concurrent, 90 rpm)
- [x] Обновить зависимости и TypeScript конфигурацию для Fastify
- [x] Добавить OAuth2 Client Credentials аутентификацию для Shikimori API
- [x] Реализовать кэширование OAuth2 токенов
- [x] Создать env.example с переменными окружения

## In Progress Tasks

- [ ] Исправить оставшиеся ошибки компиляции в web пакете
- [ ] Восстановить закомментированные Convex API вызовы
- [ ] Протестировать функциональность всех пакетов
- [x] Протестировать Fastify сервер с rate limiting
- [x] Протестировать OAuth2 аутентификацию с аниме 28223 (Death Parade)
- [x] Проверить все API endpoints (health, anime, externals, search)

## Future Tasks

- [ ] Настроить shared типы между пакетами
- [ ] Добавить тесты для каждого пакета
- [ ] Настроить CI/CD для монорепо
- [ ] Оптимизировать зависимости между пакетами
- [ ] Добавить документацию по архитектуре

## Implementation Plan

### Архитектура монорепо

```
anime-quiz-monorepo/
├── packages/
│   ├── web/                 # Next.js фронтенд
│   ├── convex-backend/      # Convex функции
│   ├── shiki-api/          # Express микросервис для Shikimori API
│   ├── world-art-parser/   # Парсер World-Art
│   └── shared/             # Общие типы и утилиты
├── package.json            # Корневой package.json с workspaces
└── .gitignore             # Обновлен для tsconfig.tsbuildinfo
```

### Структура пакетов

#### packages/web/
- Next.js приложение
- Компоненты React
- Страницы и роутинг
- Утилиты для работы с Convex

#### packages/convex-backend/
- Convex функции (queries, mutations, actions)
- Схема базы данных
- HTTP endpoints

#### packages/shiki-api/
- Fastify сервер для Shikimori API (порт 3100)
- OAuth2 Client Credentials аутентификация от имени приложения
- Rate limiting с bottleneck (5 concurrent, 90 rpm согласно API docs)
- Проксирование запросов к Shikimori API
- CORS и Helmet для безопасности
- Кэширование OAuth2 токенов

#### packages/world-art-parser/
- Парсер World-Art сайта
- Типы для OST данных
- Утилиты для работы с видео

#### packages/shared/
- Общие TypeScript типы
- Утилиты для валидации
- Константы

### Relevant Files

#### Корневые файлы
- `package.json` - Настройка workspaces и скриптов
- `.gitignore` - Добавлен `*.tsbuildinfo`
- `README.md` - Обновлена документация

#### packages/web/
- `package.json` - Зависимости для Next.js
- `tsconfig.json` - Path aliases для cross-package импортов
- `src/utils/convex.ts` - Обновлены импорты Convex
- `src/utils/ostAPI.ts` - Временно закомментированы проблемные вызовы
- `src/components/OSTCard.tsx` - Обновлены импорты типов

#### packages/convex-backend/
- `package.json` - Зависимости для Convex
- `convex/schema.ts` - Обновлена схема для видео
- `convex/worldArt.ts` - Исправлены deprecated API вызовы
- `convex/ostQuizGeneration/ostQuizGeneration.ts` - Добавлен TableAggregate

#### packages/world-art-parser/
- `package.json` - Новый пакет
- `src/index.ts` - Экспорт всех модулей
- `src/parser.ts` - Удален cache: "force-cache"

### Технические изменения

#### npm workspaces
- Корневой package.json: `"workspaces": ["packages/*"]`
- Скрипты используют `concurrently` для параллельного запуска
- Зависимости между пакетами через `file:` протокол

#### TypeScript конфигурация
- Path aliases: `@@convex/*`, `shared/*`
- Отдельные tsconfig.json для каждого пакета
- Кэш TypeScript добавлен в .gitignore

#### Convex обновления
- Исправлены deprecated API вызовы
- Добавлен @convex-dev/aggregate для случайного выбора
- Обновлена схема для поддержки видео

#### Импорты
- Обновлены все импорты для работы с новой структурой
- Использование path aliases вместо относительных путей
- Временно закомментированы проблемные Convex вызовы

### Проблемы и решения

#### Проблема: npm install с workspace протоколом
**Решение**: Использовать `file:` протокол вместо `workspace:*`

#### Проблема: TypeScript path resolution
**Решение**: Настроить path aliases в tsconfig.json каждого пакета

#### Проблема: Convex API вызовы
**Решение**: Временно закомментировать проблемные функции до полной миграции

#### Проблема: tsconfig.tsbuildinfo
**Решение**: Добавлен в .gitignore для исключения из git

### Следующие шаги

1. Исправить оставшиеся ошибки компиляции
2. Восстановить Convex API вызовы
3. Протестировать функциональность
4. Настроить shared типы
5. Добавить тесты и документацию 