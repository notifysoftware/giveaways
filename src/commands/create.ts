import { Message } from "discord.js";
import { GiveawayConstructorOptions } from "../classes/Giveaway";
import { GenericErrorHandler } from "../classes/GenericErrorHandler";
import { emoji } from "../util/config";
import moment from "moment";

export const create = async (message: Message, args: string[]) => {
  const awaitFirst = async <T = null | string | Message>(
    fullResponse: boolean = false
  ): Promise<T | null | Message | string> => {
    const result = await message.channel
      .awaitMessages((m) => m.author.id == message.author.id, {
        max: 1,
        time: 30000,
      })
      .then((m) => m.first());

    if (!result || result.content === "cancel") {
      await message.reply("Cancelled");
      return null;
    }

    if (fullResponse) {
      return result;
    } else {
      return result.content;
    }
  };

  const assert = async <T>(value: T): Promise<boolean> => {
    if (!value) {
      await message.reply("Something went wrong!");

      await new GenericErrorHandler(message.client).Throw(
        new Error("Values cannot be falsy")
      );

      return false;
    }

    return true;
  };

  await message.channel.send("What is the prize?");
  const prize = await awaitFirst();
  await assert(prize);

  await message.channel.send("How long should this giveaway last?");
  const _endsAt = (await awaitFirst()) as string;
  await assert(_endsAt);

  const endsAt = moment(_endsAt);

  await message.channel.send("How many winners should there be?");
  const winnerCount = (await awaitFirst()) as string;

  await message.channel.send("Where will this giveaway take place?");
  const _channel = (await awaitFirst(true)) as Message;

  const channel = _channel.mentions.channels.first();
  if (!channel) return message.reply("Could not find that channel.");

  const m = await channel.send("Test");

  const config: GiveawayConstructorOptions = {
    winnerCount,
    ends: endsAt,
    prize,
    emoji,
    hosted: message.author.id,
    message: {
      channel: channel.id,
      id: m.id,
    },
  } as const;
};
