const util = require("util");               // utilities to turn lookup into promise
const axios = require("axios");             // async/await http requests to lookup current ip
const dns = require("dns");                 // dns module to lookup existing ip
const lookup = util.promisify(dns.lookup);  // turn lookup function into a promise function to await

// create synthetic Dynamic DNS record within domains.google.com => Your domain => DNS => Synthetic Records
let username = "USERNAME";  // username avilable within domains.google.com => Your domain => DNS => Synthetic Records and then by clicking expand arrow
let password = "PASSWORD";  // password avilable within domains.google.com => Your domain => DNS => Synthetic Records and then by clicking expand arrow
let host = "HOSTNAME";      // create registered host
let ip_service = "https://domains.google.com/checkip";          //Service which provides requestors IP address
let google_update = `https://domains.google.com/nic/update`;    //Service which allows Dynamic DNS updates
let offline = "no"  //Option which allows you to turn off specific host DDNS : "yes","no"

async function SyncIP(){ //async function definition to avoid "callback hell"
    let current_host_ip = (await axios.get(ip_service)).data;   // Get current host IP
    let existing_host_ip = "0.0.0.0"; //starting host ip when host address DNE
    try{
        existing_host_ip = (await lookup(host)).address;        // Get existing host IP
    }
    catch(exception){
        console.log("No A record exists, perform IP synchronization to fill DDNS record"); // No existing host ip map exists - continue to update
    }
    if(current_host_ip != existing_host_ip){ //Check current host IP matches existing host IP
        console.log("Perform IP Synchronization");
        try{
            //Synchronize current IP with host IP
            let response = (await axios.post(google_update+`?hostname=${host}&offline=${offline}&myip=${current_host_ip}`,{
                username:username,
                password:password
            },{
                auth: { //credentials placed within Auth to avoid sending through HTTP URL header
                    username: username,
                    password: password
                }
            }));
            console.log(`IP Synchronization Successful - ${existing_host_ip} => ${current_host_ip}`,response);
        }
        catch(exception){
            console.error("IP Synchronization Failed - Encountered Error",Exception)
        }
    }
    else{
        console.log("IP Already Synchronized");
    }
}
SyncIP();
