'use client';

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { usePermissions } from '@/hooks/use-permissions';
import { gql } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  AlertTriangle,
  CheckCircle,
  Loader2,
  Package,
  Plus,
  RotateCcw,
  Rocket,
  Shield,
} from 'lucide-react';
import { useState } from 'react';

// ============================================
// GraphQL
// ============================================

const GET_DEPLOYMENTS = gql`
  query GetDeployments($status: DeploymentStatus) {
    deploymentPackages(status: $status) {
      id
      name
      description
      status
      zoneIds
      createdBy
      deployedAt
      createdAt
      updatedAt
      changes {
        id
        entityType
        entityKey
        changeType
      }
    }
  }
`;

const CREATE_DEPLOYMENT = gql`
  mutation CreateDeployment($input: CreateDeploymentInput!) {
    createDeployment(input: $input) {
      id
      name
      status
    }
  }
`;

const MARK_READY = gql`
  mutation MarkDeploymentReady($id: ID!) {
    markDeploymentReady(id: $id) {
      id
      status
    }
  }
`;

const DEPLOY_PACKAGE = gql`
  mutation DeployPackage($id: ID!) {
    deployPackage(id: $id) {
      id
      status
      deployedAt
    }
  }
`;

const ROLLBACK_DEPLOYMENT = gql`
  mutation RollbackDeployment($id: ID!) {
    rollbackDeployment(id: $id) {
      id
      status
    }
  }
`;

// ============================================
// Types
// ============================================

interface DeploymentChangeData {
  id: number;
  entityType: string;
  entityKey: string;
  changeType: string;
}

interface DeploymentPackageData {
  id: string;
  name: string;
  description: string | null;
  status: string;
  zoneIds: number[];
  createdBy: string;
  deployedAt: string | null;
  createdAt: string;
  changes: DeploymentChangeData[];
}

interface GetDeploymentsData {
  deploymentPackages: DeploymentPackageData[];
}

// ============================================
// Status badge styles
// ============================================

const statusConfig: Record<
  string,
  {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
  }
> = {
  PENDING: { label: 'Pending', variant: 'secondary' },
  READY: { label: 'Ready', variant: 'default' },
  DEPLOYING: { label: 'Deploying', variant: 'outline' },
  DEPLOYED: { label: 'Deployed', variant: 'default' },
  FAILED: { label: 'Failed', variant: 'destructive' },
  ROLLED_BACK: { label: 'Rolled Back', variant: 'outline' },
};

function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] ?? {
    label: status,
    variant: 'secondary' as const,
  };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

// ============================================
// Page
// ============================================

export default function DeploymentsPage() {
  const { isCoder } = usePermissions();
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [zoneIdsInput, setZoneIdsInput] = useState('');
  const [alert, setAlert] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const { data, loading, error, refetch } =
    useQuery<GetDeploymentsData>(GET_DEPLOYMENTS);

  const [createDeployment, { loading: creating }] = useMutation(
    CREATE_DEPLOYMENT,
    {
      onCompleted: () => {
        setCreateOpen(false);
        setName('');
        setDescription('');
        setZoneIdsInput('');
        setAlert({ type: 'success', message: 'Deployment created' });
        refetch();
      },
      onError: err => setAlert({ type: 'error', message: err.message }),
    }
  );

  const [markReady] = useMutation(MARK_READY, {
    onCompleted: () => {
      setAlert({ type: 'success', message: 'Marked as ready' });
      refetch();
    },
    onError: err => setAlert({ type: 'error', message: err.message }),
  });

  const [deployPackage] = useMutation(DEPLOY_PACKAGE, {
    onCompleted: () => {
      setAlert({ type: 'success', message: 'Deployment deployed' });
      refetch();
    },
    onError: err => setAlert({ type: 'error', message: err.message }),
  });

  const [rollbackDeployment] = useMutation(ROLLBACK_DEPLOYMENT, {
    onCompleted: () => {
      setAlert({ type: 'success', message: 'Deployment rolled back' });
      refetch();
    },
    onError: err => setAlert({ type: 'error', message: err.message }),
  });

  const handleCreate = () => {
    const zoneIds = zoneIdsInput
      .split(',')
      .map(s => parseInt(s.trim(), 10))
      .filter(n => !isNaN(n));
    if (!name.trim() || zoneIds.length === 0) {
      setAlert({
        type: 'error',
        message: 'Name and at least one zone ID are required',
      });
      return;
    }
    createDeployment({
      variables: {
        input: {
          name: name.trim(),
          description: description.trim() || undefined,
          zoneIds,
        },
      },
    });
  };

  const deployments = data?.deploymentPackages ?? [];

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <div>
            <CardTitle className='flex items-center gap-2'>
              <Package className='h-5 w-5' />
              Deployments
            </CardTitle>
            <CardDescription>
              Manage zone deployment packages for the game server
            </CardDescription>
          </div>
          {isCoder && (
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className='h-4 w-4 mr-1' />
              New Deployment
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {alert && (
            <Alert
              variant={alert.type === 'error' ? 'destructive' : 'default'}
              className='mb-4'
            >
              {alert.type === 'error' ? (
                <AlertTriangle className='h-4 w-4' />
              ) : (
                <CheckCircle className='h-4 w-4' />
              )}
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          )}

          {loading && (
            <div className='flex items-center justify-center py-12'>
              <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
            </div>
          )}

          {error && (
            <Alert variant='destructive'>
              <AlertTriangle className='h-4 w-4' />
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          )}

          {!loading && !error && deployments.length === 0 && (
            <div className='text-center py-12 text-muted-foreground'>
              No deployments yet. Create one to get started.
            </div>
          )}

          {!loading && !error && deployments.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Zones</TableHead>
                  <TableHead>Changes</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Deployed</TableHead>
                  {isCoder && (
                    <TableHead className='text-right'>Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {deployments.map(dep => (
                  <TableRow key={dep.id}>
                    <TableCell>
                      <div>
                        <div className='font-medium'>{dep.name}</div>
                        {dep.description && (
                          <div className='text-xs text-muted-foreground truncate max-w-[200px]'>
                            {dep.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={dep.status} />
                    </TableCell>
                    <TableCell>
                      <div className='flex flex-wrap gap-1'>
                        {dep.zoneIds.map(z => (
                          <Badge key={z} variant='outline' className='text-xs'>
                            {z}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{dep.changes.length}</TableCell>
                    <TableCell>{dep.createdBy}</TableCell>
                    <TableCell className='text-xs'>
                      {new Date(dep.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className='text-xs'>
                      {dep.deployedAt
                        ? new Date(dep.deployedAt).toLocaleDateString()
                        : '\u2014'}
                    </TableCell>
                    {isCoder && (
                      <TableCell className='text-right'>
                        <div className='flex gap-1 justify-end'>
                          {dep.status === 'PENDING' && (
                            <Button
                              size='sm'
                              variant='outline'
                              onClick={() =>
                                markReady({ variables: { id: dep.id } })
                              }
                            >
                              <Shield className='h-3 w-3 mr-1' />
                              Ready
                            </Button>
                          )}
                          {dep.status === 'READY' && (
                            <Button
                              size='sm'
                              onClick={() =>
                                deployPackage({ variables: { id: dep.id } })
                              }
                            >
                              <Rocket className='h-3 w-3 mr-1' />
                              Deploy
                            </Button>
                          )}
                          {dep.status === 'DEPLOYED' && (
                            <Button
                              size='sm'
                              variant='destructive'
                              onClick={() =>
                                rollbackDeployment({
                                  variables: { id: dep.id },
                                })
                              }
                            >
                              <RotateCcw className='h-3 w-3 mr-1' />
                              Rollback
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Deployment</DialogTitle>
            <DialogDescription>
              Create a deployment package that snapshots the current state of
              selected zones.
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4'>
            <div>
              <Label htmlFor='dep-name'>Name</Label>
              <Input
                id='dep-name'
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder='v1.2 - Midgaard updates'
              />
            </div>
            <div>
              <Label htmlFor='dep-desc'>Description (optional)</Label>
              <Input
                id='dep-desc'
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder='Updated room descriptions and new mobs'
              />
            </div>
            <div>
              <Label htmlFor='dep-zones'>Zone IDs (comma-separated)</Label>
              <Input
                id='dep-zones'
                value={zoneIdsInput}
                onChange={e => setZoneIdsInput(e.target.value)}
                placeholder='30, 31, 32'
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={creating}>
              {creating && <Loader2 className='h-4 w-4 mr-1 animate-spin' />}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
