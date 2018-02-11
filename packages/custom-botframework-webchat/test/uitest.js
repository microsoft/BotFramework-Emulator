"use strict";
const commands = require('./commands_map');
const config = require('./mock_dl/server_config.json');
const Nightmare = require('nightmare');
require('nightmare-upload')(Nightmare);
require('nightmare-window-manager')(Nightmare)
const vo = require('vo');

Nightmare.prototype.do = function (doFn) {
	if (doFn) {
		doFn(this);
	}
	return this;
}

describe('nightmare UI tests', function () {
	const devices = config.widthTests;
	const keys = Object.keys(commands);

	this.timeout(devices.length * keys.length * 20000);

	it('Evaluates all UI widthTests for all commands_map file', function (done) {
		const host = "http://localhost:" + config.port;
		const params = {
			domain: host + "/mock"
		};
		const tab = "\t";
		const height = 768;
		const colors = {
			success: "\x1b[32m",
			failure: "\x1b[31m",
			device: "\x1b[36m%s\x1b[0m"
		};
		const nightmare = Nightmare({
			show: true,
			executionTimeout: 6000
		});

		function getUrl() {
			var paramArray = [{}, params].concat(Array.prototype.slice.call(arguments));
			var merged = Object.assign.apply(Object, paramArray);
			var pairs = [];
			for (var name in merged) {
				var value = merged[name];
				if (typeof value === 'object') {
					value = JSON.stringify(value);
				}
				pairs.push(`${name}=${encodeURIComponent(value)}`);
			}
			return host + '?' + pairs.join('&');
		}

		function resultToConsole(consoleLog, result) {
			console.log(result ? colors.success : colors.failure, `${tab}${tab}${consoleLog}${!!result}`);
		}

		function deviceToConsole(device, width) {
			console.log(colors.device, `${tab}${device} (width: ${width}px)`);
		}

		function* testOneCommand(testurl, cmd, width, consoleLog) {
			yield nightmare.windowManager()
				.goto(testurl)
				.viewport(width, height)
				.wait(2000)
				.type('.wc-textbox input', commands[cmd].alternateText || cmd)
				.click('.wc-send')
				.wait(3000)
				.do(function (nightmare) {
					if (commands[cmd].do) {
						try {
							commands[cmd].do.apply(this, arguments);
						} catch (err) {
							console.error(err);
							throw err;
						}
					}
				});

			let result = !commands[cmd].client || (yield nightmare.evaluate(commands[cmd].client));

			result &= !commands[cmd].evalOtherWindow || (yield commands[cmd].evalOtherWindow(nightmare));

			resultToConsole(consoleLog, result);
			return result;
		}

		//Testing devices and commands
		function* testAllCommands() {
			let success = true;

			for (let device in devices) {
				let width = devices[device];
				deviceToConsole(device, width);
				for (let cmd_index = 0; cmd_index < keys.length; cmd_index++) {
					const cmd = keys[cmd_index];

					console.log(`${tab}${tab}Command: ${cmd}`);

					// All tests should be passed under speech enabled environment
					let testUrl = getUrl({ t: cmd, speech: 'enabled/ui' }, commands[cmd].urlAppend);
					success &= yield testOneCommand(testUrl, cmd, width, "Speech enabled: ")

					const speechCmd = /speech[ \t]([^ ]*)/g.exec(cmd);
					if (!speechCmd || speechCmd.length === 0) {
						// Non speech specific tests should also be passed under speech disabled environment
						testUrl = getUrl({ t: cmd, speech: 'disabled/ui' }, commands[cmd].urlAppend);
						success &= yield testOneCommand(testUrl, cmd, width, "Speech disabled: ")
					}
				}
			}

			yield nightmare
				.type('.wc-textbox input', 'end')
				.click('.wc-send')
				.wait(1000);

			yield nightmare.end();
			return success;
		}

		vo(testAllCommands)(function (err, success) {
			// When test failed, err is string instead of Error
			if (err || !success) {
				done(new Error(err || 'one or more tests failed'));
			} else {
				done();
			}
		});
	});
});
