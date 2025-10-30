
import { ApplicationCommandOptionType, Channel,CommandInteraction, GuildMember, TextChannel, VoiceChannel} from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";

import { GameModel } from "../models/ModelPreparator.js";
import { gamePreparator} from "../client.js";
import { Main } from "../client.js";
@Discord()
export class SendCommand {
 @Slash({name:"send",description:"send a message with this bot"}) 
 public async send(@SlashOption({name:"message",description:"le message a envoyer",required:true,type:ApplicationCommandOptionType.String}) message:string,
 @SlashOption({name:"channel",description:"le channel ou envoyer",required:false,type:ApplicationCommandOptionType.Channel})channel:Channel,interaction:CommandInteraction):Promise<void> {

        const interactionChannel:TextChannel|VoiceChannel=interaction.channel as TextChannel|VoiceChannel;
        const member = interaction.member as GuildMember;
        channel=channel as TextChannel|VoiceChannel;
                const game: GameModel|null = await gamePreparator.prepareGame(interaction,member);
            if(game!=null && game.isParentChannel(interactionChannel.parentId)){
              if(channel!=null && game.isParentChannel(channel.parentId)){
                 channel.send(message);
                await interaction.reply({content:"Message envoyé !", flags:64});
              }
              else{
                interactionChannel.send(message);
                await interaction.reply({content:"Message envoyé !", flags:64});
              }
            }
    
 }// This class is intentionally left empty.
}