import { ApplicationCommandOptionType, Channel, ChannelType, CommandInteraction, GuildMember, GuildMemberRoleManager, TextChannel, VoiceChannel } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import { Game } from "../models/Game.js";
import { prepareGame } from "../models/ModelPreparator.js";
import { Main } from "../client.js";

@Discord()
export class CleanCommand{
    @Slash({name: "clean", description: "Supprime tous les messages du channel choisi."})
    async clean(@SlashOption({ name:"channel",required:true,description: "Le channel à nettoyer", type: ApplicationCommandOptionType.Channel}) channel: Channel, interaction: CommandInteraction): Promise<void> {


            const member = interaction.member as GuildMember;
            channel = channel as TextChannel | VoiceChannel;
                    const game: Game|null = await prepareGame(interaction,member);
            if(game!=null && game.isParentChannel(channel.parentId)) {
                    interaction.reply({content:`Le channel ${channel.name} va être nettoyé.`, flags:64});
                    const newChannel = await channel.clone();
                    game.cleanChannel(channel.id, newChannel.id);
                    newChannel.setParent(channel.parentId);
                    newChannel.setName(channel.name);
                    newChannel.setPosition(channel.position);
                    newChannel.permissionOverwrites.set(channel.permissionOverwrites.cache);
                    await channel.delete();
                    await newChannel.send({content: "Tous les messages précédents ont été supprimés."});
                } 
        }

    }