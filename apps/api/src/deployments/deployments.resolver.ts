import { UseGuards } from '@nestjs/common';
import { Args, Context, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@muditor/db';
import { CreateDeploymentInput, DeploymentPackageDto } from './deployments.dto';
import { DeploymentsService } from './deployments.service';
import { DeploymentStatus } from '@muditor/db';

@Resolver(() => DeploymentPackageDto)
@UseGuards(JwtAuthGuard, RolesGuard)
export class DeploymentsResolver {
  constructor(private readonly deploymentsService: DeploymentsService) {}

  @Query(() => [DeploymentPackageDto], { name: 'deploymentPackages' })
  @Roles(UserRole.BUILDER, UserRole.CODER, UserRole.IMPLEMENTOR)
  async findAll(
    @Args('status', { type: () => DeploymentStatus, nullable: true })
    status?: DeploymentStatus
  ) {
    return this.deploymentsService.findAll(status);
  }

  @Query(() => DeploymentPackageDto, {
    name: 'deploymentPackage',
    nullable: true,
  })
  @Roles(UserRole.BUILDER, UserRole.CODER, UserRole.IMPLEMENTOR)
  async findOne(@Args('id', { type: () => ID }) id: string) {
    return this.deploymentsService.findOne(id);
  }

  @Mutation(() => DeploymentPackageDto)
  @Roles(UserRole.BUILDER, UserRole.CODER, UserRole.IMPLEMENTOR)
  async createDeployment(
    @Args('input') input: CreateDeploymentInput,
    @Context() context: { req: { user: { sub: string; username: string } } }
  ) {
    const createdBy = context.req.user.username ?? context.req.user.sub;
    return this.deploymentsService.create(input, createdBy);
  }

  @Mutation(() => DeploymentPackageDto)
  @Roles(UserRole.CODER, UserRole.IMPLEMENTOR)
  async markDeploymentReady(@Args('id', { type: () => ID }) id: string) {
    return this.deploymentsService.markReady(id);
  }

  @Mutation(() => DeploymentPackageDto)
  @Roles(UserRole.CODER, UserRole.IMPLEMENTOR)
  async deployPackage(@Args('id', { type: () => ID }) id: string) {
    return this.deploymentsService.markDeployed(id);
  }

  @Mutation(() => DeploymentPackageDto)
  @Roles(UserRole.CODER, UserRole.IMPLEMENTOR)
  async rollbackDeployment(@Args('id', { type: () => ID }) id: string) {
    return this.deploymentsService.rollback(id);
  }
}
