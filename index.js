const Plugin = module.parent.require('../Structures/Plugin');
const Package = require("./package.json");
const {remote} = require('electron');

class Wallhaven extends Plugin {
    constructor(...args) {
        super(...args);

        this.settingsChanged();
        this.registerSettingsTab(Package.name, require("./settings").tab);
        
        const lastImage = DI.localStorage.getItem(`DI-${Package.name}-Cache`)
        if (lastImage) {
            console.log(lastImage)
            console.log("SETTING BG!!!")

            document.body.style.backgroundImage = "url(" + lastImage + ")"
        }

        this.foo = "bar"

        this.installTimer();

        this.registerCommand({
            name: 'whn',
            info: 'Switch to the next background',
            func: (args) => this.changeBackground.call(this, true)
        });

        this.registerCommand({
            name: 'whs',
            info: 'Send a message with the current Image',
            func: (args) => "I am using <" + DI.localStorage.getItem(`DI-${Package.name}-Cache`) + "> as a background. The link can be **NSFW** you have been warned!"
        });

        this.registerCommand({
            name: 'whe',
            info: 'Just echo the image',
            func: (args) => this.sendLocalMessage(DI.localStorage.getItem(`DI-${Package.name}-Cache`))
        });
    }

    settingsChanged() {
        this.cache = false
        this.installTimer();
    }

    installTimer() {
        if (this._interval) {
            this.log("Killing old interval...")
            clearInterval(this._interval);
        }

        if (this.settings.interval && this.settings.enabled) {
            this.log("Creating new interval! Running background task every " + this.settings.interval + "s")
            this._interval = setInterval(this.changeBackground.bind(this), this.settings.interval * 1000);
        }
    }

    changeBackground(notify = false) {
        const categories = (this.settings["categories-0"]? "1": "0") + (this.settings["categories-1"]? "1": "0") + (this.settings["categories-2"]? "1": "0")
        const purity = (this.settings["purity-0"]? "1": "0") + (this.settings["purity-1"]? "1": "0") + (this.settings["purity-2"]? "1": "0")


        this.query({ q: this.settings.searchTerm, categories, purity }).then(images => {
            const idx = Math.floor(Math.random() * images.length);
            const img = images[idx];
            this.images = this.images || {}
            this.images[img]? Promise.resolve(this.images[img]): this.fetch(img).then(text => {
                const dp = new DOMParser();
                const el = dp.parseFromString(text, "text/html").getElementById("wallpaper");
                this.images[img] = "https:" + el.getAttribute("src");
                return this.images[img];
            })
            .then(src => {
                document.body.style.backgroundImage = "url(" + src + ")";
                DI.localStorage.setItem(`DI-${Package.name}-Cache`, src)
                notify && this.sendLocalMessage("Changed background!");
            })
        });
    }

    fetch(url) {
        this.log(`Browsing to <${url}>!`)

        const win = new remote.BrowserWindow({width: 800, height: 600, show: false, parent: remote.getCurrentWindow()});
        win.loadURL(url);

        return new Promise(rs => {
            win.webContents.once('dom-ready', () => {
                win.webContents.executeJavaScript(`document.documentElement.outerHTML`, true, rs);
                win.close();
            });
        });
    }

    query(params = {}) {
        const url = "https://alpha.wallhaven.cc/search?" + Object.keys(params).reduce((p,c) => p + c + "=" + encodeURIComponent(params[c]) + "&", "");
        this.log(`Querying Wallhaven <${ url }>...`);

        if (this.cache && this.cache.ts >= Date.now() - (1000 * 60 * 60 * 24)) {
            this.log(`Serving ${this.cache.entries.length} backgrounds from cache`);
            return Promise.resolve(this.cache.entries);
        }

        this.sendLocalMessage("Updating image cache, please wait a few seconds...");

        const win = new remote.BrowserWindow({width: 800, height: 600, show: false, parent: remote.getCurrentWindow()});
        win.loadURL(url);

        const evil = cb => new Promise(rs => win.webContents.executeJavaScript("(" + cb.toString() + ")()", true, rs))
        
        return new Promise(rs => {
            win.webContents.once('dom-ready', () => {
                return evil(() => document.querySelector('.thumb-listing-page-header').innerText)
                .then(nt => {
                    const matches = nt.match(/\d+\s*\/\s*(\d+)/)
                    const pages = matches.length < 2? 1: +matches[1];

                    let foundImages = [];
                    let P = Promise.resolve();
                    for (let i = 0; i < pages; i++) {
                        P = P.then(() => evil(() => Array.from(
                                document.querySelectorAll(".thumb a.preview"))
                                .map(el => el.href)
                            )).then(arr => {

                            foundImages = foundImages.concat(...arr);
                            this.log(`found ${arr.length}/${foundImages.length} new images on page ${i+1}/${pages}`);
                        }).then(() => new Promise(rs => {
                            evil(() => document.querySelector("a.next").click());
                            win.webContents.once("dom-ready", rs());
                        }));
                    }
                    return P.then(() => foundImages);
                })
                .then(images => {
                    this.log(`Saving ${images.length} backgrounds to cache`);
                    
                    this.cache = {
                        ts: Date.now(),
                        entries: images,
                    }

                    win.hide();
                    win.close();

                    return rs(images);
                })
                .catch(ex => {
                    this.log("Failed to query page!")
                    console.error(ex)
                });
            });
        });
    }
    
    get configTemplate() {
        return {
            color: '551177',
            iconURL: 'https://pbs.twimg.com/profile_images/653341480640217088/t1c1aTc9_400x400.png',
        };
    }

    unload() {
        if (this._interval) {
            clearInterval(this._interval);
        }
    }
}

module.exports = Wallhaven;