# LgBot: bot de loup garou pour discord
bot de loup garou pour un serveur discord, le bot n'est pas centrée sur les rôles du loup garou mais sur la modération d'une partie.
Pour pouvoir lancer le bot, vous devez vous même un fichier .env dans lequelle vous devrez précisez:
BOT_TOKEN="token du bot"
DATABASE_URL="l'url de la base de données mongodb"
IS_ALIVE_ROLE_ID="l'id du rôle vivant"
IS_DEAD_ROLE_ID="l'id du rôle mort"
ROLE_MJ_ID="l'id du rôle mj"
DISCORD_CHANNEL_CREATION_ID="l'id du channel de création d'une partie"
Une fois cela fait, vous devrez faire npm run dev pour executer le code.
Quand un mj entre dans la voc de création de partie, des channels dans la catégorie "partie de (pseudo du mj) sont crées avec lg-chat pour écrire des messages, lg-voc pour que les joueurs parlent et enfin le channel lg-commands accessible uniquement par le mj. Lors de la création de channel, seul le mj peut le voir. Attention, le fondateur ou les rôles étant au dessus du bot en termes de permissions peuvent voir tous les channels quoi qu'ils arrivent.
/send permet d'envoyer un message
/clean de nettoyer un salon
/end de mettre fin a la partie
/lgchat permet de verrouiller/déverouiller d'un channel
/access permet de accepter/révoquer l'accés d'un channel
/invite permet d'ajouter des joueurs a la partie
/kick permet de ban quelqu'un
/switchmj permet de changer de mj
/channel permet de créer/supprimer des channels
/switchrole permet de  modifier les rôles
Vous pouvez rejoindre https://discord.gg/m3qCFxVbx5 ou https://discord.gg/QJ7yeSMnqS pour les suggestions et les problémes ou les soumettre directement sur github.