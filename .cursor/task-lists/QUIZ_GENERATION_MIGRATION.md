# OST Quiz Generation Migration to Convex

Перенос логики генерации OST квиза из клиентской части в Convex action с созданием сущностей Question и Quiz в базе данных.

## Completed Tasks

- [x] Анализ текущей структуры генерации квиза
- [x] Создание таск листа для миграции
- [x] Создание схемы БД для OST Quiz и Question сущностей
- [x] Создание типов для OST Quiz и Question в Convex
- [x] Создание отдельного API класса `convex/shikiAPI.ts` с rate limiting (3 RPS, 25 RPM)
- [x] Реализация Convex action для генерации OST квиза
- [x] Создание Convex query для получения OST квиза по ID
- [x] Создание Convex query для получения случайного OST квиза
- [x] Создание клиентского API для работы с Convex
- [x] Оптимизация генерации квиза: 80% существующих вопросов + 20% новых

## In Progress Tasks

- [x] Обновление клиентского кода для использования Convex
- [x] Замена клиентской генерации на новую Convex версию
- [x] Исправление ошибки схемы Convex (_creationTime в индексах)
- [x] Разделение логики на actions и mutations
- [ ] Исправление оставшихся ошибок типизации

## Future Tasks

- [ ] Исправление оставшихся ошибок типизации в Convex функциях
- [ ] Добавление кеширования популярных OST квизов
- [ ] Тестирование новой архитектуры
- [ ] Оптимизация производительности

## Implementation Plan

### Архитектура

1. **Схема БД:**
   - `ostQuizzes` - таблица для хранения OST квизов
   - `ostQuestions` - таблица для хранения отдельных вопросов (переиспользуемых)
   - `ostQuizQuestions` - связующая таблица между квизами и вопросами
   - `ostQuizResults` - таблица для результатов квизов

2. **Convex Functions:**
   - `generateOstQuiz` (action) - генерация нового OST квиза
   - `createOstQuestion` (mutation) - создание отдельного вопроса
   - `findExistingQuestions` (query) - поиск существующих вопросов
   - `getOstQuiz` (query) - получение OST квиза по ID
   - `getRandomOstQuiz` (query) - получение случайного OST квиза

3. **Клиентские изменения:**
   - Обновление `ostAPI.ts` для использования Convex
   - Обновление компонентов OST квиза для работы с новой архитектурой

### Relevant Files

- `convex/schema.ts` - Схема БД для OST Quiz и Question
- `convex/ostQuiz.ts` - Convex функции для работы с OST квизами
- `convex/ostQuizTypes.ts` - Типы для OST Quiz и Question
- `src/utils/ostAPI.ts` - Обновление для использования Convex
- `src/components/OstQuiz/` - Обновление компонентов OST квиза

### Технические детали

- Использование Convex action для HTTP запросов к Shiki API и World-Art
- Кеширование результатов для оптимизации
- Валидация данных с помощью Convex validators
- Индексы для быстрого поиска OST квизов
- Интеграция с существующей системой парсинга World-Art
- Переиспользование вопросов между квизами для оптимизации
- Отслеживание использования вопросов (usageCount) 