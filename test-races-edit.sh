#!/bin/bash

# Test script for Races Edit operations
# Tests: Read and Update (no create/delete for races)

set -e  # Exit on error

API_URL="http://localhost:4000/graphql"

echo "=== Testing Races Edit Operations ==="
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

# Get all races to pick one to test
echo "2. Fetching races list..."
RACES_RESULT=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $GOD_TOKEN" \
  -d "{\"query\": \"query { races { race name displayName playable humanoid magical maxStrength expFactor hpFactor } }\"}")

RACE_ENUM=$(echo "$RACES_RESULT" | jq -r '.data.races[0].race')
RACE_NAME=$(echo "$RACES_RESULT" | jq -r '.data.races[0].name')

if [ "$RACE_ENUM" == "null" ] || [ -z "$RACE_ENUM" ]; then
  echo "   ❌ Failed to fetch races"
  echo "$RACES_RESULT" | jq '.'
  exit 1
fi
echo "   ✅ Found race to test: $RACE_NAME (enum: $RACE_ENUM)"
echo ""

# Read the race details
echo "3. Reading race details..."
READ_RESULT=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $GOD_TOKEN" \
  -d "{\"query\": \"query GetRace(\$race: Race!) { race(race: \$race) { race name playable humanoid magical maxStrength maxDexterity maxIntelligence maxWisdom maxConstitution maxCharisma expFactor hpFactor } }\",
       \"variables\": {\"race\": \"$RACE_ENUM\"}}")

ORIGINAL_PLAYABLE=$(echo "$READ_RESULT" | jq -r '.data.race.playable')
ORIGINAL_MAX_STR=$(echo "$READ_RESULT" | jq -r '.data.race.maxStrength')
ORIGINAL_EXP=$(echo "$READ_RESULT" | jq -r '.data.race.expFactor')

if [ "$ORIGINAL_MAX_STR" == "null" ]; then
  echo "   ❌ Failed to read race"
  echo "$READ_RESULT" | jq '.'
  exit 1
fi
echo "   ✅ Retrieved race: $RACE_NAME"
echo "      Original - Playable: $ORIGINAL_PLAYABLE, MaxStr: $ORIGINAL_MAX_STR, ExpFactor: $ORIGINAL_EXP"
echo ""

# Update the race (modify stats temporarily)
echo "4. Updating race stats..."
NEW_MAX_STR=$((ORIGINAL_MAX_STR + 1))
NEW_EXP=$((ORIGINAL_EXP + 5))

UPDATE_RESULT=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $GOD_TOKEN" \
  -d "{\"query\": \"mutation UpdateRace(\$race: Race!, \$data: UpdateRaceInput!) { updateRace(race: \$race, data: \$data) { race name maxStrength expFactor } }\",
       \"variables\": {\"race\": \"$RACE_ENUM\", \"data\": {\"maxStrength\": $NEW_MAX_STR, \"expFactor\": $NEW_EXP}}}")

UPDATED_MAX_STR=$(echo "$UPDATE_RESULT" | jq -r '.data.updateRace.maxStrength')
UPDATED_EXP=$(echo "$UPDATE_RESULT" | jq -r '.data.updateRace.expFactor')

if [ "$UPDATED_MAX_STR" != "$NEW_MAX_STR" ]; then
  echo "   ❌ Failed to update race"
  echo "$UPDATE_RESULT" | jq '.'
  exit 1
fi
echo "   ✅ Updated race: MaxStr=$UPDATED_MAX_STR, ExpFactor=$UPDATED_EXP"
echo ""

# Restore original values
echo "5. Restoring original values..."
RESTORE_RESULT=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $GOD_TOKEN" \
  -d "{\"query\": \"mutation UpdateRace(\$race: Race!, \$data: UpdateRaceInput!) { updateRace(race: \$race, data: \$data) { race name maxStrength expFactor } }\",
       \"variables\": {\"race\": \"$RACE_ENUM\", \"data\": {\"maxStrength\": $ORIGINAL_MAX_STR, \"expFactor\": $ORIGINAL_EXP}}}")

RESTORED_MAX_STR=$(echo "$RESTORE_RESULT" | jq -r '.data.updateRace.maxStrength')
RESTORED_EXP=$(echo "$RESTORE_RESULT" | jq -r '.data.updateRace.expFactor')

if [ "$RESTORED_MAX_STR" != "$ORIGINAL_MAX_STR" ]; then
  echo "   ❌ Failed to restore original values"
  echo "$RESTORE_RESULT" | jq '.'
  exit 1
fi
echo "   ✅ Restored original values: MaxStr=$RESTORED_MAX_STR, ExpFactor=$RESTORED_EXP"
echo ""

echo "=== ✅ All edit operations successful ==="
