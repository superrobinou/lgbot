import { ApplicationCommandOptionType, CommandInteraction, GuildMember, GuildMemberRoleManager,User } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import { prepareGame } from "../models/ModelPreparator.js";
import { Game } from "../models/Game.js";
import { Main } from "../client.js";


@Discord()
export class Invite {
    @Slash({name:"invite","description":"Invite players to your game"})
    public async invite(
        @SlashOption({name:"user", description:"The user to invite", type: ApplicationCommandOptionType.User, required: true}) user: GuildMember,interaction:CommandInteraction): Promise<void> {
        const member = interaction.member as GuildMember;
        const game:Game|null = await prepareGame(interaction,member);
       
        if (game!=null ) {
                    Main.logger.info(`Invitation de ${user.user.username} par ${member.user.username} dans sa partie.`);
                    await interaction.reply({content:`${user.user.username} a été invité à rejoindre votre partie.`, flags:64});
                    game.newPlayer(user.user.username,user.id)();
                }
            }
    }