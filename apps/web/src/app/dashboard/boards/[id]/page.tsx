'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ColoredTextEditor } from '@/components/ColoredTextEditor';
import { ColoredTextViewer } from '@/components/ColoredTextViewer';
import { useAuth } from '@/contexts/auth-context';
import { usePermissions } from '@/hooks/use-permissions';
import { gql } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Edit,
  Loader2,
  Lock,
  Pin,
  Plus,
  Trash2,
  User,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';

const GET_BOARD = gql`
  query GetBoardPage($id: Int!) {
    board(id: $id) {
      id
      alias
      title
      locked
      privileges
      messageCount
      messages {
        id
        poster
        posterLevel
        postedAt
        subject
        content
        sticky
        edits {
          id
          editor
          editedAt
        }
      }
    }
  }
`;

const CREATE_MESSAGE = gql`
  mutation CreateBoardMessagePage($data: CreateBoardMessageInput!) {
    createBoardMessage(data: $data) {
      id
      poster
      subject
      content
      postedAt
    }
  }
`;

const UPDATE_MESSAGE = gql`
  mutation UpdateBoardMessagePage(
    $id: Int!
    $data: UpdateBoardMessageInput!
    $editor: String
  ) {
    updateBoardMessage(id: $id, data: $data, editor: $editor) {
      id
      subject
      content
    }
  }
`;

const DELETE_MESSAGE = gql`
  mutation DeleteBoardMessagePage($id: Int!) {
    deleteBoardMessage(id: $id) {
      id
    }
  }
`;

interface BoardMessage {
  id: number;
  poster: string;
  posterLevel: number;
  postedAt: string;
  subject: string;
  content: string;
  sticky: boolean;
  edits: { id: number; editor: string; editedAt: string }[];
}

interface Board {
  id: number;
  alias: string;
  title: string;
  locked: boolean;
  privileges: unknown;
  messageCount: number;
  messages: BoardMessage[];
}

interface GetBoardQueryResult {
  board: Board | null;
}

export default function BoardDetailPage() {
  const params = useParams();
  const boardId = parseInt(params.id as string, 10);
  const { user } = useAuth();
  const { isGod, isBuilder } = usePermissions();

  const [selectedMessage, setSelectedMessage] = useState<BoardMessage | null>(
    null
  );
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Form state
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [sticky, setSticky] = useState(false);

  const { data, loading, error, refetch } = useQuery<GetBoardQueryResult>(
    GET_BOARD,
    {
      variables: { id: boardId },
      skip: isNaN(boardId),
    }
  );

  const [createMessage, { loading: creating }] = useMutation(CREATE_MESSAGE, {
    onCompleted: () => {
      setSuccessMessage('Message posted successfully');
      setErrorMessage('');
      setIsComposeOpen(false);
      resetForm();
      refetch();
      setTimeout(() => setSuccessMessage(''), 5000);
    },
    onError: err => {
      setErrorMessage(err.message);
      setSuccessMessage('');
    },
  });

  const [updateMessage, { loading: updating }] = useMutation(UPDATE_MESSAGE, {
    onCompleted: () => {
      setSuccessMessage('Message updated successfully');
      setErrorMessage('');
      setIsEditOpen(false);
      setSelectedMessage(null);
      refetch();
      setTimeout(() => setSuccessMessage(''), 5000);
    },
    onError: err => {
      setErrorMessage(err.message);
      setSuccessMessage('');
    },
  });

  const [deleteMessage, { loading: deleting }] = useMutation(DELETE_MESSAGE, {
    onCompleted: () => {
      setSuccessMessage('Message deleted successfully');
      setErrorMessage('');
      setIsDeleteOpen(false);
      setSelectedMessage(null);
      refetch();
      setTimeout(() => setSuccessMessage(''), 5000);
    },
    onError: err => {
      setErrorMessage(err.message);
      setSuccessMessage('');
    },
  });

  const board: Board | null = data?.board || null;

  const resetForm = () => {
    setSubject('');
    setContent('');
    setSticky(false);
  };

  const handleCompose = () => {
    resetForm();
    setIsComposeOpen(true);
  };

  const handleEdit = (message: BoardMessage) => {
    setSelectedMessage(message);
    setSubject(message.subject);
    setContent(message.content);
    setSticky(message.sticky);
    setIsEditOpen(true);
  };

  const handleDelete = (message: BoardMessage) => {
    setSelectedMessage(message);
    setIsDeleteOpen(true);
  };

  const handleSubmitCompose = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMessage({
      variables: {
        data: {
          boardId,
          poster: user?.username || 'Anonymous',
          posterLevel: 100, // TODO: Get actual character level
          subject,
          content,
          sticky,
        },
      },
    });
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMessage) return;
    await updateMessage({
      variables: {
        id: selectedMessage.id,
        data: { subject, content, sticky },
        editor: user?.username || 'Editor',
      },
    });
  };

  const handleConfirmDelete = async () => {
    if (!selectedMessage) return;
    await deleteMessage({
      variables: { id: selectedMessage.id },
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const canPost = isBuilder || isGod;
  const canEdit = (message: BoardMessage) => {
    if (isGod) return true;
    if (isBuilder && message.poster === user?.username) return true;
    return false;
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center h-96'>
        <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
      </div>
    );
  }

  if (error || !board) {
    return (
      <div className='container mx-auto p-6'>
        <Alert className='bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800'>
          <XCircle className='h-4 w-4 text-red-600 dark:text-red-400' />
          <AlertDescription className='text-red-800 dark:text-red-300'>
            {error?.message || 'Board not found'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className='container mx-auto p-6'>
      {/* Header */}
      <div className='mb-6'>
        <Link
          href='/dashboard/boards'
          className='inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4'
        >
          <ArrowLeft className='h-4 w-4' />
          Back to Boards
        </Link>
        <div className='flex items-start justify-between'>
          <div>
            <h1 className='text-3xl font-bold text-foreground mb-1 flex items-center gap-2'>
              {board.title}
              {board.locked && <Lock className='h-6 w-6 text-yellow-500' />}
            </h1>
            <p className='text-muted-foreground'>
              <span className='font-mono'>{board.alias}</span> -{' '}
              {board.messageCount} messages
            </p>
          </div>
          {canPost && !board.locked && (
            <Button onClick={handleCompose}>
              <Plus className='h-4 w-4 mr-2' />
              New Post
            </Button>
          )}
        </div>
      </div>

      {successMessage && (
        <Alert className='mb-4 bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800'>
          <CheckCircle className='h-4 w-4 text-green-600 dark:text-green-400' />
          <AlertDescription className='text-green-800 dark:text-green-300'>
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      {errorMessage && (
        <Alert className='mb-4 bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800'>
          <XCircle className='h-4 w-4 text-red-600 dark:text-red-400' />
          <AlertDescription className='text-red-800 dark:text-red-300'>
            {errorMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* Messages */}
      <div className='space-y-4'>
        {board.messages && board.messages.length > 0 ? (
          board.messages.map((message: BoardMessage) => (
            <Card
              key={message.id}
              className={
                message.sticky ? 'border-yellow-500/50 bg-yellow-50/10' : ''
              }
            >
              <CardHeader className='pb-3'>
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <CardTitle className='text-lg font-semibold flex items-center gap-2'>
                      {message.sticky && (
                        <Pin className='h-4 w-4 text-yellow-500' />
                      )}
                      {message.subject}
                    </CardTitle>
                    <div className='flex items-center gap-4 mt-1 text-sm text-muted-foreground'>
                      <span className='flex items-center gap-1'>
                        <User className='h-3 w-3' />
                        {message.poster}
                        <span className='text-xs'>
                          (Lv {message.posterLevel})
                        </span>
                      </span>
                      <span className='flex items-center gap-1'>
                        <Clock className='h-3 w-3' />
                        {formatDate(message.postedAt)}
                      </span>
                      {message.edits.length > 0 && (
                        <span className='text-xs italic'>
                          (edited {message.edits.length} time
                          {message.edits.length > 1 ? 's' : ''})
                        </span>
                      )}
                    </div>
                  </div>
                  {canEdit(message) && (
                    <div className='flex gap-1'>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => handleEdit(message)}
                      >
                        <Edit className='h-4 w-4' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => handleDelete(message)}
                      >
                        <Trash2 className='h-4 w-4 text-red-500' />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className='prose prose-sm dark:prose-invert max-w-none font-mono text-sm'>
                  <ColoredTextViewer markup={message.content} />
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className='py-12 text-center text-muted-foreground'>
              No messages on this board yet.
              {canPost && !board.locked && (
                <div className='mt-4'>
                  <Button onClick={handleCompose}>
                    <Plus className='h-4 w-4 mr-2' />
                    Be the first to post
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Compose Dialog */}
      <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
        <DialogContent className='sm:max-w-[700px] max-h-[90vh] overflow-y-auto'>
          <form onSubmit={handleSubmitCompose}>
            <DialogHeader>
              <DialogTitle>New Post</DialogTitle>
              <DialogDescription>
                Compose a new message for {board.title}
              </DialogDescription>
            </DialogHeader>

            <div className='space-y-4 mt-4'>
              <div>
                <Label htmlFor='subject'>Subject</Label>
                <Input
                  id='subject'
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder='Enter subject...'
                  required
                />
              </div>

              <div>
                <Label htmlFor='content'>Message</Label>
                <ColoredTextEditor
                  value={content}
                  onChange={setContent}
                  placeholder='Write your message...'
                  showPreview={true}
                />
              </div>

              {isGod && (
                <div className='flex items-center gap-2'>
                  <input
                    type='checkbox'
                    id='sticky'
                    checked={sticky}
                    onChange={e => setSticky(e.target.checked)}
                    className='rounded border-gray-300'
                  />
                  <Label htmlFor='sticky' className='cursor-pointer'>
                    Pin this message (sticky)
                  </Label>
                </div>
              )}
            </div>

            <DialogFooter className='mt-6'>
              <Button
                type='button'
                variant='outline'
                onClick={() => setIsComposeOpen(false)}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={creating || !subject || !content}>
                {creating && <Loader2 className='h-4 w-4 mr-2 animate-spin' />}
                Post
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className='sm:max-w-[700px] max-h-[90vh] overflow-y-auto'>
          <form onSubmit={handleSubmitEdit}>
            <DialogHeader>
              <DialogTitle>Edit Message</DialogTitle>
              <DialogDescription>
                Update your message on {board.title}
              </DialogDescription>
            </DialogHeader>

            <div className='space-y-4 mt-4'>
              <div>
                <Label htmlFor='editSubject'>Subject</Label>
                <Input
                  id='editSubject'
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder='Enter subject...'
                  required
                />
              </div>

              <div>
                <Label htmlFor='editContent'>Message</Label>
                <ColoredTextEditor
                  value={content}
                  onChange={setContent}
                  placeholder='Write your message...'
                  showPreview={true}
                />
              </div>

              {isGod && (
                <div className='flex items-center gap-2'>
                  <input
                    type='checkbox'
                    id='editSticky'
                    checked={sticky}
                    onChange={e => setSticky(e.target.checked)}
                    className='rounded border-gray-300'
                  />
                  <Label htmlFor='editSticky' className='cursor-pointer'>
                    Pin this message (sticky)
                  </Label>
                </div>
              )}
            </div>

            <DialogFooter className='mt-6'>
              <Button
                type='button'
                variant='outline'
                onClick={() => setIsEditOpen(false)}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={updating || !subject || !content}>
                {updating && <Loader2 className='h-4 w-4 mr-2 animate-spin' />}
                Update
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className='sm:max-w-[400px]'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-red-600'>
              <Trash2 className='h-5 w-5' />
              Delete Message
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{selectedMessage?.subject}
              &quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className='mt-6'>
            <Button
              type='button'
              variant='outline'
              onClick={() => setIsDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type='button'
              variant='destructive'
              onClick={handleConfirmDelete}
              disabled={deleting}
            >
              {deleting && <Loader2 className='h-4 w-4 mr-2 animate-spin' />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
