# XML-Lite Color Editor Integration Guide

This guide explains how to integrate the ColoredTextViewer and ColoredTextEditor components into Muditor forms for editing room descriptions, mob names, object descriptions, etc.

## Components Overview

### ColoredTextViewer

Read-only display component with theme-aware color rendering.

```typescript
import { ColoredTextViewer, ColoredTextInline } from '@/components/ColoredTextViewer';

// Block display (with container)
<ColoredTextViewer
  markup="<red>A fierce goblin</red> stands here."
  fontFamily="monospace"
  adjustColors={true}  // Enable theme-aware adjustment
/>

// Inline display (no container)
<ColoredTextInline markup="<b:red>Bold red text</b:red>" />
```

### ColoredTextEditor

WYSIWYG editor with toolbar for applying colors and styles.

```typescript
import { ColoredTextEditor } from '@/components/ColoredTextEditor';

<ColoredTextEditor
  value={description}
  onChange={setDescription}
  placeholder="Enter description..."
  maxLength={2000}          // Optional character limit
  showPreview={true}        // Show live preview below editor
/>
```

## Integration Examples

### Example 1: Room Description in PropertyPanel

```typescript
// In PropertyPanel.tsx (or similar form component)
import { ColoredTextEditor } from '@/components/ColoredTextEditor';

// Replace existing textarea with ColoredTextEditor
<ColoredTextEditor
  value={room.roomDescription || ''}
  onChange={(newValue) => onRoomChange('roomDescription', newValue)}
  placeholder="Enter room description..."
  maxLength={2000}
  showPreview={true}
/>
```

### Example 2: Mob Name with Color Preview

```typescript
import { ColoredTextInline } from '@/components/ColoredTextViewer';
import { ColoredTextEditor } from '@/components/ColoredTextEditor';

// Show colored name in mob list
<div className="flex items-center gap-2">
  <ColoredTextInline markup={mob.name} />
  <span className="text-sm text-muted-foreground">Level {mob.level}</span>
</div>

// Edit mob name with color picker
<ColoredTextEditor
  value={mob.name}
  onChange={(newName) => updateMob({ ...mob, name: newName })}
  placeholder="Enter mob name..."
  maxLength={80}
  showPreview={true}
/>
```

### Example 3: Object Examine Description

```typescript
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ColoredTextViewer } from '@/components/ColoredTextViewer';
import { ColoredTextEditor } from '@/components/ColoredTextEditor';

<Tabs defaultValue="edit">
  <TabsList>
    <TabsTrigger value="edit">Edit</TabsTrigger>
    <TabsTrigger value="preview">Preview</TabsTrigger>
  </TabsList>

  <TabsContent value="edit">
    <ColoredTextEditor
      value={object.examineDescription}
      onChange={(newDesc) => updateObject({ ...object, examineDescription: newDesc })}
      placeholder="Examine description..."
      maxLength={1000}
    />
  </TabsContent>

  <TabsContent value="preview">
    <ColoredTextViewer markup={object.examineDescription} />
  </TabsContent>
</Tabs>
```

### Example 4: Zone Description Display

```typescript
import { ColoredTextViewer } from '@/components/ColoredTextViewer';

// Read-only display in zone card
<Card>
  <CardHeader>
    <CardTitle>{zone.name}</CardTitle>
  </CardHeader>
  <CardContent>
    <ColoredTextViewer markup={zone.description} />
  </CardContent>
</Card>
```

## Field Integration Checklist

When integrating color support into a text field:

1. **Identify Fields**: Determine which fields should support color markup
   - Room names ✅
   - Room descriptions ✅
   - Mob names ✅
   - Mob descriptions (room, examine) ✅
   - Object names ✅
   - Object descriptions (room, examine, action) ✅
   - Extra descriptions ✅

2. **Update Form Component**:
   - Import `ColoredTextEditor`
   - Replace `<textarea>` or `<Input>` with `<ColoredTextEditor>`
   - Preserve existing `value` and `onChange` props
   - Add appropriate `maxLength` based on field

3. **Update Display Component**:
   - Import `ColoredTextViewer` or `ColoredTextInline`
   - Replace plain text display with colored version
   - Use `ColoredTextInline` for short text (names)
   - Use `ColoredTextViewer` for long text (descriptions)

4. **Test**:
   - Verify colors render correctly in both light/dark themes
   - Test WYSIWYG toolbar functionality
   - Ensure markup validation catches errors
   - Check character limits work correctly

## Common Patterns

### Read-Only List Item

```typescript
<div className="space-y-2">
  {items.map(item => (
    <div key={item.id} className="p-2 border rounded">
      <ColoredTextInline markup={item.name} />
    </div>
  ))}
</div>
```

### Editable Field with Label

```typescript
<div className="space-y-2">
  <label className="text-sm font-medium">
    Room Description
  </label>
  <ColoredTextEditor
    value={description}
    onChange={setDescription}
    maxLength={2000}
  />
</div>
```

### Side-by-Side Edit/Preview

```typescript
<div className="grid grid-cols-2 gap-4">
  <div>
    <h3 className="font-semibold mb-2">Editor</h3>
    <ColoredTextEditor
      value={text}
      onChange={setText}
      showPreview={false}
    />
  </div>
  <div>
    <h3 className="font-semibold mb-2">Preview</h3>
    <ColoredTextViewer markup={text} />
  </div>
</div>
```

## Theme Handling

Colors are automatically adjusted for light/dark themes to ensure readability. The `adjustColors` prop (enabled by default) uses contrast ratio calculations to maintain WCAG AA compliance.

To disable automatic adjustment:

```typescript
<ColoredTextViewer markup={text} adjustColors={false} />
```

## Validation

The editor includes built-in markup validation:

```typescript
import { validateMarkup } from '@/utils/xmlLiteParser';

const validation = validateMarkup(userInput);
if (!validation.valid) {
  console.error('Markup errors:', validation.errors);
  // Display errors to user
}
```

## Demo Page

Visit `/demo/color-editor` to see all components in action with live examples and markup reference.

## Files Created

- `/muditor/apps/web/src/utils/xmlLiteParser.ts` - XML-Lite parser
- `/muditor/apps/web/src/utils/colorUtils.ts` - Theme-aware color utilities
- `/muditor/apps/web/src/components/ColoredTextViewer.tsx` - Display component
- `/muditor/apps/web/src/components/ColoredTextEditor.tsx` - WYSIWYG editor
- `/muditor/apps/web/src/app/(dashboard)/demo/color-editor/page.tsx` - Demo page

## Next Steps

1. Review the demo page at `/demo/color-editor`
2. Identify forms that need color support integration
3. Update PropertyPanel.tsx to use ColoredTextEditor for room descriptions
4. Update MobNode/ObjectNode components to display colored names
5. Test thoroughly in both light and dark themes
