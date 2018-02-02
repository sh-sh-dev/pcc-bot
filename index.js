const TOKEN = '521688741:AAEBliosAna2GPQ12O2bTkMj_AkChmC-9Q0';

const BOT = require('node-telegram-bot');
const fs = require('fs');
const os = require('os');
const in_array = require('in_array');
const powerOff = require('power-off')
const sleepMode = require('sleep-mode')
const screenshot = require('desktop-screenshot');

const Admins = [
    342727359
]
const MainKeyboard = {
    keyboard : [
        [
            "Shutdown",
            "Sleep"
        ]
        ,
        [
            "Network"
            ,
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

    //Network
    else if (Authorized && text == "network") {
        var LocalIP = os.networkInterfaces()['Wi-Fi'][1].address,
        MAC = os.networkInterfaces()['Wi-Fi'][1].mac;
        bot.sendMessage({
            chat_id:$chat_id,
            reply_to_message_id:$message_id,
            text:"Network 👇\nIP : " + LocalIP + "\nMac : " + MAC
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

    //Screenshot
    else if (Authorized && text == "screenshot") {
        screenshot("screenshot.png", function(error, complete) {
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
                        photo: 'screenshot.png'
                    }
                },() => {
                    fs.unlink("screenshot.png")
                })
        });
    }
    
    //Cancel
    else if (Authorized && text == "cancel") {
        bot.sendMessage({
            chat_id:$chat_id,
            text:"OK !",
            reply_to_message_id:$message_id,
            reply_markup:MainKeyboard
            // {
                // remove_keyboard:true
            // }
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