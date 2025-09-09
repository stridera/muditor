'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  MapPin,
  Users,
  Package,
  Building2,
  ShieldAlert,
  RefreshCw,
  Clock,
  ExternalLink,
} from 'lucide-react';

// TypeScript interfaces for validation data
interface ValidationIssue {
  id: string;
  type: 'error' | 'warning' | 'info';
  category: 'integrity' | 'quality' | 'consistency';
  entity: 'zone' | 'room' | 'mob' | 'object' | 'shop';
  entityId: number;
  title: string;
  description: string;
  suggestion?: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

interface ValidationReport {
  zoneId: number;
  zoneName: string;
  totalIssues: number;
  errorCount: number;
  warningCount: number;
  infoCount: number;
  issues: ValidationIssue[];
  generatedAt: string;
}

interface ValidationSummary {
  totalZones: number;
  zonesWithIssues: number;
  totalIssues: number;
  errorCount: number;
  warningCount: number;
  infoCount: number;
}

// GraphQL queries
const VALIDATION_SUMMARY_QUERY = `
  query GetValidationSummary {
    getValidationSummary {
      totalZones
      zonesWithIssues
      totalIssues
      errorCount
      warningCount
      infoCount
    }
  }
`;

const VALIDATE_ALL_ZONES_QUERY = `
  query ValidateAllZones {
    validateAllZones {
      zoneId
      zoneName
      totalIssues
      errorCount
      warningCount
      infoCount
      issues {
        id
        type
        category
        entity
        entityId
        title
        description
        suggestion
        severity
      }
      generatedAt
    }
  }
`;

export default function ValidationPage() {
  const [validationSummary, setValidationSummary] =
    useState<ValidationSummary | null>(null);
  const [zoneReports, setZoneReports] = useState<ValidationReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchValidationData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      // Fetch validation summary
      const summaryResponse = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: VALIDATION_SUMMARY_QUERY,
        }),
      });

      const summaryResult = await summaryResponse.json();
      if (summaryResult.errors) {
        throw new Error(summaryResult.errors[0].message);
      }

      setValidationSummary(summaryResult.data.getValidationSummary);

      // Fetch detailed zone reports
      const zonesResponse = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: VALIDATE_ALL_ZONES_QUERY,
        }),
      });

      const zonesResult = await zonesResponse.json();
      if (zonesResult.errors) {
        throw new Error(zonesResult.errors[0].message);
      }

      setZoneReports(zonesResult.data.validateAllZones);
      setLastUpdated(new Date());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unknown error occurred'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchValidationData();
  }, []);

  const handleRefresh = () => {
    fetchValidationData(true);
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <ShieldAlert className='h-4 w-4 text-red-600' />;
      case 'high':
        return <AlertCircle className='h-4 w-4 text-red-500' />;
      case 'medium':
        return <AlertTriangle className='h-4 w-4 text-orange-500' />;
      case 'low':
        return <Info className='h-4 w-4 text-blue-500' />;
      default:
        return <Info className='h-4 w-4 text-gray-500' />;
    }
  };

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-red-50 text-red-700 border-red-150';
      case 'medium':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEntityIcon = (entity: string) => {
    switch (entity) {
      case 'zone':
        return <MapPin className='h-4 w-4' />;
      case 'room':
        return <Building2 className='h-4 w-4' />;
      case 'mob':
        return <Users className='h-4 w-4' />;
      case 'object':
        return <Package className='h-4 w-4' />;
      case 'shop':
        return <Building2 className='h-4 w-4' />;
      default:
        return <Info className='h-4 w-4' />;
    }
  };

  const allIssues = zoneReports
    .flatMap(report =>
      report.issues.map(issue => ({
        ...issue,
        zoneId: report.zoneId,
        zoneName: report.zoneName,
      }))
    )
    .sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return (
        (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0)
      );
    });

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-96'>
        <div className='text-center'>
          <RefreshCw className='h-8 w-8 animate-spin mx-auto mb-4 text-blue-500' />
          <p className='text-gray-600'>Loading validation data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='p-6'>
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertTitle>Error Loading Validation Data</AlertTitle>
          <AlertDescription>
            {error}
            <Button
              variant='outline'
              size='sm'
              className='ml-4'
              onClick={() => fetchValidationData()}
            >
              <RefreshCw className='h-4 w-4 mr-2' />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!validationSummary) {
    return <div>No validation data available</div>;
  }

  const healthScore =
    validationSummary.totalZones > 0
      ? Math.round(
          ((validationSummary.totalZones - validationSummary.zonesWithIssues) /
            validationSummary.totalZones) *
            100
        )
      : 100;

  return (
    <div className='p-6 space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Data Validation</h1>
          <p className='text-sm text-gray-500 mt-1'>
            Quality assurance and integrity checks for world data
          </p>
          {lastUpdated && (
            <p className='text-xs text-gray-400 mt-1 flex items-center'>
              <Clock className='h-3 w-3 mr-1' />
              Last updated: {lastUpdated.toLocaleString()}
            </p>
          )}
        </div>
        <Button onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw
            className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`}
          />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>World Health</CardTitle>
            <CheckCircle2
              className={`h-4 w-4 ${healthScore >= 80 ? 'text-green-500' : healthScore >= 60 ? 'text-yellow-500' : 'text-red-500'}`}
            />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{healthScore}%</div>
            <p className='text-xs text-muted-foreground'>
              {validationSummary.totalZones - validationSummary.zonesWithIssues}{' '}
              of {validationSummary.totalZones} zones clean
            </p>
            <Progress value={healthScore} className='mt-2' />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Critical Errors
            </CardTitle>
            <AlertCircle className='h-4 w-4 text-red-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-red-600'>
              {validationSummary.errorCount}
            </div>
            <p className='text-xs text-muted-foreground'>
              Require immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Warnings</CardTitle>
            <AlertTriangle className='h-4 w-4 text-orange-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-orange-500'>
              {validationSummary.warningCount}
            </div>
            <p className='text-xs text-muted-foreground'>Should be reviewed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Suggestions</CardTitle>
            <Info className='h-4 w-4 text-blue-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-blue-500'>
              {validationSummary.infoCount}
            </div>
            <p className='text-xs text-muted-foreground'>
              Ideas for improvement
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue='overview' className='space-y-4'>
        <TabsList>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='zones'>Zone Reports</TabsTrigger>
          <TabsTrigger value='issues'>
            All Issues ({allIssues.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value='overview' className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-2'>
            <Card>
              <CardHeader>
                <CardTitle>Zone Health Distribution</CardTitle>
                <CardDescription>
                  Breakdown of zones by issue count
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-2'>
                  {zoneReports.slice(0, 10).map(report => (
                    <div
                      key={report.zoneId}
                      className='flex items-center justify-between'
                    >
                      <span className='text-sm'>
                        Zone {report.zoneId} - {report.zoneName}
                      </span>
                      <div className='flex items-center gap-2'>
                        {report.errorCount > 0 && (
                          <Badge variant='destructive' className='text-xs'>
                            {report.errorCount} errors
                          </Badge>
                        )}
                        {report.warningCount > 0 && (
                          <Badge
                            variant='secondary'
                            className='text-xs bg-orange-100 text-orange-800'
                          >
                            {report.warningCount} warnings
                          </Badge>
                        )}
                        {report.totalIssues === 0 && (
                          <Badge
                            variant='secondary'
                            className='text-xs bg-green-100 text-green-800'
                          >
                            ✓ Clean
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                  {zoneReports.length > 10 && (
                    <p className='text-xs text-gray-500 pt-2'>
                      ... and {zoneReports.length - 10} more zones
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Issue Categories</CardTitle>
                <CardDescription>
                  Types of validation issues found
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-2'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm flex items-center'>
                      <ShieldAlert className='h-4 w-4 mr-2 text-red-500' />
                      Integrity Issues
                    </span>
                    <Badge variant='destructive'>
                      {allIssues.filter(i => i.category === 'integrity').length}
                    </Badge>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm flex items-center'>
                      <AlertTriangle className='h-4 w-4 mr-2 text-orange-500' />
                      Quality Issues
                    </span>
                    <Badge
                      variant='secondary'
                      className='bg-orange-100 text-orange-800'
                    >
                      {allIssues.filter(i => i.category === 'quality').length}
                    </Badge>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm flex items-center'>
                      <Info className='h-4 w-4 mr-2 text-blue-500' />
                      Consistency Issues
                    </span>
                    <Badge
                      variant='secondary'
                      className='bg-blue-100 text-blue-800'
                    >
                      {
                        allIssues.filter(i => i.category === 'consistency')
                          .length
                      }
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='zones' className='space-y-4'>
          <div className='grid gap-4'>
            {zoneReports
              .filter(report => report.totalIssues > 0)
              .sort((a, b) => b.totalIssues - a.totalIssues)
              .map(report => (
                <Card key={report.zoneId}>
                  <CardHeader>
                    <div className='flex items-center justify-between'>
                      <CardTitle className='text-lg'>
                        Zone {report.zoneId} - {report.zoneName}
                      </CardTitle>
                      <div className='flex items-center gap-2'>
                        {report.errorCount > 0 && (
                          <Badge variant='destructive'>
                            {report.errorCount} errors
                          </Badge>
                        )}
                        {report.warningCount > 0 && (
                          <Badge
                            variant='secondary'
                            className='bg-orange-100 text-orange-800'
                          >
                            {report.warningCount} warnings
                          </Badge>
                        )}
                        {report.infoCount > 0 && (
                          <Badge
                            variant='secondary'
                            className='bg-blue-100 text-blue-800'
                          >
                            {report.infoCount} info
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardDescription>
                      {report.totalIssues} total issues found
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-3'>
                      {report.issues.slice(0, 5).map(issue => (
                        <div key={issue.id} className='border rounded-lg p-3'>
                          <div className='flex items-start justify-between mb-2'>
                            <div className='flex items-center gap-2'>
                              {getSeverityIcon(issue.severity)}
                              <span className='font-medium text-sm'>
                                {issue.title}
                              </span>
                              <Badge
                                className={getSeverityBadgeColor(
                                  issue.severity
                                )}
                              >
                                {issue.severity}
                              </Badge>
                            </div>
                            <div className='flex items-center gap-1 text-xs text-gray-500'>
                              {getEntityIcon(issue.entity)}
                              <span>
                                {issue.entity} {issue.entityId}
                              </span>
                            </div>
                          </div>
                          <p className='text-sm text-gray-600 mb-2'>
                            {issue.description}
                          </p>
                          {issue.suggestion && (
                            <p className='text-xs text-blue-600 bg-blue-50 p-2 rounded'>
                              💡 {issue.suggestion}
                            </p>
                          )}
                        </div>
                      ))}
                      {report.issues.length > 5 && (
                        <p className='text-xs text-gray-500'>
                          ... and {report.issues.length - 5} more issues in this
                          zone
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value='issues' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>All Issues</CardTitle>
              <CardDescription>
                Complete list of all validation issues across the world (sorted
                by severity)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-3 max-h-96 overflow-y-auto'>
                {allIssues.map(issue => (
                  <div
                    key={`${issue.zoneId}-${issue.id}`}
                    className='border rounded-lg p-3'
                  >
                    <div className='flex items-start justify-between mb-2'>
                      <div className='flex items-center gap-2'>
                        {getSeverityIcon(issue.severity)}
                        <span className='font-medium text-sm'>
                          {issue.title}
                        </span>
                        <Badge
                          className={getSeverityBadgeColor(issue.severity)}
                        >
                          {issue.severity}
                        </Badge>
                      </div>
                      <div className='flex items-center gap-2 text-xs text-gray-500'>
                        <MapPin className='h-3 w-3' />
                        <span>Zone {issue.zoneId}</span>
                        {getEntityIcon(issue.entity)}
                        <span>
                          {issue.entity} {issue.entityId}
                        </span>
                      </div>
                    </div>
                    <p className='text-sm text-gray-600 mb-2'>
                      {issue.description}
                    </p>
                    {issue.suggestion && (
                      <p className='text-xs text-blue-600 bg-blue-50 p-2 rounded'>
                        💡 {issue.suggestion}
                      </p>
                    )}
                  </div>
                ))}
                {allIssues.length === 0 && (
                  <div className='text-center py-8 text-gray-500'>
                    <CheckCircle2 className='h-8 w-8 mx-auto mb-2 text-green-500' />
                    <p>🎉 No validation issues found!</p>
                    <p className='text-sm'>
                      Your world data is in excellent condition.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
