import {Snowflake,CategoryChannel, Channel, ChannelType, Collection, Guild, GuildMember, TextChannel, VoiceChannel, Client } from "discord.js";
import { Main } from "../client.js";
import {prisma, endGame} from "./ModelPreparator.js";


export class Game{
    private categoryId: string;
    private lgchatTextChannelId: string;
    private lgchatVoiceChannelId: string;
    private commandBotTextChannelId: string;
    private userId: string;
    constructor(categoryId: string, lgchatTextChannelId: string, lgchatVoiceChannelId: string, commandBotTextChannelId: string, userId: string) {
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
              parent: this.categoryId
            });
        }
    }
    public async switchMJ(newMJ:GuildMember): Promise<void> {
            Main.Client.channels.cache.forEach((channel) => {
                        if (channel.id==this.commandBotTextChannelId && channel.type===ChannelType.GuildText) {
                            channel.permissionOverwrites.create(newMJ.id, { ViewChannel: true, SendMessages: true }).catch(console.error);
                            channel.permissionOverwrites.delete(this.userId).catch(console.error);
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
            await prisma.game.update({
            where: { userId: this.userId },
            data: {
                lgChatTextChannelId: this.lgchatTextChannelId,
                lgChatVoiceChannelId: this.lgchatVoiceChannelId,
                commandBotTextChannelId:this.commandBotTextChannelId,
                categoryId: this.categoryId,
                userId:newMJ.id
            }
        });
        this.userId=newMJ.id;
    

    }
  
    public isInGame(userId: string): boolean {
        var channel:TextChannel=Main.Client.channels.cache.get(this.lgchatTextChannelId) as TextChannel;
        return channel.members.has(userId);
    }
    public newPlayer(userName:string,userId: string): () => Promise<void> {
        return async () => {
            var channel:TextChannel=Main.Client.channels.cache.get(this.lgchatTextChannelId) as TextChannel;
            var voiceChannel:VoiceChannel=Main.Client.channels.cache.get(this.lgchatVoiceChannelId) as VoiceChannel;
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
         Main.Client.channels.cache.get(this.categoryId)?.delete().catch(console.error);
                     endGame(this.userId).catch(console.error);
                    
    }
    public kickUser(userId: string, reason?: string): void {
        const categoryChannel:CategoryChannel=Main.Client.channels.cache.get(this.categoryId) as CategoryChannel;
        if(categoryChannel) {
            categoryChannel.children.cache.forEach((channel) => {
                channel.permissionOverwrites.delete(userId).catch(console.error);
            });
        }

    }
    public async globalLock(lock: boolean, user: GuildMember, type: number): Promise<void> {

        var textChannel:TextChannel=Main.Client.channels.cache.get(this.lgchatTextChannelId) as TextChannel;
        var voiceChannel:VoiceChannel=Main.Client.channels.cache.get(this.lgchatVoiceChannelId) as VoiceChannel;
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
        await prisma.game.create({data: {userId:this.userId, categoryId:this.categoryId, lgChatTextChannelId:this.lgchatTextChannelId, lgChatVoiceChannelId:this.lgchatVoiceChannelId, commandBotTextChannelId:this.commandBotTextChannelId}});
    }
    public async cleanChannel(oldChannelId: string,newChannelId:string): Promise<void> {
        const lgChatTextChannel:boolean=this.lgchatTextChannelId==oldChannelId;
        const lgChatVoiceChannel:boolean=this.lgchatVoiceChannelId==oldChannelId;
        const commandBotTextChannel:boolean=this.commandBotTextChannelId==oldChannelId;
        const categoryChannel:boolean=this.categoryId==oldChannelId;
        if(lgChatTextChannel||lgChatVoiceChannel||commandBotTextChannel||categoryChannel){
           await prisma.game.update({
            where: { userId: this.userId },
            data: {
                lgChatTextChannelId: lgChatTextChannel? newChannelId:this.lgchatTextChannelId, 
                lgChatVoiceChannelId: lgChatVoiceChannel? newChannelId:this.lgchatVoiceChannelId,
                commandBotTextChannelId:commandBotTextChannel?newChannelId : this.commandBotTextChannelId,
                categoryId: categoryChannel? newChannelId:this.categoryId
            }
        });
        }
      
    }
}