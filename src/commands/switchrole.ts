import { ApplicationCommandOptionType, CommandInteraction, GuildMember, GuildMemberRoleManager, TextChannel, VoiceChannel} from "discord.js";
import { Discord, Slash, SlashChoice, SlashOption } from "discordx";
import { GameModel } from "../models/ModelPreparator.js";
import { gamePreparator} from "../client.js";
import { Main } from "../client.js";
@Discord()
export class SwitchRoleCommand {
@Slash({name:"switchstatus",description:"change le statut d'un joueur dans la partie"})
async switchStatus(
  @SlashOption({ name:"joueur",description: "le joueur dont le statut doit être changé", required: true,type: ApplicationCommandOptionType.User })
  player: GuildMember,
  @SlashOption({ name:"vivant",description: "le nouveau statut du joueur", required: true, type: ApplicationCommandOptionType.Boolean })
  status: boolean,
  interaction: CommandInteraction
): Promise<void> {

    const member = interaction.member as GuildMember;
    const channel=interaction.channel as TextChannel|VoiceChannel;
    const game: GameModel|null = await gamePreparator.prepareGame(interaction,member);
    if(game!=null && game.isParentChannel(channel.parentId) && game.isInGame(player.id)) {

          var statusRole = Main.getStatus(status);
          player.roles.remove(Main.getStatus(!status)).catch();
          player.roles.add(statusRole);
          await interaction.reply({content:`Le statut de ${player.user.username} a été changé en ${status ? "Vivant" : "Mort"}.`, flags: 64});
    }
}
}