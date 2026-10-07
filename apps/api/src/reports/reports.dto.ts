import { Field, ID, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { ReportStatus, ReportType } from '@muditor/db';

registerEnumType(ReportType, {
  name: 'ReportType',
  description: 'Kind of player report (in-game bug / idea / typo commands)',
});

registerEnumType(ReportStatus, {
  name: 'ReportStatus',
  description: 'Triage status of a player report',
});

@ObjectType('Report', {
  description: 'A player-filed bug, idea or typo report with computed ranking',
})
export class ReportDto {
  @Field(() => ID)
  id: number;

  @Field(() => ReportType)
  reportType: ReportType;

  @Field(() => ReportStatus)
  status: ReportStatus;

  @Field()
  reporterName: string;

  @Field(() => String, { nullable: true })
  reporterId?: string | null;

  @Field(() => Int, { nullable: true })
  roomZoneId?: number | null;

  @Field(() => Int, { nullable: true })
  roomId?: number | null;

  @Field()
  message: string;

  @Field(() => String, { nullable: true })
  resolvedBy?: string | null;

  @Field(() => Date, { nullable: true })
  resolvedAt?: Date | null;

  @Field(() => String, { nullable: true })
  resolution?: string | null;

  @Field(() => Int, {
    nullable: true,
    description: 'Manual priority override: 0 = P0 critical ... 3 = P3 low',
  })
  priority?: number | null;

  @Field(() => ID, { nullable: true })
  duplicateOfId?: number | null;

  @Field(() => [String])
  tags: string[];

  @Field(() => String, { nullable: true })
  assignedTo?: string | null;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => Int, {
    description: 'Ranking score (see report-ranking.ts for the formula)',
  })
  score: number;

  @Field(() => Int, {
    description:
      '1-based position by score among all reports matching the filter',
  })
  rank: number;

  @Field(() => Int, {
    description:
      'Duplicate reports: marked duplicates plus similar open reports in the same room',
  })
  similarCount: number;
}

@ObjectType('ReportPage')
export class ReportPageDto {
  @Field(() => [ReportDto])
  items: ReportDto[];

  @Field(() => Int, { description: 'Total reports matching the filter' })
  total: number;
}
