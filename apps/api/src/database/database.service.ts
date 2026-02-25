import {
  Injectable,
  Logger,
  type OnModuleDestroy,
  type OnModuleInit,
} from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { Prisma, PrismaClient } from '@muditor/db';
import { stripMarkup } from '../common/text-utils';

// Create extended Prisma client with plaintext field middleware
function createExtendedPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  });
  const prisma = new PrismaClient({
    adapter,
    log: [
      {
        emit: 'event',
        level: 'query',
      },
      {
        emit: 'event',
        level: 'error',
      },
      {
        emit: 'event',
        level: 'info',
      },
      {
        emit: 'event',
        level: 'warn',
      },
    ],
  });

  // Prisma $extends query callbacks require `any` for the destructured { args, query } parameter
  // because the exact types are deeply generic, model-specific, and inferred by Prisma at the call site.
  /* eslint-disable @typescript-eslint/no-explicit-any */
  return prisma.$extends({
    query: {
      mobs: {
        async create({ args, query }: any) {
          if (args.data.name) {
            args.data.plainName = stripMarkup(args.data.name);
          }
          if (args.data.roomDescription) {
            args.data.plainRoomDescription = stripMarkup(
              args.data.roomDescription
            );
          }
          if (args.data.examineDescription) {
            args.data.plainExamineDescription = stripMarkup(
              args.data.examineDescription
            );
          }
          return query(args);
        },
        async update({ args, query }: any) {
          if (args.data.name) {
            args.data.plainName = stripMarkup(args.data.name as string);
          }
          if (args.data.roomDescription) {
            args.data.plainRoomDescription = stripMarkup(
              args.data.roomDescription as string
            );
          }
          if (args.data.examineDescription) {
            args.data.plainExamineDescription = stripMarkup(
              args.data.examineDescription as string
            );
          }
          return query(args);
        },
      },
      objects: {
        async create({ args, query }: any) {
          if (args.data.name) {
            args.data.plainName = stripMarkup(args.data.name);
          }
          if (args.data.roomDescription) {
            args.data.plainRoomDescription = stripMarkup(
              args.data.roomDescription
            );
          }
          if (args.data.examineDescription) {
            args.data.plainExamineDescription = stripMarkup(
              args.data.examineDescription
            );
          }
          if (args.data.actionDescription) {
            args.data.plainActionDescription = stripMarkup(
              args.data.actionDescription
            );
          }
          return query(args);
        },
        async update({ args, query }: any) {
          if (args.data.name) {
            args.data.plainName = stripMarkup(args.data.name as string);
          }
          if (args.data.roomDescription) {
            args.data.plainRoomDescription = stripMarkup(
              args.data.roomDescription as string
            );
          }
          if (args.data.examineDescription) {
            args.data.plainExamineDescription = stripMarkup(
              args.data.examineDescription as string
            );
          }
          if (args.data.actionDescription) {
            args.data.plainActionDescription = stripMarkup(
              args.data.actionDescription as string
            );
          }
          return query(args);
        },
      },
      room: {
        async create({ args, query }: any) {
          if (args.data.roomDescription) {
            args.data.plainRoomDescription = stripMarkup(
              args.data.roomDescription
            );
          }
          return query(args);
        },
        async update({ args, query }: any) {
          if (args.data.roomDescription) {
            args.data.plainRoomDescription = stripMarkup(
              args.data.roomDescription as string
            );
          }
          return query(args);
        },
      },
      characterClass: {
        async create({ args, query }: any) {
          if (args.data.name) {
            args.data.plainName = stripMarkup(args.data.name);
          }
          return query(args);
        },
        async update({ args, query }: any) {
          if (args.data.name) {
            args.data.plainName = stripMarkup(args.data.name as string);
          }
          return query(args);
        },
      },
      ability: {
        async create({ args, query }: any) {
          if (args.data.name) {
            args.data.plainName = stripMarkup(args.data.name);
          }
          return query(args);
        },
        async update({ args, query }: any) {
          if (args.data.name) {
            args.data.plainName = stripMarkup(args.data.name as string);
          }
          return query(args);
        },
      },
      races: {
        async create({ args, query }: any) {
          if (args.data.name) {
            args.data.plainName = stripMarkup(args.data.name);
          }
          return query(args);
        },
        async update({ args, query }: any) {
          if (args.data.name) {
            args.data.plainName = stripMarkup(args.data.name as string);
          }
          return query(args);
        },
      },
      quests: {
        async create({ args, query }: any) {
          if (args.data.name) {
            args.data.plainName = stripMarkup(args.data.name);
          }
          return query(args);
        },
        async update({ args, query }: any) {
          if (args.data.name) {
            args.data.plainName = stripMarkup(args.data.name as string);
          }
          return query(args);
        },
      },
    },
  });
  /* eslint-enable @typescript-eslint/no-explicit-any */
}

type ExtendedPrismaClient = ReturnType<typeof createExtendedPrismaClient>;

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private client: ExtendedPrismaClient;

  constructor() {
    // Create extended client directly
    this.client = createExtendedPrismaClient();
  }

  // Expose all Prisma model delegates through the client
  get users() {
    return this.client.users;
  }

  get characters() {
    return this.client.characters;
  }

  get zones() {
    return this.client.zones;
  }

  get room() {
    return this.client.room;
  }

  get mobs() {
    return this.client.mobs;
  }

  get objects() {
    return this.client.objects;
  }

  get shops() {
    return this.client.shops;
  }

  get roomExit() {
    return this.client.roomExit;
  }

  get roomExtraDescriptions() {
    return this.client.roomExtraDescriptions;
  }

  get mobCarrying() {
    return this.client.mobCarrying;
  }

  get mobResets() {
    return this.client.mobResets;
  }

  get objectResets() {
    return this.client.objectResets;
  }

  get triggers() {
    return this.client.triggers;
  }

  get races() {
    return this.client.races;
  }

  get userGrants() {
    return this.client.userGrants;
  }

  get equipmentSets() {
    return this.client.equipmentSets;
  }

  get equipmentSetItems() {
    return this.client.equipmentSetItems;
  }

  get characterItems() {
    return this.client.characterItems;
  }

  get auditLogs() {
    return this.client.auditLogs;
  }

  get banRecords() {
    return this.client.banRecords;
  }

  get ability() {
    return this.client.ability;
  }

  get abilityMessages() {
    return this.client.abilityMessages;
  }

  get abilitySavingThrow() {
    return this.client.abilitySavingThrow;
  }

  get abilitySchool() {
    return this.client.abilitySchool;
  }

  get abilityTargeting() {
    return this.client.abilityTargeting;
  }

  get characterClass() {
    return this.client.characterClass;
  }

  get characterEffects() {
    return this.client.characterEffects;
  }

  get classAbilities() {
    return this.client.classAbilities;
  }

  get classAbilityCircles() {
    return this.client.classAbilityCircles;
  }

  get classSkills() {
    return this.client.classSkills;
  }

  get effect() {
    return this.client.effect;
  }

  get mobResetEquipment() {
    return this.client.mobResetEquipment;
  }

  get raceAbilities() {
    return this.client.raceAbilities;
  }

  get shopHours() {
    return this.client.shopHours;
  }

  get shopItems() {
    return this.client.shopItems;
  }

  get social() {
    return this.client.social;
  }

  get helpEntry() {
    return this.client.helpEntry;
  }

  get gameConfig() {
    return this.client.gameConfig;
  }

  get levelDefinition() {
    return this.client.levelDefinition;
  }

  get systemText() {
    return this.client.systemText;
  }

  get loginMessage() {
    return this.client.loginMessage;
  }

  get command() {
    return this.client.command;
  }

  get playerMail() {
    return this.client.playerMail;
  }

  get accountMail() {
    return this.client.accountMail;
  }

  get accountItems() {
    return this.client.accountItems;
  }

  get board() {
    return this.client.board;
  }

  get boardMessage() {
    return this.client.boardMessage;
  }

  get boardMessageEdit() {
    return this.client.boardMessageEdit;
  }

  get discordLink() {
    return this.client.discordLink;
  }

  get discordConfig() {
    return this.client.discordConfig;
  }

  get googleLink() {
    return this.client.googleLink;
  }

  get loginRequests() {
    return this.client.loginRequests;
  }

  // Quest system
  get quests() {
    return this.client.quests;
  }

  get questPhases() {
    return this.client.questPhases;
  }

  get questObjectives() {
    return this.client.questObjectives;
  }

  get questDialogue() {
    return this.client.questDialogue;
  }

  get questRewards() {
    return this.client.questRewards;
  }

  get questPrerequisites() {
    return this.client.questPrerequisites;
  }

  get characterQuests() {
    return this.client.characterQuests;
  }

  get characterQuestObjectives() {
    return this.client.characterQuestObjectives;
  }

  get dialogueTrees() {
    return this.client.dialogueTrees;
  }

  get dialogueNodes() {
    return this.client.dialogueNodes;
  }

  get dialogueResponses() {
    return this.client.dialogueResponses;
  }

  // Pass-through Prisma client methods
  async $connect() {
    return this.client.$connect();
  }

  async $disconnect() {
    return this.client.$disconnect();
  }

  $queryRaw<T = unknown>(
    query: TemplateStringsArray | Prisma.Sql,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- matches Prisma's $queryRaw signature which uses any[]
    ...values: any[]
  ): Promise<T> {
    return this.client.$queryRaw(query, ...values) as Promise<T>;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- matches Prisma's $queryRawUnsafe signature which uses any[]
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Promise<T> {
    return this.client.$queryRawUnsafe(query, ...values) as Promise<T>;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- matches Prisma's $executeRaw signature which uses any[]
  $executeRaw(query: TemplateStringsArray | Prisma.Sql, ...values: any[]) {
    return this.client.$executeRaw(query, ...values);
  }

  $transaction<R>(
    fn: (
      prisma: Omit<
        PrismaClient,
        | '$connect'
        | '$disconnect'
        | '$on'
        | '$transaction'
        | '$use'
        | '$extends'
      >
    ) => Promise<R>
  ): Promise<R>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Prisma $transaction accepts both PrismaPromise<any>[] and function forms
  $transaction<R>(arg: any): Promise<R> {
    return this.client.$transaction(arg) as Promise<R>;
  }

  async onModuleInit() {
    // Note: Prisma extended clients ($extends) don't have $on method in Prisma 5+
    // Event logging is configured in the base PrismaClient constructor instead
    // The logs will still be emitted, but we can't attach handlers to the extended client

    try {
      await this.$connect();
      this.logger.log('✅ Database connected successfully');
    } catch (error) {
      this.logger.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      this.logger.log('✅ Database disconnected successfully');
    } catch (error) {
      this.logger.error('❌ Database disconnection failed:', error);
    }
  }

  async healthCheck() {
    try {
      await this.$queryRaw`SELECT 1`;
      return { healthy: true, message: 'Database is healthy' };
    } catch (error) {
      return {
        healthy: false,
        message: `Database health check failed: ${error}`,
      };
    }
  }
}
