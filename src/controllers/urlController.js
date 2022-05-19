const urlModel = require("../models/urlModel");
const shortid = require('shortid');
const redis = require("redis");
const { promisify } = require("util");

//Connect to redis
const redisClient = redis.createClient(
    13190,
    "redis-13190.c301.ap-south-1-1.ec2.cloud.redislabs.com",
    { no_ready_check: true }
);
redisClient.auth("gkiOIPkytPI3ADi14jHMSWkZEo2J5TDG", function (err) {
    if (err) throw err;
});

redisClient.on("connect", async function () {
    console.log("Connected to Redis..");
});

//Connection setup for redis

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);


// Create URL
const createUrl = async function (req, res) {
    try {
        let data = req.body;
        if (!Object.keys(req.body).length) {
            return res.status(400).send({ status: false, msg: "please provide details in Body." })
        }
        let isVAilsdUrl = /^(http(s)?:\/\/)?(www.)?([a-zA-Z0-9])+([\-\.]{1}[a-zA-Z0-9]+)*\.[a-zA-Z]{2,5}(:[0-9]{1,5})?(\/[^\s]*)?$/gm.test(req.body.longUrl)
        if (isVAilsdUrl == false) {
            return res.status(400).send({ status: false, msg: "please enter vaild Url." })
        }
        let url = await GET_ASYNC(`${data.longUrl}}`);
        if (url) {
            return res.status(200).send({ status: true, message: "Success", radisData: JSON.parse(url) })
        }
        let findUrl = await urlModel.findOne({ longUrl: data.longUrl }, { _id: 0, createAt: 0, updateAt: 0, _v: 0 })
        if (findUrl) {
            await SET_ASYNC(`${data.longUrl}`, JSON.stringify(findUrl))
            return res.status(200).send({ status: true, message: "Success", data: findUrl })
        }
        let id = shortid.generate();
        data.urlCode = id
        data.shortUrl = `http:localhost:3000/${id}`;

        let urlCreate = await urlModel.create(data);
        let doc = JSON.stringify({ longUrl: urlCreate.longUrl, shortUrl: urlCreate.shortUrl, urlCode: urlCreate.urlCode });
        await SET_ASYNC(`${data.longUrl}`, doc);
        return res.status(201).send({ status: true, message: "Url is sucessfully created.", data: { longUrl: urlCreate.longUrl, shortUrl: urlCreate.shortUrl, urlCode: urlCreate.urlCode } })
    }
    catch (err) {
        res.status(500).send({ status: false, message: "Server not responding", error: err.message });
    }
}


// Fetch URL
const getUrl = async function (req, res) {
    try {
        const url = await GET_ASYNC(`${req.params.urlCode}`);
        if (url) {
            res.status(302).redirect(JSON.parse(url))
        } else {
            let findUrl = await urlModel.findOne({ urlCode: req.params.urlCode });
            if (!findUrl)
                return res.status(404).send({ status: false, message: "No URL is found with the given code. Please enter valid URL code" });
            await SET_ASYNC(`${req.params.urlCode}`, JSON.stringify(findUrl.longUrl))
            res.status(302).redirect(findUrl.longUrl);
        }
    } catch (err) {
        res.status(500).send({ status: false, message: "Server not responding", error: err.message });
    }
}

module.exports = { createUrl, getUrl }  