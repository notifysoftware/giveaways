import { Client } from "discord.js";
import { log as _log } from "./util/log";

const log = _log("Client");

export const client = new Client({
  fetchAllMembers: true,
});

client.on("ready", () => {
  log("Ready");
});

client.login().then(log);
