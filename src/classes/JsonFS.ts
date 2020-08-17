import * as fs from "fs";
import { GiveawayConstructorOptions } from "./Giveaway";
import * as path from "path";

const location = path.join(__dirname, "..", "giveaways.json");

export class JsonFS {
  static read(): GiveawayConstructorOptions[] {
    const data = fs.readFileSync(location).toString();
    return JSON.parse(data);
  }

  static write(giveaways: GiveawayConstructorOptions) {
    const stringified = JSON.stringify(giveaways);
    fs.writeFileSync(location, stringified);
  }
}
