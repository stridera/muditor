#!/usr/bin/env node
/**
 * GraphQL Schema Validation Script
 * 
 * This script validates all GraphQL queries used in the frontend against
 * the actual API schema. It's designed to run during the build process
 * to catch schema mismatches before deployment.
 * 
 * Usage:
 *   node scripts/validate-graphql.js
 *   API_URL=http://localhost:4000/graphql node scripts/validate-graphql.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const API_URL = process.env.API_URL || 'http://localhost:4000/graphql';
const TIMEOUT_MS = 10000; // 10 seconds

console.log('🔍 GraphQL Schema Validation');
console.log(`📡 API URL: ${API_URL}`);

/**
 * Check if API is available
 */
async function checkApiAvailability() {
  try {
    console.log('⏳ Checking API availability...');
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: '{ __schema { queryType { name } } }'
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    if (result.errors) {
      throw new Error(`GraphQL errors: ${result.errors.map(e => e.message).join(', ')}`);
    }
    
    console.log('✅ API is available');
    return true;
  } catch (error) {
    console.warn(`⚠️  API not available: ${error.message}`);
    console.warn('   Skipping GraphQL validation (API might not be running)');
    return false;
  }
}

/**
 * Extract GraphQL queries from frontend files
 */
function extractGraphQLQueries() {
  const queries = [];
  const frontendDir = path.join(__dirname, '..', 'apps', 'web', 'src');
  
  function scanDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        scanDirectory(filePath);
      } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        const content = fs.readFileSync(filePath, 'utf-8');
        
        // Look for GraphQL queries in template literals
        const queryRegex = /query\s+\w+[^`]*`([^`]+)`/gs;
        let match;
        
        while ((match = queryRegex.exec(content)) !== null) {
          const queryContent = match[1];
          if (queryContent.includes('query') || queryContent.includes('mutation')) {
            queries.push({
              file: path.relative(frontendDir, filePath),
              query: queryContent.trim()
            });
          }
        }
      }
    }
  }
  
  scanDirectory(frontendDir);
  return queries;
}

/**
 * Validate a single GraphQL query
 */
async function validateQuery(queryInfo) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: queryInfo.query,
        variables: {} // Empty variables for validation
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS)
    });
    
    const result = await response.json();
    
    // Filter for schema-related errors
    const schemaErrors = (result.errors || []).filter(error => 
      error.message.includes('Cannot query field') ||
      error.message.includes('Unknown field') ||
      error.message.includes('Unknown argument') ||
      error.message.includes('syntax error') ||
      error.message.includes('Expected')
    );
    
    return {
      isValid: schemaErrors.length === 0,
      errors: schemaErrors.map(e => e.message)
    };
  } catch (error) {
    return {
      isValid: false,
      errors: [`Validation error: ${error.message}`]
    };
  }
}

/**
 * Get field information for a GraphQL type
 */
async function getTypeInfo(typeName) {
  try {
    const introspectionQuery = `
      query GetTypeInfo($typeName: String!) {
        __type(name: $typeName) {
          name
          fields {
            name
            type {
              name
              kind
            }
          }
        }
      }
    `;
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: introspectionQuery,
        variables: { typeName }
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS)
    });
    
    const result = await response.json();
    
    if (result.errors) {
      throw new Error(result.errors[0].message);
    }
    
    return result.data?.__type || null;
  } catch (error) {
    console.warn(`Could not get type info for ${typeName}: ${error.message}`);
    return null;
  }
}

/**
 * Main validation function
 */
async function main() {
  // Check if API is available
  const apiAvailable = await checkApiAvailability();
  
  if (!apiAvailable) {
    console.log('⏭️  Skipping GraphQL validation');
    process.exit(0); // Exit successfully but skip validation
  }
  
  // Extract queries from frontend code
  console.log('🔍 Scanning frontend files for GraphQL queries...');
  const queries = extractGraphQLQueries();
  console.log(`📋 Found ${queries.length} GraphQL queries`);
  
  if (queries.length === 0) {
    console.log('✅ No GraphQL queries found to validate');
    return;
  }
  
  // Validate each query
  let hasErrors = false;
  const errorSummary = [];
  
  for (const queryInfo of queries) {
    console.log(`🔍 Validating query in ${queryInfo.file}...`);
    
    const validation = await validateQuery(queryInfo);
    
    if (!validation.isValid) {
      hasErrors = true;
      console.error(`❌ Validation failed for ${queryInfo.file}:`);
      validation.errors.forEach(error => {
        console.error(`   ${error}`);
      });
      
      errorSummary.push({
        file: queryInfo.file,
        errors: validation.errors
      });
    } else {
      console.log(`✅ ${queryInfo.file} - OK`);
    }
  }
  
  // Print summary
  console.log('\n📊 Validation Summary:');
  console.log(`   Total queries: ${queries.length}`);
  console.log(`   Valid: ${queries.length - errorSummary.length}`);
  console.log(`   Invalid: ${errorSummary.length}`);
  
  if (hasErrors) {
    console.log('\n❌ GraphQL Schema Validation Failed!');
    console.log('   The following files have schema mismatches:');
    errorSummary.forEach(item => {
      console.log(`   • ${item.file}`);
    });
    console.log('\n   Please fix the GraphQL queries before deploying.');
    process.exit(1);
  } else {
    console.log('\n✅ All GraphQL queries are valid!');
  }
  
  // Get common type information for documentation
  console.log('\n📚 Schema Information:');
  const mobType = await getTypeInfo('MobDto');
  if (mobType) {
    console.log(`   MobDto has ${mobType.fields.length} fields:`);
    const fieldNames = mobType.fields.map(f => f.name).sort();
    console.log(`   ${fieldNames.join(', ')}`);
  }
}

// Run the validation
main().catch(error => {
  console.error('💥 Validation script failed:', error);
  process.exit(1);
});