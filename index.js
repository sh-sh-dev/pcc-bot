const TOKEN = '521688741:AAEBliosAna2GPQ12O2bTkMj_AkChmC-9Q0';

const fs = require('fs');
const os = require('os');
const usb = require('usb');
const http = require("http");
const cmd = require('node-cmd');
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
            "Network"
            ,
            "OS"
        ]
        ,
        [
            "CPU"
            //, "Storage"
        ]
        ,
        [
            "Screenshot"
            ,
            // "GPS",
            "USB"
        ]
    ]
}

var bot = new BOT({
  token: TOKEN
})
.on('message', function (message) {
    var $chat_id = message.chat.id,
    $message_id = message.message_id,
    text = message.text.toLowerCase(),
    Authorized = false;

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
            text:"Send /rcommand <command> to run\nExample : /rcommand php -v"
        })
    }
    else if (!text.indexOf("/rcommand")) {
        var Command = text.replace("/rcommand","")
        cmd.get(Command,(err,data,stderr) => {
            bot.sendMessage({
                chat_id:$chat_id,
                reply_to_message_id:$message_id,
                text:"/rcommand 👇\n" + err || data
            })
        })
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

    //USB
    else if (Authorized && text == "usb") {
        var USB = usb.getDeviceList() , U = "";

        for (i=0;i<USB.length;i++) {
            U += USB[i].deviceDescriptor.bMaxPacketSize0 + "\n"
        }

        bot.sendMessage({
            chat_id:$chat_id,
            text:"USB : \n" + U
        })
    }

    //Cancel
    else if (Authorized && text == "cancel" || Authorized && text == "keyboard") {
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
.start();

usb.on('attach',(device) => {
    for(i=0;i<Admins.length;i++) {
        bot.sendMessage({
            chat_id:Admins[i],
            text:"A new USB Attached !"
        })
    }
})

usb.on('detach',(device) => {
    for(i=0;i<Admins.length;i++) {
        bot.sendMessage({
            chat_id:Admins[i],
            text:"A USB Deatached !"
        })
    }
})