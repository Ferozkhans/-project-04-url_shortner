const urlModel = require("../models/urlModel");
const shortid = require('shortid');
const validUrl = require('valid-url');


const createUrl = async function (req, res) {
    try {
        const localurl = 'http:localhost:3000';
        const urlCode = shortid.generate();
        let { longUrl } = req.body;
        if (!validUrl.isUri(longUrl)) {
            return res.status(400).send({ status: false, msg: "longUrl is required." })
        }
        let url = await urlModel.findOne({ longUrl });
        if (url) {
            return res.send({ data: url })
        }
        const shortUrl = localurl + '/' + urlCode;
        url = new urlModel({ longUrl, shortUrl, urlCode }), await url.save();
        res.send(url);
    } catch (err) {
        res.status(500).send({ status: false, message: "Server not responding", error: err.message });
    }
}
module.exports.createUrl = createUrl
