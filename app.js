require("dotenv").config();
const http = require("http").createServer();

const { Server } = require("socket.io");
const io = new Server(http, { cors: { origin: "*" } });

io.on("connection", (socket) => {
	socket.on("message", (message) => {
		socket.emit("error", message);
	});

	socket.on("create-room", (roomId) => {
		if (socket.rooms.size >= 2) return;
		socket.join(roomId);
	});

	socket.on("join-room", (roomId, callback) => {
		if (socket.rooms.size >= 2) return;

		let room = io.sockets.adapter.rooms.get(roomId);
		if (!room) {
			callback({ success: false, message: "room does not exist" });
		} else if (room.size >= 4) {
			callback({ success: false, message: "room full" });
		} else {
			socket.join(roomId);
			socket.broadcast.to(roomId).emit("new-user", socket.id);
			callback({ success: true, users: [...room.values()] });
		}
	});

	socket.on("sdp-offer", ([guestId, offer]) => {
		socket.to(guestId).emit("sdp-offer", [socket.id, offer]);
	});

	socket.on("sdp-answer", ([hostId, answer]) => {
		socket.to(hostId).emit("sdp-answer", [socket.id, answer]);
	});
});

http.listen(process.env || 4000, () => {
	console.log(`server started on port ${process.env.PORT || 4000}`);
});
