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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  GetMyAccountMailDocument,
  GetMyCharactersDocument,
  GetMyMailDocument,
  MarkAccountMailReadDocument,
  MarkObjectRetrievedDocument,
  MarkPlayerMailReadDocument,
  MarkWealthRetrievedDocument,
  SendAccountMailDocument,
  SendPlayerMailDocument,
  type GetMyAccountMailQuery,
  type GetMyCharactersQuery,
  type GetMyMailQuery,
} from '@/generated/graphql';
import { useErrorHandler } from '@/lib/error-utils';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  ArrowDownToLine,
  Coins,
  Inbox,
  Mail,
  Package,
  PenSquare,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

type PlayerMail = NonNullable<GetMyMailQuery['myMail']>[0];
type AccountMail = NonNullable<GetMyAccountMailQuery['myAccountMail']>[0];
type Character = NonNullable<GetMyCharactersQuery['myCharacters']>[0];

export default function PlayerMailboxPage() {
  const [activeTab, setActiveTab] = useState('character-mail');
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(
    null
  );
  const [composeDialogOpen, setComposeDialogOpen] = useState(false);
  const [composeType, setComposeType] = useState<'player' | 'account'>(
    'player'
  );
  const [selectedMail, setSelectedMail] = useState<
    PlayerMail | AccountMail | null
  >(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const { data: charactersData, loading: charactersLoading } =
    useQuery<GetMyCharactersQuery>(GetMyCharactersDocument);

  const characters = charactersData?.myCharacters || [];

  // Auto-select first character if none selected
  if (!selectedCharacterId && characters.length > 0 && characters[0]) {
    setSelectedCharacterId(characters[0].id);
  }

  const {
    data: playerMailData,
    loading: playerMailLoading,
    refetch: refetchPlayerMail,
  } = useQuery<GetMyMailQuery>(GetMyMailDocument, {
    variables: { characterId: selectedCharacterId || '' },
    skip: !selectedCharacterId,
  });

  const {
    data: accountMailData,
    loading: accountMailLoading,
    refetch: refetchAccountMail,
  } = useQuery<GetMyAccountMailQuery>(GetMyAccountMailDocument);

  const [sendPlayerMail] = useMutation(SendPlayerMailDocument);
  const [sendAccountMail] = useMutation(SendAccountMailDocument);
  const [markPlayerMailRead] = useMutation(MarkPlayerMailReadDocument);
  const [markAccountMailRead] = useMutation(MarkAccountMailReadDocument);
  const [markWealthRetrieved] = useMutation(MarkWealthRetrievedDocument);
  const [markObjectRetrieved] = useMutation(MarkObjectRetrievedDocument);
  const { handleError } = useErrorHandler();

  const playerMails = playerMailData?.myMail || [];
  const accountMails = accountMailData?.myAccountMail || [];

  const handleSendPlayerMail = async (data: {
    recipientCharacterId: string;
    body: string;
    attachedCopper?: number;
    attachedSilver?: number;
    attachedGold?: number;
    attachedPlatinum?: number;
  }) => {
    if (!selectedCharacterId) {
      toast.error('Please select a character first');
      return;
    }
    try {
      await sendPlayerMail({
        variables: {
          data: {
            senderCharacterId: selectedCharacterId,
            ...data,
          },
        },
      });
      toast.success('Mail sent!');
      setComposeDialogOpen(false);
      refetchPlayerMail();
    } catch (err) {
      const errorDisplay = handleError(err, 'sending mail');
      toast.error(errorDisplay.message);
    }
  };

  const handleSendAccountMail = async (data: {
    recipientUserId: string;
    subject: string;
    body: string;
  }) => {
    try {
      await sendAccountMail({ variables: { data } });
      toast.success('Message sent!');
      setComposeDialogOpen(false);
      refetchAccountMail();
    } catch (err) {
      const errorDisplay = handleError(err, 'sending message');
      toast.error(errorDisplay.message);
    }
  };

  const handleMarkPlayerMailRead = async (mail: PlayerMail) => {
    if (mail.readAt) return;
    try {
      await markPlayerMailRead({ variables: { id: mail.id } });
      refetchPlayerMail();
    } catch (err) {
      const errorDisplay = handleError(err, 'marking mail as read');
      toast.error(errorDisplay.message);
    }
  };

  const handleMarkAccountMailRead = async (mail: AccountMail) => {
    if (mail.readAt) return;
    try {
      await markAccountMailRead({ variables: { id: mail.id } });
      refetchAccountMail();
    } catch (err) {
      const errorDisplay = handleError(err, 'marking mail as read');
      toast.error(errorDisplay.message);
    }
  };

  const handleRetrieveWealth = async (mail: PlayerMail) => {
    if (!selectedCharacterId) return;
    try {
      await markWealthRetrieved({
        variables: { id: mail.id, characterId: selectedCharacterId },
      });
      toast.success('Wealth retrieved!');
      refetchPlayerMail();
    } catch (err) {
      const errorDisplay = handleError(err, 'retrieving wealth');
      toast.error(errorDisplay.message);
    }
  };

  const handleRetrieveObject = async (
    mail: PlayerMail,
    toAccountStorage: boolean
  ) => {
    if (!selectedCharacterId) return;
    try {
      await markObjectRetrieved({
        variables: {
          id: mail.id,
          characterId: selectedCharacterId,
          movedToAccountStorage: toAccountStorage,
        },
      });
      toast.success(
        toAccountStorage ? 'Item moved to account storage!' : 'Item retrieved!'
      );
      refetchPlayerMail();
    } catch (err) {
      const errorDisplay = handleError(err, 'retrieving item');
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

  const hasUnretrievedWealth = (mail: PlayerMail) =>
    !mail.wealthRetrievedAt &&
    (mail.attachedCopper > 0 ||
      mail.attachedSilver > 0 ||
      mail.attachedGold > 0 ||
      mail.attachedPlatinum > 0);

  const hasUnretrievedObject = (mail: PlayerMail) =>
    !mail.objectRetrievedAt && mail.attachedObject;

  if (charactersLoading) {
    return <Loading text='Loading characters...' />;
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold flex items-center gap-2'>
            <Inbox className='h-6 w-6' />
            Mailbox
          </h1>
          <p className='text-muted-foreground'>
            View and send in-game mail and account messages
          </p>
        </div>
        <Dialog open={composeDialogOpen} onOpenChange={setComposeDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PenSquare className='h-4 w-4 mr-2' />
              Compose
            </Button>
          </DialogTrigger>
          <ComposeDialog
            type={composeType}
            setType={setComposeType}
            characters={characters}
            selectedCharacterId={selectedCharacterId}
            onSendPlayerMail={handleSendPlayerMail}
            onSendAccountMail={handleSendAccountMail}
            onClose={() => setComposeDialogOpen(false)}
          />
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger
            value='character-mail'
            className='flex items-center gap-2'
          >
            <Users className='h-4 w-4' />
            Character Mail ({playerMails.length})
          </TabsTrigger>
          <TabsTrigger value='account-mail' className='flex items-center gap-2'>
            <Mail className='h-4 w-4' />
            Account Inbox ({accountMails.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value='character-mail'>
          <Card>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <div>
                  <CardTitle>Character Mail</CardTitle>
                  <CardDescription>
                    In-game mail for your characters with wealth and item
                    attachments
                  </CardDescription>
                </div>
                {characters.length > 0 && (
                  <Select
                    value={selectedCharacterId || ''}
                    onValueChange={setSelectedCharacterId}
                  >
                    <SelectTrigger className='w-48'>
                      <SelectValue placeholder='Select character' />
                    </SelectTrigger>
                    <SelectContent>
                      {characters.map(char => (
                        <SelectItem key={char.id} value={char.id}>
                          {char.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {characters.length === 0 ? (
                <div className='text-center py-8 text-muted-foreground'>
                  You don't have any characters yet. Create one to access
                  character mail.
                </div>
              ) : playerMailLoading ? (
                <Loading text='Loading mail...' />
              ) : playerMails.length === 0 ? (
                <div className='text-center py-8 text-muted-foreground'>
                  No mail for this character
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>From</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Attachments</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {playerMails.map(mail => (
                      <TableRow
                        key={mail.id}
                        className={!mail.readAt ? 'font-semibold' : ''}
                      >
                        <TableCell>{mail.senderName}</TableCell>
                        <TableCell>
                          {new Date(mail.sentAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className='flex gap-1 flex-wrap'>
                            {(mail.attachedCopper > 0 ||
                              mail.attachedSilver > 0 ||
                              mail.attachedGold > 0 ||
                              mail.attachedPlatinum > 0) && (
                              <Badge
                                variant={
                                  mail.wealthRetrievedAt
                                    ? 'secondary'
                                    : 'default'
                                }
                                className='flex items-center gap-1'
                              >
                                <Coins className='h-3 w-3' />
                                {formatCurrency(
                                  mail.attachedCopper,
                                  mail.attachedSilver,
                                  mail.attachedGold,
                                  mail.attachedPlatinum
                                )}
                                {mail.wealthRetrievedAt && ' (claimed)'}
                              </Badge>
                            )}
                            {mail.attachedObject && (
                              <Badge
                                variant={
                                  mail.objectRetrievedAt
                                    ? 'secondary'
                                    : 'outline'
                                }
                                className='flex items-center gap-1'
                              >
                                <Package className='h-3 w-3' />
                                {mail.attachedObject.name}
                                {mail.objectRetrievedAt &&
                                  (mail.objectMovedToAccountStorage
                                    ? ' (in storage)'
                                    : ' (claimed)')}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {mail.readAt ? (
                            <Badge variant='secondary'>Read</Badge>
                          ) : (
                            <Badge>New</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className='flex gap-2'>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => {
                                handleMarkPlayerMailRead(mail);
                                setSelectedMail(mail);
                                setViewDialogOpen(true);
                              }}
                            >
                              Read
                            </Button>
                            {hasUnretrievedWealth(mail) && (
                              <Button
                                variant='outline'
                                size='sm'
                                onClick={() => handleRetrieveWealth(mail)}
                              >
                                <ArrowDownToLine className='h-4 w-4 mr-1' />
                                Claim Coins
                              </Button>
                            )}
                            {hasUnretrievedObject(mail) && (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant='outline' size='sm'>
                                    <ArrowDownToLine className='h-4 w-4 mr-1' />
                                    Claim Item
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Claim Item</DialogTitle>
                                    <DialogDescription>
                                      Where would you like to receive{' '}
                                      {mail.attachedObject?.name}?
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className='flex gap-2 justify-end'>
                                    <Button
                                      variant='outline'
                                      onClick={() =>
                                        handleRetrieveObject(mail, false)
                                      }
                                    >
                                      To Character
                                    </Button>
                                    <Button
                                      onClick={() =>
                                        handleRetrieveObject(mail, true)
                                      }
                                    >
                                      To Account Storage
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            )}
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
              <CardTitle>Account Inbox</CardTitle>
              <CardDescription>
                Messages from other users and system announcements
              </CardDescription>
            </CardHeader>
            <CardContent>
              {accountMailLoading ? (
                <Loading text='Loading messages...' />
              ) : accountMails.length === 0 ? (
                <div className='text-center py-8 text-muted-foreground'>
                  No messages in your inbox
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>From</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accountMails.map(mail => (
                      <TableRow
                        key={mail.id}
                        className={!mail.readAt ? 'font-semibold' : ''}
                      >
                        <TableCell>{mail.senderName}</TableCell>
                        <TableCell className='max-w-xs truncate'>
                          {mail.subject}
                        </TableCell>
                        <TableCell>
                          {new Date(mail.sentAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {mail.isBroadcast ? (
                            <Badge variant='secondary'>Announcement</Badge>
                          ) : (
                            <Badge variant='outline'>Direct</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {mail.readAt ? (
                            <Badge variant='secondary'>Read</Badge>
                          ) : (
                            <Badge>New</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => {
                              handleMarkAccountMailRead(mail);
                              setSelectedMail(mail);
                              setViewDialogOpen(true);
                            }}
                          >
                            Read
                          </Button>
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
        {selectedMail && <MailReadDialog mail={selectedMail} />}
      </Dialog>
    </div>
  );
}

function ComposeDialog({
  type,
  setType,
  characters,
  selectedCharacterId,
  onSendPlayerMail,
  onSendAccountMail,
  onClose,
}: {
  type: 'player' | 'account';
  setType: (type: 'player' | 'account') => void;
  characters: Character[];
  selectedCharacterId: string | null;
  onSendPlayerMail: (data: {
    recipientCharacterId: string;
    body: string;
    attachedCopper?: number;
    attachedSilver?: number;
    attachedGold?: number;
    attachedPlatinum?: number;
  }) => void;
  onSendAccountMail: (data: {
    recipientUserId: string;
    subject: string;
    body: string;
  }) => void;
  onClose: () => void;
}) {
  const [recipientName, setRecipientName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [attachCopper, setAttachCopper] = useState(0);
  const [attachSilver, setAttachSilver] = useState(0);
  const [attachGold, setAttachGold] = useState(0);
  const [attachPlatinum, setAttachPlatinum] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (type === 'player') {
      onSendPlayerMail({
        recipientCharacterId: recipientName,
        body,
        attachedCopper: attachCopper,
        attachedSilver: attachSilver,
        attachedGold: attachGold,
        attachedPlatinum: attachPlatinum,
      });
    } else {
      onSendAccountMail({
        recipientUserId: recipientName,
        subject,
        body,
      });
    }
  };

  return (
    <DialogContent className='max-w-2xl'>
      <DialogHeader>
        <DialogTitle className='flex items-center gap-2'>
          <PenSquare className='h-5 w-5' />
          Compose Message
        </DialogTitle>
        <DialogDescription>
          Send a message to another player or account
        </DialogDescription>
      </DialogHeader>
      <Tabs
        value={type}
        onValueChange={v => setType(v as 'player' | 'account')}
      >
        <TabsList className='mb-4'>
          <TabsTrigger value='player'>
            <Users className='h-4 w-4 mr-2' />
            Character Mail
          </TabsTrigger>
          <TabsTrigger value='account'>
            <Mail className='h-4 w-4 mr-2' />
            Account Message
          </TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit} className='space-y-4'>
          {type === 'player' && (
            <>
              <div>
                <Label>Sending As</Label>
                <p className='text-sm text-muted-foreground'>
                  {characters.find(c => c.id === selectedCharacterId)?.name ||
                    'No character selected'}
                </p>
              </div>
              <div>
                <Label htmlFor='recipient'>To (Character ID)</Label>
                <Input
                  id='recipient'
                  placeholder='Enter recipient character ID...'
                  value={recipientName}
                  onChange={e => setRecipientName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor='body'>Message</Label>
                <Textarea
                  id='body'
                  placeholder='Write your message...'
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  rows={4}
                  required
                />
              </div>
              <div>
                <Label>Attach Wealth (optional)</Label>
                <div className='grid grid-cols-4 gap-2 mt-1'>
                  <div>
                    <Label className='text-xs'>Copper</Label>
                    <Input
                      type='number'
                      min={0}
                      value={attachCopper}
                      onChange={e =>
                        setAttachCopper(parseInt(e.target.value) || 0)
                      }
                    />
                  </div>
                  <div>
                    <Label className='text-xs'>Silver</Label>
                    <Input
                      type='number'
                      min={0}
                      value={attachSilver}
                      onChange={e =>
                        setAttachSilver(parseInt(e.target.value) || 0)
                      }
                    />
                  </div>
                  <div>
                    <Label className='text-xs'>Gold</Label>
                    <Input
                      type='number'
                      min={0}
                      value={attachGold}
                      onChange={e =>
                        setAttachGold(parseInt(e.target.value) || 0)
                      }
                    />
                  </div>
                  <div>
                    <Label className='text-xs'>Platinum</Label>
                    <Input
                      type='number'
                      min={0}
                      value={attachPlatinum}
                      onChange={e =>
                        setAttachPlatinum(parseInt(e.target.value) || 0)
                      }
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {type === 'account' && (
            <>
              <div>
                <Label htmlFor='recipientAccount'>To (User ID)</Label>
                <Input
                  id='recipientAccount'
                  placeholder='Enter recipient user ID...'
                  value={recipientName}
                  onChange={e => setRecipientName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor='subject'>Subject</Label>
                <Input
                  id='subject'
                  placeholder='Enter subject...'
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor='accountBody'>Message</Label>
                <Textarea
                  id='accountBody'
                  placeholder='Write your message...'
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  rows={4}
                  required
                />
              </div>
            </>
          )}

          <div className='flex justify-end gap-2'>
            <Button type='button' variant='outline' onClick={onClose}>
              Cancel
            </Button>
            <Button type='submit'>Send</Button>
          </div>
        </form>
      </Tabs>
    </DialogContent>
  );
}

function MailReadDialog({ mail }: { mail: PlayerMail | AccountMail }) {
  const isPlayerMail = 'recipientCharacterId' in mail;

  return (
    <DialogContent className='max-w-2xl'>
      <DialogHeader>
        <DialogTitle>
          {isPlayerMail ? 'Character Mail' : (mail as AccountMail).subject}
        </DialogTitle>
        <DialogDescription>
          From:{' '}
          {isPlayerMail
            ? (mail as PlayerMail).senderName
            : (mail as AccountMail).senderName}
          {' • '}
          {new Date(mail.sentAt).toLocaleString()}
        </DialogDescription>
      </DialogHeader>
      <div className='space-y-4'>
        <div className='p-4 bg-muted rounded-lg whitespace-pre-wrap'>
          {isPlayerMail
            ? (mail as PlayerMail).body
            : (mail as AccountMail).body}
        </div>

        {isPlayerMail && (
          <>
            {((mail as PlayerMail).attachedCopper > 0 ||
              (mail as PlayerMail).attachedSilver > 0 ||
              (mail as PlayerMail).attachedGold > 0 ||
              (mail as PlayerMail).attachedPlatinum > 0) && (
              <div>
                <Label className='text-muted-foreground'>Attached Wealth</Label>
                <div className='flex gap-2 mt-1 flex-wrap'>
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
