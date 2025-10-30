'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Package,
  Rocket,
  RotateCcw,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';

const GET_DEPLOYMENT_PACKAGES = gql`
  query GetDeploymentPackages($status: DeploymentStatus, $limit: Int, $offset: Int) {
    deploymentPackages(status: $status, limit: $limit, offset: $offset) {
      id
      name
      description
      status
      version
      createdBy
      createdAt
      deployedAt
      completedAt
      changes {
        id
        changeType
        entityType
      }
      validations {
        id
        severity
        message
      }
    }
  }
`;

const CREATE_DEPLOYMENT_PACKAGE = gql`
  mutation CreateDeploymentPackage($input: CreateDeploymentPackageInput!) {
    createDeploymentPackage(input: $input) {
      id
      name
      status
    }
  }
`;

const EXECUTE_DEPLOYMENT = gql`
  mutation ExecuteDeployment($input: ExecuteDeploymentInput!) {
    executeDeployment(input: $input) {
      id
      status
    }
  }
`;

const ROLLBACK_DEPLOYMENT = gql`
  mutation RollbackDeployment($input: RollbackDeploymentInput!) {
    rollbackDeployment(input: $input) {
      id
      status
    }
  }
`;

interface DeploymentPackage {
  id: string;
  name: string;
  description?: string;
  status: string;
  version: string;
  createdBy: string;
  createdAt: string;
  deployedAt?: string;
  completedAt?: string;
  changes: Array<{
    id: string;
    changeType: string;
    entityType: string;
  }>;
  validations: Array<{
    id: string;
    severity: string;
    message: string;
  }>;
}

export default function DeploymentsPage() {
  const [selectedPackage, setSelectedPackage] = useState<DeploymentPackage | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    zoneIds: '',
  });

  const { data, loading, refetch } = useQuery(GET_DEPLOYMENT_PACKAGES, {
    variables: { limit: 50 },
    pollInterval: 5000,
  });

  const [createDeploymentPackage, { loading: creating }] = useMutation(
    CREATE_DEPLOYMENT_PACKAGE,
    {
      onCompleted: () => {
        setIsCreateDialogOpen(false);
        setCreateForm({ name: '', description: '', zoneIds: '' });
        refetch();
      },
    },
  );

  const [executeDeployment, { loading: executing }] = useMutation(EXECUTE_DEPLOYMENT, {
    onCompleted: () => {
      refetch();
    },
  });

  const [rollbackDeployment, { loading: rollingBack }] = useMutation(ROLLBACK_DEPLOYMENT, {
    onCompleted: () => {
      refetch();
    },
  });

  const handleCreatePackage = async () => {
    const zoneIds = createForm.zoneIds.split(',').map((id) => parseInt(id.trim(), 10));
    await createDeploymentPackage({
      variables: {
        input: {
          name: createForm.name,
          description: createForm.description,
          zoneIds,
        },
      },
    });
  };

  const handleExecute = async (packageId: string) => {
    if (
      confirm(
        'Are you sure you want to deploy this package to production? This action cannot be undone without a rollback.',
      )
    ) {
      await executeDeployment({
        variables: { input: { packageId } },
      });
    }
  };

  const handleRollback = async (packageId: string) => {
    if (
      confirm(
        'Are you sure you want to rollback this deployment? This will restore the previous state.',
      )
    ) {
      await rollbackDeployment({
        variables: { input: { packageId } },
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <Badge variant="secondary">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
      case 'IN_PROGRESS':
        return (
          <Badge variant="default">
            <Package className="mr-1 h-3 w-3 animate-pulse" />
            In Progress
          </Badge>
        );
      case 'COMPLETED':
        return (
          <Badge variant="success">
            <CheckCircle className="mr-1 h-3 w-3" />
            Completed
          </Badge>
        );
      case 'FAILED':
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" />
            Failed
          </Badge>
        );
      case 'ROLLED_BACK':
        return (
          <Badge variant="outline">
            <RotateCcw className="mr-1 h-3 w-3" />
            Rolled Back
          </Badge>
        );
      case 'VALIDATION_FAILED':
        return (
          <Badge variant="destructive">
            <AlertCircle className="mr-1 h-3 w-3" />
            Validation Failed
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getValidationSummary = (validations: any[]) => {
    const errors = validations.filter((v) => v.severity === 'ERROR').length;
    const warnings = validations.filter((v) => v.severity === 'WARNING').length;
    return { errors, warnings };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading deployments...</p>
        </div>
      </div>
    );
  }

  const packages: DeploymentPackage[] = data?.deploymentPackages || [];

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Deployment Manager</h1>
          <p className="text-gray-600">Manage dev-to-prod deployments</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Package className="mr-2 h-4 w-4" />
              Create Package
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Create Deployment Package</DialogTitle>
              <DialogDescription>
                Create a new deployment package to promote changes from dev to prod
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Package Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Zone 30 Updates"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the changes in this package..."
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="zoneIds">Zone IDs (comma-separated)</Label>
                <Input
                  id="zoneIds"
                  placeholder="e.g., 30, 31, 32"
                  value={createForm.zoneIds}
                  onChange={(e) => setCreateForm({ ...createForm, zoneIds: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePackage} disabled={creating || !createForm.name}>
                {creating ? 'Creating...' : 'Create Package'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Deployment Packages</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Changes</TableHead>
                <TableHead>Validations</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {packages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-gray-500">
                    No deployment packages found. Create your first package to get started.
                  </TableCell>
                </TableRow>
              ) : (
                packages.map((pkg) => {
                  const { errors, warnings } = getValidationSummary(pkg.validations);
                  return (
                    <TableRow key={pkg.id}>
                      <TableCell className="font-medium">{pkg.name}</TableCell>
                      <TableCell>{pkg.version}</TableCell>
                      <TableCell>{getStatusBadge(pkg.status)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{pkg.changes.length} changes</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {errors > 0 && (
                            <Badge variant="destructive">{errors} errors</Badge>
                          )}
                          {warnings > 0 && (
                            <Badge variant="secondary">{warnings} warnings</Badge>
                          )}
                          {errors === 0 && warnings === 0 && (
                            <Badge variant="success">Valid</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{pkg.createdBy}</TableCell>
                      <TableCell>{new Date(pkg.createdAt).toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {pkg.status === 'PENDING' && errors === 0 && (
                            <Button
                              size="sm"
                              onClick={() => handleExecute(pkg.id)}
                              disabled={executing}
                            >
                              <Rocket className="mr-1 h-3 w-3" />
                              Deploy
                            </Button>
                          )}
                          {pkg.status === 'COMPLETED' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRollback(pkg.id)}
                              disabled={rollingBack}
                            >
                              <RotateCcw className="mr-1 h-3 w-3" />
                              Rollback
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedPackage(pkg)}
                          >
                            Details
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedPackage && (
        <Dialog open={!!selectedPackage} onOpenChange={() => setSelectedPackage(null)}>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>{selectedPackage.name}</DialogTitle>
              <DialogDescription>
                {selectedPackage.description || 'No description provided'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedPackage.status)}</div>
                </div>
                <div>
                  <Label>Version</Label>
                  <p className="mt-1">{selectedPackage.version}</p>
                </div>
                <div>
                  <Label>Created By</Label>
                  <p className="mt-1">{selectedPackage.createdBy}</p>
                </div>
                <div>
                  <Label>Created At</Label>
                  <p className="mt-1">{new Date(selectedPackage.createdAt).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <Label>Changes ({selectedPackage.changes.length})</Label>
                <div className="mt-2 space-y-2">
                  {selectedPackage.changes.slice(0, 10).map((change) => (
                    <Alert key={change.id}>
                      <AlertDescription>
                        <Badge className="mr-2">{change.changeType}</Badge>
                        {change.entityType}
                      </AlertDescription>
                    </Alert>
                  ))}
                  {selectedPackage.changes.length > 10 && (
                    <p className="text-sm text-gray-500">
                      ... and {selectedPackage.changes.length - 10} more changes
                    </p>
                  )}
                </div>
              </div>

              {selectedPackage.validations.length > 0 && (
                <div>
                  <Label>Validations</Label>
                  <div className="mt-2 space-y-2">
                    {selectedPackage.validations.map((validation) => (
                      <Alert
                        key={validation.id}
                        variant={validation.severity === 'ERROR' ? 'destructive' : 'default'}
                      >
                        <AlertDescription>
                          <Badge
                            variant={
                              validation.severity === 'ERROR' ? 'destructive' : 'secondary'
                            }
                            className="mr-2"
                          >
                            {validation.severity}
                          </Badge>
                          {validation.message}
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedPackage(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
