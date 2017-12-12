const stitch = require("mongodb-stitch")
const client = new stitch.StitchClient('trial-awkdu');
const db = client.service('mongodb', 'mongodb-atlas').db('my-first-trial');
client.login().then(() =>
  db.collection('trial').updateOne({ owner_id: client.authedId() }, { $set: { number: 42 } }, { upsert: true })
).then(() =>
  db.collection('trial').find({ owner_id: client.authedId() }).limit(100).execute()
  ).then(docs => {
    console.log("Found docs", docs)
    //console.log("[MongoDB Stitch] Connected to Stitch")
  }).catch(err => {
    console.error(err)
  });
