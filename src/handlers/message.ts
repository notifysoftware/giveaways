import { GuildMember, Message, Permissions, User } from "discord.js";
import { prefix } from "../util/config";
import { roll } from "../commands/roll";
import { GenericErrorHandler } from "../classes/GenericErrorHandler";
import { log as _log } from "../util/log";

const log = _log("Giveaway");

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
    roll(message, message.client).then(() => log("Rolling", message.id));
  },
  create: (message: CustomMessage, args: string[]) => {
    message.requires(memberToBeAdmin);
  },
} as const;

const commands = Object.keys(commandMap);

const wrapper = async (message: Message) => {
  if (!message.content.startsWith(prefix)) return;
  if (message.author.bot) return;

  const [command, ...args] = message.content.replace(prefix, "").split(" ");

  if (!commands.includes(command)) return;

  try {
    commandMap[command](
      new CustomMessage(message.client, message, message.channel),
      args
    );
  } catch (e) {
    await new GenericErrorHandler(message.client).Throw(e);
  }
};

export { wrapper as messageHandler };
