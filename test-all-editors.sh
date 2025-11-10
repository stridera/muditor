#!/bin/bash

# Master test script for all game systems editors
# Runs comprehensive test suite for Skills, Spells, Classes, Races, and Permissions

set -e  # Exit on error

echo "╔════════════════════════════════════════════════════════════╗"
echo "║      Game Systems Editors - Comprehensive Test Suite      ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Track results
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

run_test() {
  local test_name="$1"
  local test_script="$2"

  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "Running: $test_name"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""

  TOTAL_TESTS=$((TOTAL_TESTS + 1))

  if ./"$test_script"; then
    PASSED_TESTS=$((PASSED_TESTS + 1))
    echo ""
    echo "✅ $test_name: PASSED"
  else
    FAILED_TESTS=$((FAILED_TESTS + 1))
    echo ""
    echo "❌ $test_name: FAILED"
  fi

  echo ""
}

# Run all test scripts
run_test "Skills CRUD Operations" "test-skills-crud.sh"
run_test "Spells CRUD Operations" "test-spells-crud.sh"
run_test "Classes CRUD Operations" "test-classes-crud.sh"
run_test "Races Edit Operations" "test-races-edit.sh"
run_test "Role-Based Permissions" "test-permissions.sh"

# Summary
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                      TEST SUMMARY                          ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "  Total Tests:  $TOTAL_TESTS"
echo "  Passed:       $PASSED_TESTS ✅"
echo "  Failed:       $FAILED_TESTS ❌"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
  echo "╔════════════════════════════════════════════════════════════╗"
  echo "║          🎉 ALL TESTS PASSED! 🎉                          ║"
  echo "╚════════════════════════════════════════════════════════════╝"
  exit 0
else
  echo "╔════════════════════════════════════════════════════════════╗"
  echo "║          ⚠️  SOME TESTS FAILED  ⚠️                        ║"
  echo "╚════════════════════════════════════════════════════════════╝"
  exit 1
fi
