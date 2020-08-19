import moment from "moment";

import {
  Client,
  Emoji,
  Message,
  MessageReaction,
  Snowflake,
  TextChannel,
  User,
} from "discord.js";

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
  public readonly config: GiveawayConstructorOptions;

  constructor(config: GiveawayConstructorOptions, client: Client) {
    super(client);

    this.config = config;

    const _channel = client.channels.fetch(
      this.config.message.channel
    ) as Promise<TextChannel>;
    _channel.then(async (channel) => {
      await channel.send("hii");
    });
  }

  object(): GiveawayConstructorOptions {
    return {
      prize: this.config.prize,
      ends: this.config.ends,
      hosted: this.config.hosted,
      winnerCount: this.config.winnerCount,
      emoji: this.config.emoji,
      message: this.config.message,
    } as const;
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
   * Fetches all users who have react (thanks @sycer-dev!)
   * @param reaction
   * @param after
   * @private
   */
  private async fetchUsers(
    reaction: MessageReaction,
    after?: string
  ): Promise<User[]> {
    const reactions = await reaction.users.fetch({ limit: 100, after });
    if (!reactions.size) return [];

    const last = reactions.first()?.id;
    const next = await this.fetchUsers(reaction, last);

    return [...reactions.array(), ...next];
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

    const reactions = await message
      .fetch(true)
      .then((message) => message.reactions.cache.array());

    const reaction = reactions.find(
      (reaction) => reaction.emoji.name === this.config.emoji
    );

    if (!reaction) {
      await this.Throw(new Error("Could not find reaction"));
      return;
    }

    const users = await this.fetchUsers(reaction);
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
  static from(message: Snowflake, client: Client) {
    const giveaways = JsonFS.read();

    const giveaway = giveaways.find(
      (giveaway) => giveaway.message.id === message
    );

    if (giveaway) {
      return new Giveaway(giveaway, client);
    }

    return null;
  }
}
