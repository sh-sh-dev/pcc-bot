#!/usr/bin/env node
const TOKEN = '521688741:AAG7HJvY_2iJjV7YxIvAesLGfdvk8NsBydo';

console.log('Initializing...')

const fs = require('fs');
const os = require('os');
const usb = require('usb');
const http = require("http");
const cmd = require('node-cmd');
const wifi = require("node-wifi");
const in_array = require('in_array');
const powerOff = require('power-off');
const sleepMode = require('sleep-mode');
const BOT = require('node-telegram-bot');
const screenshot = require('desktop-screenshot');

const Admins = [
    342727359
    ,
    125899758
]
const MainKeyboard = {
    keyboard : [
        [
            "Shutdown"
            ,
            "Sleep"
        ]
        ,
        [
            "Run Command"
        ]
        ,
        [
            "WiFi"
            ,
            "Network"
        ]
        ,
        [
            "OS"
            ,
            "CPU"
        ]
        ,
        [
            "Screenshot"
        ]
    ]
}

var bot = new BOT({
  token: TOKEN
})
.on('message', function (message) {

    console.log('Message recived');

    var $chat_id = message.chat.id,
    $message_id = message.message_id,
    text = message.text,
    Authorized = false;
    if (text.indexOf("/connect_wifi")) text = text.toLowerCase();

    //Authorization
    if (in_array($chat_id,Admins)) Authorized = true;

    //Start
    if (Authorized && text == "/start") {
        bot.sendMessage({
            chat_id:$chat_id,
            text:"Hi **" + message.from.first_name + "** !" + "\nPlease Select one option",
            parse_mode:"Markdown",
            reply_to_message_id:$message_id,
            reply_markup:MainKeyboard
        })
    }

    //ShutDown
    else if (Authorized && text == "shutdown") {
        bot.sendMessage({
            chat_id:$chat_id,
            text:"Shutdown 👇\nAre you sure?",
            reply_to_message_id:$message_id,
            reply_markup : {
                keyboard : [
                    [
                        "Yes, Turn off System"
                    ]
                    ,
                    [
                        "Cancel"
                    ]
                ],
                one_time_keyboard:true
            }
        });
    }
    else if (Authorized && text == "yes, turn off system") {
        powerOff(function (err, stderr, stdout) {
            if (err) {
              bot.sendMessage({
                chat_id:$chat_id,
                reply_to_message_id:$message_id,
                text:"Can't Shutdown :("
              });
            }
            else {
                bot.sendMessage({
                    chat_id:$chat_id,
                    reply_to_message_id:$message_id,
                    text:"Shutted Down :)"
                })
            }
          })
    }

    //Sleep
    else if (Authorized && text == "sleep") {
        bot.sendMessage({
            chat_id:$chat_id,
            text:"Sleep 👇\nAre you sure?",
            reply_to_message_id:$message_id,
            reply_markup : {
                keyboard : [
                    [
                        "Yes, Sleep System"
                    ]
                    ,
                    [
                        "Cancel"
                    ]
                ],
                one_time_keyboard:true
            }
        });
    }
    else if (Authorized && text == "yes, sleep system") {
        sleepMode(function (err, stderr, stdout) {
            if (err) {
                bot.sendMessage({
                    chat_id:$chat_id,
                    reply_to_message_id:$message_id,
                    text:"Can't Sleep :("
                });
            }
            else {
                bot.sendMessage({
                    chat_id:$chat_id,
                    reply_to_message_id:$message_id,
                    text:"Sleeped :)"
                })
            }
          })
    }

    //Run Command
    else if (Authorized && text == "run command") {
        bot.sendMessage({
            chat_id:$chat_id,
            reply_to_message_id:$message_id,
            text:"Run Command 👇\nSend /rcommand <command> to run\nExample : /rcommand php -v"
        })
    }
    else if (Authorized && !text.indexOf("/rcommand")) {
        var Command = text.replace("/rcommand","")
        cmd.get(Command,(err,data,stderr) => {
            var ResultCommand = err !=null ? err : data
            bot.sendMessage({
                chat_id:$chat_id,
                reply_to_message_id:$message_id,
                text:"/rcommand 👇\n" + ResultCommand
            })
        })
    }

    //WiFi
    else if (Authorized && text == "wifi") {
        bot.sendMessage({
            chat_id:$chat_id,
            reply_to_message_id:$message_id,
            text:"WiFi 👇\nSelect an option",
            reply_markup : {
                keyboard : [
                    [
                        "Scan WiFi"
                    ]
                    ,
                    [
                        "Connect WiFi"
                    ]
                    ,
                    [
                        "Get Current WiFi"
                    ]
                    ,
                    [
                        "🏠"
                    ]
                ],
                one_time_keyboard:true
            }
        })
    }

    else if (Authorized && text == "scan wifi") {
        wifi.init({
            iface : null
        });
        wifi.scan((err, networks) => {

            if (err) bot.sendMessage({
                chat_id:$chat_id,
                reply_to_message_id:$message_id,
                text:`Scan WiFi 👇\nCan't scan WiFi networks :( \n( {err} )`
            })
            else {
                var  Networks = "Scan WiFi 👇\n\n";
                for(i=0;i<networks.length;i++) {
                    var SSID = networks[i].ssid != null ? networks[i].ssid : "Hidden Network"
                    Networks += "*" + SSID + "*" + "  👇\n" + "`Security` 👉 _" + networks[i].security + "_\n`Mac` 👉 _" + networks[i].mac + "_\n`Channel` 👉 _" + networks[i].channel + "_\n`Siganal` 👉 _" + networks[i].signal_level + "_\n\n_*-*-*-*-*_\n\n";
                }
                bot.sendMessage({
                    chat_id:$chat_id,
                    reply_to_message_id:$message_id,
                    parse_mode:"Markdown",
                    text:Networks
                })
            }
        });
    }
    else if (Authorized && text == "connect wifi") {
        bot.sendMessage({
            chat_id:$chat_id,
            reply_to_message_id:$message_id,
            text:"Connect WiFi 👇\nSend /connect_wifi \n<SSID>\n<Password> \nto connect\nExample : /connect_wifi\nPCC\n123456"
        })
    }
    else if (Authorized && !text.indexOf("/connect_wifi")) {
        wifi.init({
            iface : null
        });
        var Data = text.replace("/connect_wifi","").trim().split("\n"),
            $SSID = Data[0],
            $Password = Data[1];
        wifi.connect({ ssid : $SSID, password : $Password}, err => {
            if (err) {
                bot.sendMessage({
                    chat_id:$chat_id,
                    reply_to_message_id:$message_id,
                    text:"Can't Connect :(\n"+err
                });
            }
            else {
                bot.sendMessage({
                    chat_id:$chat_id,
                    reply_to_message_id:$message_id,
                    text:"Connected :)"
                })
            }
        });
    }
    else if (Authorized && text == "get current wifi") {
        wifi.init({
            iface : null
        });
        wifi.getCurrentConnections( (err, currentConnections) => {
            if (err) {
                bot.sendMessage({
                    chat_id:$chat_id,
                    reply_to_message_id:$message_id,
                    text:"Can't get current connection :("
                })
            }
            else {
                var CC = "Current Connection(s) 👇\n\n";
                for(i=0;i<currentConnections.length;i++) {
                    var SSID = currentConnections[i].ssid != null ? currentConnections[i].ssid : "Hidden Network";
                    CC += "*" + SSID + "*" + "  👇\n" + "`Security` 👉 _" + currentConnections[i].security + "_\n`Mac` 👉 _" + currentConnections[i].mac + "_\n`Channel` 👉 _" + currentConnections[i].channel + "_\n`Siganal` 👉 _" + currentConnections[i].signal_level + "_\n\n_*-*-*-*-*_\n\n";
                }
                bot.sendMessage({
                    chat_id:$chat_id,
                    reply_to_message_id:$message_id,
                    parse_mode:"Markdown",
                    text:CC
                })
            }
            /*
            // you may have several connections
            [
                {
                    iface: '...', // network interface used for the connection, not available on macOS
                    ssid: '...',
                    bssid: '...',
                    mac: '...', // equals to bssid (for retrocompatibility)
                    channel: <number>,
                    frequency: <number>, // in MHz
                    signal_level: <number>, // in dB
                    security: '...' //
                    security_flags: '...' // encryption protocols (format currently depending of the OS)
                    mode: '...' // network mode like Infra (format currently depending of the OS)
                }
            ]
            */
        });
    }

    //Network
    else if (Authorized && text == "network") {
        var LocalIP = os.networkInterfaces()['Wi-Fi'][1].address || os.networkInterfaces()['eth0'][1].address,
        MAC = os.networkInterfaces()['Wi-Fi'][1].mac || os.networkInterfaces()['eth0'][1].mac,
        IP = "";

        var PubIPFileName = "PubIP" + Math.floor(Math.random() * (999 - 1 + 1)) + 1 + ".txt"
        var FileStream = fs.createWriteStream(PubIPFileName);
        var downloadConstructStream = http.get('http://github.piorra.ir/ghp/sh-sh-dev/pcc_bot/', function (res) {
            res.pipe(FileStream);
        });
        FileStream.on('finish', function () {
            fs.readFile(PubIPFileName, 'utf8', function(err, contents) {
                IP = contents
                bot.sendMessage({
                    chat_id:$chat_id,
                    reply_to_message_id:$message_id,
                    text:"Network 👇\nPublic IP : "+ IP + "\nLocal IP : " + LocalIP + "\nMac : " + MAC
                })
                fs.unlink(PubIPFileName,err => {
                    if (err) console.log(err)
                });
            }); 
        })
    }

    //OS
    else if (Authorized && text == "os") {
        var Type = os.type(),
        Platform = os.platform(),
        Release = os.release(),
        Arch = os.arch(),
        Homedir = os.homedir(),
        Tmpdir = os.tmpdir();

        bot.sendMessage({
            chat_id:$chat_id,
            reply_to_message_id:$message_id,
            text:"OS 👇 \nType : " + Type +"\nPlatform : " + Platform + "\nRelease : " + Release + "\nArch : " + Arch + "\nHomedir : " + Homedir +"\nTempdir : " + Tmpdir
        })
    }

    //CPU
    else if (Authorized && text == "cpu") {
        var CPU = os.cpus(),
        CPUS = "CPU 👇\n",
        MAS = null;

        CPUS += "(Total " + CPU.length + " cores)\n"

        for(i=0;i<CPU.length;i++) {
            CPUS += CPU[i].model + " 👉 " +CPU[i].speed + "\n"
        }

        bot.sendMessage({
            chat_id:$chat_id,
            reply_to_message_id:$message_id,
            text:CPUS
        })
    }

    //Storage
    else if (Authorized && text == "storage") {
        //This part has a little bug :|
        function formatBytes(a,b){if(0==a)return"0 Bytes";var c=1024,d=b||2,e=["Bytes","KB","MB","GB","TB","PB","EB","ZB","YB"],f=Math.floor(Math.log(a)/Math.log(c));return parseFloat((a/Math.pow(c,f)).toFixed(d))+" "+e[f]}
        if (os.type() == "Windows_NT") {
            //Windows
            const diskspace = require('diskspace');

            var Alphabet = ['A','B','C','D','E','F','G','H','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'],
            StorageMessage = "",
            Disk = null;

            for(i=0 ; i < 25 ; i++) {
                // console.log(i + " : " + Alphabet[i])
                Disk = Alphabet[i];

                diskspace.check(Disk, function (err, result) {

                    if (result.status == "READY") {

                        result.total = formatBytes(result.total);
                        result.free = formatBytes(result.free);

                        StorageMessage = Disk + "  👉  Total : " + result.total + " | Free : " + result.free + "\n";
                        
                        bot.sendMessage({
                            chat_id:$chat_id,
                            text:StorageMessage
                        })

                    }
                });
            }

            // bot.sendMessage({
            //     chat_id:$chat_id,
            //     reply_to_message_id:$message_id,
            //     text:"Storage 👇\n" + StorageMessage
            // })
        }
        else {
            //Another Operating systems !
            // https://www.npmjs.com/package/nodejs-disks
        }
    }

    //Screenshot
    else if (Authorized && text == "screenshot") {
        var ScreenshotFileName = "Screenshot" + Math.floor(Math.random() * (999 - 1 + 1)) + 1 + ".png"
        screenshot(ScreenshotFileName, function(error, complete) {
            if(error)
                bot.sendMessage({
                    chat_id:$chat_id,
                    text:"Can't take Screenshot :("
                })
            else
                bot.sendPhoto({
                    chat_id:$chat_id,
                    caption:"Screenshot ☝️",
                    reply_to_message_id:$message_id,
                    files: {
                        photo: ScreenshotFileName
                    }
                },() => {
                    fs.unlink(ScreenshotFileName,err => {
                        if (err) console.log(err)
                    })
                })
        });
    }

    //Cancel
    else if (Authorized && text == "cancel" || Authorized && text == "keyboard" || Authorized && text == "🏠") {
        bot.sendMessage({
            chat_id:$chat_id,
            text:"OK !",
            reply_to_message_id:$message_id,
            reply_markup:MainKeyboard
        })
    }

    //Wrong Command
    else if (Authorized) {
        bot.sendMessage({
            chat_id:$chat_id,
            reply_to_message_id:$message_id,
            text:"Wrong Command !"
        })
    }

    //Unauthorized
    else {
        bot.sendMessage({
            chat_id:$chat_id,
            reply_to_message_id:$message_id,
            text:"Unauthorized"
        })
    }
})

console.log('Starting Bot...')

bot.start();

console.log('Bot started.')

usb.on('attach',(device) => {

    console.log('USB Attached')

    for(i=0;i<Admins.length;i++) {
        bot.sendMessage({
            chat_id:Admins[i],
            text:"A new USB Attached !"
        })
    }
})

usb.on('detach',(device) => {

    console.log('USB Detached')

    for(i=0;i<Admins.length;i++) {
        bot.sendMessage({
            chat_id:Admins[i],
            text:"A USB Detached !"
        })
    }
})