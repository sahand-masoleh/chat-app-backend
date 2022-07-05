require("dotenv").config();
const http = require("http").createServer();

const { Server } = require("socket.io");
const io = new Server(http, { cors: { origin: "*" } });

io.on("connection", (socket) => {
	socket.on("message", (message) => {
		socket.emit("message", message);
	});

	socket.on("create-room", (roomId) => {
		socket.join(roomId);
	});

	socket.on("join-room", (roomId, callback) => {
		if (!io.sockets.adapter.rooms.get(roomId)) {
			callback({ success: false, message: "room does not exist" });
		} else {
			callback({ success: true });
			socket.join(roomId);
			let hostId = [...io.sockets.adapter.rooms.get(roomId).values()][0];
			socket.to(hostId).emit("new-user", socket.id);
		}
	});

	socket.on("sdp-offer", ([guestId, offer]) => {
		socket.to(guestId).emit("sdp-offer", [socket.id, offer]);
	});

	socket.on("sdp-answer", ([hostId, answer]) => {
		socket.to(hostId).emit("sdp-answer", answer);
	});
});

http.listen(process.env || 4000, () => {
	console.log(`server started on port ${process.env.PORT || 4000}`);
});
