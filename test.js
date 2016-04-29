var assert = require('assert');
var ws = require('ws');
var wstest = require('./');

var PORT = 9783;
var URL = 'ws://localhost:'+PORT;

// setup a simple echo server
var server = new ws.Server({
	port: PORT
});
server.on('connection', function(conn) {
	conn.on('message', function(d) {
		this.send(d);
	});
});

describe('wstest', function() {
	describe('#waitForOpen()', function() {
		it('should fire after the socket opens', function(done) {
			var st = new wstest(new ws(URL));
			st.waitForOpen(function() {
				assert.equal(server.clients.length, 1);
				done();
			});
		});
		it('should fire after the socket has already opened', function(done) {
			var s = new ws(URL);
			var st = new wstest(s);
			st.waitForOpen(function() {
				st.waitForOpen(done);
			});
		});
	});
	describe('#get()', function() {
		it('should return the socket', function() {
			var s = new ws(URL);
			var st = new wstest(s);
			assert.equal(s, st.get());
		});
	});
	describe('#waitForMessage()', function() {
		it('should fire after the message is sent', function(done) {
			var st = new wstest(new ws(URL));
			var MSG = "test message";
			var sent = false;
			st.waitForOpen(function() {
				st.waitForMessage(MSG, function() {
					assert(sent);
					done();
				});
				st.get().send(MSG);
				sent = true;
			});
		});
		it('should receive any message', function(done) {
			var st = new wstest(new ws(URL));
			var MSG = "mEssAgE";
			st.waitForOpen(function() {
				st.waitForMessage(function(msg) {
					assert.equal(msg, MSG);
					done();
				});
				st.get().send(MSG);
			});
		});
	});
});
