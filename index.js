const axios = require('axios').default;
const express = require('express');
require('dotenv').config()

const app = express();
const port = process.env.PORT;

const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;

app.get('/api/:name', async (req, res) => {
    try {
        const name = req.params.name;

        axios.post("https://id.twitch.tv/oauth2/token?client_id=" + client_id + "&client_secret=" + client_secret + "&grant_type=client_credentials").then(response => {
            let token = response.data.access_token

            axios.get("https://api.twitch.tv/helix/streams?user_login=" + name, {
                headers: {
                    Authorization: "Bearer " + token,
                    "Client-Id": client_id
                }
            }).then(livedata => {
                let data = livedata.data
                if (data.data.length > 0) {
                    res.json({ live: true, username: data.data[0].user_name, title:data.data[0].title, game: data.data[0].game_name, view_count: data.data[0].viewer_count, language: data.data[0].language })
                } else {
                    res.json({ live: false })
                }
            });
        });
    } catch (error) {
        res.status(500).json({ error: 'Serverfehler' })
        console.error(error)
    }
});

app.listen(port, () => {
    console.log(`Server läuft auf Port ${port}`)
});