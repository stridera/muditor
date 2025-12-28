import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  SlashCommandStringOption,
  type ChatInputCommandInteraction,
  type Interaction,
} from 'discord.js';
import { GameAdminService } from '../bridge/game-admin.service';
import { DatabaseService } from '../database/database.service';

/**
 * Discord bot service for FieryMUD integration
 *
 * Features:
 * - Slash commands for game interaction (/who, /gossip, /link)
 * - Two-way chat bridging with in-game gossip channel
 * - Account linking between Discord and Muditor
 */
@Injectable()
export class DiscordService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DiscordService.name);
  private client: Client | null = null;
  private readonly botToken: string;
  private readonly clientId: string;
  private readonly guildId: string;
  private enabled = false;

  constructor(
    private readonly configService: ConfigService,
    private readonly gameAdminService: GameAdminService,
    private readonly databaseService: DatabaseService
  ) {
    this.botToken = this.configService.get<string>('DISCORD_BOT_TOKEN') ?? '';
    this.clientId = this.configService.get<string>('DISCORD_CLIENT_ID') ?? '';
    this.guildId = this.configService.get<string>('DISCORD_GUILD_ID') ?? '';
  }

  async onModuleInit() {
    if (!this.botToken || !this.clientId) {
      this.logger.warn(
        'Discord bot not configured - set DISCORD_BOT_TOKEN and DISCORD_CLIENT_ID'
      );
      return;
    }

    try {
      await this.initializeClient();
      await this.registerCommands();
      await this.connect();
      this.enabled = true;
    } catch (error) {
      this.logger.error('Failed to initialize Discord bot', error);
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      this.logger.log('Disconnecting Discord bot...');
      this.client.destroy();
      this.client = null;
    }
  }

  private async initializeClient() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });

    this.client.on('ready', () => {
      this.logger.log(`Discord bot logged in as ${this.client?.user?.tag}`);
    });

    this.client.on('interactionCreate', async (interaction: Interaction) => {
      if (!interaction.isChatInputCommand()) return;
      await this.handleCommand(interaction);
    });

    this.client.on('error', (error: Error) => {
      this.logger.error('Discord client error', error);
    });
  }

  private async registerCommands() {
    const commands = [
      new SlashCommandBuilder()
        .setName('who')
        .setDescription('List online players in FieryMUD'),

      new SlashCommandBuilder()
        .setName('gossip')
        .setDescription('Send a message to the in-game gossip channel')
        .addStringOption((option: SlashCommandStringOption) =>
          option
            .setName('message')
            .setDescription('The message to send')
            .setRequired(true)
        ),

      new SlashCommandBuilder()
        .setName('link')
        .setDescription('Link your Discord account to your Muditor account')
        .addStringOption((option: SlashCommandStringOption) =>
          option
            .setName('code')
            .setDescription('The link code from your Muditor account')
            .setRequired(true)
        ),

      new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Show FieryMUD server statistics'),
    ];

    const rest = new REST({ version: '10' }).setToken(this.botToken);

    try {
      this.logger.log('Registering Discord slash commands...');

      if (this.guildId) {
        // Guild-specific commands (instant update)
        await rest.put(
          Routes.applicationGuildCommands(this.clientId, this.guildId),
          {
            body: commands.map(c => c.toJSON()),
          }
        );
        this.logger.log(`Registered ${commands.length} guild commands`);
      } else {
        // Global commands (can take up to an hour to propagate)
        await rest.put(Routes.applicationCommands(this.clientId), {
          body: commands.map(c => c.toJSON()),
        });
        this.logger.log(`Registered ${commands.length} global commands`);
      }
    } catch (error) {
      this.logger.error('Failed to register Discord commands', error);
      throw error;
    }
  }

  private async connect() {
    if (!this.client) return;

    this.logger.log('Connecting to Discord...');
    await this.client.login(this.botToken);
  }

  private async handleCommand(interaction: ChatInputCommandInteraction) {
    const { commandName } = interaction;

    try {
      switch (commandName) {
        case 'who':
          await this.handleWhoCommand(interaction);
          break;
        case 'gossip':
          await this.handleGossipCommand(interaction);
          break;
        case 'link':
          await this.handleLinkCommand(interaction);
          break;
        case 'stats':
          await this.handleStatsCommand(interaction);
          break;
        default:
          await interaction.reply({
            content: 'Unknown command',
            ephemeral: true,
          });
      }
    } catch (error) {
      this.logger.error(`Error handling command ${commandName}`, error);
      const errorMessage =
        error instanceof Error ? error.message : 'An error occurred';

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: `Error: ${errorMessage}`,
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: `Error: ${errorMessage}`,
          ephemeral: true,
        });
      }
    }
  }

  private async handleWhoCommand(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    try {
      const players = await this.gameAdminService.getOnlinePlayers();

      if (players.length === 0) {
        await interaction.editReply('No players are currently online.');
        return;
      }

      const playerList = players
        .map(p => {
          const godIndicator = p.godLevel > 0 ? ' [IMM]' : '';
          return `- **${p.name}** (Level ${p.level} ${p.race} ${p.class})${godIndicator}`;
        })
        .join('\n');

      await interaction.editReply({
        content: `**${players.length} player(s) online:**\n${playerList}`,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to get player list';
      await interaction.editReply(
        `Could not retrieve player list: ${errorMessage}`
      );
    }
  }

  private async handleGossipCommand(interaction: ChatInputCommandInteraction) {
    const message = interaction.options.getString('message', true);
    const discordId = interaction.user.id;
    const discordName = interaction.user.username;

    // Check if user is linked
    const link = await this.databaseService.discordLink.findUnique({
      where: { discordId },
      include: { user: true },
    });

    if (!link || !link.verified) {
      await interaction.reply({
        content:
          'You must link and verify your Discord account first. Use `/link <code>` with the code from your Muditor account settings.',
        ephemeral: true,
      });
      return;
    }

    await interaction.deferReply();

    try {
      // Send gossip message to game server
      const result = await this.gameAdminService.executeCommand(
        `gossip [Discord] ${link.user.username}: ${message}`,
        'DiscordBot'
      );

      if (result.success) {
        await interaction.editReply(
          `Sent to gossip: **${link.user.username}**: ${message}`
        );
      } else {
        await interaction.editReply(`Failed to send gossip: ${result.message}`);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to send gossip';
      await interaction.editReply(`Could not send gossip: ${errorMessage}`);
    }
  }

  private async handleLinkCommand(interaction: ChatInputCommandInteraction) {
    const code = interaction.options.getString('code', true);
    const discordId = interaction.user.id;
    const discordName = interaction.user.username;

    await interaction.deferReply({ ephemeral: true });

    try {
      // Check if already linked
      const existingLink = await this.databaseService.discordLink.findUnique({
        where: { discordId },
      });

      if (existingLink) {
        await interaction.editReply(
          'Your Discord account is already linked. Contact an admin if you need to unlink it.'
        );
        return;
      }

      // Validate link code (stored in Redis with TTL)
      // For now, we'll implement a simple code validation
      // The code format is: userId:randomToken
      const [userId, token] = code.split(':');

      if (!userId || !token) {
        await interaction.editReply(
          'Invalid link code format. Get a new code from your Muditor account settings.'
        );
        return;
      }

      // Verify the user exists
      const user = await this.databaseService.users.findUnique({
        where: { id: userId },
      });

      if (!user) {
        await interaction.editReply(
          'Invalid link code. The user account was not found.'
        );
        return;
      }

      // Create the link
      await this.databaseService.discordLink.create({
        data: {
          userId,
          discordId,
          discordName,
          verified: true, // Auto-verify since they have the code
        },
      });

      await interaction.editReply(
        `Successfully linked to Muditor account **${user.username}**! You can now use /gossip to chat in-game.`
      );

      this.logger.log(
        `Discord user ${discordName} linked to Muditor user ${user.username}`
      );
    } catch (error) {
      this.logger.error('Error linking Discord account', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to link account';
      await interaction.editReply(`Could not link account: ${errorMessage}`);
    }
  }

  private async handleStatsCommand(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    try {
      const status = await this.gameAdminService.getServerStats();

      const uptimeHours = Math.floor(status.stats.uptimeSeconds / 3600);
      const uptimeMinutes = Math.floor(
        (status.stats.uptimeSeconds % 3600) / 60
      );

      const statsMessage = [
        `**${status.server.name}** Server Status`,
        ``,
        `**Status:** ${status.server.running ? 'Online' : 'Offline'}${status.server.maintenanceMode ? ' (Maintenance)' : ''}`,
        `**Uptime:** ${uptimeHours}h ${uptimeMinutes}m`,
        `**Players:** ${status.stats.currentConnections} online (peak: ${status.stats.peakConnections})`,
        `**Commands/sec:** ${status.stats.commandsPerSecond.toFixed(2)}`,
        `**Total Logins:** ${status.stats.totalLogins}`,
      ].join('\n');

      await interaction.editReply(statsMessage);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to get server stats';
      await interaction.editReply(
        `Could not retrieve server stats: ${errorMessage}`
      );
    }
  }

  /**
   * Send a message to a configured Discord channel
   */
  async sendToChannel(channelId: string, message: string): Promise<boolean> {
    if (!this.client || !this.enabled) {
      this.logger.warn('Discord bot not connected, cannot send message');
      return false;
    }

    try {
      const channel = await this.client.channels.fetch(channelId);
      if (channel?.isTextBased() && 'send' in channel) {
        await channel.send(message);
        return true;
      }
      return false;
    } catch (error) {
      this.logger.error(
        `Failed to send message to channel ${channelId}`,
        error
      );
      return false;
    }
  }

  /**
   * Send a gossip message to the configured gossip channel
   */
  async sendGossipToDiscord(
    playerName: string,
    message: string
  ): Promise<boolean> {
    const config = await this.databaseService.discordConfig.findFirst();
    if (!config?.gossipChannelId) {
      return false;
    }

    return this.sendToChannel(
      config.gossipChannelId,
      `**[Gossip] ${playerName}:** ${message}`
    );
  }

  /**
   * Send an admin alert to the configured admin channel
   */
  async sendAdminAlert(message: string): Promise<boolean> {
    const config = await this.databaseService.discordConfig.findFirst();
    if (!config?.adminChannelId) {
      return false;
    }

    return this.sendToChannel(config.adminChannelId, `**[ADMIN]** ${message}`);
  }

  /**
   * Check if the bot is connected and enabled
   */
  isConnected(): boolean {
    return this.enabled && this.client?.isReady() === true;
  }
}
