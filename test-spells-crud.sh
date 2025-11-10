#!/bin/bash

# Test script for Spells CRUD operations
# Tests: Create, Read, Update, Delete, and Verify deletion

set -e  # Exit on error

API_URL="http://localhost:4000/graphql"

echo "=== Testing Spells CRUD Operations ==="
echo ""

# Login as GOD user
echo "1. Logging in as GOD user..."
GOD_LOGIN=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{\"query\": \"mutation { login(input: { identifier: \\\"admin@muditor.dev\\\", password: \\\"admin123\\\" }) { accessToken user { role } } }\"}")

GOD_TOKEN=$(echo "$GOD_LOGIN" | jq -r '.data.login.accessToken')
GOD_ROLE=$(echo "$GOD_LOGIN" | jq -r '.data.login.user.role')

if [ "$GOD_TOKEN" == "null" ] || [ -z "$GOD_TOKEN" ]; then
  echo "   ❌ Failed to login"
  echo "$GOD_LOGIN" | jq '.'
  exit 1
fi
echo "   ✅ Logged in as $GOD_ROLE"
echo ""

# Create a new test spell
echo "2. Creating a new test spell..."
TIMESTAMP=$(date +%s)
TEST_SPELL_NAME="Test Spell $TIMESTAMP"

CREATE_RESULT=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $GOD_TOKEN" \
  -d "{\"query\": \"mutation CreateSpell(\$data: CreateSpellInput!) { createSpell(data: \$data) { id name minPosition violent castTimeRounds cooldownMs inCombatOnly isArea notes } }\",
       \"variables\": {\"data\": {\"name\": \"$TEST_SPELL_NAME\", \"minPosition\": \"STANDING\", \"violent\": true, \"castTimeRounds\": 2, \"cooldownMs\": 5000, \"inCombatOnly\": false, \"isArea\": false, \"notes\": \"Test spell for CRUD verification\"}}}")

SPELL_ID=$(echo "$CREATE_RESULT" | jq -r '.data.createSpell.id')
SPELL_NAME=$(echo "$CREATE_RESULT" | jq -r '.data.createSpell.name')

if [ "$SPELL_ID" == "null" ] || [ -z "$SPELL_ID" ]; then
  echo "   ❌ Failed to create spell"
  echo "$CREATE_RESULT" | jq '.'
  exit 1
fi
echo "   ✅ Created spell: $SPELL_NAME (ID: $SPELL_ID)"
echo ""

# Read the created spell
echo "3. Reading the created spell..."
READ_RESULT=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $GOD_TOKEN" \
  -d "{\"query\": \"query GetSpell(\$id: ID!) { spell(id: \$id) { id name minPosition violent castTimeRounds cooldownMs } }\",
       \"variables\": {\"id\": \"$SPELL_ID\"}}")

READ_NAME=$(echo "$READ_RESULT" | jq -r '.data.spell.name')
READ_VIOLENT=$(echo "$READ_RESULT" | jq -r '.data.spell.violent')

if [ "$READ_NAME" != "$SPELL_NAME" ]; then
  echo "   ❌ Failed to read spell correctly"
  echo "$READ_RESULT" | jq '.'
  exit 1
fi
echo "   ✅ Retrieved spell: $READ_NAME (Violent: $READ_VIOLENT)"
echo ""

# Update the spell
echo "4. Updating the spell..."
UPDATE_RESULT=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $GOD_TOKEN" \
  -d "{\"query\": \"mutation UpdateSpell(\$id: ID!, \$data: UpdateSpellInput!) { updateSpell(id: \$id, data: \$data) { id name violent castTimeRounds cooldownMs isArea notes } }\",
       \"variables\": {\"id\": \"$SPELL_ID\", \"data\": {\"violent\": false, \"castTimeRounds\": 3, \"cooldownMs\": 10000, \"isArea\": true, \"notes\": \"Updated test spell\"}}}")

UPDATED_VIOLENT=$(echo "$UPDATE_RESULT" | jq -r '.data.updateSpell.violent')
UPDATED_ROUNDS=$(echo "$UPDATE_RESULT" | jq -r '.data.updateSpell.castTimeRounds')
UPDATED_AREA=$(echo "$UPDATE_RESULT" | jq -r '.data.updateSpell.isArea')

if [ "$UPDATED_VIOLENT" != "false" ]; then
  echo "   ❌ Failed to update spell"
  echo "$UPDATE_RESULT" | jq '.'
  exit 1
fi
echo "   ✅ Updated spell: violent=$UPDATED_VIOLENT, castTime=$UPDATED_ROUNDS rounds, isArea=$UPDATED_AREA"
echo ""

# Delete the test spell
echo "5. Deleting the test spell..."
DELETE_RESULT=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $GOD_TOKEN" \
  -d "{\"query\": \"mutation DeleteSpell(\$id: ID!) { deleteSpell(id: \$id) }\",
       \"variables\": {\"id\": \"$SPELL_ID\"}}")

DELETE_SUCCESS=$(echo "$DELETE_RESULT" | jq -r '.data.deleteSpell')

if [ "$DELETE_SUCCESS" != "true" ]; then
  echo "   ❌ Failed to delete spell"
  echo "$DELETE_RESULT" | jq '.'
  exit 1
fi
echo "   ✅ Deleted spell: $DELETE_SUCCESS"
echo ""

# Verify deletion
echo "6. Verifying deletion..."
VERIFY_RESULT=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $GOD_TOKEN" \
  -d "{\"query\": \"query GetSpell(\$id: ID!) { spell(id: \$id) { id name } }\",
       \"variables\": {\"id\": \"$SPELL_ID\"}}")

VERIFY_ERROR=$(echo "$VERIFY_RESULT" | jq -r '.errors[0].message // "none"')

if [ "$VERIFY_ERROR" == "none" ]; then
  VERIFY_NAME=$(echo "$VERIFY_RESULT" | jq -r '.data.spell.name // "null"')
  if [ "$VERIFY_NAME" != "null" ]; then
    echo "   ❌ Spell still exists after deletion"
    echo "$VERIFY_RESULT" | jq '.'
    exit 1
  fi
fi
echo "   ✅ Spell correctly not found after deletion"
echo ""

echo "=== ✅ All CRUD operations successful ==="
