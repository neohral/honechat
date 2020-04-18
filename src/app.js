import { user } from "./userClient";
import { ws, Message } from "./websoket";
import {
  getStorage,
  pushStorage,
  removeStorage,
  updateStorage,
  storages,
  storageEv,
} from "./storage";
let userKey = getUniqueStr();
//document.getElementById("name").value = userKey;
/**
 * websoketのreceive部分
 */
let rnd;
ws.addEventListener("message", (event) => {
  let json = JSON.parse(event.data);
  console.log(json.title);
  switch (json.title) {
    case "message":
      document.getElementById(
        "messages"
      ).innerHTML += `<div>${json.body.name}:${json.body.message}</div>`;
      scroll();
      break;
    case "voteStart":
      document.getElementById("messages").innerHTML += `<div>ping開始</div>`;
      scroll();
      rnd = Math.random() * 10000;
      setTimeout(votedone, rnd);
      break;
    case "voteEnd":
      document.getElementById("messages").innerHTML += `<div>ping終了</div>`;
      scroll();
      break;
  }
});
let votedone = () => {
  let body = {
    message: `ping(嘘)：${rnd}`,
    name: user.name,
  };
  let data = new Message(user.id, user.room, `message`, body);
  ws.send(data.getJson());
  let mes = new Message(user.id, user.room, "voteDone", null);
  ws.send(mes.getJson());
};
/**
 * sendボタン押下
 * @param {*} event
 */
let send = (event) => {
  let body = {
    message: document.getElementById("msg").value,
    name: document.getElementById("name").value,
  };
  let data = new Message(
    user.id,
    document.getElementById("room").value,
    `message`,
    body
  );
  ws.send(data.getJson());
};
let sendBtn = document.getElementById("sendBtn");
sendBtn.addEventListener("click", send, false);

/**
 * joinボタン押下
 * @param {} event
 */
let join = (event) => {
  let body = {
    message: userKey,
    name: document.getElementById("name").value,
  };
  let data = new Message(
    -1,
    document.getElementById("room").value,
    `loginReqest`,
    body
  );
  ws.send(data.getJson());
};
let joinBtn = document.getElementById("joinBtn");
joinBtn.addEventListener("click", join, false);

let vote = (event) => {
  console.log(user.isHost);
  if (user.isHost) {
    let mes = new Message(user.id, user.room, "voteReq", null);
    ws.send(JSON.stringify(mes));
  }
};
let voteBtn = document.getElementById("voteBtn");
voteBtn.addEventListener("click", vote, false);
/**
 * ユニークキーの作成
 * https://qiita.com/coa00/items/679b0b5c7c468698d53f
 * @param {Integer} myStrong
 */
function getUniqueStr(myStrong) {
  let strong = 1000;
  if (myStrong) strong = myStrong;
  return (
    new Date().getTime().toString(16) +
    Math.floor(strong * Math.random()).toString(16)
  );
}
storageEv.addEventListener(
  "welcome",
  (event) => {
    console.log(event);
    getStorage(user.room, "message").forEach(function (con, i) {
      document.getElementById(
        "messages"
      ).innerHTML += `<div>${con.name}:${con.message}</div>`;
    });
    document.getElementById(
      "messages"
    ).innerHTML += `<div>------------過去ログ---------------</div>`;
  },
  false
);

let scroll = () => {
  let obj = document.getElementById("messages");
  obj.scrollTop = obj.scrollHeight;
  console.log(obj.scrollHeight);
};
