import { Message } from "discord.js";
import { prefix } from "../util/config";

export const messageHandler = (message: Message) => {
  if (!message.content.startsWith(prefix)) return;
  if (message.author.bot) return;

  const [command, ...args] = message.content.replace(prefix, "").split(" ");
};
