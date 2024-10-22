import { Client, MessageEmbed } from "discord.js";
import { color } from "../util/config";

export class GenericErrorHandler {
  constructor(protected readonly client: Client) {}

  private static withEmbed(e: Error): MessageEmbed {
    return new MessageEmbed()
      .setTitle("Uh oh, something went wrong!")
      .setFooter("Notify Software")
      .setColor(color)
      .setDescription("```\n" + e.stack ?? "NO STACK" + "\n```")
      .addField("Message", e.message, true)
      .addField("Name", e.name, true);
  }

  async Throw(e: Error) {
    try {
      const user = await this.client.users.fetch(process.env.MANAGER_ID!);
      await user.send(GenericErrorHandler.withEmbed(e));
    } catch (_) {}
  }
}
