import { GuildMember, SlashCommandBuilder, ChatInputCommandInteraction, Guild } from "discord.js";
import { AbstractCommand } from "./AbstractCommand.js";
import { GameModel } from "../models/GameModel.js";
import { logger } from "../logger.js";
export class Invite implements AbstractCommand {
    data = new SlashCommandBuilder()
        .setName("invite")
        .setDescription("Invite players to your game");

    constructor() {
        this.data.addUserOption(option =>   
            option.setName("member")
                .setDescription("Member to invite")
                .setRequired(true));
    }
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const user = interaction.options.getMember("member") as GuildMember;
        const member = interaction.member as GuildMember;
        const game:GameModel|null = await GameModel.prepareGame(interaction,member);
        logger.info("Le joueur "+user.user.username+" a été invité dans la partie de "+member.user.username);
        if (game!=null) {
                    await interaction.reply({content:`${user.user.username} a été invité à rejoindre votre partie.`, flags:64});
                    user.roles.add(game.getJoueurRoleId().toString());
                }
            }
    }