const Messages = require("../models/dbMessages")


module.exports = function (params) {
  const api = params.api;

  api.post("/messages/new" , async (req,res) => {
      const dbmessage  = req.body

      Messages.create(dbmessage,(err,data) => {
          if(err){
            res.status(500).send(err);
          }else{
            res.status(200).send(data);
          }
      })

  })

  api.get("/messages/sync" , async (req,res) => {

    Messages.find({},(err,data) => {
        if(err){
          res.status(500).send(err);
        }else{
          res.status(201).send(data);
        }
    })

})


  
};