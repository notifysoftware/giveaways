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

const messageHandler = async (
  message: CustomMessage,
  command: string,
  args: string[]
) => {
  switch (command) {
    case "rolls": {
      message.requires(
        (user) =>
          user.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES) ||
          user.roles.cache
            .array()
            .some((role) => role.name.toLowerCase() === "giveaways")
      );

      roll(message, message.client);
    }
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
