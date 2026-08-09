
import { ChatInputCommandInteraction,  GuildMember} from "discord.js";
import fs from "fs";
export class GameModel{
    private categoryId: String;
    private userId: String;
    private joueurRoleId: String;
    private mjRoleId: String;
    private voiceChannelId: String;


    constructor(categoryId: String, userId: String,joueurRoleId: String, mjRoleId: String, voiceChannelId: String) {
        this.categoryId = categoryId;
        this.userId = userId;
        this.joueurRoleId = joueurRoleId;
        this.mjRoleId = mjRoleId;
        this.voiceChannelId = voiceChannelId;
    }

    public getUserId(): String {
        return this.userId;
    }
    public getCategoryChanelId(): String {
        return this.categoryId;
    }
    public getJoueurRoleId(): String {
        return this.joueurRoleId;
    }
    public getMjRoleId(): String {
        return this.mjRoleId;
    }
    public setUserId(userId: String): void {
        this.userId = userId;
    }

  
   
    public async newGame(){
        const games = GameModel.findAll();
        games.push(this);
        fs.writeFileSync('games.json',JSON.stringify(games), {encoding: 'utf-8', flag: 'w+'});
    }

    public static findAll(): GameModel[] {
            const data = fs.readFileSync('games.json', 'utf-8');
            const gamesData = JSON.parse(data) as Array<{ categoryId: String; userId: String; joueurRoleId: String; mjRoleId: String; voiceChannelId: String }>;
            return gamesData.map((game) => new GameModel(game.categoryId, game.userId, game.joueurRoleId, game.mjRoleId, game.voiceChannelId));
    }

    public getVoiceChannelId(): String {
        return this.voiceChannelId;
    }

    public static findById(id: String): GameModel | null {
        const games = GameModel.findAll();
        const game = games.find((g) => g.userId === id);
        return game || null;

    }
    public static deleteById(id: String): void {
        const games = GameModel.findAll();
        const index = games.findIndex((g) => g.userId === id);
        if (index !== -1) {
            games.splice(index, 1);
            fs.writeFileSync('games.json',JSON.stringify(games), {encoding: 'utf-8', flag: 'w+'});
        }
    }
         public static async  prepareGame(interaction: ChatInputCommandInteraction, member: GuildMember): Promise<GameModel | null> {
            const gameJson = GameModel.findById(interaction.user.id);
            const game:GameModel|null = gameJson ? new GameModel(gameJson.categoryId, gameJson.userId, gameJson.joueurRoleId, gameJson.mjRoleId, gameJson.voiceChannelId) : null;
            let mj:boolean=false;
            if(game){
            mj = member.roles.cache.has(game.getMjRoleId().toString());
            }
            if(!game || !mj) {
        await interaction.reply({content:"Vous n'avez pas de partie en cours ou vous n'avez pas la permission de la gérer.", flags:64});
        return null;
      }
      else{
      return game;
      }
      }
       
}