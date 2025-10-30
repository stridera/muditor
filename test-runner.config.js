/**
 * Comprehensive Test Runner Configuration
 * Coordinates data integrity tests across all layers
 */

const { execSync } = require('child_process');
const path = require('path');

const testSuites = {
  'Database Layer': {
    description: 'Tests seeded data integrity and database constraints',
    command: 'cd packages/db && npm run test -- --testPathPattern=seed-data-integrity.spec.ts',
    timeout: 60000,
    dependencies: ['database-seeded']
  },
  
  'API Layer': {
    description: 'Tests API data round-trips and GraphQL integrity',
    command: 'cd apps/api && npm run test -- --testPathPattern=data-integrity.spec.ts',
    timeout: 120000,
    dependencies: ['database-seeded', 'api-server']
  },
  
  'UI Layer': {
    description: 'Tests frontend data display accuracy',
    command: 'cd apps/web && npm run test -- --testPathPattern=ui-data-display.spec.ts',
    timeout: 90000,
    dependencies: []
  }
};

class TestRunner {
  constructor() {
    this.results = {};
    this.startTime = Date.now();
  }

  async runSuite(suiteName, config) {
    console.log(`\n🧪 Running ${suiteName}...`);
    console.log(`   ${config.description}`);
    
    const suiteStartTime = Date.now();
    
    try {
      const output = execSync(config.command, {
        timeout: config.timeout,
        encoding: 'utf8',
        cwd: process.cwd()
      });
      
      const duration = Date.now() - suiteStartTime;
      
      this.results[suiteName] = {
        status: 'PASSED',
        duration,
        output: this.extractTestSummary(output)
      };
      
      console.log(`   ✅ PASSED (${duration}ms)`);
      
    } catch (error) {
      const duration = Date.now() - suiteStartTime;
      
      this.results[suiteName] = {
        status: 'FAILED',
        duration,
        error: error.message,
        output: error.stdout || error.message
      };
      
      console.log(`   ❌ FAILED (${duration}ms)`);
      console.log(`   Error: ${error.message.split('\n')[0]}`);
    }
  }

  extractTestSummary(output) {
    const lines = output.split('\n');
    const summary = lines.find(line => 
      line.includes('Tests:') || 
      line.includes('Test Suites:') ||
      line.includes('passed') ||
      line.includes('failed')
    );
    return summary || 'Test completed';
  }

  async checkPrerequisites() {
    console.log('🔍 Checking prerequisites...');
    
    const checks = [
      {
        name: 'Database Connection',
        check: () => execSync('cd packages/db && npx prisma db pull --schema=./prisma/schema.prisma', { timeout: 10000 })
      },
      {
        name: 'Database Seeded',
        check: () => execSync('cd packages/db && npx prisma db seed', { timeout: 30000 })
      }
    ];

    for (const { name, check } of checks) {
      try {
        check();
        console.log(`   ✅ ${name}`);
      } catch (error) {
        console.log(`   ❌ ${name} - ${error.message.split('\n')[0]}`);
        throw new Error(`Prerequisite failed: ${name}`);
      }
    }
  }

  printResults() {
    const totalDuration = Date.now() - this.startTime;
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 DATA INTEGRITY TEST RESULTS');
    console.log('='.repeat(60));
    
    const passed = Object.values(this.results).filter(r => r.status === 'PASSED').length;
    const failed = Object.values(this.results).filter(r => r.status === 'FAILED').length;
    
    console.log(`\nOverall: ${passed} passed, ${failed} failed (${totalDuration}ms total)`);
    
    for (const [suiteName, result] of Object.entries(this.results)) {
      const status = result.status === 'PASSED' ? '✅' : '❌';
      console.log(`\n${status} ${suiteName} (${result.duration}ms)`);
      
      if (result.status === 'PASSED') {
        console.log(`   ${result.output}`);
      } else {
        console.log(`   ERROR: ${result.error?.split('\n')[0] || 'Unknown error'}`);
      }
    }

    if (failed === 0) {
      console.log('\n🎉 All data integrity tests passed!');
      console.log('✨ Data consistency verified across all layers.');
    } else {
      console.log(`\n⚠️  ${failed} test suite(s) failed.`);
      console.log('🔧 Review the errors above and fix data integrity issues.');
    }
    
    console.log('\n' + '='.repeat(60));
  }

  async run() {
    console.log('🚀 Starting Comprehensive Data Integrity Tests');
    console.log('   Verifying data consistency across Database → API → UI');
    
    try {
      await this.checkPrerequisites();
      
      for (const [suiteName, config] of Object.entries(testSuites)) {
        await this.runSuite(suiteName, config);
      }
      
    } catch (error) {
      console.log(`\n💥 Prerequisites failed: ${error.message}`);
      process.exit(1);
    }
    
    this.printResults();
    
    const failed = Object.values(this.results).filter(r => r.status === 'FAILED').length;
    process.exit(failed > 0 ? 1 : 0);
  }
}

// Additional utility functions
const utils = {
  generateTestReport() {
    const timestamp = new Date().toISOString();
    return {
      timestamp,
      testSuites: Object.keys(testSuites),
      purpose: 'Verify data integrity across Database, API, and UI layers',
      coverage: [
        'Database seeded data validation',
        'API GraphQL round-trip integrity', 
        'UI component data display accuracy',
        'Flag mapping consistency',
        'Cross-entity relationship integrity',
        'Type-specific property preservation'
      ]
    };
  },

  async quickCheck() {
    console.log('⚡ Quick Data Integrity Check');
    
    try {
      // Quick database count check
      const dbCheck = execSync('cd packages/db && npx tsx -e "import {PrismaClient} from \'@prisma/client\'; const p = new PrismaClient(); p.zone.count().then(c => console.log(`Zones: ${c}`)); p.mob.count().then(c => console.log(`Mobs: ${c}`)); p.object.count().then(c => console.log(`Objects: ${c}`)); p.$disconnect();"', { encoding: 'utf8', timeout: 10000 });
      
      console.log('📊 Database Status:');
      console.log(dbCheck.trim().split('\n').map(line => `   ${line}`).join('\n'));
      
    } catch (error) {
      console.log('❌ Quick check failed:', error.message.split('\n')[0]);
    }
  }
};

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const runner = new TestRunner();
  
  if (args.includes('--quick')) {
    utils.quickCheck();
  } else if (args.includes('--report')) {
    console.log(JSON.stringify(utils.generateTestReport(), null, 2));
  } else {
    runner.run();
  }
}

module.exports = { TestRunner, testSuites, utils };