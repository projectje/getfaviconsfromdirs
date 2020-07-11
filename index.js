const dir = require('node-dir');
const util = require('util');
const fs = require('fs');
const readFile = util.promisify(fs.readFile);
const fse = require('fs-extra');
const got = require('got');
const stream = require('stream');
const {promisify} = require('util');
const pipeline = promisify(stream.pipeline);
const googleFaviconApi = 'https://s2.googleusercontent.com/s2/favicons?domain_url=';

/**
* Downloads a favion in reverse domain name folder
*/
function generateName(url, imgRootDir) {
    const domain = url.split("/")[2]
    const reversedomain = domain.split('.').reverse().join('.');
    const reversedomainslash = domain.split('.').reverse().join('/');
    const imgDir = imgRootDir + reversedomainslash;
    const imgFilePath = imgDir + "/favicon.png";

    fse.ensureDirSync(imgDir);
    fs.open(imgFilePath, 'wx', (err, fd) => {
        if (err) {
            if (err.code === 'EEXIST') {
                return;
            }
            throw err;
        }

        (async () => {
            await pipeline(
                got.stream(googleFaviconApi + url),
                fs.createWriteStream(imgFilePath)
            );
            console.log("created favion " + imgFilePath);
        })();
    });

    return reversedomain;
}

/**
 * Get set of urls out of text
 */
function linkify(rawText, imgRootDir) {
    var urlRegex =/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    return rawText.replace(urlRegex, function(url) {
        var a = generateName(url, imgRootDir);
    });
}

/**
 * Travese a directory for text files
 */
function getFavicon(dirs, imgRootDir) {
    dir.promiseFiles(dirs)
    .then((files)=>{files.map(f=> { var r= {};readFile(f,'utf8').then ((file) => {linkify(file, imgRootDir);})})})
    .catch(e=>console.error(e))
}

module.exports = { getFavicon };