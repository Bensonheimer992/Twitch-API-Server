const axios = require('axios').default;
const express = require('express');
require('dotenv').config()

const app = express();
const port = process.env.PORT;

const twitch_client_id = process.env.CLIENT_ID;
const twitch_client_secret = process.env.CLIENT_SECRET;

app.get('/api/:name', async (req, res) => {
    try {
        const name = req.params.name;

        axios.post("https://id.twitch.tv/oauth2/token?client_id=" + twitch_client_id + "&client_secret=" + twitch_client_secret + "&grant_type=client_credentials").then(response => {
            let token = response.data.access_token
            
            axios.get("https://api.twitch.tv/helix/streams?user_login=" + name, {
            headers: {
                Authorization: "Bearer " + token,
                "Client-Id": twitch_client_id
            }
            }).then(livedata => {
                axios.get("https://api.twitch.tv/helix/users?login=" + name, {
                    headers: {
                        Authorization: "Bearer " + token,
                        "Client-Id": twitch_client_id
                    }
                }).then(getuserdata => {
                let data = livedata.data
                let userdata = getuserdata.data.data[0]
                if (data.data.length > 0) {
                    const thumbnailbefore = data.data[0].thumbnail_url
                    const thumbnailUrl = thumbnailbefore.replace('{width}', '1920').replace('{height}', '1080');

                    res.json({ live: true, username: data.data[0].user_name, user_description: userdata.description, user_profilepicture: userdata.profile_image_url, offline_banner: userdata.offline_image_url, account_created: userdata.created_at,  title:data.data[0].title, thumbnail: thumbnailUrl,  game: data.data[0].game_name, view_count: data.data[0].viewer_count, language: data.data[0].language })
                    console.log("New Twitch API Request with live: true")
                } else {
                    res.json({ live: false, user_profilepicture: userdata.profile_image_url, offline_banner: userdata.offline_image_url })
                    console.log("New Twitch API Request with live: false")
                }
                });
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