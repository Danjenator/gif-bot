'use strict';

const giphy = require("giphy-api")();
const Twit = require("twit");
const T = new Twit(require("./twit.config.js"))

module.exports.gifBot = (event, context, callback) => {

   callback(null, { message: 'Go Serverless v1.0! Your function executed successfully!', event });

   T.get("statuses/mentions_timeline", {count:200, }, (err, data, response)=> {

    //  console.log("err", err);
      console.log("data", data);
    //  console.log("response", response);

      


         // Search with options using promise
    // giphy.search('Robot! ').then( (res) => {
    //      console.log("res", res);
    // });


   });


   console.log("success!");
};
