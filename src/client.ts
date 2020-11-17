import { Client, Intents } from "discord.js";
import { log as _log } from "./util/log";

const log = _log("Client");

export const client = new Client({
  messageCacheLifetime: 300,
  messageCacheMaxSize: 15,
  messageSweepInterval: 900,
  partials: ["MESSAGE", "REACTION", "USER"],
  ws: {
    intents: [
      Intents.FLAGS.GUILDS,
      Intents.FLAGS.GUILD_MESSAGES,
      Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
      Intents.FLAGS.GUILD_MEMBERS,
    ],
  },
});

client.on("ready", () => {
  log(`The client ${client.user.tag} is currently ready. It has an id ${client.user.id}`);
});

client.login().then(log);
