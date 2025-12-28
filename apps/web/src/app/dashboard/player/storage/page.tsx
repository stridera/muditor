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
import {
  DepositWealthDocument,
  GetMyAccountStorageDocument,
  GetMyAccountWealthDisplayDocument,
  GetMyCharactersDocument,
  type GetMyAccountStorageQuery,
  type GetMyAccountWealthDisplayQuery,
  type GetMyCharactersQuery,
} from '@/generated/graphql';
import { useErrorHandler } from '@/lib/error-utils';
import { useMutation, useQuery } from '@apollo/client/react';
import { Coins, Package, PiggyBank, Vault } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

type AccountItem = NonNullable<
  GetMyAccountStorageQuery['myAccountStorage']
>['items'][0];
type Character = NonNullable<GetMyCharactersQuery['myCharacters']>[0];

export default function AccountStoragePage() {
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);

  const { data: charactersData, loading: charactersLoading } =
    useQuery<GetMyCharactersQuery>(GetMyCharactersDocument);

  const {
    data: storageData,
    loading: storageLoading,
    refetch: refetchStorage,
  } = useQuery<GetMyAccountStorageQuery>(GetMyAccountStorageDocument);

  const { data: wealthDisplayData, refetch: refetchWealth } =
    useQuery<GetMyAccountWealthDisplayQuery>(GetMyAccountWealthDisplayDocument);

  const [depositWealth] = useMutation(DepositWealthDocument);
  const { handleError } = useErrorHandler();

  const characters = charactersData?.myCharacters || [];
  const storage = storageData?.myAccountStorage;
  const wealthDisplay = wealthDisplayData?.myAccountWealthDisplay;
  const items = storage?.items || [];

  const handleDepositWealth = async (characterId: string, amount: bigint) => {
    try {
      await depositWealth({
        variables: { characterId, amount: amount.toString() },
      });
      toast.success('Wealth deposited to account storage!');
      setDepositDialogOpen(false);
      refetchStorage();
      refetchWealth();
    } catch (err) {
      const errorDisplay = handleError(err, 'depositing wealth');
      toast.error(errorDisplay.message);
    }
  };

  if (charactersLoading || storageLoading) {
    return <Loading text='Loading account storage...' />;
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold flex items-center gap-2'>
            <Vault className='h-6 w-6' />
            Account Storage
          </h1>
          <p className='text-muted-foreground'>
            Shared storage for wealth and items across all your characters
          </p>
        </div>
        <Dialog open={depositDialogOpen} onOpenChange={setDepositDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PiggyBank className='h-4 w-4 mr-2' />
              Deposit Wealth
            </Button>
          </DialogTrigger>
          <DepositWealthDialog
            characters={characters}
            onDeposit={handleDepositWealth}
            onClose={() => setDepositDialogOpen(false)}
          />
        </Dialog>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Coins className='h-5 w-5' />
              Account Wealth
            </CardTitle>
            <CardDescription>
              Deposited coins available to all your characters
            </CardDescription>
          </CardHeader>
          <CardContent>
            {wealthDisplay ? (
              <div className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='p-4 bg-muted rounded-lg'>
                    <div className='text-sm text-muted-foreground'>
                      Platinum
                    </div>
                    <div className='text-2xl font-bold'>
                      {wealthDisplay.platinum.toLocaleString()}
                    </div>
                  </div>
                  <div className='p-4 bg-muted rounded-lg'>
                    <div className='text-sm text-muted-foreground'>Gold</div>
                    <div className='text-2xl font-bold text-yellow-600'>
                      {wealthDisplay.gold.toLocaleString()}
                    </div>
                  </div>
                  <div className='p-4 bg-muted rounded-lg'>
                    <div className='text-sm text-muted-foreground'>Silver</div>
                    <div className='text-2xl font-bold text-gray-400'>
                      {wealthDisplay.silver.toLocaleString()}
                    </div>
                  </div>
                  <div className='p-4 bg-muted rounded-lg'>
                    <div className='text-sm text-muted-foreground'>Copper</div>
                    <div className='text-2xl font-bold text-orange-600'>
                      {wealthDisplay.copper.toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className='text-center text-sm text-muted-foreground'>
                  Total: {wealthDisplay.totalCopper.toLocaleString()} copper
                </div>
              </div>
            ) : (
              <div className='text-center py-8 text-muted-foreground'>
                No wealth deposited yet
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Package className='h-5 w-5' />
              Stored Items
            </CardTitle>
            <CardDescription>
              Items stored from mail attachments ({items.length} items)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <div className='text-center py-8 text-muted-foreground'>
                No items in storage. Items from mail will appear here when you
                choose to move them to account storage.
              </div>
            ) : (
              <div className='max-h-64 overflow-y-auto'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Stored By</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map(item => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className='flex items-center gap-2'>
                            <Package className='h-4 w-4 text-muted-foreground' />
                            <span className='font-medium'>
                              {item.object.name}
                            </span>
                            {item.object.type && (
                              <Badge variant='outline' className='text-xs'>
                                {item.object.type}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>
                          {item.storedByCharacter?.name || 'Unknown'}
                        </TableCell>
                        <TableCell>
                          {new Date(item.storedAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>All Stored Items</CardTitle>
            <CardDescription>
              Complete list of items in your account storage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Slot</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Stored By</TableHead>
                  <TableHead>Stored At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map(item => (
                  <TableRow key={item.id}>
                    <TableCell>{item.slot}</TableCell>
                    <TableCell>
                      <div className='flex items-center gap-2'>
                        <Package className='h-4 w-4 text-muted-foreground' />
                        <span className='font-medium'>{item.object.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.object.type ? (
                        <Badge variant='outline'>{item.object.type}</Badge>
                      ) : (
                        <span className='text-muted-foreground'>-</span>
                      )}
                    </TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>
                      {item.storedByCharacter?.name || 'Unknown'}
                    </TableCell>
                    <TableCell>
                      {new Date(item.storedAt).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function DepositWealthDialog({
  characters,
  onDeposit,
  onClose,
}: {
  characters: Character[];
  onDeposit: (characterId: string, amount: bigint) => void;
  onClose: () => void;
}) {
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>('');
  const [copper, setCopper] = useState(0);
  const [silver, setSilver] = useState(0);
  const [gold, setGold] = useState(0);
  const [platinum, setPlatinum] = useState(0);

  const totalCopper = copper + silver * 10 + gold * 100 + platinum * 1000;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCharacterId || totalCopper <= 0) {
      toast.error('Please select a character and enter an amount');
      return;
    }
    onDeposit(selectedCharacterId, BigInt(totalCopper));
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle className='flex items-center gap-2'>
          <PiggyBank className='h-5 w-5' />
          Deposit Wealth
        </DialogTitle>
        <DialogDescription>
          Transfer coins from a character to your account storage
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <Label htmlFor='character'>From Character</Label>
          <Select
            value={selectedCharacterId}
            onValueChange={setSelectedCharacterId}
          >
            <SelectTrigger>
              <SelectValue placeholder='Select a character' />
            </SelectTrigger>
            <SelectContent>
              {characters.map(char => (
                <SelectItem key={char.id} value={char.id}>
                  {char.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Amount to Deposit</Label>
          <div className='grid grid-cols-4 gap-2 mt-1'>
            <div>
              <Label className='text-xs'>Copper</Label>
              <Input
                type='number'
                min={0}
                value={copper}
                onChange={e => setCopper(parseInt(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label className='text-xs'>Silver</Label>
              <Input
                type='number'
                min={0}
                value={silver}
                onChange={e => setSilver(parseInt(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label className='text-xs'>Gold</Label>
              <Input
                type='number'
                min={0}
                value={gold}
                onChange={e => setGold(parseInt(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label className='text-xs'>Platinum</Label>
              <Input
                type='number'
                min={0}
                value={platinum}
                onChange={e => setPlatinum(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
          <p className='text-sm text-muted-foreground mt-2'>
            Total: {totalCopper.toLocaleString()} copper
          </p>
        </div>
        <div className='flex justify-end gap-2'>
          <Button type='button' variant='outline' onClick={onClose}>
            Cancel
          </Button>
          <Button
            type='submit'
            disabled={!selectedCharacterId || totalCopper <= 0}
          >
            <Coins className='h-4 w-4 mr-2' />
            Deposit
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}
