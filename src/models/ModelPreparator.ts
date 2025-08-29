import {Game } from "./Game.js";
import { PrismaClient } from "../../prisma/generated/prisma/client.js";
import { CategoryChannel, ChannelType, CommandInteraction, GuildMember, GuildMemberRoleManager, TextChannel, VoiceChannel, VoiceState } from "discord.js";
import { Main } from "../client.js";
import dotenv from "dotenv";

export const prisma = new PrismaClient();
export function isMJRole(member:GuildMember): boolean {
  dotenv.config({quiet: true});
  var isMJ:boolean=false;
   if(member && process.env.ROLE_MJ_ID) {
      const roles:GuildMemberRoleManager = member.roles as GuildMemberRoleManager;
      const role=roles.cache.get(process.env.ROLE_MJ_ID);
      if(role) {
          isMJ=true;
      }
    }
      return isMJ;
   
      }

export async function prepareGame(interaction:CommandInteraction,member:GuildMember): Promise<Game|null> {
    dotenv.config({quiet: true});
  const isMJ:boolean=isMJRole(member);
  const game = await prisma.game.findUnique({where: { userId: interaction.user.id }});
  if(!game || !isMJ) {
    await interaction.reply({content:"Vous n'avez pas de partie en cours ou vous n'avez pas la permission de la gérer.", flags:64});
    return null;
  }
  else if(game.commandBotTextChannelId !== interaction.channelId) {
    await interaction.reply({content:"Vous pouvez taper les commandes uniquement dans le channel commande-bot de votre partie.", flags:64});
    return null;
  }
  else{
  return new Game( game.categoryId, game.lgChatTextChannelId, game.lgChatVoiceChannelId, game.commandBotTextChannelId,game.userId);
  }
}
export async function endGame(userId:string): Promise<void> {
  await prisma.game.delete({where: { userId: userId }});
}
export async function newGame(voiceState:VoiceState,env:String): Promise<void> {
const member = voiceState.member as GuildMember;
const game = await prisma.game.findUnique({where: { userId: member.id }});
if(voiceState.channelId===env && !game && isMJRole(member)){
Main.logger.info("Création d'une nouvelle partie");
Main.logger.info("le MJ sera : "+member.user.username);
Main.logger.info("le MJ a pour ID : "+member.id);
const categoryChannel:CategoryChannel=await voiceState.guild.channels.create({
            name: `Partie de ${member.user.username}`,
            type: ChannelType.GuildCategory,
            permissionOverwrites: [
              {
                id: voiceState.guild.roles.everyone,
                deny: ["ViewChannel"],
              },
              {
                id: member.id,
                allow: ["ViewChannel"],
              }
             
            ]
        });
Main.logger.info("Catégorie créée avec l'ID : "+categoryChannel.id);
        const textChannel:TextChannel=await voiceState.guild.channels.create({
            name: `lg-chat`,
            type: ChannelType.GuildText,
            parent:categoryChannel,
            permissionOverwrites: [
              {
                id: voiceState.guild.roles.everyone,
                deny: ["ViewChannel"],
              },
              {
                id: member.id,
                allow: ["ViewChannel","SendMessages","ReadMessageHistory"],
              }
             
            ]
        }) as TextChannel;
Main.logger.info("Channel texte créé avec l'ID : "+textChannel.id);
        const voiceChannel:VoiceChannel=await voiceState.guild.channels.create({
            name: `lg-vocal`,
            type: ChannelType.GuildVoice,
            parent:categoryChannel,
            permissionOverwrites: [
              {
                id: voiceState.guild.roles.everyone,
                deny: ["ViewChannel"],
              },
              {
                id: member.id,
                allow: ["ViewChannel","Connect","Speak","Stream","PrioritySpeaker","UseVAD"],
              }
             
            ]
        });
Main.logger.info("Channel vocal créé avec l'ID : "+voiceChannel.id);
        const commandBotChannel:TextChannel=await voiceState.guild.channels.create({
            name: `lg-commands`,
            type: ChannelType.GuildText,
            parent:categoryChannel,
            permissionOverwrites: [
              {
                id: voiceState.guild.roles.everyone,
                deny: ["ViewChannel"],
              },
              {
                id: member.id,
                allow: ["ViewChannel","SendMessages","ReadMessageHistory"],
              }]});
Main.logger.info("Channel commande-bot créé avec l'ID : "+commandBotChannel.id);
        const game:Game=new Game(categoryChannel.id,textChannel.id,voiceChannel.id,commandBotChannel.id,member.id);
        game.newGame();
        voiceState.setChannel(voiceChannel);
Main.logger.info("Le MJ a été déplacé dans le channel vocal de la partie.");
        await textChannel.send(`Bienvenue dans votre partie de Loup-Garou. Utilisez le channel ${commandBotChannel} pour interagir avec le bot.`);
}
else if(voiceState.channelId==env){
  voiceState.disconnect("Vous ne pouvez pas créer une partie car vous êtes déja dans une partie.");
}
}