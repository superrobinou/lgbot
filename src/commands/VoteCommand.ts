import { Channel, TextChannel, VoiceChannel } from 'discord.js';
import type { Guild, GuildMember } from 'discord.js';
import { AbstractCommand } from './AbstractCommand.js';
import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { GameModel } from '../models/GameModel.js';
export class VoteCommand implements AbstractCommand {
    data: SlashCommandBuilder=new SlashCommandBuilder()
        .setName('vote')
        .setDescription('créer un vote');
    constructor() {
        this.data.addChannelOption(option =>
            option.setName('channel')
                .setDescription('Le salon où le vote sera créé')
                .setRequired(true)
        );
    }
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const channel:Channel = interaction.options.getChannel('channel', true) as TextChannel|VoiceChannel;
        const game:GameModel|null = await GameModel.prepareGame(interaction, interaction.member as GuildMember);
        if(game!=null && channel.parentId==game.getCategoryChanelId().toString()){
         channel.members.forEach(async(member) => {
                if(!member.user.bot && member.user.id !== game.getUserId()) {
                   const message= await channel.send(`votes contres ${member.user.username}`);
                   message.react('👍');
                }
             });
        }
    interaction.reply({ content: 'Vote créé avec succès !', flags: 64 });
    }
}