'use client';

import { PermissionGuard } from '@/components/auth/permission-guard';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loading } from '@/components/ui/loading';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  DeleteAccountMailDocument,
  DeletePlayerMailDocument,
  GetAllAccountMailDocument,
  GetAllPlayerMailsDocument,
  SendBroadcastDocument,
  type GetAllAccountMailQuery,
  type GetAllPlayerMailsQuery,
} from '@/generated/graphql';
import { useErrorHandler } from '@/lib/error-utils';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  Coins,
  Eye,
  Mail,
  Megaphone,
  Package,
  Trash2,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function AdminMailPage() {
  return (
    <PermissionGuard requireCoder>
      <AdminMailContent />
    </PermissionGuard>
  );
}

function AdminMailContent() {
  const [activeTab, setActiveTab] = useState('player-mail');
  const [broadcastDialogOpen, setBroadcastDialogOpen] = useState(false);
  const [selectedMail, setSelectedMail] = useState<
    PlayerMail | AccountMail | null
  >(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const {
    data: playerMailData,
    loading: playerMailLoading,
    refetch: refetchPlayerMail,
  } = useQuery<GetAllPlayerMailsQuery>(GetAllPlayerMailsDocument, {
    variables: { take: 100 },
  });

  const {
    data: accountMailData,
    loading: accountMailLoading,
    refetch: refetchAccountMail,
  } = useQuery<GetAllAccountMailQuery>(GetAllAccountMailDocument, {
    variables: { take: 100 },
  });

  const [deletePlayerMail] = useMutation(DeletePlayerMailDocument);
  const [deleteAccountMail] = useMutation(DeleteAccountMailDocument);
  const [sendBroadcast] = useMutation(SendBroadcastDocument);
  const { handleError } = useErrorHandler();

  const playerMails = playerMailData?.playerMails || [];
  const accountMails = accountMailData?.allAccountMail || [];

  const handleDeletePlayerMail = async (id: number) => {
    try {
      await deletePlayerMail({ variables: { id } });
      toast.success('Player mail deleted');
      refetchPlayerMail();
    } catch (err) {
      const errorDisplay = handleError(err, 'deleting player mail');
      toast.error(errorDisplay.message);
    }
  };

  const handleDeleteAccountMail = async (id: number) => {
    try {
      await deleteAccountMail({ variables: { id } });
      toast.success('Account mail deleted');
      refetchAccountMail();
    } catch (err) {
      const errorDisplay = handleError(err, 'deleting account mail');
      toast.error(errorDisplay.message);
    }
  };

  const handleSendBroadcast = async (subject: string, body: string) => {
    try {
      const result = await sendBroadcast({
        variables: { data: { subject, body } },
      });
      const count = result.data?.sendBroadcast || 0;
      toast.success(`Broadcast sent to ${count} users`);
      setBroadcastDialogOpen(false);
      refetchAccountMail();
    } catch (err) {
      const errorDisplay = handleError(err, 'sending broadcast');
      toast.error(errorDisplay.message);
    }
  };

  const formatCurrency = (
    copper: number,
    silver: number,
    gold: number,
    platinum: number
  ) => {
    const parts = [];
    if (platinum > 0) parts.push(`${platinum}pp`);
    if (gold > 0) parts.push(`${gold}gp`);
    if (silver > 0) parts.push(`${silver}sp`);
    if (copper > 0) parts.push(`${copper}cp`);
    return parts.length > 0 ? parts.join(' ') : '-';
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold flex items-center gap-2'>
            <Mail className='h-6 w-6' />
            Mail Administration
          </h1>
          <p className='text-muted-foreground'>
            View and manage all player and account mail
          </p>
        </div>
        <Dialog
          open={broadcastDialogOpen}
          onOpenChange={setBroadcastDialogOpen}
        >
          <DialogTrigger asChild>
            <Button>
              <Megaphone className='h-4 w-4 mr-2' />
              Send Broadcast
            </Button>
          </DialogTrigger>
          <BroadcastDialog
            onSend={handleSendBroadcast}
            onClose={() => setBroadcastDialogOpen(false)}
          />
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value='player-mail' className='flex items-center gap-2'>
            <Users className='h-4 w-4' />
            Player Mail ({playerMails.length})
          </TabsTrigger>
          <TabsTrigger value='account-mail' className='flex items-center gap-2'>
            <Mail className='h-4 w-4' />
            Account Mail ({accountMails.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value='player-mail'>
          <Card>
            <CardHeader>
              <CardTitle>Player Mail (Character-to-Character)</CardTitle>
              <CardDescription>
                In-game mail between player characters with wealth and item
                attachments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {playerMailLoading ? (
                <Loading text='Loading player mail...' />
              ) : playerMails.length === 0 ? (
                <div className='text-center py-8 text-muted-foreground'>
                  No player mail found
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>From</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Attachments</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {playerMails.map(mail => (
                      <TableRow key={mail.id}>
                        <TableCell className='font-medium'>
                          {mail.senderName}
                        </TableCell>
                        <TableCell>
                          {mail.recipient?.name || mail.recipientCharacterId}
                        </TableCell>
                        <TableCell>
                          {new Date(mail.sentAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className='flex gap-1'>
                            {(mail.attachedCopper > 0 ||
                              mail.attachedSilver > 0 ||
                              mail.attachedGold > 0 ||
                              mail.attachedPlatinum > 0) && (
                              <Badge
                                variant='secondary'
                                className='flex items-center gap-1'
                              >
                                <Coins className='h-3 w-3' />
                                {formatCurrency(
                                  mail.attachedCopper,
                                  mail.attachedSilver,
                                  mail.attachedGold,
                                  mail.attachedPlatinum
                                )}
                              </Badge>
                            )}
                            {mail.attachedObject && (
                              <Badge
                                variant='outline'
                                className='flex items-center gap-1'
                              >
                                <Package className='h-3 w-3' />
                                {mail.attachedObject.name}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='flex flex-col gap-1'>
                            {mail.readAt ? (
                              <Badge variant='secondary'>Read</Badge>
                            ) : (
                              <Badge>Unread</Badge>
                            )}
                            {mail.isDeleted && (
                              <Badge variant='destructive'>Deleted</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='flex gap-2'>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => {
                                setSelectedMail(mail);
                                setViewDialogOpen(true);
                              }}
                            >
                              <Eye className='h-4 w-4' />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant='outline' size='sm'>
                                  <Trash2 className='h-4 w-4' />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete Mail
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this mail?
                                    This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleDeletePlayerMail(mail.id)
                                    }
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='account-mail'>
          <Card>
            <CardHeader>
              <CardTitle>Account Mail (Account-to-Account)</CardTitle>
              <CardDescription>
                Direct messages between user accounts and broadcast
                announcements
              </CardDescription>
            </CardHeader>
            <CardContent>
              {accountMailLoading ? (
                <Loading text='Loading account mail...' />
              ) : accountMails.length === 0 ? (
                <div className='text-center py-8 text-muted-foreground'>
                  No account mail found
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>From</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accountMails.map(mail => (
                      <TableRow key={mail.id}>
                        <TableCell className='font-medium'>
                          {mail.senderName}
                        </TableCell>
                        <TableCell>
                          {mail.isBroadcast
                            ? 'All Users'
                            : mail.recipient?.username || mail.recipientUserId}
                        </TableCell>
                        <TableCell className='max-w-xs truncate'>
                          {mail.subject}
                        </TableCell>
                        <TableCell>
                          {new Date(mail.sentAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {mail.isBroadcast ? (
                            <Badge variant='secondary'>
                              <Megaphone className='h-3 w-3 mr-1' />
                              Broadcast
                            </Badge>
                          ) : (
                            <Badge variant='outline'>Direct</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className='flex flex-col gap-1'>
                            {mail.readAt ? (
                              <Badge variant='secondary'>Read</Badge>
                            ) : (
                              <Badge>Unread</Badge>
                            )}
                            {mail.isDeleted && (
                              <Badge variant='destructive'>Deleted</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='flex gap-2'>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => {
                                setSelectedMail(mail);
                                setViewDialogOpen(true);
                              }}
                            >
                              <Eye className='h-4 w-4' />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant='outline' size='sm'>
                                  <Trash2 className='h-4 w-4' />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete Mail
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this mail?
                                    This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleDeleteAccountMail(mail.id)
                                    }
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        {selectedMail && <MailViewDialog mail={selectedMail} />}
      </Dialog>
    </div>
  );
}

type PlayerMail = NonNullable<GetAllPlayerMailsQuery['playerMails']>[0];
type AccountMail = NonNullable<GetAllAccountMailQuery['allAccountMail']>[0];

function BroadcastDialog({
  onSend,
  onClose,
}: {
  onSend: (subject: string, body: string) => void;
  onClose: () => void;
}) {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (subject.trim() && body.trim()) {
      onSend(subject, body);
    }
  };

  return (
    <DialogContent className='max-w-2xl'>
      <DialogHeader>
        <DialogTitle className='flex items-center gap-2'>
          <Megaphone className='h-5 w-5' />
          Send Broadcast
        </DialogTitle>
        <DialogDescription>
          Send a message to all users. This will appear in their account inbox.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <Label htmlFor='subject'>Subject</Label>
          <Input
            id='subject'
            placeholder='Enter broadcast subject...'
            value={subject}
            onChange={e => setSubject(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor='body'>Message</Label>
          <Textarea
            id='body'
            placeholder='Enter your message...'
            value={body}
            onChange={e => setBody(e.target.value)}
            rows={6}
            required
          />
        </div>
        <div className='flex justify-end gap-2'>
          <Button type='button' variant='outline' onClick={onClose}>
            Cancel
          </Button>
          <Button type='submit'>
            <Megaphone className='h-4 w-4 mr-2' />
            Send Broadcast
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}

function MailViewDialog({ mail }: { mail: PlayerMail | AccountMail }) {
  const isPlayerMail = 'recipientCharacterId' in mail;

  return (
    <DialogContent className='max-w-2xl'>
      <DialogHeader>
        <DialogTitle>Mail Details</DialogTitle>
        <DialogDescription>
          {isPlayerMail ? 'Player mail details' : 'Account mail details'}
        </DialogDescription>
      </DialogHeader>
      <div className='space-y-4'>
        <div className='grid grid-cols-2 gap-4'>
          <div>
            <Label className='text-muted-foreground'>From</Label>
            <p className='font-medium'>
              {isPlayerMail
                ? (mail as PlayerMail).senderName
                : (mail as AccountMail).senderName}
            </p>
          </div>
          <div>
            <Label className='text-muted-foreground'>To</Label>
            <p className='font-medium'>
              {isPlayerMail
                ? (mail as PlayerMail).recipient?.name ||
                  (mail as PlayerMail).recipientCharacterId
                : (mail as AccountMail).isBroadcast
                  ? 'All Users (Broadcast)'
                  : (mail as AccountMail).recipient?.username ||
                    (mail as AccountMail).recipientUserId}
            </p>
          </div>
          <div>
            <Label className='text-muted-foreground'>Sent</Label>
            <p>{new Date(mail.sentAt).toLocaleString()}</p>
          </div>
          <div>
            <Label className='text-muted-foreground'>Read</Label>
            <p>
              {mail.readAt ? new Date(mail.readAt).toLocaleString() : 'Not yet'}
            </p>
          </div>
        </div>

        {!isPlayerMail && (mail as AccountMail).subject && (
          <div>
            <Label className='text-muted-foreground'>Subject</Label>
            <p className='font-medium'>{(mail as AccountMail).subject}</p>
          </div>
        )}

        <div>
          <Label className='text-muted-foreground'>Message</Label>
          <div className='mt-1 p-3 bg-muted rounded-md whitespace-pre-wrap'>
            {isPlayerMail
              ? (mail as PlayerMail).body
              : (mail as AccountMail).body}
          </div>
        </div>

        {isPlayerMail && (
          <>
            {((mail as PlayerMail).attachedCopper > 0 ||
              (mail as PlayerMail).attachedSilver > 0 ||
              (mail as PlayerMail).attachedGold > 0 ||
              (mail as PlayerMail).attachedPlatinum > 0) && (
              <div>
                <Label className='text-muted-foreground'>Attached Wealth</Label>
                <div className='flex gap-2 mt-1'>
                  {(mail as PlayerMail).attachedPlatinum > 0 && (
                    <Badge>
                      {(mail as PlayerMail).attachedPlatinum} Platinum
                    </Badge>
                  )}
                  {(mail as PlayerMail).attachedGold > 0 && (
                    <Badge variant='secondary'>
                      {(mail as PlayerMail).attachedGold} Gold
                    </Badge>
                  )}
                  {(mail as PlayerMail).attachedSilver > 0 && (
                    <Badge variant='outline'>
                      {(mail as PlayerMail).attachedSilver} Silver
                    </Badge>
                  )}
                  {(mail as PlayerMail).attachedCopper > 0 && (
                    <Badge variant='outline'>
                      {(mail as PlayerMail).attachedCopper} Copper
                    </Badge>
                  )}
                </div>
                {(mail as PlayerMail).wealthRetrievalInfo && (
                  <p className='text-sm text-muted-foreground mt-1'>
                    {(mail as PlayerMail).wealthRetrievalInfo}
                  </p>
                )}
              </div>
            )}

            {(mail as PlayerMail).attachedObject && (
              <div>
                <Label className='text-muted-foreground'>Attached Item</Label>
                <Badge variant='secondary' className='mt-1'>
                  <Package className='h-3 w-3 mr-1' />
                  {(mail as PlayerMail).attachedObject?.name}
                </Badge>
                {(mail as PlayerMail).objectRetrievalInfo && (
                  <p className='text-sm text-muted-foreground mt-1'>
                    {(mail as PlayerMail).objectRetrievalInfo}
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </DialogContent>
  );
}
