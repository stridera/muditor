'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { Lock, Loader2, MessageSquare, Search, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

const GET_BOARDS = gql`
  query GetBoardsPage {
    boards {
      id
      alias
      title
      locked
      messageCount
      createdAt
      updatedAt
    }
    boardsCount
  }
`;

interface Board {
  id: number;
  alias: string;
  title: string;
  locked: boolean;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

interface GetBoardsQueryResult {
  boards: Board[];
  boardsCount: number;
}

export default function BoardsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data, loading, error } = useQuery<GetBoardsQueryResult>(GET_BOARDS);

  const filteredBoards = useMemo(() => {
    const boards: Board[] = data?.boards || [];
    if (!searchQuery) return boards;
    const query = searchQuery.toLowerCase();
    return boards.filter(
      (board: Board) =>
        board.alias.toLowerCase().includes(query) ||
        board.title.toLowerCase().includes(query)
    );
  }, [data, searchQuery]);

  if (loading) {
    return (
      <div className='flex items-center justify-center h-96'>
        <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
      </div>
    );
  }

  if (error) {
    return (
      <div className='container mx-auto p-6'>
        <Alert className='bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800'>
          <XCircle className='h-4 w-4 text-red-600 dark:text-red-400' />
          <AlertDescription className='text-red-800 dark:text-red-300'>
            Error loading boards: {error.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className='container mx-auto p-6'>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold text-foreground mb-2'>
          Bulletin Boards
        </h1>
        <p className='text-muted-foreground'>
          Community message boards - {data?.boardsCount || 0} boards
        </p>
      </div>

      <div className='flex justify-between items-center mb-6 gap-4'>
        <div className='relative max-w-sm flex-1'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Search boards...'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className='pl-10'
          />
        </div>
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {filteredBoards.length > 0 ? (
          filteredBoards.map((board: Board) => (
            <Link key={board.id} href={`/dashboard/boards/${board.id}`}>
              <Card className='cursor-pointer transition-all hover:shadow-md hover:border-primary/50'>
                <CardHeader className='pb-3'>
                  <div className='flex items-start justify-between'>
                    <CardTitle className='text-lg font-semibold flex items-center gap-2'>
                      {board.title}
                      {board.locked && (
                        <Lock className='h-4 w-4 text-yellow-500' />
                      )}
                    </CardTitle>
                  </div>
                  <p className='text-sm text-muted-foreground font-mono'>
                    {board.alias}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                      <MessageSquare className='h-4 w-4' />
                      <span>
                        {board.messageCount}{' '}
                        {board.messageCount === 1 ? 'message' : 'messages'}
                      </span>
                    </div>
                    <Button variant='ghost' size='sm'>
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <div className='col-span-full text-center py-12 text-muted-foreground'>
            {searchQuery ? 'No boards match your search' : 'No boards found'}
          </div>
        )}
      </div>
    </div>
  );
}
