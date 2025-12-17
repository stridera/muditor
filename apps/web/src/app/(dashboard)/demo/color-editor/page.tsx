/**
 * Color Editor Demo Page
 *
 * Demonstrates the XML-Lite color markup viewer and editor components.
 */

'use client';

import React, { useState } from 'react';
import {
  ColoredTextViewer,
  ColoredTextInline,
} from '@/components/ColoredTextViewer';
import { ColoredTextEditor } from '@/components/ColoredTextEditor';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const EXAMPLE_MARKUP_SIMPLE = '<red>A fierce goblin</red> stands here.';

const EXAMPLE_MARKUP_COMPLEX = `<b:yellow>== </><b:white>FIERY</><b:red>MUD</> <b:yellow>==</>

Welcome to the <b:green>Enchanted Forest</b:green>!

You see a <red>dragon</red> breathing <b:red>fire</b:red> at a <blue>knight</blue> wearing <b>shining armor</b>.

<bg-red><white>WARNING:</white></bg-red> This area is <u>dangerous</u>!

Special effects:
- <dim>Dimmed text</dim>
- <s>Strikethrough text</s>
- <i>Italic text</i>
- <b><u><red>Bold underlined red</red></u></b>`;

const EXAMPLE_ROOM_DESC = `<b>The Grand Hall of Heroes</b>

This magnificent chamber soars upward to a vaulted ceiling adorned with
<b:yellow>golden</b:yellow> chandeliers. Massive <brown>oak</brown> pillars support the structure,
each carved with <dim>ancient runes</dim> that pulse with a faint <cyan>magical glow</cyan>.

The floor is polished <white>marble</white>, reflecting the <b:red>crimson</b:red> banners
that hang from the walls. At the far end, a <b:white>throne</b:white> of <purple>amethyst</purple>
sits upon a raised dais.

<bg-blue><white>[ A magical aura permeates this room ]</white></bg-blue>`;

export default function ColorEditorDemoPage() {
  const [simpleMarkup, setSimpleMarkup] = useState(EXAMPLE_MARKUP_SIMPLE);
  const [complexMarkup, setComplexMarkup] = useState(EXAMPLE_MARKUP_COMPLEX);
  const [roomDescription, setRoomDescription] = useState(EXAMPLE_ROOM_DESC);

  return (
    <div className='container mx-auto p-6 max-w-6xl'>
      <div className='mb-8'>
        <h1 className='text-4xl font-bold mb-2'>XML-Lite Color Markup Demo</h1>
        <p className='text-muted-foreground'>
          Demonstrating the ColoredTextViewer and ColoredTextEditor components
          for FieryMUD.
        </p>
      </div>

      <div className='space-y-8'>
        {/* Simple Example */}
        <Card>
          <CardHeader>
            <CardTitle>Simple Example</CardTitle>
            <CardDescription>
              Basic color markup with inline rendering
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <h3 className='font-semibold mb-2'>Inline Display:</h3>
              <div className='p-4 border rounded-md bg-muted/30'>
                <ColoredTextInline markup={simpleMarkup} />
              </div>
            </div>

            <div>
              <h3 className='font-semibold mb-2'>Block Display:</h3>
              <ColoredTextViewer markup={simpleMarkup} />
            </div>

            <div>
              <h3 className='font-semibold mb-2'>Editor:</h3>
              <ColoredTextEditor
                value={simpleMarkup}
                onChange={setSimpleMarkup}
                placeholder='Enter colored text...'
                showPreview={false}
              />
            </div>
          </CardContent>
        </Card>

        {/* Complex Example */}
        <Card>
          <CardHeader>
            <CardTitle>Complex Example</CardTitle>
            <CardDescription>
              Multiple colors, styles, and backgrounds
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue='editor' className='w-full'>
              <TabsList className='grid w-full grid-cols-3'>
                <TabsTrigger value='editor'>Editor</TabsTrigger>
                <TabsTrigger value='preview'>Preview</TabsTrigger>
                <TabsTrigger value='both'>Split View</TabsTrigger>
              </TabsList>

              <TabsContent value='editor' className='mt-4'>
                <ColoredTextEditor
                  value={complexMarkup}
                  onChange={setComplexMarkup}
                  placeholder='Enter complex colored text...'
                  showPreview={false}
                />
              </TabsContent>

              <TabsContent value='preview' className='mt-4'>
                <ColoredTextViewer markup={complexMarkup} />
              </TabsContent>

              <TabsContent value='both' className='mt-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <h3 className='font-semibold mb-2'>Editor</h3>
                    <ColoredTextEditor
                      value={complexMarkup}
                      onChange={setComplexMarkup}
                      placeholder='Enter complex colored text...'
                      showPreview={false}
                    />
                  </div>
                  <div>
                    <h3 className='font-semibold mb-2'>Live Preview</h3>
                    <ColoredTextViewer markup={complexMarkup} />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Room Description Example */}
        <Card>
          <CardHeader>
            <CardTitle>Room Description Example</CardTitle>
            <CardDescription>
              Typical MUD room description with colors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ColoredTextEditor
              value={roomDescription}
              onChange={setRoomDescription}
              placeholder='Enter room description...'
              maxLength={2000}
              showPreview={true}
            />
          </CardContent>
        </Card>

        {/* Markup Reference */}
        <Card>
          <CardHeader>
            <CardTitle>Markup Reference</CardTitle>
            <CardDescription>Common XML-Lite tags and examples</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div>
                <h3 className='font-semibold mb-2'>Colors:</h3>
                <div className='grid grid-cols-2 md:grid-cols-4 gap-2'>
                  <div>
                    <code className='text-xs'>{`<red>text</red>`}</code>
                    <br />
                    <ColoredTextInline markup='<red>Red text</red>' />
                  </div>
                  <div>
                    <code className='text-xs'>{`<green>text</green>`}</code>
                    <br />
                    <ColoredTextInline markup='<green>Green text</green>' />
                  </div>
                  <div>
                    <code className='text-xs'>{`<blue>text</blue>`}</code>
                    <br />
                    <ColoredTextInline markup='<blue>Blue text</blue>' />
                  </div>
                  <div>
                    <code className='text-xs'>{`<yellow>text</yellow>`}</code>
                    <br />
                    <ColoredTextInline markup='<yellow>Yellow text</yellow>' />
                  </div>
                </div>
              </div>

              <div>
                <h3 className='font-semibold mb-2'>
                  Bright Colors (Bold + Color):
                </h3>
                <div className='grid grid-cols-2 md:grid-cols-4 gap-2'>
                  <div>
                    <code className='text-xs'>{`<b:red>text</b:red>`}</code>
                    <br />
                    <ColoredTextInline markup='<b:red>Bright Red</b:red>' />
                  </div>
                  <div>
                    <code className='text-xs'>{`<b:green>text</b:green>`}</code>
                    <br />
                    <ColoredTextInline markup='<b:green>Bright Green</b:green>' />
                  </div>
                  <div>
                    <code className='text-xs'>{`<b:blue>text</b:blue>`}</code>
                    <br />
                    <ColoredTextInline markup='<b:blue>Bright Blue</b:blue>' />
                  </div>
                  <div>
                    <code className='text-xs'>{`<b:yellow>text</b:yellow>`}</code>
                    <br />
                    <ColoredTextInline markup='<b:yellow>Bright Yellow</b:yellow>' />
                  </div>
                </div>
              </div>

              <div>
                <h3 className='font-semibold mb-2'>Text Styles:</h3>
                <div className='grid grid-cols-2 md:grid-cols-4 gap-2'>
                  <div>
                    <code className='text-xs'>{`<b>text</b>`}</code>
                    <br />
                    <ColoredTextInline markup='<b>Bold</b>' />
                  </div>
                  <div>
                    <code className='text-xs'>{`<i>text</i>`}</code>
                    <br />
                    <ColoredTextInline markup='<i>Italic</i>' />
                  </div>
                  <div>
                    <code className='text-xs'>{`<u>text</u>`}</code>
                    <br />
                    <ColoredTextInline markup='<u>Underline</u>' />
                  </div>
                  <div>
                    <code className='text-xs'>{`<s>text</s>`}</code>
                    <br />
                    <ColoredTextInline markup='<s>Strike</s>' />
                  </div>
                </div>
              </div>

              <div>
                <h3 className='font-semibold mb-2'>Background Colors:</h3>
                <div className='grid grid-cols-2 md:grid-cols-4 gap-2'>
                  <div>
                    <code className='text-xs'>{`<bg-red><white>...</white></bg-red>`}</code>
                    <br />
                    <ColoredTextInline markup='<bg-red><white>Red BG</white></bg-red>' />
                  </div>
                  <div>
                    <code className='text-xs'>{`<bg-green><black>...</black></bg-green>`}</code>
                    <br />
                    <ColoredTextInline markup='<bg-green><black>Green BG</black></bg-green>' />
                  </div>
                  <div>
                    <code className='text-xs'>{`<bg-blue><white>...</white></bg-blue>`}</code>
                    <br />
                    <ColoredTextInline markup='<bg-blue><white>Blue BG</white></bg-blue>' />
                  </div>
                  <div>
                    <code className='text-xs'>{`<bg-yellow><black>...</black></bg-yellow>`}</code>
                    <br />
                    <ColoredTextInline markup='<bg-yellow><black>Yellow BG</black></bg-yellow>' />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
