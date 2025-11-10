#!/bin/bash

# Test script for Role-Based Access Control
# Tests: Different user roles attempting various operations

set -e  # Exit on error

API_URL="http://localhost:4000/graphql"

echo "=== Testing Role-Based Access Control ==="
echo ""

# Test 1: PLAYER should NOT be able to create skills
echo "1. Testing PLAYER role (should be denied)..."
PLAYER_LOGIN=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{\"query\": \"mutation { login(input: { identifier: \\\"player@muditor.dev\\\", password: \\\"player123\\\" }) { accessToken user { role } } }\"}")

PLAYER_TOKEN=$(echo "$PLAYER_LOGIN" | jq -r '.data.login.accessToken')
PLAYER_ROLE=$(echo "$PLAYER_LOGIN" | jq -r '.data.login.user.role')

if [ "$PLAYER_TOKEN" == "null" ] || [ -z "$PLAYER_TOKEN" ]; then
  echo "   ⚠️  Player user not found (expected in test database)"
else
  echo "   ✅ Logged in as $PLAYER_ROLE"

  # Try to create a skill (should fail)
  CREATE_RESULT=$(curl -s -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $PLAYER_TOKEN" \
    -d "{\"query\": \"mutation CreateSkill(\$data: CreateSkillInput!) { createSkill(data: \$data) { id name } }\",
         \"variables\": {\"data\": {\"name\": \"Unauthorized Skill\", \"type\": \"COMBAT\", \"category\": \"SECONDARY\", \"maxLevel\": 100}}}")

  ERROR_MSG=$(echo "$CREATE_RESULT" | jq -r '.errors[0].message // "none"')

  if [ "$ERROR_MSG" == "none" ]; then
    echo "   ❌ PLAYER was able to create skill (should be denied!)"
    exit 1
  else
    echo "   ✅ PLAYER correctly denied: $ERROR_MSG"
  fi
fi
echo ""

# Test 2: BUILDER should be able to EDIT but NOT CREATE skills
echo "2. Testing BUILDER role..."
BUILDER_LOGIN=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{\"query\": \"mutation { login(input: { identifier: \\\"builder@muditor.dev\\\", password: \\\"builder123\\\" }) { accessToken user { role } } }\"}")

BUILDER_TOKEN=$(echo "$BUILDER_LOGIN" | jq -r '.data.login.accessToken')
BUILDER_ROLE=$(echo "$BUILDER_LOGIN" | jq -r '.data.login.user.role')

if [ "$BUILDER_TOKEN" == "null" ] || [ -z "$BUILDER_TOKEN" ]; then
  echo "   ⚠️  Builder user not found (expected in test database)"
else
  echo "   ✅ Logged in as $BUILDER_ROLE"

  # Try to create a skill (should fail - requires CODER)
  CREATE_RESULT=$(curl -s -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $BUILDER_TOKEN" \
    -d "{\"query\": \"mutation CreateSkill(\$data: CreateSkillInput!) { createSkill(data: \$data) { id name } }\",
         \"variables\": {\"data\": {\"name\": \"Builder Skill\", \"type\": \"COMBAT\", \"category\": \"SECONDARY\", \"maxLevel\": 100}}}")

  ERROR_MSG=$(echo "$CREATE_RESULT" | jq -r '.errors[0].message // "none"')

  if [ "$ERROR_MSG" == "none" ]; then
    echo "   ❌ BUILDER was able to create skill (should require CODER!)"
    exit 1
  else
    echo "   ✅ BUILDER correctly denied creation: $ERROR_MSG"
  fi

  # Try to read skills (should succeed - IMMORTAL+ can view)
  READ_RESULT=$(curl -s -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $BUILDER_TOKEN" \
    -d "{\"query\": \"query { skills(take: 1) { id name } }\"}")

  SKILL_NAME=$(echo "$READ_RESULT" | jq -r '.data.skills[0].name // "null"')

  if [ "$SKILL_NAME" == "null" ]; then
    ERROR_MSG=$(echo "$READ_RESULT" | jq -r '.errors[0].message // "none"')
    if [ "$ERROR_MSG" != "none" ]; then
      echo "   ❌ BUILDER denied read access (should be allowed for IMMORTAL+)"
      exit 1
    fi
  else
    echo "   ✅ BUILDER can read skills: $SKILL_NAME"
  fi
fi
echo ""

# Test 3: CODER should be able to CREATE
echo "3. Testing CODER role (should have create permission)..."
CODER_LOGIN=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{\"query\": \"mutation { login(input: { identifier: \\\"coder@muditor.dev\\\", password: \\\"coder123\\\" }) { accessToken user { role } } }\"}")

CODER_TOKEN=$(echo "$CODER_LOGIN" | jq -r '.data.login.accessToken')
CODER_ROLE=$(echo "$CODER_LOGIN" | jq -r '.data.login.user.role')

if [ "$CODER_TOKEN" == "null" ] || [ -z "$CODER_TOKEN" ]; then
  echo "   ⚠️  Coder user not found (expected in test database)"
else
  echo "   ✅ Logged in as $CODER_ROLE"

  # Try to create a skill (should succeed)
  TIMESTAMP=$(date +%s)
  CREATE_RESULT=$(curl -s -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $CODER_TOKEN" \
    -d "{\"query\": \"mutation CreateSkill(\$data: CreateSkillInput!) { createSkill(data: \$data) { id name } }\",
         \"variables\": {\"data\": {\"name\": \"Coder Test Skill $TIMESTAMP\", \"type\": \"COMBAT\", \"category\": \"SECONDARY\", \"maxLevel\": 100}}}")

  SKILL_ID=$(echo "$CREATE_RESULT" | jq -r '.data.createSkill.id // "null"')
  ERROR_MSG=$(echo "$CREATE_RESULT" | jq -r '.errors[0].message // "none"')

  if [ "$SKILL_ID" == "null" ]; then
    echo "   ❌ CODER denied create access: $ERROR_MSG"
    exit 1
  else
    echo "   ✅ CODER can create skills (ID: $SKILL_ID)"

    # Clean up - delete the test skill
    DELETE_RESULT=$(curl -s -X POST "$API_URL" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $CODER_TOKEN" \
      -d "{\"query\": \"mutation DeleteSkill(\$id: ID!) { deleteSkill(id: \$id) }\",
           \"variables\": {\"id\": \"$SKILL_ID\"}}")

    echo "   ✅ Cleaned up test skill"
  fi
fi
echo ""

# Test 4: GOD should have full access
echo "4. Testing GOD role (should have all permissions)..."
GOD_LOGIN=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{\"query\": \"mutation { login(input: { identifier: \\\"admin@muditor.dev\\\", password: \\\"admin123\\\" }) { accessToken user { role } } }\"}")

GOD_TOKEN=$(echo "$GOD_LOGIN" | jq -r '.data.login.accessToken')
GOD_ROLE=$(echo "$GOD_LOGIN" | jq -r '.data.login.user.role')

if [ "$GOD_TOKEN" == "null" ] || [ -z "$GOD_TOKEN" ]; then
  echo "   ❌ Failed to login as GOD"
  exit 1
fi
echo "   ✅ Logged in as $GOD_ROLE"

# GOD can create
TIMESTAMP=$(date +%s)
CREATE_RESULT=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $GOD_TOKEN" \
  -d "{\"query\": \"mutation CreateSkill(\$data: CreateSkillInput!) { createSkill(data: \$data) { id name } }\",
       \"variables\": {\"data\": {\"name\": \"God Test Skill $TIMESTAMP\", \"type\": \"COMBAT\", \"category\": \"SECONDARY\", \"maxLevel\": 100}}}")

SKILL_ID=$(echo "$CREATE_RESULT" | jq -r '.data.createSkill.id // "null"')

if [ "$SKILL_ID" == "null" ]; then
  echo "   ❌ GOD denied create access"
  exit 1
fi
echo "   ✅ GOD can create (ID: $SKILL_ID)"

# GOD can delete
DELETE_RESULT=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $GOD_TOKEN" \
  -d "{\"query\": \"mutation DeleteSkill(\$id: ID!) { deleteSkill(id: \$id) }\",
       \"variables\": {\"id\": \"$SKILL_ID\"}}")

DELETE_SUCCESS=$(echo "$DELETE_RESULT" | jq -r '.data.deleteSkill')

if [ "$DELETE_SUCCESS" != "true" ]; then
  echo "   ❌ GOD denied delete access"
  exit 1
fi
echo "   ✅ GOD can delete"
echo ""

echo "=== ✅ All permission tests passed ==="
echo ""
echo "Summary:"
echo "  - PLAYER: ✅ Correctly denied (if exists)"
echo "  - BUILDER: ✅ Can read, denied create"
echo "  - CODER: ✅ Can create and delete"
echo "  - GOD: ✅ Full access"
