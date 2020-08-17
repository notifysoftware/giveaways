import { Giveaway } from "../classes/Giveaway";
import { Client, Message } from "discord.js";

export const roll = (message: Message, client: Client) => {
  Giveaway.from(message, client)?.roll();
};
