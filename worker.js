const cron = require("node-cron"),
    config = require("./config"),
    Parser = require('rss-parser'),
    parser = new Parser(),
    { logger } = require('./utils'),
    { var: { createMessage, findOrCreate } } = require("./helpers");

// connect to database
require('./database/mongoose').init();

logger.ready('[AUTO-YOUTUBE]: Worker inicializado.');

const job0 = cron.schedule(
    "* * * * *",
    async () => {
        /** ------------------------------------------------------------------------------------------------
        * SE CONECTA AO BANCO DE DADOS DO ADDON
        * ------------------------------------------------------------------------------------------------ */
        const conditional = {
            enabled: "true",
        }
        const results = await findOrCreate(conditional, 'AutoYoutube');

        if (results && results.length) {
            for (const result of results) {
                /** ------------------------------------------------------------------------------------------------
                * OBTEM O CANAL DE ANUNCIO PELO BANCO DE DADOS
                * ------------------------------------------------------------------------------------------------ */
                const autochannel = result.channelID;
                /** ------------------------------------------------------------------------------------------------
                * ENCONTRA TODOS CANAIS DO YOUTUBE NO BANCO DE DADOS E OS SEPARA
                * ------------------------------------------------------------------------------------------------ */
                const canais = result.canais;
                canais.forEach(async function (canal, i) {
                    /** ------------------------------------------------------------------------------------------------
                    * VERIFICA SE O CANAL ADICIONADO É UM CHANNEL_ID
                    * ------------------------------------------------------------------------------------------------ */
                    if (canal.startsWith('UC')) {
                        /** ------------------------------------------------------------------------------------------------
                        * ENCONTRA DADOS DOS ULTIMOS VIDEOS DO CANAL
                        * ------------------------------------------------------------------------------------------------ */
                        let feed = await parser.parseURL(`https://www.youtube.com/feeds/videos.xml?channel_id=${canal}`);
                        if (feed === "Status code 404") return console.log(`${canal} não publicado em ${result._id} devido ao Status code 404.`);
                        /** ------------------------------------------------------------------------------------------------
                        * OBTEM O ID DO ULTIMO VIDEO E VERIFICA SE ELE JÁ FOI ANUNCIOADO
                        * ------------------------------------------------------------------------------------------------ */
                        const id = result.lastVideoID
                        if (feed.items[0].id == id.includes(feed.items[0].id)) {
                            return
                            /** ------------------------------------------------------------------------------------------------
                            * REMOVE DO BANCO DE DADOS O ULTIMO VIDEO ANUNCIADO
                            * ------------------------------------------------------------------------------------------------ */
                        } else if (!feed.items[0].id == id.includes(feed.items[0].id)) {
                            var arr = result.lastVideoID;

                            for (var i = 0; i < arr.length; i++) {

                                if (arr[i] === feed.items[2].id) {

                                    arr.splice(i, 1);
                                }
                            }
                            /** ------------------------------------------------------------------------------------------------
                            * SALVA NO BANCO DE DADOS O ULTIMO VIDEO ANUNCIADO E ENVIA A MENSAGEM DE ANUNCIO
                            * ------------------------------------------------------------------------------------------------ */
                            result.lastVideoID.push(feed.items[0].id)
                            await result.save().catch(() => { });
                            /** ------------------------------------------------------------------------------------------------
                            * SE A CUSTOM MENSAGEM ESTIVER CONFIGURADA A ENVIA JUNTO COM O ANUNCIO, SE NÃO, APENAS ENVIA O ANUNCIO
                            * ------------------------------------------------------------------------------------------------ */
                            if (result.customMsg == null) {
                                let datamsg = {
                                    "content": `Yaayy! ${feed.items[0].author} just posted a new video, go check it out!\nLink: ${feed.items[0].link} <:SkyeComendoPipoca:868559879835635732>`,
                                    "tts": false,
                                    "embeds": null,
                                };
                                if (config.debug) logger.log(`[NEW-POST]: A New Video in channelID = ${result.channelID} | videoID = ${feed.items[0].id} | guildID = ${result._id}`);
                                await createMessage(result.channelID, config.token, datamsg);
                            } else if (result.customMsg) {
                                let datamsg = {
                                    "content": `${result.customMsg.replace(/{author}/g, feed.items[0].author).replace(/{title}/g, feed.items[0].title).replace(/{url}/g, feed.items[0].link).replace(/{everyone}/g, `@everyone`).replace(/{here}/g, `@here`)}`,
                                    "tts": false,
                                    "embeds": null,
                                };
                                if (config.debug) logger.log(`[NEW-POST]: A New Video with Custom Message in channelID = ${result.channelID} | videoID = ${feed.items[0].id} | guildID = ${result._id}`);
                                await createMessage(result.channelID, config.token, datamsg);
                            }
                        }
                        /** ------------------------------------------------------------------------------------------------
                        * VERIFICA SE O CANAL ADICIONADO É UM USER_CHANNEL
                        * ------------------------------------------------------------------------------------------------ */
                    } else if (!canal.startsWith('UC')) {
                        /** ------------------------------------------------------------------------------------------------
                        * ENCONTRA DADOS DOS ULTIMOS VIDEOS DO CANAL
                        * ------------------------------------------------------------------------------------------------ */
                        let feed = await parser.parseURL(`https://www.youtube.com/feeds/videos.xml?user=${canal}`);
                        if (feed === "Status code 404") return console.log(`${canal} não publicado em ${result._id} devido ao Status code 404.`);
                        /** ------------------------------------------------------------------------------------------------
                        * OBTEM O ID DO ULTIMO VIDEO E VERIFICA SE ELE JÁ FOI ANUNCIOADO
                        * ------------------------------------------------------------------------------------------------ */
                        const id = result.lastVideoID
                        if (feed.items[0].id == id.includes(feed.items[0].id)) {
                            return
                            /** ------------------------------------------------------------------------------------------------
                            * REMOVE DO BANCO DE DADOS O ULTIMO VIDEO ANUNCIADO
                            * ------------------------------------------------------------------------------------------------ */
                        } else if (!feed.items[0].id == id.includes(feed.items[0].id)) {
                            var arr = result.lastVideoID;

                            for (var i = 0; i < arr.length; i++) {

                                if (arr[i] === feed.items[2].id) {

                                    arr.splice(i, 1);
                                }

                            }
                            /** ------------------------------------------------------------------------------------------------
                            * SALVA NO BANCO DE DADOS O ULTIMO VIDEO ANUNCIADO E ENVIA A MENSAGEM DE ANUNCIO
                            * ------------------------------------------------------------------------------------------------ */
                            result.lastVideoID.push(feed.items[0].id)
                            await result.save().catch(() => { });
                            /** ------------------------------------------------------------------------------------------------
                            * SE A CUSTOM MENSAGEM ESTIVER CONFIGURADA A ENVIA JUNTO COM O ANUNCIO, SE NÃO, APENAS ENVIA O ANUNCIO
                            * ------------------------------------------------------------------------------------------------ */
                            if (result.customMsg == null) {
                                let datamsg = {
                                    "content": `Yaayy! ${feed.items[0].author} just posted a new video, go check it out!\nLink: ${feed.items[0].link} <:SkyeComendoPipoca:868559879835635732>`,
                                    "tts": false,
                                    "embeds": null,
                                };
                                if (config.debug) logger.log(`[NEW-POST]: A New Video in channelID = ${result.channelID} | videoID = ${feed.items[0].id} | guildID = ${result._id}`);
                                await createMessage(result.channelID, config.token, datamsg);
                            } else if (result.customMsg) {
                                let datamsg = {
                                    "content": `${result.customMsg.replace(/{author}/g, feed.items[0].author).replace(/{title}/g, feed.items[0].title).replace(/{url}/g, feed.items[0].link).replace(/{everyone}/g, `@everyone`).replace(/{here}/g, `@here`)}`,
                                    "tts": false,
                                    "embeds": null,
                                };
                                if (config.debug) logger.log(`[NEW-POST]: A New Video with Custom Message in channelID = ${result.channelID} | videoID = ${feed.items[0].id} | guildID = ${result._id}`);
                                await createMessage(result.channelID, config.token, datamsg);
                            }
                        }
                    }
                })
            }
        }
    },
    {
        timezone: "America/Sao_Paulo",
    }
);

job0.start();

// Error Handler
process.on('unhandledRejection', error => logger.error(error));
process.on('uncaughtException', error => logger.error(error));