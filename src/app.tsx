import React from "react";
import { GameModel } from "./models/GameModel.js";

export default function App({ datas }: { datas: GameModel[] }) {
  return (
    <div id="root">
      {/* <link rel="stylesheet" href="styles.css" /> */}
      <h1>Bienvenue sur le site du bot LGBot</h1>
      {datas.map((data, index) => (
        <div key={index}>
          <form method="post" action="/games/update">
            <input type="hidden" name="originalUserId" value={data.getUserId().toString()} />
            <p>User ID: {data.getUserId()}</p>
            <input type="text" name="userId" defaultValue={data.getUserId().toString()} />
            <p>Category Channel ID: {data.getCategoryChanelId()} <input type="text" name="categoryChannelId" defaultValue={data.getCategoryChanelId().toString()} /></p>
            <p>Joueur Role ID: {data.getJoueurRoleId()} <input type="text" name="joueurRoleId" defaultValue={data.getJoueurRoleId().toString()} /></p>
            <p>MJ Role ID: {data.getMjRoleId()} <input type="text" name="mjRoleId" defaultValue={data.getMjRoleId().toString()} /></p>
            <p>Voice Channel ID: {data.getVoiceChannelId()} <input type="text" name="voiceChannelId" defaultValue={data.getVoiceChannelId().toString()} /></p>
            <button type="submit" name="action" value="update">Mettre à jour</button>
            <button type="submit" name="action" value="delete">Supprimer</button>
          </form>
        </div>
      ))}
    </div>
  );
}
