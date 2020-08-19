import * as fs from "fs";
import { GiveawayConstructorOptions } from "./Giveaway";
import * as path from "path";
import moment from "moment";

type Giveaway = GiveawayConstructorOptions;

interface JsonGiveaway extends Omit<Giveaway, "ends"> {
  ends: number;
}

const location = path.join(__dirname, "..", "giveaways.json");

export class JsonFS {
  /**
   * Reads giveaways from disk
   */
  static readRaw(): JsonGiveaway[] {
    const data = fs.readFileSync(location).toString();
    return JSON.parse(data);
  }

  /**
   * Writes the raw JSON objects to disk
   * @param giveaways
   */
  static writeRaw(giveaways: JsonGiveaway[]): void {
    const stringified = JSON.stringify(giveaways);
    fs.writeFileSync(location, stringified);
  }

  /**
   * Writes objects (with moment) to disk
   * @param giveaways
   */
  static write(giveaways: Giveaway[]): void {
    const mapped = giveaways.map((x) => this.toJson(x));
    this.writeRaw(mapped);
  }

  /**
   * Converts JSON to momentified giveaways, ready for constructing
   * @param giveaway
   */
  static fromJson(giveaway: JsonGiveaway): Giveaway {
    return {
      ...giveaway,
      ends: moment(giveaway.ends),
    };
  }

  /**
   * Converts a giveaway object to JSON
   * @param giveaway
   */
  static toJson(giveaway: Giveaway): JsonGiveaway {
    return {
      ...giveaway,
      ends: giveaway.ends.toDate().getTime(),
    };
  }

  /**
   * Reads all giveaways from disk
   */
  static read(): Giveaway[] {
    return this.readRaw().map((x) => this.fromJson(x));
  }

  /**
   * Pushes a new giveaway to disk
   * @param giveaway
   */
  static push(giveaway: Giveaway): void {
    const data = [...this.readRaw(), this.toJson(giveaway)];
    this.writeRaw(data);
  }
}
