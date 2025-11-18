import React from 'react';

export type EditorMode = 'view' | 'edit';

interface ZoneEditorToolbarProps {
  viewMode: 'zone' | 'world-map';
  onToggleViewMode: () => void;
  loading: boolean;
  error: string | null;
  currentZLevel: number;
  onChangeZLevel: (delta: number) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  editorMode: EditorMode;
  onModeChange: (mode: EditorMode) => void;
  canEdit: boolean;
  overlapCount: number;
  showOverlapButton: boolean;
  onToggleOverlapInfo: () => void;
}

export const EditorToolbar: React.FC<ZoneEditorToolbarProps> = ({
  viewMode,
  onToggleViewMode,
  loading,
  error,
  currentZLevel,
  onChangeZLevel,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  editorMode,
  onModeChange,
  canEdit,
  overlapCount,
  showOverlapButton,
  onToggleOverlapInfo,
}) => {
  return (
    <div className='flex items-center gap-2 p-2 border-b bg-gray-50 dark:bg-gray-900 dark:border-gray-700'>
      <div className='flex items-center rounded border border-gray-200 dark:border-gray-700 overflow-hidden'>
        <button
          className={`px-3 py-1 text-xs ${
            editorMode === 'view'
              ? 'bg-gray-300 dark:bg-gray-700 font-semibold'
              : 'bg-gray-100 dark:bg-gray-800'
          }`}
          onClick={() => onModeChange('view')}
        >
          View
        </button>
        <button
          className={`px-3 py-1 text-xs ${
            editorMode === 'edit'
              ? 'bg-blue-500 text-white dark:bg-blue-600'
              : 'bg-gray-100 dark:bg-gray-800'
          } ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={!canEdit}
          onClick={() => canEdit && onModeChange('edit')}
          title={
            canEdit
              ? 'Drag rooms or use keyboard shortcuts to edit'
              : 'Editing not permitted for this zone'
          }
        >
          Edit
        </button>
      </div>
      <button
        className='px-2 py-1 text-xs rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
        onClick={onToggleViewMode}
        title='Toggle world map view'
      >
        {viewMode === 'zone' ? 'World Map' : 'Zone View'}
      </button>
      {loading && (
        <span className='px-2 py-1 text-xs text-gray-700 dark:text-gray-300'>
          Loading…
        </span>
      )}
      {error && (
        <span className='px-2 py-1 text-xs text-red-600' title={error}>
          Error
        </span>
      )}
      <div className='flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded'>
        <button
          className='px-1 py-0.5 rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
          onClick={() => onChangeZLevel(1)}
          title='View floor above (Shift+PgUp)'
        >
          ↑
        </button>
        <span className='px-1 font-mono' title='Current floor level'>
          Z{currentZLevel}
        </span>
        <button
          className='px-1 py-0.5 rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
          onClick={() => onChangeZLevel(-1)}
          title='View floor below (Shift+PgDn)'
        >
          ↓
        </button>
      </div>
      <button
        className='px-2 py-1 text-xs rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
        disabled={!canUndo}
        onClick={onUndo}
        title='Undo (Ctrl+Z)'
      >
        Undo
      </button>
      <button
        className='px-2 py-1 text-xs rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
        disabled={!canRedo}
        onClick={onRedo}
        title='Redo (Ctrl+Shift+Z / Ctrl+Y)'
      >
        Redo
      </button>
      {showOverlapButton && overlapCount > 0 && (
        <button
          className='px-2 py-1 text-xs rounded bg-yellow-500 hover:bg-yellow-600 text-white dark:bg-yellow-600 dark:hover:bg-yellow-700'
          onClick={onToggleOverlapInfo}
          title={`${overlapCount} overlapping positions detected`}
        >
          Overlaps: {overlapCount}
        </button>
      )}
    </div>
  );
};
