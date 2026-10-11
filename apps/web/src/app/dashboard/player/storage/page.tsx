'use client';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loading } from '@/components/ui/loading';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  GetMyAccountStorageDocument,
  GetMyAccountWealthDisplayDocument,
  type GetMyAccountStorageQuery,
  type GetMyAccountWealthDisplayQuery,
} from '@/generated/graphql';
import { useQuery } from '@apollo/client/react';
import { Coins, Package, Vault } from 'lucide-react';

type AccountItem = NonNullable<
  GetMyAccountStorageQuery['myAccountStorage']
>['items'][0];

export default function AccountStoragePage() {
  const { data: storageData, loading: storageLoading } =
    useQuery<GetMyAccountStorageQuery>(GetMyAccountStorageDocument);

  const { data: wealthDisplayData } = useQuery<GetMyAccountWealthDisplayQuery>(
    GetMyAccountWealthDisplayDocument
  );

  const storage = storageData?.myAccountStorage;
  const wealthDisplay = wealthDisplayData?.myAccountWealthDisplay;
  const items = storage?.items || [];

  if (storageLoading) {
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
      </div>

      <Card>
        <CardContent className='py-4 text-sm text-muted-foreground'>
          This page is read-only. To move items or coins, use the chest and bank
          commands in game.
        </CardContent>
      </Card>

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
                    <div className='text-2xl font-bold text-muted-foreground'>
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
