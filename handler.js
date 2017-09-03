'use strict';

const giphy = require("giphy-api")();
const Twit = require("twit");
const T = new Twit(require("./twit.config.js"));
var AWS = require("aws-sdk");
AWS.config.update({region: "us-east-1"});
const dynamodb = new AWS.DynamoDB({apiVersion: "2012-08-10"});
//count Twitter MaxCount
const MAX_COUNT = 200;
const LAST_ID_K = "Last ID";

//getLastTwitterIndex = ()=>{
//     var params = {
//     "Key": {
//       "id": {
//         "b": twitterHandle
//       }
//     },
//     "TableName": "TwitterSeeds",
//     "ConsistentRead": true,
//     "ProjectionExpression": "nextCursor"
//     };
// };

function saveTwitterId(lastId){

 var params = {
  ExpressionAttributeNames: {
   "#LI": "last_id"
  }, 
  ExpressionAttributeValues: {
   ":li": {
     S: lastId
    }
  }, 
  Key: {
   "KEY": {
     S: LAST_ID_K
    }, 
   "KEY_BINARY": {
     B: LAST_ID_K
    }
  }, 
  ReturnValues: "ALL_NEW", 
  TableName: "GifBot", 
  UpdateExpression: "SET #LI = :li"
 };

  postToDynamoDB(params).
  then( (res) => {
    console.log("res for user", res);
  });
}

function postToDynamoDB(params){
  return new Promise((resolve, reject) => {
    dynamodb.updateItem(params, (err, data) => {
      if (err){ 
        console.log("These params were rejected: ", params);
        console.log("err: ", err);
        reject(err);
      } else {
        resolve(data);
      }                
    });
  });
};

function createReply(status){
  return new Promise((resolve, reject)=> {
    var subject = status.text.replace("@The_Gif_Bot","").trim();
    // Search with options using promise
    giphy.search(subject).then( (res) => {
      var user = status.user.screen_name;
      var reply = {
        in_reply_to_status_id: status.id_str
      };
      //var theGif = res.data[Math.floor(Math.random() * res.data.length)].embed_url;
      //console.log("res.data: ", res.data);
      var theGif = res.data[Math.floor(Math.random() * res.data.length)].bitly_gif_url;

      if(theGif) {
        reply.status = "Sure @" + user + "! Here's your gif about " + subject + "! " + theGif;
        resolve(reply);
      } else {
        giphy.search("Sad").then((res) => {
          //theGif = res.data[Math.floor(Math.random() * res.data.length)].embed_url;
          theGif = res.data[Math.floor(Math.random() * res.data.length)].bitly_gif_url;
          reply.status = "Sorry @" + user + " I can't find the gif you want :( " + theGif;
          //TODO save fail to db
          resolve(reply);
        });
      }
    });
  });
};

module.exports.gifBot = (event, context, callback) => {

   callback(null, { message: 'Go Serverless v1.0! Your function executed successfully!', event });

   T.get("statuses/mentions_timeline", {since_id: 901522912653574144, count: MAX_COUNT}, (err0, data0, res0)=> {
      if(err0){
        console.log("err0: ", err0);
        //TODO add error handling to deliver sad panda gif
      } else {

        console.log("Data0: ", data0);
        console.log("res0", res0);

        //saveTwitterId(data0[data0.length - 1].id_str);

        // for (let mention of data0) {
        //   createReply(mention).then((res1, rej)=>{
        //     //console.log("res1: ", res1);
        //     if(rej) {
        //       //console.log("rej: ", rej);
        //     } else {
        //       T.post("statuses/update", res1, (err1, data1, res2) => {
        //         if(err1) {
        //           //console.log("err1", err1);
        //           //TODO add error handling to deliver sad panda gif
        //         }
        //         //console.log("data1", data1);
        //         //console.log("res2", res2);

        //       });
        //     }
        //   });
        // }
      }
   });
   console.log("success!");
};
