import { Giveaway } from "../classes/Giveaway";
import { Client, Message } from "discord.js";

export const roll = async (message: Message, client: Client) => {
  const giveaway = Giveaway.from(message.id, client);

  if (!giveaway) {
    return message.reply("Could not find giveaway");
  }

  await giveaway.roll();
};
