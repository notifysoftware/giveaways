import { Client } from "discord.js";

export class GenericErrorHandler {
  constructor(private readonly client: Client) {}

  async Throw(e: Error) {
    const user = await this.client.users.fetch(process.env.MANAGER_ID!);
  }
}
