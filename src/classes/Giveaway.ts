import moment from "moment";
import { Client, Emoji, Message, Snowflake, TextChannel } from "discord.js";

export interface GiveawayConstructorOptions {
  prize: string;
  ends: moment.Moment;
  hosted: Snowflake;
  winnerCount: number;
  emoji: Emoji["name"];
  message: {
    channel: Snowflake;
    id: Snowflake;
  };
}

export class Giveaway {
  constructor(
    public readonly config: GiveawayConstructorOptions,
    private readonly client: Client
  ) {}

  private static chooseRandom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

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

    const reaction = await message.reactions.cache
      .array()
      .find((reaction) => reaction.emoji.name === this.config.emoji);

    if (!reaction) {
      return;
    }

    const users = reaction.users.cache.array();
    const winner = Giveaway.chooseRandom(users);

    try {
      await winner.send("Winner");
    } catch (e) {
      return;
    }
  }

  get ended() {
    return this.config.ends.isAfter(moment());
  }
}
