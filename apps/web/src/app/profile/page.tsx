'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { RoleBadge } from '@/components/role-badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
import { useAuth } from '@/contexts/auth-context';
import { apolloClient } from '@/lib/apollo-client';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle, Gamepad2, Loader2, Settings } from 'lucide-react';
import { useState } from 'react';

const CHANGE_PASSWORD_MUTATION = gql`
  mutation ChangePasswordInline($input: ChangePasswordInput!) {
    changePassword(input: $input) {
      success
      message
    }
  }
`;

const UPDATE_PROFILE_MUTATION = gql`
  mutation UpdateProfileInline($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      id
      username
      email
      role
      createdAt
    }
  }
`;

const GET_MY_CHARACTERS = gql`
  query GetProfileCharactersInline {
    myCharacters {
      id
      name
      level
      raceType
      playerClass
      lastLogin
      isOnline
    }
  }
`;

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}

function ProfileContent() {
  const { user } = useAuth();

  // Fetch linked characters
  const { data: charactersData } = useQuery(GET_MY_CHARACTERS);
  const characters = (charactersData as any)?.myCharacters || [];

  // Profile editing state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [email, setEmail] = useState(user?.email || '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password change state
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  if (!user) {
    return <div>Loading...</div>;
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    setProfileLoading(true);

    try {
      await apolloClient.mutate({
        mutation: UPDATE_PROFILE_MUTATION,
        variables: {
          input: { email },
        },
      });

      setProfileSuccess('Profile updated successfully!');
      setIsEditingProfile(false);

      // Refresh user context
      window.location.reload();
    } catch (err: any) {
      const errorMessage =
        err.graphQLErrors?.[0]?.message ||
        err.networkError?.message ||
        'Failed to update profile. Please try again.';
      setProfileError(errorMessage);
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    // Validation
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long');
      return;
    }

    setPasswordLoading(true);

    try {
      const result = await apolloClient.mutate({
        mutation: CHANGE_PASSWORD_MUTATION,
        variables: {
          input: {
            currentPassword,
            newPassword,
          },
        },
      });

      const { success, message } = (result.data as any)?.changePassword || {
        success: false,
        message: '',
      };
      if (success) {
        setPasswordSuccess(message || 'Password changed successfully!');
      } else {
        setPasswordError(message || 'Failed to change password');
        return;
      }
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsChangingPassword(false);
    } catch (err: any) {
      const errorMessage =
        err.graphQLErrors?.[0]?.message ||
        err.networkError?.message ||
        'Failed to change password. Please try again.';
      setPasswordError(errorMessage);
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-background py-8 text-foreground'>
      <div className='container mx-auto px-4'>
        <div className='max-w-4xl mx-auto'>
          <div className='mb-8'>
            <h1 className='text-3xl font-bold text-foreground'>Profile</h1>
            <p className='text-muted-foreground mt-2'>
              Manage your account settings and preferences
            </p>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
            {/* Profile Overview */}
            <div className='lg:col-span-1'>
              <Card>
                <CardHeader className='text-center'>
                  <div className='mx-auto h-20 w-20 bg-primary rounded-full flex items-center justify-center mb-4'>
                    <span className='text-primary-foreground text-2xl font-bold'>
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <CardTitle>{user.username}</CardTitle>
                  <CardDescription>{user.email}</CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm font-medium text-muted-foreground'>
                      Role
                    </span>
                    <RoleBadge role={user.role} size='sm' />
                  </div>

                  <div className='flex items-center justify-between'>
                    <span className='text-sm font-medium text-gray-500'>
                      Member Since
                    </span>
                    <span className='text-sm text-foreground'>
                      {formatDistanceToNow(new Date(user.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>

                  <div className='pt-4 border-t'>
                    <div className='flex items-center justify-between mb-2'>
                      <span className='text-sm font-medium text-muted-foreground'>
                        Linked Characters
                      </span>
                      <Badge variant='secondary'>{characters.length}</Badge>
                    </div>
                    {characters.length > 0 ? (
                      <div className='space-y-2'>
                        {characters.map((char: any) => (
                          <div
                            key={char.id}
                            className='flex items-center justify-between p-2 bg-card rounded'
                          >
                            <div className='flex items-center gap-2'>
                              <Gamepad2 className='h-4 w-4 text-muted-foreground' />
                              <span className='text-sm font-medium'>
                                {char.name}
                              </span>
                            </div>
                            <Badge variant='outline' className='text-xs'>
                              Level {char.level}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className='text-xs text-muted-foreground'>
                        No characters linked. Visit the Characters page to link
                        your game characters.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Account Settings */}
            <div className='lg:col-span-2'>
              <div className='space-y-6'>
                <Card>
                  <CardHeader>
                    <CardTitle className='flex items-center'>
                      <Settings className='w-5 h-5 mr-2' />
                      Account Settings
                    </CardTitle>
                    <CardDescription>
                      Update your account information and preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    {profileSuccess && (
                      <Alert>
                        <CheckCircle className='h-4 w-4' />
                        <AlertDescription>{profileSuccess}</AlertDescription>
                      </Alert>
                    )}

                    {profileError && (
                      <Alert variant='destructive'>
                        <AlertDescription>{profileError}</AlertDescription>
                      </Alert>
                    )}

                    <form onSubmit={handleProfileSubmit} className='space-y-4'>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div className='space-y-2'>
                          <Label htmlFor='username'>Username</Label>
                          <Input
                            id='username'
                            value={user.username}
                            disabled
                            className='bg-card'
                          />
                          <p className='text-xs text-muted-foreground'>
                            Username cannot be changed
                          </p>
                        </div>

                        <div className='space-y-2'>
                          <Label htmlFor='email'>Email</Label>
                          <Input
                            id='email'
                            type='email'
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            disabled={!isEditingProfile || profileLoading}
                            className={isEditingProfile ? '' : 'bg-card'}
                          />
                        </div>
                      </div>

                      <div className='pt-4 flex flex-col sm:flex-row gap-2'>
                        {isEditingProfile ? (
                          <>
                            <Button
                              type='submit'
                              disabled={profileLoading}
                              className='w-full sm:w-auto'
                            >
                              {profileLoading ? (
                                <>
                                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                  Saving...
                                </>
                              ) : (
                                'Save Changes'
                              )}
                            </Button>
                            <Button
                              type='button'
                              variant='outline'
                              onClick={() => {
                                setIsEditingProfile(false);
                                setEmail(user.email);
                                setProfileError('');
                                setProfileSuccess('');
                              }}
                              disabled={profileLoading}
                              className='w-full sm:w-auto'
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <Button
                            type='button'
                            onClick={() => setIsEditingProfile(true)}
                            className='w-full sm:w-auto'
                          >
                            Edit Profile
                          </Button>
                        )}
                      </div>
                    </form>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Security</CardTitle>
                    <CardDescription>
                      Manage your password and security settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {passwordSuccess && (
                      <Alert className='mb-4'>
                        <CheckCircle className='h-4 w-4' />
                        <AlertDescription>{passwordSuccess}</AlertDescription>
                      </Alert>
                    )}

                    {passwordError && (
                      <Alert variant='destructive' className='mb-4'>
                        <AlertDescription>{passwordError}</AlertDescription>
                      </Alert>
                    )}

                    <div className='space-y-4'>
                      <div>
                        <h4 className='font-medium text-foreground mb-2'>
                          Password
                        </h4>
                        <p className='text-sm text-muted-foreground mb-4'>
                          Update your password to keep your account secure
                        </p>

                        {isChangingPassword ? (
                          <form
                            onSubmit={handlePasswordSubmit}
                            className='space-y-4'
                          >
                            <div className='space-y-2'>
                              <Label htmlFor='currentPassword'>
                                Current Password
                              </Label>
                              <Input
                                id='currentPassword'
                                type='password'
                                value={currentPassword}
                                onChange={e =>
                                  setCurrentPassword(e.target.value)
                                }
                                required
                                disabled={passwordLoading}
                                placeholder='Enter your current password'
                              />
                            </div>

                            <div className='space-y-2'>
                              <Label htmlFor='newPassword'>New Password</Label>
                              <Input
                                id='newPassword'
                                type='password'
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                required
                                disabled={passwordLoading}
                                placeholder='Enter your new password'
                                minLength={8}
                                maxLength={128}
                              />
                            </div>

                            <div className='space-y-2'>
                              <Label htmlFor='confirmNewPassword'>
                                Confirm New Password
                              </Label>
                              <Input
                                id='confirmNewPassword'
                                type='password'
                                value={confirmPassword}
                                onChange={e =>
                                  setConfirmPassword(e.target.value)
                                }
                                required
                                disabled={passwordLoading}
                                placeholder='Confirm your new password'
                              />
                            </div>

                            <div className='flex flex-col sm:flex-row gap-2'>
                              <Button
                                type='submit'
                                disabled={passwordLoading}
                                className='w-full sm:w-auto'
                              >
                                {passwordLoading ? (
                                  <>
                                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                    Changing Password...
                                  </>
                                ) : (
                                  'Change Password'
                                )}
                              </Button>
                              <Button
                                type='button'
                                variant='outline'
                                onClick={() => {
                                  setIsChangingPassword(false);
                                  setCurrentPassword('');
                                  setNewPassword('');
                                  setConfirmPassword('');
                                  setPasswordError('');
                                  setPasswordSuccess('');
                                }}
                                disabled={passwordLoading}
                                className='w-full sm:w-auto'
                              >
                                Cancel
                              </Button>
                            </div>
                          </form>
                        ) : (
                          <Button onClick={() => setIsChangingPassword(true)}>
                            Change Password
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>World Building Stats</CardTitle>
                    <CardDescription>
                      Your contribution to the MUD world
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                      <div className='text-center p-4 bg-card rounded-lg'>
                        <div className='text-2xl font-bold text-primary'>-</div>
                        <div className='text-sm text-muted-foreground'>
                          Zones Created
                        </div>
                      </div>
                      <div className='text-center p-4 bg-card rounded-lg'>
                        <div className='text-2xl font-bold text-green-600'>
                          -
                        </div>
                        <div className='text-sm text-muted-foreground'>
                          Rooms Built
                        </div>
                      </div>
                      <div className='text-center p-4 bg-card rounded-lg'>
                        <div className='text-2xl font-bold text-purple-600'>
                          -
                        </div>
                        <div className='text-sm text-muted-foreground'>
                          Mobs Created
                        </div>
                      </div>
                      <div className='text-center p-4 bg-card rounded-lg'>
                        <div className='text-2xl font-bold text-orange-600'>
                          -
                        </div>
                        <div className='text-sm text-muted-foreground'>
                          Objects Made
                        </div>
                      </div>
                    </div>
                    <p className='text-xs text-muted-foreground mt-4'>
                      Statistics will be tracked as you create and edit world
                      content
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
