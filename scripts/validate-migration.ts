#!/usr/bin/env tsx
import { WorldArtParser } from '../src/lib/world-art-parser/parser';
import { ConvexReactClient } from "convex/react";

async function validateMigration() {
  console.log('🔍 Валидация миграции...\n');
  
  let allPassed = true;
  
  // 1. Проверка парсера World-Art
  console.log('1️⃣ Тестирование парсера World-Art');
  try {
    const parser = new WorldArtParser({
      enableCache: true,
      requestTimeout: 10000,
    });
    
    // Тестируем с простым ID
    const result = await parser.parseAnime(1);
    console.log(`✅ Парсер работает: найдено ${result.osts.length} OST`);
  } catch (error: any) {
    console.log(`❌ Парсер не работает: ${error.message}`);
    allPassed = false;
  }
  
  // 2. Проверка Convex подключения
  console.log('\n2️⃣ Тестирование Convex подключения');
  try {
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (convexUrl) {
      const convex = new ConvexReactClient(convexUrl);
      console.log('✅ Convex client создан успешно');
    } else {
      console.log('⚠️  NEXT_PUBLIC_CONVEX_URL не установлен');
    }
  } catch (error: any) {
    console.log(`❌ Ошибка Convex: ${error.message}`);
    allPassed = false;
  }
  
  // 3. Проверка структуры файлов
  console.log('\n3️⃣ Проверка структуры файлов');
  const fs = require('fs');
  const requiredFiles = [
    'src/lib/world-art-parser/index.ts',
    'src/lib/world-art-parser/parser.ts',
    'src/lib/world-art-parser/types.ts',
    'src/lib/world-art-parser/config.ts',
    'src/lib/world-art-parser/cache.ts',
    'convex/schema.ts',
    'convex/worldArt.ts',
    'convex/telegram.ts',
    'convex/http.ts',
  ];
  
  for (const file of requiredFiles) {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file}`);
    } else {
      console.log(`❌ ${file} - файл отсутствует`);
      allPassed = false;
    }
  }
  
  // 4. Проверка зависимостей
  console.log('\n4️⃣ Проверка зависимостей');
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    const requiredDeps = ['convex', 'cheerio'];
    const requiredDevDeps = ['tsx', '@types/cheerio'];
    
    for (const dep of requiredDeps) {
      if (packageJson.dependencies[dep]) {
        console.log(`✅ ${dep}: ${packageJson.dependencies[dep]}`);
      } else {
        console.log(`❌ ${dep} - отсутствует в dependencies`);
        allPassed = false;
      }
    }
    
    for (const dep of requiredDevDeps) {
      if (packageJson.devDependencies[dep]) {
        console.log(`✅ ${dep}: ${packageJson.devDependencies[dep]}`);
      } else {
        console.log(`❌ ${dep} - отсутствует в devDependencies`);
        allPassed = false;
      }
    }
  } catch (error) {
    console.log(`❌ Ошибка чтения package.json: ${error.message}`);
    allPassed = false;
  }
  
  // 5. Проверка environment variables
  console.log('\n5️⃣ Проверка environment variables');
  const envVars = {
    'NEXT_PUBLIC_CONVEX_URL': process.env.NEXT_PUBLIC_CONVEX_URL,
    'TELEGRAM_BOT_TOKEN': process.env.TELEGRAM_BOT_TOKEN,
    'TELEGRAM_GAME_SHORT_NAME': process.env.TELEGRAM_GAME_SHORT_NAME,
  };
  
  for (const [key, value] of Object.entries(envVars)) {
    if (value) {
      console.log(`✅ ${key}: установлен`);
    } else {
      console.log(`⚠️  ${key}: не установлен`);
    }
  }
  
  console.log('\n📈 Результат валидации:');
  if (allPassed) {
    console.log('🎉 Все проверки пройдены успешно!');
    console.log('\nСледующие шаги:');
    console.log('1. Установите NEXT_PUBLIC_CONVEX_URL в .env.local');
    console.log('2. Запустите: npx convex dev');
    console.log('3. Интегрируйте парсер с Convex functions');
    console.log('4. Обновите клиентский код для использования Convex');
  } else {
    console.log('❌ Есть проблемы, которые нужно исправить');
  }
  
  return allPassed;
}

if (require.main === module) {
  validateMigration().then(success => {
    process.exit(success ? 0 : 1);
  });
}
