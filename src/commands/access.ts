
import { Channel,ApplicationCommandOptionType, CommandInteraction,GuildMember, VoiceChannel, TextChannel } from "discord.js";
import { Discord, Slash, SlashChoice, SlashGroup, SlashOption } from "discordx";
import { GameModel } from "../models/ModelPreparator.js";
import { gamePreparator,Main } from "../client.js";
@Discord()
@SlashGroup({ name: "access", description: "gestion des accès" })
@SlashGroup("access")
export class Access{
    @Slash({ description: "gérer les accès par joueur", name: "joueur" })
    async playerAccess(@SlashOption({description:"joueur pour lequel modifier l'accés",name:"joueur",required:true,type:ApplicationCommandOptionType.User})joueur:GuildMember
 ,@SlashOption({description:"channel pour lequel changer les accés",name:"channel",required:true,type:ApplicationCommandOptionType.Channel})channel:Channel,
      @SlashOption({description:"revoquer",required:true,name:"approuver",type:ApplicationCommandOptionType.Boolean}) approve:Boolean,interaction:CommandInteraction): Promise<void> {
                const member = interaction.member as GuildMember;
        const game:GameModel|null = await gamePreparator.prepareGame(interaction,member);
        channel=channel as TextChannel|VoiceChannel;
                  if(game!=null && game.notGlobalChannel(channel.id,channel.parentId) && game.isInGame(joueur.id) && joueur.id!=interaction.user.id) {
                    if(approve) {
                      await channel.permissionOverwrites.create(joueur, { ViewChannel: true, SendMessages: true,Connect: true,Speak:true,Stream:true,PrioritySpeaker:true,UseVAD:true });
                      await interaction.reply({content:`L'accès au channel ${channel.name} a été accordé à ${joueur.user.username}.`, flags:64});
                    }
                    else {
                      await channel.permissionOverwrites.create(joueur,{ ViewChannel: false, SendMessages: false,Connect: false,Speak:false,Stream:false,PrioritySpeaker:false,UseVAD:false });
                      await interaction.reply({content:`L'accès au channel ${channel.name} a été révoqué pour ${joueur.user.username}.`, flags:64});
                    }
                  }
                  else {
                    await interaction.reply({content:"Vous n'avez pas la permission de modifier les accès de ce channel.", flags:64});
                  }
            // This method can be implemented later to manage player access
    
}
@Slash({description:"gérer les accès par statut", name:"statut"})
async statusAccess(@SlashOption({description:"channel pour lequel changer les accés",name:"channel",required:true,type:ApplicationCommandOptionType.Channel})channel:Channel,
      @SlashOption({description:"revoquer",required:true,name:"approuver",type:ApplicationCommandOptionType.Boolean}) approve:Boolean,
      @SlashChoice({ name: "vivant", value: true })
      @SlashChoice({ name: "mort", value: false })
      @SlashOption({ description: "accés par rapport au statut", name: "statut", required: true, type: ApplicationCommandOptionType.Boolean }) statut: Boolean, interaction: CommandInteraction): Promise<void> {
        const member:GuildMember = interaction.member as GuildMember;
        channel=channel as TextChannel|VoiceChannel;
        const game:GameModel|null = await gamePreparator.prepareGame(interaction,member);
        if(game!=null && game.notGlobalChannel(channel.id, channel.parentId)) {
                  var statusRole = Main.getStatus(statut);
                    if(approve) {
                      await channel.permissionOverwrites.create(statusRole, { ViewChannel: true, SendMessages: true,Connect: true,Speak:true,Stream:true,PrioritySpeaker:true,UseVAD:true });
                      await interaction.reply({content:`L'accès au channel ${channel.name} a été accordé au statut ${statusRole}.`, flags:64});
                    }
                    else {
                      await channel.permissionOverwrites.create(statusRole,{ ViewChannel: false, SendMessages: false,Connect: false,Speak:false,Stream:false,PrioritySpeaker:false,UseVAD:false });
                      await interaction.reply({content:`L'accès au channel ${channel.name} a été révoqué pour le statut ${statusRole}.`, flags:64});
                    }
                  }
                }
            // This method can be implemented later to manage status access
    }

