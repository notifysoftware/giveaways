import "dotenv/config";

import { client } from "./client";
import { messageHandler } from "./handlers/message";

client.on("message", messageHandler);
