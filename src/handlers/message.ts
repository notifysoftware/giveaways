import { GuildMember, Message, Permissions, User } from "discord.js";
import { prefix } from "../util/config";

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
      message.requires((user) =>
        user.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)
      );
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
  } catch (_) {}
};

export { wrapper as messageHandler };
