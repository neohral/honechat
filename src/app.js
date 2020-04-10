import { user, receive } from "./userClient";
import { ws, Message } from "./websoket";

let userKey = getUniqueStr();
document.getElementById("name").value = userKey;
/**
 * websoketのreceive部分
 */
ws.addEventListener("message", (event) => {
  let json = JSON.parse(event.data);
  console.log(json.title);
  switch (json.title) {
    case "message":
      document.getElementById(
        "messages"
      ).innerHTML += `<div>${json.body.name}:${json.body.message}</div>`;
      break;
  }
});
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
    -1,
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
