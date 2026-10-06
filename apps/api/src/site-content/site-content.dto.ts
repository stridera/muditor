import { ObjectType, Field, ID, Int, registerEnumType } from '@nestjs/graphql';
import { SiteContentKind } from '@muditor/db';

registerEnumType(SiteContentKind, {
  name: 'SiteContentKind',
  description: 'Type of public website content',
});

@ObjectType({
  description: 'Public website content (rules, guides, lore, news) in markdown',
})
export class SiteContentDto {
  @Field(() => ID)
  id: string;

  @Field({ description: 'URL slug, unique across all content' })
  slug: string;

  @Field(() => SiteContentKind)
  kind: SiteContentKind;

  @Field()
  title: string;

  @Field(() => String, { nullable: true, description: 'Short teaser text' })
  summary?: string | null;

  @Field({ description: 'Markdown body' })
  body: string;

  @Field({
    description: 'Only published content is visible to anonymous users',
  })
  published: boolean;

  @Field(() => Date, { nullable: true })
  publishedAt?: Date | null;

  @Field(() => Int)
  sortOrder: number;

  @Field(() => String, { nullable: true })
  authorId?: string | null;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
