#!/bin/bash

# Test script for Classes CRUD operations
# Tests: Create, Read, Update, Delete, and Verify deletion

set -e  # Exit on error

API_URL="http://localhost:4000/graphql"

echo "=== Testing Classes CRUD Operations ==="
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

# Create a new test class
echo "2. Creating a new test class..."
TIMESTAMP=$(date +%s)
TEST_CLASS_NAME="Test Class $TIMESTAMP"

CREATE_RESULT=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $GOD_TOKEN" \
  -d "{\"query\": \"mutation CreateClass(\$data: CreateClassInput!) { createClass(data: \$data) { id name description hitDice primaryStat } }\",
       \"variables\": {\"data\": {\"name\": \"$TEST_CLASS_NAME\", \"description\": \"A test class for CRUD verification\", \"hitDice\": \"1d10\", \"primaryStat\": \"Strength\"}}}")

CLASS_ID=$(echo "$CREATE_RESULT" | jq -r '.data.createClass.id')
CLASS_NAME=$(echo "$CREATE_RESULT" | jq -r '.data.createClass.name')

if [ "$CLASS_ID" == "null" ] || [ -z "$CLASS_ID" ]; then
  echo "   ❌ Failed to create class"
  echo "$CREATE_RESULT" | jq '.'
  exit 1
fi
echo "   ✅ Created class: $CLASS_NAME (ID: $CLASS_ID)"
echo ""

# Read the created class
echo "3. Reading the created class..."
READ_RESULT=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $GOD_TOKEN" \
  -d "{\"query\": \"query GetClass(\$id: ID!) { class(id: \$id) { id name description hitDice primaryStat } }\",
       \"variables\": {\"id\": \"$CLASS_ID\"}}")

READ_NAME=$(echo "$READ_RESULT" | jq -r '.data.class.name')
READ_HIT_DICE=$(echo "$READ_RESULT" | jq -r '.data.class.hitDice')

if [ "$READ_NAME" != "$CLASS_NAME" ]; then
  echo "   ❌ Failed to read class correctly"
  echo "$READ_RESULT" | jq '.'
  exit 1
fi
echo "   ✅ Retrieved class: $READ_NAME (Hit Dice: $READ_HIT_DICE)"
echo ""

# Update the class
echo "4. Updating the class..."
UPDATE_RESULT=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $GOD_TOKEN" \
  -d "{\"query\": \"mutation UpdateClass(\$id: ID!, \$data: UpdateClassInput!) { updateClass(id: \$id, data: \$data) { id name description hitDice primaryStat } }\",
       \"variables\": {\"id\": \"$CLASS_ID\", \"data\": {\"hitDice\": \"1d12\", \"description\": \"Updated test description\", \"primaryStat\": \"Constitution\"}}}")

UPDATED_HIT_DICE=$(echo "$UPDATE_RESULT" | jq -r '.data.updateClass.hitDice')
UPDATED_DESC=$(echo "$UPDATE_RESULT" | jq -r '.data.updateClass.description')
UPDATED_STAT=$(echo "$UPDATE_RESULT" | jq -r '.data.updateClass.primaryStat')

if [ "$UPDATED_HIT_DICE" != "1d12" ]; then
  echo "   ❌ Failed to update class"
  echo "$UPDATE_RESULT" | jq '.'
  exit 1
fi
echo "   ✅ Updated class: hitDice=$UPDATED_HIT_DICE, primaryStat=$UPDATED_STAT, desc=\"$UPDATED_DESC\""
echo ""

# Delete the test class
echo "5. Deleting the test class..."
DELETE_RESULT=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $GOD_TOKEN" \
  -d "{\"query\": \"mutation DeleteClass(\$id: ID!) { deleteClass(id: \$id) }\",
       \"variables\": {\"id\": \"$CLASS_ID\"}}")

DELETE_SUCCESS=$(echo "$DELETE_RESULT" | jq -r '.data.deleteClass')

if [ "$DELETE_SUCCESS" != "true" ]; then
  echo "   ❌ Failed to delete class"
  echo "$DELETE_RESULT" | jq '.'
  exit 1
fi
echo "   ✅ Deleted class: $DELETE_SUCCESS"
echo ""

# Verify deletion
echo "6. Verifying deletion..."
VERIFY_RESULT=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $GOD_TOKEN" \
  -d "{\"query\": \"query GetClass(\$id: ID!) { class(id: \$id) { id name } }\",
       \"variables\": {\"id\": \"$CLASS_ID\"}}")

VERIFY_ERROR=$(echo "$VERIFY_RESULT" | jq -r '.errors[0].message // "none"')

if [ "$VERIFY_ERROR" == "none" ]; then
  VERIFY_NAME=$(echo "$VERIFY_RESULT" | jq -r '.data.class.name // "null"')
  if [ "$VERIFY_NAME" != "null" ]; then
    echo "   ❌ Class still exists after deletion"
    echo "$VERIFY_RESULT" | jq '.'
    exit 1
  fi
fi
echo "   ✅ Class correctly not found after deletion"
echo ""

echo "=== ✅ All CRUD operations successful ==="
