#!/usr/bin/env tsx

async function quickCheck() {
  console.log('🔍 Быстрая проверка проекта\n');
  
  // 1. Проверка файлов
  const fs = require('fs');
  console.log('📁 Проверка ключевых файлов:');
  
  const files = [
    'src/lib/world-art-parser/parser.ts',
    'convex/schema.ts',
    'package.json'
  ];
  
  for (const file of files) {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file}`);
    } else {
      console.log(`❌ ${file}`);
    }
  }
  
  // 2. Проверка парсера
  console.log('\n🧪 Проверка парсера:');
  try {
    const { WorldArtParser } = await import('../src/lib/world-art-parser/parser');
    console.log('✅ Парсер импортируется успешно');
    
    const parser = new WorldArtParser({
      enableCache: true,
      requestTimeout: 5000,
    });
    console.log('✅ Парсер создается успешно');
    
  } catch (error: any) {
    console.log(`❌ Ошибка парсера: ${error.message}`);
  }
  
  // 3. Проверка package.json
  console.log('\n📦 Проверка зависимостей:');
  try {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    console.log(`✅ package.json корректен`);
    console.log(`✅ convex: ${pkg.dependencies.convex}`);
    console.log(`✅ tsx: ${pkg.devDependencies.tsx}`);
  } catch (error: any) {
    console.log(`❌ Ошибка package.json: ${error.message}`);
  }
  
  console.log('\n🎯 Следующие шаги:');
  console.log('1. Получить CONVEX_URL: npx convex dev');
  console.log('2. Протестировать парсер: npm run test:simple');
  console.log('3. Полная валидация: npm run validate:migration');
}

quickCheck().catch(console.error);
