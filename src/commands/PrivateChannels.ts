import { Guild,ChatInputCommandInteraction, SlashCommandBuilder, GuildMember,TextChannel, CategoryChannel } from "discord.js";
import { AbstractCommand } from "./AbstractCommand.js";
import { GameModel } from "../models/GameModel.js";

export class PrivateChannels implements AbstractCommand {
    data: SlashCommandBuilder = new SlashCommandBuilder()
        .setName("privatechannels")
        .setDescription("Manage private channels for the game.");
    constructor() {
         this.data.addSubcommand(subcommand =>
            subcommand
                .setName("create")
                .setDescription("Create a private channel for each players.")
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("delete")
                .setDescription("Delete all private channels for the game.")
        );
    }
    public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const subcommand = interaction.options.getSubcommand();
        const game= await GameModel.prepareGame(interaction, interaction.member as GuildMember);
        if (subcommand === "create" && game) {
            await interaction.reply("Creating private channels...");
            interaction.guild?.members.cache.forEach(async (member) => {
                        if(!member.user.bot && member.user.id !== game.getUserId() && member.roles.cache.has(game.getJoueurRoleId().toString())) {
                                const channel = await interaction.guild?.channels.create({
                                name:`private-${member.user.username}`,
                                type: 0,
                                parent: game.getCategoryChanelId().toString()
                                }) as TextChannel;
                            channel.permissionOverwrites.edit(member, { ViewChannel: true });
                            channel.permissionOverwrites.edit(game.getJoueurRoleId().toString(), { ViewChannel: false });
                        }
                        });
            
        } else if (subcommand === "delete" && game) {
            await interaction.reply("Deleting private channels...");
            const categoryChannel = interaction.client.channels.cache.get(game.getCategoryChanelId().toString()) as CategoryChannel;
            categoryChannel?.children.cache.forEach((channel) => {
            if(channel.type === 0 && channel.name.startsWith("private-") && channel.parentId === categoryChannel.id) {
                channel.delete();
            }
        });
        } else {
            await interaction.reply("Unknown subcommand.");
        }
    }
}