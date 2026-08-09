
import { GameModel } from "../models/GameModel.js";
import { Guild,GuildMember, SlashCommandBuilder, ChatInputCommandInteraction, Channel, Collection, Snowflake } from "discord.js";

import { AbstractCommand } from "./AbstractCommand.js";
export class EndCommand implements AbstractCommand {
    data = new SlashCommandBuilder()
        .setName("terminer")
        .setDescription("Terminer la partie en cours");
    constructor() {
    }
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
          const member = interaction.member as GuildMember;
            const game: GameModel | null = await GameModel.prepareGame(interaction,member);
            if (game!=null) {
                   interaction.client.channels.cache.forEach((channel: Channel) => {
                                           if ("parentId" in channel && channel.parentId === game.getCategoryChanelId().toString()) {
                                              const members:Collection<Snowflake, GuildMember> = channel.members as Collection<Snowflake, GuildMember>;
                                              members.forEach((member) => {
                                               if(member.user.bot) return;
                                              });
                                               channel.delete();
                                           }
                                       });
                    interaction.guild?.roles.cache.get(game.getJoueurRoleId().toString())?.delete();
                    interaction.guild?.roles.cache.get(game.getMjRoleId().toString())?.delete();
                    interaction.client.channels.cache.get(game.getCategoryChanelId().toString())?.delete();
                    GameModel.deleteById(game.getUserId());
                }
            }

}