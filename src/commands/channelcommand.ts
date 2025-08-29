import { Channel, ApplicationCommandOptionType, CommandInteraction, GuildMemberRoleManager, ChannelType, GuildMember, TextChannel, VoiceChannel } from "discord.js";
import { Discord, Slash, SlashChoice, SlashGroup, SlashOption } from "discordx";
import { prepareGame } from "../models/ModelPreparator.js";
import { Game } from "../models/Game.js";
import { Main } from "../client.js";

@Discord()
@SlashGroup({name:"channel",description:"gestion des channels"})
@SlashGroup("channel")
export class ChannelCommand {
   @Slash({description:"supprimer un channel", name:"supprimer"})
  async delete(@SlashOption({description:"channel a supprimer",
    name:"channel",
    required:true,type:ApplicationCommandOptionType.Channel})
     channel:Channel,interaction:CommandInteraction): Promise<void> {
      const member = interaction.member as GuildMember;
      channel=channel as TextChannel|VoiceChannel;
           const game: Game|null = await prepareGame(interaction,member);
        if(game!=null  && game.notGlobalChannel(channel.id,channel.parentId)) {
          await channel.delete();
          await interaction.reply({content:`Le channel ${channel.name} a été supprimé.`, flags:64});
        }
        else {
          await interaction.reply({content:"Vous n'avez pas la permission de supprimer ce channel.", flags:64});
        }
    }
   @Slash({description:"créer un channel", name:"creer"})
  async create(@SlashOption({description:"channel a supprimer",
    name:"channel",
    required:true,type:ApplicationCommandOptionType.String})
     channel:String,@SlashChoice({name:"vocale",value:"vocale"})
     @SlashChoice({name:"textuelle",value:"textuelle"})
     @SlashOption({description:"type de channel",name:"type",required:true,type:ApplicationCommandOptionType.String}) type:string,
     interaction:CommandInteraction): Promise<void> {
      var channelType:ChannelType= ChannelType.GuildText;
      const member = interaction.member as GuildMember;
      const game: Game|null = await prepareGame(interaction,member);
      if(type!=="vocale" && type!=="textuelle") {
        await interaction.reply({content:"Type de channel invalide.", flags:64});
        return;
      }
    if(game!=null){
      if(type==="vocale") {
        channelType= ChannelType.GuildVoice;}
            const channelName = channel;
            const newChannel=await game.createChannel(channelName.toString(), channelType,interaction.guild).catch(console.error);
            if(newChannel) {
              await interaction.reply({content:`Le channel ${newChannel.name} a été créé.`, flags:64});
            } else {
              await interaction.reply({content:"Erreur lors de la création du channel.", flags:64});
            }
          }
      }
    }
