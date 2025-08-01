# Anime Quiz Monorepo

Монорепа для проекта Anime Quiz с использованием npm workspaces.

## Структура проекта

```
anime-quiz/
├── packages/
│   ├── web/                 # Next.js фронтенд
│   ├── shiki-api/          # Shiki API микросервис
│   ├── convex-backend/     # Convex функции
│   ├── world-art-parser/   # Парсер World-Art
│   └── shared/             # Общие типы и утилиты
├── package.json            # Корневой package.json
└── README.md
```

## Пакеты

### `web` - Next.js фронтенд
- React приложение с Chakra UI
- Страницы для поиска аниме и просмотра OST
- Интеграция с Convex для данных

### `shiki-api` - Shiki API микросервис
- Express.js сервер
- Прокси для Shikimori API
- Кеширование и обработка ошибок

### `convex-backend` - Convex функции
- База данных и бизнес-логика
- Парсинг World-Art
- Управление OST квизами

### `world-art-parser` - Парсер World-Art
- Парсинг OST с World-Art.ru
- Кеширование результатов
- Типизированные интерфейсы
- Утилиты для работы с OST

### `shared` - Общие типы
- TypeScript интерфейсы
- Константы и утилиты
- Переиспользуемые типы

## Разработка

### Установка зависимостей
```bash
npm install
```

### Запуск всех сервисов
```bash
npm run dev
```

### Запуск отдельных сервисов
```bash
# Только фронтенд
npm run dev:web

# Только Shiki API
npm run dev:shiki

# Только Convex
npm run dev:convex
```

### Сборка
```bash
# Все пакеты
npm run build

# Отдельные пакеты
npm run build:web
npm run build:shiki
```

## Порты

- **Web**: http://localhost:3000
- **Shiki API**: http://localhost:3001
- **Convex**: Автоматически настраивается

## Переменные окружения

Создайте `.env` файлы в соответствующих пакетах:

### packages/web/.env.local
```
NEXT_PUBLIC_CONVEX_URL=your_convex_url
```

### packages/shiki-api/.env
```
PORT=3001
NODE_ENV=development
```

### packages/convex-backend/.env
```
CONVEX_DEPLOY_KEY=your_deploy_key
```

## Архитектура

### Коммуникация между сервисами
1. **Web ↔ Convex**: Прямое подключение через Convex клиент
2. **Web ↔ Shiki API**: HTTP запросы к Express серверу
3. **Convex ↔ Shiki API**: HTTP запросы из Convex actions

### Переиспользование кода
- Общие типы в `shared` пакете
- Утилиты для работы с API
- Константы и конфигурации

## Развертывание

### Convex
```bash
cd packages/convex-backend
npm run deploy
```

### Shiki API
```bash
cd packages/shiki-api
npm run build
npm start
```

### Web
```bash
cd packages/web
npm run build
npm start
```

## Добавление новых пакетов

1. Создайте папку в `packages/`
2. Добавьте `package.json` с именем пакета
3. Обновите корневой `package.json` если нужно
4. Установите зависимости: `npm install`

## Полезные команды

```bash
# Установка зависимостей для всех пакетов
npm install

# Запуск тестов во всех пакетах
npm run test

# Линтинг всех пакетов
npm run lint

# Очистка node_modules
npm run clean
```
