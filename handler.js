'use strict';

const giphy = require("giphy-api")();
const Twit = require("twit");
const T = new Twit(require("./twit.config.js"))

function createReply(status){

  return new Promise((resolve, reject)=> {

    var subject = status.text.replace("@The_Gif_Bot","");
    console.log("subject: ", subject);
    // Search with options using promise
     giphy.search(subject).then( (res) => {

         var user = status.user.screen_name;
         var reply = {
           in_reply_to_status_id: status.id_str
         };

         //var theGif = res.data[Math.floor(Math.random() * res.data.length)].embed_url;

         var theGif = res.data[Math.floor(Math.random() * res.data.length)].bitly_gif_url;

          console.log("theGif", theGif);
          if(theGif) {
            reply.status = "Sure @" + user + "! Here's your gif! " + theGif;
            console.log("reply", reply);
            resolve(reply);
          } else {
            giphy.search("Sad").then((res) => {
                //theGif = res.data[Math.floor(Math.random() * res.data.length)].embed_url;

                theGif = res.data[Math.floor(Math.random() * res.data.length)].bitly_gif_url;
                reply.status = "Sorry @" + user + " I can't find the gif you want :( " + theGif;
                console.log("reply", reply);
                resolve(reply);
            });
          }
     });
  });
};

module.exports.gifBot = (event, context, callback) => {

   callback(null, { message: 'Go Serverless v1.0! Your function executed successfully!', event });

   T.get("statuses/mentions_timeline", {count:200}, (err, data, res)=> {
      if(err){
        console.log("err: ", err);
        //TODO add error handling to deliver sad panda gif
      } else {
        for (let mention of data) {
          createReply(mention).then((res, rej)=>{
            console.log("res: ", res);
            if(rej) {
              console.log("rej: ", rej);
            } else {
              T.post("statuses/update", res, (err, data, res) => {
                console.log("err", err);
                console.log("data", data);
                console.log("res", res);
              });
            }
          });
        }
      }
   });
   console.log("success!");
};
