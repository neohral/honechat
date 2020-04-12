import { ws } from "./websoket";
class User {
  constructor(ws, id, name, room, key) {
    this.key = key;
    this.ws = ws;
    this.id = id;
    this.name = name;
    this.room = room;
    this.vote = false;
    this.isHost = false;
  }
}
let user;
let users;
ws.addEventListener("message", (event) => {
  let json = JSON.parse(event.data);
  switch (json.title) {
    case "welcome":
      user = new User(
        json.body.user.ws,
        json.body.user.id,
        json.body.user.name,
        json.body.user.room,
        json.body.user.key
      );
      users = [];
      json.body.users.filter(function (user, i) {
        let pushUser = new User(
          user.ws,
          user.id,
          user.name,
          user.room,
          user.key
        );
        pushUser.isHost = user.isHost;
        pushUser.vote = user.vote;
        users.push(pushUser);
      });
      document.getElementById("messages").innerHTML = "";
      break;
    case "updateUser":
      console.log(json.body);
      if (user != null) {
        switch (json.body.type) {
          case "login":
            users.push(json.body.user);
            addLog(json.body.type, json.body.user);
            break;
          case "logout":
            users = users.filter(function (user, i) {
              return user.id === json.body.user.id ? false : true;
            });
            addLog(json.body.type, json.body.user);
            break;
          case "host":
            users.filter(function (hostuser, i) {
              if (hostuser.id === json.body.user.id) {
                hostuser.isHost = true;
              }
            });
            if (user.id == json.body.user.id) {
              user.isHost = true;
            }
            addLog(json.body.type, json.body.user);
        }
      }
      document.getElementById("users").innerHTML = "";
      users.filter(function (user, i) {
        let icon = "";
        if (user.isHost) {
          icon = "👑";
        }
        document.getElementById(
          "users"
        ).innerHTML += `<div>${user.name}${icon}</div>`;
      });
      break;
  }
});
/**
 * ログメッセージのenum的な
 */
let typeMessage = {
  login: "にログインしました。",
  logout: "からログアウトしました。",
  host: "のホストになりました。",
};
/**
 * ログを追加する(messageに)
 * @param {*} type
 * @param {*} name
 * @param {*} room
 */
let addLog = (type, user) => {
  let mesDiv = document.getElementById("messages");
  mesDiv.innerHTML += `<div>${user.name}が「${user.room}」${typeMessage[type]}</div>`;
};
export { user };
