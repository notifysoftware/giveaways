import "dotenv/config";

import { client } from "./classes/Client";

client.login(process.env.DISCORD_TOKEN);
