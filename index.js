var WSWrapper = function(ws) {
	var self = this;
	this.ws = ws;
	this.callbacks = {};
	var on = (ws.on || ws.addEventListener).bind(ws);
	on("message", this.handleMessage.bind(this));
	on("open", function() {
		if(self.logMessages) {
			console.log("opened");
		}
		self.open = true;
		if("open" in self.callbacks) {
			for(var i = 0; i < self.callbacks.open.length; i++) {
				var callback = self.callbacks.open[i];
				callback();
			}
			delete self.callbacks.open;
		}
	});
};
WSWrapper.prototype.handleMessage = function(d) {
	var msg = d;
	if(this.logMessages) {
		console.log("RECEIVED: "+msg);
	}
	if(typeof this.ignored === "function" && this.ignored(msg)) {
		return;
	}
	var success = 0;
	if("message" in this.callbacks) {
		var msgCallbacks = this.callbacks.message[msg];
		if(!msgCallbacks) msgCallbacks = [];
		var nullCallbacks = this.callbacks.message[null];
		if(!nullCallbacks) nullCallbacks = [];
		var msgLen = msgCallbacks.length;
		var nullLen = nullCallbacks.length;
		for(var i = 0; i < msgLen; i++) {
			msgCallbacks[0](msg);
			msgCallbacks.splice(0,1);
			success++;
		}
		for(var i = 0; i < nullLen; i++) {
			nullCallbacks[0](msg);
			nullCallbacks.splice(0,1);
			success++;
		}
	}
	if(success < 1) {
		console.error("No callback declared for "+msg);
		if(d.dieOnUnrecognized) {
			process.exit(1);
		}
	}
};
WSWrapper.prototype.waitForMessage = function(msg, callback) {
	if(arguments.length == 1) {
		callback = msg;
		msg = null;
	}
	if(!("message" in this.callbacks)) this.callbacks.message = {};
	if(!(msg in this.callbacks.message)) this.callbacks.message[msg] = [];
	this.callbacks.message[msg].push(callback);
};
WSWrapper.prototype.waitForOpen = function(callback) {
	if(this.open) {
		callback();
	}
	else {
		if(!("open" in this.callbacks)) this.callbacks.open = [];
		this.callbacks.open.push(callback);
	}
};
WSWrapper.prototype.get = function() {
	return this.ws;
};
module.exports = WSWrapper;
