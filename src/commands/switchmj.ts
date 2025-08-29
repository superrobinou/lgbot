import { ApplicationCommandOptionType, CommandInteraction, GuildMember, TextChannel, VoiceChannel } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import { Game } from "../models/Game.js";
import { isMJRole, prepareGame } from "../models/ModelPreparator.js";
import { Main } from "../client.js";

@Discord()
export class switchMj{
@Slash({name:"switchmj",description:"change le maitre du jeu de la partie"})
async switchMj(@SlashOption({name:"joueur",description:"le joueur qui doit devenir mj",required:true,type:ApplicationCommandOptionType.User}) user:GuildMember,interaction: CommandInteraction
): Promise<void> {
    const member = interaction.member as GuildMember;
    const channel=interaction.channel as TextChannel|VoiceChannel;
    const game: Game|null = await prepareGame(interaction,member);
    if(game!=null && game.isParentChannel(channel.parentId)){
        if(isMJRole(user)){
            await game.switchMJ(user);
            Main.logger.info(`Le maitre du jeu a été changé pour ${user.user.username} par ${member.user.username}.`);
            await interaction.reply({content:`Le maitre du jeu a été changé pour ${user.user.username}.`, flags:64});
        }
            await interaction.reply({content:`Le joueur ${user.user.username} n'a pas le role maitre du jeu.`, flags:64});
        }
         else {
        await interaction.reply({content:"Vous n'avez pas la permission de changer le maitre du jeu de cette partie.", flags:64});
    }
    }
   
    // Command implementation goes here 
}