'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  useGameAdminMutations,
  type CommandResult,
} from '@/hooks/use-game-admin';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Megaphone,
  Send,
  Terminal,
  Trash2,
  XCircle,
} from 'lucide-react';
import { useCallback, useRef, useState } from 'react';

interface CommandHistoryEntry {
  id: string;
  command: string;
  result: CommandResult;
  timestamp: Date;
}

interface CommandConsoleProps {
  defaultExecutor?: string | undefined;
}

export function CommandConsole({ defaultExecutor }: CommandConsoleProps) {
  const { executeCommand, broadcastMessage, commandLoading, broadcastLoading } =
    useGameAdminMutations();

  const [command, setCommand] = useState('');
  const [executor, setExecutor] = useState(defaultExecutor || '');
  const [broadcastText, setBroadcastText] = useState('');
  const [broadcastSender, setBroadcastSender] = useState('');
  const [history, setHistory] = useState<CommandHistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const commandInputRef = useRef<HTMLInputElement>(null);
  const historyEndRef = useRef<HTMLDivElement>(null);

  const addToHistory = useCallback((cmd: string, result: CommandResult) => {
    const entry: CommandHistoryEntry = {
      id: crypto.randomUUID(),
      command: cmd,
      result,
      timestamp: new Date(),
    };
    setHistory(prev => [...prev, entry]);
    setTimeout(() => {
      historyEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, []);

  const handleExecuteCommand = async () => {
    if (!command.trim()) return;

    try {
      const result = await executeCommand(
        command.trim(),
        executor || undefined
      );
      addToHistory(command.trim(), result);
      setCommand('');
      setHistoryIndex(-1);
    } catch (error) {
      addToHistory(command.trim(), {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const handleBroadcast = async () => {
    if (!broadcastText.trim()) return;

    try {
      const result = await broadcastMessage(
        broadcastText.trim(),
        broadcastSender || undefined
      );
      addToHistory(`[BROADCAST] ${broadcastText.trim()}`, {
        success: result.success,
        message: `Sent to ${result.recipientCount} players: ${result.message}`,
      });
      setBroadcastText('');
    } catch (error) {
      addToHistory(`[BROADCAST] ${broadcastText.trim()}`, {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to broadcast',
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleExecuteCommand();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const newIndex =
          historyIndex < history.length - 1 ? historyIndex + 1 : historyIndex;
        setHistoryIndex(newIndex);
        setCommand(history[history.length - 1 - newIndex]?.command || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCommand(history[history.length - 1 - newIndex]?.command || '');
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCommand('');
      }
    }
  };

  const clearHistory = () => {
    setHistory([]);
    setHistoryIndex(-1);
  };

  return (
    <TooltipProvider>
      <div className='space-y-4'>
        {/* Command Console */}
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle className='flex items-center gap-2'>
                  <Terminal className='h-5 w-5' />
                  Command Console
                </CardTitle>
                <CardDescription>
                  Execute god commands on the FieryMUD server
                </CardDescription>
              </div>
              {history.length > 0 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant='ghost' size='sm' onClick={clearHistory}>
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Clear History</TooltipContent>
                </Tooltip>
              )}
            </div>
          </CardHeader>
          <CardContent className='space-y-4'>
            {/* Command History */}
            {history.length > 0 && (
              <div className='bg-muted/50 rounded-lg p-4 max-h-60 overflow-y-auto font-mono text-sm'>
                {history.map(entry => (
                  <div key={entry.id} className='mb-3 last:mb-0'>
                    <div className='flex items-center gap-2 text-muted-foreground'>
                      <Clock className='h-3 w-3' />
                      <span className='text-xs'>
                        {entry.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <div className='flex items-start gap-2 mt-1'>
                      <span className='text-green-500'>$</span>
                      <span className='text-foreground'>{entry.command}</span>
                    </div>
                    <div className='flex items-start gap-2 mt-1 ml-4'>
                      {entry.result.success ? (
                        <CheckCircle className='h-4 w-4 text-green-500 flex-shrink-0 mt-0.5' />
                      ) : (
                        <XCircle className='h-4 w-4 text-red-500 flex-shrink-0 mt-0.5' />
                      )}
                      <span
                        className={
                          entry.result.success
                            ? 'text-muted-foreground'
                            : 'text-red-400'
                        }
                      >
                        {entry.result.message}
                      </span>
                    </div>
                    {entry.result.note && (
                      <div className='flex items-start gap-2 mt-1 ml-4'>
                        <AlertTriangle className='h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5' />
                        <span className='text-yellow-400 text-xs'>
                          {entry.result.note}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={historyEndRef} />
              </div>
            )}

            {/* Command Input */}
            <div className='space-y-3'>
              <div className='grid grid-cols-1 md:grid-cols-4 gap-3'>
                <div className='md:col-span-3'>
                  <Label htmlFor='command' className='sr-only'>
                    Command
                  </Label>
                  <div className='relative'>
                    <span className='absolute left-3 top-1/2 -translate-y-1/2 text-green-500 font-mono'>
                      $
                    </span>
                    <Input
                      ref={commandInputRef}
                      id='command'
                      placeholder='Enter god command (e.g., "goto 3001", "peace")'
                      value={command}
                      onChange={e => setCommand(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className='pl-7 font-mono'
                      disabled={commandLoading}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor='executor' className='sr-only'>
                    Executor
                  </Label>
                  <Input
                    id='executor'
                    placeholder='Executor (optional)'
                    value={executor}
                    onChange={e => setExecutor(e.target.value)}
                    disabled={commandLoading}
                  />
                </div>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-xs text-muted-foreground'>
                  Press Enter to execute • Arrow Up/Down to navigate history
                </span>
                <Button
                  onClick={handleExecuteCommand}
                  disabled={!command.trim() || commandLoading}
                >
                  <Send className='h-4 w-4 mr-2' />
                  {commandLoading ? 'Executing...' : 'Execute'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Broadcast Panel */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Megaphone className='h-5 w-5' />
              Broadcast Message
            </CardTitle>
            <CardDescription>
              Send a message to all online players
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-4 gap-3'>
              <div className='md:col-span-3'>
                <Label htmlFor='broadcast-message'>Message</Label>
                <Textarea
                  id='broadcast-message'
                  placeholder='Enter message to broadcast to all players...'
                  value={broadcastText}
                  onChange={e => setBroadcastText(e.target.value)}
                  disabled={broadcastLoading}
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor='broadcast-sender'>Sender Name</Label>
                <Input
                  id='broadcast-sender'
                  placeholder='Optional sender'
                  value={broadcastSender}
                  onChange={e => setBroadcastSender(e.target.value)}
                  disabled={broadcastLoading}
                />
              </div>
            </div>
            <div className='flex justify-end'>
              <Button
                onClick={handleBroadcast}
                disabled={!broadcastText.trim() || broadcastLoading}
                variant='secondary'
              >
                <Megaphone className='h-4 w-4 mr-2' />
                {broadcastLoading ? 'Broadcasting...' : 'Broadcast'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Commands */}
        <Card>
          <CardHeader>
            <CardTitle className='text-sm font-medium'>
              Quick Commands
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex flex-wrap gap-2'>
              {[
                { cmd: 'who', label: 'Who' },
                { cmd: 'users', label: 'Users' },
                { cmd: 'stat world', label: 'World Stats' },
                { cmd: 'show zones', label: 'Show Zones' },
                { cmd: 'peace', label: 'Peace' },
                { cmd: 'purge', label: 'Purge Room' },
              ].map(({ cmd, label }) => (
                <Badge
                  key={cmd}
                  variant='outline'
                  className='cursor-pointer hover:bg-accent'
                  onClick={() => {
                    setCommand(cmd);
                    commandInputRef.current?.focus();
                  }}
                >
                  {label}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
