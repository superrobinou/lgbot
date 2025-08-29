import { ApplicationCommandOptionType, CommandInteraction, GuildMember, GuildMemberRoleManager, User } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import { Game } from "../models/Game.js";
import { prepareGame } from "../models/ModelPreparator.js";
import { Main } from "../client.js";

@Discord()
export class Kick {
 @Slash({ 
   description: "Kick a user from the server", 
   name: "kick" 
 })
 async kick(
   @SlashOption({ type: ApplicationCommandOptionType.User, name:"utilisateur",description: "Utilsateur a kick", required: true })
   user: GuildMember,
   @SlashOption({ type: ApplicationCommandOptionType.String,name:"raison", description: "raison du kick", required: false })
   reason: string,
   interaction: CommandInteraction): Promise<void> {
    const member = interaction.member as GuildMember;
    const game:Game|null = await prepareGame(interaction,member);
    if (game!=null) {
      Main.logger.info(`Expulsion de ${user.user.username} de la partie de ${member.user.username}.`);
     await interaction.reply({content:`${user.user.username} a été expulsé de la partie.`, flags:64});
     game.kickUser(user.id, reason);
    }
}
}