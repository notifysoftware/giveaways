import moment from "moment";
import { Client, Emoji, Message, Snowflake, TextChannel } from "discord.js";

export interface GiveawayConstructorOptions {
  prize: string;
  message: {
    channel: Snowflake;
    id: Snowflake;
  };
  ends: moment.Moment;
  hosted: Snowflake;
  winnerCount: number;
  emoji: Emoji["name"];
}

export class Giveaway {
  constructor(
    public readonly config: GiveawayConstructorOptions,
    private readonly client: Client
  ) {}

  private async fetchMessage(): Promise<Message | null> {
    const channel = (await this.client.channels.fetch(
      this.config.message.channel
    )) as TextChannel;
    if (!channel) return null;

    const message = await channel.messages.fetch(this.config.message.id);
    if (!message) return null;

    return message;
  }

  async roll() {
    const message = await this.fetchMessage();
    if (!message) return;

    if (message.author.id !== this.client.user?.id) {
      return;
    }

    const reactions = await message.reactions.cache
      .array()
      .find((reaction) => reaction.emoji.name === this.config.emoji);
  }
}
