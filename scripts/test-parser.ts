#!/usr/bin/env tsx
import { WorldArtParser, parseAnime, getCacheStats, clearCache } from '../src/lib/world-art-parser';
import type { ParseProgress } from '../src/lib/world-art-parser';

interface TestConfig {
  waId: number;
  expectedOstCount?: number;
  expectedTypes?: string[];
}

// Тест-кейсы с реальными World-Art ID
const TEST_CASES: TestConfig[] = [
  // Добавьте сюда реальные World-Art ID после проверки
  // { waId: 12345, expectedOstCount: 2, expectedTypes: ['OP', 'ED'] },
];

// Fallback для быстрого тестирования - используем популярное аниме
// Например, Naruto может иметь ID около 83 или Attack on Titan около 18000
const QUICK_TEST_ID = 83; // Примерный ID для тестирования

async function testSingleAnime(config: TestConfig) {
  console.log(`\n🧪 Testing WA ID: ${config.waId}`);
  
  try {
    const startTime = Date.now();
    
    // Создаем парсер с настройками для тестирования
    const parser = new WorldArtParser({
      enableCache: true,
      requestTimeout: 15000, // Увеличиваем таймаут для тестов
    });

    const result = await parser.parseAnime(config.waId, (progress: ParseProgress) => {
      process.stdout.write(`\r  📊 ${progress.phase}: ${progress.current}/${progress.total} - ${progress.message || ''}`);
    });

    const duration = Date.now() - startTime;
    console.log(`\n✅ Parsed in ${duration}ms`);
    console.log(`📊 Found ${result.osts.length} OSTs`);
    
    // Проверяем ожидаемое количество
    if (config.expectedOstCount && result.osts.length !== config.expectedOstCount) {
      console.log(`⚠️  Expected ${config.expectedOstCount} OSTs, got ${result.osts.length}`);
    }

    // Показываем найденные OST
    result.osts.forEach((ost, i) => {
      console.log(`  ${i + 1}. ${ost.title} (${ost.type})`);
      if (ost.downloadError) {
        console.log(`     ❌ Error: ${ost.downloadError}`);
      }
    });

    // Проверяем типы
    if (config.expectedTypes) {
      const foundTypes = result.osts.map(ost => ost.type);
      const missingTypes = config.expectedTypes.filter(type => !foundTypes.includes(type));
      if (missingTypes.length > 0) {
        console.log(`⚠️  Missing expected types: ${missingTypes.join(', ')}`);
      }
    }

    return true;
  } catch (error: any) {
    console.log(`\n❌ Error: ${error.message}`);
    if (error.code) {
      console.log(`   Code: ${error.code}`);
    }
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting World-Art Parser Tests\n');
  
  if (TEST_CASES.length === 0) {
    console.log('⚠️  No test cases defined. Using quick test with ID:', QUICK_TEST_ID);
    const success = await testSingleAnime({ waId: QUICK_TEST_ID });
    return success;
  }
  
  let passed = 0;
  let failed = 0;

  for (const testCase of TEST_CASES) {
    const success = await testSingleAnime(testCase);
    if (success) {
      passed++;
    } else {
      failed++;
    }
  }

  console.log('\n📈 Test Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  
  // Показываем статистику кеша
  const cacheStats = getCacheStats();
  console.log(`\n💾 Cache Stats: ${cacheStats.size} entries`);

  return failed === 0;
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    runAllTests().then(success => {
      process.exit(success ? 0 : 1);
    });
  } else if (args[0] === 'clear-cache') {
    clearCache();
    console.log('✅ Cache cleared');
  } else {
    const waId = parseInt(args[0]);
    if (isNaN(waId)) {
      console.error('Usage: test-parser [waId] | clear-cache');
      process.exit(1);
    }
    
    testSingleAnime({ waId }).then(success => {
      process.exit(success ? 0 : 1);
    });
  }
}
