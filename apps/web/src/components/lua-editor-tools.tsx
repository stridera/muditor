'use client';

import { lintLua, type LuaLintIssue } from '@muditor/types';
import type { editor } from 'monaco-editor';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Validate / Format / live-lint behaviour shared by the trigger script editor
 * and the library editor, so both behave identically.
 *
 * Wire it up with `onMount={tools.handleEditorDidMount}`, call `tools.validate`
 * / `tools.format` from buttons, and render `<LuaValidationResults>`.
 */
export function useLuaEditorTools(code: string, mounted = true) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof import('monaco-editor') | null>(null);
  const lintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const updateMarkers = useCallback((issues: LuaLintIssue[]) => {
    const monaco = monacoRef.current;
    const model = editorRef.current?.getModel();
    if (!monaco || !model) return;

    const markers = issues.map(issue => ({
      severity:
        issue.severity === 'error'
          ? monaco.MarkerSeverity.Error
          : monaco.MarkerSeverity.Warning,
      message: issue.message,
      startLineNumber: issue.line,
      startColumn: issue.column,
      endLineNumber: issue.line,
      endColumn: issue.endColumn,
      source: 'lua-lint',
    }));

    monaco.editor.setModelMarkers(model, 'lua-lint', markers);
  }, []);

  const handleEditorDidMount = useCallback(
    (editorInstance: editor.IStandaloneCodeEditor) => {
      editorRef.current = editorInstance;

      const model = editorInstance.getModel();
      if (model && typeof window !== 'undefined') {
        import('@/lib/monaco-setup').then(({ monaco }) => {
          monacoRef.current = monaco;
          monaco.editor.setModelLanguage(model, 'lua');
        });
      }
    },
    []
  );

  // Debounced lint on code changes: real-time inline squiggly underlines.
  useEffect(() => {
    if (!mounted) return;

    if (lintTimerRef.current) {
      clearTimeout(lintTimerRef.current);
    }

    lintTimerRef.current = setTimeout(() => {
      updateMarkers(lintLua(code));
    }, 500);

    return () => {
      if (lintTimerRef.current) {
        clearTimeout(lintTimerRef.current);
      }
    };
  }, [code, mounted, updateMarkers]);

  const clearValidation = useCallback(() => {
    setValidationErrors(prev => (prev.length > 0 ? [] : prev));
  }, []);

  const validate = useCallback(async () => {
    setIsValidating(true);
    try {
      const errors: string[] = [];
      const lines = code.split('\n');

      // Existing basic checks
      lines.forEach((line, index) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('--')) return;

        if (
          trimmed.includes('function') &&
          !trimmed.includes('end') &&
          !lines.slice(index + 1).some(l => l.includes('end'))
        ) {
          errors.push(`Line ${index + 1}: Function may be missing 'end'`);
        }

        if (
          (trimmed.includes('if') ||
            trimmed.includes('for') ||
            trimmed.includes('while')) &&
          !trimmed.includes('then') &&
          !trimmed.includes('do')
        ) {
          errors.push(
            `Line ${index + 1}: Control structure may be missing 'then' or 'do'`
          );
        }
      });

      const openParens = (code.match(/\(/g) || []).length;
      const closeParens = (code.match(/\)/g) || []).length;
      if (openParens !== closeParens) {
        errors.push('Unbalanced parentheses');
      }

      // Run linter and merge results
      const lintIssues = lintLua(code);
      for (const issue of lintIssues) {
        const severity = issue.severity === 'error' ? 'Error' : 'Warning';
        errors.push(`Line ${issue.line} [${severity}]: ${issue.message}`);
      }

      // Update Monaco markers immediately
      updateMarkers(lintIssues);

      setValidationErrors(errors);
    } catch (err) {
      setValidationErrors(['Validation error: ' + (err as Error).message]);
    } finally {
      setIsValidating(false);
    }
  }, [code, updateMarkers]);

  const format = useCallback(() => {
    editorRef.current?.getAction('editor.action.formatDocument')?.run();
  }, []);

  return {
    editorRef,
    monacoRef,
    handleEditorDidMount,
    isValidating,
    validationErrors,
    clearValidation,
    validate,
    format,
  };
}

/** Validate and Format toolbar buttons (same look as the trigger editor). */
export function LuaToolButtons({
  onValidate,
  onFormat,
  isValidating,
  readOnly = false,
}: {
  onValidate: () => void;
  onFormat: () => void;
  isValidating: boolean;
  readOnly?: boolean;
}) {
  return (
    <>
      <button
        type='button'
        onClick={onValidate}
        disabled={isValidating}
        className='text-sm bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 disabled:opacity-50'
      >
        {isValidating ? 'Validating...' : 'Validate'}
      </button>
      <button
        type='button'
        onClick={onFormat}
        disabled={readOnly}
        className='text-sm bg-secondary text-secondary-foreground px-3 py-1 rounded hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed'
      >
        Format
      </button>
    </>
  );
}

/** The "Validation Issues (n)" panel under the editor. */
export function LuaValidationResults({ errors }: { errors: string[] }) {
  if (errors.length === 0) return null;
  return (
    <div className='bg-destructive/10 border-t border-destructive/20 p-3'>
      <h4 className='text-sm font-medium text-destructive mb-2'>
        Validation Issues ({errors.length}):
      </h4>
      <ul className='text-sm space-y-1'>
        {errors.map((error, index) => (
          <li key={index} className='flex items-start gap-2'>
            <span
              className={
                error.includes('[Warning]')
                  ? 'text-yellow-500'
                  : 'text-destructive'
              }
            >
              {error.includes('[Warning]') ? '!' : '×'}
            </span>
            <span
              className={
                error.includes('[Warning]')
                  ? 'text-yellow-600 dark:text-yellow-400'
                  : 'text-destructive/90'
              }
            >
              {error}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
