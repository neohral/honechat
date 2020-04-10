let host = window.document.location.host.replace(/:.*/, "");
let ws = new WebSocket("ws://" + host + ":3000");
class Message {
  constructor(sender, room, title, body) {
    this.sender = sender;
    this.room = room;
    this.title = title;
    this.body = body;
  }
  getJson() {
    return JSON.stringify({
      sender: this.sender,
      room: this.room,
      title: this.title,
      body: this.body,
    });
  }
}
export { ws, Message };
