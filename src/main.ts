import { REST, Routes, Events, GatewayIntentBits, Client, TextChannel, ChannelType, VoiceChannel, VoiceState, GuildMember, CategoryChannel, Role } from "discord.js";
import { PermissonPlayerList, PermissonMjList } from "./models/PermissionsList.js";
import data from "../config.json" with {type: "json"};
const {CLIENT_ID,GUILD_ID,BOT_TOKEN, DISCORD_CHANNEL_CREATION_ID,JOIN_CHANNEL_ID, ROLE_MJ_ID, STARTWEB, PORT } = data;
import { logger } from "./logger.js";
import { getCommands } from "./commands/AbstractCommand.js";
import { GameModel } from "./models/GameModel.js";
import express from 'express';
import React from 'react';
import { renderToString } from "react-dom/server";
import App from "./app.js";
import {hydrateRoot} from "react-dom/client";

export class Main {
  private client: Client;
 constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildScheduledEvents,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.DirectMessageTyping
      ],
      });
  }
async start(): Promise<void> {
    this.client.once(Events.ClientReady, async () => {
      const rest=new REST().setToken(BOT_TOKEN);
      await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: getCommands().map(command => command.data.toJSON()) });
      logger.info(">> Bot started");
    });

    this.client.on(Events.InteractionCreate, (interaction) => {
      if(interaction.isChatInputCommand()) {
        const command = getCommands().find(cmd => cmd.data.name === interaction.commandName);
        if (command) {
          command.execute(interaction).catch(error => {
            logger.error(`Error executing command ${interaction.commandName}: ${error}`);
          });
        }
      }
    });
    this.client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
         await this.newGame(newState,DISCORD_CHANNEL_CREATION_ID);
         await this.joinGame(newState,JOIN_CHANNEL_ID);
       
    });

    // let's start the bot

    await this.client.login(BOT_TOKEN);
  }
  public async joinGame(voiceState:VoiceState,env:String): Promise<void> {
    const member = voiceState.member as GuildMember;
    const games= GameModel.findAll();
    const game=games.find(g=> member.roles.cache.has(g.getJoueurRoleId().toString()));
    if(voiceState.channelId===env && game) {
       if(member.roles.cache.has(game.getJoueurRoleId().toString())) {
            const voiceChannel = member.guild.channels.cache.get(game.getVoiceChannelId() as string) as VoiceChannel;
            voiceState.setChannel(voiceChannel);
        }
    }
    else if(voiceState.channelId===env) {
      voiceState.disconnect("Vous ne pouvez pas rejoindre une partie car vous n'avez pas été invité.");
    }

  }

public async newGame(voiceState:VoiceState,env:String): Promise<void> {
const member = voiceState.member as GuildMember;
const game = GameModel.findById(member.id);
if(voiceState.channelId===env && !game && member.roles.cache.has(ROLE_MJ_ID)) {
  const joueurRoles=await voiceState.guild.roles.create({
            name: `Joueurs de la partie de ${member.user.username}`,
            color: "Yellow"});
        const MjRoles=await voiceState.guild.roles.create({
            name: `MJ de la partie de ${member.user.username}`,
            color: "Red"});
        await member.roles.add(MjRoles);
        await member.roles.add(joueurRoles);
const categoryChannel:CategoryChannel=await voiceState.guild.channels.create({
            name: `Partie de ${member.user.username}`,
            type: ChannelType.GuildCategory,
            permissionOverwrites: [
              {
                id: voiceState.guild.roles.everyone,
                deny: ["ViewChannel"],
              },
              {
                id: MjRoles.id,
                allow: PermissonMjList,
              },
              {
                id: joueurRoles.id,
                allow: PermissonPlayerList,
              }
            ]
        });
      
        await voiceState.guild.channels.create({
            name: `lg-chat`,
            type: ChannelType.GuildText,
            parent:categoryChannel
        }) as TextChannel;
        const voiceChannel:VoiceChannel=await voiceState.guild.channels.create({
            name: `lg-vocal`,
            type: ChannelType.GuildVoice,
            parent:categoryChannel
        });
        const commandBotChannel:TextChannel=await voiceState.guild.channels.create({
            name: `lg-commands`,
            type: ChannelType.GuildText,
            parent:categoryChannel
});
commandBotChannel.permissionOverwrites.edit(joueurRoles.id, { ViewChannel: false });

        const game:GameModel=new GameModel(categoryChannel.id,member.id,joueurRoles.id,MjRoles.id,voiceChannel.id);
        game.newGame();
        voiceState.setChannel(voiceChannel);
        await commandBotChannel.send(`Bienvenue dans votre partie de Loup-Garou. Utilisez ce channel pour interagir avec le bot.`);
    
} 
else if(voiceState.channelId==env){
  voiceState.disconnect("Vous ne pouvez pas créer une partie car vous êtes déja dans une partie.");
}
}
async webStart(): Promise<void> {
  if(STARTWEB) {
  const app = express();
  app.use(express.urlencoded({ extended: true }));

  app.get('/', (req, res) => {
    const html = renderToString(React.createElement(App, { datas: GameModel.findAll() }));
    res.send(`<!DOCTYPE html><html><head><title>Bot Status</title></head><body>${html}</body></html>`);
  });

  app.post('/games/update', (req, res) => {
    const action = req.body.action as string | undefined;
    const originalUserId = req.body.originalUserId as string | undefined;
    const userId = (req.body.userId as string | undefined) || originalUserId || "";
    const categoryChannelId = (req.body.categoryChannelId as string | undefined) || "";
    const joueurRoleId = (req.body.joueurRoleId as string | undefined) || "";
    const mjRoleId = (req.body.mjRoleId as string | undefined) || "";
    const voiceChannelId = (req.body.voiceChannelId as string | undefined) || "";

    if (action === "delete" && originalUserId) {
      GameModel.deleteById(originalUserId);
    } else if (action === "update" && originalUserId) {
        GameModel.deleteById(originalUserId);
        new GameModel(categoryChannelId, userId, joueurRoleId, mjRoleId, voiceChannelId).newGame();
    }

    res.redirect('/');
  });

  app.listen(PORT, () => {
    logger.info(`Web server started on port ${PORT}`);
  });
  hydrateRoot(document.getElementById("root") as HTMLElement, React.createElement(App, { datas: GameModel.findAll() }));
}
}
}

const main = new Main();
main.start();
main.webStart();


