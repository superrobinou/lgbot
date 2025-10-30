
import { CategoryChannel, Channel, ChannelType, Collection, CommandInteraction, Guild, GuildMember, GuildMemberRoleManager, Snowflake, TextChannel, VoiceChannel, VoiceState } from "discord.js";
import { Main } from "../client.js";
import dotenv from "dotenv";
import { gamePreparator } from "../client.js";

import { JsonModel,JsonDatabase, Identifier } from "crudjsondatabase";
export class GameModel extends JsonModel {
    private categoryId: String;
    private lgchatTextChannelId: String;
    private lgchatVoiceChannelId: String;
    private commandBotTextChannelId: String;
    @Identifier()
    private userId: String;
    constructor(categoryId: String, lgchatTextChannelId: String, lgchatVoiceChannelId: String, commandBotTextChannelId: String, userId: String) {
        super();
        this.categoryId = categoryId;
        this.lgchatTextChannelId = lgchatTextChannelId;
        this.lgchatVoiceChannelId = lgchatVoiceChannelId;
        this.commandBotTextChannelId = commandBotTextChannelId;
        this.userId = userId;
    }
      public notGlobalChannel(channelId: string,parentId:string|null): boolean {
        return channelId !== this.lgchatTextChannelId && channelId !== this.lgchatVoiceChannelId && channelId !== this.commandBotTextChannelId && this.categoryId !== channelId 
        && parentId===this.categoryId;
    }
    public switchId(userId:String): void {
        this.userId=userId;
    }
     public isInGame(userId: string): boolean {
        var channel:TextChannel=Main.Client.channels.cache.get(this.lgchatTextChannelId.toString()) as TextChannel;
        return channel.members.has(userId);
    }
      public isParentChannel(parentId: string | null): boolean {
        return parentId == this.categoryId;
    }
    public async createChannel(channelName:string,channelType:ChannelType.GuildText|ChannelType.GuildVoice,guild:Guild|null): Promise<TextChannel | VoiceChannel|null> {
        if(!guild) {
            return null;
        }
        else{
        return await guild.channels.create({
              name: channelName.toString(),
              type: channelType,
              parent: this.categoryId.toString()
            });
        }
    }
    public async switchMJ(newMJ:GuildMember): Promise<void> {
            Main.Client.channels.cache.forEach((channel) => {
                        if (channel.id==this.commandBotTextChannelId && channel.type===ChannelType.GuildText) {
                            channel.permissionOverwrites.create(newMJ.id, { ViewChannel: true, SendMessages: true }).catch(console.error);
                            channel.permissionOverwrites.delete(this.userId.toString()).catch(console.error);
                        }
                        else if (channel.id==this.lgchatTextChannelId && channel.type===ChannelType.GuildText) {
                            channel.permissionOverwrites.create(newMJ.id, { ViewChannel: true, SendMessages: true }).catch(console.error);
                        }
                        else if (channel.id==this.lgchatVoiceChannelId && channel.type===ChannelType.GuildVoice) {
                            channel.permissionOverwrites.create(newMJ.id, { ViewChannel: true, SendMessages:true,Connect: true, Speak:true,Stream:true,PrioritySpeaker:true,UseVAD:true }).catch(console.error);
                        }
                        else if(channel.id==this.categoryId && channel.type===ChannelType.GuildCategory) {
                            channel.permissionOverwrites.create(newMJ.id, { ViewChannel: true }).catch(console.error);
                        }
                        else if ("parentId" in channel && channel.parentId === this.categoryId && channel.type===ChannelType.GuildText||channel.type===ChannelType.GuildVoice) {
                            channel.permissionOverwrites.create(newMJ.id, { ViewChannel: true,SendMessages:true,Connect: true, Speak:true,Stream:true,PrioritySpeaker:true,UseVAD:true }).catch(console.error);
                        }
                    });
            gamePreparator.update(this.userId,
            new GameModel(
                this.categoryId,
                this.lgchatTextChannelId,
                this.lgchatVoiceChannelId,
                this.commandBotTextChannelId,
                newMJ.id
            ));
        this.userId=newMJ.id;
    

    }
  
   
    public newPlayer(userName:string,userId: string): () => Promise<void> {
        return async () => {
            var channel:TextChannel=Main.Client.channels.cache.get(this.lgchatTextChannelId.toString()) as TextChannel;
            var voiceChannel:VoiceChannel=Main.Client.channels.cache.get(this.lgchatVoiceChannelId.toString()) as VoiceChannel;
            if(channel) {
                channel.send({content:`${userName} a été invité à rejoindre la partie.`, allowedMentions: {users: [userId]}});
                await channel.permissionOverwrites.create(userId, {
                            ViewChannel: true, SendMessages: true,Connect: true,Speak:true,Stream:true,PrioritySpeaker:true,UseVAD:true
                            
                        }).catch(console.error);
            }
            if(voiceChannel) {
                await voiceChannel.permissionOverwrites.create(userId, { ViewChannel: true, Connect: true, Speak:true,Stream:true,PrioritySpeaker:true,UseVAD:true });
            }
        };
    }
    public endGame(): void {
        
        Main.Client.channels.cache.forEach((channel) => {
                        if ("parentId" in channel && channel.parentId === this.categoryId) {
                           const members:Collection<Snowflake,GuildMember>=channel.members as Collection<Snowflake,GuildMember>;
                           members.forEach((member) => {
                            if(member.user.bot) return;
                            member.roles.remove(Main.getStatus(true)).catch(console.error);
                            member.roles.remove(Main.getStatus(false)).catch(console.error);
                           });
                            channel.delete().catch(console.error);
                        }
                    });
         Main.Client.channels.cache.get(this.categoryId.toString())?.delete().catch(console.error);
                     gamePreparator.deleteGame(this.userId);
                    
    }
    public kickUser(userId: string, reason?: string): void {
        const categoryChannel:CategoryChannel=Main.Client.channels.cache.get(this.categoryId.toString()) as CategoryChannel;
        if(categoryChannel) {
            categoryChannel.children.cache.forEach((channel) => {
                channel.permissionOverwrites.delete(userId).catch(console.error);
            });
        }

    }
    public async globalLock(lock: boolean, user: GuildMember, type: number): Promise<void> {

        var textChannel:TextChannel=Main.Client.channels.cache.get(this.lgchatTextChannelId.toString()) as TextChannel;
        var voiceChannel:VoiceChannel=Main.Client.channels.cache.get(this.lgchatVoiceChannelId.toString()) as VoiceChannel;
        if(!user){
            textChannel.members.forEach(async (member) => {
                if(member.user.bot) return;
                if(member.id===this.userId) return;
                await this.globalLock(lock, member, type);
            });
        }
        else if(this.isInGame(user.id)){
        if(lock) {
            if((type==2 || type==3) && textChannel) {
                await textChannel.permissionOverwrites.edit(user.id, { SendMessages: false }).catch(console.error);
            }
            if((type==1 || type==3) && voiceChannel) {
                await voiceChannel.permissionOverwrites.edit(user.id, { SendMessages:false,Connect: false, Speak:false,Stream:false,PrioritySpeaker:false,UseVAD:false }).catch(console.error);
            }
        }
        else{
            if((type==2 || type==3) && textChannel) {
                await textChannel.permissionOverwrites.edit(user.id, { SendMessages: true }).catch(console.error);
            }
            if((type==1 || type==3) && voiceChannel) {
                await voiceChannel.permissionOverwrites.edit(user.id, {SendMessages:true,Connect: true, Speak:true,Stream:true,PrioritySpeaker:true,UseVAD:true }).catch(console.error);
            }
        }
    }
    
    }
    public async channelLock(lock: boolean, user: GuildMember, channel: Channel): Promise<void> {

          var c=channel as TextChannel|VoiceChannel;
        if(!user){
            c.members.forEach(async (member) => {
                if(member.user.bot) return;
                if(member.id===this.userId) return;
                await this.channelLock(lock, member,c);
            });
        }

        else if(this.isInGame(user.id)){
                await c.permissionOverwrites.edit(user.id, { SendMessages:!lock,Connect: !lock, Speak:!lock,Stream:!lock,PrioritySpeaker:!lock,UseVAD:!lock }).catch(console.error);
          
        }
    }
    public async newGame(){
        gamePreparator.create(this);
    }
    public async cleanChannel(oldChannelId: string,newChannelId:string): Promise<void> {
        const lgChatTextChannel:boolean=this.lgchatTextChannelId==oldChannelId;
        const lgChatVoiceChannel:boolean=this.lgchatVoiceChannelId==oldChannelId;
        const commandBotTextChannel:boolean=this.commandBotTextChannelId==oldChannelId;
        const categoryChannel:boolean=this.categoryId==oldChannelId;
        if(lgChatTextChannel||lgChatVoiceChannel||commandBotTextChannel||categoryChannel){
           gamePreparator.update(this.userId ,
            new GameModel(
                categoryChannel? newChannelId:this.categoryId,
                lgChatTextChannel? newChannelId:this.lgchatTextChannelId, 
                lgChatVoiceChannel? newChannelId:this.lgchatVoiceChannelId,
                commandBotTextChannel?newChannelId : this.commandBotTextChannelId,
                this.userId));
        }
      
    }

    public isCommandChannel(channelId: string): boolean {
        return this.commandBotTextChannelId === channelId;
    }
}

export class GamePreparator {
  jsonDatabase: JsonDatabase<GameModel>;
  constructor() {
    this.jsonDatabase = new JsonDatabase("games.json", GameModel);
  }
  
  private findUnique(id:string) : GameModel | null {
  const game = this.jsonDatabase.findById(id);
  return game;
}

  public async  prepareGame(interaction: CommandInteraction, member: GuildMember): Promise<GameModel | null> {
        dotenv.config({quiet: true});
        const isMJ:boolean=this.isMJRole(member);
        const game = this.findUnique(interaction.user.id);
        if(!game || !isMJ) {
    await interaction.reply({content:"Vous n'avez pas de partie en cours ou vous n'avez pas la permission de la gérer.", flags:64});
    return null;
  }
  else if(game!=null && !game.isCommandChannel(interaction.channelId!)){
    await interaction.reply({content:"Vous pouvez taper les commandes uniquement dans le channel commande-bot de votre partie.", flags:64});
    return null;
  }
  else{
  return game;
  }
  }

  public isMJRole(member:GuildMember): boolean {
  dotenv.config({quiet: true});
  var isMJ:boolean=false;
   if(member && process.env.ROLE_MJ_ID) {
      const roles:GuildMemberRoleManager = member.roles as GuildMemberRoleManager;
      const role=roles.cache.get(process.env.ROLE_MJ_ID);
      if(role) {
          isMJ=true;
      }
    }
      return isMJ;
   
      }
  public deleteGame(id:String){
    this.jsonDatabase.delete(id);
}
public update(id:String,game:GameModel){
  this.jsonDatabase.delete(id);
  game.switchId(id);
  this.jsonDatabase.save(game);
}
 public create(game:GameModel){
  this.jsonDatabase.save(game);
}
public async newGame(voiceState:VoiceState,env:String): Promise<void> {
const member = voiceState.member as GuildMember;
const game = this.findUnique(member.id);
if(voiceState.channelId===env && !game && this.isMJRole(member)){
Main.logger.info("Création d'une nouvelle partie");
Main.logger.info("le MJ sera : "+member.user.username);
Main.logger.info("le MJ a pour ID : "+member.id);
const categoryChannel:CategoryChannel=await voiceState.guild.channels.create({
            name: `Partie de ${member.user.username}`,
            type: ChannelType.GuildCategory,
            permissionOverwrites: [
              {
                id: voiceState.guild.roles.everyone,
                deny: ["ViewChannel"],
              },
              {
                id: member.id,
                allow: ["ViewChannel"],
              }
             
            ]
        });
Main.logger.info("Catégorie créée avec l'ID : "+categoryChannel.id);
        const textChannel:TextChannel=await voiceState.guild.channels.create({
            name: `lg-chat`,
            type: ChannelType.GuildText,
            parent:categoryChannel,
            permissionOverwrites: [
              {
                id: voiceState.guild.roles.everyone,
                deny: ["ViewChannel"],
              },
              {
                id: member.id,
                allow: ["ViewChannel","SendMessages","ReadMessageHistory"],
              }
             
            ]
        }) as TextChannel;
Main.logger.info("Channel texte créé avec l'ID : "+textChannel.id);
        const voiceChannel:VoiceChannel=await voiceState.guild.channels.create({
            name: `lg-vocal`,
            type: ChannelType.GuildVoice,
            parent:categoryChannel,
            permissionOverwrites: [
              {
                id: voiceState.guild.roles.everyone,
                deny: ["ViewChannel"],
              },
              {
                id: member.id,
                allow: ["ViewChannel","Connect","Speak","Stream","PrioritySpeaker","UseVAD"],
              }
             
            ]
        });
Main.logger.info("Channel vocal créé avec l'ID : "+voiceChannel.id);
        const commandBotChannel:TextChannel=await voiceState.guild.channels.create({
            name: `lg-commands`,
            type: ChannelType.GuildText,
            parent:categoryChannel,
            permissionOverwrites: [
              {
                id: voiceState.guild.roles.everyone,
                deny: ["ViewChannel"],
              },
              {
                id: member.id,
                allow: ["ViewChannel","SendMessages","ReadMessageHistory"],
              }]});
Main.logger.info("Channel commande-bot créé avec l'ID : "+commandBotChannel.id);
        const game:GameModel=new GameModel(categoryChannel.id,textChannel.id,voiceChannel.id,commandBotChannel.id,member.id);
        game.newGame();
        voiceState.setChannel(voiceChannel);
Main.logger.info("Le MJ a été déplacé dans le channel vocal de la partie.");
        await textChannel.send(`Bienvenue dans votre partie de Loup-Garou. Utilisez le channel ${commandBotChannel} pour interagir avec le bot.`);
}
else if(voiceState.channelId==env){
  voiceState.disconnect("Vous ne pouvez pas créer une partie car vous êtes déja dans une partie.");
}
}

}