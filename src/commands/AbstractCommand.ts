import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { PrivateChannels } from "./PrivateChannels.js";
export interface AbstractCommand {
    data: SlashCommandBuilder;
    execute(interaction: ChatInputCommandInteraction): Promise<void>;
}
import { CleanCommand } from "./clean.js";
import {EndCommand} from "./end.js";
import {Invite} from "./invite.js";
import { Kick } from "./kick.js";
import {SendCommand} from "./send.js";
import { switchMj } from "./switchmj.js";
import { VoteCommand } from "./VoteCommand.js";
export function getCommands(): AbstractCommand[] {
    return [new CleanCommand(), new PrivateChannels(), new EndCommand(), new Invite(), new Kick(), new SendCommand(), new switchMj(), new VoteCommand()];
}