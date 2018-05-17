var shared_de551c748e97eca585e2 =
/******/ (function(modules) { // webpackBootstrap
/******/ 	function hotDisposeChunk(chunkId) {
/******/ 		delete installedChunks[chunkId];
/******/ 	}
/******/ 	var parentHotUpdateCallback = window["webpackHotUpdate_name_hash_"];
/******/ 	window["webpackHotUpdate_name_hash_"] = // eslint-disable-next-line no-unused-vars
/******/ 	function webpackHotUpdateCallback(chunkId, moreModules) {
/******/ 		hotAddUpdateChunk(chunkId, moreModules);
/******/ 		if (parentHotUpdateCallback) parentHotUpdateCallback(chunkId, moreModules);
/******/ 	} ;
/******/
/******/ 	// eslint-disable-next-line no-unused-vars
/******/ 	function hotDownloadUpdateChunk(chunkId) {
/******/ 		var head = document.getElementsByTagName("head")[0];
/******/ 		var script = document.createElement("script");
/******/ 		script.charset = "utf-8";
/******/ 		script.src = __webpack_require__.p + "" + chunkId + "." + hotCurrentHash + ".hot-update.js";
/******/ 		;
/******/ 		head.appendChild(script);
/******/ 	}
/******/
/******/ 	// eslint-disable-next-line no-unused-vars
/******/ 	function hotDownloadManifest(requestTimeout) {
/******/ 		requestTimeout = requestTimeout || 10000;
/******/ 		return new Promise(function(resolve, reject) {
/******/ 			if (typeof XMLHttpRequest === "undefined")
/******/ 				return reject(new Error("No browser support"));
/******/ 			try {
/******/ 				var request = new XMLHttpRequest();
/******/ 				var requestPath = __webpack_require__.p + "" + hotCurrentHash + ".hot-update.json";
/******/ 				request.open("GET", requestPath, true);
/******/ 				request.timeout = requestTimeout;
/******/ 				request.send(null);
/******/ 			} catch (err) {
/******/ 				return reject(err);
/******/ 			}
/******/ 			request.onreadystatechange = function() {
/******/ 				if (request.readyState !== 4) return;
/******/ 				if (request.status === 0) {
/******/ 					// timeout
/******/ 					reject(
/******/ 						new Error("Manifest request to " + requestPath + " timed out.")
/******/ 					);
/******/ 				} else if (request.status === 404) {
/******/ 					// no update available
/******/ 					resolve();
/******/ 				} else if (request.status !== 200 && request.status !== 304) {
/******/ 					// other failure
/******/ 					reject(new Error("Manifest request to " + requestPath + " failed."));
/******/ 				} else {
/******/ 					// success
/******/ 					try {
/******/ 						var update = JSON.parse(request.responseText);
/******/ 					} catch (e) {
/******/ 						reject(e);
/******/ 						return;
/******/ 					}
/******/ 					resolve(update);
/******/ 				}
/******/ 			};
/******/ 		});
/******/ 	}
/******/
/******/ 	var hotApplyOnUpdate = true;
/******/ 	var hotCurrentHash = "de551c748e97eca585e2"; // eslint-disable-line no-unused-vars
/******/ 	var hotRequestTimeout = 10000;
/******/ 	var hotCurrentModuleData = {};
/******/ 	var hotCurrentChildModule; // eslint-disable-line no-unused-vars
/******/ 	var hotCurrentParents = []; // eslint-disable-line no-unused-vars
/******/ 	var hotCurrentParentsTemp = []; // eslint-disable-line no-unused-vars
/******/
/******/ 	// eslint-disable-next-line no-unused-vars
/******/ 	function hotCreateRequire(moduleId) {
/******/ 		var me = installedModules[moduleId];
/******/ 		if (!me) return __webpack_require__;
/******/ 		var fn = function(request) {
/******/ 			if (me.hot.active) {
/******/ 				if (installedModules[request]) {
/******/ 					if (installedModules[request].parents.indexOf(moduleId) === -1)
/******/ 						installedModules[request].parents.push(moduleId);
/******/ 				} else {
/******/ 					hotCurrentParents = [moduleId];
/******/ 					hotCurrentChildModule = request;
/******/ 				}
/******/ 				if (me.children.indexOf(request) === -1) me.children.push(request);
/******/ 			} else {
/******/ 				console.warn(
/******/ 					"[HMR] unexpected require(" +
/******/ 						request +
/******/ 						") from disposed module " +
/******/ 						moduleId
/******/ 				);
/******/ 				hotCurrentParents = [];
/******/ 			}
/******/ 			return __webpack_require__(request);
/******/ 		};
/******/ 		var ObjectFactory = function ObjectFactory(name) {
/******/ 			return {
/******/ 				configurable: true,
/******/ 				enumerable: true,
/******/ 				get: function() {
/******/ 					return __webpack_require__[name];
/******/ 				},
/******/ 				set: function(value) {
/******/ 					__webpack_require__[name] = value;
/******/ 				}
/******/ 			};
/******/ 		};
/******/ 		for (var name in __webpack_require__) {
/******/ 			if (
/******/ 				Object.prototype.hasOwnProperty.call(__webpack_require__, name) &&
/******/ 				name !== "e"
/******/ 			) {
/******/ 				Object.defineProperty(fn, name, ObjectFactory(name));
/******/ 			}
/******/ 		}
/******/ 		fn.e = function(chunkId) {
/******/ 			if (hotStatus === "ready") hotSetStatus("prepare");
/******/ 			hotChunksLoading++;
/******/ 			return __webpack_require__.e(chunkId).then(finishChunkLoading, function(err) {
/******/ 				finishChunkLoading();
/******/ 				throw err;
/******/ 			});
/******/
/******/ 			function finishChunkLoading() {
/******/ 				hotChunksLoading--;
/******/ 				if (hotStatus === "prepare") {
/******/ 					if (!hotWaitingFilesMap[chunkId]) {
/******/ 						hotEnsureUpdateChunk(chunkId);
/******/ 					}
/******/ 					if (hotChunksLoading === 0 && hotWaitingFiles === 0) {
/******/ 						hotUpdateDownloaded();
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 		return fn;
/******/ 	}
/******/
/******/ 	// eslint-disable-next-line no-unused-vars
/******/ 	function hotCreateModule(moduleId) {
/******/ 		var hot = {
/******/ 			// private stuff
/******/ 			_acceptedDependencies: {},
/******/ 			_declinedDependencies: {},
/******/ 			_selfAccepted: false,
/******/ 			_selfDeclined: false,
/******/ 			_disposeHandlers: [],
/******/ 			_main: hotCurrentChildModule !== moduleId,
/******/
/******/ 			// Module API
/******/ 			active: true,
/******/ 			accept: function(dep, callback) {
/******/ 				if (typeof dep === "undefined") hot._selfAccepted = true;
/******/ 				else if (typeof dep === "function") hot._selfAccepted = dep;
/******/ 				else if (typeof dep === "object")
/******/ 					for (var i = 0; i < dep.length; i++)
/******/ 						hot._acceptedDependencies[dep[i]] = callback || function() {};
/******/ 				else hot._acceptedDependencies[dep] = callback || function() {};
/******/ 			},
/******/ 			decline: function(dep) {
/******/ 				if (typeof dep === "undefined") hot._selfDeclined = true;
/******/ 				else if (typeof dep === "object")
/******/ 					for (var i = 0; i < dep.length; i++)
/******/ 						hot._declinedDependencies[dep[i]] = true;
/******/ 				else hot._declinedDependencies[dep] = true;
/******/ 			},
/******/ 			dispose: function(callback) {
/******/ 				hot._disposeHandlers.push(callback);
/******/ 			},
/******/ 			addDisposeHandler: function(callback) {
/******/ 				hot._disposeHandlers.push(callback);
/******/ 			},
/******/ 			removeDisposeHandler: function(callback) {
/******/ 				var idx = hot._disposeHandlers.indexOf(callback);
/******/ 				if (idx >= 0) hot._disposeHandlers.splice(idx, 1);
/******/ 			},
/******/
/******/ 			// Management API
/******/ 			check: hotCheck,
/******/ 			apply: hotApply,
/******/ 			status: function(l) {
/******/ 				if (!l) return hotStatus;
/******/ 				hotStatusHandlers.push(l);
/******/ 			},
/******/ 			addStatusHandler: function(l) {
/******/ 				hotStatusHandlers.push(l);
/******/ 			},
/******/ 			removeStatusHandler: function(l) {
/******/ 				var idx = hotStatusHandlers.indexOf(l);
/******/ 				if (idx >= 0) hotStatusHandlers.splice(idx, 1);
/******/ 			},
/******/
/******/ 			//inherit from previous dispose call
/******/ 			data: hotCurrentModuleData[moduleId]
/******/ 		};
/******/ 		hotCurrentChildModule = undefined;
/******/ 		return hot;
/******/ 	}
/******/
/******/ 	var hotStatusHandlers = [];
/******/ 	var hotStatus = "idle";
/******/
/******/ 	function hotSetStatus(newStatus) {
/******/ 		hotStatus = newStatus;
/******/ 		for (var i = 0; i < hotStatusHandlers.length; i++)
/******/ 			hotStatusHandlers[i].call(null, newStatus);
/******/ 	}
/******/
/******/ 	// while downloading
/******/ 	var hotWaitingFiles = 0;
/******/ 	var hotChunksLoading = 0;
/******/ 	var hotWaitingFilesMap = {};
/******/ 	var hotRequestedFilesMap = {};
/******/ 	var hotAvailableFilesMap = {};
/******/ 	var hotDeferred;
/******/
/******/ 	// The update info
/******/ 	var hotUpdate, hotUpdateNewHash;
/******/
/******/ 	function toModuleId(id) {
/******/ 		var isNumber = +id + "" === id;
/******/ 		return isNumber ? +id : id;
/******/ 	}
/******/
/******/ 	function hotCheck(apply) {
/******/ 		if (hotStatus !== "idle")
/******/ 			throw new Error("check() is only allowed in idle status");
/******/ 		hotApplyOnUpdate = apply;
/******/ 		hotSetStatus("check");
/******/ 		return hotDownloadManifest(hotRequestTimeout).then(function(update) {
/******/ 			if (!update) {
/******/ 				hotSetStatus("idle");
/******/ 				return null;
/******/ 			}
/******/ 			hotRequestedFilesMap = {};
/******/ 			hotWaitingFilesMap = {};
/******/ 			hotAvailableFilesMap = update.c;
/******/ 			hotUpdateNewHash = update.h;
/******/
/******/ 			hotSetStatus("prepare");
/******/ 			var promise = new Promise(function(resolve, reject) {
/******/ 				hotDeferred = {
/******/ 					resolve: resolve,
/******/ 					reject: reject
/******/ 				};
/******/ 			});
/******/ 			hotUpdate = {};
/******/ 			var chunkId = "shared";
/******/ 			{
/******/ 				// eslint-disable-line no-lone-blocks
/******/ 				/*globals chunkId */
/******/ 				hotEnsureUpdateChunk(chunkId);
/******/ 			}
/******/ 			if (
/******/ 				hotStatus === "prepare" &&
/******/ 				hotChunksLoading === 0 &&
/******/ 				hotWaitingFiles === 0
/******/ 			) {
/******/ 				hotUpdateDownloaded();
/******/ 			}
/******/ 			return promise;
/******/ 		});
/******/ 	}
/******/
/******/ 	// eslint-disable-next-line no-unused-vars
/******/ 	function hotAddUpdateChunk(chunkId, moreModules) {
/******/ 		if (!hotAvailableFilesMap[chunkId] || !hotRequestedFilesMap[chunkId])
/******/ 			return;
/******/ 		hotRequestedFilesMap[chunkId] = false;
/******/ 		for (var moduleId in moreModules) {
/******/ 			if (Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
/******/ 				hotUpdate[moduleId] = moreModules[moduleId];
/******/ 			}
/******/ 		}
/******/ 		if (--hotWaitingFiles === 0 && hotChunksLoading === 0) {
/******/ 			hotUpdateDownloaded();
/******/ 		}
/******/ 	}
/******/
/******/ 	function hotEnsureUpdateChunk(chunkId) {
/******/ 		if (!hotAvailableFilesMap[chunkId]) {
/******/ 			hotWaitingFilesMap[chunkId] = true;
/******/ 		} else {
/******/ 			hotRequestedFilesMap[chunkId] = true;
/******/ 			hotWaitingFiles++;
/******/ 			hotDownloadUpdateChunk(chunkId);
/******/ 		}
/******/ 	}
/******/
/******/ 	function hotUpdateDownloaded() {
/******/ 		hotSetStatus("ready");
/******/ 		var deferred = hotDeferred;
/******/ 		hotDeferred = null;
/******/ 		if (!deferred) return;
/******/ 		if (hotApplyOnUpdate) {
/******/ 			// Wrap deferred object in Promise to mark it as a well-handled Promise to
/******/ 			// avoid triggering uncaught exception warning in Chrome.
/******/ 			// See https://bugs.chromium.org/p/chromium/issues/detail?id=465666
/******/ 			Promise.resolve()
/******/ 				.then(function() {
/******/ 					return hotApply(hotApplyOnUpdate);
/******/ 				})
/******/ 				.then(
/******/ 					function(result) {
/******/ 						deferred.resolve(result);
/******/ 					},
/******/ 					function(err) {
/******/ 						deferred.reject(err);
/******/ 					}
/******/ 				);
/******/ 		} else {
/******/ 			var outdatedModules = [];
/******/ 			for (var id in hotUpdate) {
/******/ 				if (Object.prototype.hasOwnProperty.call(hotUpdate, id)) {
/******/ 					outdatedModules.push(toModuleId(id));
/******/ 				}
/******/ 			}
/******/ 			deferred.resolve(outdatedModules);
/******/ 		}
/******/ 	}
/******/
/******/ 	function hotApply(options) {
/******/ 		if (hotStatus !== "ready")
/******/ 			throw new Error("apply() is only allowed in ready status");
/******/ 		options = options || {};
/******/
/******/ 		var cb;
/******/ 		var i;
/******/ 		var j;
/******/ 		var module;
/******/ 		var moduleId;
/******/
/******/ 		function getAffectedStuff(updateModuleId) {
/******/ 			var outdatedModules = [updateModuleId];
/******/ 			var outdatedDependencies = {};
/******/
/******/ 			var queue = outdatedModules.slice().map(function(id) {
/******/ 				return {
/******/ 					chain: [id],
/******/ 					id: id
/******/ 				};
/******/ 			});
/******/ 			while (queue.length > 0) {
/******/ 				var queueItem = queue.pop();
/******/ 				var moduleId = queueItem.id;
/******/ 				var chain = queueItem.chain;
/******/ 				module = installedModules[moduleId];
/******/ 				if (!module || module.hot._selfAccepted) continue;
/******/ 				if (module.hot._selfDeclined) {
/******/ 					return {
/******/ 						type: "self-declined",
/******/ 						chain: chain,
/******/ 						moduleId: moduleId
/******/ 					};
/******/ 				}
/******/ 				if (module.hot._main) {
/******/ 					return {
/******/ 						type: "unaccepted",
/******/ 						chain: chain,
/******/ 						moduleId: moduleId
/******/ 					};
/******/ 				}
/******/ 				for (var i = 0; i < module.parents.length; i++) {
/******/ 					var parentId = module.parents[i];
/******/ 					var parent = installedModules[parentId];
/******/ 					if (!parent) continue;
/******/ 					if (parent.hot._declinedDependencies[moduleId]) {
/******/ 						return {
/******/ 							type: "declined",
/******/ 							chain: chain.concat([parentId]),
/******/ 							moduleId: moduleId,
/******/ 							parentId: parentId
/******/ 						};
/******/ 					}
/******/ 					if (outdatedModules.indexOf(parentId) !== -1) continue;
/******/ 					if (parent.hot._acceptedDependencies[moduleId]) {
/******/ 						if (!outdatedDependencies[parentId])
/******/ 							outdatedDependencies[parentId] = [];
/******/ 						addAllToSet(outdatedDependencies[parentId], [moduleId]);
/******/ 						continue;
/******/ 					}
/******/ 					delete outdatedDependencies[parentId];
/******/ 					outdatedModules.push(parentId);
/******/ 					queue.push({
/******/ 						chain: chain.concat([parentId]),
/******/ 						id: parentId
/******/ 					});
/******/ 				}
/******/ 			}
/******/
/******/ 			return {
/******/ 				type: "accepted",
/******/ 				moduleId: updateModuleId,
/******/ 				outdatedModules: outdatedModules,
/******/ 				outdatedDependencies: outdatedDependencies
/******/ 			};
/******/ 		}
/******/
/******/ 		function addAllToSet(a, b) {
/******/ 			for (var i = 0; i < b.length; i++) {
/******/ 				var item = b[i];
/******/ 				if (a.indexOf(item) === -1) a.push(item);
/******/ 			}
/******/ 		}
/******/
/******/ 		// at begin all updates modules are outdated
/******/ 		// the "outdated" status can propagate to parents if they don't accept the children
/******/ 		var outdatedDependencies = {};
/******/ 		var outdatedModules = [];
/******/ 		var appliedUpdate = {};
/******/
/******/ 		var warnUnexpectedRequire = function warnUnexpectedRequire() {
/******/ 			console.warn(
/******/ 				"[HMR] unexpected require(" + result.moduleId + ") to disposed module"
/******/ 			);
/******/ 		};
/******/
/******/ 		for (var id in hotUpdate) {
/******/ 			if (Object.prototype.hasOwnProperty.call(hotUpdate, id)) {
/******/ 				moduleId = toModuleId(id);
/******/ 				/** @type {TODO} */
/******/ 				var result;
/******/ 				if (hotUpdate[id]) {
/******/ 					result = getAffectedStuff(moduleId);
/******/ 				} else {
/******/ 					result = {
/******/ 						type: "disposed",
/******/ 						moduleId: id
/******/ 					};
/******/ 				}
/******/ 				/** @type {Error|false} */
/******/ 				var abortError = false;
/******/ 				var doApply = false;
/******/ 				var doDispose = false;
/******/ 				var chainInfo = "";
/******/ 				if (result.chain) {
/******/ 					chainInfo = "\nUpdate propagation: " + result.chain.join(" -> ");
/******/ 				}
/******/ 				switch (result.type) {
/******/ 					case "self-declined":
/******/ 						if (options.onDeclined) options.onDeclined(result);
/******/ 						if (!options.ignoreDeclined)
/******/ 							abortError = new Error(
/******/ 								"Aborted because of self decline: " +
/******/ 									result.moduleId +
/******/ 									chainInfo
/******/ 							);
/******/ 						break;
/******/ 					case "declined":
/******/ 						if (options.onDeclined) options.onDeclined(result);
/******/ 						if (!options.ignoreDeclined)
/******/ 							abortError = new Error(
/******/ 								"Aborted because of declined dependency: " +
/******/ 									result.moduleId +
/******/ 									" in " +
/******/ 									result.parentId +
/******/ 									chainInfo
/******/ 							);
/******/ 						break;
/******/ 					case "unaccepted":
/******/ 						if (options.onUnaccepted) options.onUnaccepted(result);
/******/ 						if (!options.ignoreUnaccepted)
/******/ 							abortError = new Error(
/******/ 								"Aborted because " + moduleId + " is not accepted" + chainInfo
/******/ 							);
/******/ 						break;
/******/ 					case "accepted":
/******/ 						if (options.onAccepted) options.onAccepted(result);
/******/ 						doApply = true;
/******/ 						break;
/******/ 					case "disposed":
/******/ 						if (options.onDisposed) options.onDisposed(result);
/******/ 						doDispose = true;
/******/ 						break;
/******/ 					default:
/******/ 						throw new Error("Unexception type " + result.type);
/******/ 				}
/******/ 				if (abortError) {
/******/ 					hotSetStatus("abort");
/******/ 					return Promise.reject(abortError);
/******/ 				}
/******/ 				if (doApply) {
/******/ 					appliedUpdate[moduleId] = hotUpdate[moduleId];
/******/ 					addAllToSet(outdatedModules, result.outdatedModules);
/******/ 					for (moduleId in result.outdatedDependencies) {
/******/ 						if (
/******/ 							Object.prototype.hasOwnProperty.call(
/******/ 								result.outdatedDependencies,
/******/ 								moduleId
/******/ 							)
/******/ 						) {
/******/ 							if (!outdatedDependencies[moduleId])
/******/ 								outdatedDependencies[moduleId] = [];
/******/ 							addAllToSet(
/******/ 								outdatedDependencies[moduleId],
/******/ 								result.outdatedDependencies[moduleId]
/******/ 							);
/******/ 						}
/******/ 					}
/******/ 				}
/******/ 				if (doDispose) {
/******/ 					addAllToSet(outdatedModules, [result.moduleId]);
/******/ 					appliedUpdate[moduleId] = warnUnexpectedRequire;
/******/ 				}
/******/ 			}
/******/ 		}
/******/
/******/ 		// Store self accepted outdated modules to require them later by the module system
/******/ 		var outdatedSelfAcceptedModules = [];
/******/ 		for (i = 0; i < outdatedModules.length; i++) {
/******/ 			moduleId = outdatedModules[i];
/******/ 			if (
/******/ 				installedModules[moduleId] &&
/******/ 				installedModules[moduleId].hot._selfAccepted
/******/ 			)
/******/ 				outdatedSelfAcceptedModules.push({
/******/ 					module: moduleId,
/******/ 					errorHandler: installedModules[moduleId].hot._selfAccepted
/******/ 				});
/******/ 		}
/******/
/******/ 		// Now in "dispose" phase
/******/ 		hotSetStatus("dispose");
/******/ 		Object.keys(hotAvailableFilesMap).forEach(function(chunkId) {
/******/ 			if (hotAvailableFilesMap[chunkId] === false) {
/******/ 				hotDisposeChunk(chunkId);
/******/ 			}
/******/ 		});
/******/
/******/ 		var idx;
/******/ 		var queue = outdatedModules.slice();
/******/ 		while (queue.length > 0) {
/******/ 			moduleId = queue.pop();
/******/ 			module = installedModules[moduleId];
/******/ 			if (!module) continue;
/******/
/******/ 			var data = {};
/******/
/******/ 			// Call dispose handlers
/******/ 			var disposeHandlers = module.hot._disposeHandlers;
/******/ 			for (j = 0; j < disposeHandlers.length; j++) {
/******/ 				cb = disposeHandlers[j];
/******/ 				cb(data);
/******/ 			}
/******/ 			hotCurrentModuleData[moduleId] = data;
/******/
/******/ 			// disable module (this disables requires from this module)
/******/ 			module.hot.active = false;
/******/
/******/ 			// remove module from cache
/******/ 			delete installedModules[moduleId];
/******/
/******/ 			// when disposing there is no need to call dispose handler
/******/ 			delete outdatedDependencies[moduleId];
/******/
/******/ 			// remove "parents" references from all children
/******/ 			for (j = 0; j < module.children.length; j++) {
/******/ 				var child = installedModules[module.children[j]];
/******/ 				if (!child) continue;
/******/ 				idx = child.parents.indexOf(moduleId);
/******/ 				if (idx >= 0) {
/******/ 					child.parents.splice(idx, 1);
/******/ 				}
/******/ 			}
/******/ 		}
/******/
/******/ 		// remove outdated dependency from module children
/******/ 		var dependency;
/******/ 		var moduleOutdatedDependencies;
/******/ 		for (moduleId in outdatedDependencies) {
/******/ 			if (
/******/ 				Object.prototype.hasOwnProperty.call(outdatedDependencies, moduleId)
/******/ 			) {
/******/ 				module = installedModules[moduleId];
/******/ 				if (module) {
/******/ 					moduleOutdatedDependencies = outdatedDependencies[moduleId];
/******/ 					for (j = 0; j < moduleOutdatedDependencies.length; j++) {
/******/ 						dependency = moduleOutdatedDependencies[j];
/******/ 						idx = module.children.indexOf(dependency);
/******/ 						if (idx >= 0) module.children.splice(idx, 1);
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		}
/******/
/******/ 		// Not in "apply" phase
/******/ 		hotSetStatus("apply");
/******/
/******/ 		hotCurrentHash = hotUpdateNewHash;
/******/
/******/ 		// insert new code
/******/ 		for (moduleId in appliedUpdate) {
/******/ 			if (Object.prototype.hasOwnProperty.call(appliedUpdate, moduleId)) {
/******/ 				modules[moduleId] = appliedUpdate[moduleId];
/******/ 			}
/******/ 		}
/******/
/******/ 		// call accept handlers
/******/ 		var error = null;
/******/ 		for (moduleId in outdatedDependencies) {
/******/ 			if (
/******/ 				Object.prototype.hasOwnProperty.call(outdatedDependencies, moduleId)
/******/ 			) {
/******/ 				module = installedModules[moduleId];
/******/ 				if (module) {
/******/ 					moduleOutdatedDependencies = outdatedDependencies[moduleId];
/******/ 					var callbacks = [];
/******/ 					for (i = 0; i < moduleOutdatedDependencies.length; i++) {
/******/ 						dependency = moduleOutdatedDependencies[i];
/******/ 						cb = module.hot._acceptedDependencies[dependency];
/******/ 						if (cb) {
/******/ 							if (callbacks.indexOf(cb) !== -1) continue;
/******/ 							callbacks.push(cb);
/******/ 						}
/******/ 					}
/******/ 					for (i = 0; i < callbacks.length; i++) {
/******/ 						cb = callbacks[i];
/******/ 						try {
/******/ 							cb(moduleOutdatedDependencies);
/******/ 						} catch (err) {
/******/ 							if (options.onErrored) {
/******/ 								options.onErrored({
/******/ 									type: "accept-errored",
/******/ 									moduleId: moduleId,
/******/ 									dependencyId: moduleOutdatedDependencies[i],
/******/ 									error: err
/******/ 								});
/******/ 							}
/******/ 							if (!options.ignoreErrored) {
/******/ 								if (!error) error = err;
/******/ 							}
/******/ 						}
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		}
/******/
/******/ 		// Load self accepted modules
/******/ 		for (i = 0; i < outdatedSelfAcceptedModules.length; i++) {
/******/ 			var item = outdatedSelfAcceptedModules[i];
/******/ 			moduleId = item.module;
/******/ 			hotCurrentParents = [moduleId];
/******/ 			try {
/******/ 				__webpack_require__(moduleId);
/******/ 			} catch (err) {
/******/ 				if (typeof item.errorHandler === "function") {
/******/ 					try {
/******/ 						item.errorHandler(err);
/******/ 					} catch (err2) {
/******/ 						if (options.onErrored) {
/******/ 							options.onErrored({
/******/ 								type: "self-accept-error-handler-errored",
/******/ 								moduleId: moduleId,
/******/ 								error: err2,
/******/ 								originalError: err
/******/ 							});
/******/ 						}
/******/ 						if (!options.ignoreErrored) {
/******/ 							if (!error) error = err2;
/******/ 						}
/******/ 						if (!error) error = err;
/******/ 					}
/******/ 				} else {
/******/ 					if (options.onErrored) {
/******/ 						options.onErrored({
/******/ 							type: "self-accept-errored",
/******/ 							moduleId: moduleId,
/******/ 							error: err
/******/ 						});
/******/ 					}
/******/ 					if (!options.ignoreErrored) {
/******/ 						if (!error) error = err;
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		}
/******/
/******/ 		// handle errors in accept handlers and self accepted module load
/******/ 		if (error) {
/******/ 			hotSetStatus("fail");
/******/ 			return Promise.reject(error);
/******/ 		}
/******/
/******/ 		hotSetStatus("idle");
/******/ 		return new Promise(function(resolve) {
/******/ 			resolve(outdatedModules);
/******/ 		});
/******/ 	}
/******/
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {},
/******/ 			hot: hotCreateModule(moduleId),
/******/ 			parents: (hotCurrentParentsTemp = hotCurrentParents, hotCurrentParents = [], hotCurrentParentsTemp),
/******/ 			children: []
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, hotCreateRequire(moduleId));
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "http://localhost:3000/";
/******/
/******/ 	// __webpack_hash__
/******/ 	__webpack_require__.h = function() { return hotCurrentHash; };
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return hotCreateRequire(0)(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ({

/***/ "../../../node_modules/adaptivecards/lib/adaptivecards.js":
/*!*************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/adaptivecards/lib/adaptivecards.js ***!
  \*************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(/*! ./card-elements */ "../../../node_modules/adaptivecards/lib/card-elements.js"));
__export(__webpack_require__(/*! ./enums */ "../../../node_modules/adaptivecards/lib/enums.js"));
__export(__webpack_require__(/*! ./host-config */ "../../../node_modules/adaptivecards/lib/host-config.js"));
var utils_1 = __webpack_require__(/*! ./utils */ "../../../node_modules/adaptivecards/lib/utils.js");
exports.getEnumValueOrDefault = utils_1.getEnumValueOrDefault;
//# sourceMappingURL=adaptivecards.js.map

/***/ }),

/***/ "../../../node_modules/adaptivecards/lib/card-elements.js":
/*!*************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/adaptivecards/lib/card-elements.js ***!
  \*************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Enums = __webpack_require__(/*! ./enums */ "../../../node_modules/adaptivecards/lib/enums.js");
var Utils = __webpack_require__(/*! ./utils */ "../../../node_modules/adaptivecards/lib/utils.js");
var HostConfig = __webpack_require__(/*! ./host-config */ "../../../node_modules/adaptivecards/lib/host-config.js");
var TextFormatters = __webpack_require__(/*! ./text-formatters */ "../../../node_modules/adaptivecards/lib/text-formatters.js");
function invokeSetCollection(action, collection) {
    if (action) {
        // Closest emulation of "internal" in TypeScript.
        action["setCollection"](collection);
    }
}
function isActionAllowed(action, forbiddenActionTypes) {
    if (forbiddenActionTypes) {
        for (var i = 0; i < forbiddenActionTypes.length; i++) {
            if (action.getJsonTypeName() === forbiddenActionTypes[i]) {
                return false;
            }
        }
    }
    return true;
}
function createActionInstance(json) {
    var actionType = json["type"];
    var result = AdaptiveCard.actionTypeRegistry.createInstance(actionType);
    if (result) {
        result.parse(json);
    }
    else {
        raiseParseError({
            error: Enums.ValidationError.UnknownActionType,
            message: "Unknown action type: " + actionType
        });
    }
    return result;
}
exports.createActionInstance = createActionInstance;
var SpacingDefinition = /** @class */ (function () {
    function SpacingDefinition(top, right, bottom, left) {
        if (top === void 0) { top = 0; }
        if (right === void 0) { right = 0; }
        if (bottom === void 0) { bottom = 0; }
        if (left === void 0) { left = 0; }
        this.left = 0;
        this.top = 0;
        this.right = 0;
        this.bottom = 0;
        this.top = top;
        this.right = right;
        this.bottom = bottom;
        this.left = left;
    }
    return SpacingDefinition;
}());
exports.SpacingDefinition = SpacingDefinition;
var PaddingDefinition = /** @class */ (function () {
    function PaddingDefinition(top, right, bottom, left) {
        if (top === void 0) { top = Enums.Spacing.None; }
        if (right === void 0) { right = Enums.Spacing.None; }
        if (bottom === void 0) { bottom = Enums.Spacing.None; }
        if (left === void 0) { left = Enums.Spacing.None; }
        this.top = Enums.Spacing.None;
        this.right = Enums.Spacing.None;
        this.bottom = Enums.Spacing.None;
        this.left = Enums.Spacing.None;
        this.top = top;
        this.right = right;
        this.bottom = bottom;
        this.left = left;
    }
    PaddingDefinition.prototype.toSpacingDefinition = function (hostConfig) {
        return new SpacingDefinition(hostConfig.getEffectiveSpacing(this.top), hostConfig.getEffectiveSpacing(this.right), hostConfig.getEffectiveSpacing(this.bottom), hostConfig.getEffectiveSpacing(this.left));
    };
    return PaddingDefinition;
}());
exports.PaddingDefinition = PaddingDefinition;
var CardElement = /** @class */ (function () {
    function CardElement() {
        this._lang = undefined;
        this._hostConfig = null;
        this._internalPadding = null;
        this._parent = null;
        this._renderedElement = null;
        this._separatorElement = null;
        this._isVisible = true;
        this._truncatedDueToOverflow = false;
        this._defaultRenderedElementDisplayMode = null;
        this._padding = null;
        this.horizontalAlignment = null;
        this.spacing = Enums.Spacing.Default;
        this.separator = false;
        this.height = "auto";
    }
    CardElement.prototype.internalRenderSeparator = function () {
        return Utils.renderSeparation({
            spacing: this.hostConfig.getEffectiveSpacing(this.spacing),
            lineThickness: this.separator ? this.hostConfig.separator.lineThickness : null,
            lineColor: this.separator ? this.hostConfig.separator.lineColor : null
        }, this.separatorOrientation);
    };
    CardElement.prototype.updateRenderedElementVisibility = function () {
        if (this._renderedElement) {
            this._renderedElement.style.display = this._isVisible ? this._defaultRenderedElementDisplayMode : "none";
        }
        if (this._separatorElement) {
            this._separatorElement.style.display = this._isVisible ? this._defaultRenderedElementDisplayMode : "none";
        }
    };
    CardElement.prototype.hideElementDueToOverflow = function () {
        if (this._renderedElement && this._isVisible) {
            this._renderedElement.style.visibility = 'hidden';
            this._isVisible = false;
            raiseElementVisibilityChangedEvent(this, false);
        }
    };
    CardElement.prototype.showElementHiddenDueToOverflow = function () {
        if (this._renderedElement && !this._isVisible) {
            this._renderedElement.style.visibility = null;
            this._isVisible = true;
            raiseElementVisibilityChangedEvent(this, false);
        }
    };
    // Marked private to emulate internal access
    CardElement.prototype.handleOverflow = function (maxHeight) {
        if (this.isVisible || this.isHiddenDueToOverflow()) {
            var handled = this.truncateOverflow(maxHeight);
            // Even if we were unable to truncate the element to fit this time,
            // it still could have been previously truncated
            this._truncatedDueToOverflow = handled || this._truncatedDueToOverflow;
            if (!handled) {
                this.hideElementDueToOverflow();
            }
            else if (handled && !this._isVisible) {
                this.showElementHiddenDueToOverflow();
            }
        }
    };
    // Marked private to emulate internal access
    CardElement.prototype.resetOverflow = function () {
        var sizeChanged = false;
        if (this._truncatedDueToOverflow) {
            this.undoOverflowTruncation();
            this._truncatedDueToOverflow = false;
            sizeChanged = true;
        }
        if (this.isHiddenDueToOverflow) {
            this.showElementHiddenDueToOverflow();
        }
        return sizeChanged;
    };
    CardElement.prototype.internalGetNonZeroPadding = function (padding, processTop, processRight, processBottom, processLeft) {
        if (processTop === void 0) { processTop = true; }
        if (processRight === void 0) { processRight = true; }
        if (processBottom === void 0) { processBottom = true; }
        if (processLeft === void 0) { processLeft = true; }
        if (processTop) {
            if (padding.top == Enums.Spacing.None) {
                padding.top = this.internalPadding.top;
            }
        }
        if (processRight) {
            if (padding.right == Enums.Spacing.None) {
                padding.right = this.internalPadding.right;
            }
        }
        if (processBottom) {
            if (padding.bottom == Enums.Spacing.None) {
                padding.bottom = this.internalPadding.bottom;
            }
        }
        if (processLeft) {
            if (padding.left == Enums.Spacing.None) {
                padding.left = this.internalPadding.left;
            }
        }
        if (this.parent) {
            this.parent.internalGetNonZeroPadding(padding, processTop && this.isAtTheVeryTop(), processRight && this.isAtTheVeryRight(), processBottom && this.isAtTheVeryBottom(), processLeft && this.isAtTheVeryLeft());
        }
    };
    CardElement.prototype.adjustRenderedElementSize = function (renderedElement) {
        if (this.height === "auto") {
            renderedElement.style.flex = "0 0 auto";
        }
        else {
            renderedElement.style.flex = "1 1 100%";
        }
    };
    CardElement.prototype.showBottomSpacer = function (requestingElement) {
        if (this.parent) {
            this.parent.showBottomSpacer(requestingElement);
        }
    };
    CardElement.prototype.hideBottomSpacer = function (requestingElement) {
        if (this.parent) {
            this.parent.hideBottomSpacer(requestingElement);
        }
    };
    /*
     * Called when this element overflows the bottom of the card.
     * maxHeight will be the amount of space still available on the card (0 if
     * the element is fully off the card).
     */
    CardElement.prototype.truncateOverflow = function (maxHeight) {
        // Child implementations should return true if the element handled
        // the truncation request such that its content fits within maxHeight,
        // false if the element should fall back to being hidden
        return false;
    };
    /*
     * This should reverse any changes performed in truncateOverflow().
     */
    CardElement.prototype.undoOverflowTruncation = function () { };
    Object.defineProperty(CardElement.prototype, "useDefaultSizing", {
        get: function () {
            return true;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CardElement.prototype, "allowCustomPadding", {
        get: function () {
            return true;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CardElement.prototype, "defaultPadding", {
        get: function () {
            return new PaddingDefinition();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CardElement.prototype, "internalPadding", {
        get: function () {
            if (this._padding) {
                return this._padding;
            }
            else {
                return (this._internalPadding && this.allowCustomPadding) ? this._internalPadding : this.defaultPadding;
            }
        },
        set: function (value) {
            this._internalPadding = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CardElement.prototype, "separatorOrientation", {
        get: function () {
            return Enums.Orientation.Horizontal;
        },
        enumerable: true,
        configurable: true
    });
    CardElement.prototype.getPadding = function () {
        return this._padding;
    };
    CardElement.prototype.setPadding = function (value) {
        this._padding = value;
        if (this._padding) {
            AdaptiveCard.useAutomaticContainerBleeding = false;
        }
    };
    CardElement.prototype.setParent = function (value) {
        this._parent = value;
    };
    CardElement.prototype.getNonZeroPadding = function () {
        var padding = new PaddingDefinition();
        this.internalGetNonZeroPadding(padding);
        return padding;
    };
    CardElement.prototype.getForbiddenElementTypes = function () {
        return null;
    };
    CardElement.prototype.getForbiddenActionTypes = function () {
        return null;
    };
    CardElement.prototype.parse = function (json) {
        raiseParseElementEvent(this, json);
        this.id = json["id"];
        this.speak = json["speak"];
        this.horizontalAlignment = Utils.getEnumValueOrDefault(Enums.HorizontalAlignment, json["horizontalAlignment"], null);
        this.spacing = Utils.getEnumValueOrDefault(Enums.Spacing, json["spacing"], Enums.Spacing.Default);
        this.separator = json["separator"];
        var jsonSeparation = json["separation"];
        if (jsonSeparation !== undefined) {
            if (jsonSeparation === "none") {
                this.spacing = Enums.Spacing.None;
                this.separator = false;
            }
            else if (jsonSeparation === "strong") {
                this.spacing = Enums.Spacing.Large;
                this.separator = true;
            }
            else if (jsonSeparation === "default") {
                this.spacing = Enums.Spacing.Default;
                this.separator = false;
            }
            raiseParseError({
                error: Enums.ValidationError.Deprecated,
                message: "The \"separation\" property is deprecated and will be removed. Use the \"spacing\" and \"separator\" properties instead."
            });
        }
        var jsonHeight = json["height"];
        if (jsonHeight === "auto" || jsonHeight === "stretch") {
            this.height = jsonHeight;
        }
    };
    CardElement.prototype.validate = function () {
        return [];
    };
    CardElement.prototype.render = function () {
        this._renderedElement = this.internalRender();
        this._separatorElement = this.internalRenderSeparator();
        if (this._renderedElement) {
            this._renderedElement.style.boxSizing = "border-box";
            this._defaultRenderedElementDisplayMode = this._renderedElement.style.display;
            this.adjustRenderedElementSize(this._renderedElement);
            this.updateLayout(false);
            this.updateRenderedElementVisibility();
        }
        return this._renderedElement;
    };
    CardElement.prototype.updateLayout = function (processChildren) {
        if (processChildren === void 0) { processChildren = true; }
        // Does nothing in base implementation
    };
    CardElement.prototype.isRendered = function () {
        return this._renderedElement && this._renderedElement.offsetHeight > 0;
    };
    CardElement.prototype.isAtTheVeryTop = function () {
        return this.parent ? this.parent.isFirstElement(this) && this.parent.isAtTheVeryTop() : true;
    };
    CardElement.prototype.isFirstElement = function (element) {
        return true;
    };
    CardElement.prototype.isAtTheVeryBottom = function () {
        return this.parent ? this.parent.isLastElement(this) && this.parent.isAtTheVeryBottom() : true;
    };
    CardElement.prototype.isLastElement = function (element) {
        return true;
    };
    CardElement.prototype.isAtTheVeryLeft = function () {
        return this.parent ? this.parent.isLeftMostElement(this) && this.parent.isAtTheVeryLeft() : true;
    };
    CardElement.prototype.isLeftMostElement = function (element) {
        return true;
    };
    CardElement.prototype.isAtTheVeryRight = function () {
        return this.parent ? this.parent.isRightMostElement(this) && this.parent.isAtTheVeryRight() : true;
    };
    CardElement.prototype.isRightMostElement = function (element) {
        return true;
    };
    CardElement.prototype.isHiddenDueToOverflow = function () {
        return this._renderedElement && this._renderedElement.style.visibility == 'hidden';
    };
    CardElement.prototype.canContentBleed = function () {
        return this.parent ? this.parent.canContentBleed() : true;
    };
    CardElement.prototype.getRootElement = function () {
        var rootElement = this;
        while (rootElement.parent) {
            rootElement = rootElement.parent;
        }
        return rootElement;
    };
    CardElement.prototype.getParentContainer = function () {
        var currentElement = this.parent;
        while (currentElement) {
            if (currentElement instanceof Container) {
                return currentElement;
            }
            currentElement = currentElement.parent;
        }
        return null;
    };
    CardElement.prototype.getAllInputs = function () {
        return [];
    };
    CardElement.prototype.getElementById = function (id) {
        return this.id === id ? this : null;
    };
    CardElement.prototype.getActionById = function (id) {
        return null;
    };
    Object.defineProperty(CardElement.prototype, "lang", {
        get: function () {
            if (this._lang) {
                return this._lang;
            }
            else {
                if (this.parent) {
                    return this.parent.lang;
                }
                else {
                    return undefined;
                }
            }
        },
        set: function (value) {
            if (value && value != "") {
                var regEx = /^[a-z]{2,3}$/ig;
                var matches = regEx.exec(value);
                if (!matches) {
                    throw new Error("Invalid language identifier: " + value);
                }
            }
            this._lang = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CardElement.prototype, "hostConfig", {
        get: function () {
            if (this._hostConfig) {
                return this._hostConfig;
            }
            else {
                if (this.parent) {
                    return this.parent.hostConfig;
                }
                else {
                    return defaultHostConfig;
                }
            }
        },
        set: function (value) {
            this._hostConfig = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CardElement.prototype, "isInteractive", {
        get: function () {
            return false;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CardElement.prototype, "isStandalone", {
        get: function () {
            return true;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CardElement.prototype, "parent", {
        get: function () {
            return this._parent;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CardElement.prototype, "isVisible", {
        get: function () {
            return this._isVisible;
        },
        set: function (value) {
            // If the element is going to be hidden, reset any changes that were due
            // to overflow truncation (this ensures that if the element is later
            // un-hidden it has the right content)
            if (AdaptiveCard.useAdvancedCardBottomTruncation && !value) {
                this.undoOverflowTruncation();
            }
            if (this._isVisible != value) {
                this._isVisible = value;
                this.updateRenderedElementVisibility();
                if (this._renderedElement) {
                    raiseElementVisibilityChangedEvent(this);
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CardElement.prototype, "renderedElement", {
        get: function () {
            return this._renderedElement;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CardElement.prototype, "separatorElement", {
        get: function () {
            return this._separatorElement;
        },
        enumerable: true,
        configurable: true
    });
    return CardElement;
}());
exports.CardElement = CardElement;
var TextBlock = /** @class */ (function (_super) {
    __extends(TextBlock, _super);
    function TextBlock() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.size = Enums.TextSize.Default;
        _this.weight = Enums.TextWeight.Default;
        _this.color = Enums.TextColor.Default;
        _this.isSubtle = false;
        _this.wrap = false;
        _this.useMarkdown = true;
        return _this;
    }
    TextBlock.prototype.internalRender = function () {
        var _this = this;
        if (!Utils.isNullOrEmpty(this.text)) {
            var element = document.createElement("div");
            element.style.overflow = "hidden";
            if (this.hostConfig.fontFamily) {
                element.style.fontFamily = this.hostConfig.fontFamily;
            }
            switch (this.horizontalAlignment) {
                case Enums.HorizontalAlignment.Center:
                    element.style.textAlign = "center";
                    break;
                case Enums.HorizontalAlignment.Right:
                    element.style.textAlign = "right";
                    break;
                default:
                    element.style.textAlign = "left";
                    break;
            }
            var cssStyle = "text ";
            var fontSize;
            switch (this.size) {
                case Enums.TextSize.Small:
                    fontSize = this.hostConfig.fontSizes.small;
                    break;
                case Enums.TextSize.Medium:
                    fontSize = this.hostConfig.fontSizes.medium;
                    break;
                case Enums.TextSize.Large:
                    fontSize = this.hostConfig.fontSizes.large;
                    break;
                case Enums.TextSize.ExtraLarge:
                    fontSize = this.hostConfig.fontSizes.extraLarge;
                    break;
                default:
                    fontSize = this.hostConfig.fontSizes.default;
                    break;
            }
            // Looks like 1.33 is the magic number to compute line-height
            // from font size.
            this._computedLineHeight = fontSize * 1.33;
            element.style.fontSize = fontSize + "px";
            element.style.lineHeight = this._computedLineHeight + "px";
            var parentContainer = this.getParentContainer();
            var styleDefinition = this.hostConfig.containerStyles.getStyleByName(parentContainer ? parentContainer.style : Enums.ContainerStyle.Default, this.hostConfig.containerStyles.default);
            var actualTextColor = this.color ? this.color : Enums.TextColor.Default;
            var colorDefinition;
            switch (actualTextColor) {
                case Enums.TextColor.Accent:
                    colorDefinition = styleDefinition.foregroundColors.accent;
                    break;
                case Enums.TextColor.Dark:
                    colorDefinition = styleDefinition.foregroundColors.dark;
                    break;
                case Enums.TextColor.Light:
                    colorDefinition = styleDefinition.foregroundColors.light;
                    break;
                case Enums.TextColor.Good:
                    colorDefinition = styleDefinition.foregroundColors.good;
                    break;
                case Enums.TextColor.Warning:
                    colorDefinition = styleDefinition.foregroundColors.warning;
                    break;
                case Enums.TextColor.Attention:
                    colorDefinition = styleDefinition.foregroundColors.attention;
                    break;
                default:
                    colorDefinition = styleDefinition.foregroundColors.default;
                    break;
            }
            element.style.color = Utils.stringToCssColor(this.isSubtle ? colorDefinition.subtle : colorDefinition.default);
            var fontWeight;
            switch (this.weight) {
                case Enums.TextWeight.Lighter:
                    fontWeight = this.hostConfig.fontWeights.lighter;
                    break;
                case Enums.TextWeight.Bolder:
                    fontWeight = this.hostConfig.fontWeights.bolder;
                    break;
                default:
                    fontWeight = this.hostConfig.fontWeights.default;
                    break;
            }
            element.style.fontWeight = fontWeight.toString();
            var formattedText = TextFormatters.formatText(this.lang, this.text);
            element.innerHTML = this.useMarkdown ? AdaptiveCard.processMarkdown(formattedText) : formattedText;
            if (element.firstElementChild instanceof HTMLElement) {
                var firstElementChild = element.firstElementChild;
                firstElementChild.style.marginTop = "0px";
                firstElementChild.style.width = "100%";
                if (!this.wrap) {
                    firstElementChild.style.overflow = "hidden";
                    firstElementChild.style.textOverflow = "ellipsis";
                }
            }
            if (element.lastElementChild instanceof HTMLElement) {
                element.lastElementChild.style.marginBottom = "0px";
            }
            var anchors = element.getElementsByTagName("a");
            for (var i = 0; i < anchors.length; i++) {
                var anchor = anchors[i];
                anchor.classList.add("ac-anchor");
                anchor.target = "_blank";
                anchor.onclick = function (e) {
                    if (raiseAnchorClickedEvent(_this, e.target)) {
                        e.preventDefault();
                    }
                };
            }
            if (this.wrap) {
                element.style.wordWrap = "break-word";
                if (this.maxLines > 0) {
                    element.style.maxHeight = (this._computedLineHeight * this.maxLines) + "px";
                    element.style.overflow = "hidden";
                }
            }
            else {
                element.style.whiteSpace = "nowrap";
                element.style.textOverflow = "ellipsis";
            }
            if (AdaptiveCard.useAdvancedTextBlockTruncation
                || AdaptiveCard.useAdvancedCardBottomTruncation) {
                this._originalInnerHtml = element.innerHTML;
            }
            return element;
        }
        else {
            return null;
        }
    };
    TextBlock.prototype.parse = function (json) {
        _super.prototype.parse.call(this, json);
        this.text = json["text"];
        var sizeString = json["size"];
        if (sizeString && typeof sizeString === "string" && sizeString.toLowerCase() === "normal") {
            this.size = Enums.TextSize.Default;
            raiseParseError({
                error: Enums.ValidationError.Deprecated,
                message: "The TextBlock.size value \"normal\" is deprecated and will be removed. Use \"default\" instead."
            });
        }
        else {
            this.size = Utils.getEnumValueOrDefault(Enums.TextSize, sizeString, this.size);
        }
        var weightString = json["weight"];
        if (weightString && typeof weightString === "string" && weightString.toLowerCase() === "normal") {
            this.weight = Enums.TextWeight.Default;
            raiseParseError({
                error: Enums.ValidationError.Deprecated,
                message: "The TextBlock.weight value \"normal\" is deprecated and will be removed. Use \"default\" instead."
            });
        }
        else {
            this.weight = Utils.getEnumValueOrDefault(Enums.TextWeight, weightString, this.weight);
        }
        this.color = Utils.getEnumValueOrDefault(Enums.TextColor, json["color"], this.color);
        this.isSubtle = json["isSubtle"];
        this.wrap = json["wrap"] === undefined ? false : json["wrap"];
        this.maxLines = json["maxLines"];
    };
    TextBlock.prototype.getJsonTypeName = function () {
        return "TextBlock";
    };
    TextBlock.prototype.renderSpeech = function () {
        if (this.speak != null)
            return this.speak + '\n';
        if (this.text)
            return '<s>' + this.text + '</s>\n';
        return null;
    };
    TextBlock.prototype.updateLayout = function (processChildren) {
        if (processChildren === void 0) { processChildren = false; }
        if (AdaptiveCard.useAdvancedTextBlockTruncation && this.maxLines && this.isRendered()) {
            // Reset the element's innerHTML in case the available room for
            // content has increased
            this.restoreOriginalContent();
            var maxHeight = this._computedLineHeight * this.maxLines;
            this.truncateIfSupported(maxHeight);
        }
    };
    TextBlock.prototype.truncateOverflow = function (maxHeight) {
        if (maxHeight >= this._computedLineHeight) {
            return this.truncateIfSupported(maxHeight);
        }
        return false;
    };
    TextBlock.prototype.undoOverflowTruncation = function () {
        this.restoreOriginalContent();
        if (AdaptiveCard.useAdvancedTextBlockTruncation && this.maxLines) {
            var maxHeight = this._computedLineHeight * this.maxLines;
            this.truncateIfSupported(maxHeight);
        }
    };
    TextBlock.prototype.restoreOriginalContent = function () {
        var maxHeight = this.maxLines
            ? (this._computedLineHeight * this.maxLines) + 'px'
            : null;
        this.renderedElement.style.maxHeight = maxHeight;
        this.renderedElement.innerHTML = this._originalInnerHtml;
    };
    TextBlock.prototype.truncateIfSupported = function (maxHeight) {
        // For now, only truncate TextBlocks that contain just a single
        // paragraph -- since the maxLines calculation doesn't take into
        // account Markdown lists
        var children = this.renderedElement.children;
        var isTextOnly = !children.length;
        var truncationSupported = isTextOnly || children.length == 1
            && children[0].tagName.toLowerCase() == 'p';
        if (truncationSupported) {
            var element = isTextOnly
                ? this.renderedElement
                : children[0];
            Utils.truncate(element, maxHeight, this._computedLineHeight);
            return true;
        }
        return false;
    };
    return TextBlock;
}(CardElement));
exports.TextBlock = TextBlock;
var Fact = /** @class */ (function () {
    function Fact() {
    }
    Fact.prototype.renderSpeech = function () {
        if (this.speak != null) {
            return this.speak + '\n';
        }
        return '<s>' + this.name + ' ' + this.value + '</s>\n';
    };
    return Fact;
}());
exports.Fact = Fact;
var FactSet = /** @class */ (function (_super) {
    __extends(FactSet, _super);
    function FactSet() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.facts = [];
        return _this;
    }
    Object.defineProperty(FactSet.prototype, "useDefaultSizing", {
        get: function () {
            return false;
        },
        enumerable: true,
        configurable: true
    });
    FactSet.prototype.internalRender = function () {
        var element = null;
        if (this.facts.length > 0) {
            element = document.createElement("table");
            element.style.borderWidth = "0px";
            element.style.borderSpacing = "0px";
            element.style.borderStyle = "none";
            element.style.borderCollapse = "collapse";
            element.style.display = "block";
            element.style.overflow = "hidden";
            for (var i = 0; i < this.facts.length; i++) {
                var trElement = document.createElement("tr");
                if (i > 0) {
                    trElement.style.marginTop = this.hostConfig.factSet.spacing + "px";
                }
                var tdElement = document.createElement("td");
                tdElement.style.padding = "0";
                if (this.hostConfig.factSet.title.maxWidth) {
                    tdElement.style.maxWidth = this.hostConfig.factSet.title.maxWidth + "px";
                }
                tdElement.style.verticalAlign = "top";
                var textBlock = new TextBlock();
                textBlock.hostConfig = this.hostConfig;
                textBlock.text = this.facts[i].name;
                textBlock.size = this.hostConfig.factSet.title.size;
                textBlock.color = this.hostConfig.factSet.title.color;
                textBlock.isSubtle = this.hostConfig.factSet.title.isSubtle;
                textBlock.weight = this.hostConfig.factSet.title.weight;
                textBlock.wrap = this.hostConfig.factSet.title.wrap;
                textBlock.spacing = Enums.Spacing.None;
                Utils.appendChild(tdElement, textBlock.render());
                Utils.appendChild(trElement, tdElement);
                tdElement = document.createElement("td");
                tdElement.style.padding = "0px 0px 0px 10px";
                tdElement.style.verticalAlign = "top";
                textBlock = new TextBlock();
                textBlock.hostConfig = this.hostConfig;
                textBlock.text = this.facts[i].value;
                textBlock.size = this.hostConfig.factSet.value.size;
                textBlock.color = this.hostConfig.factSet.value.color;
                textBlock.isSubtle = this.hostConfig.factSet.value.isSubtle;
                textBlock.weight = this.hostConfig.factSet.value.weight;
                textBlock.wrap = this.hostConfig.factSet.value.wrap;
                textBlock.spacing = Enums.Spacing.None;
                Utils.appendChild(tdElement, textBlock.render());
                Utils.appendChild(trElement, tdElement);
                Utils.appendChild(element, trElement);
            }
        }
        return element;
    };
    FactSet.prototype.getJsonTypeName = function () {
        return "FactSet";
    };
    FactSet.prototype.parse = function (json) {
        _super.prototype.parse.call(this, json);
        if (json["facts"] != null) {
            var jsonFacts = json["facts"];
            this.facts = [];
            for (var i = 0; i < jsonFacts.length; i++) {
                var fact = new Fact();
                fact.name = jsonFacts[i]["title"];
                fact.value = jsonFacts[i]["value"];
                fact.speak = jsonFacts[i]["speak"];
                this.facts.push(fact);
            }
        }
    };
    FactSet.prototype.renderSpeech = function () {
        if (this.speak != null) {
            return this.speak + '\n';
        }
        // render each fact
        var speak = null;
        if (this.facts.length > 0) {
            speak = '';
            for (var i = 0; i < this.facts.length; i++) {
                var speech = this.facts[i].renderSpeech();
                if (speech) {
                    speak += speech;
                }
            }
        }
        return '<p>' + speak + '\n</p>\n';
    };
    return FactSet;
}(CardElement));
exports.FactSet = FactSet;
var Image = /** @class */ (function (_super) {
    __extends(Image, _super);
    function Image() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.style = Enums.ImageStyle.Default;
        _this.size = Enums.Size.Auto;
        _this.pixelWidth = null;
        _this.pixelHeight = null;
        _this.altText = "";
        return _this;
    }
    Object.defineProperty(Image.prototype, "useDefaultSizing", {
        get: function () {
            return false;
        },
        enumerable: true,
        configurable: true
    });
    Image.prototype.internalRender = function () {
        var _this = this;
        var element = null;
        if (!Utils.isNullOrEmpty(this.url)) {
            element = document.createElement("div");
            element.classList.add("ac-image");
            element.style.display = "flex";
            element.style.alignItems = "flex-start";
            if (this.selectAction != null && this.hostConfig.supportsInteractivity) {
                element.tabIndex = 0;
                element.setAttribute("role", "button");
                element.setAttribute("aria-label", this.selectAction.title);
                element.classList.add("ac-selectable");
            }
            element.onkeypress = function (e) {
                if (_this.selectAction) {
                    if (e.keyCode == 13 || e.keyCode == 32) {
                        _this.selectAction.execute();
                    }
                }
            };
            element.onclick = function (e) {
                if (_this.selectAction) {
                    _this.selectAction.execute();
                    e.cancelBubble = true;
                }
            };
            switch (this.horizontalAlignment) {
                case Enums.HorizontalAlignment.Center:
                    element.style.justifyContent = "center";
                    break;
                case Enums.HorizontalAlignment.Right:
                    element.style.justifyContent = "flex-end";
                    break;
                default:
                    element.style.justifyContent = "flex-start";
                    break;
            }
            var imageElement = document.createElement("img");
            imageElement.style.maxHeight = "100%";
            imageElement.style.minWidth = "0";
            if (this.pixelWidth || this.pixelHeight) {
                if (this.pixelWidth) {
                    imageElement.style.width = this.pixelWidth + "px";
                }
                if (this.pixelHeight) {
                    imageElement.style.height = this.pixelHeight + "px";
                }
            }
            else {
                switch (this.size) {
                    case Enums.Size.Stretch:
                        imageElement.style.width = "100%";
                        break;
                    case Enums.Size.Auto:
                        imageElement.style.maxWidth = "100%";
                        break;
                    case Enums.Size.Small:
                        imageElement.style.width = this.hostConfig.imageSizes.small + "px";
                        break;
                    case Enums.Size.Large:
                        imageElement.style.width = this.hostConfig.imageSizes.large + "px";
                        break;
                    case Enums.Size.Medium:
                        imageElement.style.width = this.hostConfig.imageSizes.medium + "px";
                        break;
                }
            }
            if (this.style === Enums.ImageStyle.Person) {
                imageElement.style.borderRadius = "50%";
                imageElement.style.backgroundPosition = "50% 50%";
                imageElement.style.backgroundRepeat = "no-repeat";
            }
            if (!Utils.isNullOrEmpty(this.backgroundColor)) {
                imageElement.style.backgroundColor = Utils.stringToCssColor(this.backgroundColor);
            }
            imageElement.src = this.url;
            imageElement.alt = this.altText;
            element.appendChild(imageElement);
        }
        return element;
    };
    Image.prototype.getJsonTypeName = function () {
        return "Image";
    };
    Image.prototype.getActionById = function (id) {
        var result = _super.prototype.getActionById.call(this, id);
        if (!result && this.selectAction) {
            result = this.selectAction.getActionById(id);
        }
        return result;
    };
    Image.prototype.parse = function (json) {
        _super.prototype.parse.call(this, json);
        this.url = json["url"];
        var styleString = json["style"];
        if (styleString && typeof styleString === "string" && styleString.toLowerCase() === "normal") {
            this.style = Enums.ImageStyle.Default;
            raiseParseError({
                error: Enums.ValidationError.Deprecated,
                message: "The Image.style value \"normal\" is deprecated and will be removed. Use \"default\" instead."
            });
        }
        else {
            this.style = Utils.getEnumValueOrDefault(Enums.ImageStyle, styleString, this.style);
        }
        this.size = Utils.getEnumValueOrDefault(Enums.Size, json["size"], this.size);
        this.altText = json["altText"];
        var selectActionJson = json["selectAction"];
        if (selectActionJson != undefined) {
            this.selectAction = createActionInstance(selectActionJson);
        }
        if (json["pixelWidth"] && typeof json["pixelWidth"] === "number") {
            this.pixelWidth = json["pixelWidth"];
        }
        if (json["pixelHeight"] && typeof json["pixelHeight"] === "number") {
            this.pixelHeight = json["pixelHeight"];
        }
    };
    Image.prototype.renderSpeech = function () {
        if (this.speak != null) {
            return this.speak + '\n';
        }
        return null;
    };
    Object.defineProperty(Image.prototype, "selectAction", {
        get: function () {
            return this._selectAction;
        },
        set: function (value) {
            this._selectAction = value;
            if (this._selectAction) {
                this._selectAction.setParent(this);
            }
        },
        enumerable: true,
        configurable: true
    });
    return Image;
}(CardElement));
exports.Image = Image;
var ImageSet = /** @class */ (function (_super) {
    __extends(ImageSet, _super);
    function ImageSet() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._images = [];
        _this.imageSize = Enums.Size.Medium;
        return _this;
    }
    ImageSet.prototype.internalRender = function () {
        var element = null;
        if (this._images.length > 0) {
            element = document.createElement("div");
            element.style.display = "flex";
            element.style.flexWrap = "wrap";
            for (var i = 0; i < this._images.length; i++) {
                var renderedImage = this._images[i].render();
                renderedImage.style.display = "inline-flex";
                renderedImage.style.margin = "0px";
                renderedImage.style.marginRight = "10px";
                renderedImage.style.maxHeight = this.hostConfig.imageSet.maxImageHeight + "px";
                Utils.appendChild(element, renderedImage);
            }
        }
        return element;
    };
    ImageSet.prototype.getJsonTypeName = function () {
        return "ImageSet";
    };
    ImageSet.prototype.parse = function (json) {
        _super.prototype.parse.call(this, json);
        //this.imageSize = Utils.getValueOrDefault<Enums.Size>(json["imageSize"], Enums.Size.medium);
        this.imageSize = Utils.getEnumValueOrDefault(Enums.Size, json["imageSize"], Enums.Size.Medium);
        if (json["images"] != null) {
            var jsonImages = json["images"];
            this._images = [];
            for (var i = 0; i < jsonImages.length; i++) {
                var image = new Image();
                image.parse(jsonImages[i]);
                image.size = this.imageSize;
                this.addImage(image);
            }
        }
    };
    ImageSet.prototype.addImage = function (image) {
        if (!image.parent) {
            this._images.push(image);
            image.setParent(this);
        }
        else {
            throw new Error("This image already belongs to another ImageSet");
        }
    };
    ImageSet.prototype.renderSpeech = function () {
        if (this.speak != null) {
            return this.speak;
        }
        var speak = null;
        if (this._images.length > 0) {
            speak = '';
            for (var i = 0; i < this._images.length; i++) {
                speak += this._images[i].renderSpeech();
            }
        }
        return speak;
    };
    return ImageSet;
}(CardElement));
exports.ImageSet = ImageSet;
var Input = /** @class */ (function (_super) {
    __extends(Input, _super);
    function Input() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Input.prototype.validate = function () {
        if (!this.id) {
            return [{ error: Enums.ValidationError.PropertyCantBeNull, message: "All inputs must have a unique Id" }];
        }
        else {
            return [];
        }
    };
    Input.prototype.parse = function (json) {
        _super.prototype.parse.call(this, json);
        this.id = json["id"];
        this.defaultValue = json["value"];
    };
    Input.prototype.renderSpeech = function () {
        if (this.speak != null) {
            return this.speak;
        }
        if (this.title) {
            return '<s>' + this.title + '</s>\n';
        }
        return null;
    };
    Input.prototype.getAllInputs = function () {
        return [this];
    };
    Object.defineProperty(Input.prototype, "isInteractive", {
        get: function () {
            return true;
        },
        enumerable: true,
        configurable: true
    });
    return Input;
}(CardElement));
exports.Input = Input;
var TextInput = /** @class */ (function (_super) {
    __extends(TextInput, _super);
    function TextInput() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TextInput.prototype.internalRender = function () {
        if (this.isMultiline) {
            this._textareaElement = document.createElement("textarea");
            this._textareaElement.className = "ac-input ac-textInput ac-multiline";
            this._textareaElement.style.width = "100%";
            this._textareaElement.tabIndex = 0;
            if (!Utils.isNullOrEmpty(this.placeholder)) {
                this._textareaElement.placeholder = this.placeholder;
                this._textareaElement.setAttribute("aria-label", this.placeholder);
            }
            if (!Utils.isNullOrEmpty(this.defaultValue)) {
                this._textareaElement.value = this.defaultValue;
            }
            if (this.maxLength > 0) {
                this._textareaElement.maxLength = this.maxLength;
            }
            return this._textareaElement;
        }
        else {
            this._inputElement = document.createElement("input");
            this._inputElement.type = "text";
            this._inputElement.className = "ac-input ac-textInput";
            this._inputElement.style.width = "100%";
            this._inputElement.tabIndex = 0;
            if (!Utils.isNullOrEmpty(this.placeholder)) {
                this._inputElement.placeholder = this.placeholder;
                this._inputElement.setAttribute("aria-label", this.placeholder);
            }
            if (!Utils.isNullOrEmpty(this.defaultValue)) {
                this._inputElement.value = this.defaultValue;
            }
            if (this.maxLength > 0) {
                this._inputElement.maxLength = this.maxLength;
            }
            return this._inputElement;
        }
    };
    TextInput.prototype.getJsonTypeName = function () {
        return "Input.Text";
    };
    TextInput.prototype.parse = function (json) {
        _super.prototype.parse.call(this, json);
        this.maxLength = json["maxLength"];
        this.isMultiline = json["isMultiline"];
        this.placeholder = json["placeholder"];
    };
    Object.defineProperty(TextInput.prototype, "value", {
        get: function () {
            if (this.isMultiline) {
                return this._textareaElement ? this._textareaElement.value : null;
            }
            else {
                return this._inputElement ? this._inputElement.value : null;
            }
        },
        enumerable: true,
        configurable: true
    });
    return TextInput;
}(Input));
exports.TextInput = TextInput;
var ToggleInput = /** @class */ (function (_super) {
    __extends(ToggleInput, _super);
    function ToggleInput() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.valueOn = "true";
        _this.valueOff = "false";
        return _this;
    }
    ToggleInput.prototype.internalRender = function () {
        var element = document.createElement("div");
        element.className = "ac-input";
        element.style.width = "100%";
        element.style.display = "flex";
        this._checkboxInputElement = document.createElement("input");
        this._checkboxInputElement.type = "checkbox";
        this._checkboxInputElement.style.display = "inline-block";
        this._checkboxInputElement.style.verticalAlign = "middle";
        this._checkboxInputElement.style.margin = "0";
        this._checkboxInputElement.style.flex = "0 0 auto";
        this._checkboxInputElement.setAttribute("aria-label", this.title);
        this._checkboxInputElement.tabIndex = 0;
        if (this.defaultValue == this.valueOn) {
            this._checkboxInputElement.checked = true;
        }
        var label = new TextBlock();
        label.hostConfig = this.hostConfig;
        label.text = this.title;
        label.useMarkdown = AdaptiveCard.useMarkdownInRadioButtonAndCheckbox;
        var labelElement = label.render();
        labelElement.style.display = "inline-block";
        labelElement.style.marginLeft = "6px";
        labelElement.style.verticalAlign = "middle";
        var compoundInput = document.createElement("div");
        Utils.appendChild(element, this._checkboxInputElement);
        Utils.appendChild(element, labelElement);
        return element;
    };
    ToggleInput.prototype.getJsonTypeName = function () {
        return "Input.Toggle";
    };
    ToggleInput.prototype.parse = function (json) {
        _super.prototype.parse.call(this, json);
        this.title = json["title"];
        this.valueOn = Utils.getValueOrDefault(json["valueOn"], this.valueOn);
        this.valueOff = Utils.getValueOrDefault(json["valueOff"], this.valueOff);
    };
    Object.defineProperty(ToggleInput.prototype, "value", {
        get: function () {
            if (this._checkboxInputElement) {
                return this._checkboxInputElement.checked ? this.valueOn : this.valueOff;
            }
            else {
                return null;
            }
        },
        enumerable: true,
        configurable: true
    });
    return ToggleInput;
}(Input));
exports.ToggleInput = ToggleInput;
var Choice = /** @class */ (function () {
    function Choice() {
    }
    return Choice;
}());
exports.Choice = Choice;
var ChoiceSetInput = /** @class */ (function (_super) {
    __extends(ChoiceSetInput, _super);
    function ChoiceSetInput() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.choices = [];
        return _this;
    }
    ChoiceSetInput.prototype.internalRender = function () {
        if (!this.isMultiSelect) {
            if (this.isCompact) {
                // Render as a combo box
                this._selectElement = document.createElement("select");
                this._selectElement.className = "ac-input ac-multichoiceInput";
                this._selectElement.style.width = "100%";
                var option = document.createElement("option");
                option.selected = true;
                option.disabled = true;
                option.hidden = true;
                if (this.placeholder) {
                    option.text = this.placeholder;
                }
                Utils.appendChild(this._selectElement, option);
                for (var i = 0; i < this.choices.length; i++) {
                    var option = document.createElement("option");
                    option.value = this.choices[i].value;
                    option.text = this.choices[i].title;
                    option.setAttribute("aria-label", this.choices[i].title);
                    if (this.choices[i].value == this.defaultValue) {
                        option.selected = true;
                    }
                    Utils.appendChild(this._selectElement, option);
                }
                return this._selectElement;
            }
            else {
                // Render as a series of radio buttons
                var element = document.createElement("div");
                element.className = "ac-input";
                element.style.width = "100%";
                this._toggleInputs = [];
                for (var i = 0; i < this.choices.length; i++) {
                    var radioInput = document.createElement("input");
                    radioInput.type = "radio";
                    radioInput.style.margin = "0";
                    radioInput.style.display = "inline-block";
                    radioInput.style.verticalAlign = "middle";
                    radioInput.name = this.id;
                    radioInput.value = this.choices[i].value;
                    radioInput.style.flex = "0 0 auto";
                    radioInput.setAttribute("aria-label", this.choices[i].title);
                    if (this.choices[i].value == this.defaultValue) {
                        radioInput.checked = true;
                    }
                    this._toggleInputs.push(radioInput);
                    var label = new TextBlock();
                    label.hostConfig = this.hostConfig;
                    label.text = this.choices[i].title;
                    label.useMarkdown = AdaptiveCard.useMarkdownInRadioButtonAndCheckbox;
                    var labelElement = label.render();
                    labelElement.style.display = "inline-block";
                    labelElement.style.marginLeft = "6px";
                    labelElement.style.verticalAlign = "middle";
                    var compoundInput = document.createElement("div");
                    compoundInput.style.display = "flex";
                    Utils.appendChild(compoundInput, radioInput);
                    Utils.appendChild(compoundInput, labelElement);
                    Utils.appendChild(element, compoundInput);
                }
                return element;
            }
        }
        else {
            // Render as a list of toggle inputs
            var defaultValues = this.defaultValue ? this.defaultValue.split(this.hostConfig.choiceSetInputValueSeparator) : null;
            var element = document.createElement("div");
            element.className = "ac-input";
            element.style.width = "100%";
            this._toggleInputs = [];
            for (var i = 0; i < this.choices.length; i++) {
                var checkboxInput = document.createElement("input");
                checkboxInput.type = "checkbox";
                checkboxInput.style.margin = "0";
                checkboxInput.style.display = "inline-block";
                checkboxInput.style.verticalAlign = "middle";
                checkboxInput.value = this.choices[i].value;
                checkboxInput.style.flex = "0 0 auto";
                checkboxInput.setAttribute("aria-label", this.choices[i].title);
                if (defaultValues) {
                    if (defaultValues.indexOf(this.choices[i].value) >= 0) {
                        checkboxInput.checked = true;
                    }
                }
                this._toggleInputs.push(checkboxInput);
                var label = new TextBlock();
                label.hostConfig = this.hostConfig;
                label.text = this.choices[i].title;
                label.useMarkdown = AdaptiveCard.useMarkdownInRadioButtonAndCheckbox;
                var labelElement = label.render();
                labelElement.style.display = "inline-block";
                labelElement.style.marginLeft = "6px";
                labelElement.style.verticalAlign = "middle";
                var compoundInput = document.createElement("div");
                compoundInput.style.display = "flex";
                Utils.appendChild(compoundInput, checkboxInput);
                Utils.appendChild(compoundInput, labelElement);
                Utils.appendChild(element, compoundInput);
            }
            return element;
        }
    };
    ChoiceSetInput.prototype.getJsonTypeName = function () {
        return "Input.ChoiceSet";
    };
    ChoiceSetInput.prototype.validate = function () {
        var result = [];
        if (this.choices.length == 0) {
            result = [{ error: Enums.ValidationError.CollectionCantBeEmpty, message: "An Input.ChoiceSet must have at least one choice defined." }];
        }
        for (var i = 0; i < this.choices.length; i++) {
            if (!this.choices[i].title || !this.choices[i].value) {
                result = result.concat([{ error: Enums.ValidationError.PropertyCantBeNull, message: "All choices in an Input.ChoiceSet must have their title and value properties set." }]);
                break;
            }
        }
        return result;
    };
    ChoiceSetInput.prototype.parse = function (json) {
        _super.prototype.parse.call(this, json);
        this.isCompact = !(json["style"] === "expanded");
        this.isMultiSelect = json["isMultiSelect"];
        this.placeholder = json["placeholder"];
        if (json["choices"] != undefined) {
            var choiceArray = json["choices"];
            this.choices = [];
            for (var i = 0; i < choiceArray.length; i++) {
                var choice = new Choice();
                choice.title = choiceArray[i]["title"];
                choice.value = choiceArray[i]["value"];
                this.choices.push(choice);
            }
        }
    };
    Object.defineProperty(ChoiceSetInput.prototype, "value", {
        get: function () {
            if (!this.isMultiSelect) {
                if (this.isCompact) {
                    return this._selectElement ? this._selectElement.value : null;
                }
                else {
                    if (!this._toggleInputs || this._toggleInputs.length == 0) {
                        return null;
                    }
                    for (var i = 0; i < this._toggleInputs.length; i++) {
                        if (this._toggleInputs[i].checked) {
                            return this._toggleInputs[i].value;
                        }
                    }
                    return null;
                }
            }
            else {
                if (!this._toggleInputs || this._toggleInputs.length == 0) {
                    return null;
                }
                var result = "";
                for (var i = 0; i < this._toggleInputs.length; i++) {
                    if (this._toggleInputs[i].checked) {
                        if (result != "") {
                            result += this.hostConfig.choiceSetInputValueSeparator;
                        }
                        result += this._toggleInputs[i].value;
                    }
                }
                return result == "" ? null : result;
            }
        },
        enumerable: true,
        configurable: true
    });
    return ChoiceSetInput;
}(Input));
exports.ChoiceSetInput = ChoiceSetInput;
var NumberInput = /** @class */ (function (_super) {
    __extends(NumberInput, _super);
    function NumberInput() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NumberInput.prototype.internalRender = function () {
        this._numberInputElement = document.createElement("input");
        this._numberInputElement.setAttribute("type", "number");
        this._numberInputElement.className = "ac-input ac-numberInput";
        this._numberInputElement.setAttribute("min", this.min);
        this._numberInputElement.setAttribute("max", this.max);
        this._numberInputElement.style.width = "100%";
        this._numberInputElement.tabIndex = 0;
        if (!Utils.isNullOrEmpty(this.defaultValue)) {
            this._numberInputElement.value = this.defaultValue;
        }
        if (!Utils.isNullOrEmpty(this.placeholder)) {
            this._numberInputElement.placeholder = this.placeholder;
            this._numberInputElement.setAttribute("aria-label", this.placeholder);
        }
        return this._numberInputElement;
    };
    NumberInput.prototype.getJsonTypeName = function () {
        return "Input.Number";
    };
    NumberInput.prototype.parse = function (json) {
        _super.prototype.parse.call(this, json);
        this.placeholder = json["placeholder"];
        this.min = json["min"];
        this.max = json["max"];
    };
    Object.defineProperty(NumberInput.prototype, "value", {
        get: function () {
            return this._numberInputElement ? this._numberInputElement.value : null;
        },
        enumerable: true,
        configurable: true
    });
    return NumberInput;
}(Input));
exports.NumberInput = NumberInput;
var DateInput = /** @class */ (function (_super) {
    __extends(DateInput, _super);
    function DateInput() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DateInput.prototype.internalRender = function () {
        this._dateInputElement = document.createElement("input");
        this._dateInputElement.setAttribute("type", "date");
        this._dateInputElement.className = "ac-input ac-dateInput";
        this._dateInputElement.style.width = "100%";
        if (!Utils.isNullOrEmpty(this.defaultValue)) {
            this._dateInputElement.value = this.defaultValue;
        }
        return this._dateInputElement;
    };
    DateInput.prototype.getJsonTypeName = function () {
        return "Input.Date";
    };
    Object.defineProperty(DateInput.prototype, "value", {
        get: function () {
            return this._dateInputElement ? this._dateInputElement.value : null;
        },
        enumerable: true,
        configurable: true
    });
    return DateInput;
}(Input));
exports.DateInput = DateInput;
var TimeInput = /** @class */ (function (_super) {
    __extends(TimeInput, _super);
    function TimeInput() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TimeInput.prototype.internalRender = function () {
        this._timeInputElement = document.createElement("input");
        this._timeInputElement.setAttribute("type", "time");
        this._timeInputElement.className = "ac-input ac-timeInput";
        this._timeInputElement.style.width = "100%";
        if (!Utils.isNullOrEmpty(this.defaultValue)) {
            this._timeInputElement.value = this.defaultValue;
        }
        return this._timeInputElement;
    };
    TimeInput.prototype.getJsonTypeName = function () {
        return "Input.Time";
    };
    Object.defineProperty(TimeInput.prototype, "value", {
        get: function () {
            return this._timeInputElement ? this._timeInputElement.value : null;
        },
        enumerable: true,
        configurable: true
    });
    return TimeInput;
}(Input));
exports.TimeInput = TimeInput;
var ActionButtonState;
(function (ActionButtonState) {
    ActionButtonState[ActionButtonState["Normal"] = 0] = "Normal";
    ActionButtonState[ActionButtonState["Expanded"] = 1] = "Expanded";
    ActionButtonState[ActionButtonState["Subdued"] = 2] = "Subdued";
})(ActionButtonState || (ActionButtonState = {}));
var ActionButton = /** @class */ (function () {
    function ActionButton(action) {
        var _this = this;
        this._element = null;
        this._state = ActionButtonState.Normal;
        this.onClick = null;
        this._action = action;
        this._element = document.createElement("button");
        this._element.type = "button";
        this._element.style.overflow = "hidden";
        this._element.style.whiteSpace = "nowrap";
        this._element.style.textOverflow = "ellipsis";
        this._element.onclick = function (e) { _this.click(); };
        this.updateCssStyle();
    }
    ActionButton.prototype.click = function () {
        if (this.onClick != null) {
            this.onClick(this);
        }
    };
    ActionButton.prototype.updateCssStyle = function () {
        this._element.className = "ac-pushButton";
        if (this._action instanceof ShowCardAction) {
            this._element.classList.add("expandable");
        }
        switch (this._state) {
            case ActionButtonState.Expanded:
                this._element.classList.add("expanded");
                break;
            case ActionButtonState.Subdued:
                this._element.classList.add("subdued");
                break;
        }
    };
    Object.defineProperty(ActionButton.prototype, "action", {
        get: function () {
            return this._action;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ActionButton.prototype, "text", {
        get: function () {
            return this._text;
        },
        set: function (value) {
            this._text = value;
            this._element.innerText = this._text;
            this._element.setAttribute("aria-label", this._text);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ActionButton.prototype, "element", {
        get: function () {
            return this._element;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ActionButton.prototype, "state", {
        get: function () {
            return this._state;
        },
        set: function (value) {
            this._state = value;
            this.updateCssStyle();
        },
        enumerable: true,
        configurable: true
    });
    return ActionButton;
}());
var Action = /** @class */ (function () {
    function Action() {
        this._parent = null;
        this._actionCollection = null; // hold the reference to its action collection
    }
    Action.prototype.setParent = function (value) {
        this._parent = value;
    };
    Action.prototype.execute = function () {
        raiseExecuteActionEvent(this);
    };
    Action.prototype.setCollection = function (actionCollection) {
        this._actionCollection = actionCollection;
    };
    // Expand the action card pane with a inline status card
    // Null status will clear the status bar
    Action.prototype.setStatus = function (status) {
        if (this._actionCollection == null) {
            return;
        }
        if (status) {
            var statusCard = new InlineAdaptiveCard();
            statusCard.parse(status);
            this._actionCollection.showStatusCard(statusCard);
        }
        else {
            this._actionCollection.hideStatusCard();
        }
    };
    Action.prototype.validate = function () {
        return [];
    };
    Action.prototype.prepare = function (inputs) {
        // Do nothing in base implementation
    };
    ;
    Action.prototype.parse = function (json) {
        this.id = json["id"];
        this.title = json["title"];
    };
    Action.prototype.getAllInputs = function () {
        return [];
    };
    Action.prototype.getActionById = function (id) {
        if (this.id == id) {
            return this;
        }
    };
    Object.defineProperty(Action.prototype, "parent", {
        get: function () {
            return this._parent;
        },
        enumerable: true,
        configurable: true
    });
    return Action;
}());
exports.Action = Action;
var SubmitAction = /** @class */ (function (_super) {
    __extends(SubmitAction, _super);
    function SubmitAction() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._isPrepared = false;
        return _this;
    }
    SubmitAction.prototype.getJsonTypeName = function () {
        return "Action.Submit";
    };
    SubmitAction.prototype.prepare = function (inputs) {
        if (this._originalData) {
            this._processedData = JSON.parse(JSON.stringify(this._originalData));
        }
        else {
            this._processedData = {};
        }
        for (var i = 0; i < inputs.length; i++) {
            var inputValue = inputs[i].value;
            if (inputValue != null) {
                this._processedData[inputs[i].id] = inputs[i].value;
            }
        }
        this._isPrepared = true;
    };
    SubmitAction.prototype.parse = function (json) {
        _super.prototype.parse.call(this, json);
        this.data = json["data"];
    };
    Object.defineProperty(SubmitAction.prototype, "data", {
        get: function () {
            return this._isPrepared ? this._processedData : this._originalData;
        },
        set: function (value) {
            this._originalData = value;
            this._isPrepared = false;
        },
        enumerable: true,
        configurable: true
    });
    return SubmitAction;
}(Action));
exports.SubmitAction = SubmitAction;
var OpenUrlAction = /** @class */ (function (_super) {
    __extends(OpenUrlAction, _super);
    function OpenUrlAction() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    OpenUrlAction.prototype.getJsonTypeName = function () {
        return "Action.OpenUrl";
    };
    OpenUrlAction.prototype.validate = function () {
        if (!this.url) {
            return [{ error: Enums.ValidationError.PropertyCantBeNull, message: "An Action.OpenUrl must have its url property set." }];
        }
        else {
            return [];
        }
    };
    OpenUrlAction.prototype.parse = function (json) {
        _super.prototype.parse.call(this, json);
        this.url = json["url"];
    };
    return OpenUrlAction;
}(Action));
exports.OpenUrlAction = OpenUrlAction;
var HttpHeader = /** @class */ (function () {
    function HttpHeader() {
        this._value = new Utils.StringWithSubstitutions();
    }
    HttpHeader.prototype.prepare = function (inputs) {
        this._value.substituteInputValues(inputs, Utils.ContentTypes.applicationXWwwFormUrlencoded);
    };
    Object.defineProperty(HttpHeader.prototype, "value", {
        get: function () {
            return this._value.get();
        },
        set: function (newValue) {
            this._value.set(newValue);
        },
        enumerable: true,
        configurable: true
    });
    return HttpHeader;
}());
exports.HttpHeader = HttpHeader;
var HttpAction = /** @class */ (function (_super) {
    __extends(HttpAction, _super);
    function HttpAction() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._url = new Utils.StringWithSubstitutions();
        _this._body = new Utils.StringWithSubstitutions();
        _this._headers = [];
        return _this;
    }
    HttpAction.prototype.getJsonTypeName = function () {
        return "Action.Http";
    };
    HttpAction.prototype.validate = function () {
        var result = [];
        if (!this.url) {
            result = [{ error: Enums.ValidationError.PropertyCantBeNull, message: "An Action.Http must have its url property set." }];
        }
        if (this.headers.length > 0) {
            for (var i = 0; i < this.headers.length; i++) {
                if (!this.headers[i].name || !this.headers[i].value) {
                    result = result.concat([{ error: Enums.ValidationError.PropertyCantBeNull, message: "All headers of an Action.Http must have their name and value properties set." }]);
                    break;
                }
            }
        }
        return result;
    };
    HttpAction.prototype.prepare = function (inputs) {
        this._url.substituteInputValues(inputs, Utils.ContentTypes.applicationXWwwFormUrlencoded);
        var contentType = Utils.ContentTypes.applicationJson;
        for (var i = 0; i < this._headers.length; i++) {
            this._headers[i].prepare(inputs);
            if (this._headers[i].name && this._headers[i].name.toLowerCase() == "content-type") {
                contentType = this._headers[i].value;
            }
        }
        this._body.substituteInputValues(inputs, contentType);
    };
    ;
    HttpAction.prototype.parse = function (json) {
        _super.prototype.parse.call(this, json);
        this.url = json["url"];
        this.method = json["method"];
        this.body = json["body"];
        if (json["headers"] != null) {
            var jsonHeaders = json["headers"];
            this._headers = [];
            for (var i = 0; i < jsonHeaders.length; i++) {
                var httpHeader = new HttpHeader();
                httpHeader.name = jsonHeaders[i]["name"];
                httpHeader.value = jsonHeaders[i]["value"];
                this.headers.push(httpHeader);
            }
        }
    };
    Object.defineProperty(HttpAction.prototype, "url", {
        get: function () {
            return this._url.get();
        },
        set: function (value) {
            this._url.set(value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HttpAction.prototype, "body", {
        get: function () {
            return this._body.get();
        },
        set: function (value) {
            this._body.set(value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HttpAction.prototype, "headers", {
        get: function () {
            return this._headers;
        },
        enumerable: true,
        configurable: true
    });
    return HttpAction;
}(Action));
exports.HttpAction = HttpAction;
var ShowCardAction = /** @class */ (function (_super) {
    __extends(ShowCardAction, _super);
    function ShowCardAction() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.card = new InlineAdaptiveCard();
        return _this;
    }
    ShowCardAction.prototype.getJsonTypeName = function () {
        return "Action.ShowCard";
    };
    ShowCardAction.prototype.validate = function () {
        return this.card.validate();
    };
    ShowCardAction.prototype.parse = function (json) {
        _super.prototype.parse.call(this, json);
        this.card.parse(json["card"]);
    };
    ShowCardAction.prototype.setParent = function (value) {
        _super.prototype.setParent.call(this, value);
        this.card.setParent(value);
    };
    ShowCardAction.prototype.getAllInputs = function () {
        return this.card.getAllInputs();
    };
    ShowCardAction.prototype.getActionById = function (id) {
        var result = _super.prototype.getActionById.call(this, id);
        if (!result) {
            result = this.card.getActionById(id);
        }
        return result;
    };
    return ShowCardAction;
}(Action));
exports.ShowCardAction = ShowCardAction;
var ActionCollection = /** @class */ (function () {
    function ActionCollection(owner) {
        this._actionButtons = [];
        this._expandedAction = null;
        this._renderedActionCount = 0;
        this._statusCard = null;
        this._actionCard = null;
        this.items = [];
        this.onHideActionCardPane = null;
        this.onShowActionCardPane = null;
        this._owner = owner;
    }
    ActionCollection.prototype.showStatusCard = function (status) {
        status.setParent(this._owner);
        this._statusCard = status.render();
        this.refreshContainer();
    };
    ActionCollection.prototype.hideStatusCard = function () {
        this._statusCard = null;
        this.refreshContainer();
    };
    ActionCollection.prototype.refreshContainer = function () {
        this._actionCardContainer.innerHTML = "";
        if (this._actionCard === null && this._statusCard === null) {
            this._actionCardContainer.style.padding = "0px";
            this._actionCardContainer.style.marginTop = "0px";
            if (this.onHideActionCardPane) {
                this.onHideActionCardPane();
            }
            return;
        }
        if (this.onShowActionCardPane) {
            this.onShowActionCardPane(null);
        }
        this._actionCardContainer.style.marginTop = this._renderedActionCount > 0 ? this._owner.hostConfig.actions.showCard.inlineTopMargin + "px" : "0px";
        var padding = this._owner.getNonZeroPadding().toSpacingDefinition(this._owner.hostConfig);
        if (this._actionCard !== null) {
            this._actionCard.style.paddingLeft = padding.left + "px";
            this._actionCard.style.paddingRight = padding.right + "px";
            this._actionCard.style.marginLeft = "-" + padding.left + "px";
            this._actionCard.style.marginRight = "-" + padding.right + "px";
            Utils.appendChild(this._actionCardContainer, this._actionCard);
        }
        if (this._statusCard !== null) {
            this._statusCard.style.paddingLeft = padding.left + "px";
            this._statusCard.style.paddingRight = padding.right + "px";
            this._statusCard.style.marginLeft = "-" + padding.left + "px";
            this._statusCard.style.marginRight = "-" + padding.right + "px";
            Utils.appendChild(this._actionCardContainer, this._statusCard);
        }
    };
    ActionCollection.prototype.hideActionCard = function () {
        if (this._expandedAction) {
            raiseInlineCardExpandedEvent(this._expandedAction, false);
        }
        this._expandedAction = null;
        this._actionCard = null;
        this.refreshContainer();
    };
    ActionCollection.prototype.showActionCard = function (action, suppressStyle) {
        if (suppressStyle === void 0) { suppressStyle = false; }
        if (action.card == null) {
            return;
        }
        action.card.suppressStyle = suppressStyle;
        var renderedCard = action.card.render();
        this._actionCard = renderedCard;
        this._expandedAction = action;
        this.refreshContainer();
        raiseInlineCardExpandedEvent(action, true);
    };
    ActionCollection.prototype.actionClicked = function (actionButton) {
        if (!(actionButton.action instanceof ShowCardAction)) {
            for (var i = 0; i < this._actionButtons.length; i++) {
                this._actionButtons[i].state = ActionButtonState.Normal;
            }
            this.hideStatusCard();
            this.hideActionCard();
            actionButton.action.execute();
        }
        else {
            this.hideStatusCard();
            if (this._owner.hostConfig.actions.showCard.actionMode === Enums.ShowCardActionMode.Popup) {
                actionButton.action.execute();
            }
            else if (actionButton.action === this._expandedAction) {
                for (var i = 0; i < this._actionButtons.length; i++) {
                    this._actionButtons[i].state = ActionButtonState.Normal;
                }
                this.hideActionCard();
            }
            else {
                for (var i = 0; i < this._actionButtons.length; i++) {
                    if (this._actionButtons[i] !== actionButton) {
                        this._actionButtons[i].state = ActionButtonState.Subdued;
                    }
                }
                actionButton.state = ActionButtonState.Expanded;
                this.showActionCard(actionButton.action, !(this._owner.isAtTheVeryLeft() && this._owner.isAtTheVeryRight()));
            }
        }
    };
    ActionCollection.prototype.getActionById = function (id) {
        var result = null;
        for (var i = 0; i < this.items.length; i++) {
            result = this.items[i].getActionById(id);
            if (result) {
                break;
            }
        }
        return result;
    };
    ActionCollection.prototype.validate = function () {
        var result = [];
        if (this._owner.hostConfig.actions.maxActions && this.items.length > this._owner.hostConfig.actions.maxActions) {
            result.push({
                error: Enums.ValidationError.TooManyActions,
                message: "A maximum of " + this._owner.hostConfig.actions.maxActions + " actions are allowed."
            });
        }
        if (this.items.length > 0 && !this._owner.hostConfig.supportsInteractivity) {
            result.push({
                error: Enums.ValidationError.InteractivityNotAllowed,
                message: "Interactivity is not allowed."
            });
        }
        for (var i = 0; i < this.items.length; i++) {
            if (!isActionAllowed(this.items[i], this._owner.getForbiddenActionTypes())) {
                result.push({
                    error: Enums.ValidationError.ActionTypeNotAllowed,
                    message: "Actions of type " + this.items[i].getJsonTypeName() + " are not allowe."
                });
            }
        }
        for (var i = 0; i < this.items.length; i++) {
            result = result.concat(this.items[i].validate());
        }
        return result;
    };
    ActionCollection.prototype.render = function (orientation) {
        var _this = this;
        if (!this._owner.hostConfig.supportsInteractivity) {
            return null;
        }
        var element = document.createElement("div");
        this._actionCardContainer = document.createElement("div");
        this._renderedActionCount = 0;
        var maxActions = this._owner.hostConfig.actions.maxActions ? Math.min(this._owner.hostConfig.actions.maxActions, this.items.length) : this.items.length;
        var forbiddenActionTypes = this._owner.getForbiddenActionTypes();
        if (AdaptiveCard.preExpandSingleShowCardAction && maxActions == 1 && this.items[0] instanceof ShowCardAction && isActionAllowed(this.items[i], forbiddenActionTypes)) {
            this.showActionCard(this.items[0], true);
            this._renderedActionCount = 1;
        }
        else {
            var buttonStrip = document.createElement("div");
            buttonStrip.style.display = "flex";
            if (orientation == Enums.Orientation.Horizontal) {
                buttonStrip.style.flexDirection = "row";
                if (this._owner.horizontalAlignment && this._owner.hostConfig.actions.actionAlignment != Enums.ActionAlignment.Stretch) {
                    switch (this._owner.horizontalAlignment) {
                        case Enums.HorizontalAlignment.Center:
                            buttonStrip.style.justifyContent = "center";
                            break;
                        case Enums.HorizontalAlignment.Right:
                            buttonStrip.style.justifyContent = "flex-end";
                            break;
                        default:
                            buttonStrip.style.justifyContent = "flex-start";
                            break;
                    }
                }
                else {
                    switch (this._owner.hostConfig.actions.actionAlignment) {
                        case Enums.ActionAlignment.Center:
                            buttonStrip.style.justifyContent = "center";
                            break;
                        case Enums.ActionAlignment.Right:
                            buttonStrip.style.justifyContent = "flex-end";
                            break;
                        default:
                            buttonStrip.style.justifyContent = "flex-start";
                            break;
                    }
                }
            }
            else {
                buttonStrip.style.flexDirection = "column";
                if (this._owner.horizontalAlignment && this._owner.hostConfig.actions.actionAlignment != Enums.ActionAlignment.Stretch) {
                    switch (this._owner.horizontalAlignment) {
                        case Enums.HorizontalAlignment.Center:
                            buttonStrip.style.alignItems = "center";
                            break;
                        case Enums.HorizontalAlignment.Right:
                            buttonStrip.style.alignItems = "flex-end";
                            break;
                        default:
                            buttonStrip.style.alignItems = "flex-start";
                            break;
                    }
                }
                else {
                    switch (this._owner.hostConfig.actions.actionAlignment) {
                        case Enums.ActionAlignment.Center:
                            buttonStrip.style.alignItems = "center";
                            break;
                        case Enums.ActionAlignment.Right:
                            buttonStrip.style.alignItems = "flex-end";
                            break;
                        case Enums.ActionAlignment.Stretch:
                            buttonStrip.style.alignItems = "stretch";
                            break;
                        default:
                            buttonStrip.style.alignItems = "flex-start";
                            break;
                    }
                }
            }
            for (var i = 0; i < this.items.length; i++) {
                if (isActionAllowed(this.items[i], forbiddenActionTypes)) {
                    var actionButton = new ActionButton(this.items[i]);
                    actionButton.element.style.overflow = "hidden";
                    actionButton.element.style.overflow = "table-cell";
                    actionButton.element.style.flex = this._owner.hostConfig.actions.actionAlignment === Enums.ActionAlignment.Stretch ? "0 1 100%" : "0 1 auto";
                    actionButton.text = this.items[i].title;
                    actionButton.onClick = function (ab) { _this.actionClicked(ab); };
                    this._actionButtons.push(actionButton);
                    buttonStrip.appendChild(actionButton.element);
                    this._renderedActionCount++;
                    if (this._renderedActionCount >= this._owner.hostConfig.actions.maxActions || i == this.items.length - 1) {
                        break;
                    }
                    else if (this._owner.hostConfig.actions.buttonSpacing > 0) {
                        var spacer = document.createElement("div");
                        if (orientation === Enums.Orientation.Horizontal) {
                            spacer.style.flex = "0 0 auto";
                            spacer.style.width = this._owner.hostConfig.actions.buttonSpacing + "px";
                        }
                        else {
                            spacer.style.height = this._owner.hostConfig.actions.buttonSpacing + "px";
                        }
                        Utils.appendChild(buttonStrip, spacer);
                    }
                }
            }
            var buttonStripContainer = document.createElement("div");
            buttonStripContainer.style.overflow = "hidden";
            buttonStripContainer.appendChild(buttonStrip);
            Utils.appendChild(element, buttonStripContainer);
        }
        Utils.appendChild(element, this._actionCardContainer);
        return this._renderedActionCount > 0 ? element : null;
    };
    ActionCollection.prototype.addAction = function (action) {
        if (!action.parent) {
            this.items.push(action);
            action.setParent(this._owner);
            invokeSetCollection(action, this);
        }
        else {
            throw new Error("The action already belongs to another element.");
        }
    };
    ActionCollection.prototype.clear = function () {
        this.items = [];
    };
    ActionCollection.prototype.getAllInputs = function () {
        var result = [];
        for (var i = 0; i < this.items.length; i++) {
            var action = this.items[i];
            result = result.concat(action.getAllInputs());
        }
        return result;
    };
    return ActionCollection;
}());
var ActionSet = /** @class */ (function (_super) {
    __extends(ActionSet, _super);
    function ActionSet() {
        var _this = _super.call(this) || this;
        _this.orientation = null;
        _this._actionCollection = new ActionCollection(_this);
        _this._actionCollection.onHideActionCardPane = function () { _this.showBottomSpacer(_this); };
        _this._actionCollection.onShowActionCardPane = function (action) { _this.hideBottomSpacer(_this); };
        return _this;
    }
    ActionSet.prototype.internalRender = function () {
        return this._actionCollection.render(this.orientation ? this.orientation : this.hostConfig.actions.actionsOrientation);
    };
    ActionSet.prototype.getJsonTypeName = function () {
        return "ActionSet";
    };
    ActionSet.prototype.validate = function () {
        return this._actionCollection.validate();
    };
    ActionSet.prototype.parse = function (json, itemsCollectionPropertyName) {
        if (itemsCollectionPropertyName === void 0) { itemsCollectionPropertyName = "items"; }
        _super.prototype.parse.call(this, json);
        var jsonOrientation = json["orientation"];
        if (jsonOrientation) {
            this.orientation = Utils.getEnumValueOrDefault(Enums.Orientation, jsonOrientation, Enums.Orientation.Horizontal);
        }
        if (json["actions"] != undefined) {
            var jsonActions = json["actions"];
            for (var i = 0; i < jsonActions.length; i++) {
                this.addAction(createActionInstance(jsonActions[i]));
            }
        }
    };
    ActionSet.prototype.addAction = function (action) {
        if (action != null) {
            this._actionCollection.addAction(action);
        }
    };
    ActionSet.prototype.getAllInputs = function () {
        return this._actionCollection.getAllInputs();
    };
    ActionSet.prototype.renderSpeech = function () {
        // TODO: What's the right thing to do here?
        return "";
    };
    Object.defineProperty(ActionSet.prototype, "isInteractive", {
        get: function () {
            return true;
        },
        enumerable: true,
        configurable: true
    });
    return ActionSet;
}(CardElement));
exports.ActionSet = ActionSet;
var BackgroundImage = /** @class */ (function () {
    function BackgroundImage() {
        this.mode = Enums.BackgroundImageMode.Stretch;
        this.horizontalAlignment = Enums.HorizontalAlignment.Left;
        this.verticalAlignment = Enums.VerticalAlignment.Top;
    }
    BackgroundImage.prototype.parse = function (json) {
        this.url = json["url"];
        this.mode = Utils.getEnumValueOrDefault(Enums.BackgroundImageMode, json["mode"], this.mode);
        this.horizontalAlignment = Utils.getEnumValueOrDefault(Enums.HorizontalAlignment, json["horizontalAlignment"], this.horizontalAlignment);
        this.verticalAlignment = Utils.getEnumValueOrDefault(Enums.VerticalAlignment, json["verticalAlignment"], this.verticalAlignment);
    };
    BackgroundImage.prototype.apply = function (element) {
        if (this.url) {
            element.style.backgroundImage = "url('" + this.url + "')";
            switch (this.mode) {
                case Enums.BackgroundImageMode.Repeat:
                    element.style.backgroundRepeat = "repeat";
                    break;
                case Enums.BackgroundImageMode.RepeatHorizontally:
                    element.style.backgroundRepeat = "repeat-x";
                    break;
                case Enums.BackgroundImageMode.RepeatVertically:
                    element.style.backgroundRepeat = "repeat-y";
                    break;
                case Enums.BackgroundImageMode.Stretch:
                default:
                    element.style.backgroundRepeat = "no-repeat";
                    element.style.backgroundSize = "cover";
                    break;
            }
            switch (this.horizontalAlignment) {
                case Enums.HorizontalAlignment.Center:
                    element.style.backgroundPositionX = "center";
                    break;
                case Enums.HorizontalAlignment.Right:
                    element.style.backgroundPositionX = "right";
                    break;
            }
            switch (this.verticalAlignment) {
                case Enums.VerticalAlignment.Center:
                    element.style.backgroundPositionY = "center";
                    break;
                case Enums.VerticalAlignment.Bottom:
                    element.style.backgroundPositionY = "bottom";
                    break;
            }
        }
    };
    return BackgroundImage;
}());
exports.BackgroundImage = BackgroundImage;
var Container = /** @class */ (function (_super) {
    __extends(Container, _super);
    function Container() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._items = [];
        _this._style = null;
        _this.verticalContentAlignment = Enums.VerticalAlignment.Top;
        return _this;
    }
    Container.prototype.isElementAllowed = function (element, forbiddenElementTypes) {
        if (!this.hostConfig.supportsInteractivity && element.isInteractive) {
            return false;
        }
        if (forbiddenElementTypes) {
            for (var i = 0; i < forbiddenElementTypes.length; i++) {
                if (element.getJsonTypeName() === forbiddenElementTypes[i]) {
                    return false;
                }
            }
        }
        return true;
    };
    Object.defineProperty(Container.prototype, "hasExplicitStyle", {
        get: function () {
            return this._style != null;
        },
        enumerable: true,
        configurable: true
    });
    Container.prototype.showBottomSpacer = function (requestingElement) {
        if ((!requestingElement || this.isLastElement(requestingElement))) {
            this.applyPadding();
            _super.prototype.showBottomSpacer.call(this, requestingElement);
        }
    };
    Container.prototype.hideBottomSpacer = function (requestingElement) {
        if ((!requestingElement || this.isLastElement(requestingElement))) {
            if (this.renderedElement) {
                this.renderedElement.style.paddingBottom = "0px";
            }
            _super.prototype.hideBottomSpacer.call(this, requestingElement);
        }
    };
    Container.prototype.applyPadding = function () {
        if (this.padding) {
            if (this.renderedElement) {
                var physicalPadding = this.padding.toSpacingDefinition(this.hostConfig);
                this.renderedElement.style.paddingTop = physicalPadding.top + "px";
                this.renderedElement.style.paddingRight = physicalPadding.right + "px";
                this.renderedElement.style.paddingBottom = physicalPadding.bottom + "px";
                this.renderedElement.style.paddingLeft = physicalPadding.left + "px";
            }
        }
        else if (this.hasBackground) {
            var physicalMargin = new SpacingDefinition();
            var physicalPadding = new SpacingDefinition();
            var useAutoPadding = (this.parent ? this.parent.canContentBleed() : false) && AdaptiveCard.useAutomaticContainerBleeding;
            if (useAutoPadding) {
                var effectivePadding = this.getNonZeroPadding();
                var effectiveMargin = new PaddingDefinition(effectivePadding.top, effectivePadding.right, effectivePadding.bottom, effectivePadding.left);
                if (!this.isAtTheVeryTop()) {
                    effectivePadding.top = Enums.Spacing.None;
                    effectiveMargin.top = Enums.Spacing.None;
                }
                if (!this.isAtTheVeryBottom()) {
                    effectivePadding.bottom = Enums.Spacing.None;
                    effectiveMargin.bottom = Enums.Spacing.None;
                }
                if (!this.isAtTheVeryLeft()) {
                    effectivePadding.left = Enums.Spacing.None;
                    effectiveMargin.left = Enums.Spacing.None;
                }
                if (!this.isAtTheVeryRight()) {
                    effectivePadding.right = Enums.Spacing.None;
                    effectiveMargin.right = Enums.Spacing.None;
                }
                if (effectivePadding.left != Enums.Spacing.None || effectivePadding.right != Enums.Spacing.None) {
                    if (effectivePadding.left == Enums.Spacing.None) {
                        effectivePadding.left = effectivePadding.right;
                    }
                    if (effectivePadding.right == Enums.Spacing.None) {
                        effectivePadding.right = effectivePadding.left;
                    }
                }
                if (effectivePadding.top != Enums.Spacing.None || effectivePadding.bottom != Enums.Spacing.None) {
                    if (effectivePadding.top == Enums.Spacing.None) {
                        effectivePadding.top = effectivePadding.bottom;
                    }
                    if (effectivePadding.bottom == Enums.Spacing.None) {
                        effectivePadding.bottom = effectivePadding.top;
                    }
                }
                if (effectivePadding.top != Enums.Spacing.None
                    || effectivePadding.right != Enums.Spacing.None
                    || effectivePadding.bottom != Enums.Spacing.None
                    || effectivePadding.left != Enums.Spacing.None) {
                    if (effectivePadding.top == Enums.Spacing.None) {
                        effectivePadding.top = Enums.Spacing.Default;
                    }
                    if (effectivePadding.right == Enums.Spacing.None) {
                        effectivePadding.right = Enums.Spacing.Default;
                    }
                    if (effectivePadding.bottom == Enums.Spacing.None) {
                        effectivePadding = Object.assign({}, effectivePadding, {
                            bottom: Enums.Spacing.Default
                        });
                    }
                    if (effectivePadding.left == Enums.Spacing.None) {
                        effectivePadding = Object.assign({}, effectivePadding, {
                            left: Enums.Spacing.Default
                        });
                    }
                }
                if (effectivePadding.top == Enums.Spacing.None &&
                    effectivePadding.right == Enums.Spacing.None &&
                    effectivePadding.bottom == Enums.Spacing.None &&
                    effectivePadding.left == Enums.Spacing.None) {
                    effectivePadding = new PaddingDefinition(Enums.Spacing.Padding, Enums.Spacing.Padding, Enums.Spacing.Padding, Enums.Spacing.Padding);
                }
                physicalMargin = effectiveMargin.toSpacingDefinition(this.hostConfig);
                physicalPadding = effectivePadding.toSpacingDefinition(this.hostConfig);
            }
            else {
                physicalPadding = new PaddingDefinition(Enums.Spacing.Padding, Enums.Spacing.Padding, Enums.Spacing.Padding, Enums.Spacing.Padding).toSpacingDefinition(this.hostConfig);
            }
            if (this.renderedElement) {
                this.renderedElement.style.marginTop = "-" + physicalMargin.top + "px";
                this.renderedElement.style.marginRight = "-" + physicalMargin.right + "px";
                this.renderedElement.style.marginBottom = "-" + physicalMargin.bottom + "px";
                this.renderedElement.style.marginLeft = "-" + physicalMargin.left + "px";
                this.renderedElement.style.paddingTop = physicalPadding.top + "px";
                this.renderedElement.style.paddingRight = physicalPadding.right + "px";
                this.renderedElement.style.paddingBottom = physicalPadding.bottom + "px";
                this.renderedElement.style.paddingLeft = physicalPadding.left + "px";
            }
            if (this.separatorElement) {
                if (this.separatorOrientation == Enums.Orientation.Horizontal) {
                    this.separatorElement.style.marginLeft = "-" + physicalMargin.left + "px";
                    this.separatorElement.style.marginRight = "-" + physicalMargin.right + "px";
                }
                else {
                    this.separatorElement.style.marginTop = "-" + physicalMargin.top + "px";
                    this.separatorElement.style.marginBottom = "-" + physicalMargin.bottom + "px";
                }
            }
        }
    };
    Container.prototype.internalRender = function () {
        var _this = this;
        var element = document.createElement("div");
        element.className = "ac-container";
        element.style.display = "flex";
        element.style.flexDirection = "column";
        if (AdaptiveCard.useAdvancedCardBottomTruncation) {
            // Forces the container to be at least as tall as its content.
            //
            // Fixes a quirk in Chrome where, for nested flex elements, the
            // inner element's height would never exceed the outer element's
            // height. This caused overflow truncation to break -- containers
            // would always be measured as not overflowing, since their heights
            // were constrained by their parents as opposed to truly reflecting
            // the height of their content.
            //
            // See the "Browser Rendering Notes" section of this answer:
            // https://stackoverflow.com/questions/36247140/why-doesnt-flex-item-shrink-past-content-size
            element.style.minHeight = '-webkit-min-content';
        }
        switch (this.verticalContentAlignment) {
            case Enums.VerticalAlignment.Center:
                element.style.justifyContent = "center";
                break;
            case Enums.VerticalAlignment.Bottom:
                element.style.justifyContent = "flex-end";
                break;
            default:
                element.style.justifyContent = "flex-start";
                break;
        }
        if (this.hasBackground) {
            if (this.backgroundImage) {
                this.backgroundImage.apply(element);
            }
            var styleDefinition = this.hostConfig.containerStyles.getStyleByName(this.style, this.hostConfig.containerStyles.default);
            if (!Utils.isNullOrEmpty(styleDefinition.backgroundColor)) {
                element.style.backgroundColor = Utils.stringToCssColor(styleDefinition.backgroundColor);
            }
        }
        if (this.selectAction && this.hostConfig.supportsInteractivity) {
            element.classList.add("ac-selectable");
            element.tabIndex = 0;
            element.setAttribute("role", "button");
            element.setAttribute("aria-label", this.selectAction.title);
            element.onclick = function (e) {
                if (_this.selectAction != null) {
                    _this.selectAction.execute();
                    e.cancelBubble = true;
                }
            };
            element.onkeypress = function (e) {
                if (_this.selectAction != null) {
                    // Enter or space pressed
                    if (e.keyCode == 13 || e.keyCode == 32) {
                        _this.selectAction.execute();
                    }
                }
            };
        }
        if (this._items.length > 0) {
            var renderedElementCount = 0;
            for (var i = 0; i < this._items.length; i++) {
                var renderedElement = this.isElementAllowed(this._items[i], this.getForbiddenElementTypes()) ? this._items[i].render() : null;
                if (renderedElement) {
                    if (renderedElementCount > 0 && this._items[i].separatorElement) {
                        this._items[i].separatorElement.style.flex = "0 0 auto";
                        Utils.appendChild(element, this._items[i].separatorElement);
                    }
                    Utils.appendChild(element, renderedElement);
                    renderedElementCount++;
                }
            }
        }
        return element;
    };
    Container.prototype.truncateOverflow = function (maxHeight) {
        // Add 1 to account for rounding differences between browsers
        var boundary = this.renderedElement.offsetTop + maxHeight + 1;
        var handleElement = function (cardElement) {
            var elt = cardElement.renderedElement;
            if (elt) {
                switch (Utils.getFitStatus(elt, boundary)) {
                    case Enums.ContainerFitStatus.FullyInContainer:
                        var sizeChanged = cardElement['resetOverflow']();
                        // If the element's size changed after resetting content,
                        // we have to check if it still fits fully in the card
                        if (sizeChanged) {
                            handleElement(cardElement);
                        }
                        break;
                    case Enums.ContainerFitStatus.Overflowing:
                        var maxHeight_1 = boundary - elt.offsetTop;
                        cardElement['handleOverflow'](maxHeight_1);
                        break;
                    case Enums.ContainerFitStatus.FullyOutOfContainer:
                        cardElement['handleOverflow'](0);
                        break;
                }
            }
        };
        for (var _i = 0, _a = this._items; _i < _a.length; _i++) {
            var item = _a[_i];
            handleElement(item);
        }
        return true;
    };
    Container.prototype.undoOverflowTruncation = function () {
        for (var _i = 0, _a = this._items; _i < _a.length; _i++) {
            var item = _a[_i];
            item['resetOverflow']();
        }
    };
    Object.defineProperty(Container.prototype, "hasBackground", {
        get: function () {
            var parentContainer = this.getParentContainer();
            return this.backgroundImage != undefined || (this.hasExplicitStyle && (parentContainer ? parentContainer.style != this.style : false));
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Container.prototype, "defaultStyle", {
        get: function () {
            return Enums.ContainerStyle.Default;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Container.prototype, "allowCustomStyle", {
        get: function () {
            return true;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Container.prototype, "style", {
        get: function () {
            if (this.allowCustomStyle) {
                return this._style && this.hostConfig.containerStyles.getStyleByName(this._style) ? this._style : this.defaultStyle;
            }
            else {
                return this.defaultStyle;
            }
        },
        set: function (value) {
            this._style = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Container.prototype, "padding", {
        get: function () {
            return this.getPadding();
        },
        set: function (value) {
            this.setPadding(value);
        },
        enumerable: true,
        configurable: true
    });
    Container.prototype.getJsonTypeName = function () {
        return "Container";
    };
    Container.prototype.isFirstElement = function (element) {
        for (var i = 0; i < this._items.length; i++) {
            if (this._items[i].isVisible) {
                return this._items[i] == element;
            }
        }
        return false;
    };
    Container.prototype.isLastElement = function (element) {
        for (var i = this._items.length - 1; i >= 0; i--) {
            if (this._items[i].isVisible) {
                return this._items[i] == element;
            }
        }
        return false;
    };
    Container.prototype.validate = function () {
        var result = [];
        if (this._style) {
            var styleDefinition = this.hostConfig.containerStyles.getStyleByName(this._style);
            if (!styleDefinition) {
                result.push({
                    error: Enums.ValidationError.InvalidPropertyValue,
                    message: "Unknown container style: " + this._style
                });
            }
        }
        for (var i = 0; i < this._items.length; i++) {
            if (!this.hostConfig.supportsInteractivity && this._items[i].isInteractive) {
                result.push({
                    error: Enums.ValidationError.InteractivityNotAllowed,
                    message: "Interactivity is not allowed."
                });
            }
            if (!this.isElementAllowed(this._items[i], this.getForbiddenElementTypes())) {
                result.push({
                    error: Enums.ValidationError.InteractivityNotAllowed,
                    message: "Elements of type " + this._items[i].getJsonTypeName() + " are not allowed in this container."
                });
            }
            result = result.concat(this._items[i].validate());
        }
        return result;
    };
    Container.prototype.parse = function (json, itemsCollectionPropertyName) {
        if (itemsCollectionPropertyName === void 0) { itemsCollectionPropertyName = "items"; }
        _super.prototype.parse.call(this, json);
        var jsonBackgroundImage = json["backgroundImage"];
        if (jsonBackgroundImage) {
            this.backgroundImage = new BackgroundImage();
            if (typeof jsonBackgroundImage === "string") {
                this.backgroundImage.url = jsonBackgroundImage;
                this.backgroundImage.mode = Enums.BackgroundImageMode.Stretch;
            }
            else if (typeof jsonBackgroundImage === "object") {
                this.backgroundImage = new BackgroundImage();
                this.backgroundImage.parse(json["backgroundImage"]);
            }
        }
        this.verticalContentAlignment = Utils.getEnumValueOrDefault(Enums.VerticalAlignment, json["verticalContentAlignment"], this.verticalContentAlignment);
        this._style = json["style"];
        if (json[itemsCollectionPropertyName] != null) {
            var items = json[itemsCollectionPropertyName];
            this.clear();
            for (var i = 0; i < items.length; i++) {
                var elementType = items[i]["type"];
                var element = AdaptiveCard.elementTypeRegistry.createInstance(elementType);
                if (!element) {
                    raiseParseError({
                        error: Enums.ValidationError.UnknownElementType,
                        message: "Unknown element type: " + elementType
                    });
                }
                else {
                    this.addItem(element);
                    element.parse(items[i]);
                }
            }
        }
        var selectActionJson = json["selectAction"];
        if (selectActionJson != undefined) {
            this.selectAction = createActionInstance(selectActionJson);
        }
    };
    Container.prototype.addItem = function (item) {
        if (!item.parent) {
            if (item.isStandalone) {
                this._items.push(item);
                item.setParent(this);
            }
            else {
                throw new Error("Elements of type " + item.getJsonTypeName() + " cannot be used as standalone elements.");
            }
        }
        else {
            throw new Error("The element already belongs to another container.");
        }
    };
    Container.prototype.clear = function () {
        this._items = [];
    };
    Container.prototype.canContentBleed = function () {
        return this.hasBackground ? false : _super.prototype.canContentBleed.call(this);
    };
    Container.prototype.getAllInputs = function () {
        var result = [];
        for (var i = 0; i < this._items.length; i++) {
            var item = this._items[i];
            result = result.concat(item.getAllInputs());
        }
        return result;
    };
    Container.prototype.getElementById = function (id) {
        var result = _super.prototype.getElementById.call(this, id);
        if (!result) {
            for (var i = 0; i < this._items.length; i++) {
                result = this._items[i].getElementById(id);
                if (result) {
                    break;
                }
            }
        }
        return result;
    };
    Container.prototype.getActionById = function (id) {
        var result = _super.prototype.getActionById.call(this, id);
        if (!result) {
            if (this.selectAction) {
                result = this.selectAction.getActionById(id);
            }
            if (!result) {
                for (var i = 0; i < this._items.length; i++) {
                    result = this._items[i].getActionById(id);
                    if (result) {
                        break;
                    }
                }
            }
        }
        return result;
    };
    Container.prototype.renderSpeech = function () {
        if (this.speak != null) {
            return this.speak;
        }
        // render each item
        var speak = null;
        if (this._items.length > 0) {
            speak = '';
            for (var i = 0; i < this._items.length; i++) {
                var result = this._items[i].renderSpeech();
                if (result) {
                    speak += result;
                }
            }
        }
        return speak;
    };
    Container.prototype.updateLayout = function (processChildren) {
        if (processChildren === void 0) { processChildren = true; }
        this.applyPadding();
        if (processChildren) {
            for (var i = 0; i < this._items.length; i++) {
                this._items[i].updateLayout();
            }
        }
    };
    Object.defineProperty(Container.prototype, "selectAction", {
        get: function () {
            return this._selectAction;
        },
        set: function (value) {
            this._selectAction = value;
            if (this._selectAction) {
                this._selectAction.setParent(this);
            }
        },
        enumerable: true,
        configurable: true
    });
    return Container;
}(CardElement));
exports.Container = Container;
var Column = /** @class */ (function (_super) {
    __extends(Column, _super);
    function Column() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._computedWeight = 0;
        _this.width = "auto";
        _this.pixelWidth = 0;
        return _this;
    }
    Column.prototype.adjustRenderedElementSize = function (renderedElement) {
        renderedElement.style.minWidth = "0";
        if (this.pixelWidth > 0) {
            renderedElement.style.flex = "0 0 " + this.pixelWidth + "px";
        }
        else {
            if (typeof this.width === "number") {
                renderedElement.style.flex = "1 1 " + (this._computedWeight > 0 ? this._computedWeight : this.width) + "%";
            }
            else if (this.width === "auto") {
                renderedElement.style.flex = "0 1 auto";
            }
            else {
                renderedElement.style.flex = "1 1 50px";
            }
        }
    };
    Object.defineProperty(Column.prototype, "separatorOrientation", {
        get: function () {
            return Enums.Orientation.Vertical;
        },
        enumerable: true,
        configurable: true
    });
    Column.prototype.getJsonTypeName = function () {
        return "Column";
    };
    Column.prototype.parse = function (json) {
        _super.prototype.parse.call(this, json);
        var jsonWidth = json["width"];
        if (jsonWidth === undefined) {
            jsonWidth = json["size"];
            if (jsonWidth !== undefined) {
                raiseParseError({
                    error: Enums.ValidationError.Deprecated,
                    message: "The \"Column.size\" property is deprecated and will be removed. Use the \"Column.width\" property instead."
                });
            }
        }
        var invalidWidth = false;
        if (typeof jsonWidth === "number") {
            if (jsonWidth <= 0) {
                invalidWidth = true;
            }
        }
        else if (typeof jsonWidth === "string") {
            if (jsonWidth != "auto" && jsonWidth != "stretch") {
                var sizeAsNumber = parseInt(jsonWidth);
                if (!isNaN(sizeAsNumber)) {
                    jsonWidth = sizeAsNumber;
                }
                else {
                    invalidWidth = true;
                }
            }
        }
        else if (jsonWidth) {
            invalidWidth = true;
        }
        if (invalidWidth) {
            raiseParseError({
                error: Enums.ValidationError.InvalidPropertyValue,
                message: "Invalid column width: " + jsonWidth
            });
        }
        else {
            this.width = jsonWidth;
        }
    };
    Object.defineProperty(Column.prototype, "isStandalone", {
        get: function () {
            return false;
        },
        enumerable: true,
        configurable: true
    });
    return Column;
}(Container));
exports.Column = Column;
var ColumnSet = /** @class */ (function (_super) {
    __extends(ColumnSet, _super);
    function ColumnSet() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._columns = [];
        return _this;
    }
    ColumnSet.prototype.applyPadding = function () {
        if (this.padding) {
            if (this.renderedElement) {
                var physicalPadding = this.padding.toSpacingDefinition(this.hostConfig);
                this.renderedElement.style.paddingTop = physicalPadding.top + "px";
                this.renderedElement.style.paddingRight = physicalPadding.right + "px";
                this.renderedElement.style.paddingBottom = physicalPadding.bottom + "px";
                this.renderedElement.style.paddingLeft = physicalPadding.left + "px";
            }
        }
    };
    ColumnSet.prototype.internalRender = function () {
        var _this = this;
        if (this._columns.length > 0) {
            var element = document.createElement("div");
            element.className = "ac-columnSet";
            element.style.display = "flex";
            if (AdaptiveCard.useAdvancedCardBottomTruncation) {
                // See comment in Container.internalRender()
                element.style.minHeight = '-webkit-min-content';
            }
            if (this.selectAction && this.hostConfig.supportsInteractivity) {
                element.classList.add("ac-selectable");
                element.onclick = function (e) {
                    _this.selectAction.execute();
                    e.cancelBubble = true;
                };
            }
            switch (this.horizontalAlignment) {
                case Enums.HorizontalAlignment.Center:
                    element.style.justifyContent = "center";
                    break;
                case Enums.HorizontalAlignment.Right:
                    element.style.justifyContent = "flex-end";
                    break;
                default:
                    element.style.justifyContent = "flex-start";
                    break;
            }
            var totalWeight = 0;
            for (var i = 0; i < this._columns.length; i++) {
                if (typeof this._columns[i].width === "number") {
                    totalWeight += this._columns[i].width;
                }
            }
            var renderedColumnCount = 0;
            for (var i = 0; i < this._columns.length; i++) {
                if (typeof this._columns[i].width === "number" && totalWeight > 0) {
                    var computedWeight = 100 / totalWeight * this._columns[i].width;
                    // Best way to emulate "internal" access I know of
                    this._columns[i]["_computedWeight"] = computedWeight;
                }
                var renderedColumn = this._columns[i].render();
                if (renderedColumn) {
                    if (renderedColumnCount > 0 && this._columns[i].separatorElement) {
                        this._columns[i].separatorElement.style.flex = "0 0 auto";
                        Utils.appendChild(element, this._columns[i].separatorElement);
                    }
                    Utils.appendChild(element, renderedColumn);
                    renderedColumnCount++;
                }
            }
            return renderedColumnCount > 0 ? element : null;
        }
        else {
            return null;
        }
    };
    ColumnSet.prototype.truncateOverflow = function (maxHeight) {
        for (var _i = 0, _a = this._columns; _i < _a.length; _i++) {
            var column = _a[_i];
            column['handleOverflow'](maxHeight);
        }
        return true;
    };
    ColumnSet.prototype.undoOverflowTruncation = function () {
        for (var _i = 0, _a = this._columns; _i < _a.length; _i++) {
            var column = _a[_i];
            column['resetOverflow']();
        }
    };
    Object.defineProperty(ColumnSet.prototype, "padding", {
        get: function () {
            return this.getPadding();
        },
        set: function (value) {
            this.setPadding(value);
        },
        enumerable: true,
        configurable: true
    });
    ColumnSet.prototype.getJsonTypeName = function () {
        return "ColumnSet";
    };
    ColumnSet.prototype.parse = function (json) {
        _super.prototype.parse.call(this, json);
        var selectActionJson = json["selectAction"];
        if (selectActionJson != undefined) {
            this.selectAction = createActionInstance(selectActionJson);
        }
        if (json["columns"] != null) {
            var jsonColumns = json["columns"];
            this._columns = [];
            for (var i = 0; i < jsonColumns.length; i++) {
                var column = new Column();
                column.parse(jsonColumns[i]);
                this.addColumn(column);
            }
        }
    };
    ColumnSet.prototype.validate = function () {
        var result = [];
        var weightedColumns = 0;
        var stretchedColumns = 0;
        for (var i = 0; i < this._columns.length; i++) {
            if (typeof this._columns[i].width === "number") {
                weightedColumns++;
            }
            else if (this._columns[i].width === "stretch") {
                stretchedColumns++;
            }
            result = result.concat(this._columns[i].validate());
        }
        if (weightedColumns > 0 && stretchedColumns > 0) {
            result.push({
                error: Enums.ValidationError.Hint,
                message: "It is not recommended to use weighted and stretched columns in the same ColumnSet, because in such a situation stretched columns will always get the minimum amount of space."
            });
        }
        return result;
    };
    ColumnSet.prototype.updateLayout = function (processChildren) {
        if (processChildren === void 0) { processChildren = true; }
        this.applyPadding();
        if (processChildren) {
            for (var i = 0; i < this._columns.length; i++) {
                this._columns[i].updateLayout();
            }
        }
    };
    ColumnSet.prototype.addColumn = function (column) {
        if (!column.parent) {
            this._columns.push(column);
            column.setParent(this);
        }
        else {
            throw new Error("This column already belongs to another ColumnSet.");
        }
    };
    ColumnSet.prototype.isLeftMostElement = function (element) {
        return this._columns.indexOf(element) == 0;
    };
    ColumnSet.prototype.isRightMostElement = function (element) {
        return this._columns.indexOf(element) == this._columns.length - 1;
    };
    ColumnSet.prototype.getAllInputs = function () {
        var result = [];
        for (var i = 0; i < this._columns.length; i++) {
            result = result.concat(this._columns[i].getAllInputs());
        }
        return result;
    };
    ColumnSet.prototype.getElementById = function (id) {
        var result = _super.prototype.getElementById.call(this, id);
        if (!result) {
            for (var i = 0; i < this._columns.length; i++) {
                result = this._columns[i].getElementById(id);
                if (result) {
                    break;
                }
            }
        }
        return result;
    };
    ColumnSet.prototype.getActionById = function (id) {
        var result = null;
        for (var i = 0; i < this._columns.length; i++) {
            result = this._columns[i].getActionById(id);
            if (result) {
                break;
            }
        }
        return result;
    };
    ColumnSet.prototype.renderSpeech = function () {
        if (this.speak != null) {
            return this.speak;
        }
        // render each item
        var speak = '';
        if (this._columns.length > 0) {
            for (var i = 0; i < this._columns.length; i++) {
                speak += this._columns[i].renderSpeech();
            }
        }
        return speak;
    };
    Object.defineProperty(ColumnSet.prototype, "selectAction", {
        get: function () {
            return this._selectAction;
        },
        set: function (value) {
            this._selectAction = value;
            if (this._selectAction) {
                this._selectAction.setParent(this);
            }
        },
        enumerable: true,
        configurable: true
    });
    return ColumnSet;
}(CardElement));
exports.ColumnSet = ColumnSet;
var Version = /** @class */ (function () {
    function Version(major, minor) {
        if (major === void 0) { major = 1; }
        if (minor === void 0) { minor = 1; }
        this._isValid = true;
        this._major = major;
        this._minor = minor;
    }
    Version.parse = function (versionString) {
        if (!versionString) {
            return null;
        }
        var result = new Version();
        result._versionString = versionString;
        var regEx = /(\d+).(\d+)/gi;
        var matches = regEx.exec(versionString);
        if (matches != null && matches.length == 3) {
            result._major = parseInt(matches[1]);
            result._minor = parseInt(matches[2]);
        }
        else {
            result._isValid = false;
        }
        return result;
    };
    Version.prototype.toString = function () {
        return !this._isValid ? this._versionString : this._major + "." + this._minor;
    };
    Object.defineProperty(Version.prototype, "major", {
        get: function () {
            return this._major;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Version.prototype, "minor", {
        get: function () {
            return this._minor;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Version.prototype, "isValid", {
        get: function () {
            return this._isValid;
        },
        enumerable: true,
        configurable: true
    });
    return Version;
}());
exports.Version = Version;
function raiseAnchorClickedEvent(element, anchor) {
    var card = element.getRootElement();
    var onAnchorClickedHandler = (card && card.onAnchorClicked) ? card.onAnchorClicked : AdaptiveCard.onAnchorClicked;
    return onAnchorClickedHandler != null ? onAnchorClickedHandler(card, anchor) : false;
}
function raiseExecuteActionEvent(action) {
    var card = action.parent.getRootElement();
    var onExecuteActionHandler = (card && card.onExecuteAction) ? card.onExecuteAction : AdaptiveCard.onExecuteAction;
    if (onExecuteActionHandler) {
        action.prepare(action.parent.getRootElement().getAllInputs());
        onExecuteActionHandler(action);
    }
}
function raiseInlineCardExpandedEvent(action, isExpanded) {
    var card = action.parent.getRootElement();
    var onInlineCardExpandedHandler = (card && card.onInlineCardExpanded) ? card.onInlineCardExpanded : AdaptiveCard.onInlineCardExpanded;
    if (onInlineCardExpandedHandler) {
        onInlineCardExpandedHandler(action, isExpanded);
    }
}
function raiseElementVisibilityChangedEvent(element, shouldUpdateLayout) {
    if (shouldUpdateLayout === void 0) { shouldUpdateLayout = true; }
    var rootElement = element.getRootElement();
    if (shouldUpdateLayout) {
        rootElement.updateLayout();
    }
    var card = rootElement;
    var onElementVisibilityChangedHandler = (card && card.onElementVisibilityChanged) ? card.onElementVisibilityChanged : AdaptiveCard.onElementVisibilityChanged;
    if (onElementVisibilityChangedHandler != null) {
        onElementVisibilityChangedHandler(element);
    }
}
function raiseParseElementEvent(element, json) {
    var card = element.getRootElement();
    var onParseElementHandler = (card && card.onParseElement) ? card.onParseElement : AdaptiveCard.onParseElement;
    if (onParseElementHandler != null) {
        onParseElementHandler(element, json);
    }
}
function raiseParseError(error) {
    if (AdaptiveCard.onParseError != null) {
        AdaptiveCard.onParseError(error);
    }
}
var ContainerWithActions = /** @class */ (function (_super) {
    __extends(ContainerWithActions, _super);
    function ContainerWithActions() {
        var _this = _super.call(this) || this;
        _this._actionCollection = new ActionCollection(_this);
        _this._actionCollection.onHideActionCardPane = function () { _this.showBottomSpacer(null); };
        _this._actionCollection.onShowActionCardPane = function (action) { _this.hideBottomSpacer(null); };
        return _this;
    }
    ContainerWithActions.prototype.internalRender = function () {
        var element = _super.prototype.internalRender.call(this);
        var renderedActions = this._actionCollection.render(this.hostConfig.actions.actionsOrientation);
        if (renderedActions) {
            Utils.appendChild(element, Utils.renderSeparation({
                spacing: this.hostConfig.getEffectiveSpacing(this.hostConfig.actions.spacing),
                lineThickness: null,
                lineColor: null
            }, Enums.Orientation.Horizontal));
            Utils.appendChild(element, renderedActions);
        }
        return element.children.length > 0 ? element : null;
    };
    ContainerWithActions.prototype.getActionById = function (id) {
        var result = this._actionCollection.getActionById(id);
        return result ? result : _super.prototype.getActionById.call(this, id);
    };
    ContainerWithActions.prototype.parse = function (json, itemsCollectionPropertyName) {
        if (itemsCollectionPropertyName === void 0) { itemsCollectionPropertyName = "items"; }
        _super.prototype.parse.call(this, json, itemsCollectionPropertyName);
        if (json["actions"] != undefined) {
            var jsonActions = json["actions"];
            for (var i = 0; i < jsonActions.length; i++) {
                var action = createActionInstance(jsonActions[i]);
                if (action != null) {
                    this.addAction(action);
                }
            }
        }
    };
    ContainerWithActions.prototype.validate = function () {
        var result = _super.prototype.validate.call(this);
        if (this._actionCollection) {
            result = result.concat(this._actionCollection.validate());
        }
        return result;
    };
    ContainerWithActions.prototype.isLastElement = function (element) {
        return _super.prototype.isLastElement.call(this, element) && this._actionCollection.items.length == 0;
    };
    ContainerWithActions.prototype.addAction = function (action) {
        this._actionCollection.addAction(action);
    };
    ContainerWithActions.prototype.clear = function () {
        _super.prototype.clear.call(this);
        this._actionCollection.clear();
    };
    ContainerWithActions.prototype.getAllInputs = function () {
        return _super.prototype.getAllInputs.call(this).concat(this._actionCollection.getAllInputs());
    };
    Object.defineProperty(ContainerWithActions.prototype, "isStandalone", {
        get: function () {
            return false;
        },
        enumerable: true,
        configurable: true
    });
    return ContainerWithActions;
}(Container));
exports.ContainerWithActions = ContainerWithActions;
var TypeRegistry = /** @class */ (function () {
    function TypeRegistry() {
        this._items = [];
        this.reset();
    }
    TypeRegistry.prototype.findTypeRegistration = function (typeName) {
        for (var i = 0; i < this._items.length; i++) {
            if (this._items[i].typeName === typeName) {
                return this._items[i];
            }
        }
        return null;
    };
    TypeRegistry.prototype.clear = function () {
        this._items = [];
    };
    TypeRegistry.prototype.registerType = function (typeName, createInstance) {
        var registrationInfo = this.findTypeRegistration(typeName);
        if (registrationInfo != null) {
            registrationInfo.createInstance = createInstance;
        }
        else {
            registrationInfo = {
                typeName: typeName,
                createInstance: createInstance
            };
            this._items.push(registrationInfo);
        }
    };
    TypeRegistry.prototype.unregisterType = function (typeName) {
        for (var i = 0; i < this._items.length; i++) {
            if (this._items[i].typeName === typeName) {
                this._items.splice(i, 1);
                return;
            }
        }
    };
    TypeRegistry.prototype.createInstance = function (typeName) {
        var registrationInfo = this.findTypeRegistration(typeName);
        return registrationInfo ? registrationInfo.createInstance() : null;
    };
    return TypeRegistry;
}());
exports.TypeRegistry = TypeRegistry;
var ElementTypeRegistry = /** @class */ (function (_super) {
    __extends(ElementTypeRegistry, _super);
    function ElementTypeRegistry() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ElementTypeRegistry.prototype.reset = function () {
        this.clear();
        this.registerType("Container", function () { return new Container(); });
        this.registerType("TextBlock", function () { return new TextBlock(); });
        this.registerType("Image", function () { return new Image(); });
        this.registerType("ImageSet", function () { return new ImageSet(); });
        this.registerType("FactSet", function () { return new FactSet(); });
        this.registerType("ColumnSet", function () { return new ColumnSet(); });
        this.registerType("Input.Text", function () { return new TextInput(); });
        this.registerType("Input.Date", function () { return new DateInput(); });
        this.registerType("Input.Time", function () { return new TimeInput(); });
        this.registerType("Input.Number", function () { return new NumberInput(); });
        this.registerType("Input.ChoiceSet", function () { return new ChoiceSetInput(); });
        this.registerType("Input.Toggle", function () { return new ToggleInput(); });
    };
    return ElementTypeRegistry;
}(TypeRegistry));
exports.ElementTypeRegistry = ElementTypeRegistry;
var ActionTypeRegistry = /** @class */ (function (_super) {
    __extends(ActionTypeRegistry, _super);
    function ActionTypeRegistry() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ActionTypeRegistry.prototype.reset = function () {
        this.clear();
        this.registerType("Action.OpenUrl", function () { return new OpenUrlAction(); });
        this.registerType("Action.Submit", function () { return new SubmitAction(); });
        this.registerType("Action.ShowCard", function () { return new ShowCardAction(); });
    };
    return ActionTypeRegistry;
}(TypeRegistry));
exports.ActionTypeRegistry = ActionTypeRegistry;
var AdaptiveCard = /** @class */ (function (_super) {
    __extends(AdaptiveCard, _super);
    function AdaptiveCard() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._cardTypeName = "AdaptiveCard";
        _this.onAnchorClicked = null;
        _this.onExecuteAction = null;
        _this.onElementVisibilityChanged = null;
        _this.onInlineCardExpanded = null;
        _this.onParseElement = null;
        _this.version = new Version(1, 0);
        return _this;
    }
    AdaptiveCard.prototype.isVersionSupported = function () {
        if (this.bypassVersionCheck) {
            return true;
        }
        else {
            var unsupportedVersion = !this.version ||
                (AdaptiveCard.currentVersion.major < this.version.major) ||
                (AdaptiveCard.currentVersion.major == this.version.major && AdaptiveCard.currentVersion.minor < this.version.minor);
            return !unsupportedVersion;
        }
    };
    AdaptiveCard.prototype.showBottomSpacer = function (requestingElement) {
        if ((!requestingElement || this.isLastElement(requestingElement))) {
            this.applyPadding();
            // Do not walk up the tree from an AdaptiveCard instance
        }
    };
    AdaptiveCard.prototype.hideBottomSpacer = function (requestingElement) {
        if ((!requestingElement || this.isLastElement(requestingElement))) {
            if (this.renderedElement) {
                this.renderedElement.style.paddingBottom = "0px";
            }
            // Do not walk up the tree from an AdaptiveCard instance
        }
    };
    AdaptiveCard.prototype.applyPadding = function () {
        var effectivePadding = this.padding ? this.padding.toSpacingDefinition(this.hostConfig) : this.internalPadding.toSpacingDefinition(this.hostConfig);
        this.renderedElement.style.paddingTop = effectivePadding.top + "px";
        this.renderedElement.style.paddingRight = effectivePadding.right + "px";
        this.renderedElement.style.paddingBottom = effectivePadding.bottom + "px";
        this.renderedElement.style.paddingLeft = effectivePadding.left + "px";
    };
    AdaptiveCard.prototype.internalRender = function () {
        var renderedElement = _super.prototype.internalRender.call(this);
        if (AdaptiveCard.useAdvancedCardBottomTruncation) {
            // Unlike containers, the root card element should be allowed to
            // be shorter than its content (otherwise the overflow truncation
            // logic would never get triggered)
            renderedElement.style.minHeight = null;
        }
        return renderedElement;
    };
    Object.defineProperty(AdaptiveCard.prototype, "bypassVersionCheck", {
        get: function () {
            return false;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AdaptiveCard.prototype, "defaultPadding", {
        get: function () {
            return new PaddingDefinition(Enums.Spacing.Padding, Enums.Spacing.Padding, Enums.Spacing.Padding, Enums.Spacing.Padding);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AdaptiveCard.prototype, "allowCustomPadding", {
        get: function () {
            return false;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AdaptiveCard.prototype, "allowCustomStyle", {
        get: function () {
            return this.hostConfig.adaptiveCard && this.hostConfig.adaptiveCard.allowCustomStyle;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AdaptiveCard.prototype, "hasBackground", {
        get: function () {
            return true;
        },
        enumerable: true,
        configurable: true
    });
    AdaptiveCard.prototype.getJsonTypeName = function () {
        return "AdaptiveCard";
    };
    AdaptiveCard.prototype.validate = function () {
        var result = [];
        if (this._cardTypeName != "AdaptiveCard") {
            result.push({
                error: Enums.ValidationError.MissingCardType,
                message: "Invalid or missing card type. Make sure the card's type property is set to \"AdaptiveCard\"."
            });
        }
        if (!this.bypassVersionCheck && (!this.version || !this.version.isValid)) {
            result.push({
                error: Enums.ValidationError.PropertyCantBeNull,
                message: !this.version ? "The version property must be specified." : "Invalid version: " + this.version
            });
        }
        else if (!this.isVersionSupported()) {
            result.push({
                error: Enums.ValidationError.UnsupportedCardVersion,
                message: "The specified card version (" + this.version + ") is not supported. The maximum supported card version is " + AdaptiveCard.currentVersion
            });
        }
        return result.concat(_super.prototype.validate.call(this));
    };
    AdaptiveCard.prototype.parse = function (json) {
        this._cardTypeName = json["type"];
        var langId = json["lang"];
        if (langId && typeof langId === "string") {
            try {
                this.lang = langId;
            }
            catch (e) {
                raiseParseError({
                    error: Enums.ValidationError.InvalidPropertyValue,
                    message: e.message
                });
            }
        }
        this.version = Version.parse(json["version"]);
        this.fallbackText = json["fallbackText"];
        _super.prototype.parse.call(this, json, "body");
    };
    AdaptiveCard.prototype.render = function (target) {
        var renderedCard;
        if (!this.isVersionSupported()) {
            renderedCard = document.createElement("div");
            renderedCard.innerHTML = this.fallbackText ? this.fallbackText : "The specified card version is not supported.";
        }
        else {
            renderedCard = _super.prototype.render.call(this);
            if (renderedCard) {
                renderedCard.tabIndex = 0;
                if (!Utils.isNullOrEmpty(this.speak)) {
                    renderedCard.setAttribute("aria-label", this.speak);
                }
            }
        }
        if (target) {
            target.appendChild(renderedCard);
            this.updateLayout();
        }
        return renderedCard;
    };
    AdaptiveCard.prototype.updateLayout = function (processChildren) {
        if (processChildren === void 0) { processChildren = true; }
        _super.prototype.updateLayout.call(this, processChildren);
        if (AdaptiveCard.useAdvancedCardBottomTruncation && this.isRendered()) {
            var card = this.renderedElement;
            var padding = this.hostConfig.getEffectiveSpacing(Enums.Spacing.Default);
            this['handleOverflow'](card.offsetHeight - padding);
        }
    };
    AdaptiveCard.prototype.canContentBleed = function () {
        return true;
    };
    AdaptiveCard.currentVersion = new Version(1, 0);
    AdaptiveCard.useAutomaticContainerBleeding = false;
    AdaptiveCard.preExpandSingleShowCardAction = false;
    AdaptiveCard.useAdvancedTextBlockTruncation = true;
    AdaptiveCard.useAdvancedCardBottomTruncation = false;
    AdaptiveCard.useMarkdownInRadioButtonAndCheckbox = true;
    AdaptiveCard.elementTypeRegistry = new ElementTypeRegistry();
    AdaptiveCard.actionTypeRegistry = new ActionTypeRegistry();
    AdaptiveCard.onAnchorClicked = null;
    AdaptiveCard.onExecuteAction = null;
    AdaptiveCard.onElementVisibilityChanged = null;
    AdaptiveCard.onInlineCardExpanded = null;
    AdaptiveCard.onParseElement = null;
    AdaptiveCard.onParseError = null;
    AdaptiveCard.processMarkdown = function (text) {
        // Check for markdownit
        if (window["markdownit"]) {
            return window["markdownit"]().render(text);
        }
        return text;
    };
    return AdaptiveCard;
}(ContainerWithActions));
exports.AdaptiveCard = AdaptiveCard;
var InlineAdaptiveCard = /** @class */ (function (_super) {
    __extends(InlineAdaptiveCard, _super);
    function InlineAdaptiveCard() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.suppressStyle = false;
        return _this;
    }
    Object.defineProperty(InlineAdaptiveCard.prototype, "bypassVersionCheck", {
        get: function () {
            return true;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(InlineAdaptiveCard.prototype, "defaultPadding", {
        get: function () {
            return new PaddingDefinition(this.suppressStyle ? Enums.Spacing.None : Enums.Spacing.Padding, Enums.Spacing.Padding, this.suppressStyle ? Enums.Spacing.None : Enums.Spacing.Padding, Enums.Spacing.Padding);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(InlineAdaptiveCard.prototype, "defaultStyle", {
        get: function () {
            if (this.suppressStyle) {
                return Enums.ContainerStyle.Default;
            }
            else {
                return this.hostConfig.actions.showCard.style ? this.hostConfig.actions.showCard.style : Enums.ContainerStyle.Emphasis;
            }
        },
        enumerable: true,
        configurable: true
    });
    InlineAdaptiveCard.prototype.render = function (target) {
        var renderedCard = _super.prototype.render.call(this, target);
        renderedCard.setAttribute("aria-live", "polite");
        renderedCard.removeAttribute("tabindex");
        return renderedCard;
    };
    InlineAdaptiveCard.prototype.getForbiddenActionTypes = function () {
        return [ShowCardAction];
    };
    return InlineAdaptiveCard;
}(AdaptiveCard));
var defaultHostConfig = new HostConfig.HostConfig({
    supportsInteractivity: true,
    fontFamily: "Segoe UI",
    spacing: {
        small: 10,
        default: 20,
        medium: 30,
        large: 40,
        extraLarge: 50,
        padding: 20
    },
    separator: {
        lineThickness: 1,
        lineColor: "#EEEEEE"
    },
    fontSizes: {
        small: 12,
        default: 14,
        medium: 17,
        large: 21,
        extraLarge: 26
    },
    fontWeights: {
        lighter: 200,
        default: 400,
        bolder: 600
    },
    imageSizes: {
        small: 40,
        medium: 80,
        large: 160
    },
    containerStyles: {
        default: {
            backgroundColor: "#FFFFFF",
            foregroundColors: {
                default: {
                    default: "#333333",
                    subtle: "#EE333333"
                },
                dark: {
                    default: "#000000",
                    subtle: "#66000000"
                },
                light: {
                    default: "#FFFFFF",
                    subtle: "#33000000"
                },
                accent: {
                    default: "#2E89FC",
                    subtle: "#882E89FC"
                },
                attention: {
                    default: "#cc3300",
                    subtle: "#DDcc3300"
                },
                good: {
                    default: "#54a254",
                    subtle: "#DD54a254"
                },
                warning: {
                    default: "#e69500",
                    subtle: "#DDe69500"
                }
            }
        },
        emphasis: {
            backgroundColor: "#08000000",
            foregroundColors: {
                default: {
                    default: "#333333",
                    subtle: "#EE333333"
                },
                dark: {
                    default: "#000000",
                    subtle: "#66000000"
                },
                light: {
                    default: "#FFFFFF",
                    subtle: "#33000000"
                },
                accent: {
                    default: "#2E89FC",
                    subtle: "#882E89FC"
                },
                attention: {
                    default: "#cc3300",
                    subtle: "#DDcc3300"
                },
                good: {
                    default: "#54a254",
                    subtle: "#DD54a254"
                },
                warning: {
                    default: "#e69500",
                    subtle: "#DDe69500"
                }
            }
        }
    },
    actions: {
        maxActions: 5,
        spacing: Enums.Spacing.Default,
        buttonSpacing: 10,
        showCard: {
            actionMode: Enums.ShowCardActionMode.Inline,
            inlineTopMargin: 16
        },
        actionsOrientation: Enums.Orientation.Horizontal,
        actionAlignment: Enums.ActionAlignment.Left
    },
    adaptiveCard: {
        allowCustomStyle: false
    },
    imageSet: {
        imageSize: Enums.Size.Medium,
        maxImageHeight: 100
    },
    factSet: {
        title: {
            color: Enums.TextColor.Default,
            size: Enums.TextSize.Default,
            isSubtle: false,
            weight: Enums.TextWeight.Bolder,
            wrap: true,
            maxWidth: 150,
        },
        value: {
            color: Enums.TextColor.Default,
            size: Enums.TextSize.Default,
            isSubtle: false,
            weight: Enums.TextWeight.Default,
            wrap: true,
        },
        spacing: 10
    }
});
//# sourceMappingURL=card-elements.js.map

/***/ }),

/***/ "../../../node_modules/adaptivecards/lib/enums.js":
/*!*****************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/adaptivecards/lib/enums.js ***!
  \*****************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Size;
(function (Size) {
    Size[Size["Auto"] = 0] = "Auto";
    Size[Size["Stretch"] = 1] = "Stretch";
    Size[Size["Small"] = 2] = "Small";
    Size[Size["Medium"] = 3] = "Medium";
    Size[Size["Large"] = 4] = "Large";
})(Size = exports.Size || (exports.Size = {}));
var TextSize;
(function (TextSize) {
    TextSize[TextSize["Small"] = 0] = "Small";
    TextSize[TextSize["Default"] = 1] = "Default";
    TextSize[TextSize["Medium"] = 2] = "Medium";
    TextSize[TextSize["Large"] = 3] = "Large";
    TextSize[TextSize["ExtraLarge"] = 4] = "ExtraLarge";
})(TextSize = exports.TextSize || (exports.TextSize = {}));
var Spacing;
(function (Spacing) {
    Spacing[Spacing["None"] = 0] = "None";
    Spacing[Spacing["Small"] = 1] = "Small";
    Spacing[Spacing["Default"] = 2] = "Default";
    Spacing[Spacing["Medium"] = 3] = "Medium";
    Spacing[Spacing["Large"] = 4] = "Large";
    Spacing[Spacing["ExtraLarge"] = 5] = "ExtraLarge";
    Spacing[Spacing["Padding"] = 6] = "Padding";
})(Spacing = exports.Spacing || (exports.Spacing = {}));
var TextWeight;
(function (TextWeight) {
    TextWeight[TextWeight["Lighter"] = 0] = "Lighter";
    TextWeight[TextWeight["Default"] = 1] = "Default";
    TextWeight[TextWeight["Bolder"] = 2] = "Bolder";
})(TextWeight = exports.TextWeight || (exports.TextWeight = {}));
var TextColor;
(function (TextColor) {
    TextColor[TextColor["Default"] = 0] = "Default";
    TextColor[TextColor["Dark"] = 1] = "Dark";
    TextColor[TextColor["Light"] = 2] = "Light";
    TextColor[TextColor["Accent"] = 3] = "Accent";
    TextColor[TextColor["Good"] = 4] = "Good";
    TextColor[TextColor["Warning"] = 5] = "Warning";
    TextColor[TextColor["Attention"] = 6] = "Attention";
})(TextColor = exports.TextColor || (exports.TextColor = {}));
var HorizontalAlignment;
(function (HorizontalAlignment) {
    HorizontalAlignment[HorizontalAlignment["Left"] = 0] = "Left";
    HorizontalAlignment[HorizontalAlignment["Center"] = 1] = "Center";
    HorizontalAlignment[HorizontalAlignment["Right"] = 2] = "Right";
})(HorizontalAlignment = exports.HorizontalAlignment || (exports.HorizontalAlignment = {}));
var VerticalAlignment;
(function (VerticalAlignment) {
    VerticalAlignment[VerticalAlignment["Top"] = 0] = "Top";
    VerticalAlignment[VerticalAlignment["Center"] = 1] = "Center";
    VerticalAlignment[VerticalAlignment["Bottom"] = 2] = "Bottom";
})(VerticalAlignment = exports.VerticalAlignment || (exports.VerticalAlignment = {}));
var ActionAlignment;
(function (ActionAlignment) {
    ActionAlignment[ActionAlignment["Left"] = 0] = "Left";
    ActionAlignment[ActionAlignment["Center"] = 1] = "Center";
    ActionAlignment[ActionAlignment["Right"] = 2] = "Right";
    ActionAlignment[ActionAlignment["Stretch"] = 3] = "Stretch";
})(ActionAlignment = exports.ActionAlignment || (exports.ActionAlignment = {}));
var ImageStyle;
(function (ImageStyle) {
    ImageStyle[ImageStyle["Default"] = 0] = "Default";
    ImageStyle[ImageStyle["Person"] = 1] = "Person";
})(ImageStyle = exports.ImageStyle || (exports.ImageStyle = {}));
var ShowCardActionMode;
(function (ShowCardActionMode) {
    ShowCardActionMode[ShowCardActionMode["Inline"] = 0] = "Inline";
    ShowCardActionMode[ShowCardActionMode["Popup"] = 1] = "Popup";
})(ShowCardActionMode = exports.ShowCardActionMode || (exports.ShowCardActionMode = {}));
var Orientation;
(function (Orientation) {
    Orientation[Orientation["Horizontal"] = 0] = "Horizontal";
    Orientation[Orientation["Vertical"] = 1] = "Vertical";
})(Orientation = exports.Orientation || (exports.Orientation = {}));
var BackgroundImageMode;
(function (BackgroundImageMode) {
    BackgroundImageMode[BackgroundImageMode["Stretch"] = 0] = "Stretch";
    BackgroundImageMode[BackgroundImageMode["RepeatHorizontally"] = 1] = "RepeatHorizontally";
    BackgroundImageMode[BackgroundImageMode["RepeatVertically"] = 2] = "RepeatVertically";
    BackgroundImageMode[BackgroundImageMode["Repeat"] = 3] = "Repeat";
})(BackgroundImageMode = exports.BackgroundImageMode || (exports.BackgroundImageMode = {}));
var ContainerStyle;
(function (ContainerStyle) {
    ContainerStyle["Default"] = "default";
    ContainerStyle["Emphasis"] = "emphasis";
})(ContainerStyle = exports.ContainerStyle || (exports.ContainerStyle = {}));
var ValidationError;
(function (ValidationError) {
    ValidationError[ValidationError["Hint"] = 0] = "Hint";
    ValidationError[ValidationError["ActionTypeNotAllowed"] = 1] = "ActionTypeNotAllowed";
    ValidationError[ValidationError["CollectionCantBeEmpty"] = 2] = "CollectionCantBeEmpty";
    ValidationError[ValidationError["Deprecated"] = 3] = "Deprecated";
    ValidationError[ValidationError["ElementTypeNotAllowed"] = 4] = "ElementTypeNotAllowed";
    ValidationError[ValidationError["InteractivityNotAllowed"] = 5] = "InteractivityNotAllowed";
    ValidationError[ValidationError["InvalidPropertyValue"] = 6] = "InvalidPropertyValue";
    ValidationError[ValidationError["MissingCardType"] = 7] = "MissingCardType";
    ValidationError[ValidationError["PropertyCantBeNull"] = 8] = "PropertyCantBeNull";
    ValidationError[ValidationError["TooManyActions"] = 9] = "TooManyActions";
    ValidationError[ValidationError["UnknownActionType"] = 10] = "UnknownActionType";
    ValidationError[ValidationError["UnknownElementType"] = 11] = "UnknownElementType";
    ValidationError[ValidationError["UnsupportedCardVersion"] = 12] = "UnsupportedCardVersion";
})(ValidationError = exports.ValidationError || (exports.ValidationError = {}));
var ContainerFitStatus;
(function (ContainerFitStatus) {
    ContainerFitStatus[ContainerFitStatus["FullyInContainer"] = 0] = "FullyInContainer";
    ContainerFitStatus[ContainerFitStatus["Overflowing"] = 1] = "Overflowing";
    ContainerFitStatus[ContainerFitStatus["FullyOutOfContainer"] = 2] = "FullyOutOfContainer";
})(ContainerFitStatus = exports.ContainerFitStatus || (exports.ContainerFitStatus = {}));
//# sourceMappingURL=enums.js.map

/***/ }),

/***/ "../../../node_modules/adaptivecards/lib/host-config.js":
/*!***********************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/adaptivecards/lib/host-config.js ***!
  \***********************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Enums = __webpack_require__(/*! ./enums */ "../../../node_modules/adaptivecards/lib/enums.js");
var Utils = __webpack_require__(/*! ./utils */ "../../../node_modules/adaptivecards/lib/utils.js");
var TextColorDefinition = /** @class */ (function () {
    function TextColorDefinition(obj) {
        this.default = "#000000";
        this.subtle = "#666666";
        if (obj) {
            this.default = obj["default"] || this.default;
            this.subtle = obj["subtle"] || this.subtle;
        }
    }
    return TextColorDefinition;
}());
exports.TextColorDefinition = TextColorDefinition;
var AdaptiveCardConfig = /** @class */ (function () {
    function AdaptiveCardConfig(obj) {
        this.allowCustomStyle = false;
        if (obj) {
            this.allowCustomStyle = obj["allowCustomStyle"] || this.allowCustomStyle;
        }
    }
    return AdaptiveCardConfig;
}());
exports.AdaptiveCardConfig = AdaptiveCardConfig;
var ImageSetConfig = /** @class */ (function () {
    function ImageSetConfig(obj) {
        this.imageSize = Enums.Size.Medium;
        this.maxImageHeight = 100;
        if (obj) {
            this.imageSize = obj["imageSize"] != null ? obj["imageSize"] : this.imageSize;
            this.maxImageHeight = Utils.getValueOrDefault(obj["maxImageHeight"], 100);
        }
    }
    ImageSetConfig.prototype.toJSON = function () {
        return {
            imageSize: Enums.Size[this.imageSize],
            maxImageHeight: this.maxImageHeight
        };
    };
    return ImageSetConfig;
}());
exports.ImageSetConfig = ImageSetConfig;
var FactTextDefinition = /** @class */ (function () {
    function FactTextDefinition(obj) {
        this.size = Enums.TextSize.Default;
        this.color = Enums.TextColor.Default;
        this.isSubtle = false;
        this.weight = Enums.TextWeight.Default;
        this.wrap = true;
        if (obj) {
            this.size = Utils.parseHostConfigEnum(Enums.TextSize, obj["size"], Enums.TextSize.Default);
            this.color = Utils.parseHostConfigEnum(Enums.TextColor, obj["color"], Enums.TextColor.Default);
            this.isSubtle = obj["isSubtle"] || this.isSubtle;
            this.weight = Utils.parseHostConfigEnum(Enums.TextWeight, obj["weight"], Enums.TextWeight.Default);
            this.wrap = obj["wrap"] != null ? obj["wrap"] : this.wrap;
        }
    }
    ;
    FactTextDefinition.prototype.toJSON = function () {
        return {
            size: Enums.TextSize[this.size],
            color: Enums.TextColor[this.color],
            isSubtle: this.isSubtle,
            weight: Enums.TextWeight[this.weight],
            warp: this.wrap
        };
    };
    return FactTextDefinition;
}());
exports.FactTextDefinition = FactTextDefinition;
var FactTitleDefinition = /** @class */ (function (_super) {
    __extends(FactTitleDefinition, _super);
    function FactTitleDefinition(obj) {
        var _this = _super.call(this, obj) || this;
        _this.maxWidth = 150;
        _this.weight = Enums.TextWeight.Bolder;
        if (obj) {
            _this.maxWidth = obj["maxWidth"] != null ? obj["maxWidth"] : _this.maxWidth;
        }
        return _this;
    }
    return FactTitleDefinition;
}(FactTextDefinition));
exports.FactTitleDefinition = FactTitleDefinition;
var FactSetConfig = /** @class */ (function () {
    function FactSetConfig(obj) {
        this.title = new FactTitleDefinition();
        this.value = new FactTextDefinition();
        this.spacing = 10;
        if (obj) {
            this.title = new FactTitleDefinition(obj["title"]);
            this.value = new FactTextDefinition(obj["value"]);
            this.spacing = obj.spacing && obj.spacing != null ? obj.spacing && obj.spacing : this.spacing;
        }
    }
    return FactSetConfig;
}());
exports.FactSetConfig = FactSetConfig;
var ShowCardActionConfig = /** @class */ (function () {
    function ShowCardActionConfig(obj) {
        this.actionMode = Enums.ShowCardActionMode.Inline;
        this.inlineTopMargin = 16;
        this.style = Enums.ContainerStyle.Emphasis;
        if (obj) {
            this.actionMode = Utils.parseHostConfigEnum(Enums.ShowCardActionMode, obj["actionMode"], Enums.ShowCardActionMode.Inline);
            this.inlineTopMargin = obj["inlineTopMargin"] != null ? obj["inlineTopMargin"] : this.inlineTopMargin;
            this.style = obj["style"] && typeof obj["style"] === "string" ? obj["style"] : Enums.ContainerStyle.Emphasis;
        }
    }
    ShowCardActionConfig.prototype.toJSON = function () {
        return {
            actionMode: Enums.ShowCardActionMode[this.actionMode],
            inlineTopMargin: this.inlineTopMargin,
            style: this.style
        };
    };
    return ShowCardActionConfig;
}());
exports.ShowCardActionConfig = ShowCardActionConfig;
var ActionsConfig = /** @class */ (function () {
    function ActionsConfig(obj) {
        this.maxActions = 5;
        this.spacing = Enums.Spacing.Default;
        this.buttonSpacing = 20;
        this.showCard = new ShowCardActionConfig();
        this.preExpandSingleShowCardAction = false;
        this.actionsOrientation = Enums.Orientation.Horizontal;
        this.actionAlignment = Enums.ActionAlignment.Left;
        if (obj) {
            this.maxActions = obj["maxActions"] != null ? obj["maxActions"] : this.maxActions;
            this.spacing = Utils.parseHostConfigEnum(Enums.Spacing, obj.spacing && obj.spacing, Enums.Spacing.Default);
            this.buttonSpacing = obj["buttonSpacing"] != null ? obj["buttonSpacing"] : this.buttonSpacing;
            this.showCard = new ShowCardActionConfig(obj["showCard"]);
            this.preExpandSingleShowCardAction = Utils.getValueOrDefault(obj["preExpandSingleShowCardAction"], false);
            this.actionsOrientation = Utils.parseHostConfigEnum(Enums.Orientation, obj["actionsOrientation"], Enums.Orientation.Horizontal);
            this.actionAlignment = Utils.parseHostConfigEnum(Enums.ActionAlignment, obj["actionAlignment"], Enums.ActionAlignment.Left);
        }
    }
    ActionsConfig.prototype.toJSON = function () {
        return {
            maxActions: this.maxActions,
            spacing: Enums.Spacing[this.spacing],
            buttonSpacing: this.buttonSpacing,
            showCard: this.showCard,
            preExpandSingleShowCardAction: this.preExpandSingleShowCardAction,
            actionsOrientation: Enums.Orientation[this.actionsOrientation],
            actionAlignment: Enums.ActionAlignment[this.actionAlignment]
        };
    };
    return ActionsConfig;
}());
exports.ActionsConfig = ActionsConfig;
var ContainerStyleDefinition = /** @class */ (function () {
    function ContainerStyleDefinition(obj) {
        this.foregroundColors = {
            default: new TextColorDefinition(),
            dark: new TextColorDefinition(),
            light: new TextColorDefinition(),
            accent: new TextColorDefinition(),
            good: new TextColorDefinition(),
            warning: new TextColorDefinition(),
            attention: new TextColorDefinition()
        };
        this.parse(obj);
    }
    ContainerStyleDefinition.prototype.getTextColorDefinitionOrDefault = function (obj, defaultValue) {
        return new TextColorDefinition(obj ? obj : defaultValue);
    };
    ContainerStyleDefinition.prototype.parse = function (obj) {
        if (obj) {
            this.backgroundColor = obj["backgroundColor"];
            if (obj.foregroundColors) {
                this.foregroundColors.default = this.getTextColorDefinitionOrDefault(obj.foregroundColors["default"], { default: "#333333", subtle: "#EE333333" });
                this.foregroundColors.dark = this.getTextColorDefinitionOrDefault(obj.foregroundColors["dark"], { default: "#000000", subtle: "#66000000" });
                this.foregroundColors.light = this.getTextColorDefinitionOrDefault(obj.foregroundColors["light"], { default: "#FFFFFF", subtle: "#33000000" });
                this.foregroundColors.accent = this.getTextColorDefinitionOrDefault(obj.foregroundColors["accent"], { default: "#2E89FC", subtle: "#882E89FC" });
                this.foregroundColors.good = this.getTextColorDefinitionOrDefault(obj.foregroundColors["good"], { default: "#54A254", subtle: "#DD54A254" });
                this.foregroundColors.warning = this.getTextColorDefinitionOrDefault(obj.foregroundColors["warning"], { default: "#E69500", subtle: "#DDE69500" });
                this.foregroundColors.attention = this.getTextColorDefinitionOrDefault(obj.foregroundColors["attention"], { default: "#CC3300", subtle: "#DDCC3300" });
            }
        }
    };
    Object.defineProperty(ContainerStyleDefinition.prototype, "isBuiltIn", {
        get: function () {
            return false;
        },
        enumerable: true,
        configurable: true
    });
    return ContainerStyleDefinition;
}());
exports.ContainerStyleDefinition = ContainerStyleDefinition;
var BuiltInContainerStyleDefinition = /** @class */ (function (_super) {
    __extends(BuiltInContainerStyleDefinition, _super);
    function BuiltInContainerStyleDefinition() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(BuiltInContainerStyleDefinition.prototype, "isBuiltIn", {
        get: function () {
            return true;
        },
        enumerable: true,
        configurable: true
    });
    return BuiltInContainerStyleDefinition;
}(ContainerStyleDefinition));
var ContainerStyleSet = /** @class */ (function () {
    function ContainerStyleSet(obj) {
        this._allStyles = {};
        this._allStyles[Enums.ContainerStyle.Default] = new BuiltInContainerStyleDefinition();
        this._allStyles[Enums.ContainerStyle.Emphasis] = new BuiltInContainerStyleDefinition();
        if (obj) {
            this._allStyles[Enums.ContainerStyle.Default].parse(obj[Enums.ContainerStyle.Default]);
            this._allStyles[Enums.ContainerStyle.Emphasis].parse(obj[Enums.ContainerStyle.Emphasis]);
            var customStyleArray = obj["customStyles"];
            if (customStyleArray && Array.isArray(customStyleArray)) {
                for (var _i = 0, customStyleArray_1 = customStyleArray; _i < customStyleArray_1.length; _i++) {
                    var customStyle = customStyleArray_1[_i];
                    if (customStyle) {
                        var styleName = customStyle["name"];
                        if (styleName && typeof styleName === "string") {
                            if (this._allStyles.hasOwnProperty(styleName)) {
                                this._allStyles[styleName].parse(customStyle["style"]);
                            }
                            else {
                                this._allStyles[styleName] = new ContainerStyleDefinition(customStyle["style"]);
                            }
                        }
                    }
                }
            }
        }
    }
    ContainerStyleSet.prototype.toJSON = function () {
        var _this = this;
        var customStyleArray = [];
        Object.keys(this._allStyles).forEach(function (key) {
            if (!_this._allStyles[key].isBuiltIn) {
                customStyleArray.push({
                    name: key,
                    style: _this._allStyles[key]
                });
            }
        });
        var result = {
            default: this.default,
            emphasis: this.emphasis
        };
        if (customStyleArray.length > 0) {
            result.customStyles = customStyleArray;
        }
        return result;
    };
    ContainerStyleSet.prototype.getStyleByName = function (name, defaultValue) {
        if (defaultValue === void 0) { defaultValue = null; }
        return this._allStyles.hasOwnProperty(name) ? this._allStyles[name] : defaultValue;
    };
    Object.defineProperty(ContainerStyleSet.prototype, "default", {
        get: function () {
            return this._allStyles[Enums.ContainerStyle.Default];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ContainerStyleSet.prototype, "emphasis", {
        get: function () {
            return this._allStyles[Enums.ContainerStyle.Emphasis];
        },
        enumerable: true,
        configurable: true
    });
    return ContainerStyleSet;
}());
exports.ContainerStyleSet = ContainerStyleSet;
var HostConfig = /** @class */ (function () {
    function HostConfig(obj) {
        this.choiceSetInputValueSeparator = ",";
        this.supportsInteractivity = true;
        this.fontFamily = "Segoe UI,Segoe,Segoe WP,Helvetica Neue,Helvetica,sans-serif";
        this.spacing = {
            small: 3,
            default: 8,
            medium: 20,
            large: 30,
            extraLarge: 40,
            padding: 15
        };
        this.separator = {
            lineThickness: 1,
            lineColor: "#EEEEEE"
        };
        this.fontSizes = {
            small: 12,
            default: 14,
            medium: 17,
            large: 21,
            extraLarge: 26
        };
        this.fontWeights = {
            lighter: 200,
            default: 400,
            bolder: 600
        };
        this.imageSizes = {
            small: 40,
            medium: 80,
            large: 160
        };
        this.containerStyles = new ContainerStyleSet();
        this.actions = new ActionsConfig();
        this.adaptiveCard = new AdaptiveCardConfig();
        this.imageSet = new ImageSetConfig();
        this.factSet = new FactSetConfig();
        if (obj) {
            if (typeof obj === "string" || obj instanceof String) {
                obj = JSON.parse(obj);
            }
            this.choiceSetInputValueSeparator = (obj && typeof obj["choiceSetInputValueSeparator"] === "string") ? obj["choiceSetInputValueSeparator"] : this.choiceSetInputValueSeparator;
            this.supportsInteractivity = (obj && typeof obj["supportsInteractivity"] === "boolean") ? obj["supportsInteractivity"] : this.supportsInteractivity;
            this.fontFamily = obj["fontFamily"] || this.fontFamily;
            this.fontSizes = {
                small: obj.fontSizes && obj.fontSizes["small"] || this.fontSizes.small,
                default: obj.fontSizes && obj.fontSizes["default"] || this.fontSizes.default,
                medium: obj.fontSizes && obj.fontSizes["medium"] || this.fontSizes.medium,
                large: obj.fontSizes && obj.fontSizes["large"] || this.fontSizes.large,
                extraLarge: obj.fontSizes && obj.fontSizes["extraLarge"] || this.fontSizes.extraLarge
            };
            this.fontWeights = {
                lighter: obj.fontWeights && obj.fontWeights["lighter"] || this.fontWeights.lighter,
                default: obj.fontWeights && obj.fontWeights["default"] || this.fontWeights.default,
                bolder: obj.fontWeights && obj.fontWeights["bolder"] || this.fontWeights.bolder
            };
            this.imageSizes = {
                small: obj.imageSizes && obj.imageSizes["small"] || this.imageSizes.small,
                medium: obj.imageSizes && obj.imageSizes["medium"] || this.imageSizes.medium,
                large: obj.imageSizes && obj.imageSizes["large"] || this.imageSizes.large,
            };
            this.containerStyles = new ContainerStyleSet(obj["containerStyles"]);
            this.spacing = {
                small: obj.spacing && obj.spacing["small"] || this.spacing.small,
                default: obj.spacing && obj.spacing["default"] || this.spacing.default,
                medium: obj.spacing && obj.spacing["medium"] || this.spacing.medium,
                large: obj.spacing && obj.spacing["large"] || this.spacing.large,
                extraLarge: obj.spacing && obj.spacing["extraLarge"] || this.spacing.extraLarge,
                padding: obj.spacing && obj.spacing["padding"] || this.spacing.padding
            };
            this.separator = {
                lineThickness: obj.separator && obj.separator["lineThickness"] || this.separator.lineThickness,
                lineColor: obj.separator && obj.separator["lineColor"] || this.separator.lineColor
            };
            this.actions = new ActionsConfig(obj.actions || this.actions);
            this.adaptiveCard = new AdaptiveCardConfig(obj.adaptiveCard || this.adaptiveCard);
            this.imageSet = new ImageSetConfig(obj["imageSet"]);
            this.factSet = new FactSetConfig(obj["factSet"]);
        }
    }
    HostConfig.prototype.getEffectiveSpacing = function (spacing) {
        switch (spacing) {
            case Enums.Spacing.Small:
                return this.spacing.small;
            case Enums.Spacing.Default:
                return this.spacing.default;
            case Enums.Spacing.Medium:
                return this.spacing.medium;
            case Enums.Spacing.Large:
                return this.spacing.large;
            case Enums.Spacing.ExtraLarge:
                return this.spacing.extraLarge;
            case Enums.Spacing.Padding:
                return this.spacing.padding;
            default:
                return 0;
        }
    };
    return HostConfig;
}());
exports.HostConfig = HostConfig;
//# sourceMappingURL=host-config.js.map

/***/ }),

/***/ "../../../node_modules/adaptivecards/lib/text-formatters.js":
/*!***************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/adaptivecards/lib/text-formatters.js ***!
  \***************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var AbstractTextFormatter = /** @class */ (function () {
    function AbstractTextFormatter(regularExpression) {
        this._regularExpression = regularExpression;
    }
    AbstractTextFormatter.prototype.format = function (lang, input) {
        var matches;
        var result = input;
        while ((matches = this._regularExpression.exec(input)) != null) {
            result = result.replace(matches[0], this.internalFormat(lang, matches));
        }
        ;
        return result;
    };
    return AbstractTextFormatter;
}());
var DateFormatter = /** @class */ (function (_super) {
    __extends(DateFormatter, _super);
    function DateFormatter() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DateFormatter.prototype.internalFormat = function (lang, matches) {
        var date = new Date(Date.parse(matches[1]));
        var format = matches[2] != undefined ? matches[2].toLowerCase() : "compact";
        if (format != "compact") {
            return date.toLocaleDateString(lang, { day: "numeric", weekday: format, month: format, year: "numeric" });
        }
        else {
            return date.toLocaleDateString();
        }
    };
    return DateFormatter;
}(AbstractTextFormatter));
var TimeFormatter = /** @class */ (function (_super) {
    __extends(TimeFormatter, _super);
    function TimeFormatter() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TimeFormatter.prototype.internalFormat = function (lang, matches) {
        var date = new Date(Date.parse(matches[1]));
        return date.toLocaleTimeString(lang, { hour: 'numeric', minute: '2-digit' });
    };
    return TimeFormatter;
}(AbstractTextFormatter));
function formatText(lang, text) {
    var formatters = [
        new DateFormatter(/\{{2}DATE\((\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:Z|(?:(?:-|\+)\d{2}:\d{2})))(?:, ?(COMPACT|LONG|SHORT))?\)\}{2}/g),
        new TimeFormatter(/\{{2}TIME\((\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:Z|(?:(?:-|\+)\d{2}:\d{2})))\)\}{2}/g)
    ];
    var result = text;
    for (var i = 0; i < formatters.length; i++) {
        result = formatters[i].format(lang, result);
    }
    return result;
}
exports.formatText = formatText;
//# sourceMappingURL=text-formatters.js.map

/***/ }),

/***/ "../../../node_modules/adaptivecards/lib/utils.js":
/*!*****************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/adaptivecards/lib/utils.js ***!
  \*****************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Enums = __webpack_require__(/*! ./enums */ "../../../node_modules/adaptivecards/lib/enums.js");
exports.ContentTypes = {
    applicationJson: "application/json",
    applicationXWwwFormUrlencoded: "application/x-www-form-urlencoded"
};
function getValueOrDefault(obj, defaultValue) {
    return obj ? obj : defaultValue;
}
exports.getValueOrDefault = getValueOrDefault;
function isNullOrEmpty(value) {
    return value === undefined || value === null || value === "";
}
exports.isNullOrEmpty = isNullOrEmpty;
function appendChild(node, child) {
    if (child != null && child != undefined) {
        node.appendChild(child);
    }
}
exports.appendChild = appendChild;
function getEnumValueOrDefault(targetEnum, name, defaultValue) {
    if (isNullOrEmpty(name)) {
        return defaultValue;
    }
    for (var key in targetEnum) {
        var isValueProperty = parseInt(key, 10) >= 0;
        if (isValueProperty) {
            var value = targetEnum[key];
            if (value && typeof value === "string") {
                if (value.toLowerCase() === name.toLowerCase()) {
                    return parseInt(key, 10);
                }
            }
        }
    }
    return defaultValue;
}
exports.getEnumValueOrDefault = getEnumValueOrDefault;
function parseHostConfigEnum(targetEnum, value, defaultValue) {
    if (typeof value === "string") {
        return getEnumValueOrDefault(targetEnum, value, defaultValue);
    }
    else if (typeof value === "number") {
        return getValueOrDefault(value, defaultValue);
    }
    else {
        return defaultValue;
    }
}
exports.parseHostConfigEnum = parseHostConfigEnum;
function renderSeparation(separationDefinition, orientation) {
    if (separationDefinition.spacing > 0 || separationDefinition.lineThickness > 0) {
        var separator = document.createElement("div");
        if (orientation == Enums.Orientation.Horizontal) {
            if (separationDefinition.lineThickness) {
                separator.style.marginTop = (separationDefinition.spacing / 2) + "px";
                separator.style.paddingTop = (separationDefinition.spacing / 2) + "px";
                separator.style.borderTop = separationDefinition.lineThickness + "px solid " + stringToCssColor(separationDefinition.lineColor);
            }
            else {
                separator.style.height = separationDefinition.spacing + "px";
            }
        }
        else {
            if (separationDefinition.lineThickness) {
                separator.style.marginLeft = (separationDefinition.spacing / 2) + "px";
                separator.style.paddingLeft = (separationDefinition.spacing / 2) + "px";
                separator.style.borderLeft = separationDefinition.lineThickness + "px solid " + stringToCssColor(separationDefinition.lineColor);
            }
            else {
                separator.style.width = separationDefinition.spacing + "px";
            }
        }
        separator.style.overflow = "hidden";
        return separator;
    }
    else {
        return null;
    }
}
exports.renderSeparation = renderSeparation;
function stringToCssColor(color) {
    var regEx = /#([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})?/gi;
    var matches = regEx.exec(color);
    if (matches && matches[4]) {
        var a = parseInt(matches[1], 16) / 255;
        var r = parseInt(matches[2], 16);
        var g = parseInt(matches[3], 16);
        var b = parseInt(matches[4], 16);
        return "rgba(" + r + "," + g + "," + b + "," + a + ")";
    }
    else {
        return color;
    }
}
exports.stringToCssColor = stringToCssColor;
var StringWithSubstitutions = /** @class */ (function () {
    function StringWithSubstitutions() {
        this._isProcessed = false;
        this._original = null;
        this._processed = null;
    }
    StringWithSubstitutions.prototype.substituteInputValues = function (inputs, contentType) {
        this._processed = this._original;
        var regEx = /\{{2}([a-z0-9_$@]+).value\}{2}/gi;
        var matches;
        while ((matches = regEx.exec(this._original)) != null) {
            var matchedInput = null;
            for (var i = 0; i < inputs.length; i++) {
                if (inputs[i].id.toLowerCase() == matches[1].toLowerCase()) {
                    matchedInput = inputs[i];
                    break;
                }
            }
            if (matchedInput) {
                var valueForReplace = "";
                if (matchedInput.value) {
                    valueForReplace = matchedInput.value;
                }
                if (contentType === exports.ContentTypes.applicationJson) {
                    valueForReplace = JSON.stringify(valueForReplace);
                    valueForReplace = valueForReplace.slice(1, -1);
                }
                else if (contentType === exports.ContentTypes.applicationXWwwFormUrlencoded) {
                    valueForReplace = encodeURIComponent(valueForReplace);
                }
                this._processed = this._processed.replace(matches[0], valueForReplace);
            }
        }
        ;
        this._isProcessed = true;
    };
    StringWithSubstitutions.prototype.get = function () {
        if (!this._isProcessed) {
            return this._original;
        }
        else {
            return this._processed;
        }
    };
    StringWithSubstitutions.prototype.set = function (value) {
        this._original = value;
        this._isProcessed = false;
    };
    return StringWithSubstitutions;
}());
exports.StringWithSubstitutions = StringWithSubstitutions;
function truncate(element, maxHeight, lineHeight) {
    var fits = function () {
        // Allow a one pixel overflow to account for rounding differences
        // between browsers
        return maxHeight - element.scrollHeight >= -1.0;
    };
    if (fits())
        return;
    var fullText = element.innerHTML;
    var truncateAt = function (idx) {
        element.innerHTML = fullText.substring(0, idx) + '...';
    };
    var breakableIndices = findBreakableIndices(fullText);
    var lo = 0;
    var hi = breakableIndices.length;
    var bestBreakIdx = 0;
    // Do a binary search for the longest string that fits
    while (lo < hi) {
        var mid = Math.floor((lo + hi) / 2);
        truncateAt(breakableIndices[mid]);
        if (fits()) {
            bestBreakIdx = breakableIndices[mid];
            lo = mid + 1;
        }
        else {
            hi = mid;
        }
    }
    truncateAt(bestBreakIdx);
    // If we have extra room, try to expand the string letter by letter
    // (covers the case where we have to break in the middle of a long word)
    if (lineHeight && maxHeight - element.scrollHeight >= lineHeight - 1.0) {
        var idx = findNextCharacter(fullText, bestBreakIdx);
        while (idx < fullText.length) {
            truncateAt(idx);
            if (fits()) {
                bestBreakIdx = idx;
                idx = findNextCharacter(fullText, idx);
            }
            else {
                break;
            }
        }
        truncateAt(bestBreakIdx);
    }
}
exports.truncate = truncate;
function findBreakableIndices(html) {
    var results = [];
    var idx = findNextCharacter(html, -1);
    while (idx < html.length) {
        if (html[idx] == ' ') {
            results.push(idx);
        }
        idx = findNextCharacter(html, idx);
    }
    return results;
}
function findNextCharacter(html, currIdx) {
    currIdx += 1;
    // If we found the start of an HTML tag, keep advancing until we get
    // past it, so we don't end up truncating in the middle of the tag
    while (currIdx < html.length && html[currIdx] == '<') {
        while (currIdx < html.length && html[currIdx++] != '>')
            ;
    }
    return currIdx;
}
function getFitStatus(element, containerEnd) {
    var start = element.offsetTop;
    var end = start + element.clientHeight;
    if (end <= containerEnd) {
        return Enums.ContainerFitStatus.FullyInContainer;
    }
    else if (start < containerEnd) {
        return Enums.ContainerFitStatus.Overflowing;
    }
    else {
        return Enums.ContainerFitStatus.FullyOutOfContainer;
    }
}
exports.getFitStatus = getFitStatus;
//# sourceMappingURL=utils.js.map

/***/ }),

/***/ "../../../node_modules/core-js/modules/_a-function.js":
/*!*********************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/core-js/modules/_a-function.js ***!
  \*********************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

module.exports = function (it) {
  if (typeof it != 'function') throw TypeError(it + ' is not a function!');
  return it;
};


/***/ }),

/***/ "../../../node_modules/core-js/modules/_add-to-unscopables.js":
/*!*****************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/core-js/modules/_add-to-unscopables.js ***!
  \*****************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

// 22.1.3.31 Array.prototype[@@unscopables]
var UNSCOPABLES = __webpack_require__(/*! ./_wks */ "../../../node_modules/core-js/modules/_wks.js")('unscopables');
var ArrayProto = Array.prototype;
if (ArrayProto[UNSCOPABLES] == undefined) __webpack_require__(/*! ./_hide */ "../../../node_modules/core-js/modules/_hide.js")(ArrayProto, UNSCOPABLES, {});
module.exports = function (key) {
  ArrayProto[UNSCOPABLES][key] = true;
};


/***/ }),

/***/ "../../../node_modules/core-js/modules/_an-object.js":
/*!********************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/core-js/modules/_an-object.js ***!
  \********************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(/*! ./_is-object */ "../../../node_modules/core-js/modules/_is-object.js");
module.exports = function (it) {
  if (!isObject(it)) throw TypeError(it + ' is not an object!');
  return it;
};


/***/ }),

/***/ "../../../node_modules/core-js/modules/_array-methods.js":
/*!************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/core-js/modules/_array-methods.js ***!
  \************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

// 0 -> Array#forEach
// 1 -> Array#map
// 2 -> Array#filter
// 3 -> Array#some
// 4 -> Array#every
// 5 -> Array#find
// 6 -> Array#findIndex
var ctx = __webpack_require__(/*! ./_ctx */ "../../../node_modules/core-js/modules/_ctx.js");
var IObject = __webpack_require__(/*! ./_iobject */ "../../../node_modules/core-js/modules/_iobject.js");
var toObject = __webpack_require__(/*! ./_to-object */ "../../../node_modules/core-js/modules/_to-object.js");
var toLength = __webpack_require__(/*! ./_to-length */ "../../../node_modules/core-js/modules/_to-length.js");
var asc = __webpack_require__(/*! ./_array-species-create */ "../../../node_modules/core-js/modules/_array-species-create.js");
module.exports = function (TYPE, $create) {
  var IS_MAP = TYPE == 1;
  var IS_FILTER = TYPE == 2;
  var IS_SOME = TYPE == 3;
  var IS_EVERY = TYPE == 4;
  var IS_FIND_INDEX = TYPE == 6;
  var NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
  var create = $create || asc;
  return function ($this, callbackfn, that) {
    var O = toObject($this);
    var self = IObject(O);
    var f = ctx(callbackfn, that, 3);
    var length = toLength(self.length);
    var index = 0;
    var result = IS_MAP ? create($this, length) : IS_FILTER ? create($this, 0) : undefined;
    var val, res;
    for (;length > index; index++) if (NO_HOLES || index in self) {
      val = self[index];
      res = f(val, index, O);
      if (TYPE) {
        if (IS_MAP) result[index] = res;   // map
        else if (res) switch (TYPE) {
          case 3: return true;             // some
          case 5: return val;              // find
          case 6: return index;            // findIndex
          case 2: result.push(val);        // filter
        } else if (IS_EVERY) return false; // every
      }
    }
    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : result;
  };
};


/***/ }),

/***/ "../../../node_modules/core-js/modules/_array-species-constructor.js":
/*!************************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/core-js/modules/_array-species-constructor.js ***!
  \************************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(/*! ./_is-object */ "../../../node_modules/core-js/modules/_is-object.js");
var isArray = __webpack_require__(/*! ./_is-array */ "../../../node_modules/core-js/modules/_is-array.js");
var SPECIES = __webpack_require__(/*! ./_wks */ "../../../node_modules/core-js/modules/_wks.js")('species');

module.exports = function (original) {
  var C;
  if (isArray(original)) {
    C = original.constructor;
    // cross-realm fallback
    if (typeof C == 'function' && (C === Array || isArray(C.prototype))) C = undefined;
    if (isObject(C)) {
      C = C[SPECIES];
      if (C === null) C = undefined;
    }
  } return C === undefined ? Array : C;
};


/***/ }),

/***/ "../../../node_modules/core-js/modules/_array-species-create.js":
/*!*******************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/core-js/modules/_array-species-create.js ***!
  \*******************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

// 9.4.2.3 ArraySpeciesCreate(originalArray, length)
var speciesConstructor = __webpack_require__(/*! ./_array-species-constructor */ "../../../node_modules/core-js/modules/_array-species-constructor.js");

module.exports = function (original, length) {
  return new (speciesConstructor(original))(length);
};


/***/ }),

/***/ "../../../node_modules/core-js/modules/_cof.js":
/*!**************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/core-js/modules/_cof.js ***!
  \**************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

var toString = {}.toString;

module.exports = function (it) {
  return toString.call(it).slice(8, -1);
};


/***/ }),

/***/ "../../../node_modules/core-js/modules/_core.js":
/*!***************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/core-js/modules/_core.js ***!
  \***************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

var core = module.exports = { version: '2.5.6' };
if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef


/***/ }),

/***/ "../../../node_modules/core-js/modules/_ctx.js":
/*!**************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/core-js/modules/_ctx.js ***!
  \**************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

// optional / simple context binding
var aFunction = __webpack_require__(/*! ./_a-function */ "../../../node_modules/core-js/modules/_a-function.js");
module.exports = function (fn, that, length) {
  aFunction(fn);
  if (that === undefined) return fn;
  switch (length) {
    case 1: return function (a) {
      return fn.call(that, a);
    };
    case 2: return function (a, b) {
      return fn.call(that, a, b);
    };
    case 3: return function (a, b, c) {
      return fn.call(that, a, b, c);
    };
  }
  return function (/* ...args */) {
    return fn.apply(that, arguments);
  };
};


/***/ }),

/***/ "../../../node_modules/core-js/modules/_defined.js":
/*!******************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/core-js/modules/_defined.js ***!
  \******************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

// 7.2.1 RequireObjectCoercible(argument)
module.exports = function (it) {
  if (it == undefined) throw TypeError("Can't call method on  " + it);
  return it;
};


/***/ }),

/***/ "../../../node_modules/core-js/modules/_descriptors.js":
/*!**********************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/core-js/modules/_descriptors.js ***!
  \**********************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

// Thank's IE8 for his funny defineProperty
module.exports = !__webpack_require__(/*! ./_fails */ "../../../node_modules/core-js/modules/_fails.js")(function () {
  return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
});


/***/ }),

/***/ "../../../node_modules/core-js/modules/_dom-create.js":
/*!*********************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/core-js/modules/_dom-create.js ***!
  \*********************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var isObject = __webpack_require__(/*! ./_is-object */ "../../../node_modules/core-js/modules/_is-object.js");
var document = __webpack_require__(/*! ./_global */ "../../../node_modules/core-js/modules/_global.js").document;
// typeof document.createElement is 'object' in old IE
var is = isObject(document) && isObject(document.createElement);
module.exports = function (it) {
  return is ? document.createElement(it) : {};
};


/***/ }),

/***/ "../../../node_modules/core-js/modules/_export.js":
/*!*****************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/core-js/modules/_export.js ***!
  \*****************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(/*! ./_global */ "../../../node_modules/core-js/modules/_global.js");
var core = __webpack_require__(/*! ./_core */ "../../../node_modules/core-js/modules/_core.js");
var hide = __webpack_require__(/*! ./_hide */ "../../../node_modules/core-js/modules/_hide.js");
var redefine = __webpack_require__(/*! ./_redefine */ "../../../node_modules/core-js/modules/_redefine.js");
var ctx = __webpack_require__(/*! ./_ctx */ "../../../node_modules/core-js/modules/_ctx.js");
var PROTOTYPE = 'prototype';

var $export = function (type, name, source) {
  var IS_FORCED = type & $export.F;
  var IS_GLOBAL = type & $export.G;
  var IS_STATIC = type & $export.S;
  var IS_PROTO = type & $export.P;
  var IS_BIND = type & $export.B;
  var target = IS_GLOBAL ? global : IS_STATIC ? global[name] || (global[name] = {}) : (global[name] || {})[PROTOTYPE];
  var exports = IS_GLOBAL ? core : core[name] || (core[name] = {});
  var expProto = exports[PROTOTYPE] || (exports[PROTOTYPE] = {});
  var key, own, out, exp;
  if (IS_GLOBAL) source = name;
  for (key in source) {
    // contains in native
    own = !IS_FORCED && target && target[key] !== undefined;
    // export native or passed
    out = (own ? target : source)[key];
    // bind timers to global for call from export context
    exp = IS_BIND && own ? ctx(out, global) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
    // extend global
    if (target) redefine(target, key, out, type & $export.U);
    // export
    if (exports[key] != out) hide(exports, key, exp);
    if (IS_PROTO && expProto[key] != out) expProto[key] = out;
  }
};
global.core = core;
// type bitmap
$export.F = 1;   // forced
$export.G = 2;   // global
$export.S = 4;   // static
$export.P = 8;   // proto
$export.B = 16;  // bind
$export.W = 32;  // wrap
$export.U = 64;  // safe
$export.R = 128; // real proto method for `library`
module.exports = $export;


/***/ }),

/***/ "../../../node_modules/core-js/modules/_fails-is-regexp.js":
/*!**************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/core-js/modules/_fails-is-regexp.js ***!
  \**************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var MATCH = __webpack_require__(/*! ./_wks */ "../../../node_modules/core-js/modules/_wks.js")('match');
module.exports = function (KEY) {
  var re = /./;
  try {
    '/./'[KEY](re);
  } catch (e) {
    try {
      re[MATCH] = false;
      return !'/./'[KEY](re);
    } catch (f) { /* empty */ }
  } return true;
};


/***/ }),

/***/ "../../../node_modules/core-js/modules/_fails.js":
/*!****************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/core-js/modules/_fails.js ***!
  \****************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

module.exports = function (exec) {
  try {
    return !!exec();
  } catch (e) {
    return true;
  }
};


/***/ }),

/***/ "../../../node_modules/core-js/modules/_global.js":
/*!*****************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/core-js/modules/_global.js ***!
  \*****************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self
  // eslint-disable-next-line no-new-func
  : Function('return this')();
if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef


/***/ }),

/***/ "../../../node_modules/core-js/modules/_has.js":
/*!**************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/core-js/modules/_has.js ***!
  \**************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

var hasOwnProperty = {}.hasOwnProperty;
module.exports = function (it, key) {
  return hasOwnProperty.call(it, key);
};


/***/ }),

/***/ "../../../node_modules/core-js/modules/_hide.js":
/*!***************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/core-js/modules/_hide.js ***!
  \***************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var dP = __webpack_require__(/*! ./_object-dp */ "../../../node_modules/core-js/modules/_object-dp.js");
var createDesc = __webpack_require__(/*! ./_property-desc */ "../../../node_modules/core-js/modules/_property-desc.js");
module.exports = __webpack_require__(/*! ./_descriptors */ "../../../node_modules/core-js/modules/_descriptors.js") ? function (object, key, value) {
  return dP.f(object, key, createDesc(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};


/***/ }),

/***/ "../../../node_modules/core-js/modules/_ie8-dom-define.js":
/*!*************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/core-js/modules/_ie8-dom-define.js ***!
  \*************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

module.exports = !__webpack_require__(/*! ./_descriptors */ "../../../node_modules/core-js/modules/_descriptors.js") && !__webpack_require__(/*! ./_fails */ "../../../node_modules/core-js/modules/_fails.js")(function () {
  return Object.defineProperty(__webpack_require__(/*! ./_dom-create */ "../../../node_modules/core-js/modules/_dom-create.js")('div'), 'a', { get: function () { return 7; } }).a != 7;
});


/***/ }),

/***/ "../../../node_modules/core-js/modules/_iobject.js":
/*!******************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/core-js/modules/_iobject.js ***!
  \******************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

// fallback for non-array-like ES3 and non-enumerable old V8 strings
var cof = __webpack_require__(/*! ./_cof */ "../../../node_modules/core-js/modules/_cof.js");
// eslint-disable-next-line no-prototype-builtins
module.exports = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
  return cof(it) == 'String' ? it.split('') : Object(it);
};


/***/ }),

/***/ "../../../node_modules/core-js/modules/_is-array.js":
/*!*******************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/core-js/modules/_is-array.js ***!
  \*******************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

// 7.2.2 IsArray(argument)
var cof = __webpack_require__(/*! ./_cof */ "../../../node_modules/core-js/modules/_cof.js");
module.exports = Array.isArray || function isArray(arg) {
  return cof(arg) == 'Array';
};


/***/ }),

/***/ "../../../node_modules/core-js/modules/_is-object.js":
/*!********************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/core-js/modules/_is-object.js ***!
  \********************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

module.exports = function (it) {
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};


/***/ }),

/***/ "../../../node_modules/core-js/modules/_is-regexp.js":
/*!********************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/core-js/modules/_is-regexp.js ***!
  \********************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

// 7.2.8 IsRegExp(argument)
var isObject = __webpack_require__(/*! ./_is-object */ "../../../node_modules/core-js/modules/_is-object.js");
var cof = __webpack_require__(/*! ./_cof */ "../../../node_modules/core-js/modules/_cof.js");
var MATCH = __webpack_require__(/*! ./_wks */ "../../../node_modules/core-js/modules/_wks.js")('match');
module.exports = function (it) {
  var isRegExp;
  return isObject(it) && ((isRegExp = it[MATCH]) !== undefined ? !!isRegExp : cof(it) == 'RegExp');
};


/***/ }),

/***/ "../../../node_modules/core-js/modules/_library.js":
/*!******************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/core-js/modules/_library.js ***!
  \******************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

module.exports = false;


/***/ }),

/***/ "../../../node_modules/core-js/modules/_object-dp.js":
/*!********************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/core-js/modules/_object-dp.js ***!
  \********************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var anObject = __webpack_require__(/*! ./_an-object */ "../../../node_modules/core-js/modules/_an-object.js");
var IE8_DOM_DEFINE = __webpack_require__(/*! ./_ie8-dom-define */ "../../../node_modules/core-js/modules/_ie8-dom-define.js");
var toPrimitive = __webpack_require__(/*! ./_to-primitive */ "../../../node_modules/core-js/modules/_to-primitive.js");
var dP = Object.defineProperty;

exports.f = __webpack_require__(/*! ./_descriptors */ "../../../node_modules/core-js/modules/_descriptors.js") ? Object.defineProperty : function defineProperty(O, P, Attributes) {
  anObject(O);
  P = toPrimitive(P, true);
  anObject(Attributes);
  if (IE8_DOM_DEFINE) try {
    return dP(O, P, Attributes);
  } catch (e) { /* empty */ }
  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};


/***/ }),

/***/ "../../../node_modules/core-js/modules/_property-desc.js":
/*!************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/core-js/modules/_property-desc.js ***!
  \************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

module.exports = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};


/***/ }),

/***/ "../../../node_modules/core-js/modules/_redefine.js":
/*!*******************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/core-js/modules/_redefine.js ***!
  \*******************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var global = __webpack_require__(/*! ./_global */ "../../../node_modules/core-js/modules/_global.js");
var hide = __webpack_require__(/*! ./_hide */ "../../../node_modules/core-js/modules/_hide.js");
var has = __webpack_require__(/*! ./_has */ "../../../node_modules/core-js/modules/_has.js");
var SRC = __webpack_require__(/*! ./_uid */ "../../../node_modules/core-js/modules/_uid.js")('src');
var TO_STRING = 'toString';
var $toString = Function[TO_STRING];
var TPL = ('' + $toString).split(TO_STRING);

__webpack_require__(/*! ./_core */ "../../../node_modules/core-js/modules/_core.js").inspectSource = function (it) {
  return $toString.call(it);
};

(module.exports = function (O, key, val, safe) {
  var isFunction = typeof val == 'function';
  if (isFunction) has(val, 'name') || hide(val, 'name', key);
  if (O[key] === val) return;
  if (isFunction) has(val, SRC) || hide(val, SRC, O[key] ? '' + O[key] : TPL.join(String(key)));
  if (O === global) {
    O[key] = val;
  } else if (!safe) {
    delete O[key];
    hide(O, key, val);
  } else if (O[key]) {
    O[key] = val;
  } else {
    hide(O, key, val);
  }
// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
})(Function.prototype, TO_STRING, function toString() {
  return typeof this == 'function' && this[SRC] || $toString.call(this);
});


/***/ }),

/***/ "../../../node_modules/core-js/modules/_shared.js":
/*!*****************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/core-js/modules/_shared.js ***!
  \*****************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var core = __webpack_require__(/*! ./_core */ "../../../node_modules/core-js/modules/_core.js");
var global = __webpack_require__(/*! ./_global */ "../../../node_modules/core-js/modules/_global.js");
var SHARED = '__core-js_shared__';
var store = global[SHARED] || (global[SHARED] = {});

(module.exports = function (key, value) {
  return store[key] || (store[key] = value !== undefined ? value : {});
})('versions', []).push({
  version: core.version,
  mode: __webpack_require__(/*! ./_library */ "../../../node_modules/core-js/modules/_library.js") ? 'pure' : 'global',
  copyright: '© 2018 Denis Pushkarev (zloirock.ru)'
});


/***/ }),

/***/ "../../../node_modules/core-js/modules/_string-context.js":
/*!*************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/core-js/modules/_string-context.js ***!
  \*************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

// helper for String#{startsWith, endsWith, includes}
var isRegExp = __webpack_require__(/*! ./_is-regexp */ "../../../node_modules/core-js/modules/_is-regexp.js");
var defined = __webpack_require__(/*! ./_defined */ "../../../node_modules/core-js/modules/_defined.js");

module.exports = function (that, searchString, NAME) {
  if (isRegExp(searchString)) throw TypeError('String#' + NAME + " doesn't accept regex!");
  return String(defined(that));
};


/***/ }),

/***/ "../../../node_modules/core-js/modules/_to-integer.js":
/*!*********************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/core-js/modules/_to-integer.js ***!
  \*********************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

// 7.1.4 ToInteger
var ceil = Math.ceil;
var floor = Math.floor;
module.exports = function (it) {
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};


/***/ }),

/***/ "../../../node_modules/core-js/modules/_to-length.js":
/*!********************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/core-js/modules/_to-length.js ***!
  \********************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

// 7.1.15 ToLength
var toInteger = __webpack_require__(/*! ./_to-integer */ "../../../node_modules/core-js/modules/_to-integer.js");
var min = Math.min;
module.exports = function (it) {
  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};


/***/ }),

/***/ "../../../node_modules/core-js/modules/_to-object.js":
/*!********************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/core-js/modules/_to-object.js ***!
  \********************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

// 7.1.13 ToObject(argument)
var defined = __webpack_require__(/*! ./_defined */ "../../../node_modules/core-js/modules/_defined.js");
module.exports = function (it) {
  return Object(defined(it));
};


/***/ }),

/***/ "../../../node_modules/core-js/modules/_to-primitive.js":
/*!***********************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/core-js/modules/_to-primitive.js ***!
  \***********************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

// 7.1.1 ToPrimitive(input [, PreferredType])
var isObject = __webpack_require__(/*! ./_is-object */ "../../../node_modules/core-js/modules/_is-object.js");
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
module.exports = function (it, S) {
  if (!isObject(it)) return it;
  var fn, val;
  if (S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  if (typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it))) return val;
  if (!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  throw TypeError("Can't convert object to primitive value");
};


/***/ }),

/***/ "../../../node_modules/core-js/modules/_uid.js":
/*!**************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/core-js/modules/_uid.js ***!
  \**************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

var id = 0;
var px = Math.random();
module.exports = function (key) {
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};


/***/ }),

/***/ "../../../node_modules/core-js/modules/_wks.js":
/*!**************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/core-js/modules/_wks.js ***!
  \**************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var store = __webpack_require__(/*! ./_shared */ "../../../node_modules/core-js/modules/_shared.js")('wks');
var uid = __webpack_require__(/*! ./_uid */ "../../../node_modules/core-js/modules/_uid.js");
var Symbol = __webpack_require__(/*! ./_global */ "../../../node_modules/core-js/modules/_global.js").Symbol;
var USE_SYMBOL = typeof Symbol == 'function';

var $exports = module.exports = function (name) {
  return store[name] || (store[name] =
    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
};

$exports.store = store;


/***/ }),

/***/ "../../../node_modules/core-js/modules/es6.array.find-index.js":
/*!******************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/core-js/modules/es6.array.find-index.js ***!
  \******************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// 22.1.3.9 Array.prototype.findIndex(predicate, thisArg = undefined)
var $export = __webpack_require__(/*! ./_export */ "../../../node_modules/core-js/modules/_export.js");
var $find = __webpack_require__(/*! ./_array-methods */ "../../../node_modules/core-js/modules/_array-methods.js")(6);
var KEY = 'findIndex';
var forced = true;
// Shouldn't skip holes
if (KEY in []) Array(1)[KEY](function () { forced = false; });
$export($export.P + $export.F * forced, 'Array', {
  findIndex: function findIndex(callbackfn /* , that = undefined */) {
    return $find(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});
__webpack_require__(/*! ./_add-to-unscopables */ "../../../node_modules/core-js/modules/_add-to-unscopables.js")(KEY);


/***/ }),

/***/ "../../../node_modules/core-js/modules/es6.array.find.js":
/*!************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/core-js/modules/es6.array.find.js ***!
  \************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// 22.1.3.8 Array.prototype.find(predicate, thisArg = undefined)
var $export = __webpack_require__(/*! ./_export */ "../../../node_modules/core-js/modules/_export.js");
var $find = __webpack_require__(/*! ./_array-methods */ "../../../node_modules/core-js/modules/_array-methods.js")(5);
var KEY = 'find';
var forced = true;
// Shouldn't skip holes
if (KEY in []) Array(1)[KEY](function () { forced = false; });
$export($export.P + $export.F * forced, 'Array', {
  find: function find(callbackfn /* , that = undefined */) {
    return $find(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});
__webpack_require__(/*! ./_add-to-unscopables */ "../../../node_modules/core-js/modules/_add-to-unscopables.js")(KEY);


/***/ }),

/***/ "../../../node_modules/core-js/modules/es6.string.starts-with.js":
/*!********************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/core-js/modules/es6.string.starts-with.js ***!
  \********************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// 21.1.3.18 String.prototype.startsWith(searchString [, position ])

var $export = __webpack_require__(/*! ./_export */ "../../../node_modules/core-js/modules/_export.js");
var toLength = __webpack_require__(/*! ./_to-length */ "../../../node_modules/core-js/modules/_to-length.js");
var context = __webpack_require__(/*! ./_string-context */ "../../../node_modules/core-js/modules/_string-context.js");
var STARTS_WITH = 'startsWith';
var $startsWith = ''[STARTS_WITH];

$export($export.P + $export.F * __webpack_require__(/*! ./_fails-is-regexp */ "../../../node_modules/core-js/modules/_fails-is-regexp.js")(STARTS_WITH), 'String', {
  startsWith: function startsWith(searchString /* , position = 0 */) {
    var that = context(this, searchString, STARTS_WITH);
    var index = toLength(Math.min(arguments.length > 1 ? arguments[1] : undefined, that.length));
    var search = String(searchString);
    return $startsWith
      ? $startsWith.call(that, search, index)
      : that.slice(index, index + search.length) === search;
  }
});


/***/ }),

/***/ "../../../node_modules/entities/maps/entities.json":
/*!******************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/entities/maps/entities.json ***!
  \******************************************************************************************************/
/*! exports provided: Aacute, aacute, Abreve, abreve, ac, acd, acE, Acirc, acirc, acute, Acy, acy, AElig, aelig, af, Afr, afr, Agrave, agrave, alefsym, aleph, Alpha, alpha, Amacr, amacr, amalg, amp, AMP, andand, And, and, andd, andslope, andv, ang, ange, angle, angmsdaa, angmsdab, angmsdac, angmsdad, angmsdae, angmsdaf, angmsdag, angmsdah, angmsd, angrt, angrtvb, angrtvbd, angsph, angst, angzarr, Aogon, aogon, Aopf, aopf, apacir, ap, apE, ape, apid, apos, ApplyFunction, approx, approxeq, Aring, aring, Ascr, ascr, Assign, ast, asymp, asympeq, Atilde, atilde, Auml, auml, awconint, awint, backcong, backepsilon, backprime, backsim, backsimeq, Backslash, Barv, barvee, barwed, Barwed, barwedge, bbrk, bbrktbrk, bcong, Bcy, bcy, bdquo, becaus, because, Because, bemptyv, bepsi, bernou, Bernoullis, Beta, beta, beth, between, Bfr, bfr, bigcap, bigcirc, bigcup, bigodot, bigoplus, bigotimes, bigsqcup, bigstar, bigtriangledown, bigtriangleup, biguplus, bigvee, bigwedge, bkarow, blacklozenge, blacksquare, blacktriangle, blacktriangledown, blacktriangleleft, blacktriangleright, blank, blk12, blk14, blk34, block, bne, bnequiv, bNot, bnot, Bopf, bopf, bot, bottom, bowtie, boxbox, boxdl, boxdL, boxDl, boxDL, boxdr, boxdR, boxDr, boxDR, boxh, boxH, boxhd, boxHd, boxhD, boxHD, boxhu, boxHu, boxhU, boxHU, boxminus, boxplus, boxtimes, boxul, boxuL, boxUl, boxUL, boxur, boxuR, boxUr, boxUR, boxv, boxV, boxvh, boxvH, boxVh, boxVH, boxvl, boxvL, boxVl, boxVL, boxvr, boxvR, boxVr, boxVR, bprime, breve, Breve, brvbar, bscr, Bscr, bsemi, bsim, bsime, bsolb, bsol, bsolhsub, bull, bullet, bump, bumpE, bumpe, Bumpeq, bumpeq, Cacute, cacute, capand, capbrcup, capcap, cap, Cap, capcup, capdot, CapitalDifferentialD, caps, caret, caron, Cayleys, ccaps, Ccaron, ccaron, Ccedil, ccedil, Ccirc, ccirc, Cconint, ccups, ccupssm, Cdot, cdot, cedil, Cedilla, cemptyv, cent, centerdot, CenterDot, cfr, Cfr, CHcy, chcy, check, checkmark, Chi, chi, circ, circeq, circlearrowleft, circlearrowright, circledast, circledcirc, circleddash, CircleDot, circledR, circledS, CircleMinus, CirclePlus, CircleTimes, cir, cirE, cire, cirfnint, cirmid, cirscir, ClockwiseContourIntegral, CloseCurlyDoubleQuote, CloseCurlyQuote, clubs, clubsuit, colon, Colon, Colone, colone, coloneq, comma, commat, comp, compfn, complement, complexes, cong, congdot, Congruent, conint, Conint, ContourIntegral, copf, Copf, coprod, Coproduct, copy, COPY, copysr, CounterClockwiseContourIntegral, crarr, cross, Cross, Cscr, cscr, csub, csube, csup, csupe, ctdot, cudarrl, cudarrr, cuepr, cuesc, cularr, cularrp, cupbrcap, cupcap, CupCap, cup, Cup, cupcup, cupdot, cupor, cups, curarr, curarrm, curlyeqprec, curlyeqsucc, curlyvee, curlywedge, curren, curvearrowleft, curvearrowright, cuvee, cuwed, cwconint, cwint, cylcty, dagger, Dagger, daleth, darr, Darr, dArr, dash, Dashv, dashv, dbkarow, dblac, Dcaron, dcaron, Dcy, dcy, ddagger, ddarr, DD, dd, DDotrahd, ddotseq, deg, Del, Delta, delta, demptyv, dfisht, Dfr, dfr, dHar, dharl, dharr, DiacriticalAcute, DiacriticalDot, DiacriticalDoubleAcute, DiacriticalGrave, DiacriticalTilde, diam, diamond, Diamond, diamondsuit, diams, die, DifferentialD, digamma, disin, div, divide, divideontimes, divonx, DJcy, djcy, dlcorn, dlcrop, dollar, Dopf, dopf, Dot, dot, DotDot, doteq, doteqdot, DotEqual, dotminus, dotplus, dotsquare, doublebarwedge, DoubleContourIntegral, DoubleDot, DoubleDownArrow, DoubleLeftArrow, DoubleLeftRightArrow, DoubleLeftTee, DoubleLongLeftArrow, DoubleLongLeftRightArrow, DoubleLongRightArrow, DoubleRightArrow, DoubleRightTee, DoubleUpArrow, DoubleUpDownArrow, DoubleVerticalBar, DownArrowBar, downarrow, DownArrow, Downarrow, DownArrowUpArrow, DownBreve, downdownarrows, downharpoonleft, downharpoonright, DownLeftRightVector, DownLeftTeeVector, DownLeftVectorBar, DownLeftVector, DownRightTeeVector, DownRightVectorBar, DownRightVector, DownTeeArrow, DownTee, drbkarow, drcorn, drcrop, Dscr, dscr, DScy, dscy, dsol, Dstrok, dstrok, dtdot, dtri, dtrif, duarr, duhar, dwangle, DZcy, dzcy, dzigrarr, Eacute, eacute, easter, Ecaron, ecaron, Ecirc, ecirc, ecir, ecolon, Ecy, ecy, eDDot, Edot, edot, eDot, ee, efDot, Efr, efr, eg, Egrave, egrave, egs, egsdot, el, Element, elinters, ell, els, elsdot, Emacr, emacr, empty, emptyset, EmptySmallSquare, emptyv, EmptyVerySmallSquare, emsp13, emsp14, emsp, ENG, eng, ensp, Eogon, eogon, Eopf, eopf, epar, eparsl, eplus, epsi, Epsilon, epsilon, epsiv, eqcirc, eqcolon, eqsim, eqslantgtr, eqslantless, Equal, equals, EqualTilde, equest, Equilibrium, equiv, equivDD, eqvparsl, erarr, erDot, escr, Escr, esdot, Esim, esim, Eta, eta, ETH, eth, Euml, euml, euro, excl, exist, Exists, expectation, exponentiale, ExponentialE, fallingdotseq, Fcy, fcy, female, ffilig, fflig, ffllig, Ffr, ffr, filig, FilledSmallSquare, FilledVerySmallSquare, fjlig, flat, fllig, fltns, fnof, Fopf, fopf, forall, ForAll, fork, forkv, Fouriertrf, fpartint, frac12, frac13, frac14, frac15, frac16, frac18, frac23, frac25, frac34, frac35, frac38, frac45, frac56, frac58, frac78, frasl, frown, fscr, Fscr, gacute, Gamma, gamma, Gammad, gammad, gap, Gbreve, gbreve, Gcedil, Gcirc, gcirc, Gcy, gcy, Gdot, gdot, ge, gE, gEl, gel, geq, geqq, geqslant, gescc, ges, gesdot, gesdoto, gesdotol, gesl, gesles, Gfr, gfr, gg, Gg, ggg, gimel, GJcy, gjcy, gla, gl, glE, glj, gnap, gnapprox, gne, gnE, gneq, gneqq, gnsim, Gopf, gopf, grave, GreaterEqual, GreaterEqualLess, GreaterFullEqual, GreaterGreater, GreaterLess, GreaterSlantEqual, GreaterTilde, Gscr, gscr, gsim, gsime, gsiml, gtcc, gtcir, gt, GT, Gt, gtdot, gtlPar, gtquest, gtrapprox, gtrarr, gtrdot, gtreqless, gtreqqless, gtrless, gtrsim, gvertneqq, gvnE, Hacek, hairsp, half, hamilt, HARDcy, hardcy, harrcir, harr, hArr, harrw, Hat, hbar, Hcirc, hcirc, hearts, heartsuit, hellip, hercon, hfr, Hfr, HilbertSpace, hksearow, hkswarow, hoarr, homtht, hookleftarrow, hookrightarrow, hopf, Hopf, horbar, HorizontalLine, hscr, Hscr, hslash, Hstrok, hstrok, HumpDownHump, HumpEqual, hybull, hyphen, Iacute, iacute, ic, Icirc, icirc, Icy, icy, Idot, IEcy, iecy, iexcl, iff, ifr, Ifr, Igrave, igrave, ii, iiiint, iiint, iinfin, iiota, IJlig, ijlig, Imacr, imacr, image, ImaginaryI, imagline, imagpart, imath, Im, imof, imped, Implies, incare, in, infin, infintie, inodot, intcal, int, Int, integers, Integral, intercal, Intersection, intlarhk, intprod, InvisibleComma, InvisibleTimes, IOcy, iocy, Iogon, iogon, Iopf, iopf, Iota, iota, iprod, iquest, iscr, Iscr, isin, isindot, isinE, isins, isinsv, isinv, it, Itilde, itilde, Iukcy, iukcy, Iuml, iuml, Jcirc, jcirc, Jcy, jcy, Jfr, jfr, jmath, Jopf, jopf, Jscr, jscr, Jsercy, jsercy, Jukcy, jukcy, Kappa, kappa, kappav, Kcedil, kcedil, Kcy, kcy, Kfr, kfr, kgreen, KHcy, khcy, KJcy, kjcy, Kopf, kopf, Kscr, kscr, lAarr, Lacute, lacute, laemptyv, lagran, Lambda, lambda, lang, Lang, langd, langle, lap, Laplacetrf, laquo, larrb, larrbfs, larr, Larr, lArr, larrfs, larrhk, larrlp, larrpl, larrsim, larrtl, latail, lAtail, lat, late, lates, lbarr, lBarr, lbbrk, lbrace, lbrack, lbrke, lbrksld, lbrkslu, Lcaron, lcaron, Lcedil, lcedil, lceil, lcub, Lcy, lcy, ldca, ldquo, ldquor, ldrdhar, ldrushar, ldsh, le, lE, LeftAngleBracket, LeftArrowBar, leftarrow, LeftArrow, Leftarrow, LeftArrowRightArrow, leftarrowtail, LeftCeiling, LeftDoubleBracket, LeftDownTeeVector, LeftDownVectorBar, LeftDownVector, LeftFloor, leftharpoondown, leftharpoonup, leftleftarrows, leftrightarrow, LeftRightArrow, Leftrightarrow, leftrightarrows, leftrightharpoons, leftrightsquigarrow, LeftRightVector, LeftTeeArrow, LeftTee, LeftTeeVector, leftthreetimes, LeftTriangleBar, LeftTriangle, LeftTriangleEqual, LeftUpDownVector, LeftUpTeeVector, LeftUpVectorBar, LeftUpVector, LeftVectorBar, LeftVector, lEg, leg, leq, leqq, leqslant, lescc, les, lesdot, lesdoto, lesdotor, lesg, lesges, lessapprox, lessdot, lesseqgtr, lesseqqgtr, LessEqualGreater, LessFullEqual, LessGreater, lessgtr, LessLess, lesssim, LessSlantEqual, LessTilde, lfisht, lfloor, Lfr, lfr, lg, lgE, lHar, lhard, lharu, lharul, lhblk, LJcy, ljcy, llarr, ll, Ll, llcorner, Lleftarrow, llhard, lltri, Lmidot, lmidot, lmoustache, lmoust, lnap, lnapprox, lne, lnE, lneq, lneqq, lnsim, loang, loarr, lobrk, longleftarrow, LongLeftArrow, Longleftarrow, longleftrightarrow, LongLeftRightArrow, Longleftrightarrow, longmapsto, longrightarrow, LongRightArrow, Longrightarrow, looparrowleft, looparrowright, lopar, Lopf, lopf, loplus, lotimes, lowast, lowbar, LowerLeftArrow, LowerRightArrow, loz, lozenge, lozf, lpar, lparlt, lrarr, lrcorner, lrhar, lrhard, lrm, lrtri, lsaquo, lscr, Lscr, lsh, Lsh, lsim, lsime, lsimg, lsqb, lsquo, lsquor, Lstrok, lstrok, ltcc, ltcir, lt, LT, Lt, ltdot, lthree, ltimes, ltlarr, ltquest, ltri, ltrie, ltrif, ltrPar, lurdshar, luruhar, lvertneqq, lvnE, macr, male, malt, maltese, Map, map, mapsto, mapstodown, mapstoleft, mapstoup, marker, mcomma, Mcy, mcy, mdash, mDDot, measuredangle, MediumSpace, Mellintrf, Mfr, mfr, mho, micro, midast, midcir, mid, middot, minusb, minus, minusd, minusdu, MinusPlus, mlcp, mldr, mnplus, models, Mopf, mopf, mp, mscr, Mscr, mstpos, Mu, mu, multimap, mumap, nabla, Nacute, nacute, nang, nap, napE, napid, napos, napprox, natural, naturals, natur, nbsp, nbump, nbumpe, ncap, Ncaron, ncaron, Ncedil, ncedil, ncong, ncongdot, ncup, Ncy, ncy, ndash, nearhk, nearr, neArr, nearrow, ne, nedot, NegativeMediumSpace, NegativeThickSpace, NegativeThinSpace, NegativeVeryThinSpace, nequiv, nesear, nesim, NestedGreaterGreater, NestedLessLess, NewLine, nexist, nexists, Nfr, nfr, ngE, nge, ngeq, ngeqq, ngeqslant, nges, nGg, ngsim, nGt, ngt, ngtr, nGtv, nharr, nhArr, nhpar, ni, nis, nisd, niv, NJcy, njcy, nlarr, nlArr, nldr, nlE, nle, nleftarrow, nLeftarrow, nleftrightarrow, nLeftrightarrow, nleq, nleqq, nleqslant, nles, nless, nLl, nlsim, nLt, nlt, nltri, nltrie, nLtv, nmid, NoBreak, NonBreakingSpace, nopf, Nopf, Not, not, NotCongruent, NotCupCap, NotDoubleVerticalBar, NotElement, NotEqual, NotEqualTilde, NotExists, NotGreater, NotGreaterEqual, NotGreaterFullEqual, NotGreaterGreater, NotGreaterLess, NotGreaterSlantEqual, NotGreaterTilde, NotHumpDownHump, NotHumpEqual, notin, notindot, notinE, notinva, notinvb, notinvc, NotLeftTriangleBar, NotLeftTriangle, NotLeftTriangleEqual, NotLess, NotLessEqual, NotLessGreater, NotLessLess, NotLessSlantEqual, NotLessTilde, NotNestedGreaterGreater, NotNestedLessLess, notni, notniva, notnivb, notnivc, NotPrecedes, NotPrecedesEqual, NotPrecedesSlantEqual, NotReverseElement, NotRightTriangleBar, NotRightTriangle, NotRightTriangleEqual, NotSquareSubset, NotSquareSubsetEqual, NotSquareSuperset, NotSquareSupersetEqual, NotSubset, NotSubsetEqual, NotSucceeds, NotSucceedsEqual, NotSucceedsSlantEqual, NotSucceedsTilde, NotSuperset, NotSupersetEqual, NotTilde, NotTildeEqual, NotTildeFullEqual, NotTildeTilde, NotVerticalBar, nparallel, npar, nparsl, npart, npolint, npr, nprcue, nprec, npreceq, npre, nrarrc, nrarr, nrArr, nrarrw, nrightarrow, nRightarrow, nrtri, nrtrie, nsc, nsccue, nsce, Nscr, nscr, nshortmid, nshortparallel, nsim, nsime, nsimeq, nsmid, nspar, nsqsube, nsqsupe, nsub, nsubE, nsube, nsubset, nsubseteq, nsubseteqq, nsucc, nsucceq, nsup, nsupE, nsupe, nsupset, nsupseteq, nsupseteqq, ntgl, Ntilde, ntilde, ntlg, ntriangleleft, ntrianglelefteq, ntriangleright, ntrianglerighteq, Nu, nu, num, numero, numsp, nvap, nvdash, nvDash, nVdash, nVDash, nvge, nvgt, nvHarr, nvinfin, nvlArr, nvle, nvlt, nvltrie, nvrArr, nvrtrie, nvsim, nwarhk, nwarr, nwArr, nwarrow, nwnear, Oacute, oacute, oast, Ocirc, ocirc, ocir, Ocy, ocy, odash, Odblac, odblac, odiv, odot, odsold, OElig, oelig, ofcir, Ofr, ofr, ogon, Ograve, ograve, ogt, ohbar, ohm, oint, olarr, olcir, olcross, oline, olt, Omacr, omacr, Omega, omega, Omicron, omicron, omid, ominus, Oopf, oopf, opar, OpenCurlyDoubleQuote, OpenCurlyQuote, operp, oplus, orarr, Or, or, ord, order, orderof, ordf, ordm, origof, oror, orslope, orv, oS, Oscr, oscr, Oslash, oslash, osol, Otilde, otilde, otimesas, Otimes, otimes, Ouml, ouml, ovbar, OverBar, OverBrace, OverBracket, OverParenthesis, para, parallel, par, parsim, parsl, part, PartialD, Pcy, pcy, percnt, period, permil, perp, pertenk, Pfr, pfr, Phi, phi, phiv, phmmat, phone, Pi, pi, pitchfork, piv, planck, planckh, plankv, plusacir, plusb, pluscir, plus, plusdo, plusdu, pluse, PlusMinus, plusmn, plussim, plustwo, pm, Poincareplane, pointint, popf, Popf, pound, prap, Pr, pr, prcue, precapprox, prec, preccurlyeq, Precedes, PrecedesEqual, PrecedesSlantEqual, PrecedesTilde, preceq, precnapprox, precneqq, precnsim, pre, prE, precsim, prime, Prime, primes, prnap, prnE, prnsim, prod, Product, profalar, profline, profsurf, prop, Proportional, Proportion, propto, prsim, prurel, Pscr, pscr, Psi, psi, puncsp, Qfr, qfr, qint, qopf, Qopf, qprime, Qscr, qscr, quaternions, quatint, quest, questeq, quot, QUOT, rAarr, race, Racute, racute, radic, raemptyv, rang, Rang, rangd, range, rangle, raquo, rarrap, rarrb, rarrbfs, rarrc, rarr, Rarr, rArr, rarrfs, rarrhk, rarrlp, rarrpl, rarrsim, Rarrtl, rarrtl, rarrw, ratail, rAtail, ratio, rationals, rbarr, rBarr, RBarr, rbbrk, rbrace, rbrack, rbrke, rbrksld, rbrkslu, Rcaron, rcaron, Rcedil, rcedil, rceil, rcub, Rcy, rcy, rdca, rdldhar, rdquo, rdquor, rdsh, real, realine, realpart, reals, Re, rect, reg, REG, ReverseElement, ReverseEquilibrium, ReverseUpEquilibrium, rfisht, rfloor, rfr, Rfr, rHar, rhard, rharu, rharul, Rho, rho, rhov, RightAngleBracket, RightArrowBar, rightarrow, RightArrow, Rightarrow, RightArrowLeftArrow, rightarrowtail, RightCeiling, RightDoubleBracket, RightDownTeeVector, RightDownVectorBar, RightDownVector, RightFloor, rightharpoondown, rightharpoonup, rightleftarrows, rightleftharpoons, rightrightarrows, rightsquigarrow, RightTeeArrow, RightTee, RightTeeVector, rightthreetimes, RightTriangleBar, RightTriangle, RightTriangleEqual, RightUpDownVector, RightUpTeeVector, RightUpVectorBar, RightUpVector, RightVectorBar, RightVector, ring, risingdotseq, rlarr, rlhar, rlm, rmoustache, rmoust, rnmid, roang, roarr, robrk, ropar, ropf, Ropf, roplus, rotimes, RoundImplies, rpar, rpargt, rppolint, rrarr, Rrightarrow, rsaquo, rscr, Rscr, rsh, Rsh, rsqb, rsquo, rsquor, rthree, rtimes, rtri, rtrie, rtrif, rtriltri, RuleDelayed, ruluhar, rx, Sacute, sacute, sbquo, scap, Scaron, scaron, Sc, sc, sccue, sce, scE, Scedil, scedil, Scirc, scirc, scnap, scnE, scnsim, scpolint, scsim, Scy, scy, sdotb, sdot, sdote, searhk, searr, seArr, searrow, sect, semi, seswar, setminus, setmn, sext, Sfr, sfr, sfrown, sharp, SHCHcy, shchcy, SHcy, shcy, ShortDownArrow, ShortLeftArrow, shortmid, shortparallel, ShortRightArrow, ShortUpArrow, shy, Sigma, sigma, sigmaf, sigmav, sim, simdot, sime, simeq, simg, simgE, siml, simlE, simne, simplus, simrarr, slarr, SmallCircle, smallsetminus, smashp, smeparsl, smid, smile, smt, smte, smtes, SOFTcy, softcy, solbar, solb, sol, Sopf, sopf, spades, spadesuit, spar, sqcap, sqcaps, sqcup, sqcups, Sqrt, sqsub, sqsube, sqsubset, sqsubseteq, sqsup, sqsupe, sqsupset, sqsupseteq, square, Square, SquareIntersection, SquareSubset, SquareSubsetEqual, SquareSuperset, SquareSupersetEqual, SquareUnion, squarf, squ, squf, srarr, Sscr, sscr, ssetmn, ssmile, sstarf, Star, star, starf, straightepsilon, straightphi, strns, sub, Sub, subdot, subE, sube, subedot, submult, subnE, subne, subplus, subrarr, subset, Subset, subseteq, subseteqq, SubsetEqual, subsetneq, subsetneqq, subsim, subsub, subsup, succapprox, succ, succcurlyeq, Succeeds, SucceedsEqual, SucceedsSlantEqual, SucceedsTilde, succeq, succnapprox, succneqq, succnsim, succsim, SuchThat, sum, Sum, sung, sup1, sup2, sup3, sup, Sup, supdot, supdsub, supE, supe, supedot, Superset, SupersetEqual, suphsol, suphsub, suplarr, supmult, supnE, supne, supplus, supset, Supset, supseteq, supseteqq, supsetneq, supsetneqq, supsim, supsub, supsup, swarhk, swarr, swArr, swarrow, swnwar, szlig, Tab, target, Tau, tau, tbrk, Tcaron, tcaron, Tcedil, tcedil, Tcy, tcy, tdot, telrec, Tfr, tfr, there4, therefore, Therefore, Theta, theta, thetasym, thetav, thickapprox, thicksim, ThickSpace, ThinSpace, thinsp, thkap, thksim, THORN, thorn, tilde, Tilde, TildeEqual, TildeFullEqual, TildeTilde, timesbar, timesb, times, timesd, tint, toea, topbot, topcir, top, Topf, topf, topfork, tosa, tprime, trade, TRADE, triangle, triangledown, triangleleft, trianglelefteq, triangleq, triangleright, trianglerighteq, tridot, trie, triminus, TripleDot, triplus, trisb, tritime, trpezium, Tscr, tscr, TScy, tscy, TSHcy, tshcy, Tstrok, tstrok, twixt, twoheadleftarrow, twoheadrightarrow, Uacute, uacute, uarr, Uarr, uArr, Uarrocir, Ubrcy, ubrcy, Ubreve, ubreve, Ucirc, ucirc, Ucy, ucy, udarr, Udblac, udblac, udhar, ufisht, Ufr, ufr, Ugrave, ugrave, uHar, uharl, uharr, uhblk, ulcorn, ulcorner, ulcrop, ultri, Umacr, umacr, uml, UnderBar, UnderBrace, UnderBracket, UnderParenthesis, Union, UnionPlus, Uogon, uogon, Uopf, uopf, UpArrowBar, uparrow, UpArrow, Uparrow, UpArrowDownArrow, updownarrow, UpDownArrow, Updownarrow, UpEquilibrium, upharpoonleft, upharpoonright, uplus, UpperLeftArrow, UpperRightArrow, upsi, Upsi, upsih, Upsilon, upsilon, UpTeeArrow, UpTee, upuparrows, urcorn, urcorner, urcrop, Uring, uring, urtri, Uscr, uscr, utdot, Utilde, utilde, utri, utrif, uuarr, Uuml, uuml, uwangle, vangrt, varepsilon, varkappa, varnothing, varphi, varpi, varpropto, varr, vArr, varrho, varsigma, varsubsetneq, varsubsetneqq, varsupsetneq, varsupsetneqq, vartheta, vartriangleleft, vartriangleright, vBar, Vbar, vBarv, Vcy, vcy, vdash, vDash, Vdash, VDash, Vdashl, veebar, vee, Vee, veeeq, vellip, verbar, Verbar, vert, Vert, VerticalBar, VerticalLine, VerticalSeparator, VerticalTilde, VeryThinSpace, Vfr, vfr, vltri, vnsub, vnsup, Vopf, vopf, vprop, vrtri, Vscr, vscr, vsubnE, vsubne, vsupnE, vsupne, Vvdash, vzigzag, Wcirc, wcirc, wedbar, wedge, Wedge, wedgeq, weierp, Wfr, wfr, Wopf, wopf, wp, wr, wreath, Wscr, wscr, xcap, xcirc, xcup, xdtri, Xfr, xfr, xharr, xhArr, Xi, xi, xlarr, xlArr, xmap, xnis, xodot, Xopf, xopf, xoplus, xotime, xrarr, xrArr, Xscr, xscr, xsqcup, xuplus, xutri, xvee, xwedge, Yacute, yacute, YAcy, yacy, Ycirc, ycirc, Ycy, ycy, yen, Yfr, yfr, YIcy, yicy, Yopf, yopf, Yscr, yscr, YUcy, yucy, yuml, Yuml, Zacute, zacute, Zcaron, zcaron, Zcy, zcy, Zdot, zdot, zeetrf, ZeroWidthSpace, Zeta, zeta, zfr, Zfr, ZHcy, zhcy, zigrarr, zopf, Zopf, Zscr, zscr, zwj, zwnj, default */
/*! all exports used */
/***/ (function(module) {

module.exports = {"Aacute":"Á","aacute":"á","Abreve":"Ă","abreve":"ă","ac":"∾","acd":"∿","acE":"∾̳","Acirc":"Â","acirc":"â","acute":"´","Acy":"А","acy":"а","AElig":"Æ","aelig":"æ","af":"⁡","Afr":"𝔄","afr":"𝔞","Agrave":"À","agrave":"à","alefsym":"ℵ","aleph":"ℵ","Alpha":"Α","alpha":"α","Amacr":"Ā","amacr":"ā","amalg":"⨿","amp":"&","AMP":"&","andand":"⩕","And":"⩓","and":"∧","andd":"⩜","andslope":"⩘","andv":"⩚","ang":"∠","ange":"⦤","angle":"∠","angmsdaa":"⦨","angmsdab":"⦩","angmsdac":"⦪","angmsdad":"⦫","angmsdae":"⦬","angmsdaf":"⦭","angmsdag":"⦮","angmsdah":"⦯","angmsd":"∡","angrt":"∟","angrtvb":"⊾","angrtvbd":"⦝","angsph":"∢","angst":"Å","angzarr":"⍼","Aogon":"Ą","aogon":"ą","Aopf":"𝔸","aopf":"𝕒","apacir":"⩯","ap":"≈","apE":"⩰","ape":"≊","apid":"≋","apos":"'","ApplyFunction":"⁡","approx":"≈","approxeq":"≊","Aring":"Å","aring":"å","Ascr":"𝒜","ascr":"𝒶","Assign":"≔","ast":"*","asymp":"≈","asympeq":"≍","Atilde":"Ã","atilde":"ã","Auml":"Ä","auml":"ä","awconint":"∳","awint":"⨑","backcong":"≌","backepsilon":"϶","backprime":"‵","backsim":"∽","backsimeq":"⋍","Backslash":"∖","Barv":"⫧","barvee":"⊽","barwed":"⌅","Barwed":"⌆","barwedge":"⌅","bbrk":"⎵","bbrktbrk":"⎶","bcong":"≌","Bcy":"Б","bcy":"б","bdquo":"„","becaus":"∵","because":"∵","Because":"∵","bemptyv":"⦰","bepsi":"϶","bernou":"ℬ","Bernoullis":"ℬ","Beta":"Β","beta":"β","beth":"ℶ","between":"≬","Bfr":"𝔅","bfr":"𝔟","bigcap":"⋂","bigcirc":"◯","bigcup":"⋃","bigodot":"⨀","bigoplus":"⨁","bigotimes":"⨂","bigsqcup":"⨆","bigstar":"★","bigtriangledown":"▽","bigtriangleup":"△","biguplus":"⨄","bigvee":"⋁","bigwedge":"⋀","bkarow":"⤍","blacklozenge":"⧫","blacksquare":"▪","blacktriangle":"▴","blacktriangledown":"▾","blacktriangleleft":"◂","blacktriangleright":"▸","blank":"␣","blk12":"▒","blk14":"░","blk34":"▓","block":"█","bne":"=⃥","bnequiv":"≡⃥","bNot":"⫭","bnot":"⌐","Bopf":"𝔹","bopf":"𝕓","bot":"⊥","bottom":"⊥","bowtie":"⋈","boxbox":"⧉","boxdl":"┐","boxdL":"╕","boxDl":"╖","boxDL":"╗","boxdr":"┌","boxdR":"╒","boxDr":"╓","boxDR":"╔","boxh":"─","boxH":"═","boxhd":"┬","boxHd":"╤","boxhD":"╥","boxHD":"╦","boxhu":"┴","boxHu":"╧","boxhU":"╨","boxHU":"╩","boxminus":"⊟","boxplus":"⊞","boxtimes":"⊠","boxul":"┘","boxuL":"╛","boxUl":"╜","boxUL":"╝","boxur":"└","boxuR":"╘","boxUr":"╙","boxUR":"╚","boxv":"│","boxV":"║","boxvh":"┼","boxvH":"╪","boxVh":"╫","boxVH":"╬","boxvl":"┤","boxvL":"╡","boxVl":"╢","boxVL":"╣","boxvr":"├","boxvR":"╞","boxVr":"╟","boxVR":"╠","bprime":"‵","breve":"˘","Breve":"˘","brvbar":"¦","bscr":"𝒷","Bscr":"ℬ","bsemi":"⁏","bsim":"∽","bsime":"⋍","bsolb":"⧅","bsol":"\\","bsolhsub":"⟈","bull":"•","bullet":"•","bump":"≎","bumpE":"⪮","bumpe":"≏","Bumpeq":"≎","bumpeq":"≏","Cacute":"Ć","cacute":"ć","capand":"⩄","capbrcup":"⩉","capcap":"⩋","cap":"∩","Cap":"⋒","capcup":"⩇","capdot":"⩀","CapitalDifferentialD":"ⅅ","caps":"∩︀","caret":"⁁","caron":"ˇ","Cayleys":"ℭ","ccaps":"⩍","Ccaron":"Č","ccaron":"č","Ccedil":"Ç","ccedil":"ç","Ccirc":"Ĉ","ccirc":"ĉ","Cconint":"∰","ccups":"⩌","ccupssm":"⩐","Cdot":"Ċ","cdot":"ċ","cedil":"¸","Cedilla":"¸","cemptyv":"⦲","cent":"¢","centerdot":"·","CenterDot":"·","cfr":"𝔠","Cfr":"ℭ","CHcy":"Ч","chcy":"ч","check":"✓","checkmark":"✓","Chi":"Χ","chi":"χ","circ":"ˆ","circeq":"≗","circlearrowleft":"↺","circlearrowright":"↻","circledast":"⊛","circledcirc":"⊚","circleddash":"⊝","CircleDot":"⊙","circledR":"®","circledS":"Ⓢ","CircleMinus":"⊖","CirclePlus":"⊕","CircleTimes":"⊗","cir":"○","cirE":"⧃","cire":"≗","cirfnint":"⨐","cirmid":"⫯","cirscir":"⧂","ClockwiseContourIntegral":"∲","CloseCurlyDoubleQuote":"”","CloseCurlyQuote":"’","clubs":"♣","clubsuit":"♣","colon":":","Colon":"∷","Colone":"⩴","colone":"≔","coloneq":"≔","comma":",","commat":"@","comp":"∁","compfn":"∘","complement":"∁","complexes":"ℂ","cong":"≅","congdot":"⩭","Congruent":"≡","conint":"∮","Conint":"∯","ContourIntegral":"∮","copf":"𝕔","Copf":"ℂ","coprod":"∐","Coproduct":"∐","copy":"©","COPY":"©","copysr":"℗","CounterClockwiseContourIntegral":"∳","crarr":"↵","cross":"✗","Cross":"⨯","Cscr":"𝒞","cscr":"𝒸","csub":"⫏","csube":"⫑","csup":"⫐","csupe":"⫒","ctdot":"⋯","cudarrl":"⤸","cudarrr":"⤵","cuepr":"⋞","cuesc":"⋟","cularr":"↶","cularrp":"⤽","cupbrcap":"⩈","cupcap":"⩆","CupCap":"≍","cup":"∪","Cup":"⋓","cupcup":"⩊","cupdot":"⊍","cupor":"⩅","cups":"∪︀","curarr":"↷","curarrm":"⤼","curlyeqprec":"⋞","curlyeqsucc":"⋟","curlyvee":"⋎","curlywedge":"⋏","curren":"¤","curvearrowleft":"↶","curvearrowright":"↷","cuvee":"⋎","cuwed":"⋏","cwconint":"∲","cwint":"∱","cylcty":"⌭","dagger":"†","Dagger":"‡","daleth":"ℸ","darr":"↓","Darr":"↡","dArr":"⇓","dash":"‐","Dashv":"⫤","dashv":"⊣","dbkarow":"⤏","dblac":"˝","Dcaron":"Ď","dcaron":"ď","Dcy":"Д","dcy":"д","ddagger":"‡","ddarr":"⇊","DD":"ⅅ","dd":"ⅆ","DDotrahd":"⤑","ddotseq":"⩷","deg":"°","Del":"∇","Delta":"Δ","delta":"δ","demptyv":"⦱","dfisht":"⥿","Dfr":"𝔇","dfr":"𝔡","dHar":"⥥","dharl":"⇃","dharr":"⇂","DiacriticalAcute":"´","DiacriticalDot":"˙","DiacriticalDoubleAcute":"˝","DiacriticalGrave":"`","DiacriticalTilde":"˜","diam":"⋄","diamond":"⋄","Diamond":"⋄","diamondsuit":"♦","diams":"♦","die":"¨","DifferentialD":"ⅆ","digamma":"ϝ","disin":"⋲","div":"÷","divide":"÷","divideontimes":"⋇","divonx":"⋇","DJcy":"Ђ","djcy":"ђ","dlcorn":"⌞","dlcrop":"⌍","dollar":"$","Dopf":"𝔻","dopf":"𝕕","Dot":"¨","dot":"˙","DotDot":"⃜","doteq":"≐","doteqdot":"≑","DotEqual":"≐","dotminus":"∸","dotplus":"∔","dotsquare":"⊡","doublebarwedge":"⌆","DoubleContourIntegral":"∯","DoubleDot":"¨","DoubleDownArrow":"⇓","DoubleLeftArrow":"⇐","DoubleLeftRightArrow":"⇔","DoubleLeftTee":"⫤","DoubleLongLeftArrow":"⟸","DoubleLongLeftRightArrow":"⟺","DoubleLongRightArrow":"⟹","DoubleRightArrow":"⇒","DoubleRightTee":"⊨","DoubleUpArrow":"⇑","DoubleUpDownArrow":"⇕","DoubleVerticalBar":"∥","DownArrowBar":"⤓","downarrow":"↓","DownArrow":"↓","Downarrow":"⇓","DownArrowUpArrow":"⇵","DownBreve":"̑","downdownarrows":"⇊","downharpoonleft":"⇃","downharpoonright":"⇂","DownLeftRightVector":"⥐","DownLeftTeeVector":"⥞","DownLeftVectorBar":"⥖","DownLeftVector":"↽","DownRightTeeVector":"⥟","DownRightVectorBar":"⥗","DownRightVector":"⇁","DownTeeArrow":"↧","DownTee":"⊤","drbkarow":"⤐","drcorn":"⌟","drcrop":"⌌","Dscr":"𝒟","dscr":"𝒹","DScy":"Ѕ","dscy":"ѕ","dsol":"⧶","Dstrok":"Đ","dstrok":"đ","dtdot":"⋱","dtri":"▿","dtrif":"▾","duarr":"⇵","duhar":"⥯","dwangle":"⦦","DZcy":"Џ","dzcy":"џ","dzigrarr":"⟿","Eacute":"É","eacute":"é","easter":"⩮","Ecaron":"Ě","ecaron":"ě","Ecirc":"Ê","ecirc":"ê","ecir":"≖","ecolon":"≕","Ecy":"Э","ecy":"э","eDDot":"⩷","Edot":"Ė","edot":"ė","eDot":"≑","ee":"ⅇ","efDot":"≒","Efr":"𝔈","efr":"𝔢","eg":"⪚","Egrave":"È","egrave":"è","egs":"⪖","egsdot":"⪘","el":"⪙","Element":"∈","elinters":"⏧","ell":"ℓ","els":"⪕","elsdot":"⪗","Emacr":"Ē","emacr":"ē","empty":"∅","emptyset":"∅","EmptySmallSquare":"◻","emptyv":"∅","EmptyVerySmallSquare":"▫","emsp13":" ","emsp14":" ","emsp":" ","ENG":"Ŋ","eng":"ŋ","ensp":" ","Eogon":"Ę","eogon":"ę","Eopf":"𝔼","eopf":"𝕖","epar":"⋕","eparsl":"⧣","eplus":"⩱","epsi":"ε","Epsilon":"Ε","epsilon":"ε","epsiv":"ϵ","eqcirc":"≖","eqcolon":"≕","eqsim":"≂","eqslantgtr":"⪖","eqslantless":"⪕","Equal":"⩵","equals":"=","EqualTilde":"≂","equest":"≟","Equilibrium":"⇌","equiv":"≡","equivDD":"⩸","eqvparsl":"⧥","erarr":"⥱","erDot":"≓","escr":"ℯ","Escr":"ℰ","esdot":"≐","Esim":"⩳","esim":"≂","Eta":"Η","eta":"η","ETH":"Ð","eth":"ð","Euml":"Ë","euml":"ë","euro":"€","excl":"!","exist":"∃","Exists":"∃","expectation":"ℰ","exponentiale":"ⅇ","ExponentialE":"ⅇ","fallingdotseq":"≒","Fcy":"Ф","fcy":"ф","female":"♀","ffilig":"ﬃ","fflig":"ﬀ","ffllig":"ﬄ","Ffr":"𝔉","ffr":"𝔣","filig":"ﬁ","FilledSmallSquare":"◼","FilledVerySmallSquare":"▪","fjlig":"fj","flat":"♭","fllig":"ﬂ","fltns":"▱","fnof":"ƒ","Fopf":"𝔽","fopf":"𝕗","forall":"∀","ForAll":"∀","fork":"⋔","forkv":"⫙","Fouriertrf":"ℱ","fpartint":"⨍","frac12":"½","frac13":"⅓","frac14":"¼","frac15":"⅕","frac16":"⅙","frac18":"⅛","frac23":"⅔","frac25":"⅖","frac34":"¾","frac35":"⅗","frac38":"⅜","frac45":"⅘","frac56":"⅚","frac58":"⅝","frac78":"⅞","frasl":"⁄","frown":"⌢","fscr":"𝒻","Fscr":"ℱ","gacute":"ǵ","Gamma":"Γ","gamma":"γ","Gammad":"Ϝ","gammad":"ϝ","gap":"⪆","Gbreve":"Ğ","gbreve":"ğ","Gcedil":"Ģ","Gcirc":"Ĝ","gcirc":"ĝ","Gcy":"Г","gcy":"г","Gdot":"Ġ","gdot":"ġ","ge":"≥","gE":"≧","gEl":"⪌","gel":"⋛","geq":"≥","geqq":"≧","geqslant":"⩾","gescc":"⪩","ges":"⩾","gesdot":"⪀","gesdoto":"⪂","gesdotol":"⪄","gesl":"⋛︀","gesles":"⪔","Gfr":"𝔊","gfr":"𝔤","gg":"≫","Gg":"⋙","ggg":"⋙","gimel":"ℷ","GJcy":"Ѓ","gjcy":"ѓ","gla":"⪥","gl":"≷","glE":"⪒","glj":"⪤","gnap":"⪊","gnapprox":"⪊","gne":"⪈","gnE":"≩","gneq":"⪈","gneqq":"≩","gnsim":"⋧","Gopf":"𝔾","gopf":"𝕘","grave":"`","GreaterEqual":"≥","GreaterEqualLess":"⋛","GreaterFullEqual":"≧","GreaterGreater":"⪢","GreaterLess":"≷","GreaterSlantEqual":"⩾","GreaterTilde":"≳","Gscr":"𝒢","gscr":"ℊ","gsim":"≳","gsime":"⪎","gsiml":"⪐","gtcc":"⪧","gtcir":"⩺","gt":">","GT":">","Gt":"≫","gtdot":"⋗","gtlPar":"⦕","gtquest":"⩼","gtrapprox":"⪆","gtrarr":"⥸","gtrdot":"⋗","gtreqless":"⋛","gtreqqless":"⪌","gtrless":"≷","gtrsim":"≳","gvertneqq":"≩︀","gvnE":"≩︀","Hacek":"ˇ","hairsp":" ","half":"½","hamilt":"ℋ","HARDcy":"Ъ","hardcy":"ъ","harrcir":"⥈","harr":"↔","hArr":"⇔","harrw":"↭","Hat":"^","hbar":"ℏ","Hcirc":"Ĥ","hcirc":"ĥ","hearts":"♥","heartsuit":"♥","hellip":"…","hercon":"⊹","hfr":"𝔥","Hfr":"ℌ","HilbertSpace":"ℋ","hksearow":"⤥","hkswarow":"⤦","hoarr":"⇿","homtht":"∻","hookleftarrow":"↩","hookrightarrow":"↪","hopf":"𝕙","Hopf":"ℍ","horbar":"―","HorizontalLine":"─","hscr":"𝒽","Hscr":"ℋ","hslash":"ℏ","Hstrok":"Ħ","hstrok":"ħ","HumpDownHump":"≎","HumpEqual":"≏","hybull":"⁃","hyphen":"‐","Iacute":"Í","iacute":"í","ic":"⁣","Icirc":"Î","icirc":"î","Icy":"И","icy":"и","Idot":"İ","IEcy":"Е","iecy":"е","iexcl":"¡","iff":"⇔","ifr":"𝔦","Ifr":"ℑ","Igrave":"Ì","igrave":"ì","ii":"ⅈ","iiiint":"⨌","iiint":"∭","iinfin":"⧜","iiota":"℩","IJlig":"Ĳ","ijlig":"ĳ","Imacr":"Ī","imacr":"ī","image":"ℑ","ImaginaryI":"ⅈ","imagline":"ℐ","imagpart":"ℑ","imath":"ı","Im":"ℑ","imof":"⊷","imped":"Ƶ","Implies":"⇒","incare":"℅","in":"∈","infin":"∞","infintie":"⧝","inodot":"ı","intcal":"⊺","int":"∫","Int":"∬","integers":"ℤ","Integral":"∫","intercal":"⊺","Intersection":"⋂","intlarhk":"⨗","intprod":"⨼","InvisibleComma":"⁣","InvisibleTimes":"⁢","IOcy":"Ё","iocy":"ё","Iogon":"Į","iogon":"į","Iopf":"𝕀","iopf":"𝕚","Iota":"Ι","iota":"ι","iprod":"⨼","iquest":"¿","iscr":"𝒾","Iscr":"ℐ","isin":"∈","isindot":"⋵","isinE":"⋹","isins":"⋴","isinsv":"⋳","isinv":"∈","it":"⁢","Itilde":"Ĩ","itilde":"ĩ","Iukcy":"І","iukcy":"і","Iuml":"Ï","iuml":"ï","Jcirc":"Ĵ","jcirc":"ĵ","Jcy":"Й","jcy":"й","Jfr":"𝔍","jfr":"𝔧","jmath":"ȷ","Jopf":"𝕁","jopf":"𝕛","Jscr":"𝒥","jscr":"𝒿","Jsercy":"Ј","jsercy":"ј","Jukcy":"Є","jukcy":"є","Kappa":"Κ","kappa":"κ","kappav":"ϰ","Kcedil":"Ķ","kcedil":"ķ","Kcy":"К","kcy":"к","Kfr":"𝔎","kfr":"𝔨","kgreen":"ĸ","KHcy":"Х","khcy":"х","KJcy":"Ќ","kjcy":"ќ","Kopf":"𝕂","kopf":"𝕜","Kscr":"𝒦","kscr":"𝓀","lAarr":"⇚","Lacute":"Ĺ","lacute":"ĺ","laemptyv":"⦴","lagran":"ℒ","Lambda":"Λ","lambda":"λ","lang":"⟨","Lang":"⟪","langd":"⦑","langle":"⟨","lap":"⪅","Laplacetrf":"ℒ","laquo":"«","larrb":"⇤","larrbfs":"⤟","larr":"←","Larr":"↞","lArr":"⇐","larrfs":"⤝","larrhk":"↩","larrlp":"↫","larrpl":"⤹","larrsim":"⥳","larrtl":"↢","latail":"⤙","lAtail":"⤛","lat":"⪫","late":"⪭","lates":"⪭︀","lbarr":"⤌","lBarr":"⤎","lbbrk":"❲","lbrace":"{","lbrack":"[","lbrke":"⦋","lbrksld":"⦏","lbrkslu":"⦍","Lcaron":"Ľ","lcaron":"ľ","Lcedil":"Ļ","lcedil":"ļ","lceil":"⌈","lcub":"{","Lcy":"Л","lcy":"л","ldca":"⤶","ldquo":"“","ldquor":"„","ldrdhar":"⥧","ldrushar":"⥋","ldsh":"↲","le":"≤","lE":"≦","LeftAngleBracket":"⟨","LeftArrowBar":"⇤","leftarrow":"←","LeftArrow":"←","Leftarrow":"⇐","LeftArrowRightArrow":"⇆","leftarrowtail":"↢","LeftCeiling":"⌈","LeftDoubleBracket":"⟦","LeftDownTeeVector":"⥡","LeftDownVectorBar":"⥙","LeftDownVector":"⇃","LeftFloor":"⌊","leftharpoondown":"↽","leftharpoonup":"↼","leftleftarrows":"⇇","leftrightarrow":"↔","LeftRightArrow":"↔","Leftrightarrow":"⇔","leftrightarrows":"⇆","leftrightharpoons":"⇋","leftrightsquigarrow":"↭","LeftRightVector":"⥎","LeftTeeArrow":"↤","LeftTee":"⊣","LeftTeeVector":"⥚","leftthreetimes":"⋋","LeftTriangleBar":"⧏","LeftTriangle":"⊲","LeftTriangleEqual":"⊴","LeftUpDownVector":"⥑","LeftUpTeeVector":"⥠","LeftUpVectorBar":"⥘","LeftUpVector":"↿","LeftVectorBar":"⥒","LeftVector":"↼","lEg":"⪋","leg":"⋚","leq":"≤","leqq":"≦","leqslant":"⩽","lescc":"⪨","les":"⩽","lesdot":"⩿","lesdoto":"⪁","lesdotor":"⪃","lesg":"⋚︀","lesges":"⪓","lessapprox":"⪅","lessdot":"⋖","lesseqgtr":"⋚","lesseqqgtr":"⪋","LessEqualGreater":"⋚","LessFullEqual":"≦","LessGreater":"≶","lessgtr":"≶","LessLess":"⪡","lesssim":"≲","LessSlantEqual":"⩽","LessTilde":"≲","lfisht":"⥼","lfloor":"⌊","Lfr":"𝔏","lfr":"𝔩","lg":"≶","lgE":"⪑","lHar":"⥢","lhard":"↽","lharu":"↼","lharul":"⥪","lhblk":"▄","LJcy":"Љ","ljcy":"љ","llarr":"⇇","ll":"≪","Ll":"⋘","llcorner":"⌞","Lleftarrow":"⇚","llhard":"⥫","lltri":"◺","Lmidot":"Ŀ","lmidot":"ŀ","lmoustache":"⎰","lmoust":"⎰","lnap":"⪉","lnapprox":"⪉","lne":"⪇","lnE":"≨","lneq":"⪇","lneqq":"≨","lnsim":"⋦","loang":"⟬","loarr":"⇽","lobrk":"⟦","longleftarrow":"⟵","LongLeftArrow":"⟵","Longleftarrow":"⟸","longleftrightarrow":"⟷","LongLeftRightArrow":"⟷","Longleftrightarrow":"⟺","longmapsto":"⟼","longrightarrow":"⟶","LongRightArrow":"⟶","Longrightarrow":"⟹","looparrowleft":"↫","looparrowright":"↬","lopar":"⦅","Lopf":"𝕃","lopf":"𝕝","loplus":"⨭","lotimes":"⨴","lowast":"∗","lowbar":"_","LowerLeftArrow":"↙","LowerRightArrow":"↘","loz":"◊","lozenge":"◊","lozf":"⧫","lpar":"(","lparlt":"⦓","lrarr":"⇆","lrcorner":"⌟","lrhar":"⇋","lrhard":"⥭","lrm":"‎","lrtri":"⊿","lsaquo":"‹","lscr":"𝓁","Lscr":"ℒ","lsh":"↰","Lsh":"↰","lsim":"≲","lsime":"⪍","lsimg":"⪏","lsqb":"[","lsquo":"‘","lsquor":"‚","Lstrok":"Ł","lstrok":"ł","ltcc":"⪦","ltcir":"⩹","lt":"<","LT":"<","Lt":"≪","ltdot":"⋖","lthree":"⋋","ltimes":"⋉","ltlarr":"⥶","ltquest":"⩻","ltri":"◃","ltrie":"⊴","ltrif":"◂","ltrPar":"⦖","lurdshar":"⥊","luruhar":"⥦","lvertneqq":"≨︀","lvnE":"≨︀","macr":"¯","male":"♂","malt":"✠","maltese":"✠","Map":"⤅","map":"↦","mapsto":"↦","mapstodown":"↧","mapstoleft":"↤","mapstoup":"↥","marker":"▮","mcomma":"⨩","Mcy":"М","mcy":"м","mdash":"—","mDDot":"∺","measuredangle":"∡","MediumSpace":" ","Mellintrf":"ℳ","Mfr":"𝔐","mfr":"𝔪","mho":"℧","micro":"µ","midast":"*","midcir":"⫰","mid":"∣","middot":"·","minusb":"⊟","minus":"−","minusd":"∸","minusdu":"⨪","MinusPlus":"∓","mlcp":"⫛","mldr":"…","mnplus":"∓","models":"⊧","Mopf":"𝕄","mopf":"𝕞","mp":"∓","mscr":"𝓂","Mscr":"ℳ","mstpos":"∾","Mu":"Μ","mu":"μ","multimap":"⊸","mumap":"⊸","nabla":"∇","Nacute":"Ń","nacute":"ń","nang":"∠⃒","nap":"≉","napE":"⩰̸","napid":"≋̸","napos":"ŉ","napprox":"≉","natural":"♮","naturals":"ℕ","natur":"♮","nbsp":" ","nbump":"≎̸","nbumpe":"≏̸","ncap":"⩃","Ncaron":"Ň","ncaron":"ň","Ncedil":"Ņ","ncedil":"ņ","ncong":"≇","ncongdot":"⩭̸","ncup":"⩂","Ncy":"Н","ncy":"н","ndash":"–","nearhk":"⤤","nearr":"↗","neArr":"⇗","nearrow":"↗","ne":"≠","nedot":"≐̸","NegativeMediumSpace":"​","NegativeThickSpace":"​","NegativeThinSpace":"​","NegativeVeryThinSpace":"​","nequiv":"≢","nesear":"⤨","nesim":"≂̸","NestedGreaterGreater":"≫","NestedLessLess":"≪","NewLine":"\n","nexist":"∄","nexists":"∄","Nfr":"𝔑","nfr":"𝔫","ngE":"≧̸","nge":"≱","ngeq":"≱","ngeqq":"≧̸","ngeqslant":"⩾̸","nges":"⩾̸","nGg":"⋙̸","ngsim":"≵","nGt":"≫⃒","ngt":"≯","ngtr":"≯","nGtv":"≫̸","nharr":"↮","nhArr":"⇎","nhpar":"⫲","ni":"∋","nis":"⋼","nisd":"⋺","niv":"∋","NJcy":"Њ","njcy":"њ","nlarr":"↚","nlArr":"⇍","nldr":"‥","nlE":"≦̸","nle":"≰","nleftarrow":"↚","nLeftarrow":"⇍","nleftrightarrow":"↮","nLeftrightarrow":"⇎","nleq":"≰","nleqq":"≦̸","nleqslant":"⩽̸","nles":"⩽̸","nless":"≮","nLl":"⋘̸","nlsim":"≴","nLt":"≪⃒","nlt":"≮","nltri":"⋪","nltrie":"⋬","nLtv":"≪̸","nmid":"∤","NoBreak":"⁠","NonBreakingSpace":" ","nopf":"𝕟","Nopf":"ℕ","Not":"⫬","not":"¬","NotCongruent":"≢","NotCupCap":"≭","NotDoubleVerticalBar":"∦","NotElement":"∉","NotEqual":"≠","NotEqualTilde":"≂̸","NotExists":"∄","NotGreater":"≯","NotGreaterEqual":"≱","NotGreaterFullEqual":"≧̸","NotGreaterGreater":"≫̸","NotGreaterLess":"≹","NotGreaterSlantEqual":"⩾̸","NotGreaterTilde":"≵","NotHumpDownHump":"≎̸","NotHumpEqual":"≏̸","notin":"∉","notindot":"⋵̸","notinE":"⋹̸","notinva":"∉","notinvb":"⋷","notinvc":"⋶","NotLeftTriangleBar":"⧏̸","NotLeftTriangle":"⋪","NotLeftTriangleEqual":"⋬","NotLess":"≮","NotLessEqual":"≰","NotLessGreater":"≸","NotLessLess":"≪̸","NotLessSlantEqual":"⩽̸","NotLessTilde":"≴","NotNestedGreaterGreater":"⪢̸","NotNestedLessLess":"⪡̸","notni":"∌","notniva":"∌","notnivb":"⋾","notnivc":"⋽","NotPrecedes":"⊀","NotPrecedesEqual":"⪯̸","NotPrecedesSlantEqual":"⋠","NotReverseElement":"∌","NotRightTriangleBar":"⧐̸","NotRightTriangle":"⋫","NotRightTriangleEqual":"⋭","NotSquareSubset":"⊏̸","NotSquareSubsetEqual":"⋢","NotSquareSuperset":"⊐̸","NotSquareSupersetEqual":"⋣","NotSubset":"⊂⃒","NotSubsetEqual":"⊈","NotSucceeds":"⊁","NotSucceedsEqual":"⪰̸","NotSucceedsSlantEqual":"⋡","NotSucceedsTilde":"≿̸","NotSuperset":"⊃⃒","NotSupersetEqual":"⊉","NotTilde":"≁","NotTildeEqual":"≄","NotTildeFullEqual":"≇","NotTildeTilde":"≉","NotVerticalBar":"∤","nparallel":"∦","npar":"∦","nparsl":"⫽⃥","npart":"∂̸","npolint":"⨔","npr":"⊀","nprcue":"⋠","nprec":"⊀","npreceq":"⪯̸","npre":"⪯̸","nrarrc":"⤳̸","nrarr":"↛","nrArr":"⇏","nrarrw":"↝̸","nrightarrow":"↛","nRightarrow":"⇏","nrtri":"⋫","nrtrie":"⋭","nsc":"⊁","nsccue":"⋡","nsce":"⪰̸","Nscr":"𝒩","nscr":"𝓃","nshortmid":"∤","nshortparallel":"∦","nsim":"≁","nsime":"≄","nsimeq":"≄","nsmid":"∤","nspar":"∦","nsqsube":"⋢","nsqsupe":"⋣","nsub":"⊄","nsubE":"⫅̸","nsube":"⊈","nsubset":"⊂⃒","nsubseteq":"⊈","nsubseteqq":"⫅̸","nsucc":"⊁","nsucceq":"⪰̸","nsup":"⊅","nsupE":"⫆̸","nsupe":"⊉","nsupset":"⊃⃒","nsupseteq":"⊉","nsupseteqq":"⫆̸","ntgl":"≹","Ntilde":"Ñ","ntilde":"ñ","ntlg":"≸","ntriangleleft":"⋪","ntrianglelefteq":"⋬","ntriangleright":"⋫","ntrianglerighteq":"⋭","Nu":"Ν","nu":"ν","num":"#","numero":"№","numsp":" ","nvap":"≍⃒","nvdash":"⊬","nvDash":"⊭","nVdash":"⊮","nVDash":"⊯","nvge":"≥⃒","nvgt":">⃒","nvHarr":"⤄","nvinfin":"⧞","nvlArr":"⤂","nvle":"≤⃒","nvlt":"<⃒","nvltrie":"⊴⃒","nvrArr":"⤃","nvrtrie":"⊵⃒","nvsim":"∼⃒","nwarhk":"⤣","nwarr":"↖","nwArr":"⇖","nwarrow":"↖","nwnear":"⤧","Oacute":"Ó","oacute":"ó","oast":"⊛","Ocirc":"Ô","ocirc":"ô","ocir":"⊚","Ocy":"О","ocy":"о","odash":"⊝","Odblac":"Ő","odblac":"ő","odiv":"⨸","odot":"⊙","odsold":"⦼","OElig":"Œ","oelig":"œ","ofcir":"⦿","Ofr":"𝔒","ofr":"𝔬","ogon":"˛","Ograve":"Ò","ograve":"ò","ogt":"⧁","ohbar":"⦵","ohm":"Ω","oint":"∮","olarr":"↺","olcir":"⦾","olcross":"⦻","oline":"‾","olt":"⧀","Omacr":"Ō","omacr":"ō","Omega":"Ω","omega":"ω","Omicron":"Ο","omicron":"ο","omid":"⦶","ominus":"⊖","Oopf":"𝕆","oopf":"𝕠","opar":"⦷","OpenCurlyDoubleQuote":"“","OpenCurlyQuote":"‘","operp":"⦹","oplus":"⊕","orarr":"↻","Or":"⩔","or":"∨","ord":"⩝","order":"ℴ","orderof":"ℴ","ordf":"ª","ordm":"º","origof":"⊶","oror":"⩖","orslope":"⩗","orv":"⩛","oS":"Ⓢ","Oscr":"𝒪","oscr":"ℴ","Oslash":"Ø","oslash":"ø","osol":"⊘","Otilde":"Õ","otilde":"õ","otimesas":"⨶","Otimes":"⨷","otimes":"⊗","Ouml":"Ö","ouml":"ö","ovbar":"⌽","OverBar":"‾","OverBrace":"⏞","OverBracket":"⎴","OverParenthesis":"⏜","para":"¶","parallel":"∥","par":"∥","parsim":"⫳","parsl":"⫽","part":"∂","PartialD":"∂","Pcy":"П","pcy":"п","percnt":"%","period":".","permil":"‰","perp":"⊥","pertenk":"‱","Pfr":"𝔓","pfr":"𝔭","Phi":"Φ","phi":"φ","phiv":"ϕ","phmmat":"ℳ","phone":"☎","Pi":"Π","pi":"π","pitchfork":"⋔","piv":"ϖ","planck":"ℏ","planckh":"ℎ","plankv":"ℏ","plusacir":"⨣","plusb":"⊞","pluscir":"⨢","plus":"+","plusdo":"∔","plusdu":"⨥","pluse":"⩲","PlusMinus":"±","plusmn":"±","plussim":"⨦","plustwo":"⨧","pm":"±","Poincareplane":"ℌ","pointint":"⨕","popf":"𝕡","Popf":"ℙ","pound":"£","prap":"⪷","Pr":"⪻","pr":"≺","prcue":"≼","precapprox":"⪷","prec":"≺","preccurlyeq":"≼","Precedes":"≺","PrecedesEqual":"⪯","PrecedesSlantEqual":"≼","PrecedesTilde":"≾","preceq":"⪯","precnapprox":"⪹","precneqq":"⪵","precnsim":"⋨","pre":"⪯","prE":"⪳","precsim":"≾","prime":"′","Prime":"″","primes":"ℙ","prnap":"⪹","prnE":"⪵","prnsim":"⋨","prod":"∏","Product":"∏","profalar":"⌮","profline":"⌒","profsurf":"⌓","prop":"∝","Proportional":"∝","Proportion":"∷","propto":"∝","prsim":"≾","prurel":"⊰","Pscr":"𝒫","pscr":"𝓅","Psi":"Ψ","psi":"ψ","puncsp":" ","Qfr":"𝔔","qfr":"𝔮","qint":"⨌","qopf":"𝕢","Qopf":"ℚ","qprime":"⁗","Qscr":"𝒬","qscr":"𝓆","quaternions":"ℍ","quatint":"⨖","quest":"?","questeq":"≟","quot":"\"","QUOT":"\"","rAarr":"⇛","race":"∽̱","Racute":"Ŕ","racute":"ŕ","radic":"√","raemptyv":"⦳","rang":"⟩","Rang":"⟫","rangd":"⦒","range":"⦥","rangle":"⟩","raquo":"»","rarrap":"⥵","rarrb":"⇥","rarrbfs":"⤠","rarrc":"⤳","rarr":"→","Rarr":"↠","rArr":"⇒","rarrfs":"⤞","rarrhk":"↪","rarrlp":"↬","rarrpl":"⥅","rarrsim":"⥴","Rarrtl":"⤖","rarrtl":"↣","rarrw":"↝","ratail":"⤚","rAtail":"⤜","ratio":"∶","rationals":"ℚ","rbarr":"⤍","rBarr":"⤏","RBarr":"⤐","rbbrk":"❳","rbrace":"}","rbrack":"]","rbrke":"⦌","rbrksld":"⦎","rbrkslu":"⦐","Rcaron":"Ř","rcaron":"ř","Rcedil":"Ŗ","rcedil":"ŗ","rceil":"⌉","rcub":"}","Rcy":"Р","rcy":"р","rdca":"⤷","rdldhar":"⥩","rdquo":"”","rdquor":"”","rdsh":"↳","real":"ℜ","realine":"ℛ","realpart":"ℜ","reals":"ℝ","Re":"ℜ","rect":"▭","reg":"®","REG":"®","ReverseElement":"∋","ReverseEquilibrium":"⇋","ReverseUpEquilibrium":"⥯","rfisht":"⥽","rfloor":"⌋","rfr":"𝔯","Rfr":"ℜ","rHar":"⥤","rhard":"⇁","rharu":"⇀","rharul":"⥬","Rho":"Ρ","rho":"ρ","rhov":"ϱ","RightAngleBracket":"⟩","RightArrowBar":"⇥","rightarrow":"→","RightArrow":"→","Rightarrow":"⇒","RightArrowLeftArrow":"⇄","rightarrowtail":"↣","RightCeiling":"⌉","RightDoubleBracket":"⟧","RightDownTeeVector":"⥝","RightDownVectorBar":"⥕","RightDownVector":"⇂","RightFloor":"⌋","rightharpoondown":"⇁","rightharpoonup":"⇀","rightleftarrows":"⇄","rightleftharpoons":"⇌","rightrightarrows":"⇉","rightsquigarrow":"↝","RightTeeArrow":"↦","RightTee":"⊢","RightTeeVector":"⥛","rightthreetimes":"⋌","RightTriangleBar":"⧐","RightTriangle":"⊳","RightTriangleEqual":"⊵","RightUpDownVector":"⥏","RightUpTeeVector":"⥜","RightUpVectorBar":"⥔","RightUpVector":"↾","RightVectorBar":"⥓","RightVector":"⇀","ring":"˚","risingdotseq":"≓","rlarr":"⇄","rlhar":"⇌","rlm":"‏","rmoustache":"⎱","rmoust":"⎱","rnmid":"⫮","roang":"⟭","roarr":"⇾","robrk":"⟧","ropar":"⦆","ropf":"𝕣","Ropf":"ℝ","roplus":"⨮","rotimes":"⨵","RoundImplies":"⥰","rpar":")","rpargt":"⦔","rppolint":"⨒","rrarr":"⇉","Rrightarrow":"⇛","rsaquo":"›","rscr":"𝓇","Rscr":"ℛ","rsh":"↱","Rsh":"↱","rsqb":"]","rsquo":"’","rsquor":"’","rthree":"⋌","rtimes":"⋊","rtri":"▹","rtrie":"⊵","rtrif":"▸","rtriltri":"⧎","RuleDelayed":"⧴","ruluhar":"⥨","rx":"℞","Sacute":"Ś","sacute":"ś","sbquo":"‚","scap":"⪸","Scaron":"Š","scaron":"š","Sc":"⪼","sc":"≻","sccue":"≽","sce":"⪰","scE":"⪴","Scedil":"Ş","scedil":"ş","Scirc":"Ŝ","scirc":"ŝ","scnap":"⪺","scnE":"⪶","scnsim":"⋩","scpolint":"⨓","scsim":"≿","Scy":"С","scy":"с","sdotb":"⊡","sdot":"⋅","sdote":"⩦","searhk":"⤥","searr":"↘","seArr":"⇘","searrow":"↘","sect":"§","semi":";","seswar":"⤩","setminus":"∖","setmn":"∖","sext":"✶","Sfr":"𝔖","sfr":"𝔰","sfrown":"⌢","sharp":"♯","SHCHcy":"Щ","shchcy":"щ","SHcy":"Ш","shcy":"ш","ShortDownArrow":"↓","ShortLeftArrow":"←","shortmid":"∣","shortparallel":"∥","ShortRightArrow":"→","ShortUpArrow":"↑","shy":"­","Sigma":"Σ","sigma":"σ","sigmaf":"ς","sigmav":"ς","sim":"∼","simdot":"⩪","sime":"≃","simeq":"≃","simg":"⪞","simgE":"⪠","siml":"⪝","simlE":"⪟","simne":"≆","simplus":"⨤","simrarr":"⥲","slarr":"←","SmallCircle":"∘","smallsetminus":"∖","smashp":"⨳","smeparsl":"⧤","smid":"∣","smile":"⌣","smt":"⪪","smte":"⪬","smtes":"⪬︀","SOFTcy":"Ь","softcy":"ь","solbar":"⌿","solb":"⧄","sol":"/","Sopf":"𝕊","sopf":"𝕤","spades":"♠","spadesuit":"♠","spar":"∥","sqcap":"⊓","sqcaps":"⊓︀","sqcup":"⊔","sqcups":"⊔︀","Sqrt":"√","sqsub":"⊏","sqsube":"⊑","sqsubset":"⊏","sqsubseteq":"⊑","sqsup":"⊐","sqsupe":"⊒","sqsupset":"⊐","sqsupseteq":"⊒","square":"□","Square":"□","SquareIntersection":"⊓","SquareSubset":"⊏","SquareSubsetEqual":"⊑","SquareSuperset":"⊐","SquareSupersetEqual":"⊒","SquareUnion":"⊔","squarf":"▪","squ":"□","squf":"▪","srarr":"→","Sscr":"𝒮","sscr":"𝓈","ssetmn":"∖","ssmile":"⌣","sstarf":"⋆","Star":"⋆","star":"☆","starf":"★","straightepsilon":"ϵ","straightphi":"ϕ","strns":"¯","sub":"⊂","Sub":"⋐","subdot":"⪽","subE":"⫅","sube":"⊆","subedot":"⫃","submult":"⫁","subnE":"⫋","subne":"⊊","subplus":"⪿","subrarr":"⥹","subset":"⊂","Subset":"⋐","subseteq":"⊆","subseteqq":"⫅","SubsetEqual":"⊆","subsetneq":"⊊","subsetneqq":"⫋","subsim":"⫇","subsub":"⫕","subsup":"⫓","succapprox":"⪸","succ":"≻","succcurlyeq":"≽","Succeeds":"≻","SucceedsEqual":"⪰","SucceedsSlantEqual":"≽","SucceedsTilde":"≿","succeq":"⪰","succnapprox":"⪺","succneqq":"⪶","succnsim":"⋩","succsim":"≿","SuchThat":"∋","sum":"∑","Sum":"∑","sung":"♪","sup1":"¹","sup2":"²","sup3":"³","sup":"⊃","Sup":"⋑","supdot":"⪾","supdsub":"⫘","supE":"⫆","supe":"⊇","supedot":"⫄","Superset":"⊃","SupersetEqual":"⊇","suphsol":"⟉","suphsub":"⫗","suplarr":"⥻","supmult":"⫂","supnE":"⫌","supne":"⊋","supplus":"⫀","supset":"⊃","Supset":"⋑","supseteq":"⊇","supseteqq":"⫆","supsetneq":"⊋","supsetneqq":"⫌","supsim":"⫈","supsub":"⫔","supsup":"⫖","swarhk":"⤦","swarr":"↙","swArr":"⇙","swarrow":"↙","swnwar":"⤪","szlig":"ß","Tab":"\t","target":"⌖","Tau":"Τ","tau":"τ","tbrk":"⎴","Tcaron":"Ť","tcaron":"ť","Tcedil":"Ţ","tcedil":"ţ","Tcy":"Т","tcy":"т","tdot":"⃛","telrec":"⌕","Tfr":"𝔗","tfr":"𝔱","there4":"∴","therefore":"∴","Therefore":"∴","Theta":"Θ","theta":"θ","thetasym":"ϑ","thetav":"ϑ","thickapprox":"≈","thicksim":"∼","ThickSpace":"  ","ThinSpace":" ","thinsp":" ","thkap":"≈","thksim":"∼","THORN":"Þ","thorn":"þ","tilde":"˜","Tilde":"∼","TildeEqual":"≃","TildeFullEqual":"≅","TildeTilde":"≈","timesbar":"⨱","timesb":"⊠","times":"×","timesd":"⨰","tint":"∭","toea":"⤨","topbot":"⌶","topcir":"⫱","top":"⊤","Topf":"𝕋","topf":"𝕥","topfork":"⫚","tosa":"⤩","tprime":"‴","trade":"™","TRADE":"™","triangle":"▵","triangledown":"▿","triangleleft":"◃","trianglelefteq":"⊴","triangleq":"≜","triangleright":"▹","trianglerighteq":"⊵","tridot":"◬","trie":"≜","triminus":"⨺","TripleDot":"⃛","triplus":"⨹","trisb":"⧍","tritime":"⨻","trpezium":"⏢","Tscr":"𝒯","tscr":"𝓉","TScy":"Ц","tscy":"ц","TSHcy":"Ћ","tshcy":"ћ","Tstrok":"Ŧ","tstrok":"ŧ","twixt":"≬","twoheadleftarrow":"↞","twoheadrightarrow":"↠","Uacute":"Ú","uacute":"ú","uarr":"↑","Uarr":"↟","uArr":"⇑","Uarrocir":"⥉","Ubrcy":"Ў","ubrcy":"ў","Ubreve":"Ŭ","ubreve":"ŭ","Ucirc":"Û","ucirc":"û","Ucy":"У","ucy":"у","udarr":"⇅","Udblac":"Ű","udblac":"ű","udhar":"⥮","ufisht":"⥾","Ufr":"𝔘","ufr":"𝔲","Ugrave":"Ù","ugrave":"ù","uHar":"⥣","uharl":"↿","uharr":"↾","uhblk":"▀","ulcorn":"⌜","ulcorner":"⌜","ulcrop":"⌏","ultri":"◸","Umacr":"Ū","umacr":"ū","uml":"¨","UnderBar":"_","UnderBrace":"⏟","UnderBracket":"⎵","UnderParenthesis":"⏝","Union":"⋃","UnionPlus":"⊎","Uogon":"Ų","uogon":"ų","Uopf":"𝕌","uopf":"𝕦","UpArrowBar":"⤒","uparrow":"↑","UpArrow":"↑","Uparrow":"⇑","UpArrowDownArrow":"⇅","updownarrow":"↕","UpDownArrow":"↕","Updownarrow":"⇕","UpEquilibrium":"⥮","upharpoonleft":"↿","upharpoonright":"↾","uplus":"⊎","UpperLeftArrow":"↖","UpperRightArrow":"↗","upsi":"υ","Upsi":"ϒ","upsih":"ϒ","Upsilon":"Υ","upsilon":"υ","UpTeeArrow":"↥","UpTee":"⊥","upuparrows":"⇈","urcorn":"⌝","urcorner":"⌝","urcrop":"⌎","Uring":"Ů","uring":"ů","urtri":"◹","Uscr":"𝒰","uscr":"𝓊","utdot":"⋰","Utilde":"Ũ","utilde":"ũ","utri":"▵","utrif":"▴","uuarr":"⇈","Uuml":"Ü","uuml":"ü","uwangle":"⦧","vangrt":"⦜","varepsilon":"ϵ","varkappa":"ϰ","varnothing":"∅","varphi":"ϕ","varpi":"ϖ","varpropto":"∝","varr":"↕","vArr":"⇕","varrho":"ϱ","varsigma":"ς","varsubsetneq":"⊊︀","varsubsetneqq":"⫋︀","varsupsetneq":"⊋︀","varsupsetneqq":"⫌︀","vartheta":"ϑ","vartriangleleft":"⊲","vartriangleright":"⊳","vBar":"⫨","Vbar":"⫫","vBarv":"⫩","Vcy":"В","vcy":"в","vdash":"⊢","vDash":"⊨","Vdash":"⊩","VDash":"⊫","Vdashl":"⫦","veebar":"⊻","vee":"∨","Vee":"⋁","veeeq":"≚","vellip":"⋮","verbar":"|","Verbar":"‖","vert":"|","Vert":"‖","VerticalBar":"∣","VerticalLine":"|","VerticalSeparator":"❘","VerticalTilde":"≀","VeryThinSpace":" ","Vfr":"𝔙","vfr":"𝔳","vltri":"⊲","vnsub":"⊂⃒","vnsup":"⊃⃒","Vopf":"𝕍","vopf":"𝕧","vprop":"∝","vrtri":"⊳","Vscr":"𝒱","vscr":"𝓋","vsubnE":"⫋︀","vsubne":"⊊︀","vsupnE":"⫌︀","vsupne":"⊋︀","Vvdash":"⊪","vzigzag":"⦚","Wcirc":"Ŵ","wcirc":"ŵ","wedbar":"⩟","wedge":"∧","Wedge":"⋀","wedgeq":"≙","weierp":"℘","Wfr":"𝔚","wfr":"𝔴","Wopf":"𝕎","wopf":"𝕨","wp":"℘","wr":"≀","wreath":"≀","Wscr":"𝒲","wscr":"𝓌","xcap":"⋂","xcirc":"◯","xcup":"⋃","xdtri":"▽","Xfr":"𝔛","xfr":"𝔵","xharr":"⟷","xhArr":"⟺","Xi":"Ξ","xi":"ξ","xlarr":"⟵","xlArr":"⟸","xmap":"⟼","xnis":"⋻","xodot":"⨀","Xopf":"𝕏","xopf":"𝕩","xoplus":"⨁","xotime":"⨂","xrarr":"⟶","xrArr":"⟹","Xscr":"𝒳","xscr":"𝓍","xsqcup":"⨆","xuplus":"⨄","xutri":"△","xvee":"⋁","xwedge":"⋀","Yacute":"Ý","yacute":"ý","YAcy":"Я","yacy":"я","Ycirc":"Ŷ","ycirc":"ŷ","Ycy":"Ы","ycy":"ы","yen":"¥","Yfr":"𝔜","yfr":"𝔶","YIcy":"Ї","yicy":"ї","Yopf":"𝕐","yopf":"𝕪","Yscr":"𝒴","yscr":"𝓎","YUcy":"Ю","yucy":"ю","yuml":"ÿ","Yuml":"Ÿ","Zacute":"Ź","zacute":"ź","Zcaron":"Ž","zcaron":"ž","Zcy":"З","zcy":"з","Zdot":"Ż","zdot":"ż","zeetrf":"ℨ","ZeroWidthSpace":"​","Zeta":"Ζ","zeta":"ζ","zfr":"𝔷","Zfr":"ℨ","ZHcy":"Ж","zhcy":"ж","zigrarr":"⇝","zopf":"𝕫","Zopf":"ℤ","Zscr":"𝒵","zscr":"𝓏","zwj":"‍","zwnj":"‌"};

/***/ }),

/***/ "../../../node_modules/glamor/lib/index.js":
/*!***********************************************************************************************************!*\
  !*** delegated ../../../node_modules/glamor/lib/index.js from dll-reference vendors_f58bfc701f0aa278ec3b ***!
  \***********************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

module.exports = (__webpack_require__(/*! dll-reference vendors_f58bfc701f0aa278ec3b */ "dll-reference vendors_f58bfc701f0aa278ec3b"))("../../../node_modules/glamor/lib/index.js");

/***/ }),

/***/ "../../../node_modules/linkify-it/index.js":
/*!**********************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/linkify-it/index.js ***!
  \**********************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";



////////////////////////////////////////////////////////////////////////////////
// Helpers

// Merge objects
//
function assign(obj /*from1, from2, from3, ...*/) {
  var sources = Array.prototype.slice.call(arguments, 1);

  sources.forEach(function (source) {
    if (!source) { return; }

    Object.keys(source).forEach(function (key) {
      obj[key] = source[key];
    });
  });

  return obj;
}

function _class(obj) { return Object.prototype.toString.call(obj); }
function isString(obj) { return _class(obj) === '[object String]'; }
function isObject(obj) { return _class(obj) === '[object Object]'; }
function isRegExp(obj) { return _class(obj) === '[object RegExp]'; }
function isFunction(obj) { return _class(obj) === '[object Function]'; }


function escapeRE(str) { return str.replace(/[.?*+^$[\]\\(){}|-]/g, '\\$&'); }

////////////////////////////////////////////////////////////////////////////////


var defaultOptions = {
  fuzzyLink: true,
  fuzzyEmail: true,
  fuzzyIP: false
};


function isOptionsObj(obj) {
  return Object.keys(obj || {}).reduce(function (acc, k) {
    return acc || defaultOptions.hasOwnProperty(k);
  }, false);
}


var defaultSchemas = {
  'http:': {
    validate: function (text, pos, self) {
      var tail = text.slice(pos);

      if (!self.re.http) {
        // compile lazily, because "host"-containing variables can change on tlds update.
        self.re.http =  new RegExp(
          '^\\/\\/' + self.re.src_auth + self.re.src_host_port_strict + self.re.src_path, 'i'
        );
      }
      if (self.re.http.test(tail)) {
        return tail.match(self.re.http)[0].length;
      }
      return 0;
    }
  },
  'https:':  'http:',
  'ftp:':    'http:',
  '//':      {
    validate: function (text, pos, self) {
      var tail = text.slice(pos);

      if (!self.re.no_http) {
      // compile lazily, because "host"-containing variables can change on tlds update.
        self.re.no_http =  new RegExp(
          '^' +
          self.re.src_auth +
          // Don't allow single-level domains, because of false positives like '//test'
          // with code comments
          '(?:localhost|(?:(?:' + self.re.src_domain + ')\\.)+' + self.re.src_domain_root + ')' +
          self.re.src_port +
          self.re.src_host_terminator +
          self.re.src_path,

          'i'
        );
      }

      if (self.re.no_http.test(tail)) {
        // should not be `://` & `///`, that protects from errors in protocol name
        if (pos >= 3 && text[pos - 3] === ':') { return 0; }
        if (pos >= 3 && text[pos - 3] === '/') { return 0; }
        return tail.match(self.re.no_http)[0].length;
      }
      return 0;
    }
  },
  'mailto:': {
    validate: function (text, pos, self) {
      var tail = text.slice(pos);

      if (!self.re.mailto) {
        self.re.mailto =  new RegExp(
          '^' + self.re.src_email_name + '@' + self.re.src_host_strict, 'i'
        );
      }
      if (self.re.mailto.test(tail)) {
        return tail.match(self.re.mailto)[0].length;
      }
      return 0;
    }
  }
};

/*eslint-disable max-len*/

// RE pattern for 2-character tlds (autogenerated by ./support/tlds_2char_gen.js)
var tlds_2ch_src_re = 'a[cdefgilmnoqrstuwxz]|b[abdefghijmnorstvwyz]|c[acdfghiklmnoruvwxyz]|d[ejkmoz]|e[cegrstu]|f[ijkmor]|g[abdefghilmnpqrstuwy]|h[kmnrtu]|i[delmnoqrst]|j[emop]|k[eghimnprwyz]|l[abcikrstuvy]|m[acdeghklmnopqrstuvwxyz]|n[acefgilopruz]|om|p[aefghklmnrstwy]|qa|r[eosuw]|s[abcdeghijklmnortuvxyz]|t[cdfghjklmnortvwz]|u[agksyz]|v[aceginu]|w[fs]|y[et]|z[amw]';

// DON'T try to make PRs with changes. Extend TLDs with LinkifyIt.tlds() instead
var tlds_default = 'biz|com|edu|gov|net|org|pro|web|xxx|aero|asia|coop|info|museum|name|shop|рф'.split('|');

/*eslint-enable max-len*/

////////////////////////////////////////////////////////////////////////////////

function resetScanCache(self) {
  self.__index__ = -1;
  self.__text_cache__   = '';
}

function createValidator(re) {
  return function (text, pos) {
    var tail = text.slice(pos);

    if (re.test(tail)) {
      return tail.match(re)[0].length;
    }
    return 0;
  };
}

function createNormalizer() {
  return function (match, self) {
    self.normalize(match);
  };
}

// Schemas compiler. Build regexps.
//
function compile(self) {

  // Load & clone RE patterns.
  var re = self.re = __webpack_require__(/*! ./lib/re */ "../../../node_modules/linkify-it/lib/re.js")(self.__opts__);

  // Define dynamic patterns
  var tlds = self.__tlds__.slice();

  self.onCompile();

  if (!self.__tlds_replaced__) {
    tlds.push(tlds_2ch_src_re);
  }
  tlds.push(re.src_xn);

  re.src_tlds = tlds.join('|');

  function untpl(tpl) { return tpl.replace('%TLDS%', re.src_tlds); }

  re.email_fuzzy      = RegExp(untpl(re.tpl_email_fuzzy), 'i');
  re.link_fuzzy       = RegExp(untpl(re.tpl_link_fuzzy), 'i');
  re.link_no_ip_fuzzy = RegExp(untpl(re.tpl_link_no_ip_fuzzy), 'i');
  re.host_fuzzy_test  = RegExp(untpl(re.tpl_host_fuzzy_test), 'i');

  //
  // Compile each schema
  //

  var aliases = [];

  self.__compiled__ = {}; // Reset compiled data

  function schemaError(name, val) {
    throw new Error('(LinkifyIt) Invalid schema "' + name + '": ' + val);
  }

  Object.keys(self.__schemas__).forEach(function (name) {
    var val = self.__schemas__[name];

    // skip disabled methods
    if (val === null) { return; }

    var compiled = { validate: null, link: null };

    self.__compiled__[name] = compiled;

    if (isObject(val)) {
      if (isRegExp(val.validate)) {
        compiled.validate = createValidator(val.validate);
      } else if (isFunction(val.validate)) {
        compiled.validate = val.validate;
      } else {
        schemaError(name, val);
      }

      if (isFunction(val.normalize)) {
        compiled.normalize = val.normalize;
      } else if (!val.normalize) {
        compiled.normalize = createNormalizer();
      } else {
        schemaError(name, val);
      }

      return;
    }

    if (isString(val)) {
      aliases.push(name);
      return;
    }

    schemaError(name, val);
  });

  //
  // Compile postponed aliases
  //

  aliases.forEach(function (alias) {
    if (!self.__compiled__[self.__schemas__[alias]]) {
      // Silently fail on missed schemas to avoid errons on disable.
      // schemaError(alias, self.__schemas__[alias]);
      return;
    }

    self.__compiled__[alias].validate =
      self.__compiled__[self.__schemas__[alias]].validate;
    self.__compiled__[alias].normalize =
      self.__compiled__[self.__schemas__[alias]].normalize;
  });

  //
  // Fake record for guessed links
  //
  self.__compiled__[''] = { validate: null, normalize: createNormalizer() };

  //
  // Build schema condition
  //
  var slist = Object.keys(self.__compiled__)
                      .filter(function (name) {
                        // Filter disabled & fake schemas
                        return name.length > 0 && self.__compiled__[name];
                      })
                      .map(escapeRE)
                      .join('|');
  // (?!_) cause 1.5x slowdown
  self.re.schema_test   = RegExp('(^|(?!_)(?:[><\uff5c]|' + re.src_ZPCc + '))(' + slist + ')', 'i');
  self.re.schema_search = RegExp('(^|(?!_)(?:[><\uff5c]|' + re.src_ZPCc + '))(' + slist + ')', 'ig');

  self.re.pretest       = RegExp(
                            '(' + self.re.schema_test.source + ')|' +
                            '(' + self.re.host_fuzzy_test.source + ')|' +
                            '@',
                            'i');

  //
  // Cleanup
  //

  resetScanCache(self);
}

/**
 * class Match
 *
 * Match result. Single element of array, returned by [[LinkifyIt#match]]
 **/
function Match(self, shift) {
  var start = self.__index__,
      end   = self.__last_index__,
      text  = self.__text_cache__.slice(start, end);

  /**
   * Match#schema -> String
   *
   * Prefix (protocol) for matched string.
   **/
  this.schema    = self.__schema__.toLowerCase();
  /**
   * Match#index -> Number
   *
   * First position of matched string.
   **/
  this.index     = start + shift;
  /**
   * Match#lastIndex -> Number
   *
   * Next position after matched string.
   **/
  this.lastIndex = end + shift;
  /**
   * Match#raw -> String
   *
   * Matched string.
   **/
  this.raw       = text;
  /**
   * Match#text -> String
   *
   * Notmalized text of matched string.
   **/
  this.text      = text;
  /**
   * Match#url -> String
   *
   * Normalized url of matched string.
   **/
  this.url       = text;
}

function createMatch(self, shift) {
  var match = new Match(self, shift);

  self.__compiled__[match.schema].normalize(match, self);

  return match;
}


/**
 * class LinkifyIt
 **/

/**
 * new LinkifyIt(schemas, options)
 * - schemas (Object): Optional. Additional schemas to validate (prefix/validator)
 * - options (Object): { fuzzyLink|fuzzyEmail|fuzzyIP: true|false }
 *
 * Creates new linkifier instance with optional additional schemas.
 * Can be called without `new` keyword for convenience.
 *
 * By default understands:
 *
 * - `http(s)://...` , `ftp://...`, `mailto:...` & `//...` links
 * - "fuzzy" links and emails (example.com, foo@bar.com).
 *
 * `schemas` is an object, where each key/value describes protocol/rule:
 *
 * - __key__ - link prefix (usually, protocol name with `:` at the end, `skype:`
 *   for example). `linkify-it` makes shure that prefix is not preceeded with
 *   alphanumeric char and symbols. Only whitespaces and punctuation allowed.
 * - __value__ - rule to check tail after link prefix
 *   - _String_ - just alias to existing rule
 *   - _Object_
 *     - _validate_ - validator function (should return matched length on success),
 *       or `RegExp`.
 *     - _normalize_ - optional function to normalize text & url of matched result
 *       (for example, for @twitter mentions).
 *
 * `options`:
 *
 * - __fuzzyLink__ - recognige URL-s without `http(s):` prefix. Default `true`.
 * - __fuzzyIP__ - allow IPs in fuzzy links above. Can conflict with some texts
 *   like version numbers. Default `false`.
 * - __fuzzyEmail__ - recognize emails without `mailto:` prefix.
 *
 **/
function LinkifyIt(schemas, options) {
  if (!(this instanceof LinkifyIt)) {
    return new LinkifyIt(schemas, options);
  }

  if (!options) {
    if (isOptionsObj(schemas)) {
      options = schemas;
      schemas = {};
    }
  }

  this.__opts__           = assign({}, defaultOptions, options);

  // Cache last tested result. Used to skip repeating steps on next `match` call.
  this.__index__          = -1;
  this.__last_index__     = -1; // Next scan position
  this.__schema__         = '';
  this.__text_cache__     = '';

  this.__schemas__        = assign({}, defaultSchemas, schemas);
  this.__compiled__       = {};

  this.__tlds__           = tlds_default;
  this.__tlds_replaced__  = false;

  this.re = {};

  compile(this);
}


/** chainable
 * LinkifyIt#add(schema, definition)
 * - schema (String): rule name (fixed pattern prefix)
 * - definition (String|RegExp|Object): schema definition
 *
 * Add new rule definition. See constructor description for details.
 **/
LinkifyIt.prototype.add = function add(schema, definition) {
  this.__schemas__[schema] = definition;
  compile(this);
  return this;
};


/** chainable
 * LinkifyIt#set(options)
 * - options (Object): { fuzzyLink|fuzzyEmail|fuzzyIP: true|false }
 *
 * Set recognition options for links without schema.
 **/
LinkifyIt.prototype.set = function set(options) {
  this.__opts__ = assign(this.__opts__, options);
  return this;
};


/**
 * LinkifyIt#test(text) -> Boolean
 *
 * Searches linkifiable pattern and returns `true` on success or `false` on fail.
 **/
LinkifyIt.prototype.test = function test(text) {
  // Reset scan cache
  this.__text_cache__ = text;
  this.__index__      = -1;

  if (!text.length) { return false; }

  var m, ml, me, len, shift, next, re, tld_pos, at_pos;

  // try to scan for link with schema - that's the most simple rule
  if (this.re.schema_test.test(text)) {
    re = this.re.schema_search;
    re.lastIndex = 0;
    while ((m = re.exec(text)) !== null) {
      len = this.testSchemaAt(text, m[2], re.lastIndex);
      if (len) {
        this.__schema__     = m[2];
        this.__index__      = m.index + m[1].length;
        this.__last_index__ = m.index + m[0].length + len;
        break;
      }
    }
  }

  if (this.__opts__.fuzzyLink && this.__compiled__['http:']) {
    // guess schemaless links
    tld_pos = text.search(this.re.host_fuzzy_test);
    if (tld_pos >= 0) {
      // if tld is located after found link - no need to check fuzzy pattern
      if (this.__index__ < 0 || tld_pos < this.__index__) {
        if ((ml = text.match(this.__opts__.fuzzyIP ? this.re.link_fuzzy : this.re.link_no_ip_fuzzy)) !== null) {

          shift = ml.index + ml[1].length;

          if (this.__index__ < 0 || shift < this.__index__) {
            this.__schema__     = '';
            this.__index__      = shift;
            this.__last_index__ = ml.index + ml[0].length;
          }
        }
      }
    }
  }

  if (this.__opts__.fuzzyEmail && this.__compiled__['mailto:']) {
    // guess schemaless emails
    at_pos = text.indexOf('@');
    if (at_pos >= 0) {
      // We can't skip this check, because this cases are possible:
      // 192.168.1.1@gmail.com, my.in@example.com
      if ((me = text.match(this.re.email_fuzzy)) !== null) {

        shift = me.index + me[1].length;
        next  = me.index + me[0].length;

        if (this.__index__ < 0 || shift < this.__index__ ||
            (shift === this.__index__ && next > this.__last_index__)) {
          this.__schema__     = 'mailto:';
          this.__index__      = shift;
          this.__last_index__ = next;
        }
      }
    }
  }

  return this.__index__ >= 0;
};


/**
 * LinkifyIt#pretest(text) -> Boolean
 *
 * Very quick check, that can give false positives. Returns true if link MAY BE
 * can exists. Can be used for speed optimization, when you need to check that
 * link NOT exists.
 **/
LinkifyIt.prototype.pretest = function pretest(text) {
  return this.re.pretest.test(text);
};


/**
 * LinkifyIt#testSchemaAt(text, name, position) -> Number
 * - text (String): text to scan
 * - name (String): rule (schema) name
 * - position (Number): text offset to check from
 *
 * Similar to [[LinkifyIt#test]] but checks only specific protocol tail exactly
 * at given position. Returns length of found pattern (0 on fail).
 **/
LinkifyIt.prototype.testSchemaAt = function testSchemaAt(text, schema, pos) {
  // If not supported schema check requested - terminate
  if (!this.__compiled__[schema.toLowerCase()]) {
    return 0;
  }
  return this.__compiled__[schema.toLowerCase()].validate(text, pos, this);
};


/**
 * LinkifyIt#match(text) -> Array|null
 *
 * Returns array of found link descriptions or `null` on fail. We strongly
 * recommend to use [[LinkifyIt#test]] first, for best speed.
 *
 * ##### Result match description
 *
 * - __schema__ - link schema, can be empty for fuzzy links, or `//` for
 *   protocol-neutral  links.
 * - __index__ - offset of matched text
 * - __lastIndex__ - index of next char after mathch end
 * - __raw__ - matched text
 * - __text__ - normalized text
 * - __url__ - link, generated from matched text
 **/
LinkifyIt.prototype.match = function match(text) {
  var shift = 0, result = [];

  // Try to take previous element from cache, if .test() called before
  if (this.__index__ >= 0 && this.__text_cache__ === text) {
    result.push(createMatch(this, shift));
    shift = this.__last_index__;
  }

  // Cut head if cache was used
  var tail = shift ? text.slice(shift) : text;

  // Scan string until end reached
  while (this.test(tail)) {
    result.push(createMatch(this, shift));

    tail = tail.slice(this.__last_index__);
    shift += this.__last_index__;
  }

  if (result.length) {
    return result;
  }

  return null;
};


/** chainable
 * LinkifyIt#tlds(list [, keepOld]) -> this
 * - list (Array): list of tlds
 * - keepOld (Boolean): merge with current list if `true` (`false` by default)
 *
 * Load (or merge) new tlds list. Those are user for fuzzy links (without prefix)
 * to avoid false positives. By default this algorythm used:
 *
 * - hostname with any 2-letter root zones are ok.
 * - biz|com|edu|gov|net|org|pro|web|xxx|aero|asia|coop|info|museum|name|shop|рф
 *   are ok.
 * - encoded (`xn--...`) root zones are ok.
 *
 * If list is replaced, then exact match for 2-chars root zones will be checked.
 **/
LinkifyIt.prototype.tlds = function tlds(list, keepOld) {
  list = Array.isArray(list) ? list : [ list ];

  if (!keepOld) {
    this.__tlds__ = list.slice();
    this.__tlds_replaced__ = true;
    compile(this);
    return this;
  }

  this.__tlds__ = this.__tlds__.concat(list)
                                  .sort()
                                  .filter(function (el, idx, arr) {
                                    return el !== arr[idx - 1];
                                  })
                                  .reverse();

  compile(this);
  return this;
};

/**
 * LinkifyIt#normalize(match)
 *
 * Default normalizer (if schema does not define it's own).
 **/
LinkifyIt.prototype.normalize = function normalize(match) {

  // Do minimal possible changes by default. Need to collect feedback prior
  // to move forward https://github.com/markdown-it/linkify-it/issues/1

  if (!match.schema) { match.url = 'http://' + match.url; }

  if (match.schema === 'mailto:' && !/^mailto:/i.test(match.url)) {
    match.url = 'mailto:' + match.url;
  }
};


/**
 * LinkifyIt#onCompile()
 *
 * Override to modify basic RegExp-s.
 **/
LinkifyIt.prototype.onCompile = function onCompile() {
};


module.exports = LinkifyIt;


/***/ }),

/***/ "../../../node_modules/linkify-it/lib/re.js":
/*!***********************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/linkify-it/lib/re.js ***!
  \***********************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";



module.exports = function (opts) {
  var re = {};

  // Use direct extract instead of `regenerate` to reduse browserified size
  re.src_Any = __webpack_require__(/*! uc.micro/properties/Any/regex */ "../../../node_modules/uc.micro/properties/Any/regex.js").source;
  re.src_Cc  = __webpack_require__(/*! uc.micro/categories/Cc/regex */ "../../../node_modules/uc.micro/categories/Cc/regex.js").source;
  re.src_Z   = __webpack_require__(/*! uc.micro/categories/Z/regex */ "../../../node_modules/uc.micro/categories/Z/regex.js").source;
  re.src_P   = __webpack_require__(/*! uc.micro/categories/P/regex */ "../../../node_modules/uc.micro/categories/P/regex.js").source;

  // \p{\Z\P\Cc\CF} (white spaces + control + format + punctuation)
  re.src_ZPCc = [ re.src_Z, re.src_P, re.src_Cc ].join('|');

  // \p{\Z\Cc} (white spaces + control)
  re.src_ZCc = [ re.src_Z, re.src_Cc ].join('|');

  // Experimental. List of chars, completely prohibited in links
  // because can separate it from other part of text
  var text_separators = '[><\uff5c]';

  // All possible word characters (everything without punctuation, spaces & controls)
  // Defined via punctuation & spaces to save space
  // Should be something like \p{\L\N\S\M} (\w but without `_`)
  re.src_pseudo_letter       = '(?:(?!' + text_separators + '|' + re.src_ZPCc + ')' + re.src_Any + ')';
  // The same as abothe but without [0-9]
  // var src_pseudo_letter_non_d = '(?:(?![0-9]|' + src_ZPCc + ')' + src_Any + ')';

  ////////////////////////////////////////////////////////////////////////////////

  re.src_ip4 =

    '(?:(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)';

  // Prohibit any of "@/[]()" in user/pass to avoid wrong domain fetch.
  re.src_auth    = '(?:(?:(?!' + re.src_ZCc + '|[@/\\[\\]()]).)+@)?';

  re.src_port =

    '(?::(?:6(?:[0-4]\\d{3}|5(?:[0-4]\\d{2}|5(?:[0-2]\\d|3[0-5])))|[1-5]?\\d{1,4}))?';

  re.src_host_terminator =

    '(?=$|' + text_separators + '|' + re.src_ZPCc + ')(?!-|_|:\\d|\\.-|\\.(?!$|' + re.src_ZPCc + '))';

  re.src_path =

    '(?:' +
      '[/?#]' +
        '(?:' +
          '(?!' + re.src_ZCc + '|' + text_separators + '|[()[\\]{}.,"\'?!\\-]).|' +
          '\\[(?:(?!' + re.src_ZCc + '|\\]).)*\\]|' +
          '\\((?:(?!' + re.src_ZCc + '|[)]).)*\\)|' +
          '\\{(?:(?!' + re.src_ZCc + '|[}]).)*\\}|' +
          '\\"(?:(?!' + re.src_ZCc + '|["]).)+\\"|' +
          "\\'(?:(?!" + re.src_ZCc + "|[']).)+\\'|" +
          "\\'(?=" + re.src_pseudo_letter + '|[-]).|' +  // allow `I'm_king` if no pair found
          '\\.{2,3}[a-zA-Z0-9%/]|' + // github has ... in commit range links. Restrict to
                                     // - english
                                     // - percent-encoded
                                     // - parts of file path
                                     // until more examples found.
          '\\.(?!' + re.src_ZCc + '|[.]).|' +
          (opts && opts['---'] ?
            '\\-(?!--(?:[^-]|$))(?:-*)|' // `---` => long dash, terminate
          :
            '\\-+|'
          ) +
          '\\,(?!' + re.src_ZCc + ').|' +      // allow `,,,` in paths
          '\\!(?!' + re.src_ZCc + '|[!]).|' +
          '\\?(?!' + re.src_ZCc + '|[?]).' +
        ')+' +
      '|\\/' +
    ')?';

  re.src_email_name =

    '[\\-;:&=\\+\\$,\\"\\.a-zA-Z0-9_]+';

  re.src_xn =

    'xn--[a-z0-9\\-]{1,59}';

  // More to read about domain names
  // http://serverfault.com/questions/638260/

  re.src_domain_root =

    // Allow letters & digits (http://test1)
    '(?:' +
      re.src_xn +
      '|' +
      re.src_pseudo_letter + '{1,63}' +
    ')';

  re.src_domain =

    '(?:' +
      re.src_xn +
      '|' +
      '(?:' + re.src_pseudo_letter + ')' +
      '|' +
      // don't allow `--` in domain names, because:
      // - that can conflict with markdown &mdash; / &ndash;
      // - nobody use those anyway
      '(?:' + re.src_pseudo_letter + '(?:-(?!-)|' + re.src_pseudo_letter + '){0,61}' + re.src_pseudo_letter + ')' +
    ')';

  re.src_host =

    '(?:' +
    // Don't need IP check, because digits are already allowed in normal domain names
    //   src_ip4 +
    // '|' +
      '(?:(?:(?:' + re.src_domain + ')\\.)*' + re.src_domain/*_root*/ + ')' +
    ')';

  re.tpl_host_fuzzy =

    '(?:' +
      re.src_ip4 +
    '|' +
      '(?:(?:(?:' + re.src_domain + ')\\.)+(?:%TLDS%))' +
    ')';

  re.tpl_host_no_ip_fuzzy =

    '(?:(?:(?:' + re.src_domain + ')\\.)+(?:%TLDS%))';

  re.src_host_strict =

    re.src_host + re.src_host_terminator;

  re.tpl_host_fuzzy_strict =

    re.tpl_host_fuzzy + re.src_host_terminator;

  re.src_host_port_strict =

    re.src_host + re.src_port + re.src_host_terminator;

  re.tpl_host_port_fuzzy_strict =

    re.tpl_host_fuzzy + re.src_port + re.src_host_terminator;

  re.tpl_host_port_no_ip_fuzzy_strict =

    re.tpl_host_no_ip_fuzzy + re.src_port + re.src_host_terminator;


  ////////////////////////////////////////////////////////////////////////////////
  // Main rules

  // Rude test fuzzy links by host, for quick deny
  re.tpl_host_fuzzy_test =

    'localhost|www\\.|\\.\\d{1,3}\\.|(?:\\.(?:%TLDS%)(?:' + re.src_ZPCc + '|>|$))';

  re.tpl_email_fuzzy =

      '(^|' + text_separators + '|\\(|' + re.src_ZCc + ')(' + re.src_email_name + '@' + re.tpl_host_fuzzy_strict + ')';

  re.tpl_link_fuzzy =
      // Fuzzy link can't be prepended with .:/\- and non punctuation.
      // but can start with > (markdown blockquote)
      '(^|(?![.:/\\-_@])(?:[$+<=>^`|\uff5c]|' + re.src_ZPCc + '))' +
      '((?![$+<=>^`|\uff5c])' + re.tpl_host_port_fuzzy_strict + re.src_path + ')';

  re.tpl_link_no_ip_fuzzy =
      // Fuzzy link can't be prepended with .:/\- and non punctuation.
      // but can start with > (markdown blockquote)
      '(^|(?![.:/\\-_@])(?:[$+<=>^`|\uff5c]|' + re.src_ZPCc + '))' +
      '((?![$+<=>^`|\uff5c])' + re.tpl_host_port_no_ip_fuzzy_strict + re.src_path + ')';

  return re;
};


/***/ }),

/***/ "../../../node_modules/markdown-it/index.js":
/*!***********************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/markdown-it/index.js ***!
  \***********************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";



module.exports = __webpack_require__(/*! ./lib/ */ "../../../node_modules/markdown-it/lib/index.js");


/***/ }),

/***/ "../../../node_modules/markdown-it/lib/common/entities.js":
/*!*************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/markdown-it/lib/common/entities.js ***!
  \*************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// HTML5 entities map: { name -> utf16string }
//


/*eslint quotes:0*/
module.exports = __webpack_require__(/*! entities/maps/entities.json */ "../../../node_modules/entities/maps/entities.json");


/***/ }),

/***/ "../../../node_modules/markdown-it/lib/common/html_blocks.js":
/*!****************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/markdown-it/lib/common/html_blocks.js ***!
  \****************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// List of valid html blocks names, accorting to commonmark spec
// http://jgm.github.io/CommonMark/spec.html#html-blocks




module.exports = [
  'address',
  'article',
  'aside',
  'base',
  'basefont',
  'blockquote',
  'body',
  'caption',
  'center',
  'col',
  'colgroup',
  'dd',
  'details',
  'dialog',
  'dir',
  'div',
  'dl',
  'dt',
  'fieldset',
  'figcaption',
  'figure',
  'footer',
  'form',
  'frame',
  'frameset',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'head',
  'header',
  'hr',
  'html',
  'iframe',
  'legend',
  'li',
  'link',
  'main',
  'menu',
  'menuitem',
  'meta',
  'nav',
  'noframes',
  'ol',
  'optgroup',
  'option',
  'p',
  'param',
  'section',
  'source',
  'summary',
  'table',
  'tbody',
  'td',
  'tfoot',
  'th',
  'thead',
  'title',
  'tr',
  'track',
  'ul'
];


/***/ }),

/***/ "../../../node_modules/markdown-it/lib/common/html_re.js":
/*!************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/markdown-it/lib/common/html_re.js ***!
  \************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Regexps to match html elements



var attr_name     = '[a-zA-Z_:][a-zA-Z0-9:._-]*';

var unquoted      = '[^"\'=<>`\\x00-\\x20]+';
var single_quoted = "'[^']*'";
var double_quoted = '"[^"]*"';

var attr_value  = '(?:' + unquoted + '|' + single_quoted + '|' + double_quoted + ')';

var attribute   = '(?:\\s+' + attr_name + '(?:\\s*=\\s*' + attr_value + ')?)';

var open_tag    = '<[A-Za-z][A-Za-z0-9\\-]*' + attribute + '*\\s*\\/?>';

var close_tag   = '<\\/[A-Za-z][A-Za-z0-9\\-]*\\s*>';
var comment     = '<!---->|<!--(?:-?[^>-])(?:-?[^-])*-->';
var processing  = '<[?].*?[?]>';
var declaration = '<![A-Z]+\\s+[^>]*>';
var cdata       = '<!\\[CDATA\\[[\\s\\S]*?\\]\\]>';

var HTML_TAG_RE = new RegExp('^(?:' + open_tag + '|' + close_tag + '|' + comment +
                        '|' + processing + '|' + declaration + '|' + cdata + ')');
var HTML_OPEN_CLOSE_TAG_RE = new RegExp('^(?:' + open_tag + '|' + close_tag + ')');

module.exports.HTML_TAG_RE = HTML_TAG_RE;
module.exports.HTML_OPEN_CLOSE_TAG_RE = HTML_OPEN_CLOSE_TAG_RE;


/***/ }),

/***/ "../../../node_modules/markdown-it/lib/common/utils.js":
/*!**********************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/markdown-it/lib/common/utils.js ***!
  \**********************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Utilities
//



function _class(obj) { return Object.prototype.toString.call(obj); }

function isString(obj) { return _class(obj) === '[object String]'; }

var _hasOwnProperty = Object.prototype.hasOwnProperty;

function has(object, key) {
  return _hasOwnProperty.call(object, key);
}

// Merge objects
//
function assign(obj /*from1, from2, from3, ...*/) {
  var sources = Array.prototype.slice.call(arguments, 1);

  sources.forEach(function (source) {
    if (!source) { return; }

    if (typeof source !== 'object') {
      throw new TypeError(source + 'must be object');
    }

    Object.keys(source).forEach(function (key) {
      obj[key] = source[key];
    });
  });

  return obj;
}

// Remove element from array and put another array at those position.
// Useful for some operations with tokens
function arrayReplaceAt(src, pos, newElements) {
  return [].concat(src.slice(0, pos), newElements, src.slice(pos + 1));
}

////////////////////////////////////////////////////////////////////////////////

function isValidEntityCode(c) {
  /*eslint no-bitwise:0*/
  // broken sequence
  if (c >= 0xD800 && c <= 0xDFFF) { return false; }
  // never used
  if (c >= 0xFDD0 && c <= 0xFDEF) { return false; }
  if ((c & 0xFFFF) === 0xFFFF || (c & 0xFFFF) === 0xFFFE) { return false; }
  // control codes
  if (c >= 0x00 && c <= 0x08) { return false; }
  if (c === 0x0B) { return false; }
  if (c >= 0x0E && c <= 0x1F) { return false; }
  if (c >= 0x7F && c <= 0x9F) { return false; }
  // out of range
  if (c > 0x10FFFF) { return false; }
  return true;
}

function fromCodePoint(c) {
  /*eslint no-bitwise:0*/
  if (c > 0xffff) {
    c -= 0x10000;
    var surrogate1 = 0xd800 + (c >> 10),
        surrogate2 = 0xdc00 + (c & 0x3ff);

    return String.fromCharCode(surrogate1, surrogate2);
  }
  return String.fromCharCode(c);
}


var UNESCAPE_MD_RE  = /\\([!"#$%&'()*+,\-.\/:;<=>?@[\\\]^_`{|}~])/g;
var ENTITY_RE       = /&([a-z#][a-z0-9]{1,31});/gi;
var UNESCAPE_ALL_RE = new RegExp(UNESCAPE_MD_RE.source + '|' + ENTITY_RE.source, 'gi');

var DIGITAL_ENTITY_TEST_RE = /^#((?:x[a-f0-9]{1,8}|[0-9]{1,8}))/i;

var entities = __webpack_require__(/*! ./entities */ "../../../node_modules/markdown-it/lib/common/entities.js");

function replaceEntityPattern(match, name) {
  var code = 0;

  if (has(entities, name)) {
    return entities[name];
  }

  if (name.charCodeAt(0) === 0x23/* # */ && DIGITAL_ENTITY_TEST_RE.test(name)) {
    code = name[1].toLowerCase() === 'x' ?
      parseInt(name.slice(2), 16)
    :
      parseInt(name.slice(1), 10);
    if (isValidEntityCode(code)) {
      return fromCodePoint(code);
    }
  }

  return match;
}

/*function replaceEntities(str) {
  if (str.indexOf('&') < 0) { return str; }

  return str.replace(ENTITY_RE, replaceEntityPattern);
}*/

function unescapeMd(str) {
  if (str.indexOf('\\') < 0) { return str; }
  return str.replace(UNESCAPE_MD_RE, '$1');
}

function unescapeAll(str) {
  if (str.indexOf('\\') < 0 && str.indexOf('&') < 0) { return str; }

  return str.replace(UNESCAPE_ALL_RE, function (match, escaped, entity) {
    if (escaped) { return escaped; }
    return replaceEntityPattern(match, entity);
  });
}

////////////////////////////////////////////////////////////////////////////////

var HTML_ESCAPE_TEST_RE = /[&<>"]/;
var HTML_ESCAPE_REPLACE_RE = /[&<>"]/g;
var HTML_REPLACEMENTS = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;'
};

function replaceUnsafeChar(ch) {
  return HTML_REPLACEMENTS[ch];
}

function escapeHtml(str) {
  if (HTML_ESCAPE_TEST_RE.test(str)) {
    return str.replace(HTML_ESCAPE_REPLACE_RE, replaceUnsafeChar);
  }
  return str;
}

////////////////////////////////////////////////////////////////////////////////

var REGEXP_ESCAPE_RE = /[.?*+^$[\]\\(){}|-]/g;

function escapeRE(str) {
  return str.replace(REGEXP_ESCAPE_RE, '\\$&');
}

////////////////////////////////////////////////////////////////////////////////

function isSpace(code) {
  switch (code) {
    case 0x09:
    case 0x20:
      return true;
  }
  return false;
}

// Zs (unicode class) || [\t\f\v\r\n]
function isWhiteSpace(code) {
  if (code >= 0x2000 && code <= 0x200A) { return true; }
  switch (code) {
    case 0x09: // \t
    case 0x0A: // \n
    case 0x0B: // \v
    case 0x0C: // \f
    case 0x0D: // \r
    case 0x20:
    case 0xA0:
    case 0x1680:
    case 0x202F:
    case 0x205F:
    case 0x3000:
      return true;
  }
  return false;
}

////////////////////////////////////////////////////////////////////////////////

/*eslint-disable max-len*/
var UNICODE_PUNCT_RE = __webpack_require__(/*! uc.micro/categories/P/regex */ "../../../node_modules/uc.micro/categories/P/regex.js");

// Currently without astral characters support.
function isPunctChar(ch) {
  return UNICODE_PUNCT_RE.test(ch);
}


// Markdown ASCII punctuation characters.
//
// !, ", #, $, %, &, ', (, ), *, +, ,, -, ., /, :, ;, <, =, >, ?, @, [, \, ], ^, _, `, {, |, }, or ~
// http://spec.commonmark.org/0.15/#ascii-punctuation-character
//
// Don't confuse with unicode punctuation !!! It lacks some chars in ascii range.
//
function isMdAsciiPunct(ch) {
  switch (ch) {
    case 0x21/* ! */:
    case 0x22/* " */:
    case 0x23/* # */:
    case 0x24/* $ */:
    case 0x25/* % */:
    case 0x26/* & */:
    case 0x27/* ' */:
    case 0x28/* ( */:
    case 0x29/* ) */:
    case 0x2A/* * */:
    case 0x2B/* + */:
    case 0x2C/* , */:
    case 0x2D/* - */:
    case 0x2E/* . */:
    case 0x2F/* / */:
    case 0x3A/* : */:
    case 0x3B/* ; */:
    case 0x3C/* < */:
    case 0x3D/* = */:
    case 0x3E/* > */:
    case 0x3F/* ? */:
    case 0x40/* @ */:
    case 0x5B/* [ */:
    case 0x5C/* \ */:
    case 0x5D/* ] */:
    case 0x5E/* ^ */:
    case 0x5F/* _ */:
    case 0x60/* ` */:
    case 0x7B/* { */:
    case 0x7C/* | */:
    case 0x7D/* } */:
    case 0x7E/* ~ */:
      return true;
    default:
      return false;
  }
}

// Hepler to unify [reference labels].
//
function normalizeReference(str) {
  // use .toUpperCase() instead of .toLowerCase()
  // here to avoid a conflict with Object.prototype
  // members (most notably, `__proto__`)
  return str.trim().replace(/\s+/g, ' ').toUpperCase();
}

////////////////////////////////////////////////////////////////////////////////

// Re-export libraries commonly used in both markdown-it and its plugins,
// so plugins won't have to depend on them explicitly, which reduces their
// bundled size (e.g. a browser build).
//
exports.lib                 = {};
exports.lib.mdurl           = __webpack_require__(/*! mdurl */ "../../../node_modules/mdurl/index.js");
exports.lib.ucmicro         = __webpack_require__(/*! uc.micro */ "../../../node_modules/uc.micro/index.js");

exports.assign              = assign;
exports.isString            = isString;
exports.has                 = has;
exports.unescapeMd          = unescapeMd;
exports.unescapeAll         = unescapeAll;
exports.isValidEntityCode   = isValidEntityCode;
exports.fromCodePoint       = fromCodePoint;
// exports.replaceEntities     = replaceEntities;
exports.escapeHtml          = escapeHtml;
exports.arrayReplaceAt      = arrayReplaceAt;
exports.isSpace             = isSpace;
exports.isWhiteSpace        = isWhiteSpace;
exports.isMdAsciiPunct      = isMdAsciiPunct;
exports.isPunctChar         = isPunctChar;
exports.escapeRE            = escapeRE;
exports.normalizeReference  = normalizeReference;


/***/ }),

/***/ "../../../node_modules/markdown-it/lib/helpers/index.js":
/*!***********************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/markdown-it/lib/helpers/index.js ***!
  \***********************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Just a shortcut for bulk export



exports.parseLinkLabel       = __webpack_require__(/*! ./parse_link_label */ "../../../node_modules/markdown-it/lib/helpers/parse_link_label.js");
exports.parseLinkDestination = __webpack_require__(/*! ./parse_link_destination */ "../../../node_modules/markdown-it/lib/helpers/parse_link_destination.js");
exports.parseLinkTitle       = __webpack_require__(/*! ./parse_link_title */ "../../../node_modules/markdown-it/lib/helpers/parse_link_title.js");


/***/ }),

/***/ "../../../node_modules/markdown-it/lib/helpers/parse_link_destination.js":
/*!****************************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/markdown-it/lib/helpers/parse_link_destination.js ***!
  \****************************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Parse link destination
//



var isSpace     = __webpack_require__(/*! ../common/utils */ "../../../node_modules/markdown-it/lib/common/utils.js").isSpace;
var unescapeAll = __webpack_require__(/*! ../common/utils */ "../../../node_modules/markdown-it/lib/common/utils.js").unescapeAll;


module.exports = function parseLinkDestination(str, pos, max) {
  var code, level,
      lines = 0,
      start = pos,
      result = {
        ok: false,
        pos: 0,
        lines: 0,
        str: ''
      };

  if (str.charCodeAt(pos) === 0x3C /* < */) {
    pos++;
    while (pos < max) {
      code = str.charCodeAt(pos);
      if (code === 0x0A /* \n */ || isSpace(code)) { return result; }
      if (code === 0x3E /* > */) {
        result.pos = pos + 1;
        result.str = unescapeAll(str.slice(start + 1, pos));
        result.ok = true;
        return result;
      }
      if (code === 0x5C /* \ */ && pos + 1 < max) {
        pos += 2;
        continue;
      }

      pos++;
    }

    // no closing '>'
    return result;
  }

  // this should be ... } else { ... branch

  level = 0;
  while (pos < max) {
    code = str.charCodeAt(pos);

    if (code === 0x20) { break; }

    // ascii control characters
    if (code < 0x20 || code === 0x7F) { break; }

    if (code === 0x5C /* \ */ && pos + 1 < max) {
      pos += 2;
      continue;
    }

    if (code === 0x28 /* ( */) {
      level++;
    }

    if (code === 0x29 /* ) */) {
      if (level === 0) { break; }
      level--;
    }

    pos++;
  }

  if (start === pos) { return result; }
  if (level !== 0) { return result; }

  result.str = unescapeAll(str.slice(start, pos));
  result.lines = lines;
  result.pos = pos;
  result.ok = true;
  return result;
};


/***/ }),

/***/ "../../../node_modules/markdown-it/lib/helpers/parse_link_label.js":
/*!**********************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/markdown-it/lib/helpers/parse_link_label.js ***!
  \**********************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Parse link label
//
// this function assumes that first character ("[") already matches;
// returns the end of the label
//


module.exports = function parseLinkLabel(state, start, disableNested) {
  var level, found, marker, prevPos,
      labelEnd = -1,
      max = state.posMax,
      oldPos = state.pos;

  state.pos = start + 1;
  level = 1;

  while (state.pos < max) {
    marker = state.src.charCodeAt(state.pos);
    if (marker === 0x5D /* ] */) {
      level--;
      if (level === 0) {
        found = true;
        break;
      }
    }

    prevPos = state.pos;
    state.md.inline.skipToken(state);
    if (marker === 0x5B /* [ */) {
      if (prevPos === state.pos - 1) {
        // increase level if we find text `[`, which is not a part of any token
        level++;
      } else if (disableNested) {
        state.pos = oldPos;
        return -1;
      }
    }
  }

  if (found) {
    labelEnd = state.pos;
  }

  // restore old state
  state.pos = oldPos;

  return labelEnd;
};


/***/ }),

/***/ "../../../node_modules/markdown-it/lib/helpers/parse_link_title.js":
/*!**********************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/markdown-it/lib/helpers/parse_link_title.js ***!
  \**********************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Parse link title
//



var unescapeAll = __webpack_require__(/*! ../common/utils */ "../../../node_modules/markdown-it/lib/common/utils.js").unescapeAll;


module.exports = function parseLinkTitle(str, pos, max) {
  var code,
      marker,
      lines = 0,
      start = pos,
      result = {
        ok: false,
        pos: 0,
        lines: 0,
        str: ''
      };

  if (pos >= max) { return result; }

  marker = str.charCodeAt(pos);

  if (marker !== 0x22 /* " */ && marker !== 0x27 /* ' */ && marker !== 0x28 /* ( */) { return result; }

  pos++;

  // if opening marker is "(", switch it to closing marker ")"
  if (marker === 0x28) { marker = 0x29; }

  while (pos < max) {
    code = str.charCodeAt(pos);
    if (code === marker) {
      result.pos = pos + 1;
      result.lines = lines;
      result.str = unescapeAll(str.slice(start + 1, pos));
      result.ok = true;
      return result;
    } else if (code === 0x0A) {
      lines++;
    } else if (code === 0x5C /* \ */ && pos + 1 < max) {
      pos++;
      if (str.charCodeAt(pos) === 0x0A) {
        lines++;
      }
    }

    pos++;
  }

  return result;
};


/***/ }),

/***/ "../../../node_modules/markdown-it/lib/index.js":
/*!***************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/markdown-it/lib/index.js ***!
  \***************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Main parser class




var utils        = __webpack_require__(/*! ./common/utils */ "../../../node_modules/markdown-it/lib/common/utils.js");
var helpers      = __webpack_require__(/*! ./helpers */ "../../../node_modules/markdown-it/lib/helpers/index.js");
var Renderer     = __webpack_require__(/*! ./renderer */ "../../../node_modules/markdown-it/lib/renderer.js");
var ParserCore   = __webpack_require__(/*! ./parser_core */ "../../../node_modules/markdown-it/lib/parser_core.js");
var ParserBlock  = __webpack_require__(/*! ./parser_block */ "../../../node_modules/markdown-it/lib/parser_block.js");
var ParserInline = __webpack_require__(/*! ./parser_inline */ "../../../node_modules/markdown-it/lib/parser_inline.js");
var LinkifyIt    = __webpack_require__(/*! linkify-it */ "../../../node_modules/linkify-it/index.js");
var mdurl        = __webpack_require__(/*! mdurl */ "../../../node_modules/mdurl/index.js");
var punycode     = __webpack_require__(/*! punycode */ "../../../node_modules/punycode/punycode.js");


var config = {
  'default': __webpack_require__(/*! ./presets/default */ "../../../node_modules/markdown-it/lib/presets/default.js"),
  zero: __webpack_require__(/*! ./presets/zero */ "../../../node_modules/markdown-it/lib/presets/zero.js"),
  commonmark: __webpack_require__(/*! ./presets/commonmark */ "../../../node_modules/markdown-it/lib/presets/commonmark.js")
};

////////////////////////////////////////////////////////////////////////////////
//
// This validator can prohibit more than really needed to prevent XSS. It's a
// tradeoff to keep code simple and to be secure by default.
//
// If you need different setup - override validator method as you wish. Or
// replace it with dummy function and use external sanitizer.
//

var BAD_PROTO_RE = /^(vbscript|javascript|file|data):/;
var GOOD_DATA_RE = /^data:image\/(gif|png|jpeg|webp);/;

function validateLink(url) {
  // url should be normalized at this point, and existing entities are decoded
  var str = url.trim().toLowerCase();

  return BAD_PROTO_RE.test(str) ? (GOOD_DATA_RE.test(str) ? true : false) : true;
}

////////////////////////////////////////////////////////////////////////////////


var RECODE_HOSTNAME_FOR = [ 'http:', 'https:', 'mailto:' ];

function normalizeLink(url) {
  var parsed = mdurl.parse(url, true);

  if (parsed.hostname) {
    // Encode hostnames in urls like:
    // `http://host/`, `https://host/`, `mailto:user@host`, `//host/`
    //
    // We don't encode unknown schemas, because it's likely that we encode
    // something we shouldn't (e.g. `skype:name` treated as `skype:host`)
    //
    if (!parsed.protocol || RECODE_HOSTNAME_FOR.indexOf(parsed.protocol) >= 0) {
      try {
        parsed.hostname = punycode.toASCII(parsed.hostname);
      } catch (er) { /**/ }
    }
  }

  return mdurl.encode(mdurl.format(parsed));
}

function normalizeLinkText(url) {
  var parsed = mdurl.parse(url, true);

  if (parsed.hostname) {
    // Encode hostnames in urls like:
    // `http://host/`, `https://host/`, `mailto:user@host`, `//host/`
    //
    // We don't encode unknown schemas, because it's likely that we encode
    // something we shouldn't (e.g. `skype:name` treated as `skype:host`)
    //
    if (!parsed.protocol || RECODE_HOSTNAME_FOR.indexOf(parsed.protocol) >= 0) {
      try {
        parsed.hostname = punycode.toUnicode(parsed.hostname);
      } catch (er) { /**/ }
    }
  }

  return mdurl.decode(mdurl.format(parsed));
}


/**
 * class MarkdownIt
 *
 * Main parser/renderer class.
 *
 * ##### Usage
 *
 * ```javascript
 * // node.js, "classic" way:
 * var MarkdownIt = require('markdown-it'),
 *     md = new MarkdownIt();
 * var result = md.render('# markdown-it rulezz!');
 *
 * // node.js, the same, but with sugar:
 * var md = require('markdown-it')();
 * var result = md.render('# markdown-it rulezz!');
 *
 * // browser without AMD, added to "window" on script load
 * // Note, there are no dash.
 * var md = window.markdownit();
 * var result = md.render('# markdown-it rulezz!');
 * ```
 *
 * Single line rendering, without paragraph wrap:
 *
 * ```javascript
 * var md = require('markdown-it')();
 * var result = md.renderInline('__markdown-it__ rulezz!');
 * ```
 **/

/**
 * new MarkdownIt([presetName, options])
 * - presetName (String): optional, `commonmark` / `zero`
 * - options (Object)
 *
 * Creates parser instanse with given config. Can be called without `new`.
 *
 * ##### presetName
 *
 * MarkdownIt provides named presets as a convenience to quickly
 * enable/disable active syntax rules and options for common use cases.
 *
 * - ["commonmark"](https://github.com/markdown-it/markdown-it/blob/master/lib/presets/commonmark.js) -
 *   configures parser to strict [CommonMark](http://commonmark.org/) mode.
 * - [default](https://github.com/markdown-it/markdown-it/blob/master/lib/presets/default.js) -
 *   similar to GFM, used when no preset name given. Enables all available rules,
 *   but still without html, typographer & autolinker.
 * - ["zero"](https://github.com/markdown-it/markdown-it/blob/master/lib/presets/zero.js) -
 *   all rules disabled. Useful to quickly setup your config via `.enable()`.
 *   For example, when you need only `bold` and `italic` markup and nothing else.
 *
 * ##### options:
 *
 * - __html__ - `false`. Set `true` to enable HTML tags in source. Be careful!
 *   That's not safe! You may need external sanitizer to protect output from XSS.
 *   It's better to extend features via plugins, instead of enabling HTML.
 * - __xhtmlOut__ - `false`. Set `true` to add '/' when closing single tags
 *   (`<br />`). This is needed only for full CommonMark compatibility. In real
 *   world you will need HTML output.
 * - __breaks__ - `false`. Set `true` to convert `\n` in paragraphs into `<br>`.
 * - __langPrefix__ - `language-`. CSS language class prefix for fenced blocks.
 *   Can be useful for external highlighters.
 * - __linkify__ - `false`. Set `true` to autoconvert URL-like text to links.
 * - __typographer__  - `false`. Set `true` to enable [some language-neutral
 *   replacement](https://github.com/markdown-it/markdown-it/blob/master/lib/rules_core/replacements.js) +
 *   quotes beautification (smartquotes).
 * - __quotes__ - `“”‘’`, String or Array. Double + single quotes replacement
 *   pairs, when typographer enabled and smartquotes on. For example, you can
 *   use `'«»„“'` for Russian, `'„“‚‘'` for German, and
 *   `['«\xA0', '\xA0»', '‹\xA0', '\xA0›']` for French (including nbsp).
 * - __highlight__ - `null`. Highlighter function for fenced code blocks.
 *   Highlighter `function (str, lang)` should return escaped HTML. It can also
 *   return empty string if the source was not changed and should be escaped
 *   externaly. If result starts with <pre... internal wrapper is skipped.
 *
 * ##### Example
 *
 * ```javascript
 * // commonmark mode
 * var md = require('markdown-it')('commonmark');
 *
 * // default mode
 * var md = require('markdown-it')();
 *
 * // enable everything
 * var md = require('markdown-it')({
 *   html: true,
 *   linkify: true,
 *   typographer: true
 * });
 * ```
 *
 * ##### Syntax highlighting
 *
 * ```js
 * var hljs = require('highlight.js') // https://highlightjs.org/
 *
 * var md = require('markdown-it')({
 *   highlight: function (str, lang) {
 *     if (lang && hljs.getLanguage(lang)) {
 *       try {
 *         return hljs.highlight(lang, str, true).value;
 *       } catch (__) {}
 *     }
 *
 *     return ''; // use external default escaping
 *   }
 * });
 * ```
 *
 * Or with full wrapper override (if you need assign class to `<pre>`):
 *
 * ```javascript
 * var hljs = require('highlight.js') // https://highlightjs.org/
 *
 * // Actual default values
 * var md = require('markdown-it')({
 *   highlight: function (str, lang) {
 *     if (lang && hljs.getLanguage(lang)) {
 *       try {
 *         return '<pre class="hljs"><code>' +
 *                hljs.highlight(lang, str, true).value +
 *                '</code></pre>';
 *       } catch (__) {}
 *     }
 *
 *     return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
 *   }
 * });
 * ```
 *
 **/
function MarkdownIt(presetName, options) {
  if (!(this instanceof MarkdownIt)) {
    return new MarkdownIt(presetName, options);
  }

  if (!options) {
    if (!utils.isString(presetName)) {
      options = presetName || {};
      presetName = 'default';
    }
  }

  /**
   * MarkdownIt#inline -> ParserInline
   *
   * Instance of [[ParserInline]]. You may need it to add new rules when
   * writing plugins. For simple rules control use [[MarkdownIt.disable]] and
   * [[MarkdownIt.enable]].
   **/
  this.inline = new ParserInline();

  /**
   * MarkdownIt#block -> ParserBlock
   *
   * Instance of [[ParserBlock]]. You may need it to add new rules when
   * writing plugins. For simple rules control use [[MarkdownIt.disable]] and
   * [[MarkdownIt.enable]].
   **/
  this.block = new ParserBlock();

  /**
   * MarkdownIt#core -> Core
   *
   * Instance of [[Core]] chain executor. You may need it to add new rules when
   * writing plugins. For simple rules control use [[MarkdownIt.disable]] and
   * [[MarkdownIt.enable]].
   **/
  this.core = new ParserCore();

  /**
   * MarkdownIt#renderer -> Renderer
   *
   * Instance of [[Renderer]]. Use it to modify output look. Or to add rendering
   * rules for new token types, generated by plugins.
   *
   * ##### Example
   *
   * ```javascript
   * var md = require('markdown-it')();
   *
   * function myToken(tokens, idx, options, env, self) {
   *   //...
   *   return result;
   * };
   *
   * md.renderer.rules['my_token'] = myToken
   * ```
   *
   * See [[Renderer]] docs and [source code](https://github.com/markdown-it/markdown-it/blob/master/lib/renderer.js).
   **/
  this.renderer = new Renderer();

  /**
   * MarkdownIt#linkify -> LinkifyIt
   *
   * [linkify-it](https://github.com/markdown-it/linkify-it) instance.
   * Used by [linkify](https://github.com/markdown-it/markdown-it/blob/master/lib/rules_core/linkify.js)
   * rule.
   **/
  this.linkify = new LinkifyIt();

  /**
   * MarkdownIt#validateLink(url) -> Boolean
   *
   * Link validation function. CommonMark allows too much in links. By default
   * we disable `javascript:`, `vbscript:`, `file:` schemas, and almost all `data:...` schemas
   * except some embedded image types.
   *
   * You can change this behaviour:
   *
   * ```javascript
   * var md = require('markdown-it')();
   * // enable everything
   * md.validateLink = function () { return true; }
   * ```
   **/
  this.validateLink = validateLink;

  /**
   * MarkdownIt#normalizeLink(url) -> String
   *
   * Function used to encode link url to a machine-readable format,
   * which includes url-encoding, punycode, etc.
   **/
  this.normalizeLink = normalizeLink;

  /**
   * MarkdownIt#normalizeLinkText(url) -> String
   *
   * Function used to decode link url to a human-readable format`
   **/
  this.normalizeLinkText = normalizeLinkText;


  // Expose utils & helpers for easy acces from plugins

  /**
   * MarkdownIt#utils -> utils
   *
   * Assorted utility functions, useful to write plugins. See details
   * [here](https://github.com/markdown-it/markdown-it/blob/master/lib/common/utils.js).
   **/
  this.utils = utils;

  /**
   * MarkdownIt#helpers -> helpers
   *
   * Link components parser functions, useful to write plugins. See details
   * [here](https://github.com/markdown-it/markdown-it/blob/master/lib/helpers).
   **/
  this.helpers = utils.assign({}, helpers);


  this.options = {};
  this.configure(presetName);

  if (options) { this.set(options); }
}


/** chainable
 * MarkdownIt.set(options)
 *
 * Set parser options (in the same format as in constructor). Probably, you
 * will never need it, but you can change options after constructor call.
 *
 * ##### Example
 *
 * ```javascript
 * var md = require('markdown-it')()
 *             .set({ html: true, breaks: true })
 *             .set({ typographer, true });
 * ```
 *
 * __Note:__ To achieve the best possible performance, don't modify a
 * `markdown-it` instance options on the fly. If you need multiple configurations
 * it's best to create multiple instances and initialize each with separate
 * config.
 **/
MarkdownIt.prototype.set = function (options) {
  utils.assign(this.options, options);
  return this;
};


/** chainable, internal
 * MarkdownIt.configure(presets)
 *
 * Batch load of all options and compenent settings. This is internal method,
 * and you probably will not need it. But if you with - see available presets
 * and data structure [here](https://github.com/markdown-it/markdown-it/tree/master/lib/presets)
 *
 * We strongly recommend to use presets instead of direct config loads. That
 * will give better compatibility with next versions.
 **/
MarkdownIt.prototype.configure = function (presets) {
  var self = this, presetName;

  if (utils.isString(presets)) {
    presetName = presets;
    presets = config[presetName];
    if (!presets) { throw new Error('Wrong `markdown-it` preset "' + presetName + '", check name'); }
  }

  if (!presets) { throw new Error('Wrong `markdown-it` preset, can\'t be empty'); }

  if (presets.options) { self.set(presets.options); }

  if (presets.components) {
    Object.keys(presets.components).forEach(function (name) {
      if (presets.components[name].rules) {
        self[name].ruler.enableOnly(presets.components[name].rules);
      }
      if (presets.components[name].rules2) {
        self[name].ruler2.enableOnly(presets.components[name].rules2);
      }
    });
  }
  return this;
};


/** chainable
 * MarkdownIt.enable(list, ignoreInvalid)
 * - list (String|Array): rule name or list of rule names to enable
 * - ignoreInvalid (Boolean): set `true` to ignore errors when rule not found.
 *
 * Enable list or rules. It will automatically find appropriate components,
 * containing rules with given names. If rule not found, and `ignoreInvalid`
 * not set - throws exception.
 *
 * ##### Example
 *
 * ```javascript
 * var md = require('markdown-it')()
 *             .enable(['sub', 'sup'])
 *             .disable('smartquotes');
 * ```
 **/
MarkdownIt.prototype.enable = function (list, ignoreInvalid) {
  var result = [];

  if (!Array.isArray(list)) { list = [ list ]; }

  [ 'core', 'block', 'inline' ].forEach(function (chain) {
    result = result.concat(this[chain].ruler.enable(list, true));
  }, this);

  result = result.concat(this.inline.ruler2.enable(list, true));

  var missed = list.filter(function (name) { return result.indexOf(name) < 0; });

  if (missed.length && !ignoreInvalid) {
    throw new Error('MarkdownIt. Failed to enable unknown rule(s): ' + missed);
  }

  return this;
};


/** chainable
 * MarkdownIt.disable(list, ignoreInvalid)
 * - list (String|Array): rule name or list of rule names to disable.
 * - ignoreInvalid (Boolean): set `true` to ignore errors when rule not found.
 *
 * The same as [[MarkdownIt.enable]], but turn specified rules off.
 **/
MarkdownIt.prototype.disable = function (list, ignoreInvalid) {
  var result = [];

  if (!Array.isArray(list)) { list = [ list ]; }

  [ 'core', 'block', 'inline' ].forEach(function (chain) {
    result = result.concat(this[chain].ruler.disable(list, true));
  }, this);

  result = result.concat(this.inline.ruler2.disable(list, true));

  var missed = list.filter(function (name) { return result.indexOf(name) < 0; });

  if (missed.length && !ignoreInvalid) {
    throw new Error('MarkdownIt. Failed to disable unknown rule(s): ' + missed);
  }
  return this;
};


/** chainable
 * MarkdownIt.use(plugin, params)
 *
 * Load specified plugin with given params into current parser instance.
 * It's just a sugar to call `plugin(md, params)` with curring.
 *
 * ##### Example
 *
 * ```javascript
 * var iterator = require('markdown-it-for-inline');
 * var md = require('markdown-it')()
 *             .use(iterator, 'foo_replace', 'text', function (tokens, idx) {
 *               tokens[idx].content = tokens[idx].content.replace(/foo/g, 'bar');
 *             });
 * ```
 **/
MarkdownIt.prototype.use = function (plugin /*, params, ... */) {
  var args = [ this ].concat(Array.prototype.slice.call(arguments, 1));
  plugin.apply(plugin, args);
  return this;
};


/** internal
 * MarkdownIt.parse(src, env) -> Array
 * - src (String): source string
 * - env (Object): environment sandbox
 *
 * Parse input string and returns list of block tokens (special token type
 * "inline" will contain list of inline tokens). You should not call this
 * method directly, until you write custom renderer (for example, to produce
 * AST).
 *
 * `env` is used to pass data between "distributed" rules and return additional
 * metadata like reference info, needed for the renderer. It also can be used to
 * inject data in specific cases. Usually, you will be ok to pass `{}`,
 * and then pass updated object to renderer.
 **/
MarkdownIt.prototype.parse = function (src, env) {
  if (typeof src !== 'string') {
    throw new Error('Input data should be a String');
  }

  var state = new this.core.State(src, this, env);

  this.core.process(state);

  return state.tokens;
};


/**
 * MarkdownIt.render(src [, env]) -> String
 * - src (String): source string
 * - env (Object): environment sandbox
 *
 * Render markdown string into html. It does all magic for you :).
 *
 * `env` can be used to inject additional metadata (`{}` by default).
 * But you will not need it with high probability. See also comment
 * in [[MarkdownIt.parse]].
 **/
MarkdownIt.prototype.render = function (src, env) {
  env = env || {};

  return this.renderer.render(this.parse(src, env), this.options, env);
};


/** internal
 * MarkdownIt.parseInline(src, env) -> Array
 * - src (String): source string
 * - env (Object): environment sandbox
 *
 * The same as [[MarkdownIt.parse]] but skip all block rules. It returns the
 * block tokens list with the single `inline` element, containing parsed inline
 * tokens in `children` property. Also updates `env` object.
 **/
MarkdownIt.prototype.parseInline = function (src, env) {
  var state = new this.core.State(src, this, env);

  state.inlineMode = true;
  this.core.process(state);

  return state.tokens;
};


/**
 * MarkdownIt.renderInline(src [, env]) -> String
 * - src (String): source string
 * - env (Object): environment sandbox
 *
 * Similar to [[MarkdownIt.render]] but for single paragraph content. Result
 * will NOT be wrapped into `<p>` tags.
 **/
MarkdownIt.prototype.renderInline = function (src, env) {
  env = env || {};

  return this.renderer.render(this.parseInline(src, env), this.options, env);
};


module.exports = MarkdownIt;


/***/ }),

/***/ "../../../node_modules/markdown-it/lib/parser_block.js":
/*!**********************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/markdown-it/lib/parser_block.js ***!
  \**********************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/** internal
 * class ParserBlock
 *
 * Block-level tokenizer.
 **/



var Ruler           = __webpack_require__(/*! ./ruler */ "../../../node_modules/markdown-it/lib/ruler.js");


var _rules = [
  // First 2 params - rule name & source. Secondary array - list of rules,
  // which can be terminated by this one.
  [ 'table',      __webpack_require__(/*! ./rules_block/table */ "../../../node_modules/markdown-it/lib/rules_block/table.js"),      [ 'paragraph', 'reference' ] ],
  [ 'code',       __webpack_require__(/*! ./rules_block/code */ "../../../node_modules/markdown-it/lib/rules_block/code.js") ],
  [ 'fence',      __webpack_require__(/*! ./rules_block/fence */ "../../../node_modules/markdown-it/lib/rules_block/fence.js"),      [ 'paragraph', 'reference', 'blockquote', 'list' ] ],
  [ 'blockquote', __webpack_require__(/*! ./rules_block/blockquote */ "../../../node_modules/markdown-it/lib/rules_block/blockquote.js"), [ 'paragraph', 'reference', 'blockquote', 'list' ] ],
  [ 'hr',         __webpack_require__(/*! ./rules_block/hr */ "../../../node_modules/markdown-it/lib/rules_block/hr.js"),         [ 'paragraph', 'reference', 'blockquote', 'list' ] ],
  [ 'list',       __webpack_require__(/*! ./rules_block/list */ "../../../node_modules/markdown-it/lib/rules_block/list.js"),       [ 'paragraph', 'reference', 'blockquote' ] ],
  [ 'reference',  __webpack_require__(/*! ./rules_block/reference */ "../../../node_modules/markdown-it/lib/rules_block/reference.js") ],
  [ 'heading',    __webpack_require__(/*! ./rules_block/heading */ "../../../node_modules/markdown-it/lib/rules_block/heading.js"),    [ 'paragraph', 'reference', 'blockquote' ] ],
  [ 'lheading',   __webpack_require__(/*! ./rules_block/lheading */ "../../../node_modules/markdown-it/lib/rules_block/lheading.js") ],
  [ 'html_block', __webpack_require__(/*! ./rules_block/html_block */ "../../../node_modules/markdown-it/lib/rules_block/html_block.js"), [ 'paragraph', 'reference', 'blockquote' ] ],
  [ 'paragraph',  __webpack_require__(/*! ./rules_block/paragraph */ "../../../node_modules/markdown-it/lib/rules_block/paragraph.js") ]
];


/**
 * new ParserBlock()
 **/
function ParserBlock() {
  /**
   * ParserBlock#ruler -> Ruler
   *
   * [[Ruler]] instance. Keep configuration of block rules.
   **/
  this.ruler = new Ruler();

  for (var i = 0; i < _rules.length; i++) {
    this.ruler.push(_rules[i][0], _rules[i][1], { alt: (_rules[i][2] || []).slice() });
  }
}


// Generate tokens for input range
//
ParserBlock.prototype.tokenize = function (state, startLine, endLine) {
  var ok, i,
      rules = this.ruler.getRules(''),
      len = rules.length,
      line = startLine,
      hasEmptyLines = false,
      maxNesting = state.md.options.maxNesting;

  while (line < endLine) {
    state.line = line = state.skipEmptyLines(line);
    if (line >= endLine) { break; }

    // Termination condition for nested calls.
    // Nested calls currently used for blockquotes & lists
    if (state.sCount[line] < state.blkIndent) { break; }

    // If nesting level exceeded - skip tail to the end. That's not ordinary
    // situation and we should not care about content.
    if (state.level >= maxNesting) {
      state.line = endLine;
      break;
    }

    // Try all possible rules.
    // On success, rule should:
    //
    // - update `state.line`
    // - update `state.tokens`
    // - return true

    for (i = 0; i < len; i++) {
      ok = rules[i](state, line, endLine, false);
      if (ok) { break; }
    }

    // set state.tight if we had an empty line before current tag
    // i.e. latest empty line should not count
    state.tight = !hasEmptyLines;

    // paragraph might "eat" one newline after it in nested lists
    if (state.isEmpty(state.line - 1)) {
      hasEmptyLines = true;
    }

    line = state.line;

    if (line < endLine && state.isEmpty(line)) {
      hasEmptyLines = true;
      line++;
      state.line = line;
    }
  }
};


/**
 * ParserBlock.parse(str, md, env, outTokens)
 *
 * Process input string and push block tokens into `outTokens`
 **/
ParserBlock.prototype.parse = function (src, md, env, outTokens) {
  var state;

  if (!src) { return; }

  state = new this.State(src, md, env, outTokens);

  this.tokenize(state, state.line, state.lineMax);
};


ParserBlock.prototype.State = __webpack_require__(/*! ./rules_block/state_block */ "../../../node_modules/markdown-it/lib/rules_block/state_block.js");


module.exports = ParserBlock;


/***/ }),

/***/ "../../../node_modules/markdown-it/lib/parser_core.js":
/*!*********************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/markdown-it/lib/parser_core.js ***!
  \*********************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/** internal
 * class Core
 *
 * Top-level rules executor. Glues block/inline parsers and does intermediate
 * transformations.
 **/



var Ruler  = __webpack_require__(/*! ./ruler */ "../../../node_modules/markdown-it/lib/ruler.js");


var _rules = [
  [ 'normalize',      __webpack_require__(/*! ./rules_core/normalize */ "../../../node_modules/markdown-it/lib/rules_core/normalize.js")      ],
  [ 'block',          __webpack_require__(/*! ./rules_core/block */ "../../../node_modules/markdown-it/lib/rules_core/block.js")          ],
  [ 'inline',         __webpack_require__(/*! ./rules_core/inline */ "../../../node_modules/markdown-it/lib/rules_core/inline.js")         ],
  [ 'linkify',        __webpack_require__(/*! ./rules_core/linkify */ "../../../node_modules/markdown-it/lib/rules_core/linkify.js")        ],
  [ 'replacements',   __webpack_require__(/*! ./rules_core/replacements */ "../../../node_modules/markdown-it/lib/rules_core/replacements.js")   ],
  [ 'smartquotes',    __webpack_require__(/*! ./rules_core/smartquotes */ "../../../node_modules/markdown-it/lib/rules_core/smartquotes.js")    ]
];


/**
 * new Core()
 **/
function Core() {
  /**
   * Core#ruler -> Ruler
   *
   * [[Ruler]] instance. Keep configuration of core rules.
   **/
  this.ruler = new Ruler();

  for (var i = 0; i < _rules.length; i++) {
    this.ruler.push(_rules[i][0], _rules[i][1]);
  }
}


/**
 * Core.process(state)
 *
 * Executes core chain rules.
 **/
Core.prototype.process = function (state) {
  var i, l, rules;

  rules = this.ruler.getRules('');

  for (i = 0, l = rules.length; i < l; i++) {
    rules[i](state);
  }
};

Core.prototype.State = __webpack_require__(/*! ./rules_core/state_core */ "../../../node_modules/markdown-it/lib/rules_core/state_core.js");


module.exports = Core;


/***/ }),

/***/ "../../../node_modules/markdown-it/lib/parser_inline.js":
/*!***********************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/markdown-it/lib/parser_inline.js ***!
  \***********************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/** internal
 * class ParserInline
 *
 * Tokenizes paragraph content.
 **/



var Ruler           = __webpack_require__(/*! ./ruler */ "../../../node_modules/markdown-it/lib/ruler.js");


////////////////////////////////////////////////////////////////////////////////
// Parser rules

var _rules = [
  [ 'text',            __webpack_require__(/*! ./rules_inline/text */ "../../../node_modules/markdown-it/lib/rules_inline/text.js") ],
  [ 'newline',         __webpack_require__(/*! ./rules_inline/newline */ "../../../node_modules/markdown-it/lib/rules_inline/newline.js") ],
  [ 'escape',          __webpack_require__(/*! ./rules_inline/escape */ "../../../node_modules/markdown-it/lib/rules_inline/escape.js") ],
  [ 'backticks',       __webpack_require__(/*! ./rules_inline/backticks */ "../../../node_modules/markdown-it/lib/rules_inline/backticks.js") ],
  [ 'strikethrough',   __webpack_require__(/*! ./rules_inline/strikethrough */ "../../../node_modules/markdown-it/lib/rules_inline/strikethrough.js").tokenize ],
  [ 'emphasis',        __webpack_require__(/*! ./rules_inline/emphasis */ "../../../node_modules/markdown-it/lib/rules_inline/emphasis.js").tokenize ],
  [ 'link',            __webpack_require__(/*! ./rules_inline/link */ "../../../node_modules/markdown-it/lib/rules_inline/link.js") ],
  [ 'image',           __webpack_require__(/*! ./rules_inline/image */ "../../../node_modules/markdown-it/lib/rules_inline/image.js") ],
  [ 'autolink',        __webpack_require__(/*! ./rules_inline/autolink */ "../../../node_modules/markdown-it/lib/rules_inline/autolink.js") ],
  [ 'html_inline',     __webpack_require__(/*! ./rules_inline/html_inline */ "../../../node_modules/markdown-it/lib/rules_inline/html_inline.js") ],
  [ 'entity',          __webpack_require__(/*! ./rules_inline/entity */ "../../../node_modules/markdown-it/lib/rules_inline/entity.js") ]
];

var _rules2 = [
  [ 'balance_pairs',   __webpack_require__(/*! ./rules_inline/balance_pairs */ "../../../node_modules/markdown-it/lib/rules_inline/balance_pairs.js") ],
  [ 'strikethrough',   __webpack_require__(/*! ./rules_inline/strikethrough */ "../../../node_modules/markdown-it/lib/rules_inline/strikethrough.js").postProcess ],
  [ 'emphasis',        __webpack_require__(/*! ./rules_inline/emphasis */ "../../../node_modules/markdown-it/lib/rules_inline/emphasis.js").postProcess ],
  [ 'text_collapse',   __webpack_require__(/*! ./rules_inline/text_collapse */ "../../../node_modules/markdown-it/lib/rules_inline/text_collapse.js") ]
];


/**
 * new ParserInline()
 **/
function ParserInline() {
  var i;

  /**
   * ParserInline#ruler -> Ruler
   *
   * [[Ruler]] instance. Keep configuration of inline rules.
   **/
  this.ruler = new Ruler();

  for (i = 0; i < _rules.length; i++) {
    this.ruler.push(_rules[i][0], _rules[i][1]);
  }

  /**
   * ParserInline#ruler2 -> Ruler
   *
   * [[Ruler]] instance. Second ruler used for post-processing
   * (e.g. in emphasis-like rules).
   **/
  this.ruler2 = new Ruler();

  for (i = 0; i < _rules2.length; i++) {
    this.ruler2.push(_rules2[i][0], _rules2[i][1]);
  }
}


// Skip single token by running all rules in validation mode;
// returns `true` if any rule reported success
//
ParserInline.prototype.skipToken = function (state) {
  var ok, i, pos = state.pos,
      rules = this.ruler.getRules(''),
      len = rules.length,
      maxNesting = state.md.options.maxNesting,
      cache = state.cache;


  if (typeof cache[pos] !== 'undefined') {
    state.pos = cache[pos];
    return;
  }

  if (state.level < maxNesting) {
    for (i = 0; i < len; i++) {
      // Increment state.level and decrement it later to limit recursion.
      // It's harmless to do here, because no tokens are created. But ideally,
      // we'd need a separate private state variable for this purpose.
      //
      state.level++;
      ok = rules[i](state, true);
      state.level--;

      if (ok) { break; }
    }
  } else {
    // Too much nesting, just skip until the end of the paragraph.
    //
    // NOTE: this will cause links to behave incorrectly in the following case,
    //       when an amount of `[` is exactly equal to `maxNesting + 1`:
    //
    //       [[[[[[[[[[[[[[[[[[[[[foo]()
    //
    // TODO: remove this workaround when CM standard will allow nested links
    //       (we can replace it by preventing links from being parsed in
    //       validation mode)
    //
    state.pos = state.posMax;
  }

  if (!ok) { state.pos++; }
  cache[pos] = state.pos;
};


// Generate tokens for input range
//
ParserInline.prototype.tokenize = function (state) {
  var ok, i,
      rules = this.ruler.getRules(''),
      len = rules.length,
      end = state.posMax,
      maxNesting = state.md.options.maxNesting;

  while (state.pos < end) {
    // Try all possible rules.
    // On success, rule should:
    //
    // - update `state.pos`
    // - update `state.tokens`
    // - return true

    if (state.level < maxNesting) {
      for (i = 0; i < len; i++) {
        ok = rules[i](state, false);
        if (ok) { break; }
      }
    }

    if (ok) {
      if (state.pos >= end) { break; }
      continue;
    }

    state.pending += state.src[state.pos++];
  }

  if (state.pending) {
    state.pushPending();
  }
};


/**
 * ParserInline.parse(str, md, env, outTokens)
 *
 * Process input string and push inline tokens into `outTokens`
 **/
ParserInline.prototype.parse = function (str, md, env, outTokens) {
  var i, rules, len;
  var state = new this.State(str, md, env, outTokens);

  this.tokenize(state);

  rules = this.ruler2.getRules('');
  len = rules.length;

  for (i = 0; i < len; i++) {
    rules[i](state);
  }
};


ParserInline.prototype.State = __webpack_require__(/*! ./rules_inline/state_inline */ "../../../node_modules/markdown-it/lib/rules_inline/state_inline.js");


module.exports = ParserInline;


/***/ }),

/***/ "../../../node_modules/markdown-it/lib/presets/commonmark.js":
/*!****************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/markdown-it/lib/presets/commonmark.js ***!
  \****************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Commonmark default options




module.exports = {
  options: {
    html:         true,         // Enable HTML tags in source
    xhtmlOut:     true,         // Use '/' to close single tags (<br />)
    breaks:       false,        // Convert '\n' in paragraphs into <br>
    langPrefix:   'language-',  // CSS language prefix for fenced blocks
    linkify:      false,        // autoconvert URL-like texts to links

    // Enable some language-neutral replacements + quotes beautification
    typographer:  false,

    // Double + single quotes replacement pairs, when typographer enabled,
    // and smartquotes on. Could be either a String or an Array.
    //
    // For example, you can use '«»„“' for Russian, '„“‚‘' for German,
    // and ['«\xA0', '\xA0»', '‹\xA0', '\xA0›'] for French (including nbsp).
    quotes: '\u201c\u201d\u2018\u2019', /* “”‘’ */

    // Highlighter function. Should return escaped HTML,
    // or '' if the source string is not changed and should be escaped externaly.
    // If result starts with <pre... internal wrapper is skipped.
    //
    // function (/*str, lang*/) { return ''; }
    //
    highlight: null,

    maxNesting:   20            // Internal protection, recursion limit
  },

  components: {

    core: {
      rules: [
        'normalize',
        'block',
        'inline'
      ]
    },

    block: {
      rules: [
        'blockquote',
        'code',
        'fence',
        'heading',
        'hr',
        'html_block',
        'lheading',
        'list',
        'reference',
        'paragraph'
      ]
    },

    inline: {
      rules: [
        'autolink',
        'backticks',
        'emphasis',
        'entity',
        'escape',
        'html_inline',
        'image',
        'link',
        'newline',
        'text'
      ],
      rules2: [
        'balance_pairs',
        'emphasis',
        'text_collapse'
      ]
    }
  }
};


/***/ }),

/***/ "../../../node_modules/markdown-it/lib/presets/default.js":
/*!*************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/markdown-it/lib/presets/default.js ***!
  \*************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// markdown-it default options




module.exports = {
  options: {
    html:         false,        // Enable HTML tags in source
    xhtmlOut:     false,        // Use '/' to close single tags (<br />)
    breaks:       false,        // Convert '\n' in paragraphs into <br>
    langPrefix:   'language-',  // CSS language prefix for fenced blocks
    linkify:      false,        // autoconvert URL-like texts to links

    // Enable some language-neutral replacements + quotes beautification
    typographer:  false,

    // Double + single quotes replacement pairs, when typographer enabled,
    // and smartquotes on. Could be either a String or an Array.
    //
    // For example, you can use '«»„“' for Russian, '„“‚‘' for German,
    // and ['«\xA0', '\xA0»', '‹\xA0', '\xA0›'] for French (including nbsp).
    quotes: '\u201c\u201d\u2018\u2019', /* “”‘’ */

    // Highlighter function. Should return escaped HTML,
    // or '' if the source string is not changed and should be escaped externaly.
    // If result starts with <pre... internal wrapper is skipped.
    //
    // function (/*str, lang*/) { return ''; }
    //
    highlight: null,

    maxNesting:   100            // Internal protection, recursion limit
  },

  components: {

    core: {},
    block: {},
    inline: {}
  }
};


/***/ }),

/***/ "../../../node_modules/markdown-it/lib/presets/zero.js":
/*!**********************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/markdown-it/lib/presets/zero.js ***!
  \**********************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// "Zero" preset, with nothing enabled. Useful for manual configuring of simple
// modes. For example, to parse bold/italic only.




module.exports = {
  options: {
    html:         false,        // Enable HTML tags in source
    xhtmlOut:     false,        // Use '/' to close single tags (<br />)
    breaks:       false,        // Convert '\n' in paragraphs into <br>
    langPrefix:   'language-',  // CSS language prefix for fenced blocks
    linkify:      false,        // autoconvert URL-like texts to links

    // Enable some language-neutral replacements + quotes beautification
    typographer:  false,

    // Double + single quotes replacement pairs, when typographer enabled,
    // and smartquotes on. Could be either a String or an Array.
    //
    // For example, you can use '«»„“' for Russian, '„“‚‘' for German,
    // and ['«\xA0', '\xA0»', '‹\xA0', '\xA0›'] for French (including nbsp).
    quotes: '\u201c\u201d\u2018\u2019', /* “”‘’ */

    // Highlighter function. Should return escaped HTML,
    // or '' if the source string is not changed and should be escaped externaly.
    // If result starts with <pre... internal wrapper is skipped.
    //
    // function (/*str, lang*/) { return ''; }
    //
    highlight: null,

    maxNesting:   20            // Internal protection, recursion limit
  },

  components: {

    core: {
      rules: [
        'normalize',
        'block',
        'inline'
      ]
    },

    block: {
      rules: [
        'paragraph'
      ]
    },

    inline: {
      rules: [
        'text'
      ],
      rules2: [
        'balance_pairs',
        'text_collapse'
      ]
    }
  }
};


/***/ }),

/***/ "../../../node_modules/markdown-it/lib/renderer.js":
/*!******************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/markdown-it/lib/renderer.js ***!
  \******************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * class Renderer
 *
 * Generates HTML from parsed token stream. Each instance has independent
 * copy of rules. Those can be rewritten with ease. Also, you can add new
 * rules if you create plugin and adds new token types.
 **/



var assign          = __webpack_require__(/*! ./common/utils */ "../../../node_modules/markdown-it/lib/common/utils.js").assign;
var unescapeAll     = __webpack_require__(/*! ./common/utils */ "../../../node_modules/markdown-it/lib/common/utils.js").unescapeAll;
var escapeHtml      = __webpack_require__(/*! ./common/utils */ "../../../node_modules/markdown-it/lib/common/utils.js").escapeHtml;


////////////////////////////////////////////////////////////////////////////////

var default_rules = {};


default_rules.code_inline = function (tokens, idx, options, env, slf) {
  var token = tokens[idx];

  return  '<code' + slf.renderAttrs(token) + '>' +
          escapeHtml(tokens[idx].content) +
          '</code>';
};


default_rules.code_block = function (tokens, idx, options, env, slf) {
  var token = tokens[idx];

  return  '<pre' + slf.renderAttrs(token) + '><code>' +
          escapeHtml(tokens[idx].content) +
          '</code></pre>\n';
};


default_rules.fence = function (tokens, idx, options, env, slf) {
  var token = tokens[idx],
      info = token.info ? unescapeAll(token.info).trim() : '',
      langName = '',
      highlighted, i, tmpAttrs, tmpToken;

  if (info) {
    langName = info.split(/\s+/g)[0];
  }

  if (options.highlight) {
    highlighted = options.highlight(token.content, langName) || escapeHtml(token.content);
  } else {
    highlighted = escapeHtml(token.content);
  }

  if (highlighted.indexOf('<pre') === 0) {
    return highlighted + '\n';
  }

  // If language exists, inject class gently, without modifying original token.
  // May be, one day we will add .clone() for token and simplify this part, but
  // now we prefer to keep things local.
  if (info) {
    i        = token.attrIndex('class');
    tmpAttrs = token.attrs ? token.attrs.slice() : [];

    if (i < 0) {
      tmpAttrs.push([ 'class', options.langPrefix + langName ]);
    } else {
      tmpAttrs[i][1] += ' ' + options.langPrefix + langName;
    }

    // Fake token just to render attributes
    tmpToken = {
      attrs: tmpAttrs
    };

    return  '<pre><code' + slf.renderAttrs(tmpToken) + '>'
          + highlighted
          + '</code></pre>\n';
  }


  return  '<pre><code' + slf.renderAttrs(token) + '>'
        + highlighted
        + '</code></pre>\n';
};


default_rules.image = function (tokens, idx, options, env, slf) {
  var token = tokens[idx];

  // "alt" attr MUST be set, even if empty. Because it's mandatory and
  // should be placed on proper position for tests.
  //
  // Replace content with actual value

  token.attrs[token.attrIndex('alt')][1] =
    slf.renderInlineAsText(token.children, options, env);

  return slf.renderToken(tokens, idx, options);
};


default_rules.hardbreak = function (tokens, idx, options /*, env */) {
  return options.xhtmlOut ? '<br />\n' : '<br>\n';
};
default_rules.softbreak = function (tokens, idx, options /*, env */) {
  return options.breaks ? (options.xhtmlOut ? '<br />\n' : '<br>\n') : '\n';
};


default_rules.text = function (tokens, idx /*, options, env */) {
  return escapeHtml(tokens[idx].content);
};


default_rules.html_block = function (tokens, idx /*, options, env */) {
  return tokens[idx].content;
};
default_rules.html_inline = function (tokens, idx /*, options, env */) {
  return tokens[idx].content;
};


/**
 * new Renderer()
 *
 * Creates new [[Renderer]] instance and fill [[Renderer#rules]] with defaults.
 **/
function Renderer() {

  /**
   * Renderer#rules -> Object
   *
   * Contains render rules for tokens. Can be updated and extended.
   *
   * ##### Example
   *
   * ```javascript
   * var md = require('markdown-it')();
   *
   * md.renderer.rules.strong_open  = function () { return '<b>'; };
   * md.renderer.rules.strong_close = function () { return '</b>'; };
   *
   * var result = md.renderInline(...);
   * ```
   *
   * Each rule is called as independent static function with fixed signature:
   *
   * ```javascript
   * function my_token_render(tokens, idx, options, env, renderer) {
   *   // ...
   *   return renderedHTML;
   * }
   * ```
   *
   * See [source code](https://github.com/markdown-it/markdown-it/blob/master/lib/renderer.js)
   * for more details and examples.
   **/
  this.rules = assign({}, default_rules);
}


/**
 * Renderer.renderAttrs(token) -> String
 *
 * Render token attributes to string.
 **/
Renderer.prototype.renderAttrs = function renderAttrs(token) {
  var i, l, result;

  if (!token.attrs) { return ''; }

  result = '';

  for (i = 0, l = token.attrs.length; i < l; i++) {
    result += ' ' + escapeHtml(token.attrs[i][0]) + '="' + escapeHtml(token.attrs[i][1]) + '"';
  }

  return result;
};


/**
 * Renderer.renderToken(tokens, idx, options) -> String
 * - tokens (Array): list of tokens
 * - idx (Numbed): token index to render
 * - options (Object): params of parser instance
 *
 * Default token renderer. Can be overriden by custom function
 * in [[Renderer#rules]].
 **/
Renderer.prototype.renderToken = function renderToken(tokens, idx, options) {
  var nextToken,
      result = '',
      needLf = false,
      token = tokens[idx];

  // Tight list paragraphs
  if (token.hidden) {
    return '';
  }

  // Insert a newline between hidden paragraph and subsequent opening
  // block-level tag.
  //
  // For example, here we should insert a newline before blockquote:
  //  - a
  //    >
  //
  if (token.block && token.nesting !== -1 && idx && tokens[idx - 1].hidden) {
    result += '\n';
  }

  // Add token name, e.g. `<img`
  result += (token.nesting === -1 ? '</' : '<') + token.tag;

  // Encode attributes, e.g. `<img src="foo"`
  result += this.renderAttrs(token);

  // Add a slash for self-closing tags, e.g. `<img src="foo" /`
  if (token.nesting === 0 && options.xhtmlOut) {
    result += ' /';
  }

  // Check if we need to add a newline after this tag
  if (token.block) {
    needLf = true;

    if (token.nesting === 1) {
      if (idx + 1 < tokens.length) {
        nextToken = tokens[idx + 1];

        if (nextToken.type === 'inline' || nextToken.hidden) {
          // Block-level tag containing an inline tag.
          //
          needLf = false;

        } else if (nextToken.nesting === -1 && nextToken.tag === token.tag) {
          // Opening tag + closing tag of the same type. E.g. `<li></li>`.
          //
          needLf = false;
        }
      }
    }
  }

  result += needLf ? '>\n' : '>';

  return result;
};


/**
 * Renderer.renderInline(tokens, options, env) -> String
 * - tokens (Array): list on block tokens to renter
 * - options (Object): params of parser instance
 * - env (Object): additional data from parsed input (references, for example)
 *
 * The same as [[Renderer.render]], but for single token of `inline` type.
 **/
Renderer.prototype.renderInline = function (tokens, options, env) {
  var type,
      result = '',
      rules = this.rules;

  for (var i = 0, len = tokens.length; i < len; i++) {
    type = tokens[i].type;

    if (typeof rules[type] !== 'undefined') {
      result += rules[type](tokens, i, options, env, this);
    } else {
      result += this.renderToken(tokens, i, options);
    }
  }

  return result;
};


/** internal
 * Renderer.renderInlineAsText(tokens, options, env) -> String
 * - tokens (Array): list on block tokens to renter
 * - options (Object): params of parser instance
 * - env (Object): additional data from parsed input (references, for example)
 *
 * Special kludge for image `alt` attributes to conform CommonMark spec.
 * Don't try to use it! Spec requires to show `alt` content with stripped markup,
 * instead of simple escaping.
 **/
Renderer.prototype.renderInlineAsText = function (tokens, options, env) {
  var result = '';

  for (var i = 0, len = tokens.length; i < len; i++) {
    if (tokens[i].type === 'text') {
      result += tokens[i].content;
    } else if (tokens[i].type === 'image') {
      result += this.renderInlineAsText(tokens[i].children, options, env);
    }
  }

  return result;
};


/**
 * Renderer.render(tokens, options, env) -> String
 * - tokens (Array): list on block tokens to renter
 * - options (Object): params of parser instance
 * - env (Object): additional data from parsed input (references, for example)
 *
 * Takes token stream and generates HTML. Probably, you will never need to call
 * this method directly.
 **/
Renderer.prototype.render = function (tokens, options, env) {
  var i, len, type,
      result = '',
      rules = this.rules;

  for (i = 0, len = tokens.length; i < len; i++) {
    type = tokens[i].type;

    if (type === 'inline') {
      result += this.renderInline(tokens[i].children, options, env);
    } else if (typeof rules[type] !== 'undefined') {
      result += rules[tokens[i].type](tokens, i, options, env, this);
    } else {
      result += this.renderToken(tokens, i, options, env);
    }
  }

  return result;
};

module.exports = Renderer;


/***/ }),

/***/ "../../../node_modules/markdown-it/lib/ruler.js":
/*!***************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/markdown-it/lib/ruler.js ***!
  \***************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * class Ruler
 *
 * Helper class, used by [[MarkdownIt#core]], [[MarkdownIt#block]] and
 * [[MarkdownIt#inline]] to manage sequences of functions (rules):
 *
 * - keep rules in defined order
 * - assign the name to each rule
 * - enable/disable rules
 * - add/replace rules
 * - allow assign rules to additional named chains (in the same)
 * - cacheing lists of active rules
 *
 * You will not need use this class directly until write plugins. For simple
 * rules control use [[MarkdownIt.disable]], [[MarkdownIt.enable]] and
 * [[MarkdownIt.use]].
 **/



/**
 * new Ruler()
 **/
function Ruler() {
  // List of added rules. Each element is:
  //
  // {
  //   name: XXX,
  //   enabled: Boolean,
  //   fn: Function(),
  //   alt: [ name2, name3 ]
  // }
  //
  this.__rules__ = [];

  // Cached rule chains.
  //
  // First level - chain name, '' for default.
  // Second level - diginal anchor for fast filtering by charcodes.
  //
  this.__cache__ = null;
}

////////////////////////////////////////////////////////////////////////////////
// Helper methods, should not be used directly


// Find rule index by name
//
Ruler.prototype.__find__ = function (name) {
  for (var i = 0; i < this.__rules__.length; i++) {
    if (this.__rules__[i].name === name) {
      return i;
    }
  }
  return -1;
};


// Build rules lookup cache
//
Ruler.prototype.__compile__ = function () {
  var self = this;
  var chains = [ '' ];

  // collect unique names
  self.__rules__.forEach(function (rule) {
    if (!rule.enabled) { return; }

    rule.alt.forEach(function (altName) {
      if (chains.indexOf(altName) < 0) {
        chains.push(altName);
      }
    });
  });

  self.__cache__ = {};

  chains.forEach(function (chain) {
    self.__cache__[chain] = [];
    self.__rules__.forEach(function (rule) {
      if (!rule.enabled) { return; }

      if (chain && rule.alt.indexOf(chain) < 0) { return; }

      self.__cache__[chain].push(rule.fn);
    });
  });
};


/**
 * Ruler.at(name, fn [, options])
 * - name (String): rule name to replace.
 * - fn (Function): new rule function.
 * - options (Object): new rule options (not mandatory).
 *
 * Replace rule by name with new function & options. Throws error if name not
 * found.
 *
 * ##### Options:
 *
 * - __alt__ - array with names of "alternate" chains.
 *
 * ##### Example
 *
 * Replace existing typorgapher replacement rule with new one:
 *
 * ```javascript
 * var md = require('markdown-it')();
 *
 * md.core.ruler.at('replacements', function replace(state) {
 *   //...
 * });
 * ```
 **/
Ruler.prototype.at = function (name, fn, options) {
  var index = this.__find__(name);
  var opt = options || {};

  if (index === -1) { throw new Error('Parser rule not found: ' + name); }

  this.__rules__[index].fn = fn;
  this.__rules__[index].alt = opt.alt || [];
  this.__cache__ = null;
};


/**
 * Ruler.before(beforeName, ruleName, fn [, options])
 * - beforeName (String): new rule will be added before this one.
 * - ruleName (String): name of added rule.
 * - fn (Function): rule function.
 * - options (Object): rule options (not mandatory).
 *
 * Add new rule to chain before one with given name. See also
 * [[Ruler.after]], [[Ruler.push]].
 *
 * ##### Options:
 *
 * - __alt__ - array with names of "alternate" chains.
 *
 * ##### Example
 *
 * ```javascript
 * var md = require('markdown-it')();
 *
 * md.block.ruler.before('paragraph', 'my_rule', function replace(state) {
 *   //...
 * });
 * ```
 **/
Ruler.prototype.before = function (beforeName, ruleName, fn, options) {
  var index = this.__find__(beforeName);
  var opt = options || {};

  if (index === -1) { throw new Error('Parser rule not found: ' + beforeName); }

  this.__rules__.splice(index, 0, {
    name: ruleName,
    enabled: true,
    fn: fn,
    alt: opt.alt || []
  });

  this.__cache__ = null;
};


/**
 * Ruler.after(afterName, ruleName, fn [, options])
 * - afterName (String): new rule will be added after this one.
 * - ruleName (String): name of added rule.
 * - fn (Function): rule function.
 * - options (Object): rule options (not mandatory).
 *
 * Add new rule to chain after one with given name. See also
 * [[Ruler.before]], [[Ruler.push]].
 *
 * ##### Options:
 *
 * - __alt__ - array with names of "alternate" chains.
 *
 * ##### Example
 *
 * ```javascript
 * var md = require('markdown-it')();
 *
 * md.inline.ruler.after('text', 'my_rule', function replace(state) {
 *   //...
 * });
 * ```
 **/
Ruler.prototype.after = function (afterName, ruleName, fn, options) {
  var index = this.__find__(afterName);
  var opt = options || {};

  if (index === -1) { throw new Error('Parser rule not found: ' + afterName); }

  this.__rules__.splice(index + 1, 0, {
    name: ruleName,
    enabled: true,
    fn: fn,
    alt: opt.alt || []
  });

  this.__cache__ = null;
};

/**
 * Ruler.push(ruleName, fn [, options])
 * - ruleName (String): name of added rule.
 * - fn (Function): rule function.
 * - options (Object): rule options (not mandatory).
 *
 * Push new rule to the end of chain. See also
 * [[Ruler.before]], [[Ruler.after]].
 *
 * ##### Options:
 *
 * - __alt__ - array with names of "alternate" chains.
 *
 * ##### Example
 *
 * ```javascript
 * var md = require('markdown-it')();
 *
 * md.core.ruler.push('my_rule', function replace(state) {
 *   //...
 * });
 * ```
 **/
Ruler.prototype.push = function (ruleName, fn, options) {
  var opt = options || {};

  this.__rules__.push({
    name: ruleName,
    enabled: true,
    fn: fn,
    alt: opt.alt || []
  });

  this.__cache__ = null;
};


/**
 * Ruler.enable(list [, ignoreInvalid]) -> Array
 * - list (String|Array): list of rule names to enable.
 * - ignoreInvalid (Boolean): set `true` to ignore errors when rule not found.
 *
 * Enable rules with given names. If any rule name not found - throw Error.
 * Errors can be disabled by second param.
 *
 * Returns list of found rule names (if no exception happened).
 *
 * See also [[Ruler.disable]], [[Ruler.enableOnly]].
 **/
Ruler.prototype.enable = function (list, ignoreInvalid) {
  if (!Array.isArray(list)) { list = [ list ]; }

  var result = [];

  // Search by name and enable
  list.forEach(function (name) {
    var idx = this.__find__(name);

    if (idx < 0) {
      if (ignoreInvalid) { return; }
      throw new Error('Rules manager: invalid rule name ' + name);
    }
    this.__rules__[idx].enabled = true;
    result.push(name);
  }, this);

  this.__cache__ = null;
  return result;
};


/**
 * Ruler.enableOnly(list [, ignoreInvalid])
 * - list (String|Array): list of rule names to enable (whitelist).
 * - ignoreInvalid (Boolean): set `true` to ignore errors when rule not found.
 *
 * Enable rules with given names, and disable everything else. If any rule name
 * not found - throw Error. Errors can be disabled by second param.
 *
 * See also [[Ruler.disable]], [[Ruler.enable]].
 **/
Ruler.prototype.enableOnly = function (list, ignoreInvalid) {
  if (!Array.isArray(list)) { list = [ list ]; }

  this.__rules__.forEach(function (rule) { rule.enabled = false; });

  this.enable(list, ignoreInvalid);
};


/**
 * Ruler.disable(list [, ignoreInvalid]) -> Array
 * - list (String|Array): list of rule names to disable.
 * - ignoreInvalid (Boolean): set `true` to ignore errors when rule not found.
 *
 * Disable rules with given names. If any rule name not found - throw Error.
 * Errors can be disabled by second param.
 *
 * Returns list of found rule names (if no exception happened).
 *
 * See also [[Ruler.enable]], [[Ruler.enableOnly]].
 **/
Ruler.prototype.disable = function (list, ignoreInvalid) {
  if (!Array.isArray(list)) { list = [ list ]; }

  var result = [];

  // Search by name and disable
  list.forEach(function (name) {
    var idx = this.__find__(name);

    if (idx < 0) {
      if (ignoreInvalid) { return; }
      throw new Error('Rules manager: invalid rule name ' + name);
    }
    this.__rules__[idx].enabled = false;
    result.push(name);
  }, this);

  this.__cache__ = null;
  return result;
};


/**
 * Ruler.getRules(chainName) -> Array
 *
 * Return array of active functions (rules) for given chain name. It analyzes
 * rules configuration, compiles caches if not exists and returns result.
 *
 * Default chain name is `''` (empty string). It can't be skipped. That's
 * done intentionally, to keep signature monomorphic for high speed.
 **/
Ruler.prototype.getRules = function (chainName) {
  if (this.__cache__ === null) {
    this.__compile__();
  }

  // Chain can be empty, if rules disabled. But we still have to return Array.
  return this.__cache__[chainName] || [];
};

module.exports = Ruler;


/***/ }),

/***/ "../../../node_modules/markdown-it/lib/rules_block/blockquote.js":
/*!********************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/markdown-it/lib/rules_block/blockquote.js ***!
  \********************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Block quotes



var isSpace = __webpack_require__(/*! ../common/utils */ "../../../node_modules/markdown-it/lib/common/utils.js").isSpace;


module.exports = function blockquote(state, startLine, endLine, silent) {
  var adjustTab,
      ch,
      i,
      initial,
      l,
      lastLineEmpty,
      lines,
      nextLine,
      offset,
      oldBMarks,
      oldBSCount,
      oldIndent,
      oldParentType,
      oldSCount,
      oldTShift,
      spaceAfterMarker,
      terminate,
      terminatorRules,
      token,
      wasOutdented,
      oldLineMax = state.lineMax,
      pos = state.bMarks[startLine] + state.tShift[startLine],
      max = state.eMarks[startLine];

  // if it's indented more than 3 spaces, it should be a code block
  if (state.sCount[startLine] - state.blkIndent >= 4) { return false; }

  // check the block quote marker
  if (state.src.charCodeAt(pos++) !== 0x3E/* > */) { return false; }

  // we know that it's going to be a valid blockquote,
  // so no point trying to find the end of it in silent mode
  if (silent) { return true; }

  // skip spaces after ">" and re-calculate offset
  initial = offset = state.sCount[startLine] + pos - (state.bMarks[startLine] + state.tShift[startLine]);

  // skip one optional space after '>'
  if (state.src.charCodeAt(pos) === 0x20 /* space */) {
    // ' >   test '
    //     ^ -- position start of line here:
    pos++;
    initial++;
    offset++;
    adjustTab = false;
    spaceAfterMarker = true;
  } else if (state.src.charCodeAt(pos) === 0x09 /* tab */) {
    spaceAfterMarker = true;

    if ((state.bsCount[startLine] + offset) % 4 === 3) {
      // '  >\t  test '
      //       ^ -- position start of line here (tab has width===1)
      pos++;
      initial++;
      offset++;
      adjustTab = false;
    } else {
      // ' >\t  test '
      //    ^ -- position start of line here + shift bsCount slightly
      //         to make extra space appear
      adjustTab = true;
    }
  } else {
    spaceAfterMarker = false;
  }

  oldBMarks = [ state.bMarks[startLine] ];
  state.bMarks[startLine] = pos;

  while (pos < max) {
    ch = state.src.charCodeAt(pos);

    if (isSpace(ch)) {
      if (ch === 0x09) {
        offset += 4 - (offset + state.bsCount[startLine] + (adjustTab ? 1 : 0)) % 4;
      } else {
        offset++;
      }
    } else {
      break;
    }

    pos++;
  }

  oldBSCount = [ state.bsCount[startLine] ];
  state.bsCount[startLine] = state.sCount[startLine] + 1 + (spaceAfterMarker ? 1 : 0);

  lastLineEmpty = pos >= max;

  oldSCount = [ state.sCount[startLine] ];
  state.sCount[startLine] = offset - initial;

  oldTShift = [ state.tShift[startLine] ];
  state.tShift[startLine] = pos - state.bMarks[startLine];

  terminatorRules = state.md.block.ruler.getRules('blockquote');

  oldParentType = state.parentType;
  state.parentType = 'blockquote';
  wasOutdented = false;

  // Search the end of the block
  //
  // Block ends with either:
  //  1. an empty line outside:
  //     ```
  //     > test
  //
  //     ```
  //  2. an empty line inside:
  //     ```
  //     >
  //     test
  //     ```
  //  3. another tag:
  //     ```
  //     > test
  //      - - -
  //     ```
  for (nextLine = startLine + 1; nextLine < endLine; nextLine++) {
    // check if it's outdented, i.e. it's inside list item and indented
    // less than said list item:
    //
    // ```
    // 1. anything
    //    > current blockquote
    // 2. checking this line
    // ```
    if (state.sCount[nextLine] < state.blkIndent) wasOutdented = true;

    pos = state.bMarks[nextLine] + state.tShift[nextLine];
    max = state.eMarks[nextLine];

    if (pos >= max) {
      // Case 1: line is not inside the blockquote, and this line is empty.
      break;
    }

    if (state.src.charCodeAt(pos++) === 0x3E/* > */ && !wasOutdented) {
      // This line is inside the blockquote.

      // skip spaces after ">" and re-calculate offset
      initial = offset = state.sCount[nextLine] + pos - (state.bMarks[nextLine] + state.tShift[nextLine]);

      // skip one optional space after '>'
      if (state.src.charCodeAt(pos) === 0x20 /* space */) {
        // ' >   test '
        //     ^ -- position start of line here:
        pos++;
        initial++;
        offset++;
        adjustTab = false;
        spaceAfterMarker = true;
      } else if (state.src.charCodeAt(pos) === 0x09 /* tab */) {
        spaceAfterMarker = true;

        if ((state.bsCount[nextLine] + offset) % 4 === 3) {
          // '  >\t  test '
          //       ^ -- position start of line here (tab has width===1)
          pos++;
          initial++;
          offset++;
          adjustTab = false;
        } else {
          // ' >\t  test '
          //    ^ -- position start of line here + shift bsCount slightly
          //         to make extra space appear
          adjustTab = true;
        }
      } else {
        spaceAfterMarker = false;
      }

      oldBMarks.push(state.bMarks[nextLine]);
      state.bMarks[nextLine] = pos;

      while (pos < max) {
        ch = state.src.charCodeAt(pos);

        if (isSpace(ch)) {
          if (ch === 0x09) {
            offset += 4 - (offset + state.bsCount[nextLine] + (adjustTab ? 1 : 0)) % 4;
          } else {
            offset++;
          }
        } else {
          break;
        }

        pos++;
      }

      lastLineEmpty = pos >= max;

      oldBSCount.push(state.bsCount[nextLine]);
      state.bsCount[nextLine] = state.sCount[nextLine] + 1 + (spaceAfterMarker ? 1 : 0);

      oldSCount.push(state.sCount[nextLine]);
      state.sCount[nextLine] = offset - initial;

      oldTShift.push(state.tShift[nextLine]);
      state.tShift[nextLine] = pos - state.bMarks[nextLine];
      continue;
    }

    // Case 2: line is not inside the blockquote, and the last line was empty.
    if (lastLineEmpty) { break; }

    // Case 3: another tag found.
    terminate = false;
    for (i = 0, l = terminatorRules.length; i < l; i++) {
      if (terminatorRules[i](state, nextLine, endLine, true)) {
        terminate = true;
        break;
      }
    }

    if (terminate) {
      // Quirk to enforce "hard termination mode" for paragraphs;
      // normally if you call `tokenize(state, startLine, nextLine)`,
      // paragraphs will look below nextLine for paragraph continuation,
      // but if blockquote is terminated by another tag, they shouldn't
      state.lineMax = nextLine;

      if (state.blkIndent !== 0) {
        // state.blkIndent was non-zero, we now set it to zero,
        // so we need to re-calculate all offsets to appear as
        // if indent wasn't changed
        oldBMarks.push(state.bMarks[nextLine]);
        oldBSCount.push(state.bsCount[nextLine]);
        oldTShift.push(state.tShift[nextLine]);
        oldSCount.push(state.sCount[nextLine]);
        state.sCount[nextLine] -= state.blkIndent;
      }

      break;
    }

    oldBMarks.push(state.bMarks[nextLine]);
    oldBSCount.push(state.bsCount[nextLine]);
    oldTShift.push(state.tShift[nextLine]);
    oldSCount.push(state.sCount[nextLine]);

    // A negative indentation means that this is a paragraph continuation
    //
    state.sCount[nextLine] = -1;
  }

  oldIndent = state.blkIndent;
  state.blkIndent = 0;

  token        = state.push('blockquote_open', 'blockquote', 1);
  token.markup = '>';
  token.map    = lines = [ startLine, 0 ];

  state.md.block.tokenize(state, startLine, nextLine);

  token        = state.push('blockquote_close', 'blockquote', -1);
  token.markup = '>';

  state.lineMax = oldLineMax;
  state.parentType = oldParentType;
  lines[1] = state.line;

  // Restore original tShift; this might not be necessary since the parser
  // has already been here, but just to make sure we can do that.
  for (i = 0; i < oldTShift.length; i++) {
    state.bMarks[i + startLine] = oldBMarks[i];
    state.tShift[i + startLine] = oldTShift[i];
    state.sCount[i + startLine] = oldSCount[i];
    state.bsCount[i + startLine] = oldBSCount[i];
  }
  state.blkIndent = oldIndent;

  return true;
};


/***/ }),

/***/ "../../../node_modules/markdown-it/lib/rules_block/code.js":
/*!**************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/markdown-it/lib/rules_block/code.js ***!
  \**************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Code block (4 spaces padded)




module.exports = function code(state, startLine, endLine/*, silent*/) {
  var nextLine, last, token;

  if (state.sCount[startLine] - state.blkIndent < 4) { return false; }

  last = nextLine = startLine + 1;

  while (nextLine < endLine) {
    if (state.isEmpty(nextLine)) {
      nextLine++;
      continue;
    }

    if (state.sCount[nextLine] - state.blkIndent >= 4) {
      nextLine++;
      last = nextLine;
      continue;
    }
    break;
  }

  state.line = last;

  token         = state.push('code_block', 'code', 0);
  token.content = state.getLines(startLine, last, 4 + state.blkIndent, true);
  token.map     = [ startLine, state.line ];

  return true;
};


/***/ }),

/***/ "../../../node_modules/markdown-it/lib/rules_block/fence.js":
/*!***************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/markdown-it/lib/rules_block/fence.js ***!
  \***************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// fences (``` lang, ~~~ lang)




module.exports = function fence(state, startLine, endLine, silent) {
  var marker, len, params, nextLine, mem, token, markup,
      haveEndMarker = false,
      pos = state.bMarks[startLine] + state.tShift[startLine],
      max = state.eMarks[startLine];

  // if it's indented more than 3 spaces, it should be a code block
  if (state.sCount[startLine] - state.blkIndent >= 4) { return false; }

  if (pos + 3 > max) { return false; }

  marker = state.src.charCodeAt(pos);

  if (marker !== 0x7E/* ~ */ && marker !== 0x60 /* ` */) {
    return false;
  }

  // scan marker length
  mem = pos;
  pos = state.skipChars(pos, marker);

  len = pos - mem;

  if (len < 3) { return false; }

  markup = state.src.slice(mem, pos);
  params = state.src.slice(pos, max);

  if (params.indexOf(String.fromCharCode(marker)) >= 0) { return false; }

  // Since start is found, we can report success here in validation mode
  if (silent) { return true; }

  // search end of block
  nextLine = startLine;

  for (;;) {
    nextLine++;
    if (nextLine >= endLine) {
      // unclosed block should be autoclosed by end of document.
      // also block seems to be autoclosed by end of parent
      break;
    }

    pos = mem = state.bMarks[nextLine] + state.tShift[nextLine];
    max = state.eMarks[nextLine];

    if (pos < max && state.sCount[nextLine] < state.blkIndent) {
      // non-empty line with negative indent should stop the list:
      // - ```
      //  test
      break;
    }

    if (state.src.charCodeAt(pos) !== marker) { continue; }

    if (state.sCount[nextLine] - state.blkIndent >= 4) {
      // closing fence should be indented less than 4 spaces
      continue;
    }

    pos = state.skipChars(pos, marker);

    // closing code fence must be at least as long as the opening one
    if (pos - mem < len) { continue; }

    // make sure tail has spaces only
    pos = state.skipSpaces(pos);

    if (pos < max) { continue; }

    haveEndMarker = true;
    // found!
    break;
  }

  // If a fence has heading spaces, they should be removed from its inner block
  len = state.sCount[startLine];

  state.line = nextLine + (haveEndMarker ? 1 : 0);

  token         = state.push('fence', 'code', 0);
  token.info    = params;
  token.content = state.getLines(startLine + 1, nextLine, len, true);
  token.markup  = markup;
  token.map     = [ startLine, state.line ];

  return true;
};


/***/ }),

/***/ "../../../node_modules/markdown-it/lib/rules_block/heading.js":
/*!*****************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/markdown-it/lib/rules_block/heading.js ***!
  \*****************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// heading (#, ##, ...)



var isSpace = __webpack_require__(/*! ../common/utils */ "../../../node_modules/markdown-it/lib/common/utils.js").isSpace;


module.exports = function heading(state, startLine, endLine, silent) {
  var ch, level, tmp, token,
      pos = state.bMarks[startLine] + state.tShift[startLine],
      max = state.eMarks[startLine];

  // if it's indented more than 3 spaces, it should be a code block
  if (state.sCount[startLine] - state.blkIndent >= 4) { return false; }

  ch  = state.src.charCodeAt(pos);

  if (ch !== 0x23/* # */ || pos >= max) { return false; }

  // count heading level
  level = 1;
  ch = state.src.charCodeAt(++pos);
  while (ch === 0x23/* # */ && pos < max && level <= 6) {
    level++;
    ch = state.src.charCodeAt(++pos);
  }

  if (level > 6 || (pos < max && !isSpace(ch))) { return false; }

  if (silent) { return true; }

  // Let's cut tails like '    ###  ' from the end of string

  max = state.skipSpacesBack(max, pos);
  tmp = state.skipCharsBack(max, 0x23, pos); // #
  if (tmp > pos && isSpace(state.src.charCodeAt(tmp - 1))) {
    max = tmp;
  }

  state.line = startLine + 1;

  token        = state.push('heading_open', 'h' + String(level), 1);
  token.markup = '########'.slice(0, level);
  token.map    = [ startLine, state.line ];

  token          = state.push('inline', '', 0);
  token.content  = state.src.slice(pos, max).trim();
  token.map      = [ startLine, state.line ];
  token.children = [];

  token        = state.push('heading_close', 'h' + String(level), -1);
  token.markup = '########'.slice(0, level);

  return true;
};


/***/ }),

/***/ "../../../node_modules/markdown-it/lib/rules_block/hr.js":
/*!************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/markdown-it/lib/rules_block/hr.js ***!
  \************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Horizontal rule



var isSpace = __webpack_require__(/*! ../common/utils */ "../../../node_modules/markdown-it/lib/common/utils.js").isSpace;


module.exports = function hr(state, startLine, endLine, silent) {
  var marker, cnt, ch, token,
      pos = state.bMarks[startLine] + state.tShift[startLine],
      max = state.eMarks[startLine];

  // if it's indented more than 3 spaces, it should be a code block
  if (state.sCount[startLine] - state.blkIndent >= 4) { return false; }

  marker = state.src.charCodeAt(pos++);

  // Check hr marker
  if (marker !== 0x2A/* * */ &&
      marker !== 0x2D/* - */ &&
      marker !== 0x5F/* _ */) {
    return false;
  }

  // markers can be mixed with spaces, but there should be at least 3 of them

  cnt = 1;
  while (pos < max) {
    ch = state.src.charCodeAt(pos++);
    if (ch !== marker && !isSpace(ch)) { return false; }
    if (ch === marker) { cnt++; }
  }

  if (cnt < 3) { return false; }

  if (silent) { return true; }

  state.line = startLine + 1;

  token        = state.push('hr', 'hr', 0);
  token.map    = [ startLine, state.line ];
  token.markup = Array(cnt + 1).join(String.fromCharCode(marker));

  return true;
};


/***/ }),

/***/ "../../../node_modules/markdown-it/lib/rules_block/html_block.js":
/*!********************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/markdown-it/lib/rules_block/html_block.js ***!
  \********************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// HTML block




var block_names = __webpack_require__(/*! ../common/html_blocks */ "../../../node_modules/markdown-it/lib/common/html_blocks.js");
var HTML_OPEN_CLOSE_TAG_RE = __webpack_require__(/*! ../common/html_re */ "../../../node_modules/markdown-it/lib/common/html_re.js").HTML_OPEN_CLOSE_TAG_RE;

// An array of opening and corresponding closing sequences for html tags,
// last argument defines whether it can terminate a paragraph or not
//
var HTML_SEQUENCES = [
  [ /^<(script|pre|style)(?=(\s|>|$))/i, /<\/(script|pre|style)>/i, true ],
  [ /^<!--/,        /-->/,   true ],
  [ /^<\?/,         /\?>/,   true ],
  [ /^<![A-Z]/,     />/,     true ],
  [ /^<!\[CDATA\[/, /\]\]>/, true ],
  [ new RegExp('^</?(' + block_names.join('|') + ')(?=(\\s|/?>|$))', 'i'), /^$/, true ],
  [ new RegExp(HTML_OPEN_CLOSE_TAG_RE.source + '\\s*$'),  /^$/, false ]
];


module.exports = function html_block(state, startLine, endLine, silent) {
  var i, nextLine, token, lineText,
      pos = state.bMarks[startLine] + state.tShift[startLine],
      max = state.eMarks[startLine];

  // if it's indented more than 3 spaces, it should be a code block
  if (state.sCount[startLine] - state.blkIndent >= 4) { return false; }

  if (!state.md.options.html) { return false; }

  if (state.src.charCodeAt(pos) !== 0x3C/* < */) { return false; }

  lineText = state.src.slice(pos, max);

  for (i = 0; i < HTML_SEQUENCES.length; i++) {
    if (HTML_SEQUENCES[i][0].test(lineText)) { break; }
  }

  if (i === HTML_SEQUENCES.length) { return false; }

  if (silent) {
    // true if this sequence can be a terminator, false otherwise
    return HTML_SEQUENCES[i][2];
  }

  nextLine = startLine + 1;

  // If we are here - we detected HTML block.
  // Let's roll down till block end.
  if (!HTML_SEQUENCES[i][1].test(lineText)) {
    for (; nextLine < endLine; nextLine++) {
      if (state.sCount[nextLine] < state.blkIndent) { break; }

      pos = state.bMarks[nextLine] + state.tShift[nextLine];
      max = state.eMarks[nextLine];
      lineText = state.src.slice(pos, max);

      if (HTML_SEQUENCES[i][1].test(lineText)) {
        if (lineText.length !== 0) { nextLine++; }
        break;
      }
    }
  }

  state.line = nextLine;

  token         = state.push('html_block', '', 0);
  token.map     = [ startLine, nextLine ];
  token.content = state.getLines(startLine, nextLine, state.blkIndent, true);

  return true;
};


/***/ }),

/***/ "../../../node_modules/markdown-it/lib/rules_block/lheading.js":
/*!******************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/markdown-it/lib/rules_block/lheading.js ***!
  \******************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// lheading (---, ===)




module.exports = function lheading(state, startLine, endLine/*, silent*/) {
  var content, terminate, i, l, token, pos, max, level, marker,
      nextLine = startLine + 1, oldParentType,
      terminatorRules = state.md.block.ruler.getRules('paragraph');

  // if it's indented more than 3 spaces, it should be a code block
  if (state.sCount[startLine] - state.blkIndent >= 4) { return false; }

  oldParentType = state.parentType;
  state.parentType = 'paragraph'; // use paragraph to match terminatorRules

  // jump line-by-line until empty one or EOF
  for (; nextLine < endLine && !state.isEmpty(nextLine); nextLine++) {
    // this would be a code block normally, but after paragraph
    // it's considered a lazy continuation regardless of what's there
    if (state.sCount[nextLine] - state.blkIndent > 3) { continue; }

    //
    // Check for underline in setext header
    //
    if (state.sCount[nextLine] >= state.blkIndent) {
      pos = state.bMarks[nextLine] + state.tShift[nextLine];
      max = state.eMarks[nextLine];

      if (pos < max) {
        marker = state.src.charCodeAt(pos);

        if (marker === 0x2D/* - */ || marker === 0x3D/* = */) {
          pos = state.skipChars(pos, marker);
          pos = state.skipSpaces(pos);

          if (pos >= max) {
            level = (marker === 0x3D/* = */ ? 1 : 2);
            break;
          }
        }
      }
    }

    // quirk for blockquotes, this line should already be checked by that rule
    if (state.sCount[nextLine] < 0) { continue; }

    // Some tags can terminate paragraph without empty line.
    terminate = false;
    for (i = 0, l = terminatorRules.length; i < l; i++) {
      if (terminatorRules[i](state, nextLine, endLine, true)) {
        terminate = true;
        break;
      }
    }
    if (terminate) { break; }
  }

  if (!level) {
    // Didn't find valid underline
    return false;
  }

  content = state.getLines(startLine, nextLine, state.blkIndent, false).trim();

  state.line = nextLine + 1;

  token          = state.push('heading_open', 'h' + String(level), 1);
  token.markup   = String.fromCharCode(marker);
  token.map      = [ startLine, state.line ];

  token          = state.push('inline', '', 0);
  token.content  = content;
  token.map      = [ startLine, state.line - 1 ];
  token.children = [];

  token          = state.push('heading_close', 'h' + String(level), -1);
  token.markup   = String.fromCharCode(marker);

  state.parentType = oldParentType;

  return true;
};


/***/ }),

/***/ "../../../node_modules/markdown-it/lib/rules_block/list.js":
/*!**************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/markdown-it/lib/rules_block/list.js ***!
  \**************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Lists



var isSpace = __webpack_require__(/*! ../common/utils */ "../../../node_modules/markdown-it/lib/common/utils.js").isSpace;


// Search `[-+*][\n ]`, returns next pos after marker on success
// or -1 on fail.
function skipBulletListMarker(state, startLine) {
  var marker, pos, max, ch;

  pos = state.bMarks[startLine] + state.tShift[startLine];
  max = state.eMarks[startLine];

  marker = state.src.charCodeAt(pos++);
  // Check bullet
  if (marker !== 0x2A/* * */ &&
      marker !== 0x2D/* - */ &&
      marker !== 0x2B/* + */) {
    return -1;
  }

  if (pos < max) {
    ch = state.src.charCodeAt(pos);

    if (!isSpace(ch)) {
      // " -test " - is not a list item
      return -1;
    }
  }

  return pos;
}

// Search `\d+[.)][\n ]`, returns next pos after marker on success
// or -1 on fail.
function skipOrderedListMarker(state, startLine) {
  var ch,
      start = state.bMarks[startLine] + state.tShift[startLine],
      pos = start,
      max = state.eMarks[startLine];

  // List marker should have at least 2 chars (digit + dot)
  if (pos + 1 >= max) { return -1; }

  ch = state.src.charCodeAt(pos++);

  if (ch < 0x30/* 0 */ || ch > 0x39/* 9 */) { return -1; }

  for (;;) {
    // EOL -> fail
    if (pos >= max) { return -1; }

    ch = state.src.charCodeAt(pos++);

    if (ch >= 0x30/* 0 */ && ch <= 0x39/* 9 */) {

      // List marker should have no more than 9 digits
      // (prevents integer overflow in browsers)
      if (pos - start >= 10) { return -1; }

      continue;
    }

    // found valid marker
    if (ch === 0x29/* ) */ || ch === 0x2e/* . */) {
      break;
    }

    return -1;
  }


  if (pos < max) {
    ch = state.src.charCodeAt(pos);

    if (!isSpace(ch)) {
      // " 1.test " - is not a list item
      return -1;
    }
  }
  return pos;
}

function markTightParagraphs(state, idx) {
  var i, l,
      level = state.level + 2;

  for (i = idx + 2, l = state.tokens.length - 2; i < l; i++) {
    if (state.tokens[i].level === level && state.tokens[i].type === 'paragraph_open') {
      state.tokens[i + 2].hidden = true;
      state.tokens[i].hidden = true;
      i += 2;
    }
  }
}


module.exports = function list(state, startLine, endLine, silent) {
  var ch,
      contentStart,
      i,
      indent,
      indentAfterMarker,
      initial,
      isOrdered,
      itemLines,
      l,
      listLines,
      listTokIdx,
      markerCharCode,
      markerValue,
      max,
      nextLine,
      offset,
      oldIndent,
      oldLIndent,
      oldParentType,
      oldTShift,
      oldTight,
      pos,
      posAfterMarker,
      prevEmptyEnd,
      start,
      terminate,
      terminatorRules,
      token,
      isTerminatingParagraph = false,
      tight = true;

  // if it's indented more than 3 spaces, it should be a code block
  if (state.sCount[startLine] - state.blkIndent >= 4) { return false; }

  // limit conditions when list can interrupt
  // a paragraph (validation mode only)
  if (silent && state.parentType === 'paragraph') {
    // Next list item should still terminate previous list item;
    //
    // This code can fail if plugins use blkIndent as well as lists,
    // but I hope the spec gets fixed long before that happens.
    //
    if (state.tShift[startLine] >= state.blkIndent) {
      isTerminatingParagraph = true;
    }
  }

  // Detect list type and position after marker
  if ((posAfterMarker = skipOrderedListMarker(state, startLine)) >= 0) {
    isOrdered = true;
    start = state.bMarks[startLine] + state.tShift[startLine];
    markerValue = Number(state.src.substr(start, posAfterMarker - start - 1));

    // If we're starting a new ordered list right after
    // a paragraph, it should start with 1.
    if (isTerminatingParagraph && markerValue !== 1) return false;

  } else if ((posAfterMarker = skipBulletListMarker(state, startLine)) >= 0) {
    isOrdered = false;

  } else {
    return false;
  }

  // If we're starting a new unordered list right after
  // a paragraph, first line should not be empty.
  if (isTerminatingParagraph) {
    if (state.skipSpaces(posAfterMarker) >= state.eMarks[startLine]) return false;
  }

  // We should terminate list on style change. Remember first one to compare.
  markerCharCode = state.src.charCodeAt(posAfterMarker - 1);

  // For validation mode we can terminate immediately
  if (silent) { return true; }

  // Start list
  listTokIdx = state.tokens.length;

  if (isOrdered) {
    token       = state.push('ordered_list_open', 'ol', 1);
    if (markerValue !== 1) {
      token.attrs = [ [ 'start', markerValue ] ];
    }

  } else {
    token       = state.push('bullet_list_open', 'ul', 1);
  }

  token.map    = listLines = [ startLine, 0 ];
  token.markup = String.fromCharCode(markerCharCode);

  //
  // Iterate list items
  //

  nextLine = startLine;
  prevEmptyEnd = false;
  terminatorRules = state.md.block.ruler.getRules('list');

  oldParentType = state.parentType;
  state.parentType = 'list';

  while (nextLine < endLine) {
    pos = posAfterMarker;
    max = state.eMarks[nextLine];

    initial = offset = state.sCount[nextLine] + posAfterMarker - (state.bMarks[startLine] + state.tShift[startLine]);

    while (pos < max) {
      ch = state.src.charCodeAt(pos);

      if (ch === 0x09) {
        offset += 4 - (offset + state.bsCount[nextLine]) % 4;
      } else if (ch === 0x20) {
        offset++;
      } else {
        break;
      }

      pos++;
    }

    contentStart = pos;

    if (contentStart >= max) {
      // trimming space in "-    \n  3" case, indent is 1 here
      indentAfterMarker = 1;
    } else {
      indentAfterMarker = offset - initial;
    }

    // If we have more than 4 spaces, the indent is 1
    // (the rest is just indented code block)
    if (indentAfterMarker > 4) { indentAfterMarker = 1; }

    // "  -  test"
    //  ^^^^^ - calculating total length of this thing
    indent = initial + indentAfterMarker;

    // Run subparser & write tokens
    token        = state.push('list_item_open', 'li', 1);
    token.markup = String.fromCharCode(markerCharCode);
    token.map    = itemLines = [ startLine, 0 ];

    oldIndent = state.blkIndent;
    oldTight = state.tight;
    oldTShift = state.tShift[startLine];
    oldLIndent = state.sCount[startLine];
    state.blkIndent = indent;
    state.tight = true;
    state.tShift[startLine] = contentStart - state.bMarks[startLine];
    state.sCount[startLine] = offset;

    if (contentStart >= max && state.isEmpty(startLine + 1)) {
      // workaround for this case
      // (list item is empty, list terminates before "foo"):
      // ~~~~~~~~
      //   -
      //
      //     foo
      // ~~~~~~~~
      state.line = Math.min(state.line + 2, endLine);
    } else {
      state.md.block.tokenize(state, startLine, endLine, true);
    }

    // If any of list item is tight, mark list as tight
    if (!state.tight || prevEmptyEnd) {
      tight = false;
    }
    // Item become loose if finish with empty line,
    // but we should filter last element, because it means list finish
    prevEmptyEnd = (state.line - startLine) > 1 && state.isEmpty(state.line - 1);

    state.blkIndent = oldIndent;
    state.tShift[startLine] = oldTShift;
    state.sCount[startLine] = oldLIndent;
    state.tight = oldTight;

    token        = state.push('list_item_close', 'li', -1);
    token.markup = String.fromCharCode(markerCharCode);

    nextLine = startLine = state.line;
    itemLines[1] = nextLine;
    contentStart = state.bMarks[startLine];

    if (nextLine >= endLine) { break; }

    //
    // Try to check if list is terminated or continued.
    //
    if (state.sCount[nextLine] < state.blkIndent) { break; }

    // fail if terminating block found
    terminate = false;
    for (i = 0, l = terminatorRules.length; i < l; i++) {
      if (terminatorRules[i](state, nextLine, endLine, true)) {
        terminate = true;
        break;
      }
    }
    if (terminate) { break; }

    // fail if list has another type
    if (isOrdered) {
      posAfterMarker = skipOrderedListMarker(state, nextLine);
      if (posAfterMarker < 0) { break; }
    } else {
      posAfterMarker = skipBulletListMarker(state, nextLine);
      if (posAfterMarker < 0) { break; }
    }

    if (markerCharCode !== state.src.charCodeAt(posAfterMarker - 1)) { break; }
  }

  // Finalize list
  if (isOrdered) {
    token = state.push('ordered_list_close', 'ol', -1);
  } else {
    token = state.push('bullet_list_close', 'ul', -1);
  }
  token.markup = String.fromCharCode(markerCharCode);

  listLines[1] = nextLine;
  state.line = nextLine;

  state.parentType = oldParentType;

  // mark paragraphs tight if needed
  if (tight) {
    markTightParagraphs(state, listTokIdx);
  }

  return true;
};


/***/ }),

/***/ "../../../node_modules/markdown-it/lib/rules_block/paragraph.js":
/*!*******************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/markdown-it/lib/rules_block/paragraph.js ***!
  \*******************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Paragraph




module.exports = function paragraph(state, startLine/*, endLine*/) {
  var content, terminate, i, l, token, oldParentType,
      nextLine = startLine + 1,
      terminatorRules = state.md.block.ruler.getRules('paragraph'),
      endLine = state.lineMax;

  oldParentType = state.parentType;
  state.parentType = 'paragraph';

  // jump line-by-line until empty one or EOF
  for (; nextLine < endLine && !state.isEmpty(nextLine); nextLine++) {
    // this would be a code block normally, but after paragraph
    // it's considered a lazy continuation regardless of what's there
    if (state.sCount[nextLine] - state.blkIndent > 3) { continue; }

    // quirk for blockquotes, this line should already be checked by that rule
    if (state.sCount[nextLine] < 0) { continue; }

    // Some tags can terminate paragraph without empty line.
    terminate = false;
    for (i = 0, l = terminatorRules.length; i < l; i++) {
      if (terminatorRules[i](state, nextLine, endLine, true)) {
        terminate = true;
        break;
      }
    }
    if (terminate) { break; }
  }

  content = state.getLines(startLine, nextLine, state.blkIndent, false).trim();

  state.line = nextLine;

  token          = state.push('paragraph_open', 'p', 1);
  token.map      = [ startLine, state.line ];

  token          = state.push('inline', '', 0);
  token.content  = content;
  token.map      = [ startLine, state.line ];
  token.children = [];

  token          = state.push('paragraph_close', 'p', -1);

  state.parentType = oldParentType;

  return true;
};


/***/ }),

/***/ "../../../node_modules/markdown-it/lib/rules_block/reference.js":
/*!*******************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/markdown-it/lib/rules_block/reference.js ***!
  \*******************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";



var normalizeReference   = __webpack_require__(/*! ../common/utils */ "../../../node_modules/markdown-it/lib/common/utils.js").normalizeReference;
var isSpace              = __webpack_require__(/*! ../common/utils */ "../../../node_modules/markdown-it/lib/common/utils.js").isSpace;


module.exports = function reference(state, startLine, _endLine, silent) {
  var ch,
      destEndPos,
      destEndLineNo,
      endLine,
      href,
      i,
      l,
      label,
      labelEnd,
      oldParentType,
      res,
      start,
      str,
      terminate,
      terminatorRules,
      title,
      lines = 0,
      pos = state.bMarks[startLine] + state.tShift[startLine],
      max = state.eMarks[startLine],
      nextLine = startLine + 1;

  // if it's indented more than 3 spaces, it should be a code block
  if (state.sCount[startLine] - state.blkIndent >= 4) { return false; }

  if (state.src.charCodeAt(pos) !== 0x5B/* [ */) { return false; }

  // Simple check to quickly interrupt scan on [link](url) at the start of line.
  // Can be useful on practice: https://github.com/markdown-it/markdown-it/issues/54
  while (++pos < max) {
    if (state.src.charCodeAt(pos) === 0x5D /* ] */ &&
        state.src.charCodeAt(pos - 1) !== 0x5C/* \ */) {
      if (pos + 1 === max) { return false; }
      if (state.src.charCodeAt(pos + 1) !== 0x3A/* : */) { return false; }
      break;
    }
  }

  endLine = state.lineMax;

  // jump line-by-line until empty one or EOF
  terminatorRules = state.md.block.ruler.getRules('reference');

  oldParentType = state.parentType;
  state.parentType = 'reference';

  for (; nextLine < endLine && !state.isEmpty(nextLine); nextLine++) {
    // this would be a code block normally, but after paragraph
    // it's considered a lazy continuation regardless of what's there
    if (state.sCount[nextLine] - state.blkIndent > 3) { continue; }

    // quirk for blockquotes, this line should already be checked by that rule
    if (state.sCount[nextLine] < 0) { continue; }

    // Some tags can terminate paragraph without empty line.
    terminate = false;
    for (i = 0, l = terminatorRules.length; i < l; i++) {
      if (terminatorRules[i](state, nextLine, endLine, true)) {
        terminate = true;
        break;
      }
    }
    if (terminate) { break; }
  }

  str = state.getLines(startLine, nextLine, state.blkIndent, false).trim();
  max = str.length;

  for (pos = 1; pos < max; pos++) {
    ch = str.charCodeAt(pos);
    if (ch === 0x5B /* [ */) {
      return false;
    } else if (ch === 0x5D /* ] */) {
      labelEnd = pos;
      break;
    } else if (ch === 0x0A /* \n */) {
      lines++;
    } else if (ch === 0x5C /* \ */) {
      pos++;
      if (pos < max && str.charCodeAt(pos) === 0x0A) {
        lines++;
      }
    }
  }

  if (labelEnd < 0 || str.charCodeAt(labelEnd + 1) !== 0x3A/* : */) { return false; }

  // [label]:   destination   'title'
  //         ^^^ skip optional whitespace here
  for (pos = labelEnd + 2; pos < max; pos++) {
    ch = str.charCodeAt(pos);
    if (ch === 0x0A) {
      lines++;
    } else if (isSpace(ch)) {
      /*eslint no-empty:0*/
    } else {
      break;
    }
  }

  // [label]:   destination   'title'
  //            ^^^^^^^^^^^ parse this
  res = state.md.helpers.parseLinkDestination(str, pos, max);
  if (!res.ok) { return false; }

  href = state.md.normalizeLink(res.str);
  if (!state.md.validateLink(href)) { return false; }

  pos = res.pos;
  lines += res.lines;

  // save cursor state, we could require to rollback later
  destEndPos = pos;
  destEndLineNo = lines;

  // [label]:   destination   'title'
  //                       ^^^ skipping those spaces
  start = pos;
  for (; pos < max; pos++) {
    ch = str.charCodeAt(pos);
    if (ch === 0x0A) {
      lines++;
    } else if (isSpace(ch)) {
      /*eslint no-empty:0*/
    } else {
      break;
    }
  }

  // [label]:   destination   'title'
  //                          ^^^^^^^ parse this
  res = state.md.helpers.parseLinkTitle(str, pos, max);
  if (pos < max && start !== pos && res.ok) {
    title = res.str;
    pos = res.pos;
    lines += res.lines;
  } else {
    title = '';
    pos = destEndPos;
    lines = destEndLineNo;
  }

  // skip trailing spaces until the rest of the line
  while (pos < max) {
    ch = str.charCodeAt(pos);
    if (!isSpace(ch)) { break; }
    pos++;
  }

  if (pos < max && str.charCodeAt(pos) !== 0x0A) {
    if (title) {
      // garbage at the end of the line after title,
      // but it could still be a valid reference if we roll back
      title = '';
      pos = destEndPos;
      lines = destEndLineNo;
      while (pos < max) {
        ch = str.charCodeAt(pos);
        if (!isSpace(ch)) { break; }
        pos++;
      }
    }
  }

  if (pos < max && str.charCodeAt(pos) !== 0x0A) {
    // garbage at the end of the line
    return false;
  }

  label = normalizeReference(str.slice(1, labelEnd));
  if (!label) {
    // CommonMark 0.20 disallows empty labels
    return false;
  }

  // Reference can not terminate anything. This check is for safety only.
  /*istanbul ignore if*/
  if (silent) { return true; }

  if (typeof state.env.references === 'undefined') {
    state.env.references = {};
  }
  if (typeof state.env.references[label] === 'undefined') {
    state.env.references[label] = { title: title, href: href };
  }

  state.parentType = oldParentType;

  state.line = startLine + lines + 1;
  return true;
};


/***/ }),

/***/ "../../../node_modules/markdown-it/lib/rules_block/state_block.js":
/*!*********************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/markdown-it/lib/rules_block/state_block.js ***!
  \*********************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Parser state class



var Token = __webpack_require__(/*! ../token */ "../../../node_modules/markdown-it/lib/token.js");
var isSpace = __webpack_require__(/*! ../common/utils */ "../../../node_modules/markdown-it/lib/common/utils.js").isSpace;


function StateBlock(src, md, env, tokens) {
  var ch, s, start, pos, len, indent, offset, indent_found;

  this.src = src;

  // link to parser instance
  this.md     = md;

  this.env = env;

  //
  // Internal state vartiables
  //

  this.tokens = tokens;

  this.bMarks = [];  // line begin offsets for fast jumps
  this.eMarks = [];  // line end offsets for fast jumps
  this.tShift = [];  // offsets of the first non-space characters (tabs not expanded)
  this.sCount = [];  // indents for each line (tabs expanded)

  // An amount of virtual spaces (tabs expanded) between beginning
  // of each line (bMarks) and real beginning of that line.
  //
  // It exists only as a hack because blockquotes override bMarks
  // losing information in the process.
  //
  // It's used only when expanding tabs, you can think about it as
  // an initial tab length, e.g. bsCount=21 applied to string `\t123`
  // means first tab should be expanded to 4-21%4 === 3 spaces.
  //
  this.bsCount = [];

  // block parser variables
  this.blkIndent  = 0; // required block content indent
                       // (for example, if we are in list)
  this.line       = 0; // line index in src
  this.lineMax    = 0; // lines count
  this.tight      = false;  // loose/tight mode for lists
  this.ddIndent   = -1; // indent of the current dd block (-1 if there isn't any)

  // can be 'blockquote', 'list', 'root', 'paragraph' or 'reference'
  // used in lists to determine if they interrupt a paragraph
  this.parentType = 'root';

  this.level = 0;

  // renderer
  this.result = '';

  // Create caches
  // Generate markers.
  s = this.src;
  indent_found = false;

  for (start = pos = indent = offset = 0, len = s.length; pos < len; pos++) {
    ch = s.charCodeAt(pos);

    if (!indent_found) {
      if (isSpace(ch)) {
        indent++;

        if (ch === 0x09) {
          offset += 4 - offset % 4;
        } else {
          offset++;
        }
        continue;
      } else {
        indent_found = true;
      }
    }

    if (ch === 0x0A || pos === len - 1) {
      if (ch !== 0x0A) { pos++; }
      this.bMarks.push(start);
      this.eMarks.push(pos);
      this.tShift.push(indent);
      this.sCount.push(offset);
      this.bsCount.push(0);

      indent_found = false;
      indent = 0;
      offset = 0;
      start = pos + 1;
    }
  }

  // Push fake entry to simplify cache bounds checks
  this.bMarks.push(s.length);
  this.eMarks.push(s.length);
  this.tShift.push(0);
  this.sCount.push(0);
  this.bsCount.push(0);

  this.lineMax = this.bMarks.length - 1; // don't count last fake line
}

// Push new token to "stream".
//
StateBlock.prototype.push = function (type, tag, nesting) {
  var token = new Token(type, tag, nesting);
  token.block = true;

  if (nesting < 0) { this.level--; }
  token.level = this.level;
  if (nesting > 0) { this.level++; }

  this.tokens.push(token);
  return token;
};

StateBlock.prototype.isEmpty = function isEmpty(line) {
  return this.bMarks[line] + this.tShift[line] >= this.eMarks[line];
};

StateBlock.prototype.skipEmptyLines = function skipEmptyLines(from) {
  for (var max = this.lineMax; from < max; from++) {
    if (this.bMarks[from] + this.tShift[from] < this.eMarks[from]) {
      break;
    }
  }
  return from;
};

// Skip spaces from given position.
StateBlock.prototype.skipSpaces = function skipSpaces(pos) {
  var ch;

  for (var max = this.src.length; pos < max; pos++) {
    ch = this.src.charCodeAt(pos);
    if (!isSpace(ch)) { break; }
  }
  return pos;
};

// Skip spaces from given position in reverse.
StateBlock.prototype.skipSpacesBack = function skipSpacesBack(pos, min) {
  if (pos <= min) { return pos; }

  while (pos > min) {
    if (!isSpace(this.src.charCodeAt(--pos))) { return pos + 1; }
  }
  return pos;
};

// Skip char codes from given position
StateBlock.prototype.skipChars = function skipChars(pos, code) {
  for (var max = this.src.length; pos < max; pos++) {
    if (this.src.charCodeAt(pos) !== code) { break; }
  }
  return pos;
};

// Skip char codes reverse from given position - 1
StateBlock.prototype.skipCharsBack = function skipCharsBack(pos, code, min) {
  if (pos <= min) { return pos; }

  while (pos > min) {
    if (code !== this.src.charCodeAt(--pos)) { return pos + 1; }
  }
  return pos;
};

// cut lines range from source.
StateBlock.prototype.getLines = function getLines(begin, end, indent, keepLastLF) {
  var i, lineIndent, ch, first, last, queue, lineStart,
      line = begin;

  if (begin >= end) {
    return '';
  }

  queue = new Array(end - begin);

  for (i = 0; line < end; line++, i++) {
    lineIndent = 0;
    lineStart = first = this.bMarks[line];

    if (line + 1 < end || keepLastLF) {
      // No need for bounds check because we have fake entry on tail.
      last = this.eMarks[line] + 1;
    } else {
      last = this.eMarks[line];
    }

    while (first < last && lineIndent < indent) {
      ch = this.src.charCodeAt(first);

      if (isSpace(ch)) {
        if (ch === 0x09) {
          lineIndent += 4 - (lineIndent + this.bsCount[line]) % 4;
        } else {
          lineIndent++;
        }
      } else if (first - lineStart < this.tShift[line]) {
        // patched tShift masked characters to look like spaces (blockquotes, list markers)
        lineIndent++;
      } else {
        break;
      }

      first++;
    }

    if (lineIndent > indent) {
      // partially expanding tabs in code blocks, e.g '\t\tfoobar'
      // with indent=2 becomes '  \tfoobar'
      queue[i] = new Array(lineIndent - indent + 1).join(' ') + this.src.slice(first, last);
    } else {
      queue[i] = this.src.slice(first, last);
    }
  }

  return queue.join('');
};

// re-export Token class to use in block rules
StateBlock.prototype.Token = Token;


module.exports = StateBlock;


/***/ }),

/***/ "../../../node_modules/markdown-it/lib/rules_block/table.js":
/*!***************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/markdown-it/lib/rules_block/table.js ***!
  \***************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// GFM table, non-standard



var isSpace = __webpack_require__(/*! ../common/utils */ "../../../node_modules/markdown-it/lib/common/utils.js").isSpace;


function getLine(state, line) {
  var pos = state.bMarks[line] + state.blkIndent,
      max = state.eMarks[line];

  return state.src.substr(pos, max - pos);
}

function escapedSplit(str) {
  var result = [],
      pos = 0,
      max = str.length,
      ch,
      escapes = 0,
      lastPos = 0,
      backTicked = false,
      lastBackTick = 0;

  ch  = str.charCodeAt(pos);

  while (pos < max) {
    if (ch === 0x60/* ` */) {
      if (backTicked) {
        // make \` close code sequence, but not open it;
        // the reason is: `\` is correct code block
        backTicked = false;
        lastBackTick = pos;
      } else if (escapes % 2 === 0) {
        backTicked = true;
        lastBackTick = pos;
      }
    } else if (ch === 0x7c/* | */ && (escapes % 2 === 0) && !backTicked) {
      result.push(str.substring(lastPos, pos));
      lastPos = pos + 1;
    }

    if (ch === 0x5c/* \ */) {
      escapes++;
    } else {
      escapes = 0;
    }

    pos++;

    // If there was an un-closed backtick, go back to just after
    // the last backtick, but as if it was a normal character
    if (pos === max && backTicked) {
      backTicked = false;
      pos = lastBackTick + 1;
    }

    ch = str.charCodeAt(pos);
  }

  result.push(str.substring(lastPos));

  return result;
}


module.exports = function table(state, startLine, endLine, silent) {
  var ch, lineText, pos, i, nextLine, columns, columnCount, token,
      aligns, t, tableLines, tbodyLines;

  // should have at least two lines
  if (startLine + 2 > endLine) { return false; }

  nextLine = startLine + 1;

  if (state.sCount[nextLine] < state.blkIndent) { return false; }

  // if it's indented more than 3 spaces, it should be a code block
  if (state.sCount[nextLine] - state.blkIndent >= 4) { return false; }

  // first character of the second line should be '|', '-', ':',
  // and no other characters are allowed but spaces;
  // basically, this is the equivalent of /^[-:|][-:|\s]*$/ regexp

  pos = state.bMarks[nextLine] + state.tShift[nextLine];
  if (pos >= state.eMarks[nextLine]) { return false; }

  ch = state.src.charCodeAt(pos++);
  if (ch !== 0x7C/* | */ && ch !== 0x2D/* - */ && ch !== 0x3A/* : */) { return false; }

  while (pos < state.eMarks[nextLine]) {
    ch = state.src.charCodeAt(pos);

    if (ch !== 0x7C/* | */ && ch !== 0x2D/* - */ && ch !== 0x3A/* : */ && !isSpace(ch)) { return false; }

    pos++;
  }

  lineText = getLine(state, startLine + 1);

  columns = lineText.split('|');
  aligns = [];
  for (i = 0; i < columns.length; i++) {
    t = columns[i].trim();
    if (!t) {
      // allow empty columns before and after table, but not in between columns;
      // e.g. allow ` |---| `, disallow ` ---||--- `
      if (i === 0 || i === columns.length - 1) {
        continue;
      } else {
        return false;
      }
    }

    if (!/^:?-+:?$/.test(t)) { return false; }
    if (t.charCodeAt(t.length - 1) === 0x3A/* : */) {
      aligns.push(t.charCodeAt(0) === 0x3A/* : */ ? 'center' : 'right');
    } else if (t.charCodeAt(0) === 0x3A/* : */) {
      aligns.push('left');
    } else {
      aligns.push('');
    }
  }

  lineText = getLine(state, startLine).trim();
  if (lineText.indexOf('|') === -1) { return false; }
  if (state.sCount[startLine] - state.blkIndent >= 4) { return false; }
  columns = escapedSplit(lineText.replace(/^\||\|$/g, ''));

  // header row will define an amount of columns in the entire table,
  // and align row shouldn't be smaller than that (the rest of the rows can)
  columnCount = columns.length;
  if (columnCount > aligns.length) { return false; }

  if (silent) { return true; }

  token     = state.push('table_open', 'table', 1);
  token.map = tableLines = [ startLine, 0 ];

  token     = state.push('thead_open', 'thead', 1);
  token.map = [ startLine, startLine + 1 ];

  token     = state.push('tr_open', 'tr', 1);
  token.map = [ startLine, startLine + 1 ];

  for (i = 0; i < columns.length; i++) {
    token          = state.push('th_open', 'th', 1);
    token.map      = [ startLine, startLine + 1 ];
    if (aligns[i]) {
      token.attrs  = [ [ 'style', 'text-align:' + aligns[i] ] ];
    }

    token          = state.push('inline', '', 0);
    token.content  = columns[i].trim();
    token.map      = [ startLine, startLine + 1 ];
    token.children = [];

    token          = state.push('th_close', 'th', -1);
  }

  token     = state.push('tr_close', 'tr', -1);
  token     = state.push('thead_close', 'thead', -1);

  token     = state.push('tbody_open', 'tbody', 1);
  token.map = tbodyLines = [ startLine + 2, 0 ];

  for (nextLine = startLine + 2; nextLine < endLine; nextLine++) {
    if (state.sCount[nextLine] < state.blkIndent) { break; }

    lineText = getLine(state, nextLine).trim();
    if (lineText.indexOf('|') === -1) { break; }
    if (state.sCount[nextLine] - state.blkIndent >= 4) { break; }
    columns = escapedSplit(lineText.replace(/^\||\|$/g, ''));

    token = state.push('tr_open', 'tr', 1);
    for (i = 0; i < columnCount; i++) {
      token          = state.push('td_open', 'td', 1);
      if (aligns[i]) {
        token.attrs  = [ [ 'style', 'text-align:' + aligns[i] ] ];
      }

      token          = state.push('inline', '', 0);
      token.content  = columns[i] ? columns[i].trim() : '';
      token.children = [];

      token          = state.push('td_close', 'td', -1);
    }
    token = state.push('tr_close', 'tr', -1);
  }
  token = state.push('tbody_close', 'tbody', -1);
  token = state.push('table_close', 'table', -1);

  tableLines[1] = tbodyLines[1] = nextLine;
  state.line = nextLine;
  return true;
};


/***/ }),

/***/ "../../../node_modules/markdown-it/lib/rules_core/block.js":
/*!**************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/markdown-it/lib/rules_core/block.js ***!
  \**************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";



module.exports = function block(state) {
  var token;

  if (state.inlineMode) {
    token          = new state.Token('inline', '', 0);
    token.content  = state.src;
    token.map      = [ 0, 1 ];
    token.children = [];
    state.tokens.push(token);
  } else {
    state.md.block.parse(state.src, state.md, state.env, state.tokens);
  }
};


/***/ }),

/***/ "../../../node_modules/markdown-it/lib/rules_core/inline.js":
/*!***************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/markdown-it/lib/rules_core/inline.js ***!
  \***************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function inline(state) {
  var tokens = state.tokens, tok, i, l;

  // Parse inlines
  for (i = 0, l = tokens.length; i < l; i++) {
    tok = tokens[i];
    if (tok.type === 'inline') {
      state.md.inline.parse(tok.content, state.md, state.env, tok.children);
    }
  }
};


/***/ }),

/***/ "../../../node_modules/markdown-it/lib/rules_core/linkify.js":
/*!****************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/markdown-it/lib/rules_core/linkify.js ***!
  \****************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Replace link-like texts with link nodes.
//
// Currently restricted by `md.validateLink()` to http/https/ftp
//



var arrayReplaceAt = __webpack_require__(/*! ../common/utils */ "../../../node_modules/markdown-it/lib/common/utils.js").arrayReplaceAt;


function isLinkOpen(str) {
  return /^<a[>\s]/i.test(str);
}
function isLinkClose(str) {
  return /^<\/a\s*>/i.test(str);
}


module.exports = function linkify(state) {
  var i, j, l, tokens, token, currentToken, nodes, ln, text, pos, lastPos,
      level, htmlLinkLevel, url, fullUrl, urlText,
      blockTokens = state.tokens,
      links;

  if (!state.md.options.linkify) { return; }

  for (j = 0, l = blockTokens.length; j < l; j++) {
    if (blockTokens[j].type !== 'inline' ||
        !state.md.linkify.pretest(blockTokens[j].content)) {
      continue;
    }

    tokens = blockTokens[j].children;

    htmlLinkLevel = 0;

    // We scan from the end, to keep position when new tags added.
    // Use reversed logic in links start/end match
    for (i = tokens.length - 1; i >= 0; i--) {
      currentToken = tokens[i];

      // Skip content of markdown links
      if (currentToken.type === 'link_close') {
        i--;
        while (tokens[i].level !== currentToken.level && tokens[i].type !== 'link_open') {
          i--;
        }
        continue;
      }

      // Skip content of html tag links
      if (currentToken.type === 'html_inline') {
        if (isLinkOpen(currentToken.content) && htmlLinkLevel > 0) {
          htmlLinkLevel--;
        }
        if (isLinkClose(currentToken.content)) {
          htmlLinkLevel++;
        }
      }
      if (htmlLinkLevel > 0) { continue; }

      if (currentToken.type === 'text' && state.md.linkify.test(currentToken.content)) {

        text = currentToken.content;
        links = state.md.linkify.match(text);

        // Now split string to nodes
        nodes = [];
        level = currentToken.level;
        lastPos = 0;

        for (ln = 0; ln < links.length; ln++) {

          url = links[ln].url;
          fullUrl = state.md.normalizeLink(url);
          if (!state.md.validateLink(fullUrl)) { continue; }

          urlText = links[ln].text;

          // Linkifier might send raw hostnames like "example.com", where url
          // starts with domain name. So we prepend http:// in those cases,
          // and remove it afterwards.
          //
          if (!links[ln].schema) {
            urlText = state.md.normalizeLinkText('http://' + urlText).replace(/^http:\/\//, '');
          } else if (links[ln].schema === 'mailto:' && !/^mailto:/i.test(urlText)) {
            urlText = state.md.normalizeLinkText('mailto:' + urlText).replace(/^mailto:/, '');
          } else {
            urlText = state.md.normalizeLinkText(urlText);
          }

          pos = links[ln].index;

          if (pos > lastPos) {
            token         = new state.Token('text', '', 0);
            token.content = text.slice(lastPos, pos);
            token.level   = level;
            nodes.push(token);
          }

          token         = new state.Token('link_open', 'a', 1);
          token.attrs   = [ [ 'href', fullUrl ] ];
          token.level   = level++;
          token.markup  = 'linkify';
          token.info    = 'auto';
          nodes.push(token);

          token         = new state.Token('text', '', 0);
          token.content = urlText;
          token.level   = level;
          nodes.push(token);

          token         = new state.Token('link_close', 'a', -1);
          token.level   = --level;
          token.markup  = 'linkify';
          token.info    = 'auto';
          nodes.push(token);

          lastPos = links[ln].lastIndex;
        }
        if (lastPos < text.length) {
          token         = new state.Token('text', '', 0);
          token.content = text.slice(lastPos);
          token.level   = level;
          nodes.push(token);
        }

        // replace current node
        blockTokens[j].children = tokens = arrayReplaceAt(tokens, i, nodes);
      }
    }
  }
};


/***/ }),

/***/ "../../../node_modules/markdown-it/lib/rules_core/normalize.js":
/*!******************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/markdown-it/lib/rules_core/normalize.js ***!
  \******************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Normalize input string




var NEWLINES_RE  = /\r[\n\u0085]?|[\u2424\u2028\u0085]/g;
var NULL_RE      = /\u0000/g;


module.exports = function inline(state) {
  var str;

  // Normalize newlines
  str = state.src.replace(NEWLINES_RE, '\n');

  // Replace NULL characters
  str = str.replace(NULL_RE, '\uFFFD');

  state.src = str;
};


/***/ }),

/***/ "../../../node_modules/markdown-it/lib/rules_core/replacements.js":
/*!*********************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/markdown-it/lib/rules_core/replacements.js ***!
  \*********************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Simple typographyc replacements
//
// (c) (C) → ©
// (tm) (TM) → ™
// (r) (R) → ®
// +- → ±
// (p) (P) -> §
// ... → … (also ?.... → ?.., !.... → !..)
// ???????? → ???, !!!!! → !!!, `,,` → `,`
// -- → &ndash;, --- → &mdash;
//


// TODO:
// - fractionals 1/2, 1/4, 3/4 -> ½, ¼, ¾
// - miltiplication 2 x 4 -> 2 × 4

var RARE_RE = /\+-|\.\.|\?\?\?\?|!!!!|,,|--/;

// Workaround for phantomjs - need regex without /g flag,
// or root check will fail every second time
var SCOPED_ABBR_TEST_RE = /\((c|tm|r|p)\)/i;

var SCOPED_ABBR_RE = /\((c|tm|r|p)\)/ig;
var SCOPED_ABBR = {
  c: '©',
  r: '®',
  p: '§',
  tm: '™'
};

function replaceFn(match, name) {
  return SCOPED_ABBR[name.toLowerCase()];
}

function replace_scoped(inlineTokens) {
  var i, token, inside_autolink = 0;

  for (i = inlineTokens.length - 1; i >= 0; i--) {
    token = inlineTokens[i];

    if (token.type === 'text' && !inside_autolink) {
      token.content = token.content.replace(SCOPED_ABBR_RE, replaceFn);
    }

    if (token.type === 'link_open' && token.info === 'auto') {
      inside_autolink--;
    }

    if (token.type === 'link_close' && token.info === 'auto') {
      inside_autolink++;
    }
  }
}

function replace_rare(inlineTokens) {
  var i, token, inside_autolink = 0;

  for (i = inlineTokens.length - 1; i >= 0; i--) {
    token = inlineTokens[i];

    if (token.type === 'text' && !inside_autolink) {
      if (RARE_RE.test(token.content)) {
        token.content = token.content
                    .replace(/\+-/g, '±')
                    // .., ..., ....... -> …
                    // but ?..... & !..... -> ?.. & !..
                    .replace(/\.{2,}/g, '…').replace(/([?!])…/g, '$1..')
                    .replace(/([?!]){4,}/g, '$1$1$1').replace(/,{2,}/g, ',')
                    // em-dash
                    .replace(/(^|[^-])---([^-]|$)/mg, '$1\u2014$2')
                    // en-dash
                    .replace(/(^|\s)--(\s|$)/mg, '$1\u2013$2')
                    .replace(/(^|[^-\s])--([^-\s]|$)/mg, '$1\u2013$2');
      }
    }

    if (token.type === 'link_open' && token.info === 'auto') {
      inside_autolink--;
    }

    if (token.type === 'link_close' && token.info === 'auto') {
      inside_autolink++;
    }
  }
}


module.exports = function replace(state) {
  var blkIdx;

  if (!state.md.options.typographer) { return; }

  for (blkIdx = state.tokens.length - 1; blkIdx >= 0; blkIdx--) {

    if (state.tokens[blkIdx].type !== 'inline') { continue; }

    if (SCOPED_ABBR_TEST_RE.test(state.tokens[blkIdx].content)) {
      replace_scoped(state.tokens[blkIdx].children);
    }

    if (RARE_RE.test(state.tokens[blkIdx].content)) {
      replace_rare(state.tokens[blkIdx].children);
    }

  }
};


/***/ }),

/***/ "../../../node_modules/markdown-it/lib/rules_core/smartquotes.js":
/*!********************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/markdown-it/lib/rules_core/smartquotes.js ***!
  \********************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Convert straight quotation marks to typographic ones
//



var isWhiteSpace   = __webpack_require__(/*! ../common/utils */ "../../../node_modules/markdown-it/lib/common/utils.js").isWhiteSpace;
var isPunctChar    = __webpack_require__(/*! ../common/utils */ "../../../node_modules/markdown-it/lib/common/utils.js").isPunctChar;
var isMdAsciiPunct = __webpack_require__(/*! ../common/utils */ "../../../node_modules/markdown-it/lib/common/utils.js").isMdAsciiPunct;

var QUOTE_TEST_RE = /['"]/;
var QUOTE_RE = /['"]/g;
var APOSTROPHE = '\u2019'; /* ’ */


function replaceAt(str, index, ch) {
  return str.substr(0, index) + ch + str.substr(index + 1);
}

function process_inlines(tokens, state) {
  var i, token, text, t, pos, max, thisLevel, item, lastChar, nextChar,
      isLastPunctChar, isNextPunctChar, isLastWhiteSpace, isNextWhiteSpace,
      canOpen, canClose, j, isSingle, stack, openQuote, closeQuote;

  stack = [];

  for (i = 0; i < tokens.length; i++) {
    token = tokens[i];

    thisLevel = tokens[i].level;

    for (j = stack.length - 1; j >= 0; j--) {
      if (stack[j].level <= thisLevel) { break; }
    }
    stack.length = j + 1;

    if (token.type !== 'text') { continue; }

    text = token.content;
    pos = 0;
    max = text.length;

    /*eslint no-labels:0,block-scoped-var:0*/
    OUTER:
    while (pos < max) {
      QUOTE_RE.lastIndex = pos;
      t = QUOTE_RE.exec(text);
      if (!t) { break; }

      canOpen = canClose = true;
      pos = t.index + 1;
      isSingle = (t[0] === "'");

      // Find previous character,
      // default to space if it's the beginning of the line
      //
      lastChar = 0x20;

      if (t.index - 1 >= 0) {
        lastChar = text.charCodeAt(t.index - 1);
      } else {
        for (j = i - 1; j >= 0; j--) {
          if (tokens[j].type === 'softbreak' || tokens[j].type === 'hardbreak') break; // lastChar defaults to 0x20
          if (tokens[j].type !== 'text') continue;

          lastChar = tokens[j].content.charCodeAt(tokens[j].content.length - 1);
          break;
        }
      }

      // Find next character,
      // default to space if it's the end of the line
      //
      nextChar = 0x20;

      if (pos < max) {
        nextChar = text.charCodeAt(pos);
      } else {
        for (j = i + 1; j < tokens.length; j++) {
          if (tokens[j].type === 'softbreak' || tokens[j].type === 'hardbreak') break; // nextChar defaults to 0x20
          if (tokens[j].type !== 'text') continue;

          nextChar = tokens[j].content.charCodeAt(0);
          break;
        }
      }

      isLastPunctChar = isMdAsciiPunct(lastChar) || isPunctChar(String.fromCharCode(lastChar));
      isNextPunctChar = isMdAsciiPunct(nextChar) || isPunctChar(String.fromCharCode(nextChar));

      isLastWhiteSpace = isWhiteSpace(lastChar);
      isNextWhiteSpace = isWhiteSpace(nextChar);

      if (isNextWhiteSpace) {
        canOpen = false;
      } else if (isNextPunctChar) {
        if (!(isLastWhiteSpace || isLastPunctChar)) {
          canOpen = false;
        }
      }

      if (isLastWhiteSpace) {
        canClose = false;
      } else if (isLastPunctChar) {
        if (!(isNextWhiteSpace || isNextPunctChar)) {
          canClose = false;
        }
      }

      if (nextChar === 0x22 /* " */ && t[0] === '"') {
        if (lastChar >= 0x30 /* 0 */ && lastChar <= 0x39 /* 9 */) {
          // special case: 1"" - count first quote as an inch
          canClose = canOpen = false;
        }
      }

      if (canOpen && canClose) {
        // treat this as the middle of the word
        canOpen = false;
        canClose = isNextPunctChar;
      }

      if (!canOpen && !canClose) {
        // middle of word
        if (isSingle) {
          token.content = replaceAt(token.content, t.index, APOSTROPHE);
        }
        continue;
      }

      if (canClose) {
        // this could be a closing quote, rewind the stack to get a match
        for (j = stack.length - 1; j >= 0; j--) {
          item = stack[j];
          if (stack[j].level < thisLevel) { break; }
          if (item.single === isSingle && stack[j].level === thisLevel) {
            item = stack[j];

            if (isSingle) {
              openQuote = state.md.options.quotes[2];
              closeQuote = state.md.options.quotes[3];
            } else {
              openQuote = state.md.options.quotes[0];
              closeQuote = state.md.options.quotes[1];
            }

            // replace token.content *before* tokens[item.token].content,
            // because, if they are pointing at the same token, replaceAt
            // could mess up indices when quote length != 1
            token.content = replaceAt(token.content, t.index, closeQuote);
            tokens[item.token].content = replaceAt(
              tokens[item.token].content, item.pos, openQuote);

            pos += closeQuote.length - 1;
            if (item.token === i) { pos += openQuote.length - 1; }

            text = token.content;
            max = text.length;

            stack.length = j;
            continue OUTER;
          }
        }
      }

      if (canOpen) {
        stack.push({
          token: i,
          pos: t.index,
          single: isSingle,
          level: thisLevel
        });
      } else if (canClose && isSingle) {
        token.content = replaceAt(token.content, t.index, APOSTROPHE);
      }
    }
  }
}


module.exports = function smartquotes(state) {
  /*eslint max-depth:0*/
  var blkIdx;

  if (!state.md.options.typographer) { return; }

  for (blkIdx = state.tokens.length - 1; blkIdx >= 0; blkIdx--) {

    if (state.tokens[blkIdx].type !== 'inline' ||
        !QUOTE_TEST_RE.test(state.tokens[blkIdx].content)) {
      continue;
    }

    process_inlines(state.tokens[blkIdx].children, state);
  }
};


/***/ }),

/***/ "../../../node_modules/markdown-it/lib/rules_core/state_core.js":
/*!*******************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/markdown-it/lib/rules_core/state_core.js ***!
  \*******************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Core state object
//


var Token = __webpack_require__(/*! ../token */ "../../../node_modules/markdown-it/lib/token.js");


function StateCore(src, md, env) {
  this.src = src;
  this.env = env;
  this.tokens = [];
  this.inlineMode = false;
  this.md = md; // link to parser instance
}

// re-export Token class to use in core rules
StateCore.prototype.Token = Token;


module.exports = StateCore;


/***/ }),

/***/ "../../../node_modules/markdown-it/lib/rules_inline/autolink.js":
/*!*******************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/markdown-it/lib/rules_inline/autolink.js ***!
  \*******************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Process autolinks '<protocol:...>'




/*eslint max-len:0*/
var EMAIL_RE    = /^<([a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*)>/;
var AUTOLINK_RE = /^<([a-zA-Z][a-zA-Z0-9+.\-]{1,31}):([^<>\x00-\x20]*)>/;


module.exports = function autolink(state, silent) {
  var tail, linkMatch, emailMatch, url, fullUrl, token,
      pos = state.pos;

  if (state.src.charCodeAt(pos) !== 0x3C/* < */) { return false; }

  tail = state.src.slice(pos);

  if (tail.indexOf('>') < 0) { return false; }

  if (AUTOLINK_RE.test(tail)) {
    linkMatch = tail.match(AUTOLINK_RE);

    url = linkMatch[0].slice(1, -1);
    fullUrl = state.md.normalizeLink(url);
    if (!state.md.validateLink(fullUrl)) { return false; }

    if (!silent) {
      token         = state.push('link_open', 'a', 1);
      token.attrs   = [ [ 'href', fullUrl ] ];
      token.markup  = 'autolink';
      token.info    = 'auto';

      token         = state.push('text', '', 0);
      token.content = state.md.normalizeLinkText(url);

      token         = state.push('link_close', 'a', -1);
      token.markup  = 'autolink';
      token.info    = 'auto';
    }

    state.pos += linkMatch[0].length;
    return true;
  }

  if (EMAIL_RE.test(tail)) {
    emailMatch = tail.match(EMAIL_RE);

    url = emailMatch[0].slice(1, -1);
    fullUrl = state.md.normalizeLink('mailto:' + url);
    if (!state.md.validateLink(fullUrl)) { return false; }

    if (!silent) {
      token         = state.push('link_open', 'a', 1);
      token.attrs   = [ [ 'href', fullUrl ] ];
      token.markup  = 'autolink';
      token.info    = 'auto';

      token         = state.push('text', '', 0);
      token.content = state.md.normalizeLinkText(url);

      token         = state.push('link_close', 'a', -1);
      token.markup  = 'autolink';
      token.info    = 'auto';
    }

    state.pos += emailMatch[0].length;
    return true;
  }

  return false;
};


/***/ }),

/***/ "../../../node_modules/markdown-it/lib/rules_inline/backticks.js":
/*!********************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/markdown-it/lib/rules_inline/backticks.js ***!
  \********************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Parse backticks



module.exports = function backtick(state, silent) {
  var start, max, marker, matchStart, matchEnd, token,
      pos = state.pos,
      ch = state.src.charCodeAt(pos);

  if (ch !== 0x60/* ` */) { return false; }

  start = pos;
  pos++;
  max = state.posMax;

  while (pos < max && state.src.charCodeAt(pos) === 0x60/* ` */) { pos++; }

  marker = state.src.slice(start, pos);

  matchStart = matchEnd = pos;

  while ((matchStart = state.src.indexOf('`', matchEnd)) !== -1) {
    matchEnd = matchStart + 1;

    while (matchEnd < max && state.src.charCodeAt(matchEnd) === 0x60/* ` */) { matchEnd++; }

    if (matchEnd - matchStart === marker.length) {
      if (!silent) {
        token         = state.push('code_inline', 'code', 0);
        token.markup  = marker;
        token.content = state.src.slice(pos, matchStart)
                                 .replace(/[ \n]+/g, ' ')
                                 .trim();
      }
      state.pos = matchEnd;
      return true;
    }
  }

  if (!silent) { state.pending += marker; }
  state.pos += marker.length;
  return true;
};


/***/ }),

/***/ "../../../node_modules/markdown-it/lib/rules_inline/balance_pairs.js":
/*!************************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/markdown-it/lib/rules_inline/balance_pairs.js ***!
  \************************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// For each opening emphasis-like marker find a matching closing one
//



module.exports = function link_pairs(state) {
  var i, j, lastDelim, currDelim,
      delimiters = state.delimiters,
      max = state.delimiters.length;

  for (i = 0; i < max; i++) {
    lastDelim = delimiters[i];

    if (!lastDelim.close) { continue; }

    j = i - lastDelim.jump - 1;

    while (j >= 0) {
      currDelim = delimiters[j];

      if (currDelim.open &&
          currDelim.marker === lastDelim.marker &&
          currDelim.end < 0 &&
          currDelim.level === lastDelim.level) {

        // typeofs are for backward compatibility with plugins
        var odd_match = (currDelim.close || lastDelim.open) &&
                        typeof currDelim.length !== 'undefined' &&
                        typeof lastDelim.length !== 'undefined' &&
                        (currDelim.length + lastDelim.length) % 3 === 0;

        if (!odd_match) {
          lastDelim.jump = i - j;
          lastDelim.open = false;
          currDelim.end  = i;
          currDelim.jump = 0;
          break;
        }
      }

      j -= currDelim.jump + 1;
    }
  }
};


/***/ }),

/***/ "../../../node_modules/markdown-it/lib/rules_inline/emphasis.js":
/*!*******************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/markdown-it/lib/rules_inline/emphasis.js ***!
  \*******************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Process *this* and _that_
//



// Insert each marker as a separate text token, and add it to delimiter list
//
module.exports.tokenize = function emphasis(state, silent) {
  var i, scanned, token,
      start = state.pos,
      marker = state.src.charCodeAt(start);

  if (silent) { return false; }

  if (marker !== 0x5F /* _ */ && marker !== 0x2A /* * */) { return false; }

  scanned = state.scanDelims(state.pos, marker === 0x2A);

  for (i = 0; i < scanned.length; i++) {
    token         = state.push('text', '', 0);
    token.content = String.fromCharCode(marker);

    state.delimiters.push({
      // Char code of the starting marker (number).
      //
      marker: marker,

      // Total length of these series of delimiters.
      //
      length: scanned.length,

      // An amount of characters before this one that's equivalent to
      // current one. In plain English: if this delimiter does not open
      // an emphasis, neither do previous `jump` characters.
      //
      // Used to skip sequences like "*****" in one step, for 1st asterisk
      // value will be 0, for 2nd it's 1 and so on.
      //
      jump:   i,

      // A position of the token this delimiter corresponds to.
      //
      token:  state.tokens.length - 1,

      // Token level.
      //
      level:  state.level,

      // If this delimiter is matched as a valid opener, `end` will be
      // equal to its position, otherwise it's `-1`.
      //
      end:    -1,

      // Boolean flags that determine if this delimiter could open or close
      // an emphasis.
      //
      open:   scanned.can_open,
      close:  scanned.can_close
    });
  }

  state.pos += scanned.length;

  return true;
};


// Walk through delimiter list and replace text tokens with tags
//
module.exports.postProcess = function emphasis(state) {
  var i,
      startDelim,
      endDelim,
      token,
      ch,
      isStrong,
      delimiters = state.delimiters,
      max = state.delimiters.length;

  for (i = max - 1; i >= 0; i--) {
    startDelim = delimiters[i];

    if (startDelim.marker !== 0x5F/* _ */ && startDelim.marker !== 0x2A/* * */) {
      continue;
    }

    // Process only opening markers
    if (startDelim.end === -1) {
      continue;
    }

    endDelim = delimiters[startDelim.end];

    // If the previous delimiter has the same marker and is adjacent to this one,
    // merge those into one strong delimiter.
    //
    // `<em><em>whatever</em></em>` -> `<strong>whatever</strong>`
    //
    isStrong = i > 0 &&
               delimiters[i - 1].end === startDelim.end + 1 &&
               delimiters[i - 1].token === startDelim.token - 1 &&
               delimiters[startDelim.end + 1].token === endDelim.token + 1 &&
               delimiters[i - 1].marker === startDelim.marker;

    ch = String.fromCharCode(startDelim.marker);

    token         = state.tokens[startDelim.token];
    token.type    = isStrong ? 'strong_open' : 'em_open';
    token.tag     = isStrong ? 'strong' : 'em';
    token.nesting = 1;
    token.markup  = isStrong ? ch + ch : ch;
    token.content = '';

    token         = state.tokens[endDelim.token];
    token.type    = isStrong ? 'strong_close' : 'em_close';
    token.tag     = isStrong ? 'strong' : 'em';
    token.nesting = -1;
    token.markup  = isStrong ? ch + ch : ch;
    token.content = '';

    if (isStrong) {
      state.tokens[delimiters[i - 1].token].content = '';
      state.tokens[delimiters[startDelim.end + 1].token].content = '';
      i--;
    }
  }
};


/***/ }),

/***/ "../../../node_modules/markdown-it/lib/rules_inline/entity.js":
/*!*****************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/markdown-it/lib/rules_inline/entity.js ***!
  \*****************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Process html entity - &#123;, &#xAF;, &quot;, ...



var entities          = __webpack_require__(/*! ../common/entities */ "../../../node_modules/markdown-it/lib/common/entities.js");
var has               = __webpack_require__(/*! ../common/utils */ "../../../node_modules/markdown-it/lib/common/utils.js").has;
var isValidEntityCode = __webpack_require__(/*! ../common/utils */ "../../../node_modules/markdown-it/lib/common/utils.js").isValidEntityCode;
var fromCodePoint     = __webpack_require__(/*! ../common/utils */ "../../../node_modules/markdown-it/lib/common/utils.js").fromCodePoint;


var DIGITAL_RE = /^&#((?:x[a-f0-9]{1,8}|[0-9]{1,8}));/i;
var NAMED_RE   = /^&([a-z][a-z0-9]{1,31});/i;


module.exports = function entity(state, silent) {
  var ch, code, match, pos = state.pos, max = state.posMax;

  if (state.src.charCodeAt(pos) !== 0x26/* & */) { return false; }

  if (pos + 1 < max) {
    ch = state.src.charCodeAt(pos + 1);

    if (ch === 0x23 /* # */) {
      match = state.src.slice(pos).match(DIGITAL_RE);
      if (match) {
        if (!silent) {
          code = match[1][0].toLowerCase() === 'x' ? parseInt(match[1].slice(1), 16) : parseInt(match[1], 10);
          state.pending += isValidEntityCode(code) ? fromCodePoint(code) : fromCodePoint(0xFFFD);
        }
        state.pos += match[0].length;
        return true;
      }
    } else {
      match = state.src.slice(pos).match(NAMED_RE);
      if (match) {
        if (has(entities, match[1])) {
          if (!silent) { state.pending += entities[match[1]]; }
          state.pos += match[0].length;
          return true;
        }
      }
    }
  }

  if (!silent) { state.pending += '&'; }
  state.pos++;
  return true;
};


/***/ }),

/***/ "../../../node_modules/markdown-it/lib/rules_inline/escape.js":
/*!*****************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/markdown-it/lib/rules_inline/escape.js ***!
  \*****************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Process escaped chars and hardbreaks



var isSpace = __webpack_require__(/*! ../common/utils */ "../../../node_modules/markdown-it/lib/common/utils.js").isSpace;

var ESCAPED = [];

for (var i = 0; i < 256; i++) { ESCAPED.push(0); }

'\\!"#$%&\'()*+,./:;<=>?@[]^_`{|}~-'
  .split('').forEach(function (ch) { ESCAPED[ch.charCodeAt(0)] = 1; });


module.exports = function escape(state, silent) {
  var ch, pos = state.pos, max = state.posMax;

  if (state.src.charCodeAt(pos) !== 0x5C/* \ */) { return false; }

  pos++;

  if (pos < max) {
    ch = state.src.charCodeAt(pos);

    if (ch < 256 && ESCAPED[ch] !== 0) {
      if (!silent) { state.pending += state.src[pos]; }
      state.pos += 2;
      return true;
    }

    if (ch === 0x0A) {
      if (!silent) {
        state.push('hardbreak', 'br', 0);
      }

      pos++;
      // skip leading whitespaces from next line
      while (pos < max) {
        ch = state.src.charCodeAt(pos);
        if (!isSpace(ch)) { break; }
        pos++;
      }

      state.pos = pos;
      return true;
    }
  }

  if (!silent) { state.pending += '\\'; }
  state.pos++;
  return true;
};


/***/ }),

/***/ "../../../node_modules/markdown-it/lib/rules_inline/html_inline.js":
/*!**********************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/markdown-it/lib/rules_inline/html_inline.js ***!
  \**********************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Process html tags




var HTML_TAG_RE = __webpack_require__(/*! ../common/html_re */ "../../../node_modules/markdown-it/lib/common/html_re.js").HTML_TAG_RE;


function isLetter(ch) {
  /*eslint no-bitwise:0*/
  var lc = ch | 0x20; // to lower case
  return (lc >= 0x61/* a */) && (lc <= 0x7a/* z */);
}


module.exports = function html_inline(state, silent) {
  var ch, match, max, token,
      pos = state.pos;

  if (!state.md.options.html) { return false; }

  // Check start
  max = state.posMax;
  if (state.src.charCodeAt(pos) !== 0x3C/* < */ ||
      pos + 2 >= max) {
    return false;
  }

  // Quick fail on second char
  ch = state.src.charCodeAt(pos + 1);
  if (ch !== 0x21/* ! */ &&
      ch !== 0x3F/* ? */ &&
      ch !== 0x2F/* / */ &&
      !isLetter(ch)) {
    return false;
  }

  match = state.src.slice(pos).match(HTML_TAG_RE);
  if (!match) { return false; }

  if (!silent) {
    token         = state.push('html_inline', '', 0);
    token.content = state.src.slice(pos, pos + match[0].length);
  }
  state.pos += match[0].length;
  return true;
};


/***/ }),

/***/ "../../../node_modules/markdown-it/lib/rules_inline/image.js":
/*!****************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/markdown-it/lib/rules_inline/image.js ***!
  \****************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Process ![image](<src> "title")



var normalizeReference   = __webpack_require__(/*! ../common/utils */ "../../../node_modules/markdown-it/lib/common/utils.js").normalizeReference;
var isSpace              = __webpack_require__(/*! ../common/utils */ "../../../node_modules/markdown-it/lib/common/utils.js").isSpace;


module.exports = function image(state, silent) {
  var attrs,
      code,
      content,
      label,
      labelEnd,
      labelStart,
      pos,
      ref,
      res,
      title,
      token,
      tokens,
      start,
      href = '',
      oldPos = state.pos,
      max = state.posMax;

  if (state.src.charCodeAt(state.pos) !== 0x21/* ! */) { return false; }
  if (state.src.charCodeAt(state.pos + 1) !== 0x5B/* [ */) { return false; }

  labelStart = state.pos + 2;
  labelEnd = state.md.helpers.parseLinkLabel(state, state.pos + 1, false);

  // parser failed to find ']', so it's not a valid link
  if (labelEnd < 0) { return false; }

  pos = labelEnd + 1;
  if (pos < max && state.src.charCodeAt(pos) === 0x28/* ( */) {
    //
    // Inline link
    //

    // [link](  <href>  "title"  )
    //        ^^ skipping these spaces
    pos++;
    for (; pos < max; pos++) {
      code = state.src.charCodeAt(pos);
      if (!isSpace(code) && code !== 0x0A) { break; }
    }
    if (pos >= max) { return false; }

    // [link](  <href>  "title"  )
    //          ^^^^^^ parsing link destination
    start = pos;
    res = state.md.helpers.parseLinkDestination(state.src, pos, state.posMax);
    if (res.ok) {
      href = state.md.normalizeLink(res.str);
      if (state.md.validateLink(href)) {
        pos = res.pos;
      } else {
        href = '';
      }
    }

    // [link](  <href>  "title"  )
    //                ^^ skipping these spaces
    start = pos;
    for (; pos < max; pos++) {
      code = state.src.charCodeAt(pos);
      if (!isSpace(code) && code !== 0x0A) { break; }
    }

    // [link](  <href>  "title"  )
    //                  ^^^^^^^ parsing link title
    res = state.md.helpers.parseLinkTitle(state.src, pos, state.posMax);
    if (pos < max && start !== pos && res.ok) {
      title = res.str;
      pos = res.pos;

      // [link](  <href>  "title"  )
      //                         ^^ skipping these spaces
      for (; pos < max; pos++) {
        code = state.src.charCodeAt(pos);
        if (!isSpace(code) && code !== 0x0A) { break; }
      }
    } else {
      title = '';
    }

    if (pos >= max || state.src.charCodeAt(pos) !== 0x29/* ) */) {
      state.pos = oldPos;
      return false;
    }
    pos++;
  } else {
    //
    // Link reference
    //
    if (typeof state.env.references === 'undefined') { return false; }

    if (pos < max && state.src.charCodeAt(pos) === 0x5B/* [ */) {
      start = pos + 1;
      pos = state.md.helpers.parseLinkLabel(state, pos);
      if (pos >= 0) {
        label = state.src.slice(start, pos++);
      } else {
        pos = labelEnd + 1;
      }
    } else {
      pos = labelEnd + 1;
    }

    // covers label === '' and label === undefined
    // (collapsed reference link and shortcut reference link respectively)
    if (!label) { label = state.src.slice(labelStart, labelEnd); }

    ref = state.env.references[normalizeReference(label)];
    if (!ref) {
      state.pos = oldPos;
      return false;
    }
    href = ref.href;
    title = ref.title;
  }

  //
  // We found the end of the link, and know for a fact it's a valid link;
  // so all that's left to do is to call tokenizer.
  //
  if (!silent) {
    content = state.src.slice(labelStart, labelEnd);

    state.md.inline.parse(
      content,
      state.md,
      state.env,
      tokens = []
    );

    token          = state.push('image', 'img', 0);
    token.attrs    = attrs = [ [ 'src', href ], [ 'alt', '' ] ];
    token.children = tokens;
    token.content  = content;

    if (title) {
      attrs.push([ 'title', title ]);
    }
  }

  state.pos = pos;
  state.posMax = max;
  return true;
};


/***/ }),

/***/ "../../../node_modules/markdown-it/lib/rules_inline/link.js":
/*!***************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/markdown-it/lib/rules_inline/link.js ***!
  \***************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Process [link](<to> "stuff")



var normalizeReference   = __webpack_require__(/*! ../common/utils */ "../../../node_modules/markdown-it/lib/common/utils.js").normalizeReference;
var isSpace              = __webpack_require__(/*! ../common/utils */ "../../../node_modules/markdown-it/lib/common/utils.js").isSpace;


module.exports = function link(state, silent) {
  var attrs,
      code,
      label,
      labelEnd,
      labelStart,
      pos,
      res,
      ref,
      title,
      token,
      href = '',
      oldPos = state.pos,
      max = state.posMax,
      start = state.pos,
      parseReference = true;

  if (state.src.charCodeAt(state.pos) !== 0x5B/* [ */) { return false; }

  labelStart = state.pos + 1;
  labelEnd = state.md.helpers.parseLinkLabel(state, state.pos, true);

  // parser failed to find ']', so it's not a valid link
  if (labelEnd < 0) { return false; }

  pos = labelEnd + 1;
  if (pos < max && state.src.charCodeAt(pos) === 0x28/* ( */) {
    //
    // Inline link
    //

    // might have found a valid shortcut link, disable reference parsing
    parseReference = false;

    // [link](  <href>  "title"  )
    //        ^^ skipping these spaces
    pos++;
    for (; pos < max; pos++) {
      code = state.src.charCodeAt(pos);
      if (!isSpace(code) && code !== 0x0A) { break; }
    }
    if (pos >= max) { return false; }

    // [link](  <href>  "title"  )
    //          ^^^^^^ parsing link destination
    start = pos;
    res = state.md.helpers.parseLinkDestination(state.src, pos, state.posMax);
    if (res.ok) {
      href = state.md.normalizeLink(res.str);
      if (state.md.validateLink(href)) {
        pos = res.pos;
      } else {
        href = '';
      }
    }

    // [link](  <href>  "title"  )
    //                ^^ skipping these spaces
    start = pos;
    for (; pos < max; pos++) {
      code = state.src.charCodeAt(pos);
      if (!isSpace(code) && code !== 0x0A) { break; }
    }

    // [link](  <href>  "title"  )
    //                  ^^^^^^^ parsing link title
    res = state.md.helpers.parseLinkTitle(state.src, pos, state.posMax);
    if (pos < max && start !== pos && res.ok) {
      title = res.str;
      pos = res.pos;

      // [link](  <href>  "title"  )
      //                         ^^ skipping these spaces
      for (; pos < max; pos++) {
        code = state.src.charCodeAt(pos);
        if (!isSpace(code) && code !== 0x0A) { break; }
      }
    } else {
      title = '';
    }

    if (pos >= max || state.src.charCodeAt(pos) !== 0x29/* ) */) {
      // parsing a valid shortcut link failed, fallback to reference
      parseReference = true;
    }
    pos++;
  }

  if (parseReference) {
    //
    // Link reference
    //
    if (typeof state.env.references === 'undefined') { return false; }

    if (pos < max && state.src.charCodeAt(pos) === 0x5B/* [ */) {
      start = pos + 1;
      pos = state.md.helpers.parseLinkLabel(state, pos);
      if (pos >= 0) {
        label = state.src.slice(start, pos++);
      } else {
        pos = labelEnd + 1;
      }
    } else {
      pos = labelEnd + 1;
    }

    // covers label === '' and label === undefined
    // (collapsed reference link and shortcut reference link respectively)
    if (!label) { label = state.src.slice(labelStart, labelEnd); }

    ref = state.env.references[normalizeReference(label)];
    if (!ref) {
      state.pos = oldPos;
      return false;
    }
    href = ref.href;
    title = ref.title;
  }

  //
  // We found the end of the link, and know for a fact it's a valid link;
  // so all that's left to do is to call tokenizer.
  //
  if (!silent) {
    state.pos = labelStart;
    state.posMax = labelEnd;

    token        = state.push('link_open', 'a', 1);
    token.attrs  = attrs = [ [ 'href', href ] ];
    if (title) {
      attrs.push([ 'title', title ]);
    }

    state.md.inline.tokenize(state);

    token        = state.push('link_close', 'a', -1);
  }

  state.pos = pos;
  state.posMax = max;
  return true;
};


/***/ }),

/***/ "../../../node_modules/markdown-it/lib/rules_inline/newline.js":
/*!******************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/markdown-it/lib/rules_inline/newline.js ***!
  \******************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Proceess '\n'



var isSpace = __webpack_require__(/*! ../common/utils */ "../../../node_modules/markdown-it/lib/common/utils.js").isSpace;


module.exports = function newline(state, silent) {
  var pmax, max, pos = state.pos;

  if (state.src.charCodeAt(pos) !== 0x0A/* \n */) { return false; }

  pmax = state.pending.length - 1;
  max = state.posMax;

  // '  \n' -> hardbreak
  // Lookup in pending chars is bad practice! Don't copy to other rules!
  // Pending string is stored in concat mode, indexed lookups will cause
  // convertion to flat mode.
  if (!silent) {
    if (pmax >= 0 && state.pending.charCodeAt(pmax) === 0x20) {
      if (pmax >= 1 && state.pending.charCodeAt(pmax - 1) === 0x20) {
        state.pending = state.pending.replace(/ +$/, '');
        state.push('hardbreak', 'br', 0);
      } else {
        state.pending = state.pending.slice(0, -1);
        state.push('softbreak', 'br', 0);
      }

    } else {
      state.push('softbreak', 'br', 0);
    }
  }

  pos++;

  // skip heading spaces for next line
  while (pos < max && isSpace(state.src.charCodeAt(pos))) { pos++; }

  state.pos = pos;
  return true;
};


/***/ }),

/***/ "../../../node_modules/markdown-it/lib/rules_inline/state_inline.js":
/*!***********************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/markdown-it/lib/rules_inline/state_inline.js ***!
  \***********************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Inline parser state




var Token          = __webpack_require__(/*! ../token */ "../../../node_modules/markdown-it/lib/token.js");
var isWhiteSpace   = __webpack_require__(/*! ../common/utils */ "../../../node_modules/markdown-it/lib/common/utils.js").isWhiteSpace;
var isPunctChar    = __webpack_require__(/*! ../common/utils */ "../../../node_modules/markdown-it/lib/common/utils.js").isPunctChar;
var isMdAsciiPunct = __webpack_require__(/*! ../common/utils */ "../../../node_modules/markdown-it/lib/common/utils.js").isMdAsciiPunct;


function StateInline(src, md, env, outTokens) {
  this.src = src;
  this.env = env;
  this.md = md;
  this.tokens = outTokens;

  this.pos = 0;
  this.posMax = this.src.length;
  this.level = 0;
  this.pending = '';
  this.pendingLevel = 0;

  this.cache = {};        // Stores { start: end } pairs. Useful for backtrack
                          // optimization of pairs parse (emphasis, strikes).

  this.delimiters = [];   // Emphasis-like delimiters
}


// Flush pending text
//
StateInline.prototype.pushPending = function () {
  var token = new Token('text', '', 0);
  token.content = this.pending;
  token.level = this.pendingLevel;
  this.tokens.push(token);
  this.pending = '';
  return token;
};


// Push new token to "stream".
// If pending text exists - flush it as text token
//
StateInline.prototype.push = function (type, tag, nesting) {
  if (this.pending) {
    this.pushPending();
  }

  var token = new Token(type, tag, nesting);

  if (nesting < 0) { this.level--; }
  token.level = this.level;
  if (nesting > 0) { this.level++; }

  this.pendingLevel = this.level;
  this.tokens.push(token);
  return token;
};


// Scan a sequence of emphasis-like markers, and determine whether
// it can start an emphasis sequence or end an emphasis sequence.
//
//  - start - position to scan from (it should point at a valid marker);
//  - canSplitWord - determine if these markers can be found inside a word
//
StateInline.prototype.scanDelims = function (start, canSplitWord) {
  var pos = start, lastChar, nextChar, count, can_open, can_close,
      isLastWhiteSpace, isLastPunctChar,
      isNextWhiteSpace, isNextPunctChar,
      left_flanking = true,
      right_flanking = true,
      max = this.posMax,
      marker = this.src.charCodeAt(start);

  // treat beginning of the line as a whitespace
  lastChar = start > 0 ? this.src.charCodeAt(start - 1) : 0x20;

  while (pos < max && this.src.charCodeAt(pos) === marker) { pos++; }

  count = pos - start;

  // treat end of the line as a whitespace
  nextChar = pos < max ? this.src.charCodeAt(pos) : 0x20;

  isLastPunctChar = isMdAsciiPunct(lastChar) || isPunctChar(String.fromCharCode(lastChar));
  isNextPunctChar = isMdAsciiPunct(nextChar) || isPunctChar(String.fromCharCode(nextChar));

  isLastWhiteSpace = isWhiteSpace(lastChar);
  isNextWhiteSpace = isWhiteSpace(nextChar);

  if (isNextWhiteSpace) {
    left_flanking = false;
  } else if (isNextPunctChar) {
    if (!(isLastWhiteSpace || isLastPunctChar)) {
      left_flanking = false;
    }
  }

  if (isLastWhiteSpace) {
    right_flanking = false;
  } else if (isLastPunctChar) {
    if (!(isNextWhiteSpace || isNextPunctChar)) {
      right_flanking = false;
    }
  }

  if (!canSplitWord) {
    can_open  = left_flanking  && (!right_flanking || isLastPunctChar);
    can_close = right_flanking && (!left_flanking  || isNextPunctChar);
  } else {
    can_open  = left_flanking;
    can_close = right_flanking;
  }

  return {
    can_open:  can_open,
    can_close: can_close,
    length:    count
  };
};


// re-export Token class to use in block rules
StateInline.prototype.Token = Token;


module.exports = StateInline;


/***/ }),

/***/ "../../../node_modules/markdown-it/lib/rules_inline/strikethrough.js":
/*!************************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/markdown-it/lib/rules_inline/strikethrough.js ***!
  \************************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// ~~strike through~~
//



// Insert each marker as a separate text token, and add it to delimiter list
//
module.exports.tokenize = function strikethrough(state, silent) {
  var i, scanned, token, len, ch,
      start = state.pos,
      marker = state.src.charCodeAt(start);

  if (silent) { return false; }

  if (marker !== 0x7E/* ~ */) { return false; }

  scanned = state.scanDelims(state.pos, true);
  len = scanned.length;
  ch = String.fromCharCode(marker);

  if (len < 2) { return false; }

  if (len % 2) {
    token         = state.push('text', '', 0);
    token.content = ch;
    len--;
  }

  for (i = 0; i < len; i += 2) {
    token         = state.push('text', '', 0);
    token.content = ch + ch;

    state.delimiters.push({
      marker: marker,
      jump:   i,
      token:  state.tokens.length - 1,
      level:  state.level,
      end:    -1,
      open:   scanned.can_open,
      close:  scanned.can_close
    });
  }

  state.pos += scanned.length;

  return true;
};


// Walk through delimiter list and replace text tokens with tags
//
module.exports.postProcess = function strikethrough(state) {
  var i, j,
      startDelim,
      endDelim,
      token,
      loneMarkers = [],
      delimiters = state.delimiters,
      max = state.delimiters.length;

  for (i = 0; i < max; i++) {
    startDelim = delimiters[i];

    if (startDelim.marker !== 0x7E/* ~ */) {
      continue;
    }

    if (startDelim.end === -1) {
      continue;
    }

    endDelim = delimiters[startDelim.end];

    token         = state.tokens[startDelim.token];
    token.type    = 's_open';
    token.tag     = 's';
    token.nesting = 1;
    token.markup  = '~~';
    token.content = '';

    token         = state.tokens[endDelim.token];
    token.type    = 's_close';
    token.tag     = 's';
    token.nesting = -1;
    token.markup  = '~~';
    token.content = '';

    if (state.tokens[endDelim.token - 1].type === 'text' &&
        state.tokens[endDelim.token - 1].content === '~') {

      loneMarkers.push(endDelim.token - 1);
    }
  }

  // If a marker sequence has an odd number of characters, it's splitted
  // like this: `~~~~~` -> `~` + `~~` + `~~`, leaving one marker at the
  // start of the sequence.
  //
  // So, we have to move all those markers after subsequent s_close tags.
  //
  while (loneMarkers.length) {
    i = loneMarkers.pop();
    j = i + 1;

    while (j < state.tokens.length && state.tokens[j].type === 's_close') {
      j++;
    }

    j--;

    if (i !== j) {
      token = state.tokens[j];
      state.tokens[j] = state.tokens[i];
      state.tokens[i] = token;
    }
  }
};


/***/ }),

/***/ "../../../node_modules/markdown-it/lib/rules_inline/text.js":
/*!***************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/markdown-it/lib/rules_inline/text.js ***!
  \***************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Skip text characters for text token, place those to pending buffer
// and increment current pos




// Rule to skip pure text
// '{}$%@~+=:' reserved for extentions

// !, ", #, $, %, &, ', (, ), *, +, ,, -, ., /, :, ;, <, =, >, ?, @, [, \, ], ^, _, `, {, |, }, or ~

// !!!! Don't confuse with "Markdown ASCII Punctuation" chars
// http://spec.commonmark.org/0.15/#ascii-punctuation-character
function isTerminatorChar(ch) {
  switch (ch) {
    case 0x0A/* \n */:
    case 0x21/* ! */:
    case 0x23/* # */:
    case 0x24/* $ */:
    case 0x25/* % */:
    case 0x26/* & */:
    case 0x2A/* * */:
    case 0x2B/* + */:
    case 0x2D/* - */:
    case 0x3A/* : */:
    case 0x3C/* < */:
    case 0x3D/* = */:
    case 0x3E/* > */:
    case 0x40/* @ */:
    case 0x5B/* [ */:
    case 0x5C/* \ */:
    case 0x5D/* ] */:
    case 0x5E/* ^ */:
    case 0x5F/* _ */:
    case 0x60/* ` */:
    case 0x7B/* { */:
    case 0x7D/* } */:
    case 0x7E/* ~ */:
      return true;
    default:
      return false;
  }
}

module.exports = function text(state, silent) {
  var pos = state.pos;

  while (pos < state.posMax && !isTerminatorChar(state.src.charCodeAt(pos))) {
    pos++;
  }

  if (pos === state.pos) { return false; }

  if (!silent) { state.pending += state.src.slice(state.pos, pos); }

  state.pos = pos;

  return true;
};

// Alternative implementation, for memory.
//
// It costs 10% of performance, but allows extend terminators list, if place it
// to `ParcerInline` property. Probably, will switch to it sometime, such
// flexibility required.

/*
var TERMINATOR_RE = /[\n!#$%&*+\-:<=>@[\\\]^_`{}~]/;

module.exports = function text(state, silent) {
  var pos = state.pos,
      idx = state.src.slice(pos).search(TERMINATOR_RE);

  // first char is terminator -> empty text
  if (idx === 0) { return false; }

  // no terminator -> text till end of string
  if (idx < 0) {
    if (!silent) { state.pending += state.src.slice(pos); }
    state.pos = state.src.length;
    return true;
  }

  if (!silent) { state.pending += state.src.slice(pos, pos + idx); }

  state.pos += idx;

  return true;
};*/


/***/ }),

/***/ "../../../node_modules/markdown-it/lib/rules_inline/text_collapse.js":
/*!************************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/markdown-it/lib/rules_inline/text_collapse.js ***!
  \************************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Merge adjacent text nodes into one, and re-calculate all token levels
//



module.exports = function text_collapse(state) {
  var curr, last,
      level = 0,
      tokens = state.tokens,
      max = state.tokens.length;

  for (curr = last = 0; curr < max; curr++) {
    // re-calculate levels
    level += tokens[curr].nesting;
    tokens[curr].level = level;

    if (tokens[curr].type === 'text' &&
        curr + 1 < max &&
        tokens[curr + 1].type === 'text') {

      // collapse two adjacent text nodes
      tokens[curr + 1].content = tokens[curr].content + tokens[curr + 1].content;
    } else {
      if (curr !== last) { tokens[last] = tokens[curr]; }

      last++;
    }
  }

  if (curr !== last) {
    tokens.length = last;
  }
};


/***/ }),

/***/ "../../../node_modules/markdown-it/lib/token.js":
/*!***************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/markdown-it/lib/token.js ***!
  \***************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Token class




/**
 * class Token
 **/

/**
 * new Token(type, tag, nesting)
 *
 * Create new token and fill passed properties.
 **/
function Token(type, tag, nesting) {
  /**
   * Token#type -> String
   *
   * Type of the token (string, e.g. "paragraph_open")
   **/
  this.type     = type;

  /**
   * Token#tag -> String
   *
   * html tag name, e.g. "p"
   **/
  this.tag      = tag;

  /**
   * Token#attrs -> Array
   *
   * Html attributes. Format: `[ [ name1, value1 ], [ name2, value2 ] ]`
   **/
  this.attrs    = null;

  /**
   * Token#map -> Array
   *
   * Source map info. Format: `[ line_begin, line_end ]`
   **/
  this.map      = null;

  /**
   * Token#nesting -> Number
   *
   * Level change (number in {-1, 0, 1} set), where:
   *
   * -  `1` means the tag is opening
   * -  `0` means the tag is self-closing
   * - `-1` means the tag is closing
   **/
  this.nesting  = nesting;

  /**
   * Token#level -> Number
   *
   * nesting level, the same as `state.level`
   **/
  this.level    = 0;

  /**
   * Token#children -> Array
   *
   * An array of child nodes (inline and img tokens)
   **/
  this.children = null;

  /**
   * Token#content -> String
   *
   * In a case of self-closing tag (code, html, fence, etc.),
   * it has contents of this tag.
   **/
  this.content  = '';

  /**
   * Token#markup -> String
   *
   * '*' or '_' for emphasis, fence string for fence, etc.
   **/
  this.markup   = '';

  /**
   * Token#info -> String
   *
   * fence infostring
   **/
  this.info     = '';

  /**
   * Token#meta -> Object
   *
   * A place for plugins to store an arbitrary data
   **/
  this.meta     = null;

  /**
   * Token#block -> Boolean
   *
   * True for block-level tokens, false for inline tokens.
   * Used in renderer to calculate line breaks
   **/
  this.block    = false;

  /**
   * Token#hidden -> Boolean
   *
   * If it's true, ignore this element when rendering. Used for tight lists
   * to hide paragraphs.
   **/
  this.hidden   = false;
}


/**
 * Token.attrIndex(name) -> Number
 *
 * Search attribute index by name.
 **/
Token.prototype.attrIndex = function attrIndex(name) {
  var attrs, i, len;

  if (!this.attrs) { return -1; }

  attrs = this.attrs;

  for (i = 0, len = attrs.length; i < len; i++) {
    if (attrs[i][0] === name) { return i; }
  }
  return -1;
};


/**
 * Token.attrPush(attrData)
 *
 * Add `[ name, value ]` attribute to list. Init attrs if necessary
 **/
Token.prototype.attrPush = function attrPush(attrData) {
  if (this.attrs) {
    this.attrs.push(attrData);
  } else {
    this.attrs = [ attrData ];
  }
};


/**
 * Token.attrSet(name, value)
 *
 * Set `name` attribute to `value`. Override old value if exists.
 **/
Token.prototype.attrSet = function attrSet(name, value) {
  var idx = this.attrIndex(name),
      attrData = [ name, value ];

  if (idx < 0) {
    this.attrPush(attrData);
  } else {
    this.attrs[idx] = attrData;
  }
};


/**
 * Token.attrGet(name)
 *
 * Get the value of attribute `name`, or null if it does not exist.
 **/
Token.prototype.attrGet = function attrGet(name) {
  var idx = this.attrIndex(name), value = null;
  if (idx >= 0) {
    value = this.attrs[idx][1];
  }
  return value;
};


/**
 * Token.attrJoin(name, value)
 *
 * Join value to existing attribute via space. Or create new attribute if not
 * exists. Useful to operate with token classes.
 **/
Token.prototype.attrJoin = function attrJoin(name, value) {
  var idx = this.attrIndex(name);

  if (idx < 0) {
    this.attrPush([ name, value ]);
  } else {
    this.attrs[idx][1] = this.attrs[idx][1] + ' ' + value;
  }
};


module.exports = Token;


/***/ }),

/***/ "../../../node_modules/mdurl/decode.js":
/*!******************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/mdurl/decode.js ***!
  \******************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";




/* eslint-disable no-bitwise */

var decodeCache = {};

function getDecodeCache(exclude) {
  var i, ch, cache = decodeCache[exclude];
  if (cache) { return cache; }

  cache = decodeCache[exclude] = [];

  for (i = 0; i < 128; i++) {
    ch = String.fromCharCode(i);
    cache.push(ch);
  }

  for (i = 0; i < exclude.length; i++) {
    ch = exclude.charCodeAt(i);
    cache[ch] = '%' + ('0' + ch.toString(16).toUpperCase()).slice(-2);
  }

  return cache;
}


// Decode percent-encoded string.
//
function decode(string, exclude) {
  var cache;

  if (typeof exclude !== 'string') {
    exclude = decode.defaultChars;
  }

  cache = getDecodeCache(exclude);

  return string.replace(/(%[a-f0-9]{2})+/gi, function(seq) {
    var i, l, b1, b2, b3, b4, chr,
        result = '';

    for (i = 0, l = seq.length; i < l; i += 3) {
      b1 = parseInt(seq.slice(i + 1, i + 3), 16);

      if (b1 < 0x80) {
        result += cache[b1];
        continue;
      }

      if ((b1 & 0xE0) === 0xC0 && (i + 3 < l)) {
        // 110xxxxx 10xxxxxx
        b2 = parseInt(seq.slice(i + 4, i + 6), 16);

        if ((b2 & 0xC0) === 0x80) {
          chr = ((b1 << 6) & 0x7C0) | (b2 & 0x3F);

          if (chr < 0x80) {
            result += '\ufffd\ufffd';
          } else {
            result += String.fromCharCode(chr);
          }

          i += 3;
          continue;
        }
      }

      if ((b1 & 0xF0) === 0xE0 && (i + 6 < l)) {
        // 1110xxxx 10xxxxxx 10xxxxxx
        b2 = parseInt(seq.slice(i + 4, i + 6), 16);
        b3 = parseInt(seq.slice(i + 7, i + 9), 16);

        if ((b2 & 0xC0) === 0x80 && (b3 & 0xC0) === 0x80) {
          chr = ((b1 << 12) & 0xF000) | ((b2 << 6) & 0xFC0) | (b3 & 0x3F);

          if (chr < 0x800 || (chr >= 0xD800 && chr <= 0xDFFF)) {
            result += '\ufffd\ufffd\ufffd';
          } else {
            result += String.fromCharCode(chr);
          }

          i += 6;
          continue;
        }
      }

      if ((b1 & 0xF8) === 0xF0 && (i + 9 < l)) {
        // 111110xx 10xxxxxx 10xxxxxx 10xxxxxx
        b2 = parseInt(seq.slice(i + 4, i + 6), 16);
        b3 = parseInt(seq.slice(i + 7, i + 9), 16);
        b4 = parseInt(seq.slice(i + 10, i + 12), 16);

        if ((b2 & 0xC0) === 0x80 && (b3 & 0xC0) === 0x80 && (b4 & 0xC0) === 0x80) {
          chr = ((b1 << 18) & 0x1C0000) | ((b2 << 12) & 0x3F000) | ((b3 << 6) & 0xFC0) | (b4 & 0x3F);

          if (chr < 0x10000 || chr > 0x10FFFF) {
            result += '\ufffd\ufffd\ufffd\ufffd';
          } else {
            chr -= 0x10000;
            result += String.fromCharCode(0xD800 + (chr >> 10), 0xDC00 + (chr & 0x3FF));
          }

          i += 9;
          continue;
        }
      }

      result += '\ufffd';
    }

    return result;
  });
}


decode.defaultChars   = ';/?:@&=+$,#';
decode.componentChars = '';


module.exports = decode;


/***/ }),

/***/ "../../../node_modules/mdurl/encode.js":
/*!******************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/mdurl/encode.js ***!
  \******************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";




var encodeCache = {};


// Create a lookup array where anything but characters in `chars` string
// and alphanumeric chars is percent-encoded.
//
function getEncodeCache(exclude) {
  var i, ch, cache = encodeCache[exclude];
  if (cache) { return cache; }

  cache = encodeCache[exclude] = [];

  for (i = 0; i < 128; i++) {
    ch = String.fromCharCode(i);

    if (/^[0-9a-z]$/i.test(ch)) {
      // always allow unencoded alphanumeric characters
      cache.push(ch);
    } else {
      cache.push('%' + ('0' + i.toString(16).toUpperCase()).slice(-2));
    }
  }

  for (i = 0; i < exclude.length; i++) {
    cache[exclude.charCodeAt(i)] = exclude[i];
  }

  return cache;
}


// Encode unsafe characters with percent-encoding, skipping already
// encoded sequences.
//
//  - string       - string to encode
//  - exclude      - list of characters to ignore (in addition to a-zA-Z0-9)
//  - keepEscaped  - don't encode '%' in a correct escape sequence (default: true)
//
function encode(string, exclude, keepEscaped) {
  var i, l, code, nextCode, cache,
      result = '';

  if (typeof exclude !== 'string') {
    // encode(string, keepEscaped)
    keepEscaped  = exclude;
    exclude = encode.defaultChars;
  }

  if (typeof keepEscaped === 'undefined') {
    keepEscaped = true;
  }

  cache = getEncodeCache(exclude);

  for (i = 0, l = string.length; i < l; i++) {
    code = string.charCodeAt(i);

    if (keepEscaped && code === 0x25 /* % */ && i + 2 < l) {
      if (/^[0-9a-f]{2}$/i.test(string.slice(i + 1, i + 3))) {
        result += string.slice(i, i + 3);
        i += 2;
        continue;
      }
    }

    if (code < 128) {
      result += cache[code];
      continue;
    }

    if (code >= 0xD800 && code <= 0xDFFF) {
      if (code >= 0xD800 && code <= 0xDBFF && i + 1 < l) {
        nextCode = string.charCodeAt(i + 1);
        if (nextCode >= 0xDC00 && nextCode <= 0xDFFF) {
          result += encodeURIComponent(string[i] + string[i + 1]);
          i++;
          continue;
        }
      }
      result += '%EF%BF%BD';
      continue;
    }

    result += encodeURIComponent(string[i]);
  }

  return result;
}

encode.defaultChars   = ";/?:@&=+$,-_.!~*'()#";
encode.componentChars = "-_.!~*'()";


module.exports = encode;


/***/ }),

/***/ "../../../node_modules/mdurl/format.js":
/*!******************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/mdurl/format.js ***!
  \******************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";




module.exports = function format(url) {
  var result = '';

  result += url.protocol || '';
  result += url.slashes ? '//' : '';
  result += url.auth ? url.auth + '@' : '';

  if (url.hostname && url.hostname.indexOf(':') !== -1) {
    // ipv6 address
    result += '[' + url.hostname + ']';
  } else {
    result += url.hostname || '';
  }

  result += url.port ? ':' + url.port : '';
  result += url.pathname || '';
  result += url.search || '';
  result += url.hash || '';

  return result;
};


/***/ }),

/***/ "../../../node_modules/mdurl/index.js":
/*!*****************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/mdurl/index.js ***!
  \*****************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";



module.exports.encode = __webpack_require__(/*! ./encode */ "../../../node_modules/mdurl/encode.js");
module.exports.decode = __webpack_require__(/*! ./decode */ "../../../node_modules/mdurl/decode.js");
module.exports.format = __webpack_require__(/*! ./format */ "../../../node_modules/mdurl/format.js");
module.exports.parse  = __webpack_require__(/*! ./parse */ "../../../node_modules/mdurl/parse.js");


/***/ }),

/***/ "../../../node_modules/mdurl/parse.js":
/*!*****************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/mdurl/parse.js ***!
  \*****************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.



//
// Changes from joyent/node:
//
// 1. No leading slash in paths,
//    e.g. in `url.parse('http://foo?bar')` pathname is ``, not `/`
//
// 2. Backslashes are not replaced with slashes,
//    so `http:\\example.org\` is treated like a relative path
//
// 3. Trailing colon is treated like a part of the path,
//    i.e. in `http://example.org:foo` pathname is `:foo`
//
// 4. Nothing is URL-encoded in the resulting object,
//    (in joyent/node some chars in auth and paths are encoded)
//
// 5. `url.parse()` does not have `parseQueryString` argument
//
// 6. Removed extraneous result properties: `host`, `path`, `query`, etc.,
//    which can be constructed using other parts of the url.
//


function Url() {
  this.protocol = null;
  this.slashes = null;
  this.auth = null;
  this.port = null;
  this.hostname = null;
  this.hash = null;
  this.search = null;
  this.pathname = null;
}

// Reference: RFC 3986, RFC 1808, RFC 2396

// define these here so at least they only have to be
// compiled once on the first module load.
var protocolPattern = /^([a-z0-9.+-]+:)/i,
    portPattern = /:[0-9]*$/,

    // Special case for a simple path URL
    simplePathPattern = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/,

    // RFC 2396: characters reserved for delimiting URLs.
    // We actually just auto-escape these.
    delims = [ '<', '>', '"', '`', ' ', '\r', '\n', '\t' ],

    // RFC 2396: characters not allowed for various reasons.
    unwise = [ '{', '}', '|', '\\', '^', '`' ].concat(delims),

    // Allowed by RFCs, but cause of XSS attacks.  Always escape these.
    autoEscape = [ '\'' ].concat(unwise),
    // Characters that are never ever allowed in a hostname.
    // Note that any invalid chars are also handled, but these
    // are the ones that are *expected* to be seen, so we fast-path
    // them.
    nonHostChars = [ '%', '/', '?', ';', '#' ].concat(autoEscape),
    hostEndingChars = [ '/', '?', '#' ],
    hostnameMaxLen = 255,
    hostnamePartPattern = /^[+a-z0-9A-Z_-]{0,63}$/,
    hostnamePartStart = /^([+a-z0-9A-Z_-]{0,63})(.*)$/,
    // protocols that can allow "unsafe" and "unwise" chars.
    /* eslint-disable no-script-url */
    // protocols that never have a hostname.
    hostlessProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that always contain a // bit.
    slashedProtocol = {
      'http': true,
      'https': true,
      'ftp': true,
      'gopher': true,
      'file': true,
      'http:': true,
      'https:': true,
      'ftp:': true,
      'gopher:': true,
      'file:': true
    };
    /* eslint-enable no-script-url */

function urlParse(url, slashesDenoteHost) {
  if (url && url instanceof Url) { return url; }

  var u = new Url();
  u.parse(url, slashesDenoteHost);
  return u;
}

Url.prototype.parse = function(url, slashesDenoteHost) {
  var i, l, lowerProto, hec, slashes,
      rest = url;

  // trim before proceeding.
  // This is to support parse stuff like "  http://foo.com  \n"
  rest = rest.trim();

  if (!slashesDenoteHost && url.split('#').length === 1) {
    // Try fast path regexp
    var simplePath = simplePathPattern.exec(rest);
    if (simplePath) {
      this.pathname = simplePath[1];
      if (simplePath[2]) {
        this.search = simplePath[2];
      }
      return this;
    }
  }

  var proto = protocolPattern.exec(rest);
  if (proto) {
    proto = proto[0];
    lowerProto = proto.toLowerCase();
    this.protocol = proto;
    rest = rest.substr(proto.length);
  }

  // figure out if it's got a host
  // user@server is *always* interpreted as a hostname, and url
  // resolution will treat //foo/bar as host=foo,path=bar because that's
  // how the browser resolves relative URLs.
  if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
    slashes = rest.substr(0, 2) === '//';
    if (slashes && !(proto && hostlessProtocol[proto])) {
      rest = rest.substr(2);
      this.slashes = true;
    }
  }

  if (!hostlessProtocol[proto] &&
      (slashes || (proto && !slashedProtocol[proto]))) {

    // there's a hostname.
    // the first instance of /, ?, ;, or # ends the host.
    //
    // If there is an @ in the hostname, then non-host chars *are* allowed
    // to the left of the last @ sign, unless some host-ending character
    // comes *before* the @-sign.
    // URLs are obnoxious.
    //
    // ex:
    // http://a@b@c/ => user:a@b host:c
    // http://a@b?@c => user:a host:c path:/?@c

    // v0.12 TODO(isaacs): This is not quite how Chrome does things.
    // Review our test case against browsers more comprehensively.

    // find the first instance of any hostEndingChars
    var hostEnd = -1;
    for (i = 0; i < hostEndingChars.length; i++) {
      hec = rest.indexOf(hostEndingChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd)) {
        hostEnd = hec;
      }
    }

    // at this point, either we have an explicit point where the
    // auth portion cannot go past, or the last @ char is the decider.
    var auth, atSign;
    if (hostEnd === -1) {
      // atSign can be anywhere.
      atSign = rest.lastIndexOf('@');
    } else {
      // atSign must be in auth portion.
      // http://a@b/c@d => host:b auth:a path:/c@d
      atSign = rest.lastIndexOf('@', hostEnd);
    }

    // Now we have a portion which is definitely the auth.
    // Pull that off.
    if (atSign !== -1) {
      auth = rest.slice(0, atSign);
      rest = rest.slice(atSign + 1);
      this.auth = auth;
    }

    // the host is the remaining to the left of the first non-host char
    hostEnd = -1;
    for (i = 0; i < nonHostChars.length; i++) {
      hec = rest.indexOf(nonHostChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd)) {
        hostEnd = hec;
      }
    }
    // if we still have not hit it, then the entire thing is a host.
    if (hostEnd === -1) {
      hostEnd = rest.length;
    }

    if (rest[hostEnd - 1] === ':') { hostEnd--; }
    var host = rest.slice(0, hostEnd);
    rest = rest.slice(hostEnd);

    // pull out port.
    this.parseHost(host);

    // we've indicated that there is a hostname,
    // so even if it's empty, it has to be present.
    this.hostname = this.hostname || '';

    // if hostname begins with [ and ends with ]
    // assume that it's an IPv6 address.
    var ipv6Hostname = this.hostname[0] === '[' &&
        this.hostname[this.hostname.length - 1] === ']';

    // validate a little.
    if (!ipv6Hostname) {
      var hostparts = this.hostname.split(/\./);
      for (i = 0, l = hostparts.length; i < l; i++) {
        var part = hostparts[i];
        if (!part) { continue; }
        if (!part.match(hostnamePartPattern)) {
          var newpart = '';
          for (var j = 0, k = part.length; j < k; j++) {
            if (part.charCodeAt(j) > 127) {
              // we replace non-ASCII char with a temporary placeholder
              // we need this to make sure size of hostname is not
              // broken by replacing non-ASCII by nothing
              newpart += 'x';
            } else {
              newpart += part[j];
            }
          }
          // we test again with ASCII char only
          if (!newpart.match(hostnamePartPattern)) {
            var validParts = hostparts.slice(0, i);
            var notHost = hostparts.slice(i + 1);
            var bit = part.match(hostnamePartStart);
            if (bit) {
              validParts.push(bit[1]);
              notHost.unshift(bit[2]);
            }
            if (notHost.length) {
              rest = notHost.join('.') + rest;
            }
            this.hostname = validParts.join('.');
            break;
          }
        }
      }
    }

    if (this.hostname.length > hostnameMaxLen) {
      this.hostname = '';
    }

    // strip [ and ] from the hostname
    // the host field still retains them, though
    if (ipv6Hostname) {
      this.hostname = this.hostname.substr(1, this.hostname.length - 2);
    }
  }

  // chop off from the tail first.
  var hash = rest.indexOf('#');
  if (hash !== -1) {
    // got a fragment string.
    this.hash = rest.substr(hash);
    rest = rest.slice(0, hash);
  }
  var qm = rest.indexOf('?');
  if (qm !== -1) {
    this.search = rest.substr(qm);
    rest = rest.slice(0, qm);
  }
  if (rest) { this.pathname = rest; }
  if (slashedProtocol[lowerProto] &&
      this.hostname && !this.pathname) {
    this.pathname = '';
  }

  return this;
};

Url.prototype.parseHost = function(host) {
  var port = portPattern.exec(host);
  if (port) {
    port = port[0];
    if (port !== ':') {
      this.port = port.substr(1);
    }
    host = host.substr(0, host.length - port.length);
  }
  if (host) { this.hostname = host; }
};

module.exports = urlParse;


/***/ }),

/***/ "../../../node_modules/msbot/bin/models/index.js":
/*!*****************************************************************************************************************!*\
  !*** delegated ../../../node_modules/msbot/bin/models/index.js from dll-reference vendors_f58bfc701f0aa278ec3b ***!
  \*****************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

module.exports = (__webpack_require__(/*! dll-reference vendors_f58bfc701f0aa278ec3b */ "dll-reference vendors_f58bfc701f0aa278ec3b"))("../../../node_modules/msbot/bin/models/index.js");

/***/ }),

/***/ "../../../node_modules/msbot/bin/schema.js":
/*!***********************************************************************************************************!*\
  !*** delegated ../../../node_modules/msbot/bin/schema.js from dll-reference vendors_f58bfc701f0aa278ec3b ***!
  \***********************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

module.exports = (__webpack_require__(/*! dll-reference vendors_f58bfc701f0aa278ec3b */ "dll-reference vendors_f58bfc701f0aa278ec3b"))("../../../node_modules/msbot/bin/schema.js");

/***/ }),

/***/ "../../../node_modules/punycode/punycode.js":
/*!************************************************************************************************************!*\
  !*** delegated ../../../node_modules/punycode/punycode.js from dll-reference vendors_f58bfc701f0aa278ec3b ***!
  \************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

module.exports = (__webpack_require__(/*! dll-reference vendors_f58bfc701f0aa278ec3b */ "dll-reference vendors_f58bfc701f0aa278ec3b"))("../../../node_modules/punycode/punycode.js");

/***/ }),

/***/ "../../../node_modules/react-dom/index.js":
/*!**********************************************************************************************************!*\
  !*** delegated ../../../node_modules/react-dom/index.js from dll-reference vendors_f58bfc701f0aa278ec3b ***!
  \**********************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

module.exports = (__webpack_require__(/*! dll-reference vendors_f58bfc701f0aa278ec3b */ "dll-reference vendors_f58bfc701f0aa278ec3b"))("../../../node_modules/react-dom/index.js");

/***/ }),

/***/ "../../../node_modules/react-redux/es/index.js":
/*!***************************************************************************************************************!*\
  !*** delegated ../../../node_modules/react-redux/es/index.js from dll-reference vendors_f58bfc701f0aa278ec3b ***!
  \***************************************************************************************************************/
/*! exports provided: Provider, createProvider, connectAdvanced, connect */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

module.exports = (__webpack_require__(/*! dll-reference vendors_f58bfc701f0aa278ec3b */ "dll-reference vendors_f58bfc701f0aa278ec3b"))("../../../node_modules/react-redux/es/index.js");

/***/ }),

/***/ "../../../node_modules/react/index.js":
/*!******************************************************************************************************!*\
  !*** delegated ../../../node_modules/react/index.js from dll-reference vendors_f58bfc701f0aa278ec3b ***!
  \******************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

module.exports = (__webpack_require__(/*! dll-reference vendors_f58bfc701f0aa278ec3b */ "dll-reference vendors_f58bfc701f0aa278ec3b"))("../../../node_modules/react/index.js");

/***/ }),

/***/ "../../../node_modules/redux-observable/lib/ActionsObservable.js":
/*!********************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/redux-observable/lib/ActionsObservable.js ***!
  \********************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ActionsObservable = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Observable2 = __webpack_require__(/*! rxjs/Observable */ "../../../node_modules/rxjs/Observable.js");

var _of2 = __webpack_require__(/*! rxjs/observable/of */ "../../../node_modules/rxjs/observable/of.js");

var _from2 = __webpack_require__(/*! rxjs/observable/from */ "../../../node_modules/rxjs/observable/from.js");

var _filter = __webpack_require__(/*! rxjs/operator/filter */ "../../../node_modules/rxjs/operator/filter.js");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ActionsObservable = exports.ActionsObservable = function (_Observable) {
  _inherits(ActionsObservable, _Observable);

  _createClass(ActionsObservable, null, [{
    key: 'of',
    value: function of() {
      return new this(_of2.of.apply(undefined, arguments));
    }
  }, {
    key: 'from',
    value: function from(actions, scheduler) {
      return new this((0, _from2.from)(actions, scheduler));
    }
  }]);

  function ActionsObservable(actionsSubject) {
    _classCallCheck(this, ActionsObservable);

    var _this = _possibleConstructorReturn(this, (ActionsObservable.__proto__ || Object.getPrototypeOf(ActionsObservable)).call(this));

    _this.source = actionsSubject;
    return _this;
  }

  _createClass(ActionsObservable, [{
    key: 'lift',
    value: function lift(operator) {
      var observable = new ActionsObservable(this);
      observable.operator = operator;
      return observable;
    }
  }, {
    key: 'ofType',
    value: function ofType() {
      for (var _len = arguments.length, keys = Array(_len), _key = 0; _key < _len; _key++) {
        keys[_key] = arguments[_key];
      }

      return _filter.filter.call(this, function (_ref) {
        var type = _ref.type;

        var len = keys.length;
        if (len === 1) {
          return type === keys[0];
        } else {
          for (var i = 0; i < len; i++) {
            if (keys[i] === type) {
              return true;
            }
          }
        }
        return false;
      });
    }
  }]);

  return ActionsObservable;
}(_Observable2.Observable);

/***/ }),

/***/ "../../../node_modules/redux-observable/lib/EPIC_END.js":
/*!***********************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/redux-observable/lib/EPIC_END.js ***!
  \***********************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var EPIC_END = exports.EPIC_END = '@@redux-observable/EPIC_END';

/***/ }),

/***/ "../../../node_modules/redux-observable/lib/combineEpics.js":
/*!***************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/redux-observable/lib/combineEpics.js ***!
  \***************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.combineEpics = undefined;

var _merge = __webpack_require__(/*! rxjs/observable/merge */ "../../../node_modules/rxjs/observable/merge.js");

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/**
  Merges all epics into a single one.
 */
var combineEpics = exports.combineEpics = function combineEpics() {
  for (var _len = arguments.length, epics = Array(_len), _key = 0; _key < _len; _key++) {
    epics[_key] = arguments[_key];
  }

  return function () {
    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    return _merge.merge.apply(undefined, _toConsumableArray(epics.map(function (epic) {
      var output$ = epic.apply(undefined, args);
      if (!output$) {
        throw new TypeError('combineEpics: one of the provided Epics "' + (epic.name || '<anonymous>') + '" does not return a stream. Double check you\'re not missing a return statement!');
      }
      return output$;
    })));
  };
};

/***/ }),

/***/ "../../../node_modules/redux-observable/lib/createEpicMiddleware.js":
/*!***********************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/redux-observable/lib/createEpicMiddleware.js ***!
  \***********************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createEpicMiddleware = createEpicMiddleware;

var _Subject = __webpack_require__(/*! rxjs/Subject */ "../../../node_modules/rxjs/Subject.js");

var _map = __webpack_require__(/*! rxjs/operator/map */ "../../../node_modules/rxjs/operator/map.js");

var _switchMap = __webpack_require__(/*! rxjs/operator/switchMap */ "../../../node_modules/rxjs/operator/switchMap.js");

var _ActionsObservable = __webpack_require__(/*! ./ActionsObservable */ "../../../node_modules/redux-observable/lib/ActionsObservable.js");

var _EPIC_END = __webpack_require__(/*! ./EPIC_END */ "../../../node_modules/redux-observable/lib/EPIC_END.js");

var defaultAdapter = {
  input: function input(action$) {
    return action$;
  },
  output: function output(action$) {
    return action$;
  }
};

var defaultOptions = {
  adapter: defaultAdapter
};

function createEpicMiddleware(epic) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : defaultOptions,
      _ref$adapter = _ref.adapter,
      adapter = _ref$adapter === undefined ? defaultAdapter : _ref$adapter;

  if (typeof epic !== 'function') {
    throw new TypeError('You must provide a root Epic to createEpicMiddleware');
  }

  var input$ = new _Subject.Subject();
  var action$ = adapter.input(new _ActionsObservable.ActionsObservable(input$));
  var epic$ = new _Subject.Subject();
  var store = void 0;

  var epicMiddleware = function epicMiddleware(_store) {
    store = _store;

    return function (next) {
      var _context;

      (_context = _map.map.call(epic$, function (epic) {
        var output$ = epic(action$, store);
        if (!output$) {
          throw new TypeError('Your root Epic "' + (epic.name || '<anonymous>') + '" does not return a stream. Double check you\'re not missing a return statement!');
        }
        return output$;
      }), _switchMap.switchMap).call(_context, function (output$) {
        return adapter.output(output$);
      }).subscribe(store.dispatch);

      // Setup initial root epic
      epic$.next(epic);

      return function (action) {
        var result = next(action);
        input$.next(action);
        return result;
      };
    };
  };

  epicMiddleware.replaceEpic = function (epic) {
    // gives the previous root Epic a last chance
    // to do some clean up
    store.dispatch({ type: _EPIC_END.EPIC_END });
    // switches to the new root Epic, synchronously terminating
    // the previous one
    epic$.next(epic);
  };

  return epicMiddleware;
}

/***/ }),

/***/ "../../../node_modules/redux-observable/lib/index.js":
/*!********************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/redux-observable/lib/index.js ***!
  \********************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createEpicMiddleware = __webpack_require__(/*! ./createEpicMiddleware */ "../../../node_modules/redux-observable/lib/createEpicMiddleware.js");

Object.defineProperty(exports, 'createEpicMiddleware', {
  enumerable: true,
  get: function get() {
    return _createEpicMiddleware.createEpicMiddleware;
  }
});

var _ActionsObservable = __webpack_require__(/*! ./ActionsObservable */ "../../../node_modules/redux-observable/lib/ActionsObservable.js");

Object.defineProperty(exports, 'ActionsObservable', {
  enumerable: true,
  get: function get() {
    return _ActionsObservable.ActionsObservable;
  }
});

var _combineEpics = __webpack_require__(/*! ./combineEpics */ "../../../node_modules/redux-observable/lib/combineEpics.js");

Object.defineProperty(exports, 'combineEpics', {
  enumerable: true,
  get: function get() {
    return _combineEpics.combineEpics;
  }
});

var _EPIC_END = __webpack_require__(/*! ./EPIC_END */ "../../../node_modules/redux-observable/lib/EPIC_END.js");

Object.defineProperty(exports, 'EPIC_END', {
  enumerable: true,
  get: function get() {
    return _EPIC_END.EPIC_END;
  }
});

/***/ }),

/***/ "../../../node_modules/redux/es/index.js":
/*!*********************************************************************************************************!*\
  !*** delegated ../../../node_modules/redux/es/index.js from dll-reference vendors_f58bfc701f0aa278ec3b ***!
  \*********************************************************************************************************/
/*! exports provided: createStore, combineReducers, bindActionCreators, applyMiddleware, compose */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

module.exports = (__webpack_require__(/*! dll-reference vendors_f58bfc701f0aa278ec3b */ "dll-reference vendors_f58bfc701f0aa278ec3b"))("../../../node_modules/redux/es/index.js");

/***/ }),

/***/ "../../../node_modules/rxjs/BehaviorSubject.js":
/*!***************************************************************************************************************!*\
  !*** delegated ../../../node_modules/rxjs/BehaviorSubject.js from dll-reference vendors_f58bfc701f0aa278ec3b ***!
  \***************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

module.exports = (__webpack_require__(/*! dll-reference vendors_f58bfc701f0aa278ec3b */ "dll-reference vendors_f58bfc701f0aa278ec3b"))("../../../node_modules/rxjs/BehaviorSubject.js");

/***/ }),

/***/ "../../../node_modules/rxjs/Observable.js":
/*!**********************************************************************************************************!*\
  !*** delegated ../../../node_modules/rxjs/Observable.js from dll-reference vendors_f58bfc701f0aa278ec3b ***!
  \**********************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

module.exports = (__webpack_require__(/*! dll-reference vendors_f58bfc701f0aa278ec3b */ "dll-reference vendors_f58bfc701f0aa278ec3b"))("../../../node_modules/rxjs/Observable.js");

/***/ }),

/***/ "../../../node_modules/rxjs/Subject.js":
/*!*******************************************************************************************************!*\
  !*** delegated ../../../node_modules/rxjs/Subject.js from dll-reference vendors_f58bfc701f0aa278ec3b ***!
  \*******************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

module.exports = (__webpack_require__(/*! dll-reference vendors_f58bfc701f0aa278ec3b */ "dll-reference vendors_f58bfc701f0aa278ec3b"))("../../../node_modules/rxjs/Subject.js");

/***/ }),

/***/ "../../../node_modules/rxjs/add/observable/bindCallback.js":
/*!***************************************************************************************************************************!*\
  !*** delegated ../../../node_modules/rxjs/add/observable/bindCallback.js from dll-reference vendors_f58bfc701f0aa278ec3b ***!
  \***************************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

module.exports = (__webpack_require__(/*! dll-reference vendors_f58bfc701f0aa278ec3b */ "dll-reference vendors_f58bfc701f0aa278ec3b"))("../../../node_modules/rxjs/add/observable/bindCallback.js");

/***/ }),

/***/ "../../../node_modules/rxjs/add/observable/dom/ajax.js":
/*!***********************************************************************************************************************!*\
  !*** delegated ../../../node_modules/rxjs/add/observable/dom/ajax.js from dll-reference vendors_f58bfc701f0aa278ec3b ***!
  \***********************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

module.exports = (__webpack_require__(/*! dll-reference vendors_f58bfc701f0aa278ec3b */ "dll-reference vendors_f58bfc701f0aa278ec3b"))("../../../node_modules/rxjs/add/observable/dom/ajax.js");

/***/ }),

/***/ "../../../node_modules/rxjs/add/observable/empty.js":
/*!********************************************************************************************************************!*\
  !*** delegated ../../../node_modules/rxjs/add/observable/empty.js from dll-reference vendors_f58bfc701f0aa278ec3b ***!
  \********************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

module.exports = (__webpack_require__(/*! dll-reference vendors_f58bfc701f0aa278ec3b */ "dll-reference vendors_f58bfc701f0aa278ec3b"))("../../../node_modules/rxjs/add/observable/empty.js");

/***/ }),

/***/ "../../../node_modules/rxjs/add/observable/from.js":
/*!*******************************************************************************************************************!*\
  !*** delegated ../../../node_modules/rxjs/add/observable/from.js from dll-reference vendors_f58bfc701f0aa278ec3b ***!
  \*******************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

module.exports = (__webpack_require__(/*! dll-reference vendors_f58bfc701f0aa278ec3b */ "dll-reference vendors_f58bfc701f0aa278ec3b"))("../../../node_modules/rxjs/add/observable/from.js");

/***/ }),

/***/ "../../../node_modules/rxjs/add/observable/fromEvent.js":
/*!************************************************************************************************************************!*\
  !*** delegated ../../../node_modules/rxjs/add/observable/fromEvent.js from dll-reference vendors_f58bfc701f0aa278ec3b ***!
  \************************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

module.exports = (__webpack_require__(/*! dll-reference vendors_f58bfc701f0aa278ec3b */ "dll-reference vendors_f58bfc701f0aa278ec3b"))("../../../node_modules/rxjs/add/observable/fromEvent.js");

/***/ }),

/***/ "../../../node_modules/rxjs/add/observable/interval.js":
/*!***********************************************************************************************************************!*\
  !*** delegated ../../../node_modules/rxjs/add/observable/interval.js from dll-reference vendors_f58bfc701f0aa278ec3b ***!
  \***********************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

module.exports = (__webpack_require__(/*! dll-reference vendors_f58bfc701f0aa278ec3b */ "dll-reference vendors_f58bfc701f0aa278ec3b"))("../../../node_modules/rxjs/add/observable/interval.js");

/***/ }),

/***/ "../../../node_modules/rxjs/add/observable/merge.js":
/*!********************************************************************************************************************!*\
  !*** delegated ../../../node_modules/rxjs/add/observable/merge.js from dll-reference vendors_f58bfc701f0aa278ec3b ***!
  \********************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

module.exports = (__webpack_require__(/*! dll-reference vendors_f58bfc701f0aa278ec3b */ "dll-reference vendors_f58bfc701f0aa278ec3b"))("../../../node_modules/rxjs/add/observable/merge.js");

/***/ }),

/***/ "../../../node_modules/rxjs/add/observable/of.js":
/*!*****************************************************************************************************************!*\
  !*** delegated ../../../node_modules/rxjs/add/observable/of.js from dll-reference vendors_f58bfc701f0aa278ec3b ***!
  \*****************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

module.exports = (__webpack_require__(/*! dll-reference vendors_f58bfc701f0aa278ec3b */ "dll-reference vendors_f58bfc701f0aa278ec3b"))("../../../node_modules/rxjs/add/observable/of.js");

/***/ }),

/***/ "../../../node_modules/rxjs/add/observable/throw.js":
/*!********************************************************************************************************************!*\
  !*** delegated ../../../node_modules/rxjs/add/observable/throw.js from dll-reference vendors_f58bfc701f0aa278ec3b ***!
  \********************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

module.exports = (__webpack_require__(/*! dll-reference vendors_f58bfc701f0aa278ec3b */ "dll-reference vendors_f58bfc701f0aa278ec3b"))("../../../node_modules/rxjs/add/observable/throw.js");

/***/ }),

/***/ "../../../node_modules/rxjs/add/operator/catch.js":
/*!******************************************************************************************************************!*\
  !*** delegated ../../../node_modules/rxjs/add/operator/catch.js from dll-reference vendors_f58bfc701f0aa278ec3b ***!
  \******************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

module.exports = (__webpack_require__(/*! dll-reference vendors_f58bfc701f0aa278ec3b */ "dll-reference vendors_f58bfc701f0aa278ec3b"))("../../../node_modules/rxjs/add/operator/catch.js");

/***/ }),

/***/ "../../../node_modules/rxjs/add/operator/combineLatest.js":
/*!**************************************************************************************************************************!*\
  !*** delegated ../../../node_modules/rxjs/add/operator/combineLatest.js from dll-reference vendors_f58bfc701f0aa278ec3b ***!
  \**************************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

module.exports = (__webpack_require__(/*! dll-reference vendors_f58bfc701f0aa278ec3b */ "dll-reference vendors_f58bfc701f0aa278ec3b"))("../../../node_modules/rxjs/add/operator/combineLatest.js");

/***/ }),

/***/ "../../../node_modules/rxjs/add/operator/count.js":
/*!******************************************************************************************************************!*\
  !*** delegated ../../../node_modules/rxjs/add/operator/count.js from dll-reference vendors_f58bfc701f0aa278ec3b ***!
  \******************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

module.exports = (__webpack_require__(/*! dll-reference vendors_f58bfc701f0aa278ec3b */ "dll-reference vendors_f58bfc701f0aa278ec3b"))("../../../node_modules/rxjs/add/operator/count.js");

/***/ }),

/***/ "../../../node_modules/rxjs/add/operator/delay.js":
/*!******************************************************************************************************************!*\
  !*** delegated ../../../node_modules/rxjs/add/operator/delay.js from dll-reference vendors_f58bfc701f0aa278ec3b ***!
  \******************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

module.exports = (__webpack_require__(/*! dll-reference vendors_f58bfc701f0aa278ec3b */ "dll-reference vendors_f58bfc701f0aa278ec3b"))("../../../node_modules/rxjs/add/operator/delay.js");

/***/ }),

/***/ "../../../node_modules/rxjs/add/operator/do.js":
/*!***************************************************************************************************************!*\
  !*** delegated ../../../node_modules/rxjs/add/operator/do.js from dll-reference vendors_f58bfc701f0aa278ec3b ***!
  \***************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

module.exports = (__webpack_require__(/*! dll-reference vendors_f58bfc701f0aa278ec3b */ "dll-reference vendors_f58bfc701f0aa278ec3b"))("../../../node_modules/rxjs/add/operator/do.js");

/***/ }),

/***/ "../../../node_modules/rxjs/add/operator/filter.js":
/*!*******************************************************************************************************************!*\
  !*** delegated ../../../node_modules/rxjs/add/operator/filter.js from dll-reference vendors_f58bfc701f0aa278ec3b ***!
  \*******************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

module.exports = (__webpack_require__(/*! dll-reference vendors_f58bfc701f0aa278ec3b */ "dll-reference vendors_f58bfc701f0aa278ec3b"))("../../../node_modules/rxjs/add/operator/filter.js");

/***/ }),

/***/ "../../../node_modules/rxjs/add/operator/map.js":
/*!****************************************************************************************************************!*\
  !*** delegated ../../../node_modules/rxjs/add/operator/map.js from dll-reference vendors_f58bfc701f0aa278ec3b ***!
  \****************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

module.exports = (__webpack_require__(/*! dll-reference vendors_f58bfc701f0aa278ec3b */ "dll-reference vendors_f58bfc701f0aa278ec3b"))("../../../node_modules/rxjs/add/operator/map.js");

/***/ }),

/***/ "../../../node_modules/rxjs/add/operator/merge.js":
/*!******************************************************************************************************************!*\
  !*** delegated ../../../node_modules/rxjs/add/operator/merge.js from dll-reference vendors_f58bfc701f0aa278ec3b ***!
  \******************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

module.exports = (__webpack_require__(/*! dll-reference vendors_f58bfc701f0aa278ec3b */ "dll-reference vendors_f58bfc701f0aa278ec3b"))("../../../node_modules/rxjs/add/operator/merge.js");

/***/ }),

/***/ "../../../node_modules/rxjs/add/operator/mergeMap.js":
/*!*********************************************************************************************************************!*\
  !*** delegated ../../../node_modules/rxjs/add/operator/mergeMap.js from dll-reference vendors_f58bfc701f0aa278ec3b ***!
  \*********************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

module.exports = (__webpack_require__(/*! dll-reference vendors_f58bfc701f0aa278ec3b */ "dll-reference vendors_f58bfc701f0aa278ec3b"))("../../../node_modules/rxjs/add/operator/mergeMap.js");

/***/ }),

/***/ "../../../node_modules/rxjs/add/operator/retryWhen.js":
/*!**********************************************************************************************************************!*\
  !*** delegated ../../../node_modules/rxjs/add/operator/retryWhen.js from dll-reference vendors_f58bfc701f0aa278ec3b ***!
  \**********************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

module.exports = (__webpack_require__(/*! dll-reference vendors_f58bfc701f0aa278ec3b */ "dll-reference vendors_f58bfc701f0aa278ec3b"))("../../../node_modules/rxjs/add/operator/retryWhen.js");

/***/ }),

/***/ "../../../node_modules/rxjs/add/operator/share.js":
/*!******************************************************************************************************************!*\
  !*** delegated ../../../node_modules/rxjs/add/operator/share.js from dll-reference vendors_f58bfc701f0aa278ec3b ***!
  \******************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

module.exports = (__webpack_require__(/*! dll-reference vendors_f58bfc701f0aa278ec3b */ "dll-reference vendors_f58bfc701f0aa278ec3b"))("../../../node_modules/rxjs/add/operator/share.js");

/***/ }),

/***/ "../../../node_modules/rxjs/add/operator/take.js":
/*!*****************************************************************************************************************!*\
  !*** delegated ../../../node_modules/rxjs/add/operator/take.js from dll-reference vendors_f58bfc701f0aa278ec3b ***!
  \*****************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

module.exports = (__webpack_require__(/*! dll-reference vendors_f58bfc701f0aa278ec3b */ "dll-reference vendors_f58bfc701f0aa278ec3b"))("../../../node_modules/rxjs/add/operator/take.js");

/***/ }),

/***/ "../../../node_modules/rxjs/add/operator/takeUntil.js":
/*!**********************************************************************************************************************!*\
  !*** delegated ../../../node_modules/rxjs/add/operator/takeUntil.js from dll-reference vendors_f58bfc701f0aa278ec3b ***!
  \**********************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

module.exports = (__webpack_require__(/*! dll-reference vendors_f58bfc701f0aa278ec3b */ "dll-reference vendors_f58bfc701f0aa278ec3b"))("../../../node_modules/rxjs/add/operator/takeUntil.js");

/***/ }),

/***/ "../../../node_modules/rxjs/add/operator/throttleTime.js":
/*!*************************************************************************************************************************!*\
  !*** delegated ../../../node_modules/rxjs/add/operator/throttleTime.js from dll-reference vendors_f58bfc701f0aa278ec3b ***!
  \*************************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

module.exports = (__webpack_require__(/*! dll-reference vendors_f58bfc701f0aa278ec3b */ "dll-reference vendors_f58bfc701f0aa278ec3b"))("../../../node_modules/rxjs/add/operator/throttleTime.js");

/***/ }),

/***/ "../../../node_modules/rxjs/observable/from.js":
/*!***************************************************************************************************************!*\
  !*** delegated ../../../node_modules/rxjs/observable/from.js from dll-reference vendors_f58bfc701f0aa278ec3b ***!
  \***************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

module.exports = (__webpack_require__(/*! dll-reference vendors_f58bfc701f0aa278ec3b */ "dll-reference vendors_f58bfc701f0aa278ec3b"))("../../../node_modules/rxjs/observable/from.js");

/***/ }),

/***/ "../../../node_modules/rxjs/observable/merge.js":
/*!****************************************************************************************************************!*\
  !*** delegated ../../../node_modules/rxjs/observable/merge.js from dll-reference vendors_f58bfc701f0aa278ec3b ***!
  \****************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

module.exports = (__webpack_require__(/*! dll-reference vendors_f58bfc701f0aa278ec3b */ "dll-reference vendors_f58bfc701f0aa278ec3b"))("../../../node_modules/rxjs/observable/merge.js");

/***/ }),

/***/ "../../../node_modules/rxjs/observable/of.js":
/*!*************************************************************************************************************!*\
  !*** delegated ../../../node_modules/rxjs/observable/of.js from dll-reference vendors_f58bfc701f0aa278ec3b ***!
  \*************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

module.exports = (__webpack_require__(/*! dll-reference vendors_f58bfc701f0aa278ec3b */ "dll-reference vendors_f58bfc701f0aa278ec3b"))("../../../node_modules/rxjs/observable/of.js");

/***/ }),

/***/ "../../../node_modules/rxjs/operator/filter.js":
/*!***************************************************************************************************************!*\
  !*** delegated ../../../node_modules/rxjs/operator/filter.js from dll-reference vendors_f58bfc701f0aa278ec3b ***!
  \***************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

module.exports = (__webpack_require__(/*! dll-reference vendors_f58bfc701f0aa278ec3b */ "dll-reference vendors_f58bfc701f0aa278ec3b"))("../../../node_modules/rxjs/operator/filter.js");

/***/ }),

/***/ "../../../node_modules/rxjs/operator/map.js":
/*!************************************************************************************************************!*\
  !*** delegated ../../../node_modules/rxjs/operator/map.js from dll-reference vendors_f58bfc701f0aa278ec3b ***!
  \************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

module.exports = (__webpack_require__(/*! dll-reference vendors_f58bfc701f0aa278ec3b */ "dll-reference vendors_f58bfc701f0aa278ec3b"))("../../../node_modules/rxjs/operator/map.js");

/***/ }),

/***/ "../../../node_modules/rxjs/operator/switchMap.js":
/*!******************************************************************************************************************!*\
  !*** delegated ../../../node_modules/rxjs/operator/switchMap.js from dll-reference vendors_f58bfc701f0aa278ec3b ***!
  \******************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

module.exports = (__webpack_require__(/*! dll-reference vendors_f58bfc701f0aa278ec3b */ "dll-reference vendors_f58bfc701f0aa278ec3b"))("../../../node_modules/rxjs/operator/switchMap.js");

/***/ }),

/***/ "../../../node_modules/tslib/tslib.es6.js":
/*!**********************************************************************************************************!*\
  !*** delegated ../../../node_modules/tslib/tslib.es6.js from dll-reference vendors_f58bfc701f0aa278ec3b ***!
  \**********************************************************************************************************/
/*! exports provided: __extends, __assign, __rest, __decorate, __param, __metadata, __awaiter, __generator, __exportStar, __values, __read, __spread, __await, __asyncGenerator, __asyncDelegator, __asyncValues, __makeTemplateObject, __importStar, __importDefault */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

module.exports = (__webpack_require__(/*! dll-reference vendors_f58bfc701f0aa278ec3b */ "dll-reference vendors_f58bfc701f0aa278ec3b"))("../../../node_modules/tslib/tslib.es6.js");

/***/ }),

/***/ "../../../node_modules/uc.micro/categories/Cc/regex.js":
/*!**********************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/uc.micro/categories/Cc/regex.js ***!
  \**********************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

module.exports=/[\0-\x1F\x7F-\x9F]/

/***/ }),

/***/ "../../../node_modules/uc.micro/categories/Cf/regex.js":
/*!**********************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/uc.micro/categories/Cf/regex.js ***!
  \**********************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

module.exports=/[\xAD\u0600-\u0605\u061C\u06DD\u070F\u08E2\u180E\u200B-\u200F\u202A-\u202E\u2060-\u2064\u2066-\u206F\uFEFF\uFFF9-\uFFFB]|\uD804\uDCBD|\uD82F[\uDCA0-\uDCA3]|\uD834[\uDD73-\uDD7A]|\uDB40[\uDC01\uDC20-\uDC7F]/

/***/ }),

/***/ "../../../node_modules/uc.micro/categories/P/regex.js":
/*!*********************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/uc.micro/categories/P/regex.js ***!
  \*********************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

module.exports=/[!-#%-\*,-/:;\?@\[-\]_\{\}\xA1\xA7\xAB\xB6\xB7\xBB\xBF\u037E\u0387\u055A-\u055F\u0589\u058A\u05BE\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061E\u061F\u066A-\u066D\u06D4\u0700-\u070D\u07F7-\u07F9\u0830-\u083E\u085E\u0964\u0965\u0970\u09FD\u0AF0\u0DF4\u0E4F\u0E5A\u0E5B\u0F04-\u0F12\u0F14\u0F3A-\u0F3D\u0F85\u0FD0-\u0FD4\u0FD9\u0FDA\u104A-\u104F\u10FB\u1360-\u1368\u1400\u166D\u166E\u169B\u169C\u16EB-\u16ED\u1735\u1736\u17D4-\u17D6\u17D8-\u17DA\u1800-\u180A\u1944\u1945\u1A1E\u1A1F\u1AA0-\u1AA6\u1AA8-\u1AAD\u1B5A-\u1B60\u1BFC-\u1BFF\u1C3B-\u1C3F\u1C7E\u1C7F\u1CC0-\u1CC7\u1CD3\u2010-\u2027\u2030-\u2043\u2045-\u2051\u2053-\u205E\u207D\u207E\u208D\u208E\u2308-\u230B\u2329\u232A\u2768-\u2775\u27C5\u27C6\u27E6-\u27EF\u2983-\u2998\u29D8-\u29DB\u29FC\u29FD\u2CF9-\u2CFC\u2CFE\u2CFF\u2D70\u2E00-\u2E2E\u2E30-\u2E49\u3001-\u3003\u3008-\u3011\u3014-\u301F\u3030\u303D\u30A0\u30FB\uA4FE\uA4FF\uA60D-\uA60F\uA673\uA67E\uA6F2-\uA6F7\uA874-\uA877\uA8CE\uA8CF\uA8F8-\uA8FA\uA8FC\uA92E\uA92F\uA95F\uA9C1-\uA9CD\uA9DE\uA9DF\uAA5C-\uAA5F\uAADE\uAADF\uAAF0\uAAF1\uABEB\uFD3E\uFD3F\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE61\uFE63\uFE68\uFE6A\uFE6B\uFF01-\uFF03\uFF05-\uFF0A\uFF0C-\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3B-\uFF3D\uFF3F\uFF5B\uFF5D\uFF5F-\uFF65]|\uD800[\uDD00-\uDD02\uDF9F\uDFD0]|\uD801\uDD6F|\uD802[\uDC57\uDD1F\uDD3F\uDE50-\uDE58\uDE7F\uDEF0-\uDEF6\uDF39-\uDF3F\uDF99-\uDF9C]|\uD804[\uDC47-\uDC4D\uDCBB\uDCBC\uDCBE-\uDCC1\uDD40-\uDD43\uDD74\uDD75\uDDC5-\uDDC9\uDDCD\uDDDB\uDDDD-\uDDDF\uDE38-\uDE3D\uDEA9]|\uD805[\uDC4B-\uDC4F\uDC5B\uDC5D\uDCC6\uDDC1-\uDDD7\uDE41-\uDE43\uDE60-\uDE6C\uDF3C-\uDF3E]|\uD806[\uDE3F-\uDE46\uDE9A-\uDE9C\uDE9E-\uDEA2]|\uD807[\uDC41-\uDC45\uDC70\uDC71]|\uD809[\uDC70-\uDC74]|\uD81A[\uDE6E\uDE6F\uDEF5\uDF37-\uDF3B\uDF44]|\uD82F\uDC9F|\uD836[\uDE87-\uDE8B]|\uD83A[\uDD5E\uDD5F]/

/***/ }),

/***/ "../../../node_modules/uc.micro/categories/Z/regex.js":
/*!*********************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/uc.micro/categories/Z/regex.js ***!
  \*********************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

module.exports=/[ \xA0\u1680\u2000-\u200A\u202F\u205F\u3000]/

/***/ }),

/***/ "../../../node_modules/uc.micro/index.js":
/*!********************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/uc.micro/index.js ***!
  \********************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.Any = __webpack_require__(/*! ./properties/Any/regex */ "../../../node_modules/uc.micro/properties/Any/regex.js");
exports.Cc  = __webpack_require__(/*! ./categories/Cc/regex */ "../../../node_modules/uc.micro/categories/Cc/regex.js");
exports.Cf  = __webpack_require__(/*! ./categories/Cf/regex */ "../../../node_modules/uc.micro/categories/Cf/regex.js");
exports.P   = __webpack_require__(/*! ./categories/P/regex */ "../../../node_modules/uc.micro/categories/P/regex.js");
exports.Z   = __webpack_require__(/*! ./categories/Z/regex */ "../../../node_modules/uc.micro/categories/Z/regex.js");


/***/ }),

/***/ "../../../node_modules/uc.micro/properties/Any/regex.js":
/*!***********************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/uc.micro/properties/Any/regex.js ***!
  \***********************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

module.exports=/[\0-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/

/***/ }),

/***/ "../../../node_modules/uuid/lib/bytesToUuid.js":
/*!**************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/uuid/lib/bytesToUuid.js ***!
  \**************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

/**
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */
var byteToHex = [];
for (var i = 0; i < 256; ++i) {
  byteToHex[i] = (i + 0x100).toString(16).substr(1);
}

function bytesToUuid(buf, offset) {
  var i = offset || 0;
  var bth = byteToHex;
  return bth[buf[i++]] + bth[buf[i++]] +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] +
          bth[buf[i++]] + bth[buf[i++]] +
          bth[buf[i++]] + bth[buf[i++]];
}

module.exports = bytesToUuid;


/***/ }),

/***/ "../../../node_modules/uuid/lib/rng-browser.js":
/*!**************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/uuid/lib/rng-browser.js ***!
  \**************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

// Unique ID creation requires a high quality random # generator.  In the
// browser this is a little complicated due to unknown quality of Math.random()
// and inconsistent support for the `crypto` API.  We do the best we can via
// feature-detection

// getRandomValues needs to be invoked in a context where "this" is a Crypto implementation.
var getRandomValues = (typeof(crypto) != 'undefined' && crypto.getRandomValues.bind(crypto)) ||
                      (typeof(msCrypto) != 'undefined' && msCrypto.getRandomValues.bind(msCrypto));
if (getRandomValues) {
  // WHATWG crypto RNG - http://wiki.whatwg.org/wiki/Crypto
  var rnds8 = new Uint8Array(16); // eslint-disable-line no-undef

  module.exports = function whatwgRNG() {
    getRandomValues(rnds8);
    return rnds8;
  };
} else {
  // Math.random()-based (RNG)
  //
  // If all else fails, use Math.random().  It's fast, but is of unspecified
  // quality.
  var rnds = new Array(16);

  module.exports = function mathRNG() {
    for (var i = 0, r; i < 16; i++) {
      if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
      rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
    }

    return rnds;
  };
}


/***/ }),

/***/ "../../../node_modules/uuid/v1.js":
/*!*************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/node_modules/uuid/v1.js ***!
  \*************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

var rng = __webpack_require__(/*! ./lib/rng */ "../../../node_modules/uuid/lib/rng-browser.js");
var bytesToUuid = __webpack_require__(/*! ./lib/bytesToUuid */ "../../../node_modules/uuid/lib/bytesToUuid.js");

// **`v1()` - Generate time-based UUID**
//
// Inspired by https://github.com/LiosK/UUID.js
// and http://docs.python.org/library/uuid.html

var _nodeId;
var _clockseq;

// Previous uuid creation time
var _lastMSecs = 0;
var _lastNSecs = 0;

// See https://github.com/broofa/node-uuid for API details
function v1(options, buf, offset) {
  var i = buf && offset || 0;
  var b = buf || [];

  options = options || {};
  var node = options.node || _nodeId;
  var clockseq = options.clockseq !== undefined ? options.clockseq : _clockseq;

  // node and clockseq need to be initialized to random values if they're not
  // specified.  We do this lazily to minimize issues related to insufficient
  // system entropy.  See #189
  if (node == null || clockseq == null) {
    var seedBytes = rng();
    if (node == null) {
      // Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
      node = _nodeId = [
        seedBytes[0] | 0x01,
        seedBytes[1], seedBytes[2], seedBytes[3], seedBytes[4], seedBytes[5]
      ];
    }
    if (clockseq == null) {
      // Per 4.2.2, randomize (14 bit) clockseq
      clockseq = _clockseq = (seedBytes[6] << 8 | seedBytes[7]) & 0x3fff;
    }
  }

  // UUID timestamps are 100 nano-second units since the Gregorian epoch,
  // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
  // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
  // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.
  var msecs = options.msecs !== undefined ? options.msecs : new Date().getTime();

  // Per 4.2.1.2, use count of uuid's generated during the current clock
  // cycle to simulate higher resolution clock
  var nsecs = options.nsecs !== undefined ? options.nsecs : _lastNSecs + 1;

  // Time since last uuid creation (in msecs)
  var dt = (msecs - _lastMSecs) + (nsecs - _lastNSecs)/10000;

  // Per 4.2.1.2, Bump clockseq on clock regression
  if (dt < 0 && options.clockseq === undefined) {
    clockseq = clockseq + 1 & 0x3fff;
  }

  // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
  // time interval
  if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === undefined) {
    nsecs = 0;
  }

  // Per 4.2.1.2 Throw error if too many uuids are requested
  if (nsecs >= 10000) {
    throw new Error('uuid.v1(): Can\'t create more than 10M uuids/sec');
  }

  _lastMSecs = msecs;
  _lastNSecs = nsecs;
  _clockseq = clockseq;

  // Per 4.1.4 - Convert from unix epoch to Gregorian epoch
  msecs += 12219292800000;

  // `time_low`
  var tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
  b[i++] = tl >>> 24 & 0xff;
  b[i++] = tl >>> 16 & 0xff;
  b[i++] = tl >>> 8 & 0xff;
  b[i++] = tl & 0xff;

  // `time_mid`
  var tmh = (msecs / 0x100000000 * 10000) & 0xfffffff;
  b[i++] = tmh >>> 8 & 0xff;
  b[i++] = tmh & 0xff;

  // `time_high_and_version`
  b[i++] = tmh >>> 24 & 0xf | 0x10; // include version
  b[i++] = tmh >>> 16 & 0xff;

  // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)
  b[i++] = clockseq >>> 8 | 0x80;

  // `clock_seq_low`
  b[i++] = clockseq & 0xff;

  // `node`
  for (var n = 0; n < 6; ++n) {
    b[i + n] = node[n];
  }

  return buf ? buf : bytesToUuid(b);
}

module.exports = v1;


/***/ }),

/***/ "../../custom-botframework-directlinejs/built/directLine.js":
/*!***************************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/packages/custom-botframework-directlinejs/built/directLine.js ***!
  \***************************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// In order to keep file size down, only import the parts of rxjs that we use
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
const BehaviorSubject_1 = __webpack_require__(/*! rxjs/BehaviorSubject */ "../../../node_modules/rxjs/BehaviorSubject.js");
const Observable_1 = __webpack_require__(/*! rxjs/Observable */ "../../../node_modules/rxjs/Observable.js");
__webpack_require__(/*! rxjs/add/operator/catch */ "../../../node_modules/rxjs/add/operator/catch.js");
__webpack_require__(/*! rxjs/add/operator/combineLatest */ "../../../node_modules/rxjs/add/operator/combineLatest.js");
__webpack_require__(/*! rxjs/add/operator/count */ "../../../node_modules/rxjs/add/operator/count.js");
__webpack_require__(/*! rxjs/add/operator/delay */ "../../../node_modules/rxjs/add/operator/delay.js");
__webpack_require__(/*! rxjs/add/operator/do */ "../../../node_modules/rxjs/add/operator/do.js");
__webpack_require__(/*! rxjs/add/operator/filter */ "../../../node_modules/rxjs/add/operator/filter.js");
__webpack_require__(/*! rxjs/add/operator/map */ "../../../node_modules/rxjs/add/operator/map.js");
__webpack_require__(/*! rxjs/add/operator/mergeMap */ "../../../node_modules/rxjs/add/operator/mergeMap.js");
__webpack_require__(/*! rxjs/add/operator/retryWhen */ "../../../node_modules/rxjs/add/operator/retryWhen.js");
__webpack_require__(/*! rxjs/add/operator/share */ "../../../node_modules/rxjs/add/operator/share.js");
__webpack_require__(/*! rxjs/add/operator/take */ "../../../node_modules/rxjs/add/operator/take.js");
__webpack_require__(/*! rxjs/add/observable/dom/ajax */ "../../../node_modules/rxjs/add/observable/dom/ajax.js");
__webpack_require__(/*! rxjs/add/observable/empty */ "../../../node_modules/rxjs/add/observable/empty.js");
__webpack_require__(/*! rxjs/add/observable/from */ "../../../node_modules/rxjs/add/observable/from.js");
__webpack_require__(/*! rxjs/add/observable/interval */ "../../../node_modules/rxjs/add/observable/interval.js");
__webpack_require__(/*! rxjs/add/observable/of */ "../../../node_modules/rxjs/add/observable/of.js");
__webpack_require__(/*! rxjs/add/observable/throw */ "../../../node_modules/rxjs/add/observable/throw.js");
// These types are specific to this client library, not to Direct Line 3.0
var ConnectionStatus;
(function (ConnectionStatus) {
    ConnectionStatus[ConnectionStatus["Uninitialized"] = 0] = "Uninitialized";
    ConnectionStatus[ConnectionStatus["Connecting"] = 1] = "Connecting";
    ConnectionStatus[ConnectionStatus["Online"] = 2] = "Online";
    ConnectionStatus[ConnectionStatus["ExpiredToken"] = 3] = "ExpiredToken";
    ConnectionStatus[ConnectionStatus["FailedToConnect"] = 4] = "FailedToConnect";
    ConnectionStatus[ConnectionStatus["Ended"] = 5] = "Ended"; // the bot ended the conversation
})(ConnectionStatus = exports.ConnectionStatus || (exports.ConnectionStatus = {}));
const lifetimeRefreshToken = 30 * 60 * 1000;
const intervalRefreshToken = lifetimeRefreshToken / 2;
const timeout = 20 * 1000;
const retries = (lifetimeRefreshToken - intervalRefreshToken) / timeout;
const errorExpiredToken = new Error("expired token");
const errorConversationEnded = new Error("conversation ended");
const errorFailedToConnect = new Error("failed to connect");
const konsole = {
    log: (message, ...optionalParams) => {
        if (typeof (window) !== 'undefined' && window["botchatDebug"] && message)
            console.log(message, ...optionalParams);
    }
};
class DirectLine {
    constructor(options) {
        this.connectionStatus$ = new BehaviorSubject_1.BehaviorSubject(ConnectionStatus.Uninitialized);
        this.domain = "https://directline.botframework.com/v3/directline";
        this.watermark = '';
        this.pollingInterval = 1000;
        this.secret = options.secret;
        this.token = options.secret || options.token;
        this.webSocket = (options.webSocket === undefined ? true : options.webSocket) && typeof WebSocket !== 'undefined' && WebSocket !== undefined;
        if (options.domain)
            this.domain = options.domain;
        if (options.conversationId) {
            this.conversationId = options.conversationId;
        }
        if (options.watermark) {
            if (this.webSocket)
                console.warn("Watermark was ignored: it is not supported using websockets at the moment");
            else
                this.watermark = options.watermark;
        }
        if (options.streamUrl) {
            if (options.token && options.conversationId)
                this.streamUrl = options.streamUrl;
            else
                console.warn("streamUrl was ignored: you need to provide a token and a conversationid");
        }
        if (options.pollingInterval !== undefined)
            this.pollingInterval = options.pollingInterval;
        this.activity$ = (this.webSocket
            ? this.webSocketActivity$()
            : this.pollingGetActivity$()).share();
    }
    // Every time we're about to make a Direct Line REST call, we call this first to see check the current connection status.
    // Either throws an error (indicating an error state) or emits a null, indicating a (presumably) healthy connection
    checkConnection(once = false) {
        let obs = this.connectionStatus$
            .flatMap(connectionStatus => {
            if (connectionStatus === ConnectionStatus.Uninitialized) {
                this.connectionStatus$.next(ConnectionStatus.Connecting);
                //if token and streamUrl are defined it means reconnect has already been done. Skipping it.
                if (this.token && this.streamUrl) {
                    this.connectionStatus$.next(ConnectionStatus.Online);
                    return Observable_1.Observable.of(connectionStatus);
                }
                else {
                    return this.startConversation().do(conversation => {
                        this.conversationId = conversation.conversationId;
                        this.token = this.secret || conversation.token;
                        this.streamUrl = conversation.streamUrl;
                        this.referenceGrammarId = conversation.referenceGrammarId;
                        if (!this.secret)
                            this.refreshTokenLoop();
                        this.connectionStatus$.next(ConnectionStatus.Online);
                    }, error => {
                        this.connectionStatus$.next(ConnectionStatus.FailedToConnect);
                    })
                        .map(_ => connectionStatus);
                }
            }
            else {
                return Observable_1.Observable.of(connectionStatus);
            }
        })
            .filter(connectionStatus => connectionStatus != ConnectionStatus.Uninitialized && connectionStatus != ConnectionStatus.Connecting)
            .flatMap(connectionStatus => {
            switch (connectionStatus) {
                case ConnectionStatus.Ended:
                    return Observable_1.Observable.throw(errorConversationEnded);
                case ConnectionStatus.FailedToConnect:
                    return Observable_1.Observable.throw(errorFailedToConnect);
                case ConnectionStatus.ExpiredToken:
                    return Observable_1.Observable.throw(errorExpiredToken);
                default:
                    return Observable_1.Observable.of(null);
            }
        });
        return once ? obs.take(1) : obs;
    }
    expiredToken() {
        const connectionStatus = this.connectionStatus$.getValue();
        if (connectionStatus != ConnectionStatus.Ended && connectionStatus != ConnectionStatus.FailedToConnect)
            this.connectionStatus$.next(ConnectionStatus.ExpiredToken);
    }
    startConversation() {
        //if conversationid is set here, it means we need to call the reconnect api, else it is a new conversation
        const url = this.conversationId
            ? `${this.domain}/conversations/${this.conversationId}?watermark=${this.watermark}`
            : `${this.domain}/conversations`;
        const method = this.conversationId ? "GET" : "POST";
        return Observable_1.Observable.ajax({
            method,
            url,
            timeout,
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${this.token}`
            }
        })
            .map(ajaxResponse => ajaxResponse.response)
            .retryWhen(error$ => 
        // for now we deem 4xx and 5xx errors as unrecoverable
        // for everything else (timeouts), retry for a while
        error$.mergeMap(error => error.status >= 400 && error.status < 600
            ? Observable_1.Observable.throw(error)
            : Observable_1.Observable.of(error))
            .delay(timeout)
            .take(retries));
    }
    refreshTokenLoop() {
        this.tokenRefreshSubscription = Observable_1.Observable.interval(intervalRefreshToken)
            .flatMap(_ => this.refreshToken())
            .subscribe(token => {
            konsole.log("refreshing token", token, "at", new Date());
            this.token = token;
        });
    }
    refreshToken() {
        return this.checkConnection(true)
            .flatMap(_ => Observable_1.Observable.ajax({
            method: "POST",
            url: `${this.domain}/tokens/refresh`,
            timeout,
            headers: {
                "Authorization": `Bearer ${this.token}`
            }
        })
            .map(ajaxResponse => ajaxResponse.response.token)
            .retryWhen(error$ => error$
            .mergeMap(error => {
            if (error.status === 403) {
                // if the token is expired there's no reason to keep trying
                this.expiredToken();
                return Observable_1.Observable.throw(error);
            }
            return Observable_1.Observable.of(error);
        })
            .delay(timeout)
            .take(retries)));
    }
    reconnect(conversation) {
        this.token = conversation.token;
        this.streamUrl = conversation.streamUrl;
        if (this.connectionStatus$.getValue() === ConnectionStatus.ExpiredToken)
            this.connectionStatus$.next(ConnectionStatus.Online);
    }
    end() {
        if (this.tokenRefreshSubscription)
            this.tokenRefreshSubscription.unsubscribe();
        this.connectionStatus$.next(ConnectionStatus.Ended);
    }
    getSessionId() {
        // If we're not connected to the bot, get connected
        // Will throw an error if we are not connected
        konsole.log("getSessionId");
        return this.checkConnection(true)
            .flatMap(_ => Observable_1.Observable.ajax({
            method: "GET",
            url: `${this.domain}/session/getsessionid`,
            withCredentials: true,
            timeout,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.token}`
            }
        })
            .map(ajaxResponse => {
            konsole.log("getSessionId response: " + ajaxResponse.response.sessionId);
            return ajaxResponse.response.sessionId;
        })
            .catch(error => this.catchPostError(error)))
            .catch(error => this.catchExpiredToken(error));
    }
    postActivity(activity) {
        // Use postMessageWithAttachments for messages with attachments that are local files (e.g. an image to upload)
        // Technically we could use it for *all* activities, but postActivity is much lighter weight
        // So, since WebChat is partially a reference implementation of Direct Line, we implement both.
        if (activity.type === "message" && activity.attachments && activity.attachments.length > 0)
            return this.postMessageWithAttachments(activity);
        // If we're not connected to the bot, get connected
        // Will throw an error if we are not connected
        konsole.log("postActivity", activity);
        return this.checkConnection(true)
            .flatMap(_ => Observable_1.Observable.ajax({
            method: "POST",
            url: `${this.domain}/conversations/${this.conversationId}/activities`,
            body: activity,
            timeout,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.token}`
            }
        })
            .map(ajaxResponse => ajaxResponse.response.id)
            .catch(error => this.catchPostError(error)))
            .catch(error => this.catchExpiredToken(error));
    }
    postMessageWithAttachments(_a) {
        var { attachments } = _a, messageWithoutAttachments = __rest(_a, ["attachments"]);
        let formData;
        // If we're not connected to the bot, get connected
        // Will throw an error if we are not connected
        return this.checkConnection(true)
            .flatMap(_ => {
            // To send this message to DirectLine we need to deconstruct it into a "template" activity
            // and one blob for each attachment.
            formData = new FormData();
            formData.append('activity', new Blob([JSON.stringify(messageWithoutAttachments)], { type: 'application/vnd.microsoft.activity' }));
            return Observable_1.Observable.from(attachments || [])
                .flatMap((media) => Observable_1.Observable.ajax({
                method: "GET",
                url: media.contentUrl,
                responseType: 'arraybuffer'
            })
                .do(ajaxResponse => formData.append('file', new Blob([ajaxResponse.response], { type: media.contentType }), media.name)))
                .count();
        })
            .flatMap(_ => Observable_1.Observable.ajax({
            method: "POST",
            url: `${this.domain}/conversations/${this.conversationId}/upload?userId=${messageWithoutAttachments.from.id}`,
            body: formData,
            timeout,
            headers: {
                "Authorization": `Bearer ${this.token}`
            }
        })
            .map(ajaxResponse => ajaxResponse.response.id)
            .catch(error => this.catchPostError(error)))
            .catch(error => this.catchPostError(error));
    }
    catchPostError(error) {
        if (error.status === 403)
            // token has expired (will fall through to return "retry")
            this.expiredToken();
        else if (error.status >= 400 && error.status < 500)
            // more unrecoverable errors
            return Observable_1.Observable.throw(error);
        return Observable_1.Observable.of("retry");
    }
    catchExpiredToken(error) {
        return error === errorExpiredToken
            ? Observable_1.Observable.of("retry")
            : Observable_1.Observable.throw(error);
    }
    pollingGetActivity$() {
        return Observable_1.Observable.interval(this.pollingInterval)
            .combineLatest(this.checkConnection())
            .flatMap(_ => Observable_1.Observable.ajax({
            method: "GET",
            url: `${this.domain}/conversations/${this.conversationId}/activities?watermark=${this.watermark}`,
            timeout,
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${this.token}`
            }
        })
            .catch(error => {
            if (error.status === 403) {
                // This is slightly ugly. We want to update this.connectionStatus$ to ExpiredToken so that subsequent
                // calls to checkConnection will throw an error. But when we do so, it causes this.checkConnection()
                // to immediately throw an error, which is caught by the catch() below and transformed into an empty
                // object. Then next() returns, and we emit an empty object. Which means one 403 is causing
                // two empty objects to be emitted. Which is harmless but, again, slightly ugly.
                this.expiredToken();
            }
            return Observable_1.Observable.empty();
        })
            .map(ajaxResponse => ajaxResponse.response)
            .flatMap(activityGroup => this.observableFromActivityGroup(activityGroup)))
            .catch(error => Observable_1.Observable.empty());
    }
    observableFromActivityGroup(activityGroup) {
        if (activityGroup.watermark)
            this.watermark = activityGroup.watermark;
        return Observable_1.Observable.from(activityGroup.activities);
    }
    webSocketActivity$() {
        return this.checkConnection()
            .flatMap(_ => this.observableWebSocket()
            .retryWhen(error$ => error$.mergeMap(error => this.reconnectToConversation())))
            .flatMap(activityGroup => this.observableFromActivityGroup(activityGroup));
    }
    // Originally we used Observable.webSocket, but it's fairly opionated  and I ended up writing
    // a lot of code to work around their implemention details. Since WebChat is meant to be a reference
    // implementation, I decided roll the below, where the logic is more purposeful. - @billba
    observableWebSocket() {
        return Observable_1.Observable.create((subscriber) => {
            konsole.log("creating WebSocket", this.streamUrl);
            const ws = new WebSocket(this.streamUrl);
            let sub;
            ws.onopen = open => {
                konsole.log("WebSocket open", open);
                // Chrome is pretty bad at noticing when a WebSocket connection is broken.
                // If we periodically ping the server with empty messages, it helps Chrome
                // realize when connection breaks, and close the socket. We then throw an
                // error, and that give us the opportunity to attempt to reconnect.
                sub = Observable_1.Observable.interval(timeout).subscribe(_ => ws.send(""));
            };
            ws.onclose = close => {
                konsole.log("WebSocket close", close);
                if (sub)
                    sub.unsubscribe();
                subscriber.error(close);
            };
            ws.onmessage = message => message.data && subscriber.next(JSON.parse(message.data));
            // This is the 'unsubscribe' method, which is called when this observable is disposed.
            // When the WebSocket closes itself, we throw an error, and this function is eventually called.
            // When the observable is closed first (e.g. when tearing down a WebChat instance) then
            // we need to manually close the WebSocket.
            return () => {
                if (ws.readyState === 0 || ws.readyState === 1)
                    ws.close();
            };
        });
    }
    reconnectToConversation() {
        return this.checkConnection(true)
            .flatMap(_ => Observable_1.Observable.ajax({
            method: "GET",
            url: `${this.domain}/conversations/${this.conversationId}?watermark=${this.watermark}`,
            timeout,
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${this.token}`
            }
        })
            .do(result => {
            if (!this.secret)
                this.token = result.response.token;
            this.streamUrl = result.response.streamUrl;
        })
            .map(_ => null)
            .retryWhen(error$ => error$
            .mergeMap(error => {
            if (error.status === 403) {
                // token has expired. We can't recover from this here, but the embedding
                // website might eventually call reconnect() with a new token and streamUrl.
                this.expiredToken();
            }
            return Observable_1.Observable.of(error);
        })
            .delay(timeout)
            .take(retries)));
    }
}
exports.DirectLine = DirectLine;
//# sourceMappingURL=directLine.js.map

/***/ }),

/***/ "../../custom-botframework-webchat/adaptivecards-hostconfig.json":
/*!********************************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/packages/custom-botframework-webchat/adaptivecards-hostconfig.json ***!
  \********************************************************************************************************************************/
/*! exports provided: supportsInteractivity, spacing, separator, fontFamily, fontSizes, fontWeights, containerStyles, imageSizes, actions, adaptiveCard, imageSet, factSet, default */
/*! all exports used */
/***/ (function(module) {

module.exports = {"supportsInteractivity":true,"spacing":{"small":4,"default":8,"medium":16,"large":24,"extraLarge":32,"padding":8},"separator":{"lineThickness":1,"lineColor":"#cccccc"},"fontFamily":"\"Segoe UI\", sans-serif","fontSizes":{"small":12,"default":13,"medium":15,"large":17,"extraLarge":19},"fontWeights":{"lighter":200,"default":400,"bolder":700},"containerStyles":{"default":{"backgroundColor":"#00000000","foregroundColors":{"default":{"default":"#000000","subtle":"#808c95"},"accent":{"default":"#2e89fc","subtle":"#802E8901"},"attention":{"default":"#ffd800","subtle":"#CCFFD800"},"good":{"default":"#00ff00","subtle":"#CC00FF00"},"warning":{"default":"#ff0000","subtle":"#CCFF0000"}}},"emphasis":{"backgroundColor":"#08000000","foregroundColors":{"default":{"default":"#333333","subtle":"#EE333333"},"accent":{"default":"#2e89fc","subtle":"#882E89FC"},"attention":{"default":"#cc3300","subtle":"#DDCC3300"},"good":{"default":"#54a254","subtle":"#DD54A254"},"warning":{"default":"#e69500","subtle":"#DDE69500"}}}},"imageSizes":{"small":40,"medium":80,"large":160},"actions":{"maxActions":100,"spacing":"default","buttonSpacing":8,"showCard":{"actionMode":"inline","inlineTopMargin":8},"actionsOrientation":"vertical","actionAlignment":"stretch"},"adaptiveCard":{"allowCustomStyle":false},"imageSet":{"imageSize":"medium","maxImageHeight":100},"factSet":{"title":{"color":"default","size":"default","isSubtle":false,"weight":"bolder","wrap":true,"maxWidth":150},"value":{"color":"default","size":"default","isSubtle":false,"weight":"default","wrap":true},"spacing":8}};

/***/ }),

/***/ "../../custom-botframework-webchat/built/ActivityView.js":
/*!************************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/packages/custom-botframework-webchat/built/ActivityView.js ***!
  \************************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = __webpack_require__(/*! tslib */ "../../../node_modules/tslib/tslib.es6.js");
const React = __webpack_require__(/*! react */ "../../../node_modules/react/index.js");
const Attachment_1 = __webpack_require__(/*! ./Attachment */ "../../custom-botframework-webchat/built/Attachment.js");
const Carousel_1 = __webpack_require__(/*! ./Carousel */ "../../custom-botframework-webchat/built/Carousel.js");
const FormattedText_1 = __webpack_require__(/*! ./FormattedText */ "../../custom-botframework-webchat/built/FormattedText.js");
const Attachments = (props) => {
    const { attachments, attachmentLayout } = props, otherProps = tslib_1.__rest(props, ["attachments", "attachmentLayout"]);
    if (!attachments || attachments.length === 0)
        return null;
    return attachmentLayout === 'carousel' ?
        React.createElement(Carousel_1.Carousel, Object.assign({ attachments: attachments }, otherProps))
        :
            React.createElement("div", { className: "wc-list" }, attachments.map((attachment, index) => React.createElement(Attachment_1.AttachmentView, { key: index, attachment: attachment, format: props.format, onCardAction: props.onCardAction, onImageLoad: props.onImageLoad })));
};
class ActivityView extends React.Component {
    constructor(props) {
        super(props);
    }
    shouldComponentUpdate(nextProps) {
        // if the activity changed, re-render
        return this.props.activity !== nextProps.activity
            // if the format changed, re-render
            || this.props.format !== nextProps.format
            // if it's a carousel and the size changed, re-render
            || (this.props.activity.type === 'message'
                && this.props.activity.attachmentLayout === 'carousel'
                && this.props.size !== nextProps.size);
    }
    render() {
        const _a = this.props, { activity } = _a, props = tslib_1.__rest(_a, ["activity"]);
        switch (activity.type) {
            case 'message':
                return (React.createElement("div", null,
                    React.createElement(FormattedText_1.FormattedText, { text: activity.text, format: activity.textFormat, onImageLoad: props.onImageLoad }),
                    React.createElement(Attachments, { attachments: activity.attachments, attachmentLayout: activity.attachmentLayout, format: props.format, onCardAction: props.onCardAction, onImageLoad: props.onImageLoad, size: props.size })));
            case 'typing':
                return React.createElement("div", { className: "wc-typing" });
        }
    }
}
exports.ActivityView = ActivityView;
//# sourceMappingURL=ActivityView.js.map

/***/ }),

/***/ "../../custom-botframework-webchat/built/AdaptiveCardContainer.js":
/*!*********************************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/packages/custom-botframework-webchat/built/AdaptiveCardContainer.js ***!
  \*********************************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const React = __webpack_require__(/*! react */ "../../../node_modules/react/index.js");
const react_dom_1 = __webpack_require__(/*! react-dom */ "../../../node_modules/react-dom/index.js");
const react_redux_1 = __webpack_require__(/*! react-redux */ "../../../node_modules/react-redux/es/index.js");
const adaptivecards_1 = __webpack_require__(/*! adaptivecards */ "../../../node_modules/adaptivecards/lib/adaptivecards.js");
const Chat_1 = __webpack_require__(/*! ./Chat */ "../../custom-botframework-webchat/built/Chat.js");
const adaptivecardsHostConfig = __webpack_require__(/*! ../adaptivecards-hostconfig.json */ "../../custom-botframework-webchat/adaptivecards-hostconfig.json");
const defaultHostConfig = new adaptivecards_1.HostConfig(adaptivecardsHostConfig);
function cardWithoutHttpActions(card) {
    if (!card.actions)
        return card;
    const actions = [];
    card.actions.forEach((action) => {
        //filter out http action buttons
        if (action.type === 'Action.Http')
            return;
        if (action.type === 'Action.ShowCard') {
            const showCardAction = action;
            showCardAction.card = cardWithoutHttpActions(showCardAction.card);
        }
        actions.push(action);
    });
    return Object.assign({}, card, { actions });
}
class AdaptiveCardContainer extends React.Component {
    constructor(props) {
        super(props);
        this.handleImageLoad = this.handleImageLoad.bind(this);
        this.onClick = this.onClick.bind(this);
        this.saveDiv = this.saveDiv.bind(this);
    }
    saveDiv(divRef) {
        this.divRef = divRef;
    }
    onClick(e) {
        if (!this.props.onClick) {
            return;
        }
        //do not allow form elements to trigger a parent click event
        switch (e.target.tagName) {
            case 'A':
            case 'AUDIO':
            case 'VIDEO':
            case 'BUTTON':
            case 'INPUT':
            case 'LABEL':
            case 'TEXTAREA':
            case 'SELECT':
                break;
            default:
                this.props.onClick(e);
        }
    }
    onExecuteAction(action) {
        if (action instanceof adaptivecards_1.OpenUrlAction) {
            window.open(action.url);
        }
        else if (action instanceof adaptivecards_1.SubmitAction) {
            if (action.data !== undefined) {
                if (typeof action.data === 'object' && action.data.__isBotFrameworkCardAction) {
                    const cardAction = action.data;
                    this.props.onCardAction(cardAction.type, cardAction.value);
                }
                else {
                    this.props.onCardAction(typeof action.data === 'string' ? 'imBack' : 'postBack', action.data);
                }
            }
        }
    }
    componentDidMount() {
        this.mountAdaptiveCards();
    }
    componentDidUpdate(prevProps) {
        if (prevProps.hostConfig !== this.props.hostConfig
            || prevProps.jsonCard !== this.props.jsonCard
            || prevProps.nativeCard !== this.props.nativeCard) {
            this.unmountAdaptiveCards();
            this.mountAdaptiveCards();
        }
    }
    handleImageLoad() {
        this.props.onImageLoad && this.props.onImageLoad.apply(this, arguments);
    }
    unmountAdaptiveCards() {
        const divElement = react_dom_1.findDOMNode(this.divRef);
        [].forEach.call(divElement.children, (child) => divElement.removeChild(child));
    }
    mountAdaptiveCards() {
        const adaptiveCard = this.props.nativeCard || new adaptivecards_1.AdaptiveCard();
        adaptiveCard.hostConfig = this.props.hostConfig || defaultHostConfig;
        let errors = [];
        if (!this.props.nativeCard && this.props.jsonCard) {
            this.props.jsonCard.version = this.props.jsonCard.version || '0.5';
            adaptiveCard.parse(cardWithoutHttpActions(this.props.jsonCard));
            errors = adaptiveCard.validate();
        }
        adaptiveCard.onExecuteAction = (action) => this.onExecuteAction(action);
        if (errors.length === 0) {
            let renderedCard;
            try {
                renderedCard = adaptiveCard.render();
            }
            catch (e) {
                const ve = {
                    error: -1,
                    message: e
                };
                errors.push(ve);
                if (e.stack) {
                    ve.message += '\n' + e.stack;
                }
            }
            if (renderedCard) {
                if (this.props.onImageLoad) {
                    var imgs = renderedCard.querySelectorAll('img');
                    if (imgs && imgs.length > 0) {
                        Array.prototype.forEach.call(imgs, (img) => {
                            img.addEventListener('load', this.handleImageLoad);
                        });
                    }
                }
                react_dom_1.findDOMNode(this.divRef).appendChild(renderedCard);
                return;
            }
        }
        if (errors.length > 0) {
            console.log('Error(s) rendering AdaptiveCard:');
            errors.forEach(e => console.log(e.message));
            this.setState({ errors: errors.map(e => e.message) });
        }
    }
    render() {
        let wrappedChildren;
        const hasErrors = this.state && this.state.errors && this.state.errors.length > 0;
        if (hasErrors) {
            wrappedChildren = (React.createElement("div", null,
                React.createElement("svg", { className: "error-icon", viewBox: "0 0 15 12.01" },
                    React.createElement("path", { d: "M7.62 8.63v-.38H.94a.18.18 0 0 1-.19-.19V.94A.18.18 0 0 1 .94.75h10.12a.18.18 0 0 1 .19.19v3.73H12V.94a.91.91 0 0 0-.07-.36 1 1 0 0 0-.5-.5.91.91 0 0 0-.37-.08H.94a.91.91 0 0 0-.37.07 1 1 0 0 0-.5.5.91.91 0 0 0-.07.37v7.12a.91.91 0 0 0 .07.36 1 1 0 0 0 .5.5.91.91 0 0 0 .37.08h6.72c-.01-.12-.04-.24-.04-.37z M11.62 5.26a3.27 3.27 0 0 1 1.31.27 3.39 3.39 0 0 1 1.8 1.8 3.36 3.36 0 0 1 0 2.63 3.39 3.39 0 0 1-1.8 1.8 3.36 3.36 0 0 1-2.62 0 3.39 3.39 0 0 1-1.8-1.8 3.36 3.36 0 0 1 0-2.63 3.39 3.39 0 0 1 1.8-1.8 3.27 3.27 0 0 1 1.31-.27zm0 6a2.53 2.53 0 0 0 1-.21A2.65 2.65 0 0 0 14 9.65a2.62 2.62 0 0 0 0-2 2.65 2.65 0 0 0-1.39-1.39 2.62 2.62 0 0 0-2 0A2.65 2.65 0 0 0 9.2 7.61a2.62 2.62 0 0 0 0 2A2.65 2.65 0 0 0 10.6 11a2.53 2.53 0 0 0 1.02.26zM13 7.77l-.86.86.86.86-.53.53-.86-.86-.86.86-.53-.53.86-.86-.86-.86.53-.53.86.86.86-.86zM1.88 7.13h2.25V4.88H1.88zm.75-1.5h.75v.75h-.75zM5.63 2.63h4.5v.75h-4.5zM1.88 4.13h2.25V1.88H1.88zm.75-1.5h.75v.75h-.75zM9 5.63H5.63v.75h2.64A4 4 0 0 1 9 5.63z" })),
                React.createElement("div", { className: "error-text" }, "Can't render card")));
        }
        else if (this.props.children) {
            wrappedChildren = (React.createElement("div", { className: "non-adaptive-content" }, this.props.children));
        }
        else {
            wrappedChildren = null;
        }
        return (React.createElement("div", { className: Chat_1.classList('wc-card', 'wc-adaptive-card', this.props.className, hasErrors && 'error'), onClick: this.onClick },
            wrappedChildren,
            React.createElement("div", { ref: this.saveDiv })));
    }
}
exports.default = react_redux_1.connect((state) => ({
    hostConfig: state.adaptiveCards.hostConfig
}), {}, (stateProps, dispatchProps, ownProps) => (Object.assign({}, ownProps, stateProps)))(AdaptiveCardContainer);
//# sourceMappingURL=AdaptiveCardContainer.js.map

/***/ }),

/***/ "../../custom-botframework-webchat/built/App.js":
/*!***************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/packages/custom-botframework-webchat/built/App.js ***!
  \***************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const React = __webpack_require__(/*! react */ "../../../node_modules/react/index.js");
const ReactDOM = __webpack_require__(/*! react-dom */ "../../../node_modules/react-dom/index.js");
const Chat_1 = __webpack_require__(/*! ./Chat */ "../../custom-botframework-webchat/built/Chat.js");
const konsole = __webpack_require__(/*! ./Konsole */ "../../custom-botframework-webchat/built/Konsole.js");
exports.App = (props, container) => {
    konsole.log("BotChat.App props", props);
    ReactDOM.render(React.createElement(AppContainer, props), container);
};
const AppContainer = (props) => React.createElement("div", { className: "wc-app" },
    React.createElement(Chat_1.Chat, Object.assign({}, props)));
//# sourceMappingURL=App.js.map

/***/ }),

/***/ "../../custom-botframework-webchat/built/Attachment.js":
/*!**********************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/packages/custom-botframework-webchat/built/Attachment.js ***!
  \**********************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const React = __webpack_require__(/*! react */ "../../../node_modules/react/index.js");
const CardBuilder = __webpack_require__(/*! ./CardBuilder */ "../../custom-botframework-webchat/built/CardBuilder.js");
const adaptivecards_1 = __webpack_require__(/*! adaptivecards */ "../../../node_modules/adaptivecards/lib/adaptivecards.js");
const AdaptiveCardContainer_1 = __webpack_require__(/*! ./AdaptiveCardContainer */ "../../custom-botframework-webchat/built/AdaptiveCardContainer.js");
const regExpCard = /\^application\/vnd\.microsoft\.card\./i;
const YOUTUBE_DOMAIN = "youtube.com";
const YOUTUBE_WWW_DOMAIN = "www.youtube.com";
const YOUTUBE_SHORT_DOMAIN = "youtu.be";
const YOUTUBE_WWW_SHORT_DOMAIN = "www.youtu.be";
const VIMEO_DOMAIN = "vimeo.com";
const VIMEO_WWW_DOMAIN = "www.vimeo.com";
exports.queryParams = (src) => src
    .substr(1)
    .split('&')
    .reduce((previous, current) => {
    const keyValue = current.split('=');
    previous[decodeURIComponent(keyValue[0])] = decodeURIComponent(keyValue[1]);
    return previous;
}, {});
const queryString = (query) => Object.keys(query)
    .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(query[key].toString()))
    .join('&');
const exists = (value) => value != null && typeof value != "undefined";
const Youtube = (props) => React.createElement("iframe", { src: `https://${YOUTUBE_DOMAIN}/embed/${props.embedId}?${queryString({
        modestbranding: '1',
        loop: props.loop ? '1' : '0',
        autoplay: props.autoPlay ? '1' : '0'
    })}` });
const Vimeo = (props) => React.createElement("iframe", { src: `https://player.${VIMEO_DOMAIN}/video/${props.embedId}?${queryString({
        title: '0',
        byline: '0',
        portrait: '0',
        badge: '0',
        autoplay: props.autoPlay ? '1' : '0',
        loop: props.loop ? '1' : '0'
    })}` });
const Video = (props) => {
    const url = document.createElement('a');
    url.href = props.src;
    const urlQueryParams = exports.queryParams(url.search);
    const pathSegments = url.pathname.substr(1).split('/');
    switch (url.hostname) {
        case YOUTUBE_DOMAIN:
        case YOUTUBE_SHORT_DOMAIN:
        case YOUTUBE_WWW_DOMAIN:
        case YOUTUBE_WWW_SHORT_DOMAIN:
            return React.createElement(Youtube, { embedId: url.hostname === YOUTUBE_DOMAIN || url.hostname === YOUTUBE_WWW_DOMAIN ? urlQueryParams['v'] : pathSegments[pathSegments.length - 1], autoPlay: props.autoPlay, loop: props.loop });
        case VIMEO_WWW_DOMAIN:
        case VIMEO_DOMAIN:
            return React.createElement(Vimeo, { embedId: pathSegments[pathSegments.length - 1], autoPlay: props.autoPlay, loop: props.loop });
        default:
            return React.createElement("video", Object.assign({ controls: true }, props));
    }
};
const Media = (props) => {
    switch (props.type) {
        case 'video':
            return React.createElement(Video, Object.assign({}, props));
        case 'audio':
            return React.createElement("audio", Object.assign({ controls: true }, props));
        default:
            return React.createElement("img", Object.assign({}, props));
    }
};
const Unknown = (props) => {
    if (regExpCard.test(props.contentType)) {
        return React.createElement("span", null, props.format.strings.unknownCard.replace('%1', props.contentType));
    }
    else if (props.contentUrl) {
        return React.createElement("div", null,
            React.createElement("a", { className: "wc-link-download", href: props.contentUrl, target: "_blank", title: props.contentUrl },
                React.createElement("div", { className: "wc-text-download" }, props.name || props.format.strings.unknownFile.replace('%1', props.contentType)),
                React.createElement("div", { className: "wc-icon-download" })));
    }
    else {
        return React.createElement("span", null, props.format.strings.unknownFile.replace('%1', props.contentType));
    }
};
const mediaType = (url) => url.slice((url.lastIndexOf(".") - 1 >>> 0) + 2).toLowerCase() == 'gif' ? 'image' : 'video';
exports.AttachmentView = (props) => {
    if (!props.attachment)
        return;
    const attachment = props.attachment;
    const onCardAction = (cardAction) => cardAction &&
        ((e) => {
            props.onCardAction(cardAction.type, cardAction.value);
            e.stopPropagation();
        });
    const attachedImage = (images) => images && images.length > 0 &&
        React.createElement(Media, { src: images[0].url, onLoad: props.onImageLoad, onClick: onCardAction(images[0].tap), alt: images[0].alt });
    const getRichCardContentMedia = (type, content) => {
        if (!content.media || content.media.length === 0) {
            return null;
        }
        // rendering every media in the media array. Validates every type as image, video, audio or a function that returns those values.
        return content.media.map((md, i) => {
            let t = (typeof type === 'string') ? type : type(md.url);
            return React.createElement(Media, { type: t, src: md.url, onLoad: props.onImageLoad, poster: content.image && content.image.url, autoPlay: content.autostart, loop: content.autoloop, key: i });
        });
    };
    switch (attachment.contentType) {
        case "application/vnd.microsoft.card.hero":
            if (!attachment.content)
                return null;
            const heroCardBuilder = new CardBuilder.AdaptiveCardBuilder();
            if (attachment.content.images) {
                attachment.content.images.forEach(img => heroCardBuilder.addImage(img.url, null, img.tap));
            }
            heroCardBuilder.addCommon(attachment.content);
            return (React.createElement(AdaptiveCardContainer_1.default, { className: "hero", nativeCard: heroCardBuilder.card, onImageLoad: props.onImageLoad, onCardAction: props.onCardAction, onClick: onCardAction(attachment.content.tap) }));
        case "application/vnd.microsoft.card.thumbnail":
            if (!attachment.content)
                return null;
            const thumbnailCardBuilder = new CardBuilder.AdaptiveCardBuilder();
            if (attachment.content.images && attachment.content.images.length > 0) {
                const columns = thumbnailCardBuilder.addColumnSet([75, 25]);
                thumbnailCardBuilder.addTextBlock(attachment.content.title, { size: adaptivecards_1.TextSize.Medium, weight: adaptivecards_1.TextWeight.Bolder }, columns[0]);
                thumbnailCardBuilder.addTextBlock(attachment.content.subtitle, { isSubtle: true, wrap: true }, columns[0]);
                thumbnailCardBuilder.addImage(attachment.content.images[0].url, columns[1], attachment.content.images[0].tap);
                thumbnailCardBuilder.addTextBlock(attachment.content.text, { wrap: true });
                thumbnailCardBuilder.addButtons(attachment.content.buttons);
            }
            else {
                thumbnailCardBuilder.addCommon(attachment.content);
            }
            return (React.createElement(AdaptiveCardContainer_1.default, { className: "thumbnail", nativeCard: thumbnailCardBuilder.card, onImageLoad: props.onImageLoad, onCardAction: props.onCardAction, onClick: onCardAction(attachment.content.tap) }));
        case "application/vnd.microsoft.card.video":
            if (!attachment.content || !attachment.content.media || attachment.content.media.length === 0)
                return null;
            return (React.createElement(AdaptiveCardContainer_1.default, { className: "video", nativeCard: CardBuilder.buildCommonCard(attachment.content), onCardAction: props.onCardAction }, getRichCardContentMedia('video', attachment.content)));
        case "application/vnd.microsoft.card.animation":
            if (!attachment.content || !attachment.content.media || attachment.content.media.length === 0)
                return null;
            return (React.createElement(AdaptiveCardContainer_1.default, { className: "animation", nativeCard: CardBuilder.buildCommonCard(attachment.content), onCardAction: props.onCardAction }, getRichCardContentMedia(mediaType, attachment.content)));
        case "application/vnd.microsoft.card.audio":
            if (!attachment.content || !attachment.content.media || attachment.content.media.length === 0)
                return null;
            return (React.createElement(AdaptiveCardContainer_1.default, { className: "audio", nativeCard: CardBuilder.buildCommonCard(attachment.content), onCardAction: props.onCardAction }, getRichCardContentMedia('audio', attachment.content)));
        case "application/vnd.microsoft.card.signin":
            if (!attachment.content)
                return null;
            return (React.createElement(AdaptiveCardContainer_1.default, { className: "signin", nativeCard: CardBuilder.buildCommonCard(attachment.content), onCardAction: props.onCardAction }));
        case "application/vnd.microsoft.card.oauth":
            if (!attachment.content)
                return null;
            return (React.createElement(AdaptiveCardContainer_1.default, { className: "signin", nativeCard: CardBuilder.buildOAuthCard(attachment.content), onCardAction: props.onCardAction }));
        case "application/vnd.microsoft.card.receipt":
            if (!attachment.content)
                return null;
            const receiptCardBuilder = new CardBuilder.AdaptiveCardBuilder();
            receiptCardBuilder.addTextBlock(attachment.content.title, { size: adaptivecards_1.TextSize.Medium, weight: adaptivecards_1.TextWeight.Bolder });
            const columns = receiptCardBuilder.addColumnSet([75, 25]);
            attachment.content.facts && attachment.content.facts.map((fact, i) => {
                receiptCardBuilder.addTextBlock(fact.key, { size: adaptivecards_1.TextSize.Medium }, columns[0]);
                receiptCardBuilder.addTextBlock(fact.value, { size: adaptivecards_1.TextSize.Medium, horizontalAlignment: adaptivecards_1.HorizontalAlignment.Right }, columns[1]);
            });
            attachment.content.items && attachment.content.items.map((item, i) => {
                if (item.image) {
                    const columns2 = receiptCardBuilder.addColumnSet([15, 75, 10]);
                    receiptCardBuilder.addImage(item.image.url, columns2[0], item.image.tap);
                    receiptCardBuilder.addTextBlock(item.title, { size: adaptivecards_1.TextSize.Medium, weight: adaptivecards_1.TextWeight.Bolder, wrap: true }, columns2[1]);
                    receiptCardBuilder.addTextBlock(item.subtitle, { size: adaptivecards_1.TextSize.Medium, wrap: true }, columns2[1]);
                    receiptCardBuilder.addTextBlock(item.price, { horizontalAlignment: adaptivecards_1.HorizontalAlignment.Right }, columns2[2]);
                }
                else {
                    const columns3 = receiptCardBuilder.addColumnSet([75, 25]);
                    receiptCardBuilder.addTextBlock(item.title, { size: adaptivecards_1.TextSize.Medium, weight: adaptivecards_1.TextWeight.Bolder, wrap: true }, columns3[0]);
                    receiptCardBuilder.addTextBlock(item.subtitle, { size: adaptivecards_1.TextSize.Medium, wrap: true }, columns3[0]);
                    receiptCardBuilder.addTextBlock(item.price, { horizontalAlignment: adaptivecards_1.HorizontalAlignment.Right }, columns3[1]);
                }
            });
            if (exists(attachment.content.vat)) {
                const vatCol = receiptCardBuilder.addColumnSet([75, 25]);
                receiptCardBuilder.addTextBlock(props.format.strings.receiptVat, { size: adaptivecards_1.TextSize.Medium, weight: adaptivecards_1.TextWeight.Bolder }, vatCol[0]);
                receiptCardBuilder.addTextBlock(attachment.content.vat, { horizontalAlignment: adaptivecards_1.HorizontalAlignment.Right }, vatCol[1]);
            }
            if (exists(attachment.content.tax)) {
                const taxCol = receiptCardBuilder.addColumnSet([75, 25]);
                receiptCardBuilder.addTextBlock(props.format.strings.receiptTax, { size: adaptivecards_1.TextSize.Medium, weight: adaptivecards_1.TextWeight.Bolder }, taxCol[0]);
                receiptCardBuilder.addTextBlock(attachment.content.tax, { horizontalAlignment: adaptivecards_1.HorizontalAlignment.Right }, taxCol[1]);
            }
            if (exists(attachment.content.total)) {
                const totalCol = receiptCardBuilder.addColumnSet([75, 25]);
                receiptCardBuilder.addTextBlock(props.format.strings.receiptTotal, { size: adaptivecards_1.TextSize.Medium, weight: adaptivecards_1.TextWeight.Bolder }, totalCol[0]);
                receiptCardBuilder.addTextBlock(attachment.content.total, { horizontalAlignment: adaptivecards_1.HorizontalAlignment.Right, size: adaptivecards_1.TextSize.Medium, weight: adaptivecards_1.TextWeight.Bolder }, totalCol[1]);
            }
            receiptCardBuilder.addButtons(attachment.content.buttons);
            return (React.createElement(AdaptiveCardContainer_1.default, { className: 'receipt', nativeCard: receiptCardBuilder.card, onCardAction: props.onCardAction, onClick: onCardAction(attachment.content.tap) }));
        case "application/vnd.microsoft.card.adaptive":
            if (!attachment.content)
                return null;
            return (React.createElement(AdaptiveCardContainer_1.default, { jsonCard: attachment.content, onImageLoad: props.onImageLoad, onCardAction: props.onCardAction }));
        // Deprecated format for Skype channels. For testing legacy bots in Emulator only.
        case "application/vnd.microsoft.card.flex":
            if (!attachment.content)
                return null;
            return (React.createElement(AdaptiveCardContainer_1.default, { className: "flex", nativeCard: CardBuilder.buildCommonCard(attachment.content), onCardAction: props.onCardAction }, attachedImage(attachment.content.images)));
        case "image/svg+xml":
        case "image/png":
        case "image/jpg":
        case "image/jpeg":
        case "image/gif":
            return React.createElement(Media, { src: attachment.contentUrl, onLoad: props.onImageLoad });
        case "audio/mpeg":
        case "audio/mp4":
            return React.createElement(Media, { type: 'audio', src: attachment.contentUrl });
        case "video/mp4":
            return React.createElement(Media, { type: 'video', poster: attachment.thumbnailUrl, src: attachment.contentUrl, onLoad: props.onImageLoad });
        default:
            var unknownAttachment = props.attachment;
            return React.createElement(Unknown, { format: props.format, contentType: unknownAttachment.contentType, contentUrl: unknownAttachment.contentUrl, name: unknownAttachment.name });
    }
};
//# sourceMappingURL=Attachment.js.map

/***/ }),

/***/ "../../custom-botframework-webchat/built/BotChat.js":
/*!*******************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/packages/custom-botframework-webchat/built/BotChat.js ***!
  \*******************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = __webpack_require__(/*! tslib */ "../../../node_modules/tslib/tslib.es6.js");
var App_1 = __webpack_require__(/*! ./App */ "../../custom-botframework-webchat/built/App.js");
exports.App = App_1.App;
var Chat_1 = __webpack_require__(/*! ./Chat */ "../../custom-botframework-webchat/built/Chat.js");
exports.Chat = Chat_1.Chat;
tslib_1.__exportStar(__webpack_require__(/*! @bfemulator/custom-botframework-directlinejs */ "../../custom-botframework-directlinejs/built/directLine.js"), exports);
var Attachment_1 = __webpack_require__(/*! ./Attachment */ "../../custom-botframework-webchat/built/Attachment.js");
exports.queryParams = Attachment_1.queryParams;
var SpeechOptions_1 = __webpack_require__(/*! ./SpeechOptions */ "../../custom-botframework-webchat/built/SpeechOptions.js");
exports.SpeechOptions = SpeechOptions_1.SpeechOptions;
var SpeechModule_1 = __webpack_require__(/*! ./SpeechModule */ "../../custom-botframework-webchat/built/SpeechModule.js");
exports.Speech = SpeechModule_1.Speech;
var Store_1 = __webpack_require__(/*! ./Store */ "../../custom-botframework-webchat/built/Store.js");
exports.createStore = Store_1.createStore;
// below are shims for compatibility with old browsers (IE 10 being the main culprit)
__webpack_require__(/*! core-js/modules/es6.string.starts-with */ "../../../node_modules/core-js/modules/es6.string.starts-with.js");
__webpack_require__(/*! core-js/modules/es6.array.find */ "../../../node_modules/core-js/modules/es6.array.find.js");
__webpack_require__(/*! core-js/modules/es6.array.find-index */ "../../../node_modules/core-js/modules/es6.array.find-index.js");
//# sourceMappingURL=BotChat.js.map

/***/ }),

/***/ "../../custom-botframework-webchat/built/CardBuilder.js":
/*!***********************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/packages/custom-botframework-webchat/built/CardBuilder.js ***!
  \***********************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const adaptivecards_1 = __webpack_require__(/*! adaptivecards */ "../../../node_modules/adaptivecards/lib/adaptivecards.js");
class AdaptiveCardBuilder {
    constructor() {
        this.card = new adaptivecards_1.AdaptiveCard();
        this.container = new adaptivecards_1.Container();
        this.card.addItem(this.container);
    }
    addColumnSet(sizes, container) {
        container = container || this.container;
        const columnSet = new adaptivecards_1.ColumnSet();
        container.addItem(columnSet);
        const columns = sizes.map(size => {
            const column = new adaptivecards_1.Column();
            column.width = size;
            columnSet.addColumn(column);
            return column;
        });
        return columns;
    }
    addItems(cardElements, container) {
        container = container || this.container;
        cardElements.forEach(cardElement => container.addItem(cardElement));
    }
    addTextBlock(text, template, container) {
        container = container || this.container;
        if (typeof text !== 'undefined') {
            const textblock = new adaptivecards_1.TextBlock();
            for (let prop in template) {
                textblock[prop] = template[prop];
            }
            textblock.text = text;
            container.addItem(textblock);
        }
    }
    addButtons(cardActions, includesOAuthButtons) {
        if (cardActions) {
            cardActions.forEach(cardAction => {
                this.card.addAction(AdaptiveCardBuilder.addCardAction(cardAction, includesOAuthButtons));
            });
        }
    }
    static addCardAction(cardAction, includesOAuthButtons) {
        if (cardAction.type === 'imBack' || cardAction.type === 'postBack') {
            const action = new adaptivecards_1.SubmitAction();
            const botFrameworkCardAction = Object.assign({ __isBotFrameworkCardAction: true }, cardAction);
            action.data = botFrameworkCardAction;
            action.title = cardAction.title;
            return action;
        }
        else if (cardAction.type === 'signin' && includesOAuthButtons) {
            // Create a button specific for OAuthCard 'signin' actions (cardAction.type == signin and button action is Action.Submit)
            const action = new adaptivecards_1.SubmitAction();
            const botFrameworkCardAction = Object.assign({ __isBotFrameworkCardAction: true }, cardAction);
            action.title = cardAction.title,
                action.data = botFrameworkCardAction;
            return action;
        }
        else {
            const action = new adaptivecards_1.OpenUrlAction();
            const botFrameworkCardAction = Object.assign({ __isBotFrameworkCardAction: true }, cardAction);
            action.title = cardAction.title;
            action.url = cardAction.type === 'call' ? 'tel:' + cardAction.value : cardAction.value;
            return action;
        }
    }
    addCommonHeaders(content) {
        this.addTextBlock(content.title, { size: adaptivecards_1.TextSize.Medium, weight: adaptivecards_1.TextWeight.Bolder });
        this.addTextBlock(content.subtitle, { isSubtle: true, wrap: true });
        this.addTextBlock(content.text, { wrap: true });
    }
    addCommon(content) {
        this.addCommonHeaders(content);
        this.addButtons(content.buttons);
    }
    addImage(url, container, selectAction) {
        container = container || this.container;
        const image = new adaptivecards_1.Image();
        image.url = url;
        image.size = adaptivecards_1.Size.Stretch;
        if (selectAction) {
            image.selectAction = AdaptiveCardBuilder.addCardAction(selectAction);
        }
        container.addItem(image);
    }
}
exports.AdaptiveCardBuilder = AdaptiveCardBuilder;
exports.buildCommonCard = (content) => {
    if (!content)
        return null;
    const cardBuilder = new AdaptiveCardBuilder();
    cardBuilder.addCommon(content);
    return cardBuilder.card;
};
exports.buildOAuthCard = (content) => {
    if (!content)
        return null;
    const cardBuilder = new AdaptiveCardBuilder();
    cardBuilder.addCommonHeaders(content);
    cardBuilder.addButtons(content.buttons, true);
    return cardBuilder.card;
};
//# sourceMappingURL=CardBuilder.js.map

/***/ }),

/***/ "../../custom-botframework-webchat/built/Carousel.js":
/*!********************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/packages/custom-botframework-webchat/built/Carousel.js ***!
  \********************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = __webpack_require__(/*! tslib */ "../../../node_modules/tslib/tslib.es6.js");
const React = __webpack_require__(/*! react */ "../../../node_modules/react/index.js");
const Attachment_1 = __webpack_require__(/*! ./Attachment */ "../../custom-botframework-webchat/built/Attachment.js");
const HScroll_1 = __webpack_require__(/*! ./HScroll */ "../../custom-botframework-webchat/built/HScroll.js");
const konsole = __webpack_require__(/*! ./Konsole */ "../../custom-botframework-webchat/built/Konsole.js");
class Carousel extends React.PureComponent {
    constructor(props) {
        super(props);
    }
    updateContentWidth() {
        //after the attachments have been rendered, we can now measure their actual width
        const width = this.props.size.width - this.props.format.carouselMargin;
        //important: remove any hard styling so that we can measure the natural width
        this.root.style.width = '';
        //now measure the natural offsetWidth
        if (this.root.offsetWidth > width) {
            // the content width is bigger than the space allotted, so we'll clip it to force scrolling
            this.root.style.width = width.toString() + "px";
            // since we're scrolling, we need to show scroll buttons
            this.hscroll.updateScrollButtons();
        }
    }
    componentDidMount() {
        this.updateContentWidth();
    }
    componentDidUpdate() {
        this.updateContentWidth();
    }
    render() {
        return (React.createElement("div", { className: "wc-carousel", ref: div => this.root = div },
            React.createElement(HScroll_1.HScroll, { ref: hscroll => this.hscroll = hscroll, prevSvgPathData: "M 16.5 22 L 19 19.5 L 13.5 14 L 19 8.5 L 16.5 6 L 8.5 14 L 16.5 22 Z", nextSvgPathData: "M 12.5 22 L 10 19.5 L 15.5 14 L 10 8.5 L 12.5 6 L 20.5 14 L 12.5 22 Z", scrollUnit: "item" },
                React.createElement(CarouselAttachments, Object.assign({}, this.props)))));
    }
}
exports.Carousel = Carousel;
class CarouselAttachments extends React.PureComponent {
    render() {
        konsole.log("rendering CarouselAttachments");
        const _a = this.props, { attachments } = _a, props = tslib_1.__rest(_a, ["attachments"]);
        return (React.createElement("ul", null, this.props.attachments.map((attachment, index) => React.createElement("li", { key: index, className: "wc-carousel-item" },
            React.createElement(Attachment_1.AttachmentView, { attachment: attachment, format: props.format, onCardAction: props.onCardAction, onImageLoad: props.onImageLoad })))));
    }
}
//# sourceMappingURL=Carousel.js.map

/***/ }),

/***/ "../../custom-botframework-webchat/built/Chat.js":
/*!****************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/packages/custom-botframework-webchat/built/Chat.js ***!
  \****************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const React = __webpack_require__(/*! react */ "../../../node_modules/react/index.js");
const react_dom_1 = __webpack_require__(/*! react-dom */ "../../../node_modules/react-dom/index.js");
const custom_botframework_directlinejs_1 = __webpack_require__(/*! @bfemulator/custom-botframework-directlinejs */ "../../custom-botframework-directlinejs/built/directLine.js");
const Store_1 = __webpack_require__(/*! ./Store */ "../../custom-botframework-webchat/built/Store.js");
const react_redux_1 = __webpack_require__(/*! react-redux */ "../../../node_modules/react-redux/es/index.js");
const SpeechModule_1 = __webpack_require__(/*! ./SpeechModule */ "../../custom-botframework-webchat/built/SpeechModule.js");
const konsole = __webpack_require__(/*! ./Konsole */ "../../custom-botframework-webchat/built/Konsole.js");
const getTabIndex_1 = __webpack_require__(/*! ./getTabIndex */ "../../custom-botframework-webchat/built/getTabIndex.js");
const History_1 = __webpack_require__(/*! ./History */ "../../custom-botframework-webchat/built/History.js");
const MessagePane_1 = __webpack_require__(/*! ./MessagePane */ "../../custom-botframework-webchat/built/MessagePane.js");
const SuggestedActions_1 = __webpack_require__(/*! ./SuggestedActions */ "../../custom-botframework-webchat/built/SuggestedActions.js");
const Shell_1 = __webpack_require__(/*! ./Shell */ "../../custom-botframework-webchat/built/Shell.js");
class Chat extends React.Component {
    constructor(props) {
        super(props);
        this.resizeListener = () => this.setSize();
        this._handleCardAction = this.handleCardAction.bind(this);
        this._handleKeyDownCapture = this.handleKeyDownCapture.bind(this);
        this._saveChatviewPanelRef = this.saveChatviewPanelRef.bind(this);
        this._saveHistoryRef = this.saveHistoryRef.bind(this);
        this._saveShellRef = this.saveShellRef.bind(this);
        konsole.log("BotChat.Chat props", props);
        this.store = props.store || Store_1.createStore();
        this.store.dispatch({
            type: 'Set_Locale',
            locale: props.locale || window.navigator["userLanguage"] || window.navigator.language || 'en'
        });
        if (props.adaptiveCardsHostConfig) {
            this.store.dispatch({
                type: 'Set_AdaptiveCardsHostConfig',
                payload: props.adaptiveCardsHostConfig
            });
        }
        if (props.formatOptions) {
            this.store.dispatch({ type: 'Set_Format_Options', options: props.formatOptions });
        }
        if (props.sendTyping) {
            this.store.dispatch({ type: 'Set_Send_Typing', sendTyping: props.sendTyping });
        }
        if (typeof props.showShell === 'boolean') {
            this.store.dispatch({ type: 'Set_Visible', visible: props.showShell });
        }
        if (props.speechOptions) {
            SpeechModule_1.Speech.SpeechRecognizer.setSpeechRecognizer(props.speechOptions.speechRecognizer);
            SpeechModule_1.Speech.SpeechSynthesizer.setSpeechSynthesizer(props.speechOptions.speechSynthesizer);
        }
    }
    handleIncomingActivity(activity) {
        let state = this.store.getState();
        switch (activity.type) {
            case "message":
                this.store.dispatch({ type: activity.from.id === state.connection.user.id ? 'Receive_Sent_Message' : 'Receive_Message', activity });
                break;
            case "typing":
                if (activity.from.id !== state.connection.user.id)
                    this.store.dispatch({ type: 'Show_Typing', activity });
                break;
        }
    }
    setSize() {
        this.store.dispatch({
            type: 'Set_Size',
            width: this.chatviewPanelRef.offsetWidth,
            height: this.chatviewPanelRef.offsetHeight
        });
    }
    handleCardAction() {
        // After the user click on any card action, we will "blur" the focus, by setting focus on message pane
        // This is for after click on card action, the user press "A", it should go into the chat box
        const historyDOM = react_dom_1.findDOMNode(this.historyRef);
        if (historyDOM) {
            historyDOM.focus();
        }
    }
    handleKeyDownCapture(evt) {
        const target = evt.target;
        const tabIndex = getTabIndex_1.getTabIndex(target);
        if (evt.altKey
            || evt.ctrlKey
            || evt.metaKey
            || (!inputtableKey(evt.key) && evt.key !== 'Backspace')) {
            // Ignore if one of the utility key (except SHIFT) is pressed
            // E.g. CTRL-C on a link in one of the message should not jump to chat box
            // E.g. "A" or "Backspace" should jump to chat box
            return;
        }
        if (target === react_dom_1.findDOMNode(this.historyRef)
            || typeof tabIndex !== 'number'
            || tabIndex < 0) {
            evt.stopPropagation();
            let key;
            // Quirks: onKeyDown we re-focus, but the newly focused element does not receive the subsequent onKeyPress event
            //         It is working in Chrome/Firefox/IE, confirmed not working in Edge/16
            //         So we are manually appending the key if they can be inputted in the box
            if (/(^|\s)Edge\/16\./.test(navigator.userAgent)) {
                key = inputtableKey(evt.key);
            }
            this.shellRef.focus(key);
        }
    }
    saveChatviewPanelRef(chatviewPanelRef) {
        this.chatviewPanelRef = chatviewPanelRef;
    }
    saveHistoryRef(historyWrapper) {
        if (!historyWrapper) {
            this.historyRef = null;
            return;
        }
        this.historyRef = historyWrapper.getWrappedInstance();
    }
    saveShellRef(shellWrapper) {
        if (!shellWrapper) {
            this.shellRef = null;
            return;
        }
        this.shellRef = shellWrapper.getWrappedInstance();
    }
    componentDidMount() {
        // Now that we're mounted, we know our dimensions. Put them in the store (this will force a re-render)
        this.setSize();
        const botConnection = this.props.directLine
            ? (this.botConnection = new custom_botframework_directlinejs_1.DirectLine(this.props.directLine))
            : this.props.botConnection;
        if (this.props.resize === 'window')
            window.addEventListener('resize', this.resizeListener);
        this.store.dispatch({ type: 'Start_Connection', user: this.props.user, bot: this.props.bot, botConnection, selectedActivity: this.props.selectedActivity });
        this.connectionStatusSubscription = botConnection.connectionStatus$.subscribe(connectionStatus => {
            if (this.props.speechOptions && this.props.speechOptions.speechRecognizer) {
                let refGrammarId = botConnection.referenceGrammarId;
                if (refGrammarId)
                    this.props.speechOptions.speechRecognizer.referenceGrammarId = refGrammarId;
            }
            this.store.dispatch({ type: 'Connection_Change', connectionStatus });
        });
        this.activitySubscription = botConnection.activity$.subscribe(activity => this.handleIncomingActivity(activity), error => konsole.log("activity$ error", error));
        if (this.props.selectedActivity) {
            this.selectedActivitySubscription = this.props.selectedActivity.subscribe(activityOrID => {
                this.store.dispatch({
                    type: 'Select_Activity',
                    selectedActivity: activityOrID.activity || this.store.getState().history.activities.find(activity => activity.id === activityOrID.id)
                });
            });
        }
    }
    componentWillUnmount() {
        this.connectionStatusSubscription.unsubscribe();
        this.activitySubscription.unsubscribe();
        if (this.selectedActivitySubscription)
            this.selectedActivitySubscription.unsubscribe();
        if (this.botConnection)
            this.botConnection.end();
        window.removeEventListener('resize', this.resizeListener);
    }
    componentWillReceiveProps(nextProps) {
        if (this.props.adaptiveCardsHostConfig !== nextProps.adaptiveCardsHostConfig) {
            this.store.dispatch({
                type: 'Set_AdaptiveCardsHostConfig',
                payload: nextProps.adaptiveCardsHostConfig
            });
        }
    }
    // At startup we do three render passes:
    // 1. To determine the dimensions of the chat panel (nothing needs to actually render here, so we don't)
    // 2. To determine the margins of any given carousel (we just render one mock activity so that we can measure it)
    // 3. (this is also the normal re-render case) To render without the mock activity
    render() {
        const state = this.store.getState();
        konsole.log("BotChat.Chat state", state);
        // only render real stuff after we know our dimensions
        let header;
        if (state.format.options.showHeader)
            header =
                React.createElement("div", { className: "wc-header" },
                    React.createElement("span", null, state.format.strings.title));
        let resize;
        if (this.props.resize === 'detect')
            resize =
                React.createElement(ResizeDetector, { onresize: this.resizeListener });
        return (React.createElement(react_redux_1.Provider, { store: this.store },
            React.createElement("div", { className: "wc-chatview-panel", onKeyDownCapture: this._handleKeyDownCapture, ref: this._saveChatviewPanelRef },
                header,
                React.createElement(MessagePane_1.MessagePane, null,
                    React.createElement(History_1.History, { onCardAction: this._handleCardAction, ref: this._saveHistoryRef })),
                React.createElement(SuggestedActions_1.SuggestedActions, null),
                React.createElement(Shell_1.Shell, { ref: this._saveShellRef }),
                resize)));
    }
}
exports.Chat = Chat;
exports.doCardAction = (botConnection, from, locale, sendMessage) => (type, actionValue) => {
    const text = (typeof actionValue === 'string') ? actionValue : undefined;
    const value = (typeof actionValue === 'object') ? actionValue : undefined;
    switch (type) {
        case "imBack":
            if (typeof text === 'string')
                sendMessage(text, from, locale);
            break;
        case "postBack":
            exports.sendPostBack(botConnection, text, value, from, locale);
            break;
        case "call":
        case "openUrl":
        case "playAudio":
        case "playVideo":
        case "showImage":
        case "downloadFile":
        case "signin":
            window.open(text);
            break;
        default:
            konsole.log("unknown button type", type);
    }
};
exports.sendPostBack = (botConnection, text, value, from, locale) => {
    botConnection.postActivity({
        type: "message",
        text,
        value,
        from,
        locale
    })
        .subscribe(id => {
        konsole.log("success sending postBack", id);
    }, error => {
        konsole.log("failed to send postBack", error);
    });
};
exports.renderIfNonempty = (value, renderer) => {
    if (value !== undefined && value !== null && (typeof value !== 'string' || value.length > 0))
        return renderer(value);
};
exports.classList = (...args) => {
    return args.filter(Boolean).join(' ');
};
// note: container of this element must have CSS position of either absolute or relative
const ResizeDetector = (props) => 
// adapted to React from https://github.com/developit/simple-element-resize-detector
React.createElement("iframe", { style: { position: 'absolute', left: '0', top: '-100%', width: '100%', height: '100%', margin: '1px 0 0', border: 'none', opacity: 0, visibility: 'hidden', pointerEvents: 'none' }, ref: frame => {
        if (frame)
            frame.contentWindow.onresize = props.onresize;
    } });
// For auto-focus in some browsers, we synthetically insert keys into the chatbox.
// By default, we insert keys when:
// 1. evt.key.length === 1 (e.g. "1", "A", "=" keys), or
// 2. evt.key is one of the map keys below (e.g. "Add" will insert "+", "Decimal" will insert ".")
const INPUTTABLE_KEY = {
    Add: '+',
    Decimal: '.',
    Divide: '/',
    Multiply: '*',
    Subtract: '-' // Numpad subtract key
};
function inputtableKey(key) {
    return key.length === 1 ? key : INPUTTABLE_KEY[key];
}
//# sourceMappingURL=Chat.js.map

/***/ }),

/***/ "../../custom-botframework-webchat/built/FormattedText.js":
/*!*************************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/packages/custom-botframework-webchat/built/FormattedText.js ***!
  \*************************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const MarkdownIt = __webpack_require__(/*! markdown-it */ "../../../node_modules/markdown-it/index.js");
const React = __webpack_require__(/*! react */ "../../../node_modules/react/index.js");
exports.FormattedText = (props) => {
    if (!props.text || props.text === '')
        return null;
    switch (props.format) {
        case "xml":
        case "plain":
            return renderPlainText(props.text);
        default:
            return renderMarkdown(props.text, props.onImageLoad);
    }
};
const renderPlainText = (text) => {
    const lines = text.replace('\r', '').split('\n');
    const elements = lines.map((line, i) => React.createElement("span", { key: i },
        line,
        React.createElement("br", null)));
    return React.createElement("span", { className: "format-plain" }, elements);
};
const markdownIt = new MarkdownIt({ html: false, xhtmlOut: true, breaks: true, linkify: true, typographer: true });
//configure MarkdownIt to open links in new tab
//from https://github.com/markdown-it/markdown-it/blob/master/docs/architecture.md#renderer
// Remember old renderer, if overriden, or proxy to default renderer
const defaultRender = markdownIt.renderer.rules.link_open || ((tokens, idx, options, env, self) => {
    return self.renderToken(tokens, idx, options);
});
markdownIt.renderer.rules.link_open = (tokens, idx, options, env, self) => {
    // If you are sure other plugins can't add `target` - drop check below
    const targetIndex = tokens[idx].attrIndex('target');
    if (targetIndex < 0) {
        tokens[idx].attrPush(['target', '_blank']); // add new attribute
    }
    else {
        tokens[idx].attrs[targetIndex][1] = '_blank'; // replace value of existing attr
    }
    // pass token to default renderer.
    return defaultRender(tokens, idx, options, env, self);
};
const renderMarkdown = (text, onImageLoad) => {
    let __html;
    if (text.trim()) {
        const src = text
            // convert <br> tags to blank lines for markdown
            .replace(/<br\s*\/?>/ig, '\n')
            // URL encode all links
            .replace(/\[(.*?)\]\((.*?)( +".*?"){0,1}\)/ig, (match, text, url, title) => `[${text}](${markdownIt.normalizeLink(url)}${title === undefined ? '' : title})`);
        const arr = src.split(/\n *\n|\r\n *\r\n|\r *\r/);
        const ma = arr.map(a => markdownIt.render(a));
        __html = ma.join('<br/>');
    }
    else {
        // Replace spaces with non-breaking space Unicode characters
        __html = text.replace(/ */, '\u00A0');
    }
    return React.createElement("div", { className: "format-markdown", dangerouslySetInnerHTML: { __html } });
};
//# sourceMappingURL=FormattedText.js.map

/***/ }),

/***/ "../../custom-botframework-webchat/built/HScroll.js":
/*!*******************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/packages/custom-botframework-webchat/built/HScroll.js ***!
  \*******************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const React = __webpack_require__(/*! react */ "../../../node_modules/react/index.js");
const Observable_1 = __webpack_require__(/*! rxjs/Observable */ "../../../node_modules/rxjs/Observable.js");
__webpack_require__(/*! rxjs/add/observable/fromEvent */ "../../../node_modules/rxjs/add/observable/fromEvent.js");
__webpack_require__(/*! rxjs/add/observable/merge */ "../../../node_modules/rxjs/add/observable/merge.js");
class HScroll extends React.Component {
    constructor(props) {
        super(props);
    }
    clearScrollTimers() {
        clearInterval(this.scrollStartTimer);
        clearInterval(this.scrollSyncTimer);
        clearTimeout(this.scrollDurationTimer);
        document.body.removeChild(this.animateDiv);
        this.animateDiv = null;
        this.scrollStartTimer = null;
        this.scrollSyncTimer = null;
        this.scrollDurationTimer = null;
    }
    updateScrollButtons() {
        this.prevButton.disabled = !this.scrollDiv || Math.round(this.scrollDiv.scrollLeft) <= 0;
        this.nextButton.disabled = !this.scrollDiv || Math.round(this.scrollDiv.scrollLeft) >= Math.round(this.scrollDiv.scrollWidth - this.scrollDiv.offsetWidth);
    }
    componentDidMount() {
        this.scrollDiv.style.marginBottom = -(this.scrollDiv.offsetHeight - this.scrollDiv.clientHeight) + 'px';
        this.scrollSubscription = Observable_1.Observable.fromEvent(this.scrollDiv, 'scroll').subscribe(_ => {
            this.updateScrollButtons();
        });
        this.clickSubscription = Observable_1.Observable.merge(Observable_1.Observable.fromEvent(this.prevButton, 'click').map(_ => -1), Observable_1.Observable.fromEvent(this.nextButton, 'click').map(_ => 1)).subscribe(delta => {
            this.scrollBy(delta);
        });
        this.updateScrollButtons();
    }
    componentDidUpdate() {
        this.scrollDiv.scrollLeft = 0;
        this.updateScrollButtons();
    }
    componentWillUnmount() {
        this.scrollSubscription.unsubscribe();
        this.clickSubscription.unsubscribe();
    }
    scrollAmount(direction) {
        if (this.props.scrollUnit == 'item') {
            // TODO: this can be improved by finding the actual item in the viewport,
            // instead of the first item, because they may not have the same width.
            // the width of the li is measured on demand in case CSS has resized it
            const firstItem = this.scrollDiv.querySelector('ul > li');
            return firstItem ? direction * firstItem.offsetWidth : 0;
        }
        else {
            // TODO: use a good page size. This can be improved by finding the next clipped item.
            return direction * (this.scrollDiv.offsetWidth - 70);
        }
    }
    scrollBy(direction) {
        let easingClassName = 'wc-animate-scroll';
        //cancel existing animation when clicking fast
        if (this.animateDiv) {
            easingClassName = 'wc-animate-scroll-rapid';
            this.clearScrollTimers();
        }
        const unit = this.scrollAmount(direction);
        const scrollLeft = this.scrollDiv.scrollLeft;
        let dest = scrollLeft + unit;
        //don't exceed boundaries
        dest = Math.max(dest, 0);
        dest = Math.min(dest, this.scrollDiv.scrollWidth - this.scrollDiv.offsetWidth);
        if (scrollLeft == dest)
            return;
        //use proper easing curve when distance is small
        if (Math.abs(dest - scrollLeft) < 60) {
            easingClassName = 'wc-animate-scroll-near';
        }
        this.animateDiv = document.createElement('div');
        this.animateDiv.className = easingClassName;
        this.animateDiv.style.left = scrollLeft + 'px';
        document.body.appendChild(this.animateDiv);
        //capture ComputedStyle every millisecond
        this.scrollSyncTimer = window.setInterval(() => {
            const num = parseFloat(getComputedStyle(this.animateDiv).left);
            this.scrollDiv.scrollLeft = num;
        }, 1);
        //don't let the browser optimize the setting of 'this.animateDiv.style.left' - we need this to change values to trigger the CSS animation
        //we accomplish this by calling 'this.animateDiv.style.left' off this thread, using setTimeout
        this.scrollStartTimer = window.setTimeout(() => {
            this.animateDiv.style.left = dest + 'px';
            let duration = 1000 * parseFloat(getComputedStyle(this.animateDiv).transitionDuration);
            if (duration) {
                //slightly longer that the CSS time so we don't cut it off prematurely
                duration += 50;
                //stop capturing
                this.scrollDurationTimer = window.setTimeout(() => this.clearScrollTimers(), duration);
            }
            else {
                this.clearScrollTimers();
            }
        }, 1);
    }
    render() {
        return (React.createElement("div", null,
            React.createElement("button", { ref: button => this.prevButton = button, className: "scroll previous", disabled: true },
                React.createElement("svg", null,
                    React.createElement("path", { d: this.props.prevSvgPathData }))),
            React.createElement("div", { className: "wc-hscroll-outer" },
                React.createElement("div", { className: "wc-hscroll", ref: div => this.scrollDiv = div }, this.props.children)),
            React.createElement("button", { ref: button => this.nextButton = button, className: "scroll next", disabled: true },
                React.createElement("svg", null,
                    React.createElement("path", { d: this.props.nextSvgPathData })))));
    }
}
exports.HScroll = HScroll;
//# sourceMappingURL=HScroll.js.map

/***/ }),

/***/ "../../custom-botframework-webchat/built/History.js":
/*!*******************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/packages/custom-botframework-webchat/built/History.js ***!
  \*******************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const React = __webpack_require__(/*! react */ "../../../node_modules/react/index.js");
const react_redux_1 = __webpack_require__(/*! react-redux */ "../../../node_modules/react-redux/es/index.js");
const ActivityView_1 = __webpack_require__(/*! ./ActivityView */ "../../custom-botframework-webchat/built/ActivityView.js");
const Chat_1 = __webpack_require__(/*! ./Chat */ "../../custom-botframework-webchat/built/Chat.js");
const konsole = __webpack_require__(/*! ./Konsole */ "../../custom-botframework-webchat/built/Konsole.js");
const Store_1 = __webpack_require__(/*! ./Store */ "../../custom-botframework-webchat/built/Store.js");
class HistoryView extends React.Component {
    constructor(props) {
        super(props);
        this.scrollToBottom = true;
        // In order to do their cool horizontal scrolling thing, Carousels need to know how wide they can be.
        // So, at startup, we create this mock Carousel activity and measure it.
        this.measurableCarousel = () => 
        // find the largest possible message size by forcing a width larger than the chat itself
        React.createElement(WrappedActivity, { ref: x => this.carouselActivity = x, activity: {
                type: 'message',
                id: '',
                from: { id: '' },
                attachmentLayout: 'carousel'
            }, format: null, fromMe: false, onClickActivity: null, onClickRetry: null, selected: false, showTimestamp: false },
            React.createElement("div", { style: { width: this.largeWidth } }, "\u00A0"));
    }
    componentWillUpdate() {
        this.scrollToBottom = (Math.abs(this.scrollMe.scrollHeight - this.scrollMe.scrollTop - this.scrollMe.offsetHeight) <= 1);
    }
    componentDidUpdate() {
        if (this.props.format.carouselMargin == undefined) {
            // After our initial render we need to measure the carousel width
            // Measure the message padding by subtracting the known large width
            const paddedWidth = measurePaddedWidth(this.carouselActivity.messageDiv) - this.largeWidth;
            // Subtract the padding from the offsetParent's width to get the width of the content
            const maxContentWidth = this.carouselActivity.messageDiv.offsetParent.offsetWidth - paddedWidth;
            // Subtract the content width from the chat width to get the margin.
            // Next time we need to get the content width (on a resize) we can use this margin to get the maximum content width
            const carouselMargin = this.props.size.width - maxContentWidth;
            konsole.log('history measureMessage ' + carouselMargin);
            // Finally, save it away in the Store, which will force another re-render
            this.props.setMeasurements(carouselMargin);
            this.carouselActivity = null; // After the re-render this activity doesn't exist
        }
        this.autoscroll();
    }
    autoscroll() {
        const vAlignBottomPadding = Math.max(0, measurePaddedHeight(this.scrollMe) - this.scrollContent.offsetHeight);
        this.scrollContent.style.marginTop = vAlignBottomPadding + 'px';
        const lastActivity = this.props.activities[this.props.activities.length - 1];
        const lastActivityFromMe = lastActivity && this.props.isFromMe && this.props.isFromMe(lastActivity);
        // Validating if we are at the bottom of the list or the last activity was triggered by the user.
        if (this.scrollToBottom || lastActivityFromMe) {
            this.scrollMe.scrollTop = this.scrollMe.scrollHeight - this.scrollMe.offsetHeight;
        }
    }
    // At startup we do three render passes:
    // 1. To determine the dimensions of the chat panel (not much needs to actually render here)
    // 2. To determine the margins of any given carousel (we just render one mock activity so that we can measure it)
    // 3. (this is also the normal re-render case) To render without the mock activity
    doCardAction(type, value) {
        this.props.onClickCardAction();
        this.props.onCardAction && this.props.onCardAction();
        return this.props.doCardAction(type, value);
    }
    render() {
        konsole.log("History props", this);
        let content;
        if (this.props.size.width !== undefined) {
            if (this.props.format.carouselMargin === undefined) {
                // For measuring carousels we need a width known to be larger than the chat itself
                this.largeWidth = this.props.size.width * 2;
                content = React.createElement(this.measurableCarousel, null);
            }
            else {
                content = this.props.activities.map((activity, index) => React.createElement(WrappedActivity, { format: this.props.format, key: 'message' + index, activity: activity, showTimestamp: index === this.props.activities.length - 1 || (index + 1 < this.props.activities.length && suitableInterval(activity, this.props.activities[index + 1])), selected: this.props.isSelected(activity), fromMe: this.props.isFromMe(activity), onClickActivity: this.props.onClickActivity(activity), onClickRetry: e => {
                        // Since this is a click on an anchor, we need to stop it
                        // from trying to actually follow a (nonexistant) link
                        e.preventDefault();
                        e.stopPropagation();
                        this.props.onClickRetry(activity);
                    } },
                    React.createElement(ActivityView_1.ActivityView, { format: this.props.format, size: this.props.size, activity: activity, onCardAction: (type, value) => this.doCardAction(type, value), onImageLoad: () => this.autoscroll() })));
            }
        }
        const groupsClassName = Chat_1.classList('wc-message-groups', !this.props.format.options.showHeader && 'no-header');
        return (React.createElement("div", { className: groupsClassName, ref: div => this.scrollMe = div || this.scrollMe, role: "log", tabIndex: 0 },
            React.createElement("div", { className: "wc-message-group-content", ref: div => { if (div)
                    this.scrollContent = div; } }, content)));
    }
}
exports.HistoryView = HistoryView;
exports.History = react_redux_1.connect((state) => ({
    // passed down to HistoryView
    format: state.format,
    size: state.size,
    activities: state.history.activities,
    // only used to create helper functions below
    connectionSelectedActivity: state.connection.selectedActivity,
    selectedActivity: state.history.selectedActivity,
    botConnection: state.connection.botConnection,
    user: state.connection.user
}), {
    setMeasurements: (carouselMargin) => ({ type: 'Set_Measurements', carouselMargin }),
    onClickRetry: (activity) => ({ type: 'Send_Message_Retry', clientActivityId: activity.channelData.clientActivityId }),
    onClickCardAction: () => ({ type: 'Card_Action_Clicked' }),
    // only used to create helper functions below
    sendMessage: Store_1.sendMessage
}, (stateProps, dispatchProps, ownProps) => ({
    // from stateProps
    format: stateProps.format,
    size: stateProps.size,
    activities: stateProps.activities,
    // from dispatchProps
    setMeasurements: dispatchProps.setMeasurements,
    onClickRetry: dispatchProps.onClickRetry,
    onClickCardAction: dispatchProps.onClickCardAction,
    // helper functions
    doCardAction: Chat_1.doCardAction(stateProps.botConnection, stateProps.user, stateProps.format.locale, dispatchProps.sendMessage),
    isFromMe: (activity) => activity.from.id === stateProps.user.id || (activity.from.role && activity.from.role === 'user'),
    isSelected: (activity) => activity === stateProps.selectedActivity,
    onClickActivity: (activity) => stateProps.connectionSelectedActivity && (() => stateProps.connectionSelectedActivity.next({ activity })),
    onCardAction: ownProps.onCardAction
}), {
    withRef: true
})(HistoryView);
const getComputedStyleValues = (el, stylePropertyNames) => {
    const s = window.getComputedStyle(el);
    const result = {};
    stylePropertyNames.forEach(name => result[name] = parseInt(s.getPropertyValue(name)));
    return result;
};
const measurePaddedHeight = (el) => {
    const paddingTop = 'padding-top', paddingBottom = 'padding-bottom';
    const values = getComputedStyleValues(el, [paddingTop, paddingBottom]);
    return el.offsetHeight - values[paddingTop] - values[paddingBottom];
};
const measurePaddedWidth = (el) => {
    const paddingLeft = 'padding-left', paddingRight = 'padding-right';
    const values = getComputedStyleValues(el, [paddingLeft, paddingRight]);
    return el.offsetWidth + values[paddingLeft] + values[paddingRight];
};
const suitableInterval = (current, next) => Date.parse(next.timestamp) - Date.parse(current.timestamp) > 5 * 60 * 1000;
class WrappedActivity extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        let timeLine;
        switch (this.props.activity.id) {
            case undefined:
                timeLine = React.createElement("span", null, this.props.format.strings.messageSending);
                break;
            case null:
                timeLine = React.createElement("span", null, this.props.format.strings.messageFailed);
                break;
            case "retry":
                timeLine =
                    React.createElement("span", null,
                        this.props.format.strings.messageFailed,
                        ' ',
                        React.createElement("a", { href: ".", onClick: this.props.onClickRetry }, this.props.format.strings.messageRetry));
                break;
            default:
                let sent;
                if (this.props.showTimestamp)
                    sent = this.props.format.strings.timeSent.replace('%1', (new Date(this.props.activity.timestamp)).toLocaleTimeString());
                timeLine = React.createElement("span", null,
                    this.props.activity.from.name || this.props.activity.from.id,
                    sent);
                break;
        }
        const who = this.props.fromMe ? 'me' : 'bot';
        const wrapperClassName = Chat_1.classList('wc-message-wrapper', this.props.activity.attachmentLayout || 'list', this.props.onClickActivity && 'clickable');
        const contentClassName = Chat_1.classList('wc-message-content', this.props.selected && 'selected');
        return (React.createElement("div", { "data-activity-id": this.props.activity.id, className: wrapperClassName, onClick: this.props.onClickActivity },
            React.createElement("div", { className: 'wc-message wc-message-from-' + who, ref: div => this.messageDiv = div },
                React.createElement("div", { className: contentClassName },
                    React.createElement("svg", { className: "wc-message-callout" },
                        React.createElement("path", { className: "point-left", d: "m0,6 l6 6 v-12 z" }),
                        React.createElement("path", { className: "point-right", d: "m6,6 l-6 6 v-12 z" })),
                    this.props.children)),
            React.createElement("div", { className: 'wc-message-from wc-message-from-' + who }, timeLine)));
    }
}
exports.WrappedActivity = WrappedActivity;
//# sourceMappingURL=History.js.map

/***/ }),

/***/ "../../custom-botframework-webchat/built/Konsole.js":
/*!*******************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/packages/custom-botframework-webchat/built/Konsole.js ***!
  \*******************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.log = (message, ...optionalParams) => {
    if (typeof (window) !== 'undefined' && window["botchatDebug"] && message)
        console.log(message, ...optionalParams);
};
//# sourceMappingURL=Konsole.js.map

/***/ }),

/***/ "../../custom-botframework-webchat/built/MessagePane.js":
/*!***********************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/packages/custom-botframework-webchat/built/MessagePane.js ***!
  \***********************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const React = __webpack_require__(/*! react */ "../../../node_modules/react/index.js");
const react_redux_1 = __webpack_require__(/*! react-redux */ "../../../node_modules/react-redux/es/index.js");
const Chat_1 = __webpack_require__(/*! ./Chat */ "../../custom-botframework-webchat/built/Chat.js");
const Store_1 = __webpack_require__(/*! ./Store */ "../../custom-botframework-webchat/built/Store.js");
const MessagePaneView = (props) => React.createElement("div", { className: 'wc-message-pane' }, props.children);
exports.MessagePane = react_redux_1.connect((state) => ({
    // only used to create helper functions below
    botConnection: state.connection.botConnection,
    user: state.connection.user,
    locale: state.format.locale
}), {
    // only used to create helper functions below
    sendMessage: Store_1.sendMessage
}, (stateProps, dispatchProps, ownProps) => ({
    // from ownProps
    children: ownProps.children,
    // helper functions
    doCardAction: Chat_1.doCardAction(stateProps.botConnection, stateProps.user, stateProps.locale, dispatchProps.sendMessage),
}))(MessagePaneView);
//# sourceMappingURL=MessagePane.js.map

/***/ }),

/***/ "../../custom-botframework-webchat/built/Shell.js":
/*!*****************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/packages/custom-botframework-webchat/built/Shell.js ***!
  \*****************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const React = __webpack_require__(/*! react */ "../../../node_modules/react/index.js");
const Chat_1 = __webpack_require__(/*! ./Chat */ "../../custom-botframework-webchat/built/Chat.js");
const react_redux_1 = __webpack_require__(/*! react-redux */ "../../../node_modules/react-redux/es/index.js");
const SpeechModule_1 = __webpack_require__(/*! ./SpeechModule */ "../../custom-botframework-webchat/built/SpeechModule.js");
const Store_1 = __webpack_require__(/*! ./Store */ "../../custom-botframework-webchat/built/Store.js");
class ShellContainer extends React.Component {
    sendMessage() {
        if (this.props.inputText.trim().length > 0) {
            this.props.sendMessage(this.props.inputText);
        }
    }
    handleSendButtonKeyPress(evt) {
        if (evt.key === 'Enter' || evt.key === ' ') {
            evt.preventDefault();
            this.sendMessage();
            this.textInput.focus();
        }
    }
    handleUploadButtonKeyPress(evt) {
        if (evt.key === 'Enter' || evt.key === ' ') {
            evt.preventDefault();
            this.fileInput.click();
        }
    }
    onKeyPress(e) {
        if (e.key === 'Enter') {
            this.sendMessage();
        }
    }
    onClickSend() {
        this.sendMessage();
    }
    onChangeFile() {
        this.props.sendFiles(this.fileInput.files);
        this.fileInput.value = null;
        this.textInput.focus();
    }
    onTextInputFocus() {
        if (this.props.listening) {
            this.props.stopListening();
        }
    }
    onClickMic() {
        if (this.props.listening) {
            this.props.stopListening();
        }
        else {
            this.props.startListening();
        }
    }
    focus(appendKey) {
        this.textInput.focus();
        if (appendKey) {
            this.props.onChangeText(this.props.inputText + appendKey);
        }
    }
    render() {
        if (this.props.visible === false)
            return false;
        const className = Chat_1.classList('wc-console', this.props.inputText.length > 0 && 'has-text');
        const showMicButton = this.props.listening || (SpeechModule_1.Speech.SpeechRecognizer.speechIsAvailable() && !this.props.inputText.length);
        const sendButtonClassName = Chat_1.classList('wc-send', showMicButton && 'hidden');
        const micButtonClassName = Chat_1.classList('wc-mic', !showMicButton && 'hidden', this.props.listening && 'active', !this.props.listening && 'inactive');
        const placeholder = this.props.listening ? this.props.strings.listeningIndicator : this.props.strings.consolePlaceholder;
        return (React.createElement("div", { className: className },
            React.createElement("label", { className: "wc-upload", htmlFor: "wc-upload-input", onKeyPress: evt => this.handleUploadButtonKeyPress(evt), tabIndex: 0 },
                React.createElement("svg", null,
                    React.createElement("path", { d: "M19.96 4.79m-2 0a2 2 0 0 1 4 0 2 2 0 0 1-4 0zM8.32 4.19L2.5 15.53 22.45 15.53 17.46 8.56 14.42 11.18 8.32 4.19ZM1.04 1L1.04 17 24.96 17 24.96 1 1.04 1ZM1.03 0L24.96 0C25.54 0 26 0.45 26 0.99L26 17.01C26 17.55 25.53 18 24.96 18L1.03 18C0.46 18 0 17.55 0 17.01L0 0.99C0 0.45 0.47 0 1.03 0Z" }))),
            React.createElement("input", { id: "wc-upload-input", tabIndex: -1, type: "file", ref: input => this.fileInput = input, multiple: true, onChange: () => this.onChangeFile(), "aria-label": this.props.strings.uploadFile, role: "button" }),
            React.createElement("div", { className: "wc-textbox" },
                React.createElement("input", { type: "text", className: "wc-shellinput", ref: input => this.textInput = input, autoFocus: true, value: this.props.inputText, onChange: _ => this.props.onChangeText(this.textInput.value), onKeyPress: e => this.onKeyPress(e), onFocus: () => this.onTextInputFocus(), placeholder: placeholder, "aria-label": this.props.inputText ? null : placeholder, "aria-live": "polite" })),
            React.createElement("button", { className: sendButtonClassName, onClick: () => this.onClickSend(), "aria-label": this.props.strings.send, role: "button", onKeyPress: evt => this.handleSendButtonKeyPress(evt), tabIndex: 0 },
                React.createElement("svg", null,
                    React.createElement("path", { d: "M26.79 9.38A0.31 0.31 0 0 0 26.79 8.79L0.41 0.02C0.36 0 0.34 0 0.32 0 0.14 0 0 0.13 0 0.29 0 0.33 0.01 0.37 0.03 0.41L3.44 9.08 0.03 17.76A0.29 0.29 0 0 0 0.01 17.8 0.28 0.28 0 0 0 0.01 17.86C0.01 18.02 0.14 18.16 0.3 18.16A0.3 0.3 0 0 0 0.41 18.14L26.79 9.38ZM0.81 0.79L24.84 8.79 3.98 8.79 0.81 0.79ZM3.98 9.37L24.84 9.37 0.81 17.37 3.98 9.37Z" }))),
            React.createElement("button", { className: micButtonClassName, onClick: () => this.onClickMic(), "aria-label": this.props.strings.speak, role: "button", tabIndex: 0 },
                React.createElement("svg", { width: "28", height: "22", viewBox: "0 0 58 58" },
                    React.createElement("path", { d: "M 44 28 C 43.448 28 43 28.447 43 29 L 43 35 C 43 42.72 36.72 49 29 49 C 21.28 49 15 42.72 15 35 L 15 29 C 15 28.447 14.552 28 14 28 C 13.448 28 13 28.447 13 29 L 13 35 C 13 43.485 19.644 50.429 28 50.949 L 28 56 L 23 56 C 22.448 56 22 56.447 22 57 C 22 57.553 22.448 58 23 58 L 35 58 C 35.552 58 36 57.553 36 57 C 36 56.447 35.552 56 35 56 L 30 56 L 30 50.949 C 38.356 50.429 45 43.484 45 35 L 45 29 C 45 28.447 44.552 28 44 28 Z" }),
                    React.createElement("path", { id: "micFilling", d: "M 28.97 44.438 L 28.97 44.438 C 23.773 44.438 19.521 40.033 19.521 34.649 L 19.521 11.156 C 19.521 5.772 23.773 1.368 28.97 1.368 L 28.97 1.368 C 34.166 1.368 38.418 5.772 38.418 11.156 L 38.418 34.649 C 38.418 40.033 34.166 44.438 28.97 44.438 Z" }),
                    React.createElement("path", { d: "M 29 46 C 35.065 46 40 41.065 40 35 L 40 11 C 40 4.935 35.065 0 29 0 C 22.935 0 18 4.935 18 11 L 18 35 C 18 41.065 22.935 46 29 46 Z M 20 11 C 20 6.037 24.038 2 29 2 C 33.962 2 38 6.037 38 11 L 38 35 C 38 39.963 33.962 44 29 44 C 24.038 44 20 39.963 20 35 L 20 11 Z" })))));
    }
}
exports.Shell = react_redux_1.connect((state) => ({
    // passed down to ShellContainer
    visible: state.shell.visible,
    inputText: state.shell.input,
    strings: state.format.strings,
    // only used to create helper functions below
    locale: state.format.locale,
    user: state.connection.user,
    listening: state.shell.listening
}), {
    // passed down to ShellContainer
    onChangeText: (input) => ({ type: 'Update_Input', input, source: "text" }),
    stopListening: () => ({ type: 'Listening_Stop' }),
    startListening: () => ({ type: 'Listening_Starting' }),
    // only used to create helper functions below
    sendMessage: Store_1.sendMessage,
    sendFiles: Store_1.sendFiles
}, (stateProps, dispatchProps, ownProps) => ({
    // from stateProps
    visible: stateProps.visible,
    inputText: stateProps.inputText,
    strings: stateProps.strings,
    listening: stateProps.listening,
    // from dispatchProps
    onChangeText: dispatchProps.onChangeText,
    // helper functions
    sendMessage: (text) => dispatchProps.sendMessage(text, stateProps.user, stateProps.locale),
    sendFiles: (files) => dispatchProps.sendFiles(files, stateProps.user, stateProps.locale),
    startListening: () => dispatchProps.startListening(),
    stopListening: () => dispatchProps.stopListening()
}), {
    withRef: true
})(ShellContainer);
//# sourceMappingURL=Shell.js.map

/***/ }),

/***/ "../../custom-botframework-webchat/built/SpeechModule.js":
/*!************************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/packages/custom-botframework-webchat/built/SpeechModule.js ***!
  \************************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Speech;
(function (Speech) {
    class SpeechRecognizer {
        static setSpeechRecognizer(recognizer) {
            SpeechRecognizer.instance = recognizer;
        }
        static startRecognizing(locale = 'en-US', onIntermediateResult = null, onFinalResult = null, onAudioStreamStarted = null, onRecognitionFailed = null) {
            if (!SpeechRecognizer.speechIsAvailable())
                return;
            if (locale && SpeechRecognizer.instance.locale !== locale) {
                SpeechRecognizer.instance.stopRecognizing();
                SpeechRecognizer.instance.locale = locale; // to do this could invalidate warmup.
            }
            if (SpeechRecognizer.alreadyRecognizing()) {
                SpeechRecognizer.stopRecognizing();
            }
            SpeechRecognizer.instance.onIntermediateResult = onIntermediateResult;
            SpeechRecognizer.instance.onFinalResult = onFinalResult;
            SpeechRecognizer.instance.onAudioStreamingToService = onAudioStreamStarted;
            SpeechRecognizer.instance.onRecognitionFailed = onRecognitionFailed;
            SpeechRecognizer.instance.startRecognizing();
        }
        static stopRecognizing() {
            if (!SpeechRecognizer.speechIsAvailable())
                return;
            SpeechRecognizer.instance.stopRecognizing();
        }
        static warmup() {
            if (!SpeechRecognizer.speechIsAvailable())
                return;
            SpeechRecognizer.instance.warmup();
        }
        static speechIsAvailable() {
            return SpeechRecognizer.instance != null && SpeechRecognizer.instance.speechIsAvailable();
        }
        static alreadyRecognizing() {
            return SpeechRecognizer.instance ? SpeechRecognizer.instance.isStreamingToService : false;
        }
    }
    SpeechRecognizer.instance = null;
    Speech.SpeechRecognizer = SpeechRecognizer;
    class SpeechSynthesizer {
        static setSpeechSynthesizer(speechSynthesizer) {
            SpeechSynthesizer.instance = speechSynthesizer;
        }
        static speak(text, lang, onSpeakingStarted = null, onSpeakingFinished = null) {
            if (SpeechSynthesizer.instance == null)
                return;
            SpeechSynthesizer.instance.speak(text, lang, onSpeakingStarted, onSpeakingFinished);
        }
        static stopSpeaking() {
            if (SpeechSynthesizer.instance == null)
                return;
            SpeechSynthesizer.instance.stopSpeaking();
        }
    }
    SpeechSynthesizer.instance = null;
    Speech.SpeechSynthesizer = SpeechSynthesizer;
    class BrowserSpeechRecognizer {
        constructor() {
            this.locale = null;
            this.isStreamingToService = false;
            this.onIntermediateResult = null;
            this.onFinalResult = null;
            this.onAudioStreamingToService = null;
            this.onRecognitionFailed = null;
            this.recognizer = null;
            if (!window.webkitSpeechRecognition) {
                console.error("This browser does not support speech recognition");
                return;
            }
            this.recognizer = new window.webkitSpeechRecognition();
            this.recognizer.lang = 'en-US';
            this.recognizer.interimResults = true;
            this.recognizer.onaudiostart = () => {
                if (this.onAudioStreamingToService) {
                    this.onAudioStreamingToService();
                }
            };
            this.recognizer.onresult = (srevent) => {
                if (srevent.results == null || srevent.length == 0) {
                    return;
                }
                const result = srevent.results[0];
                if (result.isFinal === true && this.onFinalResult != null) {
                    this.onFinalResult(result[0].transcript);
                }
                else if (result.isFinal === false && this.onIntermediateResult != null) {
                    let text = "";
                    for (let i = 0; i < srevent.results.length; ++i) {
                        text += srevent.results[i][0].transcript;
                    }
                    this.onIntermediateResult(text);
                }
            };
            this.recognizer.onerror = (err) => {
                if (this.onRecognitionFailed) {
                    this.onRecognitionFailed();
                }
                throw err;
            };
        }
        speechIsAvailable() {
            return this.recognizer != null;
        }
        warmup() {
        }
        startRecognizing() {
            this.recognizer.start();
        }
        stopRecognizing() {
            this.recognizer.stop();
        }
    }
    Speech.BrowserSpeechRecognizer = BrowserSpeechRecognizer;
    class BrowserSpeechSynthesizer {
        constructor() {
            this.lastOperation = null;
            this.audioElement = null;
            this.speakRequests = [];
        }
        speak(text, lang, onSpeakingStarted = null, onSpeakingFinished = null) {
            if (!('SpeechSynthesisUtterance' in window) || !text)
                return;
            if (this.audioElement === null) {
                const audio = document.createElement('audio');
                audio.id = 'player';
                audio.autoplay = true;
                this.audioElement = audio;
            }
            const chunks = new Array();
            if (text[0] === '<') {
                if (text.indexOf('<speak') != 0)
                    text = '<speak>\n' + text + '\n</speak>\n';
                const parser = new DOMParser();
                const dom = parser.parseFromString(text, 'text/xml');
                const nodes = dom.documentElement.childNodes;
                this.processNodes(nodes, chunks);
            }
            else {
                chunks.push(text);
            }
            const onSpeakingFinishedWrapper = () => {
                if (onSpeakingFinished !== null)
                    onSpeakingFinished();
                // remove this from the queue since it's done:
                if (this.speakRequests.length) {
                    this.speakRequests[0].completed();
                    this.speakRequests.splice(0, 1);
                }
                // If there are other speak operations in the queue, process them
                if (this.speakRequests.length) {
                    this.playNextTTS(this.speakRequests[0], 0);
                }
            };
            const request = new SpeakRequest(chunks, lang, (speakOp) => { this.lastOperation = speakOp; }, onSpeakingStarted, onSpeakingFinishedWrapper);
            if (this.speakRequests.length === 0) {
                this.speakRequests = [request];
                this.playNextTTS(this.speakRequests[0], 0);
            }
            else {
                this.speakRequests.push(request);
            }
        }
        stopSpeaking() {
            if (('SpeechSynthesisUtterance' in window) === false)
                return;
            if (this.speakRequests.length) {
                if (this.audioElement)
                    this.audioElement.pause();
                this.speakRequests.forEach(req => {
                    req.abandon();
                });
                this.speakRequests = [];
                const ss = window.speechSynthesis;
                if (ss.speaking || ss.pending) {
                    if (this.lastOperation)
                        this.lastOperation.onend = null;
                    ss.cancel();
                }
            }
        }
        ;
        playNextTTS(requestContainer, iCurrent) {
            // lang : string, onSpeakQueued: Func<SpeechSynthesisUtterance, void>, onSpeakStarted : Action, onFinishedSpeaking : Action
            const moveToNext = () => {
                this.playNextTTS(requestContainer, iCurrent + 1);
            };
            if (iCurrent < requestContainer.speakChunks.length) {
                const current = requestContainer.speakChunks[iCurrent];
                if (typeof current === 'number') {
                    setTimeout(moveToNext, current);
                }
                else {
                    if (current.indexOf('http') === 0) {
                        const audio = this.audioElement; // document.getElementById('player');
                        audio.src = current;
                        audio.onended = moveToNext;
                        audio.onerror = moveToNext;
                        audio.play();
                    }
                    else {
                        const msg = new SpeechSynthesisUtterance();
                        // msg.voiceURI = 'native';
                        // msg.volume = 1; // 0 to 1
                        // msg.rate = 1; // 0.1 to 10
                        // msg.pitch = 2; //0 to 2
                        msg.text = current;
                        msg.lang = requestContainer.lang;
                        msg.onstart = iCurrent === 0 ? requestContainer.onSpeakingStarted : null;
                        msg.onend = moveToNext;
                        msg.onerror = moveToNext;
                        if (requestContainer.onSpeakQueued)
                            requestContainer.onSpeakQueued(msg);
                        window.speechSynthesis.speak(msg);
                    }
                }
            }
            else {
                if (requestContainer.onSpeakingFinished)
                    requestContainer.onSpeakingFinished();
            }
        }
        // process SSML markup into an array of either 
        // * utterenance
        // * number which is delay in msg
        // * url which is an audio file 
        processNodes(nodes, output) {
            for (let i = 0; i < nodes.length; i++) {
                const node = nodes[i];
                switch (node.nodeName) {
                    case 'p':
                        this.processNodes(node.childNodes, output);
                        output.push(250);
                        break;
                    case 'break':
                        if (node.attributes.getNamedItem('strength')) {
                            const strength = node.attributes.getNamedItem('strength').nodeValue;
                            if (strength === 'weak') {
                                // output.push(50);
                            }
                            else if (strength === 'medium') {
                                output.push(50);
                            }
                            else if (strength === 'strong') {
                                output.push(100);
                            }
                            else if (strength === 'x-strong') {
                                output.push(250);
                            }
                        }
                        else if (node.attributes.getNamedItem('time')) {
                            output.push(JSON.parse(node.attributes.getNamedItem('time').value));
                        }
                        break;
                    case 'audio':
                        if (node.attributes.getNamedItem('src')) {
                            output.push(node.attributes.getNamedItem('src').value);
                        }
                        break;
                    case 'say-as':
                    case 'prosody': // ToDo: handle via msg.rate
                    case 'emphasis': // ToDo: can probably emulate via prosody + pitch 
                    case 'w':
                    case 'phoneme': //
                    case 'voice':
                        this.processNodes(node.childNodes, output);
                        break;
                    default:
                        // Todo: coalesce consecutive non numeric / non html entries.
                        output.push(node.nodeValue);
                        break;
                }
            }
        }
    }
    Speech.BrowserSpeechSynthesizer = BrowserSpeechSynthesizer;
    class SpeakRequest {
        constructor(speakChunks, lang, onSpeakQueued = null, onSpeakingStarted = null, onSpeakingFinished = null) {
            this._onSpeakQueued = null;
            this._onSpeakingStarted = null;
            this._onSpeakingFinished = null;
            this._speakChunks = [];
            this._lang = null;
            this._onSpeakQueued = onSpeakQueued;
            this._onSpeakingStarted = onSpeakingStarted;
            this._onSpeakingFinished = onSpeakingFinished;
            this._speakChunks = speakChunks;
            this._lang = lang;
        }
        abandon() {
            this._speakChunks = [];
        }
        completed() {
            this._speakChunks = [];
        }
        get onSpeakQueued() { return this._onSpeakQueued; }
        get onSpeakingStarted() { return this._onSpeakingStarted; }
        get onSpeakingFinished() { return this._onSpeakingFinished; }
        get speakChunks() { return this._speakChunks; }
        get lang() { return this._lang; }
    }
})(Speech = exports.Speech || (exports.Speech = {}));
//# sourceMappingURL=SpeechModule.js.map

/***/ }),

/***/ "../../custom-botframework-webchat/built/SpeechOptions.js":
/*!*************************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/packages/custom-botframework-webchat/built/SpeechOptions.js ***!
  \*************************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class SpeechOptions {
}
exports.SpeechOptions = SpeechOptions;
//# sourceMappingURL=SpeechOptions.js.map

/***/ }),

/***/ "../../custom-botframework-webchat/built/Store.js":
/*!*****************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/packages/custom-botframework-webchat/built/Store.js ***!
  \*****************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const custom_botframework_directlinejs_1 = __webpack_require__(/*! @bfemulator/custom-botframework-directlinejs */ "../../custom-botframework-directlinejs/built/directLine.js");
const Strings_1 = __webpack_require__(/*! ./Strings */ "../../custom-botframework-webchat/built/Strings.js");
const SpeechModule_1 = __webpack_require__(/*! ./SpeechModule */ "../../custom-botframework-webchat/built/SpeechModule.js");
const adaptivecards_1 = __webpack_require__(/*! adaptivecards */ "../../../node_modules/adaptivecards/lib/adaptivecards.js");
const konsole = __webpack_require__(/*! ./Konsole */ "../../custom-botframework-webchat/built/Konsole.js");
exports.sendMessage = (text, from, locale) => ({
    type: 'Send_Message',
    activity: {
        type: "message",
        text,
        from,
        locale,
        textFormat: 'plain',
        timestamp: (new Date()).toISOString()
    }
});
exports.sendFiles = (files, from, locale) => ({
    type: 'Send_Message',
    activity: {
        type: "message",
        attachments: attachmentsFromFiles(files),
        from,
        locale
    }
});
const attachmentsFromFiles = (files) => {
    const attachments = [];
    for (let i = 0, numFiles = files.length; i < numFiles; i++) {
        const file = files[i];
        attachments.push({
            contentType: file.type,
            contentUrl: window.URL.createObjectURL(file),
            name: file.name
        });
    }
    return attachments;
};
exports.shell = (state = {
    visible: true,
    input: '',
    sendTyping: false,
    listening: false,
    lastInputViaSpeech: false
}, action) => {
    switch (action.type) {
        case 'Update_Input':
            return Object.assign({}, state, { input: action.input, lastInputViaSpeech: action.source == "speech" });
        case 'Listening_Start':
            return Object.assign({}, state, { listening: true });
        case 'Listening_Stop':
            return Object.assign({}, state, { listening: false });
        case 'Send_Message':
            return Object.assign({}, state, { input: '' });
        case 'Set_Send_Typing':
            return Object.assign({}, state, { sendTyping: action.sendTyping });
        case 'Set_Visible':
            return Object.assign({}, state, { visible: action.visible });
        case 'Card_Action_Clicked':
            return Object.assign({}, state, { lastInputViaSpeech: false });
        default:
        case 'Listening_Starting':
            return state;
    }
};
exports.format = (state = {
    locale: 'en-us',
    options: {
        showHeader: true
    },
    strings: Strings_1.defaultStrings,
    carouselMargin: undefined
}, action) => {
    switch (action.type) {
        case 'Set_Format_Options':
            return Object.assign({}, state, { options: Object.assign({}, state.options, action.options) });
        case 'Set_Locale':
            return Object.assign({}, state, { locale: action.locale, strings: Strings_1.strings(action.locale) });
        case 'Set_Measurements':
            return Object.assign({}, state, { carouselMargin: action.carouselMargin });
        default:
            return state;
    }
};
exports.size = (state = {
    width: undefined,
    height: undefined
}, action) => {
    switch (action.type) {
        case 'Set_Size':
            return Object.assign({}, state, { width: action.width, height: action.height });
        default:
            return state;
    }
};
exports.connection = (state = {
    connectionStatus: custom_botframework_directlinejs_1.ConnectionStatus.Uninitialized,
    botConnection: undefined,
    selectedActivity: undefined,
    user: undefined,
    bot: undefined
}, action) => {
    switch (action.type) {
        case 'Start_Connection':
            return Object.assign({}, state, { botConnection: action.botConnection, user: action.user, bot: action.bot, selectedActivity: action.selectedActivity });
        case 'Connection_Change':
            return Object.assign({}, state, { connectionStatus: action.connectionStatus });
        default:
            return state;
    }
};
const copyArrayWithUpdatedItem = (array, i, item) => [
    ...array.slice(0, i),
    item,
    ...array.slice(i + 1)
];
exports.history = (state = {
    activities: [],
    clientActivityBase: Date.now().toString() + Math.random().toString().substr(1) + '.',
    clientActivityCounter: 0,
    selectedActivity: null
}, action) => {
    konsole.log("history action", action);
    switch (action.type) {
        case 'Receive_Sent_Message': {
            if (!action.activity.channelData || !action.activity.channelData.clientActivityId) {
                // only postBack messages don't have clientActivityId, and these shouldn't be added to the history
                return state;
            }
            const i = state.activities.findIndex(activity => activity.channelData && activity.channelData.clientActivityId === action.activity.channelData.clientActivityId);
            if (i !== -1) {
                const activity = state.activities[i];
                return Object.assign({}, state, { activities: copyArrayWithUpdatedItem(state.activities, i, activity), selectedActivity: state.selectedActivity === activity ? action.activity : state.selectedActivity });
            }
            // else fall through and treat this as a new message
        }
        case 'Receive_Message':
            if (state.activities.find(a => a.id === action.activity.id))
                return state; // don't allow duplicate messages
            return Object.assign({}, state, { activities: [
                    ...state.activities.filter(activity => activity.type !== "typing"),
                    action.activity,
                    ...state.activities.filter(activity => activity.from.id !== action.activity.from.id && activity.type === "typing"),
                ] });
        case 'Send_Message':
            return Object.assign({}, state, { activities: [
                    ...state.activities.filter(activity => activity.type !== "typing"),
                    Object.assign({}, action.activity, { timestamp: (new Date()).toISOString(), channelData: { clientActivityId: state.clientActivityBase + state.clientActivityCounter } }),
                    ...state.activities.filter(activity => activity.type === "typing"),
                ], clientActivityCounter: state.clientActivityCounter + 1 });
        case 'Send_Message_Retry': {
            const activity = state.activities.find(activity => activity.channelData && activity.channelData.clientActivityId === action.clientActivityId);
            const newActivity = activity.id === undefined ? activity : Object.assign({}, activity, { id: undefined });
            return Object.assign({}, state, { activities: [
                    ...state.activities.filter(activityT => activityT.type !== "typing" && activityT !== activity),
                    newActivity,
                    ...state.activities.filter(activity => activity.type === "typing")
                ], selectedActivity: state.selectedActivity === activity ? newActivity : state.selectedActivity });
        }
        case 'Send_Message_Succeed':
        case 'Send_Message_Fail': {
            const i = state.activities.findIndex(activity => activity.channelData && activity.channelData.clientActivityId === action.clientActivityId);
            if (i === -1)
                return state;
            const activity = state.activities[i];
            if (activity.id && activity.id != "retry")
                return state;
            const newActivity = Object.assign({}, activity, { id: action.type === 'Send_Message_Succeed' ? action.id : null });
            return Object.assign({}, state, { activities: copyArrayWithUpdatedItem(state.activities, i, newActivity), clientActivityCounter: state.clientActivityCounter + 1, selectedActivity: state.selectedActivity === activity ? newActivity : state.selectedActivity });
        }
        case 'Show_Typing':
            return Object.assign({}, state, { activities: [
                    ...state.activities.filter(activity => activity.type !== "typing"),
                    ...state.activities.filter(activity => activity.from.id !== action.activity.from.id && activity.type === "typing"),
                    action.activity
                ] });
        case 'Clear_Typing':
            return Object.assign({}, state, { activities: state.activities.filter(activity => activity.id !== action.id), selectedActivity: state.selectedActivity && state.selectedActivity.id === action.id ? null : state.selectedActivity });
        case 'Select_Activity':
            if (action.selectedActivity === state.selectedActivity)
                return state;
            return Object.assign({}, state, { selectedActivity: action.selectedActivity });
        case 'Take_SuggestedAction':
            const i = state.activities.findIndex(activity => activity === action.message);
            const activity = state.activities[i];
            const newActivity = Object.assign({}, activity, { suggestedActions: undefined });
            return Object.assign({}, state, { activities: copyArrayWithUpdatedItem(state.activities, i, newActivity), selectedActivity: state.selectedActivity === activity ? newActivity : state.selectedActivity });
        default:
            return state;
    }
};
exports.adaptiveCards = (state = {
    hostConfig: null
}, action) => {
    switch (action.type) {
        case 'Set_AdaptiveCardsHostConfig':
            return Object.assign({}, state, { hostConfig: action.payload && (action.payload instanceof adaptivecards_1.HostConfig ? action.payload : new adaptivecards_1.HostConfig(action.payload)) });
        default:
            return state;
    }
};
const nullAction = { type: null };
const speakFromMsg = (msg, fallbackLocale) => {
    let speak = msg.speak;
    if (!speak && msg.textFormat == null || msg.textFormat == "plain")
        speak = msg.text;
    if (!speak && msg.channelData && msg.channelData.speechOutput && msg.channelData.speechOutput.speakText)
        speak = msg.channelData.speechOutput.speakText;
    if (!speak && msg.attachments && msg.attachments.length > 0)
        for (let i = 0; i < msg.attachments.length; i++) {
            var anymsg = msg;
            if (anymsg.attachments[i]["content"] && anymsg.attachments[i]["content"]["speak"]) {
                speak = anymsg.attachments[i]["content"]["speak"];
                break;
            }
        }
    return {
        type: 'Speak_SSML',
        ssml: speak,
        locale: msg.locale || fallbackLocale,
        autoListenAfterSpeak: (msg.inputHint == "expectingInput") || (msg.channelData && msg.channelData.botState == "WaitingForAnswerToQuestion"),
    };
};
// Epics - chain actions together with async operations
const redux_1 = __webpack_require__(/*! redux */ "../../../node_modules/redux/es/index.js");
const Observable_1 = __webpack_require__(/*! rxjs/Observable */ "../../../node_modules/rxjs/Observable.js");
__webpack_require__(/*! rxjs/add/operator/catch */ "../../../node_modules/rxjs/add/operator/catch.js");
__webpack_require__(/*! rxjs/add/operator/delay */ "../../../node_modules/rxjs/add/operator/delay.js");
__webpack_require__(/*! rxjs/add/operator/do */ "../../../node_modules/rxjs/add/operator/do.js");
__webpack_require__(/*! rxjs/add/operator/filter */ "../../../node_modules/rxjs/add/operator/filter.js");
__webpack_require__(/*! rxjs/add/operator/map */ "../../../node_modules/rxjs/add/operator/map.js");
__webpack_require__(/*! rxjs/add/operator/merge */ "../../../node_modules/rxjs/add/operator/merge.js");
__webpack_require__(/*! rxjs/add/operator/mergeMap */ "../../../node_modules/rxjs/add/operator/mergeMap.js");
__webpack_require__(/*! rxjs/add/operator/throttleTime */ "../../../node_modules/rxjs/add/operator/throttleTime.js");
__webpack_require__(/*! rxjs/add/operator/takeUntil */ "../../../node_modules/rxjs/add/operator/takeUntil.js");
__webpack_require__(/*! rxjs/add/observable/bindCallback */ "../../../node_modules/rxjs/add/observable/bindCallback.js");
__webpack_require__(/*! rxjs/add/observable/empty */ "../../../node_modules/rxjs/add/observable/empty.js");
__webpack_require__(/*! rxjs/add/observable/of */ "../../../node_modules/rxjs/add/observable/of.js");
const sendMessageEpic = (action$, store) => action$.ofType('Send_Message')
    .map(action => {
    const state = store.getState();
    const clientActivityId = state.history.clientActivityBase + (state.history.clientActivityCounter - 1);
    return { type: 'Send_Message_Try', clientActivityId };
});
const trySendMessageEpic = (action$, store) => action$.ofType('Send_Message_Try')
    .flatMap(action => {
    const state = store.getState();
    const clientActivityId = action.clientActivityId;
    const activity = state.history.activities.find(activity => activity.channelData && activity.channelData.clientActivityId === clientActivityId);
    if (!activity) {
        konsole.log("trySendMessage: activity not found");
        return Observable_1.Observable.empty();
    }
    if (state.history.clientActivityCounter == 1) {
        var capabilities = {
            type: 'ClientCapabilities',
            requiresBotState: true,
            supportsTts: true,
            supportsListening: true,
        };
        activity.entities = activity.entities == null ? [capabilities] : [...activity.entities, capabilities];
    }
    return state.connection.botConnection.postActivity(activity)
        .map(id => ({ type: 'Send_Message_Succeed', clientActivityId, id }))
        .catch(error => Observable_1.Observable.of({ type: 'Send_Message_Fail', clientActivityId }));
});
const speakObservable = Observable_1.Observable.bindCallback(SpeechModule_1.Speech.SpeechSynthesizer.speak);
const speakSSMLEpic = (action$, store) => action$.ofType('Speak_SSML')
    .filter(action => action.ssml)
    .mergeMap(action => {
    var onSpeakingStarted = null;
    var onSpeakingFinished = () => nullAction;
    if (action.autoListenAfterSpeak) {
        onSpeakingStarted = () => SpeechModule_1.Speech.SpeechRecognizer.warmup();
        onSpeakingFinished = () => ({ type: 'Listening_Starting' });
    }
    const call$ = speakObservable(action.ssml, action.locale, onSpeakingStarted, undefined);
    return call$.map(onSpeakingFinished)
        .catch(error => Observable_1.Observable.of(nullAction));
})
    .merge(action$.ofType('Speak_SSML').map(_ => ({ type: 'Listening_Stop' })));
const speakOnMessageReceivedEpic = (action$, store) => action$.ofType('Receive_Message')
    .filter(action => action.activity && store.getState().shell.lastInputViaSpeech)
    .map(action => speakFromMsg(action.activity, store.getState().format.locale));
const stopSpeakingEpic = (action$) => action$.ofType('Update_Input', 'Listening_Starting', 'Send_Message', 'Card_Action_Clicked', 'Stop_Speaking')
    .do(SpeechModule_1.Speech.SpeechSynthesizer.stopSpeaking)
    .map(_ => nullAction);
const stopListeningEpic = (action$) => action$.ofType('Listening_Stop', 'Card_Action_Clicked')
    .do(SpeechModule_1.Speech.SpeechRecognizer.stopRecognizing)
    .map(_ => nullAction);
const startListeningEpic = (action$, store) => action$.ofType('Listening_Starting')
    .do((action) => {
    var locale = store.getState().format.locale;
    var onIntermediateResult = (srText) => { store.dispatch({ type: 'Update_Input', input: srText, source: "speech" }); };
    var onFinalResult = (srText) => {
        srText = srText.replace(/^[.\s]+|[.\s]+$/g, "");
        onIntermediateResult(srText);
        store.dispatch({ type: 'Listening_Stop' });
        store.dispatch(exports.sendMessage(srText, store.getState().connection.user, locale));
    };
    var onAudioStreamStart = () => { store.dispatch({ type: 'Listening_Start' }); };
    var onRecognitionFailed = () => { store.dispatch({ type: 'Listening_Stop' }); };
    SpeechModule_1.Speech.SpeechRecognizer.startRecognizing(locale, onIntermediateResult, onFinalResult, onAudioStreamStart, onRecognitionFailed);
})
    .map(_ => nullAction);
const listeningSilenceTimeoutEpic = (action$, store) => {
    const cancelMessages$ = action$.ofType('Update_Input', 'Listening_Stop');
    return action$.ofType('Listening_Start')
        .mergeMap((action) => Observable_1.Observable.of(({ type: 'Listening_Stop' }))
        .delay(5000)
        .takeUntil(cancelMessages$));
};
const retrySendMessageEpic = (action$) => action$.ofType('Send_Message_Retry')
    .map(action => ({ type: 'Send_Message_Try', clientActivityId: action.clientActivityId }));
const updateSelectedActivityEpic = (action$, store) => action$.ofType('Send_Message_Succeed', 'Send_Message_Fail', 'Show_Typing', 'Clear_Typing')
    .map(action => {
    const state = store.getState();
    if (state.connection.selectedActivity)
        state.connection.selectedActivity.next({ activity: state.history.selectedActivity });
    return nullAction;
});
const showTypingEpic = (action$) => action$.ofType('Show_Typing')
    .delay(3000)
    .map(action => ({ type: 'Clear_Typing', id: action.activity.id }));
const sendTypingEpic = (action$, store) => action$.ofType('Update_Input')
    .map(_ => store.getState())
    .filter(state => state.shell.sendTyping)
    .throttleTime(3000)
    .do(_ => konsole.log("sending typing"))
    .flatMap(state => state.connection.botConnection.postActivity({
    type: 'typing',
    from: state.connection.user
})
    .map(_ => nullAction)
    .catch(error => Observable_1.Observable.of(nullAction)));
// Now we put it all together into a store with middleware
const redux_2 = __webpack_require__(/*! redux */ "../../../node_modules/redux/es/index.js");
const redux_observable_1 = __webpack_require__(/*! redux-observable */ "../../../node_modules/redux-observable/lib/index.js");
exports.createStore = () => redux_2.createStore(redux_2.combineReducers({
    adaptiveCards: exports.adaptiveCards,
    connection: exports.connection,
    format: exports.format,
    history: exports.history,
    shell: exports.shell,
    size: exports.size
}), redux_1.applyMiddleware(redux_observable_1.createEpicMiddleware(redux_observable_1.combineEpics(updateSelectedActivityEpic, sendMessageEpic, trySendMessageEpic, retrySendMessageEpic, showTypingEpic, sendTypingEpic, speakSSMLEpic, speakOnMessageReceivedEpic, startListeningEpic, stopListeningEpic, stopSpeakingEpic, listeningSilenceTimeoutEpic))));
//# sourceMappingURL=Store.js.map

/***/ }),

/***/ "../../custom-botframework-webchat/built/Strings.js":
/*!*******************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/packages/custom-botframework-webchat/built/Strings.js ***!
  \*******************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const localizedStrings = {
    'en-us': {
        title: "Chat",
        send: "Send",
        unknownFile: "[File of type '%1']",
        unknownCard: "[Unknown Card '%1']",
        receiptVat: "VAT",
        receiptTax: "Tax",
        receiptTotal: "Total",
        messageRetry: "retry",
        messageFailed: "couldn't send",
        messageSending: "sending",
        timeSent: " at %1",
        consolePlaceholder: "Type your message...",
        listeningIndicator: "Listening...",
        uploadFile: "Upload file",
        speak: "Speak"
    },
    'ja-jp': {
        title: "チャット",
        send: "送信",
        unknownFile: "[ファイルタイプ '%1']",
        unknownCard: "[不明なカード '%1']",
        receiptVat: "消費税",
        receiptTax: "税",
        receiptTotal: "合計",
        messageRetry: "再送",
        messageFailed: "送信できませんでした。",
        messageSending: "送信中",
        timeSent: " %1",
        consolePlaceholder: "メッセージを入力してください...",
        listeningIndicator: "聴いてます...",
        uploadFile: "",
        speak: ""
    },
    'nb-no': {
        title: "Chat",
        send: "Send",
        unknownFile: "[Fil av typen '%1']",
        unknownCard: "[Ukjent Kort '%1']",
        receiptVat: "MVA",
        receiptTax: "Skatt",
        receiptTotal: "Totalt",
        messageRetry: "prøv igjen",
        messageFailed: "kunne ikke sende",
        messageSending: "sender",
        timeSent: " %1",
        consolePlaceholder: "Skriv inn melding...",
        listeningIndicator: "Lytter...",
        uploadFile: "",
        speak: ""
    },
    'da-dk': {
        title: "Chat",
        send: "Send",
        unknownFile: "[Fil af typen '%1']",
        unknownCard: "[Ukendt kort '%1']",
        receiptVat: "Moms",
        receiptTax: "Skat",
        receiptTotal: "Total",
        messageRetry: "prøv igen",
        messageFailed: "ikke sendt",
        messageSending: "sender",
        timeSent: " kl %1",
        consolePlaceholder: "Skriv din besked...",
        listeningIndicator: "Lytter...",
        uploadFile: "",
        speak: ""
    },
    'de-de': {
        title: "Chat",
        send: "Senden",
        unknownFile: "[Datei vom Typ '%1']",
        unknownCard: "[Unbekannte Card '%1']",
        receiptVat: "VAT",
        receiptTax: "MwSt.",
        receiptTotal: "Gesamtbetrag",
        messageRetry: "wiederholen",
        messageFailed: "konnte nicht senden",
        messageSending: "sendet",
        timeSent: " am %1",
        consolePlaceholder: "Verfasse eine Nachricht...",
        listeningIndicator: "Hören...",
        uploadFile: "",
        speak: ""
    },
    'pl-pl': {
        title: "Chat",
        send: "Wyślij",
        unknownFile: "[Plik typu '%1']",
        unknownCard: "[Nieznana karta '%1']",
        receiptVat: "VAT",
        receiptTax: "Podatek",
        receiptTotal: "Razem",
        messageRetry: "wyślij ponownie",
        messageFailed: "wysłanie nieudane",
        messageSending: "wysyłanie",
        timeSent: " o %1",
        consolePlaceholder: "Wpisz swoją wiadomość...",
        listeningIndicator: "Słuchający...",
        uploadFile: "",
        speak: ""
    },
    'ru-ru': {
        title: "Чат",
        send: "Отправить",
        unknownFile: "[Неизвестный тип '%1']",
        unknownCard: "[Неизвестная карта '%1']",
        receiptVat: "VAT",
        receiptTax: "Налог",
        receiptTotal: "Итого",
        messageRetry: "повторить",
        messageFailed: "не удалось отправить",
        messageSending: "отправка",
        timeSent: " в %1",
        consolePlaceholder: "Введите ваше сообщение...",
        listeningIndicator: "прослушивание...",
        uploadFile: "",
        speak: ""
    },
    'nl-nl': {
        title: "Chat",
        send: "Verstuur",
        unknownFile: "[Bestand van het type '%1']",
        unknownCard: "[Onbekende kaart '%1']",
        receiptVat: "VAT",
        receiptTax: "BTW",
        receiptTotal: "Totaal",
        messageRetry: "opnieuw",
        messageFailed: "versturen mislukt",
        messageSending: "versturen",
        timeSent: " om %1",
        consolePlaceholder: "Typ je bericht...",
        listeningIndicator: "het luisteren...",
        uploadFile: "",
        speak: ""
    },
    'lv-lv': {
        title: "Tērzēšana",
        send: "Sūtīt",
        unknownFile: "[Nezināms tips '%1']",
        unknownCard: "[Nezināma kartīte '%1']",
        receiptVat: "VAT",
        receiptTax: "Nodoklis",
        receiptTotal: "Kopsumma",
        messageRetry: "Mēģināt vēlreiz",
        messageFailed: "Neizdevās nosūtīt",
        messageSending: "Nosūtīšana",
        timeSent: " %1",
        consolePlaceholder: "Ierakstiet savu ziņu...",
        listeningIndicator: "Klausoties...",
        uploadFile: "",
        speak: ""
    },
    'pt-br': {
        title: "Bate-papo",
        send: "Enviar",
        unknownFile: "[Arquivo do tipo '%1']",
        unknownCard: "[Cartão desconhecido '%1']",
        receiptVat: "VAT",
        receiptTax: "Imposto",
        receiptTotal: "Total",
        messageRetry: "repetir",
        messageFailed: "não pude enviar",
        messageSending: "enviando",
        timeSent: " às %1",
        consolePlaceholder: "Digite sua mensagem...",
        listeningIndicator: "Ouvindo...",
        uploadFile: "",
        speak: ""
    },
    'fr-fr': {
        title: "Chat",
        send: "Envoyer",
        unknownFile: "[Fichier de type '%1']",
        unknownCard: "[Carte inconnue '%1']",
        receiptVat: "TVA",
        receiptTax: "Taxe",
        receiptTotal: "Total",
        messageRetry: "reéssayer",
        messageFailed: "envoi impossible",
        messageSending: "envoi",
        timeSent: " à %1",
        consolePlaceholder: "Écrivez votre message...",
        listeningIndicator: "Écoute...",
        uploadFile: "",
        speak: ""
    },
    'es-es': {
        title: "Chat",
        send: "Enviar",
        unknownFile: "[Archivo de tipo '%1']",
        unknownCard: "[Tarjeta desconocida '%1']",
        receiptVat: "IVA",
        receiptTax: "Impuestos",
        receiptTotal: "Total",
        messageRetry: "reintentar",
        messageFailed: "no enviado",
        messageSending: "enviando",
        timeSent: " a las %1",
        consolePlaceholder: "Escribe tu mensaje...",
        listeningIndicator: "Escuchando...",
        uploadFile: "",
        speak: ""
    },
    'el-gr': {
        title: "Συνομιλία",
        send: "Αποστολή",
        unknownFile: "[Αρχείο τύπου '%1']",
        unknownCard: "[Αγνωστη Κάρτα '%1']",
        receiptVat: "VAT",
        receiptTax: "ΦΠΑ",
        receiptTotal: "Σύνολο",
        messageRetry: "δοκιμή",
        messageFailed: "αποτυχία",
        messageSending: "αποστολή",
        timeSent: " την %1",
        consolePlaceholder: "Πληκτρολόγηση μηνύματος...",
        listeningIndicator: "Ακούγοντας...",
        uploadFile: "",
        speak: ""
    },
    'it-it': {
        title: "Chat",
        send: "Invia",
        unknownFile: "[File di tipo '%1']",
        unknownCard: "[Card sconosciuta '%1']",
        receiptVat: "VAT",
        receiptTax: "Tasse",
        receiptTotal: "Totale",
        messageRetry: "riprova",
        messageFailed: "impossibile inviare",
        messageSending: "invio",
        timeSent: " %1",
        consolePlaceholder: "Scrivi il tuo messaggio...",
        listeningIndicator: "Ascoltando...",
        uploadFile: "",
        speak: ""
    },
    'zh-hans': {
        title: "聊天",
        send: "发送",
        unknownFile: "[类型为'%1'的文件]",
        unknownCard: "[未知的'%1'卡片]",
        receiptVat: "VAT",
        receiptTax: "税",
        receiptTotal: "共计",
        messageRetry: "重试",
        messageFailed: "无法发送",
        messageSending: "正在发送",
        timeSent: " 用时 %1",
        consolePlaceholder: "输入你的消息...",
        listeningIndicator: "正在倾听...",
        uploadFile: "",
        speak: ""
    },
    'zh-hant': {
        title: "聊天",
        send: "發送",
        unknownFile: "[類型為'%1'的文件]",
        unknownCard: "[未知的'%1'卡片]",
        receiptVat: "消費稅",
        receiptTax: "税",
        receiptTotal: "總共",
        messageRetry: "重試",
        messageFailed: "無法發送",
        messageSending: "正在發送",
        timeSent: " 於 %1",
        consolePlaceholder: "輸入你的訊息...",
        listeningIndicator: "正在聆聽...",
        uploadFile: "上載檔案",
        speak: "發言"
    },
    'zh-yue': {
        title: "傾偈",
        send: "傳送",
        unknownFile: "[類型係'%1'嘅文件]",
        unknownCard: "[唔知'%1'係咩卡片]",
        receiptVat: "消費稅",
        receiptTax: "税",
        receiptTotal: "總共",
        messageRetry: "再嚟一次",
        messageFailed: "傳送唔倒",
        messageSending: "而家傳送緊",
        timeSent: " 喺 %1",
        consolePlaceholder: "輸入你嘅訊息...",
        listeningIndicator: "聽緊你講嘢...",
        uploadFile: "上載檔案",
        speak: "講嘢"
    },
    'cs-cz': {
        title: "Chat",
        send: "Odeslat",
        unknownFile: "[Soubor typu '%1']",
        unknownCard: "[Neznámá karta '%1']",
        receiptVat: "DPH",
        receiptTax: "Daň z prod.",
        receiptTotal: "Celkem",
        messageRetry: "opakovat",
        messageFailed: "nepodařilo se odeslat",
        messageSending: "Odesílání",
        timeSent: " v %1",
        consolePlaceholder: "Napište svou zprávu...",
        listeningIndicator: "Poslouchám...",
        uploadFile: "Nahrát soubor",
        speak: "Použít hlas"
    },
    'ko-kr': {
        title: "채팅",
        send: "전송",
        unknownFile: "[파일 형식 '%1']",
        unknownCard: "[알수없는 타입의 카드 '%1']",
        receiptVat: "부가세",
        receiptTax: "세액",
        receiptTotal: "합계",
        messageRetry: "재전송",
        messageFailed: "전송할 수 없습니다",
        messageSending: "전송중",
        timeSent: " %1",
        consolePlaceholder: "메세지를 입력하세요...",
        listeningIndicator: "수신중...",
        uploadFile: "",
        speak: ""
    },
    'hu-hu': {
        title: "Csevegés",
        send: "Küldés",
        unknownFile: "[Fájltípus '%1']",
        unknownCard: "[Ismeretlen kártya '%1']",
        receiptVat: "ÁFA",
        receiptTax: "Adó",
        receiptTotal: "Összesen",
        messageRetry: "próbálja újra",
        messageFailed: "nem sikerült elküldeni",
        messageSending: "küldés",
        timeSent: "%2 ekkor: %1",
        consolePlaceholder: "Írja be üzenetét...",
        listeningIndicator: "Figyelés...",
        uploadFile: "",
        speak: ""
    },
    'sv-se': {
        title: "Chatt",
        send: "Skicka",
        unknownFile: "[Filtyp '%1']",
        unknownCard: "[Okänt kort '%1']",
        receiptVat: "Moms",
        receiptTax: "Skatt",
        receiptTotal: "Totalt",
        messageRetry: "försök igen",
        messageFailed: "kunde inte skicka",
        messageSending: "skickar",
        timeSent: "%2 %1",
        consolePlaceholder: "Skriv ett meddelande...",
        listeningIndicator: "Lyssnar...",
        uploadFile: "",
        speak: ""
    },
    'tr-tr': {
        title: "Sohbet",
        send: "Gönder",
        unknownFile: "[Dosya türü: '%1']",
        unknownCard: "[Bilinmeyen Kart: '%1']",
        receiptVat: "KDV",
        receiptTax: "Vergi",
        receiptTotal: "Toplam",
        messageRetry: "yeniden deneyin",
        messageFailed: "gönderilemedi",
        messageSending: "gönderiliyor",
        timeSent: "%2, %1",
        consolePlaceholder: "İletinizi yazın...",
        listeningIndicator: "Dinliyor...",
        uploadFile: "",
        speak: ""
    },
    'pt-pt': {
        title: "Chat",
        send: "Enviar",
        unknownFile: "[Ficheiro do tipo \"%1\"]",
        unknownCard: "[Cartão Desconhecido \"%1\"]",
        receiptVat: "IVA",
        receiptTax: "Imposto",
        receiptTotal: "Total",
        messageRetry: "repetir",
        messageFailed: "não foi possível enviar",
        messageSending: "a enviar",
        timeSent: "%2 em %1",
        consolePlaceholder: "Escreva a sua mensagem...",
        listeningIndicator: "A Escutar...",
        uploadFile: "",
        speak: ""
    }
};
exports.defaultStrings = localizedStrings['en-us'];
// Returns strings using the "best match available"" locale
// e.g. if 'en-us' is the only supported English locale, then
// strings('en') should return localizedStrings('en-us')
function mapLocale(locale) {
    locale = locale && locale.toLowerCase();
    if (locale in localizedStrings) {
        return locale;
    }
    else if (locale.startsWith('cs')) {
        return 'cs-cz';
    }
    else if (locale.startsWith('da')) {
        return 'da-dk';
    }
    else if (locale.startsWith('de')) {
        return 'de-de';
    }
    else if (locale.startsWith('el')) {
        return 'el-gr';
    }
    else if (locale.startsWith('es')) {
        return 'es-es';
    }
    else if (locale.startsWith('fr')) {
        return 'fr-fr';
    }
    else if (locale.startsWith('hu')) {
        return 'hu-hu';
    }
    else if (locale.startsWith('it')) {
        return 'it-it';
    }
    else if (locale.startsWith('ja')) {
        return 'ja-jp';
    }
    else if (locale.startsWith('ko')) {
        return 'ko-kr';
    }
    else if (locale.startsWith('lv')) {
        return 'lv-lv';
    }
    else if (locale.startsWith('nb') || locale.startsWith('nn') || locale.startsWith('no')) {
        return 'nb-no';
    }
    else if (locale.startsWith('nl')) {
        return 'nl-nl';
    }
    else if (locale.startsWith('pl')) {
        return 'pl-pl';
    }
    else if (locale.startsWith('pt')) {
        if (locale === 'pt-br') {
            return 'pt-br';
        }
        else {
            return 'pt-pt';
        }
    }
    else if (locale.startsWith('ru')) {
        return 'ru-ru';
    }
    else if (locale.startsWith('sv')) {
        return 'sv-se';
    }
    else if (locale.startsWith('tr')) {
        return 'tr-tr';
    }
    else if (locale.startsWith('zh')) {
        if (locale === 'zh-hk' || locale === 'zh-mo' || locale === 'zh-tw') {
            return 'zh-hant';
        }
        else {
            return 'zh-hans';
        }
    }
    return 'en-us';
}
exports.strings = (locale) => localizedStrings[mapLocale(locale)];
//# sourceMappingURL=Strings.js.map

/***/ }),

/***/ "../../custom-botframework-webchat/built/SuggestedActions.js":
/*!****************************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/packages/custom-botframework-webchat/built/SuggestedActions.js ***!
  \****************************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const React = __webpack_require__(/*! react */ "../../../node_modules/react/index.js");
const react_redux_1 = __webpack_require__(/*! react-redux */ "../../../node_modules/react-redux/es/index.js");
const Chat_1 = __webpack_require__(/*! ./Chat */ "../../custom-botframework-webchat/built/Chat.js");
const HScroll_1 = __webpack_require__(/*! ./HScroll */ "../../custom-botframework-webchat/built/HScroll.js");
const Store_1 = __webpack_require__(/*! ./Store */ "../../custom-botframework-webchat/built/Store.js");
class SuggestedActionsContainer extends React.Component {
    constructor(props) {
        super(props);
    }
    actionClick(e, cardAction) {
        if (!this.props.activityWithSuggestedActions)
            return;
        this.props.takeSuggestedAction(this.props.activityWithSuggestedActions);
        this.props.doCardAction(cardAction.type, cardAction.value);
        e.stopPropagation();
    }
    shouldComponentUpdate(nextProps) {
        return !nextProps.activityWithSuggestedActions != !this.props.activityWithSuggestedActions;
    }
    render() {
        if (!this.props.activityWithSuggestedActions)
            return null;
        return (React.createElement("div", { className: "wc-suggested-actions" },
            React.createElement(HScroll_1.HScroll, { prevSvgPathData: "M 16.5 22 L 19 19.5 L 13.5 14 L 19 8.5 L 16.5 6 L 8.5 14 L 16.5 22 Z", nextSvgPathData: "M 12.5 22 L 10 19.5 L 15.5 14 L 10 8.5 L 12.5 6 L 20.5 14 L 12.5 22 Z", scrollUnit: "page" },
                React.createElement("ul", null, this.props.activityWithSuggestedActions.suggestedActions.actions.map((action, index) => React.createElement("li", { key: index },
                    React.createElement("button", { type: "button", onClick: e => this.actionClick(e, action), title: action.title }, action.title)))))));
    }
}
function activityWithSuggestedActions(activities) {
    if (!activities || activities.length === 0)
        return;
    const lastActivity = activities[activities.length - 1];
    if (lastActivity.type === 'message'
        && lastActivity.suggestedActions
        && lastActivity.suggestedActions.actions.length > 0)
        return lastActivity;
}
exports.SuggestedActions = react_redux_1.connect((state) => ({
    // passed down to MessagePaneView
    activityWithSuggestedActions: activityWithSuggestedActions(state.history.activities),
    // only used to create helper functions below
    botConnection: state.connection.botConnection,
    user: state.connection.user,
    locale: state.format.locale
}), {
    takeSuggestedAction: (message) => ({ type: 'Take_SuggestedAction', message }),
    // only used to create helper functions below
    sendMessage: Store_1.sendMessage
}, (stateProps, dispatchProps, ownProps) => ({
    // from stateProps
    activityWithSuggestedActions: stateProps.activityWithSuggestedActions,
    // from dispatchProps
    takeSuggestedAction: dispatchProps.takeSuggestedAction,
    // helper functions
    doCardAction: Chat_1.doCardAction(stateProps.botConnection, stateProps.user, stateProps.locale, dispatchProps.sendMessage),
}))(SuggestedActionsContainer);
//# sourceMappingURL=SuggestedActions.js.map

/***/ }),

/***/ "../../custom-botframework-webchat/built/getTabIndex.js":
/*!***********************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/packages/custom-botframework-webchat/built/getTabIndex.js ***!
  \***********************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const IE_FOCUSABLE_LIST = ['a', 'body', 'button', 'frame', 'iframe', 'img', 'input', 'isindex', 'object', 'select', 'textarea'];
const IS_FIREFOX = /Firefox\//i.test(navigator.userAgent);
const IS_IE = /Trident\//i.test(navigator.userAgent);
function getTabIndex(element) {
    const { tabIndex } = element;
    if (IS_IE) {
        const tabIndexAttribute = element.attributes.getNamedItem('tabindex');
        if (!tabIndexAttribute || !tabIndexAttribute.specified) {
            return ~IE_FOCUSABLE_LIST.indexOf(element.nodeName.toLowerCase()) ? 0 : null;
        }
    }
    else if (!~tabIndex) {
        const attr = element.getAttribute('tabindex');
        if (attr === null || (attr === '' && !IS_FIREFOX)) {
            return null;
        }
    }
    return tabIndex;
}
exports.getTabIndex = getTabIndex;
;
//# sourceMappingURL=getTabIndex.js.map

/***/ }),

/***/ "../../sdk/client/built/index.js":
/*!************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/packages/sdk/client/built/index.js ***!
  \************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "../../sdk/shared/built/command/index.js":
/*!********************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/packages/sdk/shared/built/command/index.js ***!
  \********************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = __webpack_require__(/*! tslib */ "../../../node_modules/tslib/tslib.es6.js");
tslib_1.__exportStar(__webpack_require__(/*! ./registry */ "../../sdk/shared/built/command/registry.js"), exports);
tslib_1.__exportStar(__webpack_require__(/*! ./service */ "../../sdk/shared/built/command/service.js"), exports);
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "../../sdk/shared/built/command/registry.js":
/*!***********************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/packages/sdk/shared/built/command/registry.js ***!
  \***********************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class CommandRegistry {
    constructor() {
        this._commands = {};
    }
    registerCommand(idOrCommand, handler) {
        if (!idOrCommand) {
            throw new Error("invalid command");
        }
        if (typeof idOrCommand === 'string') {
            if (!handler) {
                throw new Error("invalid command");
            }
            return this.registerCommand({ id: idOrCommand, handler });
        }
        const { id } = idOrCommand;
        this._commands[id] = idOrCommand;
        return {
            dispose: () => delete this._commands[id]
        };
    }
    getCommand(id) {
        return this._commands[id];
    }
    getCommands() {
        return this._commands;
    }
}
exports.CommandRegistry = CommandRegistry;
//# sourceMappingURL=registry.js.map

/***/ }),

/***/ "../../sdk/shared/built/command/service.js":
/*!**********************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/packages/sdk/shared/built/command/service.js ***!
  \**********************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const disposable_1 = __webpack_require__(/*! ../lifecycle/disposable */ "../../sdk/shared/built/lifecycle/disposable.js");
const channel_1 = __webpack_require__(/*! ../ipc/channel */ "../../sdk/shared/built/ipc/channel.js");
const utils_1 = __webpack_require__(/*! ../utils */ "../../sdk/shared/built/utils/index.js");
const __1 = __webpack_require__(/*! .. */ "../../sdk/shared/built/index.js");
class CommandService extends disposable_1.Disposable {
    constructor(_ipc, _channelName = 'command-service', _registry = null) {
        super();
        this._ipc = _ipc;
        this._channelName = _channelName;
        this._registry = _registry;
        this._registry = this._registry || new __1.CommandRegistry();
        this._channel = new channel_1.Channel(this._channelName, this._ipc);
        super.toDispose(this._ipc.registerChannel(this._channel));
        super.toDispose(this._channel.setListener('call', (commandName, transactionId, ...args) => {
            this.call(commandName, ...args)
                .then(result => {
                result = Array.isArray(result) ? result : [result];
                this._channel.send(transactionId, true, ...result);
            })
                .catch(err => {
                err = err.message ? err.message : err;
                this._channel.send(transactionId, false, err);
            });
        }));
    }
    get registry() { return this._registry; }
    on(event, handler) {
        if (event === 'command-not-found') {
            this._notFoundHandler = handler;
            return undefined;
        }
        else {
            return this.registry.registerCommand(event, handler);
        }
    }
    call(commandName, ...args) {
        const command = this._registry.getCommand(commandName);
        try {
            if (!command) {
                if (this._notFoundHandler) {
                    const result = this._notFoundHandler(commandName, ...args);
                    return Promise.resolve(result);
                }
                else {
                    throw new Error(`Command '${commandName}' not found`);
                }
            }
            else {
                const result = command.handler(...args);
                return Promise.resolve(result);
            }
        }
        catch (err) {
            return Promise.reject(err);
        }
    }
    remoteCall(commandName, ...args) {
        const transactionId = utils_1.uniqueId();
        this._channel.send('call', commandName, transactionId, ...args);
        return new Promise((resolve, reject) => {
            this._channel.setListener(transactionId, (success, ...responseArgs) => {
                this._channel.clearListener(transactionId);
                if (success) {
                    let result = responseArgs.length ? responseArgs.shift() : undefined;
                    resolve(result);
                }
                else {
                    reject(responseArgs.shift());
                }
            });
        });
    }
}
exports.CommandService = CommandService;
//# sourceMappingURL=service.js.map

/***/ }),

/***/ "../../sdk/shared/built/index.js":
/*!************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/packages/sdk/shared/built/index.js ***!
  \************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = __webpack_require__(/*! tslib */ "../../../node_modules/tslib/tslib.es6.js");
tslib_1.__exportStar(__webpack_require__(/*! ./command */ "../../sdk/shared/built/command/index.js"), exports);
tslib_1.__exportStar(__webpack_require__(/*! ./lifecycle */ "../../sdk/shared/built/lifecycle/index.js"), exports);
tslib_1.__exportStar(__webpack_require__(/*! ./ipc */ "../../sdk/shared/built/ipc/index.js"), exports);
tslib_1.__exportStar(__webpack_require__(/*! ./types */ "../../sdk/shared/built/types/index.js"), exports);
tslib_1.__exportStar(__webpack_require__(/*! ./utils */ "../../sdk/shared/built/utils/index.js"), exports);
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "../../sdk/shared/built/ipc/channel.js":
/*!******************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/packages/sdk/shared/built/ipc/channel.js ***!
  \******************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class Channel {
    constructor(_name, _sender) {
        this._name = _name;
        this._sender = _sender;
        this._listeners = {};
    }
    get name() { return this._name; }
    send(messageName, ...args) {
        return this._sender.send(this._name, messageName, ...args);
    }
    setListener(messageName, listener) {
        this.clearListener(messageName);
        this._listeners[messageName] = listener;
        return {
            dispose: () => {
                this.clearListener(messageName);
            }
        };
    }
    clearListener(messageName) {
        delete this._listeners[messageName];
    }
    onMessage(...args) {
        const messageName = args.shift();
        const listener = this._listeners[messageName];
        if (listener) {
            listener(...args);
        }
    }
}
exports.Channel = Channel;
//# sourceMappingURL=channel.js.map

/***/ }),

/***/ "../../sdk/shared/built/ipc/index.js":
/*!****************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/packages/sdk/shared/built/ipc/index.js ***!
  \****************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = __webpack_require__(/*! tslib */ "../../../node_modules/tslib/tslib.es6.js");
tslib_1.__exportStar(__webpack_require__(/*! ./channel */ "../../sdk/shared/built/ipc/channel.js"), exports);
const lifecycle_1 = __webpack_require__(/*! ../lifecycle */ "../../sdk/shared/built/lifecycle/index.js");
class IPC extends lifecycle_1.Disposable {
    constructor() {
        super(...arguments);
        this._channels = {};
    }
    registerChannel(channel) {
        if (!channel)
            throw new Error("channel cannot be null");
        if (this._channels[channel.name])
            throw new Error(`channel ${channel.name} already exists`);
        this._channels[channel.name] = channel;
        return {
            dispose: () => {
                delete this._channels[channel.name];
            }
        };
    }
    getChannel(name) {
        return this._channels[name];
    }
}
exports.IPC = IPC;
class NoopIPC extends IPC {
    constructor(_id) {
        super();
        this._id = _id;
    }
    get id() { return this._id; }
    send(...args) { }
}
exports.NoopIPC = NoopIPC;
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "../../sdk/shared/built/lifecycle/disposable.js":
/*!***************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/packages/sdk/shared/built/lifecycle/disposable.js ***!
  \***************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function isDisposable(obj) {
    return obj && typeof obj.dispose === 'function';
}
exports.isDisposable = isDisposable;
function dispose(arg) {
    if (Array.isArray(arg)) {
        arg.forEach(elem => elem && elem.dispose());
        return [];
    }
    else {
        arg && arg.dispose();
        return undefined;
    }
}
exports.dispose = dispose;
class Disposable {
    constructor() {
        this._toDispose = [];
    }
    dispose() {
        this._toDispose = dispose(this._toDispose);
    }
    toDispose(...objs) {
        this._toDispose.push(...objs);
    }
}
exports.Disposable = Disposable;
//# sourceMappingURL=disposable.js.map

/***/ }),

/***/ "../../sdk/shared/built/lifecycle/index.js":
/*!**********************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/packages/sdk/shared/built/lifecycle/index.js ***!
  \**********************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = __webpack_require__(/*! tslib */ "../../../node_modules/tslib/tslib.es6.js");
tslib_1.__exportStar(__webpack_require__(/*! ./disposable */ "../../sdk/shared/built/lifecycle/disposable.js"), exports);
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "../../sdk/shared/built/types/attachmentTypes.js":
/*!****************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/packages/sdk/shared/built/types/attachmentTypes.js ***!
  \****************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class AttachmentContentTypes {
}
AttachmentContentTypes.animationCard = 'application/vnd.microsoft.card.animation';
AttachmentContentTypes.audioCard = 'application/vnd.microsoft.card.audio';
AttachmentContentTypes.heroCard = 'application/vnd.microsoft.card.hero';
AttachmentContentTypes.receiptCard = 'application/vnd.microsoft.card.receipt';
AttachmentContentTypes.signInCard = 'application/vnd.microsoft.card.signin';
AttachmentContentTypes.thumbnailCard = 'application/vnd.microsoft.card.thumbnail';
AttachmentContentTypes.videoCard = 'application/vnd.microsoft.card.video';
exports.AttachmentContentTypes = AttachmentContentTypes;
//# sourceMappingURL=attachmentTypes.js.map

/***/ }),

/***/ "../../sdk/shared/built/types/botConfigWithPathTypes.js":
/*!***********************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/packages/sdk/shared/built/types/botConfigWithPathTypes.js ***!
  \***********************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = __webpack_require__(/*! msbot/bin/models */ "../../../node_modules/msbot/bin/models/index.js");
class BotConfigWithPath extends models_1.BotConfigModel {
    constructor() {
        super(...arguments);
        this.path = '';
    }
    static fromJSON(source) {
        const botConfig = super.fromJSON(source);
        const { path = '' } = source;
        const botConfigWithPath = new BotConfigWithPath();
        Object.assign(botConfigWithPath, botConfig, { path });
        return botConfigWithPath;
    }
}
exports.BotConfigWithPath = BotConfigWithPath;
//# sourceMappingURL=botConfigWithPathTypes.js.map

/***/ }),

/***/ "../../sdk/shared/built/types/index.js":
/*!******************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/packages/sdk/shared/built/types/index.js ***!
  \******************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = __webpack_require__(/*! tslib */ "../../../node_modules/tslib/tslib.es6.js");
tslib_1.__exportStar(__webpack_require__(/*! ./attachmentTypes */ "../../sdk/shared/built/types/attachmentTypes.js"), exports);
tslib_1.__exportStar(__webpack_require__(/*! ./paymentTypes */ "../../sdk/shared/built/types/paymentTypes.js"), exports);
tslib_1.__exportStar(__webpack_require__(/*! ./botConfigWithPathTypes */ "../../sdk/shared/built/types/botConfigWithPathTypes.js"), exports);
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "../../sdk/shared/built/types/paymentTypes.js":
/*!*************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/packages/sdk/shared/built/types/paymentTypes.js ***!
  \*************************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Payment;
(function (Payment) {
    Payment.PaymentOperations = {
        PaymentCompleteOperationName: 'payments/complete',
        UpdateShippingAddressOperationName: 'payments/update/shippingAddress',
        UpdateShippingOptionOperationName: 'payments/update/shippingOption'
    };
})(Payment = exports.Payment || (exports.Payment = {}));
//# sourceMappingURL=paymentTypes.js.map

/***/ }),

/***/ "../../sdk/shared/built/utils/index.js":
/*!******************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/packages/sdk/shared/built/utils/index.js ***!
  \******************************************************************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const uuidv1 = __webpack_require__(/*! uuid/v1 */ "../../../node_modules/uuid/v1.js");
function uniqueId() {
    return uuidv1().toString();
}
exports.uniqueId = uniqueId;
function isObject(item) {
    return (item && typeof item === 'object' && !Array.isArray(item));
}
exports.isObject = isObject;
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "../../sdk/ui-react/built/index.js":
/*!**************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/packages/sdk/ui-react/built/index.js ***!
  \**************************************************************************************************/
/*! exports provided: Splitter, ColumnAlignment, ColumnJustification, Column, ExpandCollapse, ExpandCollapseControls, ExpandCollapseContent, RowJustification, RowAlignment, Row, TruncateText, Colors, Decorators, Fonts, Shadows, filterChildren, hmrSafeNameComparison, Checkbox, LargeHeader, MediumHeader, NumberInputField, PrimaryButton, SmallHeader, TextInputField, InsetShadow, Modal, ModalContent, ModalActions */
/*! all exports used */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _layout__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./layout */ "../../sdk/ui-react/built/layout/index.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "ColumnAlignment", function() { return _layout__WEBPACK_IMPORTED_MODULE_0__["ColumnAlignment"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "ColumnJustification", function() { return _layout__WEBPACK_IMPORTED_MODULE_0__["ColumnJustification"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Column", function() { return _layout__WEBPACK_IMPORTED_MODULE_0__["Column"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "ExpandCollapse", function() { return _layout__WEBPACK_IMPORTED_MODULE_0__["ExpandCollapse"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "ExpandCollapseControls", function() { return _layout__WEBPACK_IMPORTED_MODULE_0__["ExpandCollapseControls"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "ExpandCollapseContent", function() { return _layout__WEBPACK_IMPORTED_MODULE_0__["ExpandCollapseContent"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "RowJustification", function() { return _layout__WEBPACK_IMPORTED_MODULE_0__["RowJustification"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "RowAlignment", function() { return _layout__WEBPACK_IMPORTED_MODULE_0__["RowAlignment"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Row", function() { return _layout__WEBPACK_IMPORTED_MODULE_0__["Row"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "TruncateText", function() { return _layout__WEBPACK_IMPORTED_MODULE_0__["TruncateText"]; });

/* harmony import */ var _splitter__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./splitter */ "../../sdk/ui-react/built/splitter/index.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Splitter", function() { return _splitter__WEBPACK_IMPORTED_MODULE_1__["Splitter"]; });

/* harmony import */ var _styles__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./styles */ "../../sdk/ui-react/built/styles/index.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Colors", function() { return _styles__WEBPACK_IMPORTED_MODULE_2__["Colors"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Decorators", function() { return _styles__WEBPACK_IMPORTED_MODULE_2__["Decorators"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Fonts", function() { return _styles__WEBPACK_IMPORTED_MODULE_2__["Fonts"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Shadows", function() { return _styles__WEBPACK_IMPORTED_MODULE_2__["Shadows"]; });

/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./utils */ "../../sdk/ui-react/built/utils/index.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "filterChildren", function() { return _utils__WEBPACK_IMPORTED_MODULE_3__["filterChildren"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "hmrSafeNameComparison", function() { return _utils__WEBPACK_IMPORTED_MODULE_3__["hmrSafeNameComparison"]; });

/* harmony import */ var _widget__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./widget */ "../../sdk/ui-react/built/widget/index.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Checkbox", function() { return _widget__WEBPACK_IMPORTED_MODULE_4__["Checkbox"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "LargeHeader", function() { return _widget__WEBPACK_IMPORTED_MODULE_4__["LargeHeader"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "MediumHeader", function() { return _widget__WEBPACK_IMPORTED_MODULE_4__["MediumHeader"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "NumberInputField", function() { return _widget__WEBPACK_IMPORTED_MODULE_4__["NumberInputField"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "PrimaryButton", function() { return _widget__WEBPACK_IMPORTED_MODULE_4__["PrimaryButton"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "SmallHeader", function() { return _widget__WEBPACK_IMPORTED_MODULE_4__["SmallHeader"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "TextInputField", function() { return _widget__WEBPACK_IMPORTED_MODULE_4__["TextInputField"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "InsetShadow", function() { return _widget__WEBPACK_IMPORTED_MODULE_4__["InsetShadow"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Modal", function() { return _widget__WEBPACK_IMPORTED_MODULE_4__["Modal"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "ModalContent", function() { return _widget__WEBPACK_IMPORTED_MODULE_4__["ModalContent"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "ModalActions", function() { return _widget__WEBPACK_IMPORTED_MODULE_4__["ModalActions"]; });

//
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.
//
// Microsoft Bot Framework: http://botframework.com
//
// Bot Framework Emulator Github:
// https://github.com/Microsoft/BotFramwork-Emulator
//
// Copyright (c) Microsoft Corporation
// All rights reserved.
//
// MIT License:
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//





//# sourceMappingURL=index.js.map

/***/ }),

/***/ "../../sdk/ui-react/built/layout/column.js":
/*!**********************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/packages/sdk/ui-react/built/layout/column.js ***!
  \**********************************************************************************************************/
/*! exports provided: ColumnAlignment, ColumnJustification, Column */
/*! all exports used */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ColumnAlignment", function() { return ColumnAlignment; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ColumnJustification", function() { return ColumnJustification; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Column", function() { return Column; });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "../../../node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var glamor__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! glamor */ "../../../node_modules/glamor/lib/index.js");
/* harmony import */ var glamor__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(glamor__WEBPACK_IMPORTED_MODULE_1__);
//
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.
//
// Microsoft Bot Framework: http://botframework.com
//
// Bot Framework Emulator Github:
// https://github.com/Microsoft/BotFramwork-Emulator
//
// Copyright (c) Microsoft Corporation
// All rights reserved.
//
// MIT License:
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//


var ColumnAlignment;
(function (ColumnAlignment) {
    ColumnAlignment[ColumnAlignment["Left"] = 0] = "Left";
    ColumnAlignment[ColumnAlignment["Center"] = 1] = "Center";
    ColumnAlignment[ColumnAlignment["Right"] = 2] = "Right";
})(ColumnAlignment || (ColumnAlignment = {}));
var ColumnJustification;
(function (ColumnJustification) {
    ColumnJustification[ColumnJustification["Top"] = 0] = "Top";
    ColumnJustification[ColumnJustification["Center"] = 1] = "Center";
    ColumnJustification[ColumnJustification["Bottom"] = 2] = "Bottom";
})(ColumnJustification || (ColumnJustification = {}));
const BASE_CSS = Object(glamor__WEBPACK_IMPORTED_MODULE_1__["css"])({
    boxSizing: 'border-box',
    display: 'flex',
    flexFlow: 'column nowrap',
    maxWidth: '100%',
    width: '100%',
    overflow: 'hidden'
});
class Column extends react__WEBPACK_IMPORTED_MODULE_0__["Component"] {
    constructor(props, context) {
        super(props, context);
    }
    render() {
        const ALIGNMENT_CSS = Object(glamor__WEBPACK_IMPORTED_MODULE_1__["css"])({
            alignItems: getColumnAlignment(this.props.align),
            justifyContent: getColumnJustification(this.props.justify)
        });
        const CSS = Object(glamor__WEBPACK_IMPORTED_MODULE_1__["css"])(BASE_CSS, ALIGNMENT_CSS);
        return (react__WEBPACK_IMPORTED_MODULE_0__["createElement"]("div", Object.assign({ className: 'column-comp ' + (this.props.className || '') }, CSS), this.props.children));
    }
}
/** Converts a column alignment (horizontal axis) type to its flexbox style value */
function getColumnAlignment(a) {
    switch (a) {
        case ColumnAlignment.Center:
            return 'center';
        case ColumnAlignment.Right:
            return 'flex-end';
        case ColumnAlignment.Left:
        default:
            return 'flex-start';
    }
}
/** Converts a column justification (vertical axis) type to its flexbox style value */
function getColumnJustification(j) {
    switch (j) {
        case ColumnJustification.Center:
            return 'center';
        case ColumnJustification.Bottom:
            return 'flex-end';
        case ColumnJustification.Top:
        default:
            return 'flex-start';
    }
}
//# sourceMappingURL=column.js.map

/***/ }),

/***/ "../../sdk/ui-react/built/layout/expandCollapse.js":
/*!******************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/packages/sdk/ui-react/built/layout/expandCollapse.js ***!
  \******************************************************************************************************************/
/*! exports provided: ExpandCollapse, ExpandCollapseControls, ExpandCollapseContent */
/*! all exports used */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ExpandCollapse", function() { return ExpandCollapse; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ExpandCollapseControls", function() { return ExpandCollapseControls; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ExpandCollapseContent", function() { return ExpandCollapseContent; });
/* harmony import */ var glamor__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! glamor */ "../../../node_modules/glamor/lib/index.js");
/* harmony import */ var glamor__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(glamor__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "../../../node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _styles__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../styles */ "../../sdk/ui-react/built/styles/index.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils */ "../../sdk/ui-react/built/utils/index.js");
/* harmony import */ var _widget__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../widget */ "../../sdk/ui-react/built/widget/index.js");
//
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.
//
// Microsoft Bot Framework: http://botframework.com
//
// Bot Framework Emulator Github:
// https://github.com/Microsoft/BotFramwork-Emulator
//
// Copyright (c) Microsoft Corporation
// All rights reserved.
//
// MIT License:
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//





const CSS = Object(glamor__WEBPACK_IMPORTED_MODULE_0__["css"])({
    display: 'flex',
    flexFlow: 'column nowrap',
    height: '100%',
    overflow: 'hidden',
    '& > header': {
        backgroundColor: 'rgba(128, 128, 128, 0.2)',
        cursor: 'pointer',
        display: 'flex',
        fontSize: '11px',
        fontWeight: 700,
        height: '30px',
        lineHeight: '30px',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        flexShrink: 0,
        '& > .content': {
            flex: 1,
            paddingLeft: '8px',
            '& > .toggle': {
                fontSize: '9px',
                paddingRight: '8px',
            }
        },
        '& > .accessories': {
            margin: '0 0 0 auto',
            height: '100%',
            width: 'auto',
            '& > button': {
                backgroundColor: 'transparent',
                color: _styles__WEBPACK_IMPORTED_MODULE_2__["Colors"].SECTION_HEADER_FOREGROUND_DARK,
                border: 0,
                cursor: 'pointer',
            }
        }
    },
    '& > .body': {
        height: '100%',
        overflow: 'auto',
        position: 'relative',
        '& > section': {
            height: '100%',
            display: 'flex',
            flexFlow: 'column nowrap'
        }
    }
});
class ExpandCollapse extends react__WEBPACK_IMPORTED_MODULE_1__["Component"] {
    constructor(props, context) {
        super(props, context);
        this.handleTitleClick = () => {
            this.setState(state => ({ expanded: !state.expanded }));
        };
        this.state = { expanded: !!props.expanded };
    }
    componentWillReceiveProps(newProps) {
        if (typeof newProps.expanded != 'undefined') {
            const { expanded } = newProps;
            this.setState({ expanded });
        }
    }
    render() {
        // TODO: Consider <input type="checkbox"> instead of <div />
        return (react__WEBPACK_IMPORTED_MODULE_1__["createElement"]("div", { "aria-expanded": this.state.expanded, className: CSS + ' expand-collapse-container' },
            react__WEBPACK_IMPORTED_MODULE_1__["createElement"]("header", null,
                react__WEBPACK_IMPORTED_MODULE_1__["createElement"]("div", { className: "content", onClick: this.handleTitleClick },
                    react__WEBPACK_IMPORTED_MODULE_1__["createElement"]("span", { className: "toggle" },
                        " ",
                        this.state.expanded ? '◢' : '▷'),
                    this.props.title),
                react__WEBPACK_IMPORTED_MODULE_1__["createElement"]("div", { className: "accessories" }, Object(_utils__WEBPACK_IMPORTED_MODULE_3__["filterChildren"])(this.props.children, child => Object(_utils__WEBPACK_IMPORTED_MODULE_3__["hmrSafeNameComparison"])(child.type, ExpandCollapseControls)))),
            react__WEBPACK_IMPORTED_MODULE_1__["createElement"]("div", { className: "body" }, this.state.expanded &&
                react__WEBPACK_IMPORTED_MODULE_1__["createElement"]("section", null,
                    Object(_utils__WEBPACK_IMPORTED_MODULE_3__["filterChildren"])(this.props.children, child => Object(_utils__WEBPACK_IMPORTED_MODULE_3__["hmrSafeNameComparison"])(child.type, ExpandCollapseContent)),
                    react__WEBPACK_IMPORTED_MODULE_1__["createElement"](_widget__WEBPACK_IMPORTED_MODULE_4__["InsetShadow"], { top: true })))));
    }
}
const ExpandCollapseControls = props => props.children;
const ExpandCollapseContent = props => props.children;
//# sourceMappingURL=expandCollapse.js.map

/***/ }),

/***/ "../../sdk/ui-react/built/layout/index.js":
/*!*********************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/packages/sdk/ui-react/built/layout/index.js ***!
  \*********************************************************************************************************/
/*! exports provided: ColumnAlignment, ColumnJustification, Column, ExpandCollapse, ExpandCollapseControls, ExpandCollapseContent, RowJustification, RowAlignment, Row, TruncateText */
/*! all exports used */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _column__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./column */ "../../sdk/ui-react/built/layout/column.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "ColumnAlignment", function() { return _column__WEBPACK_IMPORTED_MODULE_0__["ColumnAlignment"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "ColumnJustification", function() { return _column__WEBPACK_IMPORTED_MODULE_0__["ColumnJustification"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Column", function() { return _column__WEBPACK_IMPORTED_MODULE_0__["Column"]; });

/* harmony import */ var _expandCollapse__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./expandCollapse */ "../../sdk/ui-react/built/layout/expandCollapse.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "ExpandCollapse", function() { return _expandCollapse__WEBPACK_IMPORTED_MODULE_1__["ExpandCollapse"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "ExpandCollapseControls", function() { return _expandCollapse__WEBPACK_IMPORTED_MODULE_1__["ExpandCollapseControls"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "ExpandCollapseContent", function() { return _expandCollapse__WEBPACK_IMPORTED_MODULE_1__["ExpandCollapseContent"]; });

/* harmony import */ var _row__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./row */ "../../sdk/ui-react/built/layout/row.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "RowJustification", function() { return _row__WEBPACK_IMPORTED_MODULE_2__["RowJustification"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "RowAlignment", function() { return _row__WEBPACK_IMPORTED_MODULE_2__["RowAlignment"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Row", function() { return _row__WEBPACK_IMPORTED_MODULE_2__["Row"]; });

/* harmony import */ var _truncateText__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./truncateText */ "../../sdk/ui-react/built/layout/truncateText.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "TruncateText", function() { return _truncateText__WEBPACK_IMPORTED_MODULE_3__["TruncateText"]; });

//
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.
//
// Microsoft Bot Framework: http://botframework.com
//
// Bot Framework Emulator Github:
// https://github.com/Microsoft/BotFramwork-Emulator
//
// Copyright (c) Microsoft Corporation
// All rights reserved.
//
// MIT License:
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//




//# sourceMappingURL=index.js.map

/***/ }),

/***/ "../../sdk/ui-react/built/layout/row.js":
/*!*******************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/packages/sdk/ui-react/built/layout/row.js ***!
  \*******************************************************************************************************/
/*! exports provided: RowJustification, RowAlignment, Row */
/*! all exports used */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RowJustification", function() { return RowJustification; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RowAlignment", function() { return RowAlignment; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Row", function() { return Row; });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "../../../node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var glamor__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! glamor */ "../../../node_modules/glamor/lib/index.js");
/* harmony import */ var glamor__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(glamor__WEBPACK_IMPORTED_MODULE_1__);
//
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.
//
// Microsoft Bot Framework: http://botframework.com
//
// Bot Framework Emulator Github:
// https://github.com/Microsoft/BotFramwork-Emulator
//
// Copyright (c) Microsoft Corporation
// All rights reserved.
//
// MIT License:
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//


var RowJustification;
(function (RowJustification) {
    RowJustification[RowJustification["Left"] = 0] = "Left";
    RowJustification[RowJustification["Center"] = 1] = "Center";
    RowJustification[RowJustification["Right"] = 2] = "Right";
})(RowJustification || (RowJustification = {}));
var RowAlignment;
(function (RowAlignment) {
    RowAlignment[RowAlignment["Top"] = 0] = "Top";
    RowAlignment[RowAlignment["Center"] = 1] = "Center";
    RowAlignment[RowAlignment["Bottom"] = 2] = "Bottom";
})(RowAlignment || (RowAlignment = {}));
const BASE_CSS = Object(glamor__WEBPACK_IMPORTED_MODULE_1__["css"])({
    boxSizing: 'border-box',
    display: 'flex',
    flexFlow: 'row nowrap',
    flexShrink: 0,
    overflow: 'hidden',
    width: '100%'
});
class Row extends react__WEBPACK_IMPORTED_MODULE_0__["Component"] {
    constructor(props, context) {
        super(props, context);
    }
    render() {
        const ALIGNMENT_CSS = Object(glamor__WEBPACK_IMPORTED_MODULE_1__["css"])({
            alignItems: getRowAlignment(this.props.align),
            justifyContent: getRowJustification(this.props.justify)
        });
        const CSS = Object(glamor__WEBPACK_IMPORTED_MODULE_1__["css"])(BASE_CSS, ALIGNMENT_CSS);
        return (react__WEBPACK_IMPORTED_MODULE_0__["createElement"]("div", Object.assign({ className: 'row-comp ' + (this.props.className || '') }, CSS), this.props.children));
    }
}
/** Converts a row alignment (vertical axis) type to its flexbox style value */
function getRowAlignment(a) {
    switch (a) {
        case RowAlignment.Center:
            return 'center';
        case RowAlignment.Bottom:
            return 'flex-end';
        case RowAlignment.Top:
        default:
            return 'flex-start';
    }
}
/** Converts a row justification (horizontal axis) type to its flexbox style value */
function getRowJustification(j) {
    switch (j) {
        case RowJustification.Center:
            return 'center';
        case RowJustification.Right:
            return 'flex-end';
        case RowJustification.Left:
        default:
            return 'flex-start';
    }
}
//# sourceMappingURL=row.js.map

/***/ }),

/***/ "../../sdk/ui-react/built/layout/truncateText.js":
/*!****************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/packages/sdk/ui-react/built/layout/truncateText.js ***!
  \****************************************************************************************************************/
/*! exports provided: TruncateText */
/*! all exports used */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TruncateText", function() { return TruncateText; });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "../../../node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var glamor__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! glamor */ "../../../node_modules/glamor/lib/index.js");
/* harmony import */ var glamor__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(glamor__WEBPACK_IMPORTED_MODULE_1__);
//
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.
//
// Microsoft Bot Framework: http://botframework.com
//
// Bot Framework Emulator Github:
// https://github.com/Microsoft/BotFramwork-Emulator
//
// Copyright (c) Microsoft Corporation
// All rights reserved.
//
// MIT License:
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//


const CSS = Object(glamor__WEBPACK_IMPORTED_MODULE_1__["css"])({
    display: 'inline-block',
    maxWidth: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
});
// TODO: Instead of passing children here, we should consider passing a "text" props
//       This is because this component is named "truncateText", it should not accept
//       something that is not a text. It also help with eliminating the "title" props.
const TruncateText = (props) => react__WEBPACK_IMPORTED_MODULE_0__["createElement"]("span", Object.assign({ className: 'truncate-text ' + (props.className || ''), title: props.title }, CSS), props.children);
//# sourceMappingURL=truncateText.js.map

/***/ }),

/***/ "../../sdk/ui-react/built/splitter/index.js":
/*!***********************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/packages/sdk/ui-react/built/splitter/index.js ***!
  \***********************************************************************************************************/
/*! exports provided: Splitter */
/*! all exports used */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Splitter", function() { return Splitter; });
/* harmony import */ var glamor__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! glamor */ "../../../node_modules/glamor/lib/index.js");
/* harmony import */ var glamor__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(glamor__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "../../../node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var react_dom__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react-dom */ "../../../node_modules/react-dom/index.js");
/* harmony import */ var react_dom__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(react_dom__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _styles__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../styles */ "../../sdk/ui-react/built/styles/index.js");
/* harmony import */ var _pane__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./pane */ "../../sdk/ui-react/built/splitter/pane.js");
//
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.
//
// Microsoft Bot Framework: http://botframework.com
//
// Bot Framework Emulator Github:
// https://github.com/Microsoft/BotFramwork-Emulator
//
// Copyright (c) Microsoft Corporation
// All rights reserved.
//
// MIT License:
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE , ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//





const CSS = Object(glamor__WEBPACK_IMPORTED_MODULE_0__["css"])({
    height: "100%",
    width: "100%",
    display: 'flex',
    flexFlow: 'column nowrap'
});
const DEFAULT_PANE_SIZE = 200;
const MIN_PANE_SIZE = 0;
const SPLITTER_SIZE = 0;
const SPLITTER_HIT_TARGET = 8;
const event = new Event('splitterResize');
class Splitter extends react__WEBPACK_IMPORTED_MODULE_1__["Component"] {
    constructor(props, context) {
        super(props, context);
        this.saveContainerRef = this.saveContainerRef.bind(this);
        this.saveSplitterRef = this.saveSplitterRef.bind(this);
        this.savePaneRef = this.savePaneRef.bind(this);
        this.onGrabSplitter = this.onGrabSplitter.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.checkForContainerResize = this.checkForContainerResize.bind(this);
        this.activeSplitter = null;
        // [{ ref: splitterRef, dimensions: ref.getBoundingClientRect() }]
        this.splitters = [];
        this.splitNum = 0;
        // [{ size: num, ref: paneRef }]
        this.panes = [];
        this.paneNum = 0;
        this.state = {
            resizing: false,
            paneSizes: []
        };
    }
    componentWillMount() {
        // set up event listeners
        document.addEventListener('mousemove', this.onMouseMove);
        document.addEventListener('mouseup', this.onMouseUp);
        document.addEventListener('splitterResize', this.checkForContainerResize);
        window.addEventListener('resize', this.checkForContainerResize);
        this.SPLITTER_CSS = this.props.orientation === 'horizontal' ?
            Object(glamor__WEBPACK_IMPORTED_MODULE_0__["css"])({
                position: 'relative',
                height: SPLITTER_SIZE,
                width: '100%',
                backgroundColor: _styles__WEBPACK_IMPORTED_MODULE_3__["Colors"].SPLITTER_BACKGROUND_DARK,
                flexShrink: 0,
                zIndex: 1,
                // inivisible hit target floating on top of splitter
                '& > div': {
                    position: 'absolute',
                    height: SPLITTER_HIT_TARGET,
                    width: '100%',
                    top: SPLITTER_HIT_TARGET / 2 * -1,
                    left: 0,
                    backgroundColor: 'transparent',
                    cursor: 'ns-resize'
                }
            })
            :
                Object(glamor__WEBPACK_IMPORTED_MODULE_0__["css"])({
                    position: 'relative',
                    height: '100%',
                    width: SPLITTER_SIZE,
                    backgroundColor: _styles__WEBPACK_IMPORTED_MODULE_3__["Colors"].SPLITTER_BACKGROUND_DARK,
                    flexShrink: 0,
                    zIndex: 1,
                    '& > div': {
                        position: 'absolute',
                        height: '100%',
                        width: SPLITTER_HIT_TARGET,
                        top: 0,
                        left: SPLITTER_HIT_TARGET / 2 * -1,
                        backgroundColor: 'transparent',
                        cursor: 'ew-resize'
                    }
                });
        this.CONTAINER_CSS = Object(glamor__WEBPACK_IMPORTED_MODULE_0__["css"])({
            height: "100%",
            width: "100%",
            position: 'relative'
        });
        // float a canvas within the splitter container to deal with overflow issues
        const flexDir = this.props.orientation === 'horizontal' ? 'column' : 'row';
        this.FLOATING_CANVAS_CSS = Object(glamor__WEBPACK_IMPORTED_MODULE_0__["css"])({
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
            left: 0,
            display: 'flex',
            flexFlow: `${flexDir} nowrap`,
        });
    }
    componentDidMount() {
        this.calculateInitialPaneSizes();
    }
    componentWillUnmount() {
        // remove event listeners
        document.removeEventListener('mousemove', this.onMouseMove);
        document.removeEventListener('mouseup', this.onMouseUp);
        document.removeEventListener('splitterResize', this.checkForContainerResize);
        window.removeEventListener('resize', this.checkForContainerResize);
    }
    componentWillReceiveProps(nextProps) {
        // if the number of children changes, recalculate pane sizes
        if (nextProps.children.length !== this.props.children.length) {
            this.props.children.length = nextProps.children.length;
            this.calculateInitialPaneSizes();
        }
    }
    calculateInitialPaneSizes() {
        const currentPaneSizes = this.state.paneSizes;
        this.containerSize = this.getContainerSize();
        const numberOfPanes = this.props.children.length;
        const numberOfSplitters = numberOfPanes - 1;
        let defaultPaneSize;
        let initialSizes = this.props.initialSizes;
        if (initialSizes) {
            if (typeof initialSizes === 'function')
                initialSizes = initialSizes();
        }
        if (initialSizes) {
            // subtract initial sizes from container size and distribute the remaining size equally
            let remainingContainerSize = this.containerSize;
            let defaultPanes = numberOfPanes;
            Object.keys(initialSizes).forEach(key => {
                // convert percentage to absolute value if necessary
                initialSizes[key] = typeof initialSizes[key] === 'string' ?
                    parseInt(initialSizes[key]) / 100 * this.containerSize : initialSizes[key];
                if (isNaN(initialSizes[key])) {
                    throw new Error(`Invalid value passed as element of initialSizes in Splitter: ${initialSizes[key]}`);
                }
                remainingContainerSize -= initialSizes[key];
                defaultPanes--;
            });
            defaultPaneSize = (remainingContainerSize - numberOfSplitters * SPLITTER_SIZE) / defaultPanes;
        }
        else {
            defaultPaneSize = (this.containerSize - numberOfSplitters * SPLITTER_SIZE) / numberOfPanes;
        }
        for (let i = 0; i < numberOfPanes; i++) {
            if (initialSizes && initialSizes[i]) {
                currentPaneSizes[i] = initialSizes[i];
            }
            else {
                currentPaneSizes[i] = defaultPaneSize;
            }
        }
        this.setState(({ paneSizes: currentPaneSizes }));
    }
    getContainerSize() {
        if (this.containerRef) {
            const containerDimensions = this.containerRef.getBoundingClientRect();
            return this.props.orientation === 'horizontal' ? containerDimensions.height : containerDimensions.width;
        }
        return null;
    }
    checkForContainerResize(e) {
        // only recalculate secondary panes if there is a specified primary pane
        if (this.props.primaryPaneIndex || (this.props.primaryPaneIndex === 0)) {
            // only recalculate pane sizes if the container's size has changed at all
            const oldContainerSize = this.containerSize;
            const newContainerSize = this.getContainerSize();
            if (newContainerSize !== oldContainerSize) {
                this.containerSize = newContainerSize;
                this.calculateSecondaryPaneSizes(oldContainerSize, newContainerSize);
            }
        }
    }
    calculateSecondaryPaneSizes(oldContainerSize, newContainerSize) {
        const containerSizeDelta = newContainerSize - oldContainerSize;
        // containerSizeDelta / number of secondary panes
        const secondaryPaneSizeAdjustment = containerSizeDelta / (this.panes.length - 1);
        // adjust each of the secondary panes to accomodate for the new container size
        let currentPaneSizes = this.state.paneSizes;
        for (let i = 0; i < currentPaneSizes.length; i++) {
            if (i !== this.props.primaryPaneIndex) {
                currentPaneSizes[i] = currentPaneSizes[i] + secondaryPaneSizeAdjustment;
            }
        }
        this.setState(({ paneSizes: currentPaneSizes }));
    }
    saveContainerRef(element) {
        this.containerRef = element;
    }
    saveSplitterRef(element, index) {
        if (!this.splitters[index]) {
            this.splitters[index] = {};
        }
        this.splitters[index]['ref'] = element;
    }
    savePaneRef(element, index) {
        if (!this.panes[index]) {
            this.panes[index] = {};
        }
        this.panes[index]['ref'] = react_dom__WEBPACK_IMPORTED_MODULE_2__["findDOMNode"](element);
    }
    onGrabSplitter(e, splitterIndex) {
        clearSelection();
        // cache splitter dimensions
        this.splitters[splitterIndex]['dimensions'] = this.splitters[splitterIndex]['ref'].getBoundingClientRect();
        this.activeSplitter = splitterIndex;
        // cache container size
        this.containerSize = this.getContainerSize();
        this.setState(({ resizing: true }));
    }
    onMouseMove(e) {
        if (this.state.resizing) {
            document.dispatchEvent(event);
            this.calculatePaneSizes(this.activeSplitter, e);
            clearSelection();
        }
    }
    calculatePaneSizes(splitterIndex, e) {
        // get dimensions of both panes and the splitter
        const pane1Index = splitterIndex;
        const pane2Index = splitterIndex + 1;
        const pane1Dimensions = this.panes[pane1Index]['ref'].getBoundingClientRect();
        const pane2Dimensions = this.panes[pane2Index]['ref'].getBoundingClientRect();
        const splitterDimensions = this.splitters[splitterIndex]['dimensions'];
        // the primary pane's size will be the difference between the top (horizontal) or left (vertical) of the pane,
        // and the mouse's Y (horizontal) or X (vertical) position
        let primarySize = this.props.orientation === 'horizontal' ?
            this.panes[pane1Index]['size'] = Math.max((e.clientY - pane1Dimensions.top), this.props.minSizes[pane1Index] || MIN_PANE_SIZE)
            :
                this.panes[pane1Index]['size'] = Math.max((e.clientX - pane1Dimensions.left), this.props.minSizes[pane1Index] || MIN_PANE_SIZE);
        // the local container size will be the sum of the heights (horizontal) or widths (vertical) of both panes and the splitter
        const localContainerSize = this.props.orientation === 'horizontal' ?
            pane1Dimensions.height + pane2Dimensions.height + splitterDimensions.height
            :
                pane1Dimensions.width + pane2Dimensions.width + splitterDimensions.width;
        // bound the bottom (horizontal) or right (vertical) of the primary pane to the bottom or right of the container
        const splitterSize = this.props.orientation === 'horizontal' ? splitterDimensions.height : splitterDimensions.width;
        if ((primarySize + splitterSize) > localContainerSize) {
            primarySize = localContainerSize - splitterSize;
        }
        // the secondary pane's size will be the remaining height (horizontal) or width (vertical)
        // left in the container after subtracting the size of the splitter and primary pane from the total size
        const secondarySize = this.props.orientation === 'horizontal' ?
            this.panes[pane2Index]['size'] = Math.max((localContainerSize - primarySize - splitterDimensions.height), this.props.minSizes[pane2Index] || MIN_PANE_SIZE)
            :
                this.panes[pane2Index]['size'] = Math.max((localContainerSize - primarySize - splitterDimensions.width), this.props.minSizes[pane2Index] || MIN_PANE_SIZE);
        let currentPaneSizes = this.state.paneSizes;
        currentPaneSizes[pane1Index] = primarySize;
        currentPaneSizes[pane2Index] = secondarySize;
        if (this.props.onSizeChange) {
            const globalContainerSize = this.getContainerSize();
            const paneSizes = currentPaneSizes.map(size => ({ absolute: size, percentage: size / globalContainerSize * 100 }));
            this.props.onSizeChange(paneSizes);
        }
        this.setState(({ paneSizes: currentPaneSizes }));
    }
    onMouseUp(e) {
        // stop resizing
        this.setState(({ resizing: false }));
    }
    render() {
        // jam a splitter handle inbetween each pair of children
        const splitChildren = [];
        this.paneNum = this.splitNum = 0;
        this.props.children.forEach((child, index) => {
            // take a 'snapshot' of the current indices or else
            // the elements will all use the same value once they are rendered
            const paneIndex = this.paneNum;
            const splitIndex = this.splitNum;
            // add a pane
            if (!this.panes[paneIndex]) {
                this.panes[paneIndex] = {};
            }
            this.panes[paneIndex]['size'] = this.state.paneSizes[paneIndex] || DEFAULT_PANE_SIZE;
            const pane = react__WEBPACK_IMPORTED_MODULE_1__["createElement"](_pane__WEBPACK_IMPORTED_MODULE_4__["SplitterPane"], { key: `pane${paneIndex}`, orientation: this.props.orientation, size: this.state.paneSizes[paneIndex], ref: x => this.savePaneRef(x, paneIndex) }, child);
            splitChildren.push(pane);
            // add a splitter if there is another child after this one
            if (this.props.children[index + 1]) {
                // record which panes this splitter controls
                if (!this.splitters[splitIndex]) {
                    this.splitters[splitIndex] = {};
                }
                // add a splitter
                const splitter = (react__WEBPACK_IMPORTED_MODULE_1__["createElement"]("div", { className: this.SPLITTER_CSS, key: `splitter${splitIndex}`, ref: x => this.saveSplitterRef(x, splitIndex) },
                    react__WEBPACK_IMPORTED_MODULE_1__["createElement"]("div", { onMouseDown: (e) => this.onGrabSplitter(e, splitIndex) })));
                splitChildren.push(splitter);
                this.splitNum++;
            }
            this.paneNum++;
        });
        return (react__WEBPACK_IMPORTED_MODULE_1__["createElement"]("div", { ref: this.saveContainerRef, className: this.CONTAINER_CSS + ' split-container' },
            react__WEBPACK_IMPORTED_MODULE_1__["createElement"]("div", { className: this.FLOATING_CANVAS_CSS }, splitChildren)));
    }
}
Splitter.defaultProps = {
    minSizes: {}
};
/** Used to clear any text selected as a side effect of holding down the mouse and dragging */
function clearSelection() {
    const _document = document;
    if (window.getSelection) {
        if (window.getSelection().empty) {
            window.getSelection().empty();
        }
        else if (window.getSelection().removeAllRanges) {
            window.getSelection().removeAllRanges();
        }
    }
    else if (_document.selection) {
        _document.selection.empty();
    }
}
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "../../sdk/ui-react/built/splitter/pane.js":
/*!**********************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/packages/sdk/ui-react/built/splitter/pane.js ***!
  \**********************************************************************************************************/
/*! exports provided: SplitterPane */
/*! all exports used */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SplitterPane", function() { return SplitterPane; });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "../../../node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
//
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.
//
// Microsoft Bot Framework: http://botframework.com
//
// Bot Framework Emulator Github:
// https://github.com/Microsoft/BotFramwork-Emulator
//
// Copyright (c) Microsoft Corporation
// All rights reserved.
//
// MIT License:
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//

class SplitterPane extends react__WEBPACK_IMPORTED_MODULE_0__["Component"] {
    constructor(props, context) {
        super(props, context);
    }
    render() {
        const style = {
            overflow: 'hidden',
            flexShrink: 1,
            flexGrow: 1,
            flexBasis: this.props.size,
            boxSizing: 'border-box',
            zIndex: 0
        };
        if (this.props.orientation === 'horizontal') {
            style.maxWidth = '100%';
            style.left = 0;
            style.right = 0;
        }
        else {
            style.maxHeight = '100%';
            style.top = 0;
            style.bottom = 0;
        }
        return (react__WEBPACK_IMPORTED_MODULE_0__["createElement"]("div", { className: 'splitter-pane', style: style }, this.props.children));
    }
}
//# sourceMappingURL=pane.js.map

/***/ }),

/***/ "../../sdk/ui-react/built/styles/colors.js":
/*!**********************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/packages/sdk/ui-react/built/styles/colors.js ***!
  \**********************************************************************************************************/
/*! exports provided: Colors */
/*! all exports used */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Colors", function() { return Colors; });
//
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.
//
// Microsoft Bot Framework: http://botframework.com
//
// Bot Framework Emulator Github:
// https://github.com/Microsoft/BotFramwork-Emulator
//
// Copyright (c) Microsoft Corporation
// All rights reserved.
//
// MIT License:
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
var Colors;
(function (Colors) {
    Colors.C0 = '#2B2B2B';
    Colors.C2 = '#CCCCCC';
    Colors.C3 = '#767676';
    Colors.C4 = '#FFFFFF';
    Colors.C5 = '#FFF100';
    Colors.C6 = '#252525';
    Colors.C7 = '#969696';
    Colors.C8 = '#1E1E1E';
    Colors.C9 = '#4E257F';
    Colors.C10 = '#0063B1';
    Colors.C11 = '#004E8C';
    Colors.C12 = '#003966';
    Colors.C13 = '#47B07F';
    Colors.C14 = '#9CDCFE';
    Colors.C15 = '#ED4556';
    Colors.C16 = '#F5A623';
    Colors.C17 = '#9CDCFE';
    Colors.C18 = '#CE9178';
    Colors.C19 = '#B5CEA8';
    Colors.C20 = '#569CD6';
    Colors.C21 = '#F4E321';
    Colors.C22 = '#9E9E9E';
    Colors.C23 = '#4080D0';
    Colors.C24 = '#F2F2F2';
    Colors.C25 = '#A80000';
    Colors.C26 = '#888888';
    Colors.C27 = '#C5C5C5';
    Colors.C28 = '#D5D5D5';
    Colors.C29 = '#333333';
    Colors.C30 = '#F4F4F4';
    Colors.C31 = '#4A4A4A';
    Colors.C32 = '#777777';
    Colors.C33 = '#EAEAEA';
    Colors.C34 = '#A6A6A6';
    Colors.C35 = '#BFBFBF';
    Colors.C36 = '#C8C8C8';
    Colors.C37 = '#444444';
    Colors.C38 = '#0078D7';
    Colors.C39 = '#808080';
    Colors.APP_BACKGROUND_DARK = Colors.C8;
    Colors.APP_FOREGROUND_DARK = Colors.C2;
    Colors.APP_HYPERLINK_FOREGROUND_DARK = Colors.C23;
    Colors.APP_HYPERLINK_HOVER_DARK = Colors.C23;
    Colors.APP_HYPERLINK_DETAIL_DARK = 'rgba(204, 204, 204, 0.7)';
    Colors.BUTTON_PRIMARY_BACKGROUND_DARK = Colors.C10;
    Colors.BUTTON_PRIMARY_FOREGROUND_DARK = Colors.C4;
    Colors.BUTTON_PRIMARY_HOVER_DARK = Colors.C11;
    Colors.BUTTON_PRIMARY_FOCUS_DARK = Colors.C11;
    Colors.BUTTON_PRIMARY_ACTIVE_DARK = Colors.C11;
    Colors.BUTTON_PRIMARY_DISABLED_BACKGROUND_DARK = Colors.C2;
    Colors.BUTTON_PRIMARY_DISABLED_FOREGROUND_DARK = Colors.C22;
    Colors.BUTTON_SECONDARY_BACKGROUND_DARK = Colors.C28;
    Colors.BUTTON_SECONDARY_FOREGROUND_DARK = Colors.C29;
    Colors.BUTTON_SECONDARY_HOVER_DARK = Colors.C35;
    Colors.BUTTON_SECONDARY_FOCUS_DARK = Colors.C35;
    Colors.BUTTON_SECONDARY_ACTIVE_DARK = Colors.C35;
    Colors.BUTTON_SECONDARY_DISABLED_BACKGROUND_DARK = Colors.C33;
    Colors.BUTTON_SECONDARY_DISABLED_FOREGROUND_DARK = Colors.C34;
    Colors.SPLITTER_BACKGROUND_DARK = 'transparent';
    Colors.SCROLLBAR_THUMB_BACKGROUND_DARK = '#5E5E5E';
    Colors.SCROLLBAR_TRACK_BACKGROUND_DARK = 'transparent';
    Colors.PANEL_BACKGROUND_DARK = Colors.C8;
    Colors.PANEL_FOREGROUND_DARK = Colors.C2;
    Colors.NAVBAR_BACKGROUND_DARK = Colors.C37;
    Colors.NAVBAR_FOREGROUND_DARK = Colors.C4;
    Colors.EXPLORER_BACKGROUND_DARK = Colors.C6;
    Colors.EXPLORER_FOREGROUND_DARK = Colors.C2;
    Colors.EXPLORER_ITEM_ACTIVE_BACKGROUND_DARK = '#3F3F46';
    Colors.EXPLORER_ITEM_HOVER_BACKGROUND_DARK = '#2A2D2E';
    Colors.EXPLORER_ITEM_FOCUSED_BACKGROUND_DARK = '#094771';
    Colors.SECTION_HEADER_BACKGROUND_DARK = '#383838';
    Colors.SECTION_HEADER_FOREGROUND_DARK = Colors.C2;
    Colors.EDITOR_TAB_INACTIVE_BACKGROUND_DARK = '#2D2D2D';
    Colors.EDITOR_TAB_INACTIVE_FOREGROUND_DARK = Colors.C7;
    Colors.EDITOR_TAB_ACTIVE_BACKGROUND_DARK = Colors.C8;
    Colors.EDITOR_TAB_ACTIVE_FOREGROUND_DARK = Colors.C4;
    Colors.EDITOR_TAB_HOVER_FOREGROUND_DARK = Colors.C4;
    Colors.EDITOR_TAB_BORDER_DARK = Colors.C6;
    Colors.EDITOR_TAB_BACKGROUND_DARK = Colors.C6;
    Colors.EDITOR_TAB_WIDGET_ENABLED_DARK = Colors.C2;
    Colors.EDITOR_TAB_DRAGGED_OVER_BACKGROUND_DARK = '#383838';
    Colors.LOG_PANEL_SOURCE_DARK = '#AAAAAA';
    Colors.LOG_PANEL_INFO_DARK = Colors.C4;
    Colors.LOG_PANEL_WARN_DARK = Colors.C16;
    Colors.LOG_PANEL_ERROR_DARK = Colors.C15;
    Colors.LOG_PANEL_DEBUG_DARK = Colors.C39;
    Colors.LOG_PANEL_TIMESTAMP_DARK = Colors.C13;
    Colors.LOG_PANEL_LINK_DARK = Colors.C14;
    Colors.LOG_PANEL_SRC_DST_DARK = Colors.C3;
    Colors.WEBCHAT_SELECTED_BACKGROUND_DARK = Colors.C21;
    Colors.EDITOR_DRAG_OVERLAY_TRANSPARENT_DARK = 'rgba(85, 85, 85, 0)';
    Colors.EDITOR_DRAG_OVERLAY_VISIBLE_DARK = 'rgba(85, 85, 85, 0.6)';
    Colors.TOOLBAR_BACKGROUND_DARK = Colors.C8;
    Colors.TOOLBAR_FOREGROUND_DARK = Colors.C27;
    Colors.TOOLBAR_BUTTON_BACKGROUND_DARK = 'transparent';
    Colors.TOOLBAR_BUTTON_FOREGROUND_DARK = Colors.C27;
    Colors.TOOLBAR_BUTTON_HOVER_BACKGROUND_DARK = 'transparent';
    Colors.TOOLBAR_BUTTON_HOVER_FOREGROUND_DARK = Colors.C27;
    Colors.TOOLBAR_BUTTON_DISABLED_FOREGROUND_DARK = Colors.C26;
    Colors.TOOLBAR_BUTTON_ACTIVE_FOREGROUND_DARK = Colors.C4;
    Colors.JSON_FORMATTING_KEY_DARK = Colors.C17;
    Colors.JSON_FORMATTING_STRING_DARK = Colors.C18;
    Colors.JSON_FORMATTING_NUMBER_DARK = Colors.C19;
    Colors.JSON_FORMATTING_BOOLEAN_DARK = Colors.C20;
    Colors.JSON_FORMATTING_NULL_DARK = Colors.C20;
    Colors.SHADOW_COLOR_DARK = 'rgba(0,0,0,0.6)';
    Colors.LOGO_FOREGROUND_DARK = Colors.C10;
    Colors.INPUT_ERR_BACKGROUND_DARK = Colors.C24;
    Colors.INPUT_ERR_FOREGROUND_DARK = Colors.C25;
    Colors.INPUT_TEXT_DARK = Colors.C31;
    Colors.INPUT_PLACEHOLDER_TEXT_DARK = Colors.C32;
    Colors.DIALOG_BACKGROUND_DARK = Colors.C30;
    Colors.DIALOG_FOREGROUND_DARK = Colors.C31;
    Colors.DIALOG_INPUT_BORDER_DARK = Colors.C36;
    Colors.STATUS_BAR_BACKGROUND_DARK = Colors.C38;
    Colors.STATUS_BAR_FOREGROUND_DARK = Colors.C4;
})(Colors || (Colors = {}));
//# sourceMappingURL=colors.js.map

/***/ }),

/***/ "../../sdk/ui-react/built/styles/decorators.js":
/*!**************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/packages/sdk/ui-react/built/styles/decorators.js ***!
  \**************************************************************************************************************/
/*! exports provided: Decorators */
/*! all exports used */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Decorators", function() { return Decorators; });
//
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.
//
// Microsoft Bot Framework: http://botframework.com
//
// Bot Framework Emulator Github:
// https://github.com/Microsoft/BotFramwork-Emulator
//
// Copyright (c) Microsoft Corporation
// All rights reserved.
//
// MIT License:
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
var Decorators;
(function (Decorators) {
    Decorators.TOOLBAR_BUTTON_HOVER_TEXTDECORATION = 'underline';
})(Decorators || (Decorators = {}));
//# sourceMappingURL=decorators.js.map

/***/ }),

/***/ "../../sdk/ui-react/built/styles/fonts.js":
/*!*********************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/packages/sdk/ui-react/built/styles/fonts.js ***!
  \*********************************************************************************************************/
/*! exports provided: Fonts */
/*! all exports used */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Fonts", function() { return Fonts; });
//
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.
//
// Microsoft Bot Framework: http://botframework.com
//
// Bot Framework Emulator Github:
// https://github.com/Microsoft/BotFramwork-Emulator
//
// Copyright (c) Microsoft Corporation
// All rights reserved.
//
// MIT License:
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
var Fonts;
(function (Fonts) {
    Fonts.FONT_FAMILY_DEFAULT = '-apple-system,BlinkMacSystemFont,Segoe WPC,Segoe UI,HelveticaNeue-Light,Ubuntu,Droid Sans,sans-serif';
    Fonts.FONT_FAMILY_MONOSPACE = 'Menlo,Monaco,Consolas,Droid Sans Mono,Courier New,monospace,Droid Sans Fallback';
})(Fonts || (Fonts = {}));
//# sourceMappingURL=fonts.js.map

/***/ }),

/***/ "../../sdk/ui-react/built/styles/index.js":
/*!*********************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/packages/sdk/ui-react/built/styles/index.js ***!
  \*********************************************************************************************************/
/*! exports provided: Colors, Decorators, Fonts, Shadows */
/*! all exports used */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _colors__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./colors */ "../../sdk/ui-react/built/styles/colors.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Colors", function() { return _colors__WEBPACK_IMPORTED_MODULE_0__["Colors"]; });

/* harmony import */ var _decorators__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./decorators */ "../../sdk/ui-react/built/styles/decorators.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Decorators", function() { return _decorators__WEBPACK_IMPORTED_MODULE_1__["Decorators"]; });

/* harmony import */ var _fonts__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./fonts */ "../../sdk/ui-react/built/styles/fonts.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Fonts", function() { return _fonts__WEBPACK_IMPORTED_MODULE_2__["Fonts"]; });

/* harmony import */ var _shadows__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./shadows */ "../../sdk/ui-react/built/styles/shadows.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Shadows", function() { return _shadows__WEBPACK_IMPORTED_MODULE_3__["Shadows"]; });

//
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.
//
// Microsoft Bot Framework: http://botframework.com
//
// Bot Framework Emulator Github:
// https://github.com/Microsoft/BotFramwork-Emulator
//
// Copyright (c) Microsoft Corporation
// All rights reserved.
//
// MIT License:
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//




//# sourceMappingURL=index.js.map

/***/ }),

/***/ "../../sdk/ui-react/built/styles/shadows.js":
/*!***********************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/packages/sdk/ui-react/built/styles/shadows.js ***!
  \***********************************************************************************************************/
/*! exports provided: Shadows */
/*! all exports used */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Shadows", function() { return Shadows; });
/* harmony import */ var _colors__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./colors */ "../../sdk/ui-react/built/styles/colors.js");
//
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.
//
// Microsoft Bot Framework: http://botframework.com
//
// Bot Framework Emulator Github:
// https://github.com/Microsoft/BotFramwork-Emulator
//
// Copyright (c) Microsoft Corporation
// All rights reserved.
//
// MIT License:
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//

const BLUR_RADIUS = '6px';
const SPREAD_RADIUS = '-3px';
var Shadows;
(function (Shadows) {
    Shadows.INSET_TOP = `inset 0px 3px ${BLUR_RADIUS} ${SPREAD_RADIUS} ${_colors__WEBPACK_IMPORTED_MODULE_0__["Colors"].SHADOW_COLOR_DARK}`;
    Shadows.INSET_BOTTOM = `inset 0px -3px ${BLUR_RADIUS} ${SPREAD_RADIUS} ${_colors__WEBPACK_IMPORTED_MODULE_0__["Colors"].SHADOW_COLOR_DARK}`;
    Shadows.INSET_LEFT = `inset 3px 0px ${BLUR_RADIUS} ${SPREAD_RADIUS} ${_colors__WEBPACK_IMPORTED_MODULE_0__["Colors"].SHADOW_COLOR_DARK}`;
    Shadows.INSET_RIGHT = `inset -3px 0px ${BLUR_RADIUS} ${SPREAD_RADIUS} ${_colors__WEBPACK_IMPORTED_MODULE_0__["Colors"].SHADOW_COLOR_DARK}`;
})(Shadows || (Shadows = {}));
//# sourceMappingURL=shadows.js.map

/***/ }),

/***/ "../../sdk/ui-react/built/utils/filterChildren.js":
/*!*****************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/packages/sdk/ui-react/built/utils/filterChildren.js ***!
  \*****************************************************************************************************************/
/*! exports provided: filterChildren, hmrSafeNameComparison */
/*! all exports used */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "filterChildren", function() { return filterChildren; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "hmrSafeNameComparison", function() { return hmrSafeNameComparison; });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "../../../node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
//
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.
//
// Microsoft Bot Framework: http://botframework.com
//
// Bot Framework Emulator Github:
// https://github.com/Microsoft/BotFramwork-Emulator
//
// Copyright (c) Microsoft Corporation
// All rights reserved.
//
// MIT License:
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//

function filterChildren(children, predicate) {
    return react__WEBPACK_IMPORTED_MODULE_0__["Children"].map(children, child => child && predicate(child) ? child : false);
}
function hmrSafeNameComparison(child1, child2) {
    const { name: name1, displayName: displayName1 } = child1;
    const { name: name2, displayName: displayName2 } = child2;
    return name1 === name2 ||
        name1 === displayName2 ||
        displayName1 === displayName2 ||
        displayName1 === name2;
}
//# sourceMappingURL=filterChildren.js.map

/***/ }),

/***/ "../../sdk/ui-react/built/utils/index.js":
/*!********************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/packages/sdk/ui-react/built/utils/index.js ***!
  \********************************************************************************************************/
/*! exports provided: filterChildren, hmrSafeNameComparison */
/*! all exports used */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _filterChildren__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./filterChildren */ "../../sdk/ui-react/built/utils/filterChildren.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "filterChildren", function() { return _filterChildren__WEBPACK_IMPORTED_MODULE_0__["filterChildren"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "hmrSafeNameComparison", function() { return _filterChildren__WEBPACK_IMPORTED_MODULE_0__["hmrSafeNameComparison"]; });

//
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.
//
// Microsoft Bot Framework: http://botframework.com
//
// Bot Framework Emulator Github:
// https://github.com/Microsoft/BotFramwork-Emulator
//
// Copyright (c) Microsoft Corporation
// All rights reserved.
//
// MIT License:
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//

//# sourceMappingURL=index.js.map

/***/ }),

/***/ "../../sdk/ui-react/built/widget/checkbox.js":
/*!************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/packages/sdk/ui-react/built/widget/checkbox.js ***!
  \************************************************************************************************************/
/*! exports provided: Checkbox */
/*! all exports used */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Checkbox", function() { return Checkbox; });
/* harmony import */ var glamor__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! glamor */ "../../../node_modules/glamor/lib/index.js");
/* harmony import */ var glamor__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(glamor__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "../../../node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _styles__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../styles */ "../../sdk/ui-react/built/styles/index.js");
//
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.
//
// Microsoft Bot Framework: http://botframework.com
//
// Bot Framework Emulator Github:
// https://github.com/Microsoft/BotFramwork-Emulator
//
// Copyright (c) Microsoft Corporation
// All rights reserved.
//
// MIT License:
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//



const CSS = Object(glamor__WEBPACK_IMPORTED_MODULE_0__["css"])({
    display: 'flex',
    position: 'relative',
    '& > input[type="checkbox"]': {
        cursor: 'pointer',
        width: '16px',
        display: 'none'
    },
    '& > label': {
        fontFamily: _styles__WEBPACK_IMPORTED_MODULE_2__["Fonts"].FONT_FAMILY_DEFAULT,
        cursor: 'pointer',
        lineHeight: '1.5',
        marginLeft: '23px',
        '&::after': {
            content: '""',
            position: 'absolute',
            display: 'inline-block',
            boxSizing: 'border-box',
            border: '1px solid #666666',
            width: '16px',
            height: '16px',
            left: 0,
            top: '50%',
            transform: 'translateY(calc(-50% - 1px))',
            backgroundPosition: '1px 1px',
        },
        '&:hover::after': {
            border: `1px solid ${_styles__WEBPACK_IMPORTED_MODULE_2__["Colors"].C10}`
        },
        '[data-checked="true"]::after': {
            backgroundColor: _styles__WEBPACK_IMPORTED_MODULE_2__["Colors"].C10,
            backgroundImage: `url('data:image/svg+xml;utf8,<svg width="12px" height="12px" viewBox="0 0 16 16" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g><polygon fill="#ffffff" id="path-1" points="13.6484375 3.6484375 14.3515625 4.3515625 6 12.7109375 1.6484375 8.3515625 2.3515625 7.6484375 6 11.2890625"/></g></svg>')`,
        },
    }
});
class Checkbox extends react__WEBPACK_IMPORTED_MODULE_1__["Component"] {
    constructor(props, context) {
        super(props, context);
    }
    render() {
        const { checked = false, label = '', id = '_' + Math.floor(Math.random() * 99999), onChange, className = '', inputClass = '' } = this.props;
        return (react__WEBPACK_IMPORTED_MODULE_1__["createElement"]("div", Object.assign({ className: `${className} checkbox-comp` }, CSS),
            react__WEBPACK_IMPORTED_MODULE_1__["createElement"]("input", { type: "checkbox", checked: checked, onChange: onChange, id: id, className: className }),
            react__WEBPACK_IMPORTED_MODULE_1__["createElement"]("label", { htmlFor: id, "data-checked": checked }, label)));
    }
}
//# sourceMappingURL=checkbox.js.map

/***/ }),

/***/ "../../sdk/ui-react/built/widget/index.js":
/*!*********************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/packages/sdk/ui-react/built/widget/index.js ***!
  \*********************************************************************************************************/
/*! exports provided: Checkbox, LargeHeader, MediumHeader, NumberInputField, PrimaryButton, SmallHeader, TextInputField, InsetShadow, Modal, ModalContent, ModalActions */
/*! all exports used */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _checkbox__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./checkbox */ "../../sdk/ui-react/built/widget/checkbox.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Checkbox", function() { return _checkbox__WEBPACK_IMPORTED_MODULE_0__["Checkbox"]; });

/* harmony import */ var _largeHeader__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./largeHeader */ "../../sdk/ui-react/built/widget/largeHeader.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "LargeHeader", function() { return _largeHeader__WEBPACK_IMPORTED_MODULE_1__["LargeHeader"]; });

/* harmony import */ var _mediumHeader__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./mediumHeader */ "../../sdk/ui-react/built/widget/mediumHeader.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "MediumHeader", function() { return _mediumHeader__WEBPACK_IMPORTED_MODULE_2__["MediumHeader"]; });

/* harmony import */ var _numberInputField__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./numberInputField */ "../../sdk/ui-react/built/widget/numberInputField.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "NumberInputField", function() { return _numberInputField__WEBPACK_IMPORTED_MODULE_3__["NumberInputField"]; });

/* harmony import */ var _primaryButton__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./primaryButton */ "../../sdk/ui-react/built/widget/primaryButton.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "PrimaryButton", function() { return _primaryButton__WEBPACK_IMPORTED_MODULE_4__["PrimaryButton"]; });

/* harmony import */ var _smallHeader__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./smallHeader */ "../../sdk/ui-react/built/widget/smallHeader.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "SmallHeader", function() { return _smallHeader__WEBPACK_IMPORTED_MODULE_5__["SmallHeader"]; });

/* harmony import */ var _textInputField__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./textInputField */ "../../sdk/ui-react/built/widget/textInputField.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "TextInputField", function() { return _textInputField__WEBPACK_IMPORTED_MODULE_6__["TextInputField"]; });

/* harmony import */ var _insetShadow__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./insetShadow */ "../../sdk/ui-react/built/widget/insetShadow.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "InsetShadow", function() { return _insetShadow__WEBPACK_IMPORTED_MODULE_7__["InsetShadow"]; });

/* harmony import */ var _modal__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./modal */ "../../sdk/ui-react/built/widget/modal.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Modal", function() { return _modal__WEBPACK_IMPORTED_MODULE_8__["Modal"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "ModalContent", function() { return _modal__WEBPACK_IMPORTED_MODULE_8__["ModalContent"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "ModalActions", function() { return _modal__WEBPACK_IMPORTED_MODULE_8__["ModalActions"]; });

//
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.
//
// Microsoft Bot Framework: http://botframework.com
//
// Bot Framework Emulator Github:
// https://github.com/Microsoft/BotFramwork-Emulator
//
// Copyright (c) Microsoft Corporation
// All rights reserved.
//
// MIT License:
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//









//# sourceMappingURL=index.js.map

/***/ }),

/***/ "../../sdk/ui-react/built/widget/insetShadow.js":
/*!***************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/packages/sdk/ui-react/built/widget/insetShadow.js ***!
  \***************************************************************************************************************/
/*! exports provided: InsetShadow */
/*! all exports used */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "InsetShadow", function() { return InsetShadow; });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "../../../node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var glamor__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! glamor */ "../../../node_modules/glamor/lib/index.js");
/* harmony import */ var glamor__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(glamor__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _styles__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../styles */ "../../sdk/ui-react/built/styles/index.js");
//
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.
//
// Microsoft Bot Framework: http://botframework.com
//
// Bot Framework Emulator Github:
// https://github.com/Microsoft/BotFramwork-Emulator
//
// Copyright (c) Microsoft Corporation
// All rights reserved.
//
// MIT License:
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//



const BASE_CSS = Object(glamor__WEBPACK_IMPORTED_MODULE_1__["css"])({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none'
});
class InsetShadow extends react__WEBPACK_IMPORTED_MODULE_0__["Component"] {
    constructor(props, context) {
        super(props, context);
    }
    render() {
        const shadowStyles = [];
        this.props.top ? shadowStyles.push(_styles__WEBPACK_IMPORTED_MODULE_2__["Shadows"].INSET_TOP) : null;
        this.props.left ? shadowStyles.push(_styles__WEBPACK_IMPORTED_MODULE_2__["Shadows"].INSET_LEFT) : null;
        this.props.bottom ? shadowStyles.push(_styles__WEBPACK_IMPORTED_MODULE_2__["Shadows"].INSET_BOTTOM) : null;
        this.props.right ? shadowStyles.push(_styles__WEBPACK_IMPORTED_MODULE_2__["Shadows"].INSET_RIGHT) : null;
        // combine multiple shadows into one boxShadow property (ex. boxShadow: shadowTop, shadowBottom, shadowRight, etc.)
        const shadowRule = shadowStyles.reduce((rule, currentStyle) => rule ? `${rule}, ${currentStyle}` : currentStyle, '');
        const SHADOW_CSS = Object(glamor__WEBPACK_IMPORTED_MODULE_1__["css"])({ boxShadow: shadowRule || null });
        const CSS = Object(glamor__WEBPACK_IMPORTED_MODULE_1__["css"])(BASE_CSS, SHADOW_CSS);
        return (react__WEBPACK_IMPORTED_MODULE_0__["createElement"]("div", Object.assign({ className: "inset-shadow-component" }, CSS, { "aria-hidden": "true" })));
    }
}
//# sourceMappingURL=insetShadow.js.map

/***/ }),

/***/ "../../sdk/ui-react/built/widget/largeHeader.js":
/*!***************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/packages/sdk/ui-react/built/widget/largeHeader.js ***!
  \***************************************************************************************************************/
/*! exports provided: LargeHeader */
/*! all exports used */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "LargeHeader", function() { return LargeHeader; });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "../../../node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var glamor__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! glamor */ "../../../node_modules/glamor/lib/index.js");
/* harmony import */ var glamor__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(glamor__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _layout__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../layout */ "../../sdk/ui-react/built/layout/index.js");
/* harmony import */ var _styles__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../styles */ "../../sdk/ui-react/built/styles/index.js");
//
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.
//
// Microsoft Bot Framework: http://botframework.com
//
// Bot Framework Emulator Github:
// https://github.com/Microsoft/BotFramwork-Emulator
//
// Copyright (c) Microsoft Corporation
// All rights reserved.
//
// MIT License:
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//




const CSS = Object(glamor__WEBPACK_IMPORTED_MODULE_1__["css"])({
    fontFamily: _styles__WEBPACK_IMPORTED_MODULE_3__["Fonts"].FONT_FAMILY_DEFAULT,
    fontSize: '36px',
    fontWeight: 400,
    margin: 0,
    padding: 0
});
const LargeHeader = (props) => react__WEBPACK_IMPORTED_MODULE_0__["createElement"]("h1", Object.assign({ className: 'large-header-comp ' + (props.className || '') }, CSS),
    react__WEBPACK_IMPORTED_MODULE_0__["createElement"](_layout__WEBPACK_IMPORTED_MODULE_2__["TruncateText"], null, props.children));
//# sourceMappingURL=largeHeader.js.map

/***/ }),

/***/ "../../sdk/ui-react/built/widget/mediumHeader.js":
/*!****************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/packages/sdk/ui-react/built/widget/mediumHeader.js ***!
  \****************************************************************************************************************/
/*! exports provided: MediumHeader */
/*! all exports used */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MediumHeader", function() { return MediumHeader; });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "../../../node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var glamor__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! glamor */ "../../../node_modules/glamor/lib/index.js");
/* harmony import */ var glamor__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(glamor__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _layout__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../layout */ "../../sdk/ui-react/built/layout/index.js");
/* harmony import */ var _styles__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../styles */ "../../sdk/ui-react/built/styles/index.js");
//
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.
//
// Microsoft Bot Framework: http://botframework.com
//
// Bot Framework Emulator Github:
// https://github.com/Microsoft/BotFramwork-Emulator
//
// Copyright (c) Microsoft Corporation
// All rights reserved.
//
// MIT License:
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//




const CSS = Object(glamor__WEBPACK_IMPORTED_MODULE_1__["css"])({
    fontFamily: _styles__WEBPACK_IMPORTED_MODULE_3__["Fonts"].FONT_FAMILY_DEFAULT,
    fontSize: '26px',
    fontWeight: 'normal',
    margin: 0,
    padding: 0
});
const MediumHeader = (props) => react__WEBPACK_IMPORTED_MODULE_0__["createElement"]("h2", Object.assign({ className: 'medium-header-comp ' + (props.className || '') }, CSS),
    react__WEBPACK_IMPORTED_MODULE_0__["createElement"](_layout__WEBPACK_IMPORTED_MODULE_2__["TruncateText"], null, props.children));
//# sourceMappingURL=mediumHeader.js.map

/***/ }),

/***/ "../../sdk/ui-react/built/widget/modal.js":
/*!*********************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/packages/sdk/ui-react/built/widget/modal.js ***!
  \*********************************************************************************************************/
/*! exports provided: Modal, ModalContent, ModalActions */
/*! all exports used */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Modal", function() { return Modal; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ModalContent", function() { return ModalContent; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ModalActions", function() { return ModalActions; });
/* harmony import */ var glamor__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! glamor */ "../../../node_modules/glamor/lib/index.js");
/* harmony import */ var glamor__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(glamor__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "../../../node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _styles__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../styles */ "../../sdk/ui-react/built/styles/index.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils */ "../../sdk/ui-react/built/utils/index.js");
//
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.
//
// Microsoft Bot Framework: http://botframework.com
//
// Bot Framework Emulator Github:
// https://github.com/Microsoft/BotFramwork-Emulator
//
// Copyright (c) Microsoft Corporation
// All rights reserved.
//
// MIT License:
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//





class Modal extends react__WEBPACK_IMPORTED_MODULE_1__["Component"] {
    constructor(props, context) {
        super(props, context);
    }
    render() {
        const { cssOverrides = {}, children, detailedDescription = '' } = this.props;
        return (react__WEBPACK_IMPORTED_MODULE_1__["createElement"]("section", Object.assign({}, Object(glamor__WEBPACK_IMPORTED_MODULE_0__["merge"])(this.modalCss, cssOverrides)),
            this.sectionHeader,
            react__WEBPACK_IMPORTED_MODULE_1__["createElement"]("div", { className: "modalContentContainer" },
                react__WEBPACK_IMPORTED_MODULE_1__["createElement"]("p", null, detailedDescription),
                Object(_utils__WEBPACK_IMPORTED_MODULE_3__["filterChildren"])(children, child => Object(_utils__WEBPACK_IMPORTED_MODULE_3__["hmrSafeNameComparison"])(child.type, ModalContent))),
            react__WEBPACK_IMPORTED_MODULE_1__["createElement"]("div", { className: "buttonGroup" }, Object(_utils__WEBPACK_IMPORTED_MODULE_3__["filterChildren"])(children, child => Object(_utils__WEBPACK_IMPORTED_MODULE_3__["hmrSafeNameComparison"])(child.type, ModalActions)))));
    }
    get sectionHeader() {
        const { closeButtonCssOverrides = {}, title = '', cancel } = this.props;
        return (react__WEBPACK_IMPORTED_MODULE_1__["createElement"]("header", null,
            react__WEBPACK_IMPORTED_MODULE_1__["createElement"]("button", Object.assign({}, Object(glamor__WEBPACK_IMPORTED_MODULE_0__["merge"])(this.closeButtonCss, closeButtonCssOverrides), { onClick: cancel }),
                react__WEBPACK_IMPORTED_MODULE_1__["createElement"]("svg", { xmlns: 'http://www.w3.org/2000/svg', width: '16', height: '16', viewBox: '1 1 16 16' },
                    react__WEBPACK_IMPORTED_MODULE_1__["createElement"]("g", null,
                        react__WEBPACK_IMPORTED_MODULE_1__["createElement"]("polygon", { points: "14.1015625 2.6015625 8.7109375 8 14.1015625 13.3984375 13.3984375 14.1015625 8 8.7109375 2.6015625 14.1015625 1.8984375 13.3984375 7.2890625 8 1.8984375 2.6015625 2.6015625 1.8984375 8 7.2890625 13.3984375 1.8984375" })))),
            react__WEBPACK_IMPORTED_MODULE_1__["createElement"]("h3", null, title)));
    }
    get modalCss() {
        return {
            boxSizing: 'border-box',
            color: '#333',
            background: '#f4f4f4',
            position: 'relative',
            '> header': {
                '> h3': {
                    fontFamily: _styles__WEBPACK_IMPORTED_MODULE_2__["Fonts"].FONT_FAMILY_DEFAULT,
                    fontSize: '19px',
                    fontWeight: 200,
                    margin: 0,
                    padding: '28px 24px 24px'
                }
            },
            '& .modalContentContainer': {
                padding: '0 24px',
                '> p': {
                    fontSize: '13px',
                    margin: '0',
                    paddingBottom: '20px'
                },
                ' > ul': {
                    listStyle: 'none',
                    margin: 0,
                    padding: '5px 0 0 0',
                    maxHeight: '96px',
                    overflow: 'auto',
                    '> li': {
                        padding: '1px 11px',
                        backgroundColor: '#efefef',
                        display: 'flex',
                        '& span': {
                            color: '#777',
                            width: '100%',
                            '&:last-child': {
                                textAlign: 'right',
                                width: '75%',
                                paddingRight: '9px'
                            }
                        },
                        '&:nth-child(odd)': {
                            backgroundColor: 'white'
                        },
                    }
                }
            },
            '& .buttonGroup': {
                position: 'absolute',
                right: '24px',
                bottom: '32px',
                '> button + button': {
                    marginLeft: '8px'
                }
            },
            '& .selectAll': {
                padding: '5px 11px',
            },
            '& .checkboxOverride': {
                display: 'inline-block',
                width: '150px',
                '> label': {
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '130px',
                    display: 'inline-block'
                }
            }
        };
    }
    get closeButtonCss() {
        return {
            cursor: 'pointer',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            margin: 0,
            padding: 0,
            position: 'absolute',
            right: '12px',
            top: '12px',
            width: '16px',
            height: '16px',
            '> svg': {
                fill: _styles__WEBPACK_IMPORTED_MODULE_2__["Colors"].C3,
                '&:hover': {
                    fill: _styles__WEBPACK_IMPORTED_MODULE_2__["Colors"].C12
                }
            }
        };
    }
}
const ModalContent = props => props.children;
const ModalActions = props => props.children;
//# sourceMappingURL=modal.js.map

/***/ }),

/***/ "../../sdk/ui-react/built/widget/numberInputField.js":
/*!********************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/packages/sdk/ui-react/built/widget/numberInputField.js ***!
  \********************************************************************************************************************/
/*! exports provided: NumberInputField */
/*! all exports used */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "NumberInputField", function() { return NumberInputField; });
/* harmony import */ var glamor__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! glamor */ "../../../node_modules/glamor/lib/index.js");
/* harmony import */ var glamor__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(glamor__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "../../../node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _layout__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../layout */ "../../sdk/ui-react/built/layout/index.js");
/* harmony import */ var _styles__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../styles */ "../../sdk/ui-react/built/styles/index.js");
//
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.
//
// Microsoft Bot Framework: http://botframework.com
//
// Bot Framework Emulator Github:
// https://github.com/Microsoft/BotFramwork-Emulator
//
// Copyright (c) Microsoft Corporation
// All rights reserved.
//
// MIT License:
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//




const CSS = Object(glamor__WEBPACK_IMPORTED_MODULE_0__["css"])({
    position: 'relative',
    display: 'flex',
    flexFlow: 'column nowrap',
    width: '100%',
    paddingBottom: '22px',
    fontFamily: _styles__WEBPACK_IMPORTED_MODULE_3__["Fonts"].FONT_FAMILY_DEFAULT,
    '& > *': {
        flexShrink: 0
    },
    '& > input': {
        height: '22px',
        padding: '4px 8px',
        boxSizing: 'border-box',
        width: '100%',
        '&[aria-invalid="true"]': {
            border: `1px solid ${_styles__WEBPACK_IMPORTED_MODULE_3__["Colors"].C15}`
        }
    },
    '& > .number-input-label': {
        fontSize: '12px',
        height: '16px',
        lineHeight: '16px',
        marginBottom: '6px'
    },
    '& .error': {
        color: _styles__WEBPACK_IMPORTED_MODULE_3__["Colors"].C15,
    },
    '& > .required::after': {
        content: '*',
        color: _styles__WEBPACK_IMPORTED_MODULE_3__["Colors"].C15,
        paddingLeft: '3px'
    },
    '> sub': {
        transition: 'opacity .2s, ease-out',
        opacity: '0',
        position: 'absolute',
        bottom: '6px'
    }
});
class NumberInputField extends react__WEBPACK_IMPORTED_MODULE_1__["Component"] {
    constructor(props, context) {
        super(props, context);
    }
    get labelElement() {
        const { label, required, error } = this.props;
        if (!label) {
            return null;
        }
        let className = 'number-input-label';
        if (required) {
            className += ' required';
        }
        if (error) {
            className += ' error';
        }
        return (react__WEBPACK_IMPORTED_MODULE_1__["createElement"](_layout__WEBPACK_IMPORTED_MODULE_2__["TruncateText"], { className: className }, label));
    }
    render() {
        return (react__WEBPACK_IMPORTED_MODULE_1__["createElement"]("div", Object.assign({ className: 'number-input-comp ' + (this.props.className || '') }, CSS),
            this.labelElement,
            react__WEBPACK_IMPORTED_MODULE_1__["createElement"]("input", { type: "number", className: this.props.inputClass || '', value: this.props.value, "aria-invalid": !!this.props.error, onChange: this.props.onChange, placeholder: this.props.placeholder, readOnly: this.props.readOnly, required: this.props.required, max: this.props.max, min: this.props.min }),
            react__WEBPACK_IMPORTED_MODULE_1__["createElement"]("sub", { style: { opacity: +(!!this.props.error) }, className: "error" }, this.props.error)));
    }
}
//# sourceMappingURL=numberInputField.js.map

/***/ }),

/***/ "../../sdk/ui-react/built/widget/primaryButton.js":
/*!*****************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/packages/sdk/ui-react/built/widget/primaryButton.js ***!
  \*****************************************************************************************************************/
/*! exports provided: PrimaryButton */
/*! all exports used */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PrimaryButton", function() { return PrimaryButton; });
/* harmony import */ var glamor__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! glamor */ "../../../node_modules/glamor/lib/index.js");
/* harmony import */ var glamor__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(glamor__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "../../../node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _layout__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../layout */ "../../sdk/ui-react/built/layout/index.js");
/* harmony import */ var _styles__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../styles */ "../../sdk/ui-react/built/styles/index.js");
//
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.
//
// Microsoft Bot Framework: http://botframework.com
//
// Bot Framework Emulator Github:
// https://github.com/Microsoft/BotFramwork-Emulator
//
// Copyright (c) Microsoft Corporation
// All rights reserved.
//
// MIT License:
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//




const CSS = Object(glamor__WEBPACK_IMPORTED_MODULE_0__["css"])({
    fontFamily: _styles__WEBPACK_IMPORTED_MODULE_3__["Fonts"].FONT_FAMILY_DEFAULT,
    border: 0,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    display: 'inline-block',
    width: 'auto',
    minWidth: '80px',
    height: '22px',
    boxSizing: 'border-box',
    fontSize: '11px',
    '&:disabled': {
        cursor: 'default'
    },
    '& > .primary-button-text': {
        lineHeight: '22px'
    }
});
const PRIMARY_CSS = Object(glamor__WEBPACK_IMPORTED_MODULE_0__["css"])({
    backgroundColor: _styles__WEBPACK_IMPORTED_MODULE_3__["Colors"].BUTTON_PRIMARY_BACKGROUND_DARK,
    color: _styles__WEBPACK_IMPORTED_MODULE_3__["Colors"].BUTTON_PRIMARY_FOREGROUND_DARK,
    '&:hover': {
        backgroundColor: _styles__WEBPACK_IMPORTED_MODULE_3__["Colors"].BUTTON_PRIMARY_HOVER_DARK
    },
    '&:focus': {
        backgroundColor: _styles__WEBPACK_IMPORTED_MODULE_3__["Colors"].BUTTON_PRIMARY_FOCUS_DARK
    },
    '&:active': {
        backgroundColor: _styles__WEBPACK_IMPORTED_MODULE_3__["Colors"].BUTTON_PRIMARY_ACTIVE_DARK
    },
    '&:disabled': {
        backgroundColor: _styles__WEBPACK_IMPORTED_MODULE_3__["Colors"].BUTTON_PRIMARY_DISABLED_BACKGROUND_DARK,
        color: _styles__WEBPACK_IMPORTED_MODULE_3__["Colors"].BUTTON_PRIMARY_DISABLED_FOREGROUND_DARK,
        cursor: 'default'
    }
});
const SECONDARY_CSS = Object(glamor__WEBPACK_IMPORTED_MODULE_0__["css"])({
    backgroundColor: _styles__WEBPACK_IMPORTED_MODULE_3__["Colors"].BUTTON_SECONDARY_BACKGROUND_DARK,
    color: _styles__WEBPACK_IMPORTED_MODULE_3__["Colors"].BUTTON_SECONDARY_FOREGROUND_DARK,
    '&:hover': {
        backgroundColor: _styles__WEBPACK_IMPORTED_MODULE_3__["Colors"].BUTTON_SECONDARY_HOVER_DARK
    },
    '&:focus': {
        backgroundColor: _styles__WEBPACK_IMPORTED_MODULE_3__["Colors"].BUTTON_SECONDARY_FOCUS_DARK
    },
    '&:active': {
        backgroundColor: _styles__WEBPACK_IMPORTED_MODULE_3__["Colors"].BUTTON_SECONDARY_ACTIVE_DARK
    },
    '&:disabled': {
        backgroundColor: _styles__WEBPACK_IMPORTED_MODULE_3__["Colors"].BUTTON_SECONDARY_DISABLED_BACKGROUND_DARK,
        color: _styles__WEBPACK_IMPORTED_MODULE_3__["Colors"].BUTTON_SECONDARY_DISABLED_FOREGROUND_DARK,
        cursor: 'default'
    }
});
class PrimaryButton extends react__WEBPACK_IMPORTED_MODULE_1__["Component"] {
    constructor(props, context) {
        super(props, context);
    }
    render() {
        const colorClass = this.props.secondary ? SECONDARY_CSS : PRIMARY_CSS;
        return (react__WEBPACK_IMPORTED_MODULE_1__["createElement"]("button", { className: [CSS, colorClass, this.props.className].filter(name => !!name).join(' '), onClick: this.props.onClick, disabled: this.props.disabled },
            react__WEBPACK_IMPORTED_MODULE_1__["createElement"](_layout__WEBPACK_IMPORTED_MODULE_2__["TruncateText"], { className: "primary-button-text" }, this.props.text)));
    }
}
//# sourceMappingURL=primaryButton.js.map

/***/ }),

/***/ "../../sdk/ui-react/built/widget/smallHeader.js":
/*!***************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/packages/sdk/ui-react/built/widget/smallHeader.js ***!
  \***************************************************************************************************************/
/*! exports provided: SmallHeader */
/*! all exports used */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SmallHeader", function() { return SmallHeader; });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "../../../node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var glamor__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! glamor */ "../../../node_modules/glamor/lib/index.js");
/* harmony import */ var glamor__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(glamor__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _layout__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../layout */ "../../sdk/ui-react/built/layout/index.js");
/* harmony import */ var _styles__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../styles */ "../../sdk/ui-react/built/styles/index.js");
//
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.
//
// Microsoft Bot Framework: http://botframework.com
//
// Bot Framework Emulator Github:
// https://github.com/Microsoft/BotFramwork-Emulator
//
// Copyright (c) Microsoft Corporation
// All rights reserved.
//
// MIT License:
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//




const CSS = Object(glamor__WEBPACK_IMPORTED_MODULE_1__["css"])({
    fontFamily: _styles__WEBPACK_IMPORTED_MODULE_3__["Fonts"].FONT_FAMILY_DEFAULT,
    fontSize: '19px',
    fontWeight: 200,
    margin: 0,
    marginBottom: '4px',
    marginTop: '16px',
    padding: 0
});
const SmallHeader = (props) => react__WEBPACK_IMPORTED_MODULE_0__["createElement"]("h3", Object.assign({ className: 'small-header-comp ' + (props.className || '') }, CSS),
    react__WEBPACK_IMPORTED_MODULE_0__["createElement"](_layout__WEBPACK_IMPORTED_MODULE_2__["TruncateText"], null, props.children));
//# sourceMappingURL=smallHeader.js.map

/***/ }),

/***/ "../../sdk/ui-react/built/widget/textInputField.js":
/*!******************************************************************************************************************!*\
  !*** C:/Users/juwilaby/Documents/dev/BotFramework-Emulator/packages/sdk/ui-react/built/widget/textInputField.js ***!
  \******************************************************************************************************************/
/*! exports provided: TextInputField */
/*! all exports used */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TextInputField", function() { return TextInputField; });
/* harmony import */ var glamor__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! glamor */ "../../../node_modules/glamor/lib/index.js");
/* harmony import */ var glamor__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(glamor__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "../../../node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _layout__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../layout */ "../../sdk/ui-react/built/layout/index.js");
/* harmony import */ var _styles__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../styles */ "../../sdk/ui-react/built/styles/index.js");
//
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.
//
// Microsoft Bot Framework: http://botframework.com
//
// Bot Framework Emulator Github:
// https://github.com/Microsoft/BotFramwork-Emulator
//
// Copyright (c) Microsoft Corporation
// All rights reserved.
//
// MIT License:
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//




const CSS = Object(glamor__WEBPACK_IMPORTED_MODULE_0__["css"])({
    position: 'relative',
    display: 'flex',
    flexFlow: 'column nowrap',
    width: '100%',
    paddingBottom: '22px',
    fontFamily: _styles__WEBPACK_IMPORTED_MODULE_3__["Fonts"].FONT_FAMILY_DEFAULT,
    '& > *': {
        flexShrink: 0
    },
    '& > input': {
        transition: 'border .2s, ease-out',
        height: '22px',
        padding: '4px 8px',
        boxSizing: 'border-box',
        border: '1px solid transparent',
        width: '100%',
        '&[aria-invalid="true"]': {
            border: `1px solid ${_styles__WEBPACK_IMPORTED_MODULE_3__["Colors"].C15}`
        }
    },
    '& > .text-input-label': {
        fontSize: '12px',
        height: '16px',
        lineHeight: '16px',
        marginBottom: '6px'
    },
    '& .error': {
        color: _styles__WEBPACK_IMPORTED_MODULE_3__["Colors"].C15,
    },
    '& > .required::after': {
        content: '*',
        color: _styles__WEBPACK_IMPORTED_MODULE_3__["Colors"].C15,
        paddingLeft: '3px'
    },
    '> sub': {
        transition: 'opacity .2s, ease-out',
        opacity: '0',
        position: 'absolute',
        bottom: '6px'
    }
});
class TextInputField extends react__WEBPACK_IMPORTED_MODULE_1__["Component"] {
    constructor(props, context) {
        super(props, context);
    }
    get labelElement() {
        const { label, required, error } = this.props;
        if (!label) {
            return null;
        }
        let className = 'text-input-label';
        if (required) {
            className += ' required';
        }
        if (error) {
            className += ' error';
        }
        return (react__WEBPACK_IMPORTED_MODULE_1__["createElement"](_layout__WEBPACK_IMPORTED_MODULE_2__["TruncateText"], { className: className }, label));
    }
    render() {
        const { inputClass = '', className = '', required = false, disabled = false, type = 'text', value = '', readOnly = false, error = '', inputAttributes = {}, placeholder = '', onChange } = this.props;
        return (react__WEBPACK_IMPORTED_MODULE_1__["createElement"]("div", Object.assign({ className: 'text-input-comp ' + className }, CSS),
            this.labelElement,
            react__WEBPACK_IMPORTED_MODULE_1__["createElement"]("input", Object.assign({ "aria-invalid": !!error, type: type, className: inputClass, value: value, onChange: onChange, disabled: disabled, placeholder: placeholder, readOnly: readOnly, required: required }, inputAttributes)),
            react__WEBPACK_IMPORTED_MODULE_1__["createElement"]("sub", { style: { opacity: +(!!error) }, className: "error" }, error)));
    }
}
//# sourceMappingURL=textInputField.js.map

/***/ }),

/***/ "../shared/built/activityVisitor.js":
/*!******************************************!*\
  !*** ../shared/built/activityVisitor.js ***!
  \******************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const sdk_shared_1 = __webpack_require__(/*! @bfemulator/sdk-shared */ "../../sdk/shared/built/index.js");
class ActivityVisitor {
    traverseActivity(activity) {
        let messageActivity = activity;
        if (messageActivity) {
            this.traverseMessageActivity(messageActivity);
        }
    }
    traverseMessageActivity(messageActivity) {
        if (messageActivity) {
            if (messageActivity.attachments) {
                messageActivity.attachments.forEach(attachment => this.traverseAttachment(attachment));
            }
        }
    }
    traverseAttachment(attachment) {
        if (attachment) {
            switch (attachment.contentType) {
                case sdk_shared_1.AttachmentContentTypes.animationCard:
                case sdk_shared_1.AttachmentContentTypes.videoCard:
                case sdk_shared_1.AttachmentContentTypes.audioCard:
                    this.traverseMediaCard(attachment.content);
                    break;
                case sdk_shared_1.AttachmentContentTypes.heroCard:
                case sdk_shared_1.AttachmentContentTypes.thumbnailCard:
                    this.traverseThumbnailCard(attachment.content);
                    break;
                case sdk_shared_1.AttachmentContentTypes.receiptCard:
                    this.traverseReceiptCard(attachment.content);
                    break;
                case sdk_shared_1.AttachmentContentTypes.signInCard:
                    this.traverseSignInCard(attachment.content);
                    break;
            }
        }
    }
    traverseMediaCard(mediaCard) {
        if (mediaCard) {
            this.traverseCardImage(mediaCard.image);
            this.traverseButtons(mediaCard.buttons);
        }
    }
    traverseThumbnailCard(thumbnailCard) {
        this.visitCardAction(thumbnailCard.tap);
        this.traverseButtons(thumbnailCard.buttons);
        this.traverseCardImages(thumbnailCard.images);
    }
    traverseSignInCard(signInCard) {
        this.traverseButtons(signInCard.buttons);
    }
    traverseReceiptCard(receiptCard) {
        this.visitCardAction(receiptCard.tap);
        this.traverseButtons(receiptCard.buttons);
    }
    traverseButtons(buttons) {
        if (buttons) {
            buttons.forEach(cardAction => this.visitCardAction(cardAction));
        }
    }
    traverseCardImages(cardImages) {
        if (cardImages) {
            cardImages.forEach(image => {
                this.traverseCardImage(image);
            });
        }
    }
    traverseCardImage(cardImage) {
        if (cardImage) {
            this.visitCardAction(cardImage.tap);
        }
    }
}
exports.ActivityVisitor = ActivityVisitor;
//# sourceMappingURL=activityVisitor.js.map

/***/ }),

/***/ "../shared/built/index.js":
/*!********************************!*\
  !*** ../shared/built/index.js ***!
  \********************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = __webpack_require__(/*! tslib */ "../../../node_modules/tslib/tslib.es6.js");
tslib_1.__exportStar(__webpack_require__(/*! ./paymentEncoder */ "../shared/built/paymentEncoder.js"), exports);
tslib_1.__exportStar(__webpack_require__(/*! ./activityVisitor */ "../shared/built/activityVisitor.js"), exports);
tslib_1.__exportStar(__webpack_require__(/*! ./utils */ "../shared/built/utils.js"), exports);
tslib_1.__exportStar(__webpack_require__(/*! ./platform */ "../shared/built/platform/index.js"), exports);
tslib_1.__exportStar(__webpack_require__(/*! ./types */ "../shared/built/types/index.js"), exports);
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "../shared/built/paymentEncoder.js":
/*!*****************************************!*\
  !*** ../shared/built/paymentEncoder.js ***!
  \*****************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const activityVisitor_1 = __webpack_require__(/*! ./activityVisitor */ "../shared/built/activityVisitor.js");
class PaymentEncoder extends activityVisitor_1.ActivityVisitor {
    visitCardAction(cardAction) {
        if (cardAction && cardAction.type === 'payment') {
            let paymentRequest = cardAction.value;
            let url = PaymentEncoder.PaymentEmulatorUrlProtocol + '//' + JSON.stringify(paymentRequest);
            cardAction.type = 'openUrl';
            cardAction.value = url;
        }
    }
}
PaymentEncoder.PaymentEmulatorUrlProtocol = "payment:";
exports.PaymentEncoder = PaymentEncoder;
//# sourceMappingURL=paymentEncoder.js.map

/***/ }),

/***/ "../shared/built/platform/index.js":
/*!*****************************************!*\
  !*** ../shared/built/platform/index.js ***!
  \*****************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = __webpack_require__(/*! tslib */ "../../../node_modules/tslib/tslib.es6.js");
tslib_1.__exportStar(__webpack_require__(/*! ./log */ "../shared/built/platform/log/index.js"), exports);
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "../shared/built/platform/log/index.js":
/*!*********************************************!*\
  !*** ../shared/built/platform/log/index.js ***!
  \*********************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["Debug"] = 0] = "Debug";
    LogLevel[LogLevel["Info"] = 1] = "Info";
    LogLevel[LogLevel["Warn"] = 2] = "Warn";
    LogLevel[LogLevel["Error"] = 3] = "Error";
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));
;
function textItem(level, text) {
    return {
        type: "text",
        payload: {
            level,
            text
        }
    };
}
exports.textItem = textItem;
function externalLinkItem(text, hyperlink) {
    return {
        type: "external-link",
        payload: {
            text,
            hyperlink
        }
    };
}
exports.externalLinkItem = externalLinkItem;
function inspectableObjectItem(text, obj) {
    return {
        type: "inspectable-object",
        payload: {
            text,
            obj
        }
    };
}
exports.inspectableObjectItem = inspectableObjectItem;
function summaryTextItem(obj) {
    return {
        type: "summary-text",
        payload: {
            obj
        }
    };
}
exports.summaryTextItem = summaryTextItem;
function appSettingsItem(text) {
    return {
        type: "open-app-settings",
        payload: {
            text
        }
    };
}
exports.appSettingsItem = appSettingsItem;
function exceptionItem(err) {
    return {
        type: "exception",
        payload: {
            err
        }
    };
}
exports.exceptionItem = exceptionItem;
function logEntry(...items) {
    return {
        timestamp: Date.now(),
        items: [...items]
    };
}
exports.logEntry = logEntry;
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "../shared/built/types/index.js":
/*!**************************************!*\
  !*** ../shared/built/types/index.js ***!
  \**************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = __webpack_require__(/*! tslib */ "../../../node_modules/tslib/tslib.es6.js");
tslib_1.__exportStar(__webpack_require__(/*! ./responseTypes */ "../shared/built/types/responseTypes.js"), exports);
tslib_1.__exportStar(__webpack_require__(/*! ./serverSettingsTypes */ "../shared/built/types/serverSettingsTypes.js"), exports);
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "../shared/built/types/responseTypes.js":
/*!**********************************************!*\
  !*** ../shared/built/types/responseTypes.js ***!
  \**********************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorCodes = {
    ServiceError: "ServiceError",
    BadArgument: "BadArgument",
    BadSyntax: "BadSyntax",
    MissingProperty: "MissingProperty",
    MessageSizeTooBig: "MessageSizeTooBig"
};
function createResourceResponse(id) {
    return { id: id };
}
exports.createResourceResponse = createResourceResponse;
function createConversationResponse(id, activityId) {
    let response = { id: id };
    if (activityId != null)
        response.activityId = activityId;
    return response;
}
exports.createConversationResponse = createConversationResponse;
function createErrorResponse(code, message) {
    return {
        error: {
            code: code,
            message: message
        }
    };
}
exports.createErrorResponse = createErrorResponse;
function createAPIException(statusCode, code, message) {
    return {
        statusCode: statusCode,
        error: createErrorResponse(code, message)
    };
}
exports.createAPIException = createAPIException;
//# sourceMappingURL=responseTypes.js.map

/***/ }),

/***/ "../shared/built/types/serverSettingsTypes.js":
/*!****************************************************!*\
  !*** ../shared/built/types/serverSettingsTypes.js ***!
  \****************************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class Settings {
    constructor(settings) {
        Object.assign(this, settings);
    }
}
exports.Settings = Settings;
exports.frameworkDefault = {
    ngrokPath: '',
    bypassNgrokLocalhost: true,
    stateSizeLimit: 64,
    use10Tokens: false,
    useCodeValidation: false,
    localhost: 'localhost',
    locale: ''
};
exports.windowStateDefault = {
    zoomLevel: 0,
    width: 800,
    height: 600,
    left: 100,
    top: 50
};
exports.usersDefault = {
    currentUserId: 'default-user',
    usersById: {
        'default-user': {
            id: 'default-user',
            name: 'User'
        }
    }
};
exports.settingsDefault = {
    framework: exports.frameworkDefault,
    bots: [
        {
            "botId": "default-bot",
            "botUrl": "http://localhost:3978/api/messages",
            "msaAppId": "",
            "msaPassword": "",
            "locale": ""
        }
    ],
    windowState: exports.windowStateDefault,
    users: exports.usersDefault
};
//# sourceMappingURL=serverSettingsTypes.js.map

/***/ }),

/***/ "../shared/built/utils.js":
/*!********************************!*\
  !*** ../shared/built/utils.js ***!
  \********************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const sdk_shared_1 = __webpack_require__(/*! @bfemulator/sdk-shared */ "../../sdk/shared/built/index.js");
const schema_1 = __webpack_require__(/*! msbot/bin/schema */ "../../../node_modules/msbot/bin/schema.js");
function isObject(item) {
    return (item && typeof item === 'object' && !Array.isArray(item) && item !== null);
}
exports.isObject = isObject;
function mergeDeep(target, source) {
    let output = Object.assign({}, target);
    {
        Object.keys(source).forEach(key => {
            if (isObject(source[key])) {
                if (!(key in target))
                    Object.assign(output, { [key]: source[key] });
                else
                    output[key] = mergeDeep(target[key], source[key]);
            }
            else {
                Object.assign(output, { [key]: source[key] });
            }
        });
    }
    return output;
}
exports.mergeDeep = mergeDeep;
function deepCopySlow(obj) {
    return JSON.parse(JSON.stringify(obj));
}
exports.deepCopySlow = deepCopySlow;
exports.safeStringify = (o, space = undefined) => {
    let cache = [];
    if (typeof o !== 'object')
        return `${o}`;
    return JSON.stringify(o, function (key, value) {
        if (typeof value === 'object' && value !== null) {
            if (cache.indexOf(value) !== -1) {
                return;
            }
            cache.push(value);
        }
        return value;
    }, space);
};
exports.approximateObjectSize = (object, cache = []) => {
    switch (typeof object) {
        case 'boolean':
            return 4;
        case 'number':
            return 8;
        case 'string':
            return object.length * 2;
        case 'object':
            let bytes = 0;
            cache.push(object);
            for (let i in object) {
                let value = object[i];
                if (typeof value === 'object' && value !== null) {
                    if (cache.indexOf(value) !== -1) {
                        continue;
                    }
                    cache.push(value);
                }
                bytes += exports.approximateObjectSize(value, cache);
            }
            return bytes;
        default:
            return 0;
    }
};
exports.getBotDisplayName = (bot = exports.newBot()) => {
    return bot.name || bot.path || (exports.getFirstBotEndpoint(bot) ? exports.getFirstBotEndpoint(bot).endpoint : null) || '¯\\_(ツ)_/¯';
};
exports.newBot = (...bots) => {
    return Object.assign({}, {
        name: '',
        description: '',
        services: []
    }, ...bots);
};
exports.newEndpoint = (...endpoints) => {
    return Object.assign({}, {
        type: schema_1.ServiceType.Endpoint,
        name: '',
        id: sdk_shared_1.uniqueId(),
        appId: '',
        appPassword: '',
        endpoint: 'http://localhost:3978/api/messages'
    }, ...endpoints);
};
exports.addIdToBotEndpoints = (bot) => {
    bot.services.map(service => {
        if (service.type === schema_1.ServiceType.Endpoint && !service.id) {
            service.id = sdk_shared_1.uniqueId();
            return service;
        }
        return service;
    });
    return bot;
};
exports.getFirstBotEndpoint = (bot) => {
    if (bot.services && bot.services.length) {
        return bot.services.find(service => service.type === schema_1.ServiceType.Endpoint);
    }
    return null;
};
//# sourceMappingURL=utils.js.map

/***/ }),

/***/ "./src/shared.ts":
/*!***********************!*\
  !*** ./src/shared.ts ***!
  \***********************/
/*! no exports provided */
/*! all exports used */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _bfemulator_app_shared__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @bfemulator/app-shared */ "../shared/built/index.js");
/* harmony import */ var _bfemulator_app_shared__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_bfemulator_app_shared__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _bfemulator_custom_botframework_webchat__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @bfemulator/custom-botframework-webchat */ "../../custom-botframework-webchat/built/BotChat.js");
/* harmony import */ var _bfemulator_custom_botframework_webchat__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_bfemulator_custom_botframework_webchat__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _bfemulator_ui_react__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @bfemulator/ui-react */ "../../sdk/ui-react/built/index.js");
/* harmony import */ var _bfemulator_sdk_shared__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @bfemulator/sdk-shared */ "../../sdk/shared/built/index.js");
/* harmony import */ var _bfemulator_sdk_shared__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_bfemulator_sdk_shared__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _bfemulator_sdk_client__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @bfemulator/sdk-client */ "../../sdk/client/built/index.js");
/* harmony import */ var _bfemulator_sdk_client__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_bfemulator_sdk_client__WEBPACK_IMPORTED_MODULE_4__);







/***/ }),

/***/ 0:
/*!******************!*\
  !*** dll shared ***!
  \******************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__;

/***/ }),

/***/ "dll-reference vendors_f58bfc701f0aa278ec3b":
/*!***********************************************!*\
  !*** external "vendors_f58bfc701f0aa278ec3b" ***!
  \***********************************************/
/*! no static exports found */
/*! all exports used */
/***/ (function(module, exports) {

module.exports = vendors_f58bfc701f0aa278ec3b;

/***/ })

/******/ });
//# sourceMappingURL=shared.js.map