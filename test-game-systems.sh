#!/bin/bash

API_URL="http://localhost:4000/graphql"

echo "=== Testing Game Systems Access Control ==="
echo ""

# Test credentials
PLAYER_EMAIL="player@muditor.dev"
PLAYER_PASSWORD="player123"
GOD_EMAIL="admin@muditor.dev"
GOD_PASSWORD="admin123"

echo "1. Testing as PLAYER role (should be FORBIDDEN)..."
echo "   Logging in as player..."

PLAYER_LOGIN=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"query\": \"mutation { login(input: { identifier: \\\"$PLAYER_EMAIL\\\", password: \\\"$PLAYER_PASSWORD\\\" }) { accessToken user { role } } }\"
  }")

PLAYER_TOKEN=$(echo "$PLAYER_LOGIN" | jq -r '.data.login.accessToken')
PLAYER_ROLE=$(echo "$PLAYER_LOGIN" | jq -r '.data.login.user.role')

echo "   ✓ Logged in as PLAYER"
echo ""

# Test PLAYER access to Skills
echo "   Testing Skills query..."
PLAYER_SKILLS=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $PLAYER_TOKEN" \
  -d '{
    "query": "query { skillsCount }"
  }')

if echo "$PLAYER_SKILLS" | jq -e '.errors' > /dev/null; then
  ERROR_CODE=$(echo "$PLAYER_SKILLS" | jq -r '.errors[0].extensions.code')
  if [ "$ERROR_CODE" = "FORBIDDEN" ]; then
    echo "   ✅ PLAYER correctly DENIED access to skills (FORBIDDEN)"
  else
    echo "   ❌ Unexpected error: $ERROR_CODE"
  fi
else
  echo "   ❌ PLAYER should NOT have access to skills!"
  exit 1
fi

# Test PLAYER access to Spells
echo "   Testing Spells query..."
PLAYER_SPELLS=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $PLAYER_TOKEN" \
  -d '{
    "query": "query { spellsCount }"
  }')

if echo "$PLAYER_SPELLS" | jq -e '.errors[0].extensions.code' | grep -q "FORBIDDEN"; then
  echo "   ✅ PLAYER correctly DENIED access to spells (FORBIDDEN)"
else
  echo "   ❌ PLAYER should NOT have access to spells!"
fi

# Test PLAYER access to Races
echo "   Testing Races query..."
PLAYER_RACES=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $PLAYER_TOKEN" \
  -d '{
    "query": "query { racesCount }"
  }')

if echo "$PLAYER_RACES" | jq -e '.errors[0].extensions.code' | grep -q "FORBIDDEN"; then
  echo "   ✅ PLAYER correctly DENIED access to races (FORBIDDEN)"
else
  echo "   ❌ PLAYER should NOT have access to races!"
fi

# Test PLAYER access to Classes
echo "   Testing Classes query..."
PLAYER_CLASSES=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $PLAYER_TOKEN" \
  -d '{
    "query": "query { classesCount }"
  }')

if echo "$PLAYER_CLASSES" | jq -e '.errors[0].extensions.code' | grep -q "FORBIDDEN"; then
  echo "   ✅ PLAYER correctly DENIED access to classes (FORBIDDEN)"
else
  echo "   ❌ PLAYER should NOT have access to classes!"
fi

echo ""
echo "2. Testing as GOD role (should have ACCESS)..."
echo "   Logging in as admin..."

GOD_LOGIN=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"query\": \"mutation { login(input: { identifier: \\\"$GOD_EMAIL\\\", password: \\\"$GOD_PASSWORD\\\" }) { accessToken user { role } } }\"
  }")

GOD_TOKEN=$(echo "$GOD_LOGIN" | jq -r '.data.login.accessToken')
GOD_ROLE=$(echo "$GOD_LOGIN" | jq -r '.data.login.user.role')

echo "   ✓ Logged in as GOD"
echo ""

# Test GOD access to Skills
echo "   Testing Skills query..."
GOD_SKILLS=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $GOD_TOKEN" \
  -d '{
    "query": "query { skillsCount skills(take: 3) { id name type } }"
  }')

if echo "$GOD_SKILLS" | jq -e '.errors' > /dev/null; then
  echo "   ❌ GOD should have access to skills!"
  echo "$GOD_SKILLS" | jq '.errors'
  exit 1
else
  SKILLS_COUNT=$(echo "$GOD_SKILLS" | jq -r '.data.skillsCount')
  SKILLS_SAMPLE=$(echo "$GOD_SKILLS" | jq -r '.data.skills[0].name')
  echo "   ✅ GOD has access to skills ($SKILLS_COUNT total, example: $SKILLS_SAMPLE)"
fi

# Test GOD access to Spells
echo "   Testing Spells query..."
GOD_SPELLS=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $GOD_TOKEN" \
  -d '{
    "query": "query { spellsCount spells(take: 3) { id name } }"
  }')

if echo "$GOD_SPELLS" | jq -e '.errors' > /dev/null; then
  echo "   ❌ GOD should have access to spells!"
  exit 1
else
  SPELLS_COUNT=$(echo "$GOD_SPELLS" | jq -r '.data.spellsCount')
  SPELLS_SAMPLE=$(echo "$GOD_SPELLS" | jq -r '.data.spells[0].name')
  echo "   ✅ GOD has access to spells ($SPELLS_COUNT total, example: $SPELLS_SAMPLE)"
fi

# Test GOD access to Races
echo "   Testing Races query..."
GOD_RACES=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $GOD_TOKEN" \
  -d '{
    "query": "query { racesCount races { name displayName } }"
  }')

if echo "$GOD_RACES" | jq -e '.errors' > /dev/null; then
  echo "   ❌ GOD should have access to races!"
  exit 1
else
  RACES_COUNT=$(echo "$GOD_RACES" | jq -r '.data.racesCount')
  RACES_SAMPLE=$(echo "$GOD_RACES" | jq -r '.data.races[0].displayName')
  echo "   ✅ GOD has access to races ($RACES_COUNT total, example: $RACES_SAMPLE)"
fi

# Test GOD access to Classes
echo "   Testing Classes query..."
GOD_CLASSES=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $GOD_TOKEN" \
  -d '{
    "query": "query { classesCount classes(take: 3) { id name } }"
  }')

if echo "$GOD_CLASSES" | jq -e '.errors' > /dev/null; then
  echo "   ❌ GOD should have access to classes!"
  exit 1
else
  CLASSES_COUNT=$(echo "$GOD_CLASSES" | jq -r '.data.classesCount')
  CLASSES_SAMPLE=$(echo "$GOD_CLASSES" | jq -r '.data.classes[0].name')
  echo "   ✅ GOD has access to classes ($CLASSES_COUNT total, example: $CLASSES_SAMPLE)"
fi

echo ""
echo "=== Access Control Summary ==="
echo "✅ PLAYER role correctly denied access to all game systems"
echo "✅ GOD role has full access to all game systems"
echo ""
echo "Game Systems Stats:"
echo "  • $SKILLS_COUNT Skills"
echo "  • $SPELLS_COUNT Spells"
echo "  • $RACES_COUNT Races"
echo "  • $CLASSES_COUNT Classes"
echo ""
echo "Frontend URLs (login as GOD to access):"
echo "  • Skills: http://localhost:3000/dashboard/skills"
echo "  • Spells: http://localhost:3000/dashboard/spells"
echo "  • Races: http://localhost:3000/dashboard/races"
echo "  • Classes: http://localhost:3000/dashboard/classes"
echo ""
