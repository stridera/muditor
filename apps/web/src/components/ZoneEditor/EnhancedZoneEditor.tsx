'use client';

// Minimal wrapper mapping old EnhancedZoneEditor import to the new orchestrator.
// This prevents widespread import churn while quarantining legacy logic.

import { ZoneEditorOrchestrator } from './ZoneEditorOrchestrator';

export const EnhancedZoneEditor = ZoneEditorOrchestrator;
export default EnhancedZoneEditor;
