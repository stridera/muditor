'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { DualInterface } from '@/components/dashboard/dual-interface';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Crown,
  Shield,
  ShieldBan,
  ShieldCheck,
  Edit,
  Ban,
  UserX,
  User,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';

const USERS_QUERY = gql`
  query Users {
    users {
      id
      username
      email
      role
      isBanned
      createdAt
      lastLoginAt
      banRecords {
        id
        reason
        bannedAt
        expiresAt
        admin {
          username
        }
      }
    }
  }
`;

const UPDATE_USER_MUTATION = gql`
  mutation UpdateUser($input: UpdateUserInput!) {
    updateUser(input: $input) {
      id
      username
      email
      role
    }
  }
`;

const BAN_USER_MUTATION = gql`
  mutation BanUser($input: BanUserInput!) {
    banUser(input: $input) {
      id
      reason
      bannedAt
      user {
        username
      }
    }
  }
`;

const UNBAN_USER_MUTATION = gql`
  mutation UnbanUser($input: UnbanUserInput!) {
    unbanUser(input: $input) {
      id
      unbannedAt
      user {
        username
      }
    }
  }
`;

interface User {
  id: string;
  username: string;
  email: string;
  role: 'PLAYER' | 'IMMORTAL' | 'BUILDER' | 'CODER' | 'GOD';
  isBanned: boolean;
  createdAt: string;
  lastLoginAt?: string;
  banRecords?: {
    id: string;
    reason: string;
    bannedAt: string;
    expiresAt?: string;
    admin: {
      username: string;
    };
  }[];
}

interface UsersQueryResult {
  users: User[];
}

export default function UsersPage() {
  return (
    <PermissionGuard requireUserManagement={true}>
      <UsersContent />
    </PermissionGuard>
  );
}

function UsersContent() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [banDialogOpen, setBanDialogOpen] = useState(false);

  const { data, loading, error, refetch } =
    useQuery<UsersQueryResult>(USERS_QUERY);
  const [updateUser] = useMutation(UPDATE_USER_MUTATION);
  const [banUser] = useMutation(BAN_USER_MUTATION);
  const [unbanUser] = useMutation(UNBAN_USER_MUTATION);

  const handleUpdateUser = async (userId: string, updates: any) => {
    try {
      await updateUser({
        variables: {
          input: { id: userId, ...updates },
        },
      });
      toast.success('User updated successfully');
      refetch();
      setEditDialogOpen(false);
    } catch (err: any) {
      toast.error(`Failed to update user: ${err.message}`);
    }
  };

  const handleBanUser = async (
    userId: string,
    reason: string,
    expiresAt?: string
  ) => {
    try {
      await banUser({
        variables: {
          input: { userId, reason, expiresAt },
        },
      });
      toast.success('User banned successfully');
      refetch();
      setBanDialogOpen(false);
    } catch (err: any) {
      toast.error(`Failed to ban user: ${err.message}`);
    }
  };

  const handleUnbanUser = async (userId: string) => {
    try {
      await unbanUser({
        variables: {
          input: { userId },
        },
      });
      toast.success('User unbanned successfully');
      refetch();
    } catch (err: any) {
      toast.error(`Failed to unban user: ${err.message}`);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'GOD':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'CODER':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'BUILDER':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'IMMORTAL':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PLAYER':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'GOD':
        return <Crown className='w-3 h-3' />;
      case 'CODER':
        return <Shield className='w-3 h-3' />;
      case 'BUILDER':
        return <ShieldCheck className='w-3 h-3' />;
      case 'IMMORTAL':
        return <ShieldCheck className='w-3 h-3' />;
      case 'PLAYER':
        return <User className='w-3 h-3' />;
      default:
        return <User className='w-3 h-3' />;
    }
  };

  if (loading) return <div>Loading users...</div>;
  if (error) return <div>Error loading users: {error.message}</div>;

  const users = data?.users || [];

  const adminView = (
    <Card>
      <CardHeader>
        <CardTitle>Users ({users.length})</CardTitle>
        <CardDescription>
          View and manage all users in the system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user: User) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div>
                    <div className='font-medium'>{user.username}</div>
                    <div className='text-sm text-gray-500'>{user.email}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getRoleBadgeColor(user.role)}>
                    {getRoleIcon(user.role)}
                    <span className='ml-1'>{user.role}</span>
                  </Badge>
                </TableCell>
                <TableCell>
                  {user.isBanned ? (
                    <Badge variant='destructive'>
                      <ShieldBan className='w-3 h-3 mr-1' />
                      Banned
                    </Badge>
                  ) : (
                    <Badge variant='secondary'>
                      <ShieldCheck className='w-3 h-3 mr-1' />
                      Active
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {user.lastLoginAt ? (
                    <div className='flex items-center text-sm text-gray-500'>
                      <Calendar className='w-3 h-3 mr-1' />
                      {new Date(user.lastLoginAt).toLocaleDateString()}
                    </div>
                  ) : (
                    <span className='text-sm text-gray-400'>Never</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className='flex items-center space-x-2'>
                    <Dialog
                      open={editDialogOpen}
                      onOpenChange={setEditDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => setSelectedUser(user)}
                        >
                          <Edit className='w-3 h-3' />
                        </Button>
                      </DialogTrigger>
                      {selectedUser && (
                        <EditUserDialog
                          user={selectedUser}
                          onUpdate={handleUpdateUser}
                          onClose={() => {
                            setEditDialogOpen(false);
                            setSelectedUser(null);
                          }}
                        />
                      )}
                    </Dialog>

                    {user.isBanned ? (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant='outline' size='sm'>
                            <UserX className='w-3 h-3' />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Unban User</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to unban {user.username}?
                              They will regain access to the system.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleUnbanUser(user.id)}
                            >
                              Unban User
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    ) : (
                      <Dialog
                        open={banDialogOpen}
                        onOpenChange={setBanDialogOpen}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => setSelectedUser(user)}
                          >
                            <Ban className='w-3 h-3' />
                          </Button>
                        </DialogTrigger>
                        {selectedUser && (
                          <BanUserDialog
                            user={selectedUser}
                            onBan={handleBanUser}
                            onClose={() => {
                              setBanDialogOpen(false);
                              setSelectedUser(null);
                            }}
                          />
                        )}
                      </Dialog>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  return (
    <DualInterface
      title='User Management'
      description='Manage user accounts, roles, and permissions'
      adminView={adminView}
    >
      <div></div>
    </DualInterface>
  );
}

function EditUserDialog({
  user,
  onUpdate,
  onClose,
}: {
  user: User;
  onUpdate: (userId: string, updates: any) => void;
  onClose: () => void;
}) {
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState(user.role);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(user.id, {
      email,
      role,
    });
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Edit User: {user.username}</DialogTitle>
        <DialogDescription>
          Update user information and permissions
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <Label htmlFor='email'>Email</Label>
          <Input
            id='email'
            type='email'
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor='role'>Role</Label>
          <Select
            value={role}
            onValueChange={value => setRole(value as User['role'])}
          >
            <SelectTrigger>
              <SelectValue placeholder='Select role' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='PLAYER'>Player</SelectItem>
              <SelectItem value='IMMORTAL'>Immortal</SelectItem>
              <SelectItem value='BUILDER'>Builder</SelectItem>
              <SelectItem value='CODER'>Coder</SelectItem>
              <SelectItem value='GOD'>God</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className='flex justify-end space-x-2'>
          <Button type='button' variant='outline' onClick={onClose}>
            Cancel
          </Button>
          <Button type='submit'>Update User</Button>
        </div>
      </form>
    </DialogContent>
  );
}

function BanUserDialog({
  user,
  onBan,
  onClose,
}: {
  user: User;
  onBan: (userId: string, reason: string, expiresAt?: string) => void;
  onClose: () => void;
}) {
  const [reason, setReason] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [isPermanent, setIsPermanent] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.length < 10) {
      toast.error('Ban reason must be at least 10 characters');
      return;
    }
    onBan(user.id, reason, isPermanent ? undefined : expiresAt);
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Ban User: {user.username}</DialogTitle>
        <DialogDescription>
          Restrict user access to the system
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <Label htmlFor='reason'>Reason for Ban</Label>
          <Textarea
            id='reason'
            placeholder='Provide a detailed reason for the ban...'
            value={reason}
            onChange={e => setReason(e.target.value)}
            required
            minLength={10}
            maxLength={500}
          />
          <p className='text-xs text-gray-500 mt-1'>
            {reason.length}/500 characters (minimum 10)
          </p>
        </div>
        <div className='flex items-center space-x-2'>
          <input
            type='checkbox'
            id='permanent'
            checked={isPermanent}
            onChange={e => setIsPermanent(e.target.checked)}
          />
          <Label htmlFor='permanent'>Permanent ban</Label>
        </div>
        {!isPermanent && (
          <div>
            <Label htmlFor='expiresAt'>Ban Expires At</Label>
            <Input
              id='expiresAt'
              type='datetime-local'
              value={expiresAt}
              onChange={e => setExpiresAt(e.target.value)}
              required={!isPermanent}
            />
          </div>
        )}
        <div className='flex justify-end space-x-2'>
          <Button type='button' variant='outline' onClick={onClose}>
            Cancel
          </Button>
          <Button type='submit' variant='destructive'>
            Ban User
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}
