const redis = require("redis");
const client = redis.createClient();

client.on("ready", function () {
  console.log("Connected to Redis server");
  // Do something with the client here, such as set a key-value pair
  client.set("name", "jessicca", function (error, result) {
    if (error) {
      console.error(error);
    } else {
      console.log(result);
    }
    // Close the connection after the operation is complete
    client.quit();
  });
});

client.on("error", function (error) {
  console.error(error);
});
