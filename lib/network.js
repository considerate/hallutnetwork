var net = require('net');
var co = require('co');
var wait = require('co-wait');
var thunkify = require('thunkify');

var write = function*(socket, data, encoding) {
	var thunk = thunkify(net.Socket.write);
	yield thunk.call(socket, data, encoding);
};


// Data types.
exports.RH_DATA = 0;
exports.T_DATA  = 1;

// Events
function onConnect() {
	if('function' === typeof this.connect) {
		this.connect();
	}
}

/**
 * data is of type buffer.
 */
function onData(data) {
	var obj = JSON.parse(data.toString());
	// When data is sent here from server.
	if('function' === typeof this.data) {
		this.data(obj.type, obj.data);
	}
}

function onEnd() {
	// When server sends a FIN.
	if('function' === typeof this.close) {
		this.close();
	}
	close();
}
// other events: drain, close, timeout
// end Events


/** 
 * options = {
 *	port: ,
 *	host: ,
 *	localAddress: ,
 * }
 *
 * Returns true if connection was opened, else false.
 */


function writeJSON(type, data) {
	// Buffering is handled by write();
	// Returns false if data was buffered in memory, else true.
	var message = JSON.stringify({
		type: type,
		data: data,		
	});
	write(this.socket, message);
}

exports.open = function(options, listeners) {
	var socket = net.createConnection(options);
	return createClient(socket, listeners);
};

function createClient(socket, listeners) {
	var context = listeners || {};
	context.socket = socket;
	context.isOpen = true;
	context.write = writeJSON;
	socket.on('data', onData.bind(context));
	socket.on('end', onEnd.bind(context));
	return context;
}

exports.createServer = function(listeners) {
	var context = {};
	context.clients = [];
	var server = net.createServer(function(socket) {
		var client = createClient(socket, listeners);
		client.server = context;
		context.clients.push(client);
	});
	context.server = server;
	context.listen = server.listen;
	return context;
};


/**
 * Closes the connection (sends a FIN).
 * Note that half-open connections are not used.
 */
exports.close = function() {
	this.socket.end();
	connectionIsOpen = false;
};

/**
 * Returns true if connection is open, else false.
 */
exports.isOpen = function() {
	return this.isOpen;
};
