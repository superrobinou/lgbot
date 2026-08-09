
import { GuildMember, TextChannel, VoiceChannel, ChatInputCommandInteraction, SlashCommandBuilder, Guild } from "discord.js";
import { AbstractCommand } from "./AbstractCommand.js";
import { GameModel } from "../models/GameModel.js";
export class SendCommand implements AbstractCommand {
  data = new SlashCommandBuilder()
        .setName("send")
        .setDescription("send a message with this bot");
  constructor() {
    this.data.addStringOption(option =>
      option.setName("message")
        .setDescription("le message a envoyer")
        .setRequired(true));
    this.data.addChannelOption(option =>
      option.setName("channel")
        .setDescription("le channel ou envoyer")
        .setRequired(true));
  }
  public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const message = interaction.options.getString("message", true);
    const channel = interaction.options.getChannel("channel", true) as TextChannel | VoiceChannel;

        const interactionChannel:TextChannel|VoiceChannel=interaction.channel as TextChannel|VoiceChannel;
        const member = interaction.member as GuildMember;
                const game: GameModel|null = await GameModel.prepareGame(interaction,member);
            if(game!=null && interactionChannel.parentId==game.getCategoryChanelId().toString() && game.getCategoryChanelId().toString() == channel.parentId){
                 channel.send(message);
                await interaction.reply({content:"Message envoyé !", flags:64});

            }
    
 }// This class is intentionally left empty.
}