import { Discord, Slash } from "discordx";
import { Game } from "../models/Game.js";
import { endGame, prepareGame } from "../models/ModelPreparator.js";
import { CommandInteraction, GuildMember, GuildMemberRoleManager } from "discord.js";
import { Main } from "../client.js";

@Discord()
export class EndCommand {
    @Slash({ description: "Terminer la partie en cours", name: "terminer" })
    async end(interaction: CommandInteraction): Promise<void> {


          const member = interaction.member as GuildMember;
            const game: Game | null = await prepareGame(interaction,member);
            if (game!=null) {
                   game.endGame();
                    Main.logger.info(`La partie de ${member.user.username} a été terminée.`);
                    await interaction.reply({ content: "La partie a été terminée avec succès.", ephemeral: true });
                }
            } 

}