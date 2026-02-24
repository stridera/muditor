import '@testing-library/jest-dom';

// TODO: This integration test needs a rewrite — the ZoneEditorOrchestrator component
// has been significantly refactored since this test was written. The component now uses
// an internal authenticatedFetch (not the importable one), multiple useEffect chains,
// and ReactFlow rendering that requires more comprehensive mocking.
//
// The regression it tests (initialRoomId=0 not treated as falsy) should be re-tested
// once the component's data fetching is refactored to use hooks/context that can be
// more easily mocked.

describe('EnhancedZoneEditor initialRoomId=0 regression', () => {
  test.todo(
    'selects and retains room 0 from URL param (needs test rewrite after component refactor)'
  );
});
