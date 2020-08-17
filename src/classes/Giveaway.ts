import moment from "moment";

import { Client, Emoji, Message, Snowflake, TextChannel } from "discord.js";

import { GenericErrorHandler } from "./GenericErrorHandler";
import { JsonFS } from "./JsonFS";

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

export class Giveaway extends GenericErrorHandler {
  constructor(
    public readonly config: GiveawayConstructorOptions,
    client: Client
  ) {
    super(client);
  }

  /**
   * Finds a winner
   * @param arr The users
   * @private
   */
  private static chooseRandom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  /**
   * Fetches the message of the giveaway
   * @private
   */
  private async fetchMessage(): Promise<Message | null> {
    const channel = (await this.client.channels.fetch(
      this.config.message.channel
    )) as TextChannel;
    if (!channel) return null;

    const message = await channel.messages.fetch(this.config.message.id);
    if (!message) return null;

    return message;
  }

  /**
   * Finds a winner
   */
  async roll() {
    const message = await this.fetchMessage();
    if (!message) return;

    if (message.author.id !== this.client.user?.id) {
      await this.Throw(new Error("Could not confirm message authenticity"));
      return;
    }

    const reaction = await message.reactions.cache
      .array()
      .find((reaction) => reaction.emoji.name === this.config.emoji);

    if (!reaction) {
      await this.Throw(new Error("Could not find reaction"));
      return;
    }

    const users = reaction.users.cache.array();
    const winner = Giveaway.chooseRandom(users);

    try {
      await winner.send("Winner");
      return winner;
    } catch (e) {
      await this.Throw(e);
    }
  }

  /**
   * Boolean representing if the giveaway has ended
   */
  get ended() {
    return this.config.ends.isAfter(moment());
  }

  /**
   * The time until (or passed) since the giveaway was created
   */
  get fromNow() {
    return this.config.ends.fromNow();
  }

  /**
   * Finds an already existing giveaway and creates it
   * @param message The message object
   * @param client The client
   */
  static from(message: Message, client: Client) {
    const giveaways = JsonFS.read();

    const giveaway = giveaways.find(
      (giveaway) => giveaway.message.id === message.id
    );

    if (giveaway) {
      return new Giveaway(giveaway, client);
    }

    return null;
  }
}
