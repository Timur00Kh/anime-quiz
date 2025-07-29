// Простой тест парсера без Convex зависимостей
import { WorldArtParser } from '../src/lib/world-art-parser/parser';

async function simpleTest() {
  console.log('🧪 Простой тест парсера World-Art\n');
  
  const parser = new WorldArtParser({
    enableCache: true,
    requestTimeout: 10000,
  });

  // Попробуем несколько разных ID
  const testIds = [1, 10, 100, 1000];
  
  for (const waId of testIds) {
    console.log(`\n📊 Тестируем ID: ${waId}`);
    
    try {
      const startTime = Date.now();
      const result = await parser.parseAnime(waId);
      const duration = Date.now() - startTime;
      
      console.log(`✅ Успешно за ${duration}ms`);
      console.log(`📊 Найдено OST: ${result.osts.length}`);
      
      if (result.osts.length > 0) {
        console.log('🎵 Найденные OST:');
        result.osts.forEach((ost, i) => {
          console.log(`  ${i + 1}. ${ost.title} (${ost.type})`);
        });
        
        // Если нашли OST, останавливаемся
        console.log('\n🎉 Найден рабочий ID!');
        return waId;
      }
    } catch (error: any) {
      console.log(`❌ Ошибка: ${error.message}`);
    }
  }
  
  console.log('\n⚠️  Не найден рабочий ID');
  return null;
}

if (require.main === module) {
  simpleTest().then(workingId => {
    if (workingId) {
      console.log(`\n✅ Рабочий ID найден: ${workingId}`);
      console.log('Можете использовать его для дальнейших тестов');
    } else {
      console.log('\n❌ Не найден рабочий ID');
    }
  }).catch(error => {
    console.error('Fatal error:', error);
  });
}
