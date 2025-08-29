import { IntentsBitField} from "discord.js";
import { Client } from "discordx";
import dotenv from "dotenv";
import {dirname,importx} from "@discordx/importer";
import  { createLogger,format,transports } from "winston";
const { combine,timestamp,printf,colorize } = format;
import { newGame} from "./models/ModelPreparator.js";
export class Main {
  private static _client: Client;
  public static logger = createLogger({
    level: "info",
    format: combine(
      format.errors({ stack: true }),
      timestamp({format:"DD-MM-YYYY HH:mm:ss"}),
      printf(({ level, message, timestamp, stack }) => `${timestamp} [${level.toUpperCase()}]: ${message} - ${stack}`)
    ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: "app.log", format: combine(colorize({ all: false })) })
  ],
  exitOnError: false,
  exceptionHandlers: [
    new transports.File({ filename: 'exceptions.log', handleExceptions: true, handleRejections: true })
  ]});
  static get Client(): Client {
    return this._client;
  }
static getStatus(status:Boolean): string {
  dotenv.config({quiet: true});
  if(!process.env.IS_ALIVE_ROLE_ID|| !process.env.IS_DEAD_ROLE_ID) {
    return "";
  }
  else{
  return status?process.env.IS_ALIVE_ROLE_ID:process.env.IS_DEAD_ROLE_ID;
  }
}

  static async start(): Promise<void> {
        dotenv.config({quiet: true});
    this._client = new Client({
      // botGuilds: [(client) => client.guilds.cache.map((guild) => guild.id)],
      intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildVoiceStates,
        IntentsBitField.Flags.MessageContent,
      ],
      silent: false,
    });
    this._client.once("ready", () => {

      void this._client.initApplicationCommands();

      Main.logger.info(">> Bot started");
    });

    this._client.on("interactionCreate", (interaction) => {
      this._client.executeInteraction(interaction);
    });
    this.Client.on("voiceStateUpdate", async (oldState, newState) => {
        dotenv.config({quiet: true});
        if(process.env.DISCORD_CHANNEL_CREATION_ID) {
         await newGame(newState,process.env.DISCORD_CHANNEL_CREATION_ID);
     
      }
       
    });
    await importx(`${dirname(import.meta.url)}/commands/**/*.{js,ts}`);

    // let's start the bot

    if (!process.env.BOT_TOKEN) {
      throw Error("Could not find BOT_TOKEN in your environment");
    }
    await this._client.login(process.env.BOT_TOKEN);
  }
}

void Main.start();


