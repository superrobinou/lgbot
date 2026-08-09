import { GuildMember,  TextChannel, VoiceChannel, SlashCommandBuilder, ChatInputCommandInteraction, Guild } from "discord.js";
import { AbstractCommand } from "./AbstractCommand.js";
import { GameModel } from "../models/GameModel.js";
export class CleanCommand implements AbstractCommand {
    data:SlashCommandBuilder = new SlashCommandBuilder()
        .setName("clean")
        .setDescription("Supprime tous les messages du channel choisi.");
    constructor() {
        this.data.addChannelOption(option =>
            option.setName("channel")
                .setDescription("Channel à nettoyer")
                .setRequired(true));
    }
    async execute(interaction:ChatInputCommandInteraction): Promise<void> {
        const channel = interaction.options.getChannel("channel", true) as TextChannel | VoiceChannel;
        const member = interaction.member as GuildMember;
        const game: GameModel|null = await GameModel.prepareGame(interaction,member);
        if(game!=null && channel.parentId==game.getCategoryChanelId()) {
                interaction.reply({content:`Le channel ${channel.name} va être nettoyé.`, flags:64});
                const newChannel = await channel.clone();
                 const categoryChannel:boolean=interaction.client.channels.cache.get(game.getCategoryChanelId().toString())?.id===channel.id;
                        let newGame=
                            new GameModel(
                                categoryChannel? newChannel.id:game.getCategoryChanelId(),
                                game.getUserId(),
                                game.getJoueurRoleId(),
                                game.getMjRoleId(),
                                game.getVoiceChannelId());
                GameModel.deleteById(game.getUserId());
                newGame.newGame();
                newChannel.setParent(channel.parentId);
                newChannel.setName(channel.name);
                newChannel.setPosition(channel.position);
                newChannel.permissionOverwrites.set(channel.permissionOverwrites.cache);
                await channel.delete();
            } 
    }
}