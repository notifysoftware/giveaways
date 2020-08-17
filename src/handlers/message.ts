import { GuildMember, Message, Permissions, User } from "discord.js";
import { prefix } from "../util/config";
import { roll } from "../commands/roll";
import { GenericErrorHandler } from "../classes/GenericErrorHandler";

class CustomMessage extends Message {
  requires(callback: (author: GuildMember) => boolean) {
    if (!callback(this.member as GuildMember)) {
      throw new Error("User cannot use this command");
    }
  }
}

const memberToBeAdmin = (member: GuildMember) => {
  return (
    member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES) ||
    member.roles.cache
      .array()
      .some((role) => role.name.toLowerCase() === "giveaways")
  );
};

const commandMap: {
  [key: string]: (message: CustomMessage, args: string[]) => unknown;
} = {
  roll: (message: CustomMessage, args: string[]) => {
    message.requires(memberToBeAdmin);
    roll(message, message.client);
  },
  create: (message: CustomMessage, args: string[]) => {
    message.requires(memberToBeAdmin);
  },
} as const;

const commands = Object.keys(commandMap);

const messageHandler = async (
  message: CustomMessage,
  command: string,
  args: string[]
) => {
  if (commands.includes(command)) {
    commandMap[command](message, args);
  }
};

const wrapper = async (message: Message) => {
  if (!message.content.startsWith(prefix)) return;
  if (message.author.bot) return;

  const [command, ...args] = message.content.replace(prefix, "").split(" ");

  try {
    await messageHandler(
      new CustomMessage(message.client, message, message.channel),
      command,
      args
    );
  } catch (e) {
    await new GenericErrorHandler(message.client).Throw(e);
  }
};

export { wrapper as messageHandler };
