import {  type GuildMember, SlashCommandBuilder, ChatInputCommandInteraction, Guild, Collection } from "discord.js";
import { GameModel } from "../models/GameModel.js";
import { AbstractCommand } from "./AbstractCommand.js";
import { logger } from "../logger.js";


export class Kick implements AbstractCommand {
  data = new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kick a user from the server");
  constructor() {
    this.data.addUserOption(option =>
      option.setName("utilisateur")
        .setDescription("Utilsateur a kick")
        .setRequired(true)).addStringOption(option =>
          option.setName("raison")
            .setDescription("Raison du kick")
            .setRequired(false));
  }
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const user = interaction.options.getMember("utilisateur") as GuildMember;
    const member = interaction.member as GuildMember;
    const game:GameModel|null = await GameModel.prepareGame(interaction,member);
    const reason = interaction.options.getString("raison") || "Aucune raison fournie";
    if (game!=null) {
     await interaction.reply({content:`${user.user.username} a été expulsé de la partie. Raison : ${reason}`, flags:64});
     user.roles.remove(game.getJoueurRoleId().toString());
     interaction.client.channels.cache.forEach((channel) => {
      if ("parentId" in channel && channel.parentId === game.getCategoryChanelId().toString()) {
        (channel.members as Collection<string, GuildMember>).delete(user.id);
      }
    });
     const voiceChannelId = user.voice.channel?.id;
     if (voiceChannelId && voiceChannelId === game.getVoiceChannelId()) {
      user.voice.disconnect();
     }
     logger.info("Le joueur "+user.user.username+" a été expulsé de la partie de "+member.user.username);
     user.send(`Vous avez été expulsé de la partie de Loup-Garou par ${member.user.username}.Raison : ${reason}`);
    }
  }
}