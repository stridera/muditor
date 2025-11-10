#!/bin/bash

API_URL="http://localhost:4000/graphql"

echo "=== Testing Skills CRUD Operations ==="
echo ""

# Use the existing GOD user token from previous tests
GOD_EMAIL="admin@muditor.dev"
GOD_PASSWORD="admin123"

echo "1. Logging in as GOD user..."
GOD_LOGIN=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"query\": \"mutation { login(input: { identifier: \\\"$GOD_EMAIL\\\", password: \\\"$GOD_PASSWORD\\\" }) { accessToken user { role } } }\"
  }")

GOD_TOKEN=$(echo "$GOD_LOGIN" | jq -r '.data.login.accessToken')
GOD_ROLE=$(echo "$GOD_LOGIN" | jq -r '.data.login.user.role')

if [ "$GOD_TOKEN" = "null" ]; then
  echo "   ❌ Login failed"
  exit 1
fi

echo "   ✅ Logged in as $GOD_ROLE"
echo ""

# Create a new test skill with unique name
TIMESTAMP=$(date +%s)
TEST_SKILL_NAME="Test Skill $TIMESTAMP"

echo "2. Creating a new test skill..."
CREATE_RESULT=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $GOD_TOKEN" \
  -d "{
    \"query\": \"mutation CreateSkill(\$data: CreateSkillInput!) { createSkill(data: \$data) { id name type category maxLevel description } }\",
    \"variables\": {
      \"data\": {
        \"name\": \"$TEST_SKILL_NAME\",
        \"description\": \"A test skill for CRUD verification\",
        \"type\": \"COMBAT\",
        \"category\": \"SECONDARY\",
        \"maxLevel\": 100
      }
    }
  }")

if echo "$CREATE_RESULT" | jq -e '.errors' > /dev/null; then
  echo "   ❌ Create failed:"
  echo "$CREATE_RESULT" | jq '.errors'
  exit 1
fi

SKILL_ID=$(echo "$CREATE_RESULT" | jq -r '.data.createSkill.id')
SKILL_NAME=$(echo "$CREATE_RESULT" | jq -r '.data.createSkill.name')

echo "   ✅ Created skill: $SKILL_NAME (ID: $SKILL_ID)"
echo ""

# Read the created skill
echo "3. Reading the created skill..."
READ_RESULT=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $GOD_TOKEN" \
  -d "{
    \"query\": \"query { skill(id: $SKILL_ID) { id name type category maxLevel description } }\"
  }")

if echo "$READ_RESULT" | jq -e '.errors' > /dev/null; then
  echo "   ❌ Read failed:"
  echo "$READ_RESULT" | jq '.errors'
  exit 1
fi

RETRIEVED_NAME=$(echo "$READ_RESULT" | jq -r '.data.skill.name')
echo "   ✅ Retrieved skill: $RETRIEVED_NAME"
echo ""

# Update the skill
echo "4. Updating the skill..."
UPDATE_RESULT=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $GOD_TOKEN" \
  -d "{
    \"query\": \"mutation UpdateSkill(\$id: ID!, \$data: UpdateSkillInput!) { updateSkill(id: \$id, data: \$data) { id name description maxLevel } }\",
    \"variables\": {
      \"id\": \"$SKILL_ID\",
      \"data\": {
        \"description\": \"Updated test description\",
        \"maxLevel\": 150
      }
    }
  }")

if echo "$UPDATE_RESULT" | jq -e '.errors' > /dev/null; then
  echo "   ❌ Update failed"
  exit 1
fi

UPDATED_DESC=$(echo "$UPDATE_RESULT" | jq -r '.data.updateSkill.description')
UPDATED_LEVEL=$(echo "$UPDATE_RESULT" | jq -r '.data.updateSkill.maxLevel')
echo "   ✅ Updated skill: maxLevel=$UPDATED_LEVEL, desc=\"$UPDATED_DESC\""
echo ""

# Delete the skill
echo "5. Deleting the test skill..."
DELETE_RESULT=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $GOD_TOKEN" \
  -d "{
    \"query\": \"mutation { deleteSkill(id: $SKILL_ID) }\"
  }")

if echo "$DELETE_RESULT" | jq -e '.errors' > /dev/null; then
  echo "   ❌ Delete failed"
  exit 1
fi

DELETE_SUCCESS=$(echo "$DELETE_RESULT" | jq -r '.data.deleteSkill')
echo "   ✅ Deleted skill: $DELETE_SUCCESS"
echo ""

# Verify deletion
echo "6. Verifying deletion..."
VERIFY_RESULT=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $GOD_TOKEN" \
  -d "{
    \"query\": \"query { skill(id: $SKILL_ID) { id name } }\"
  }")

if echo "$VERIFY_RESULT" | jq -e '.errors' > /dev/null; then
  echo "   ✅ Skill correctly not found after deletion"
else
  FOUND_NAME=$(echo "$VERIFY_RESULT" | jq -r '.data.skill.name')
  if [ "$FOUND_NAME" = "null" ]; then
    echo "   ✅ Skill correctly not found after deletion"
  else
    echo "   ❌ Skill still exists: $FOUND_NAME"
    exit 1
  fi
fi

echo ""
echo "=== ✅ All CRUD operations successful ==="
echo ""
echo "Skills Editor URLs:"
echo "  • Browse: http://localhost:3001/dashboard/skills"
echo "  • Login as admin@muditor.dev to access"
