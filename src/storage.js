import { user } from "./userClient";
import { ws, send } from "./websoket";

//Storage
class Storage {
  constructor(room, id, obj) {
    this.id = id;
    this.room = room;
    this.obj = obj;
  }
}
let storages = [];
let storageEv = document.createElement("div");
function getStorage(room, id) {
  console.log(room, id);
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
  storages = JSON.parse(JSON.stringify(storages));
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
  sendStorage("push", room, id, obj);
};
let removeStorage = (room, id, num) => {
  sendStorage("remove", room, id, delObj, num);
};
let updateStorage = (room, id, obj) => {
  sendStorage("update", room, id, obj);
};
ws.addEventListener("message", () => {
  let json = JSON.parse(event.data);
  switch (json.title) {
    case "updateStorage":
      let body = json.body;
      switch (body.type) {
        case "push":
          getStorage(body.room, body.id).push(body.obj);
          break;
        case "remove":
          getStorage(body.room, body.id).splice(body.num, 1);
          break;
        case "update":
          getStorage(body.room, body.id).splice(0, null, body.obj);
          break;
      }
      break;
    case "welcome":
      storages = JSON.parse(json.body.storages);
      console.log(storages);
      storageEv.dispatchEvent(new CustomEvent("welcome", { room: json.room }));
      break;
  }
});
export {
  getStorage,
  pushStorage,
  removeStorage,
  updateStorage,
  storages,
  storageEv,
};
