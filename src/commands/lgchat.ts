import { ApplicationCommandOptionType, CommandInteraction, GuildMember, TextChannel, VoiceChannel } from "discord.js";
import { Discord, Slash, SlashChoice, SlashGroup, SlashOption } from "discordx";
import { prepareGame } from "../models/ModelPreparator.js";
import { Game } from "../models/Game.js";
import { Main } from "../client.js";

@Discord()
   @SlashGroup({name:"lgchat",description: "Verrouiller/dévoureiller les channels globaux" })
    @SlashGroup("lgchat")
export class LgChatCommand {
    @Slash({name:"global",description:"verrouiller/déverouiller les channels globaux"})
    public async lgchat(
        @SlashOption({name:"verouiller",description:"verrouiller ou déverouiller le channel",required:true,type:ApplicationCommandOptionType.Boolean})
        lock: boolean, 
        @SlashChoice({name:"voc",value:1})
        @SlashChoice({name:"textuel",value:2})
        @SlashChoice({name:"les deux",value:3})
        @SlashOption({name:"type",description:"type de channel a verrouiller/déverouiller",required:true,type:ApplicationCommandOptionType.Integer})
        type: number,
        @SlashOption({name:"user",description:"joueur pour lequel verrouiller/dévérouiller le channel",required:false,type:ApplicationCommandOptionType.User})
        user:GuildMember,interaction:CommandInteraction
    ): Promise<void> {
  const member = interaction.member as GuildMember;
   const game:Game|null = await prepareGame(interaction,member);
if (game!=null) {
    game.globalLock(lock, user, type);
    await interaction.reply({content:`Le channels ont été mis à jour.`, flags:64});
    }
    else {
     await interaction.reply({content:"Vous n'avez pas la permission de verrouiller/déverrouiller ce channel.", flags:64});
    }
    }
        @Slash({name:"channel",description:"verrouiller/déverouiller des channels spécifiques"})
    public async lgchannel(
        @SlashOption({name:"verouiller",description:"verrouiller ou déverouiller le channel",required:true,type:ApplicationCommandOptionType.Boolean})
        lock: boolean, 
        @SlashOption({name:"channel",description:"channel",required:true,type:ApplicationCommandOptionType.Channel})
        channel: TextChannel | VoiceChannel,@SlashOption({name:"user",description:"joueur pour lequel verrouiller/dévérouiller le channel",required:false,type:ApplicationCommandOptionType.User})
        user:GuildMember,interaction:CommandInteraction
    ): Promise<void> {
         const member = interaction.member as GuildMember;
        const game:Game|null = await prepareGame(interaction,member);
if (game!=null && game.isParentChannel(channel.parentId)) {
                        game.channelLock(lock, user, channel);
                        await interaction.reply({content:`Le channels ont été mis à jour.`, flags:64});
}
} 

    }
    // Command implementation goes here