import {CategoryChannel, ChatInputCommandInteraction, Guild, GuildMember, Role, SlashCommandBuilder, TextChannel, VoiceChannel } from "discord.js";
import { AbstractCommand } from "./AbstractCommand.js";
import { GameModel} from "../models/GameModel.js";
import data from "../../config.json" with {type: "json"};
import { logger } from "../logger.js";
const {ROLE_MJ_ID} = data;

export class switchMj implements AbstractCommand {
    data = new SlashCommandBuilder()
        .setName("switchmj")
        .setDescription("change le maitre du jeu de la partie");
    constructor() {
        this.data.addUserOption(option =>
            option.setName("joueur")
                .setDescription("le joueur qui doit devenir mj")
                .setRequired(true));
    } 

async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const user = interaction.options.getMember("joueur") as GuildMember;
    const member = interaction.member as GuildMember;
    const channel=interaction.channel as TextChannel|VoiceChannel;
    const game: GameModel|null = await GameModel.prepareGame(interaction,member);
    if(game!=null && channel.parentId==game.getCategoryChanelId().toString()){
        if(user.roles.cache.has(ROLE_MJ_ID)){
                    const mjRole = interaction.guild?.roles.cache.get(game.getMjRoleId().toString());
                    const joueurRole = interaction.guild?.roles.cache.get(game.getJoueurRoleId().toString());
                    if (mjRole && joueurRole) {
                        mjRole.setName(`MJ de la partie de ${user.user.username}`);
                        joueurRole.setName(`Joueurs de la partie de ${user.user.username}`);
                        member.roles.remove(mjRole);
                        user.roles.add(mjRole);
                        var category:CategoryChannel=interaction.client.channels.cache.get(game.getCategoryChanelId().toString()) as CategoryChannel;
                        category.setName(`Partie de ${user.user.username}`);
                        GameModel.deleteById(game.getUserId());
                        game.setUserId(user.id);
                        game.newGame();
                    }
            logger.info("Le maitre du jeu de la partie de "+member.user.username+" a été changé pour "+user.user.username);
            await interaction.reply({content:`Le maitre du jeu a été changé pour ${user.user.username}.`, flags:64});
        } else {
            await interaction.reply({content:`Le joueur ${user.user.username} n'a pas le role maitre du jeu.`, flags:64});
        }
    } else {
        await interaction.reply({content:"Vous n'avez pas la permission de changer le maitre du jeu de cette partie.", flags:64});
    }
}
}