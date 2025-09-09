'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { ProtectedRoute } from '@/components/auth/protected-route';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  User,
  Mail,
  Crown,
  Calendar,
  Settings,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { gql } from '@apollo/client';
import { apolloClient } from '@/lib/apollo-client';

const CHANGE_PASSWORD_MUTATION = gql`
  mutation ChangePassword($input: ChangePasswordInput!) {
    changePassword(input: $input) {
      success
      message
    }
  }
`;

const UPDATE_PROFILE_MUTATION = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      id
      username
      email
      role
      godLevel
      createdAt
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

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'GOD':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'BUILDER':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='container mx-auto px-4'>
        <div className='max-w-4xl mx-auto'>
          <div className='mb-8'>
            <h1 className='text-3xl font-bold text-gray-900'>Profile</h1>
            <p className='text-gray-600 mt-2'>
              Manage your account settings and preferences
            </p>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
            {/* Profile Overview */}
            <div className='lg:col-span-1'>
              <Card>
                <CardHeader className='text-center'>
                  <div className='mx-auto h-20 w-20 bg-blue-600 rounded-full flex items-center justify-center mb-4'>
                    <span className='text-white text-2xl font-bold'>
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <CardTitle>{user.username}</CardTitle>
                  <CardDescription>{user.email}</CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm font-medium text-gray-500'>
                      Role
                    </span>
                    <Badge className={getRoleBadgeColor(user.role)}>
                      <Crown className='w-3 h-3 mr-1' />
                      {user.role}
                    </Badge>
                  </div>

                  <div className='flex items-center justify-between'>
                    <span className='text-sm font-medium text-gray-500'>
                      Member Since
                    </span>
                    <span className='text-sm text-gray-900'>
                      {formatDistanceToNow(new Date(user.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
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
                            className='bg-gray-50'
                          />
                          <p className='text-xs text-gray-500'>
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
                            className={isEditingProfile ? '' : 'bg-gray-50'}
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
                        <h4 className='font-medium text-gray-900 mb-2'>
                          Password
                        </h4>
                        <p className='text-sm text-gray-600 mb-4'>
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
                      <div className='text-center p-4 bg-gray-50 rounded-lg'>
                        <div className='text-2xl font-bold text-blue-600'>
                          -
                        </div>
                        <div className='text-sm text-gray-600'>
                          Zones Created
                        </div>
                      </div>
                      <div className='text-center p-4 bg-gray-50 rounded-lg'>
                        <div className='text-2xl font-bold text-green-600'>
                          -
                        </div>
                        <div className='text-sm text-gray-600'>Rooms Built</div>
                      </div>
                      <div className='text-center p-4 bg-gray-50 rounded-lg'>
                        <div className='text-2xl font-bold text-purple-600'>
                          -
                        </div>
                        <div className='text-sm text-gray-600'>
                          Mobs Created
                        </div>
                      </div>
                      <div className='text-center p-4 bg-gray-50 rounded-lg'>
                        <div className='text-2xl font-bold text-orange-600'>
                          -
                        </div>
                        <div className='text-sm text-gray-600'>
                          Objects Made
                        </div>
                      </div>
                    </div>
                    <p className='text-xs text-gray-500 mt-4'>
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
