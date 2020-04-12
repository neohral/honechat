/**
 * Socket
 */
let fs = require("fs");
let WebSocketServer = require("ws").Server,
  http = require("http"),
  express = require("express"),
  app = express();
app.use(express.static(__dirname + "/"));
let server = http.createServer(app);
let wss = new WebSocketServer({ server: server });

/**
 * User
 */
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
/**
 * Message
 */
class Message {
  constructor(sender, room, title, body) {
    this.sender = sender;
    this.room = room;
    this.title = title;
    this.body = body;
  }
}
/**
 * Storage
 */
class Storage {
  constructor(room, id, obj) {
    this.room = room;
    this.id = id;
    this.obj = obj;
  }
}
let storages = [];
//receiveStrage
wss.on("connection", function (ws) {
  ws.on("message", function (message) {
    let json = JSON.parse(message);
    if (json.title == "updateStorage") {
      let body = json.body;
      switch (body.type) {
        case "push":
          pushStorage(body.room, body.id, body.obj);
          break;
        case "remove":
          removeStorage(body.room, body.id, body.num);
          break;
        case "update":
          updateStorage(body.room, body.id, body.obj);
          break;
      }
    }
  });
});
function getStorage(room, id) {
  let storage = null;
  storages.forEach(function (con, i) {
    if (con.id == id && con.room == room) {
      storage = con;
    }
  });
  if (storage == null) {
    storage = new Storage(room, id, []);
    storages.push(storage);
  }
  return storage.obj;
}
let sendStorage = (type, room, id, obj, num) => {
  let body = {
    room,
    id,
    obj,
    num,
  };
  let mes = new Message("server", room, `updateStrage_${type}`, body);
  broadcast(JSON.stringify(mes));
};
let pushStorage = (room, id, obj) => {
  getStorage(room, id).push(obj);
  sendStorage("push", room, id, obj);
};
let removeStorage = (room, id, num) => {
  let delObj = getStorage(room, id).obj[num];
  getStorage(room, id).splice(num, 1);
  sendStorage("remove", room, id, delObj, num);
};
let updateStorage = (room, id, obj) => {
  getStorage(room, id) = obj;
  sendStorage("update", room, id, obj);
};

let id = 0;
let users = [];
//接続時
wss.on("connection", function (ws) {
  //login処理
  ws.on("close", function () {
    //logout処理
    let logoutuser = null;
    users = users.filter(function (user, i) {
      if (user.ws === ws) {
        logoutuser = JSON.parse(JSON.stringify(user));
        return false;
      }
      return true;
    });
    logoutUser(logoutuser);
    console.log(`LOGOUT ${logoutuser.id} FROM ${logoutuser.room}`);
  });
  ws.on("message", function (message) {
    let isAbleBroadcast = true;
    let json = JSON.parse(message);
    let jsonMes = new Message(json.sender, json.room, json.title, json.body);
    switch (jsonMes.title) {
      case "loginReqest":
        isAbleBroadcast = false;
        if (getUserByWs(ws) == null) {
          //新規ユーザ
          id++;
          let userId = ("0000000000" + id).slice(-5);
          let user = new User(
            ws,
            userId,
            jsonMes.body.name,
            jsonMes.room,
            jsonMes.body.message
          );
          users.push(user);
          loginUser(user);
          console.log(`LOGIN  ${userId} TO ${jsonMes.room}`);
        } else {
          let user = getUserByWs(ws);
          let logoutuser = JSON.parse(JSON.stringify(user));
          if (user.room != jsonMes.room) {
            //部屋変更
            //ログアウト
            user.room = jsonMes.room;
            user.name = jsonMes.body.name;
            logoutUser(logoutuser);
            console.log(`LOGOUT ${logoutuser.id} TO ${logoutuser.room}`);
            //ログイン
            loginUser(user);
            console.log(`LOGIN  ${user.id} TO ${jsonMes.room}`);
          }
        }
        break;
      case "message":
        let body = { message: json.body.message, name: json.body.name };
        pushStorage(jsonMes.room, "message", body);
        break;
    }
    if (isAbleBroadcast) {
      broadcast(message, jsonMes.room);
    }
  });
});
/**
 *
 * @param {*} type - host:ホスト変更,login:追加,logout,削除
 * @param {*} room
 * @param {*} user
 */
let updateUser = (type, room, user) => {
  let body = {
    type,
    user,
  };
  let mes = new Message("server", user.room, "updateUser", body);
  broadcast(JSON.stringify(mes), room);
};
/**
 * loginUser
 * usersに追加済み
 * @param {User} user
 */
let loginUser = (user) => {
  //loginUserに対して
  let body = {
    user,
    users: getUserByRoom(user.room).filter(function (alluser, i) {
      return alluser.ws === user.ws ? false : true;
    }),
    storages: JSON.stringify(storages),
  };
  console.log(JSON.stringify(storages));
  let welcome = new Message("server", user.room, "welcome", body);
  user.ws.send(JSON.stringify(welcome));
  if (getUserByRoom(user.room).length == 1) {
    updateHost(user);
  }
  //broadcast
  updateUser("login", user.room, user);
};
/**
 * logoutUser
 * usersから削除済み
 * @param {User} user
 */
let logoutUser = (user) => {
  if (user.isHost) {
    //hostいなくなった
    if (getUserByRoom(user.room).length != 0) {
      updateHost(getUserByRoom(user.room)[0]);
    }
  }
  updateUser("logout", user.room, user);
};
/**
 * updateHost
 * @param {User} user
 */
let updateHost = (user) => {
  user.isHost = true;
  updateUser("host", user.room, user);
};

/**
 * WebSocketからuserを返す。
 * @param {WebSocket} ws
 */
let getUserByWs = (ws) => {
  result = null;
  users.filter((user, i) => {
    if (user.ws === ws) {
      result = user;
    }
  });
  return result;
};
/**
 * roomからusersをつくる
 * @param {string} room
 */
let getUserByRoom = (room) => {
  result = [];
  users.filter((user, i) => {
    if (user.room === room) {
      result.push(user);
    }
  });
  return result;
};
/**
 * 受信したメッセージを返す。
 * @param {string} message - json文字列
 * @param {string} room
 */
function broadcast(message, room) {
  users.forEach(function (con, i) {
    if (con.ws.readyState == 1 && con.room == room) {
      con.ws.send(message);
    }
  });
}
server.listen(3000);
