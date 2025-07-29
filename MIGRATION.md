# Anime Quiz - Миграция на Convex

## 🎯 Текущий статус: 70% завершено

Основная архитектура мигрирована с Supabase на Convex с выделением парсера World-Art в независимый модуль.

## 🏗️ Архитектура

### Независимый модуль парсера
```
src/lib/world-art-parser/
├── index.ts        # Главный экспорт и алиасы
├── parser.ts       # Основная логика парсинга WA
├── types.ts        # Полная типизация
├── config.ts       # Конфигурация для разных окружений
└── cache.ts        # Система кеширования с TTL
```

### Convex Backend
```
convex/
├── schema.ts       # Схема БД (waParseLog, quizResults)
├── worldArt.ts     # Functions для работы с парсером
├── telegram.ts     # Telegram webhook handlers
├── http.ts         # HTTP endpoints
└── convex.json     # Конфигурация
```

## 🚀 Быстрый старт

### Разработка
```bash
# Параллельный запуск Next.js + Convex
npm run dev

# Только Convex
npm run convex:dev

# Только Next.js
npm run next:dev
```

### Тестирование парсера
```bash
# Быстрый тест с поиском рабочих ID
npm run test:simple

# Тест с конкретным World-Art ID
npm run test:parser 123

# Валидация всей миграции
npm run validate:migration

# Очистка кеша парсера
npm run parser:clear-cache
```

## 📋 Environment Variables

Требуемые переменные в `.env.local`:

```bash
# Convex
NEXT_PUBLIC_CONVEX_URL=http://127.0.0.1:3210  # для dev
CONVEX_DEPLOYMENT=your-deployment-name

# Telegram
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_GAME_SHORT_NAME=your_game_name

# Временно оставляем Supabase (до полной миграции)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

## 🔧 Завершение миграции

### 1. Интеграция парсера с Convex
Решить проблемы с зависимостями и добавить парсер в Convex actions:

```typescript
// convex/worldArt.ts
import { WorldArtParser } from "../src/lib/world-art-parser";

export const parseWorldArt = action({
  args: { waId: v.number() },
  handler: async (ctx, { waId }) => {
    const parser = new WorldArtParser();
    const result = await parser.parseAnime(waId);
    // ... сохранение в БД
  },
});
```

### 2. Обновление клиентского кода

#### src/app/layout.tsx
```typescript
import { ConvexProvider } from "convex/react";
import { convex } from "@/utils/convex";

export default function RootLayout({ children }) {
  return (
    <ConvexProvider client={convex}>
      <ChakraProvider>
        {children}
      </ChakraProvider>
    </ConvexProvider>
  );
}
```

#### Замена API calls на Convex hooks
```typescript
// Было
const response = await fetch('/api/getOst?waId=123');

// Стало
import { useAction } from "convex/react";
import { api } from "@/utils/convex";

const parseWorldArt = useAction(api.worldArt.parseWorldArt);
const result = await parseWorldArt({ waId: 123 });
```

### 3. Удаление Supabase
```bash
# Удалить файлы
rm -rf supabase/
rm src/utils/supabase.ts

# Удалить зависимости
npm uninstall @supabase/supabase-js

# Обновить импорты
find src/ -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|@/utils/supabase|@/utils/convex|g'
```

## 🧪 Тестирование

### Парсер World-Art
```bash
# Тест независимого модуля
npx tsx scripts/simple-test.ts

# Полное тестирование
npx tsx scripts/test-parser.ts 123
```

### Convex Functions
```bash
# Dashboard
npx convex dashboard

# Логи
npx convex logs

# Health check
curl http://127.0.0.1:3210/health
```

## 📊 CLI Утилиты

- `scripts/test-parser.ts` - Полное тестирование парсера с прогрессом
- `scripts/simple-test.ts` - Быстрый поиск рабочих World-Art ID
- `scripts/validate-migration.ts` - Валидация всех компонентов
- `scripts/quick-check.ts` - Быстрая проверка состояния

## 🔍 Отладка

### Проблемы с парсером
```bash
# Проверка импортов
npm run test:simple

# Очистка кеша
npm run parser:clear-cache
```

### Проблемы с Convex
```bash
# Проверка деплоя
npx convex dev --once

# Логи functions
npx convex logs --tail
```

## 🎉 Преимущества новой архитектуры

1. **Модульность** - парсер можно использовать отдельно
2. **Type Safety** - полная типизация от DB до UI
3. **Реактивность** - автоматические обновления UI
4. **Производительность** - встроенное кеширование
5. **Developer Experience** - hot reload для backend
6. **Тестируемость** - независимые модули

## 📚 Дополнительные ресурсы

- [Convex Documentation](https://docs.convex.dev/)
- [Convex React Integration](https://docs.convex.dev/client/react)
- [TypeScript in Convex](https://docs.convex.dev/typescript)

---

**🔥 Основная миграция завершена! Остались интеграционные задачи.**
