'use strict';

var pad              = require('es5-ext/number/#/pad')
  , ensureString     = require('es5-ext/object/validate-stringifiable-value')
  , deferred         = require('deferred')
  , path             = require('path')
  , createReadStream = require('fs').createReadStream
  , stat             = require('fs2/stat')
  , writeFile        = require('fs2/write-file')
  , parseSize        = require('human-format').parse

  , basename = path.basename, dirname = path.dirname, resolve = path.resolve
  , stringify = JSON.stringify;

module.exports = function (filename/*, options*/) {
	var options = Object(arguments[1]), pieceSize = 100 * 1000, destPath, pieceBaseName;

	filename = resolve(ensureString(filename));
	pieceBaseName = basename(filename);

	if (options.pieceSize) {
		try {
			pieceSize = parseSize(String(options.pieceSize));
		} catch (e) {
			throw new Error("Unregonized pieceSize format: " + stringify(String(options.pieceSize)));
		}
	}
	if (options.destPath) destPath = resolve(String(options.destPath));
	else destPath = dirname(filename);

	return stat(filename)(function (stats) {
		var def = deferred(), read, piece = '', count = 0, promises = [], writePiece, resolvePromise
		  , padSize = String(Math.ceil(stats.size / pieceSize)).length;

		resolvePromise = function () { def.resolve(deferred.map(promises))(Function.prototype); };

		writePiece = function () {
			promises.push(writeFile(resolve(destPath, pad.call(++count, padSize) + '-' + pieceBaseName),
				piece.slice(0, pieceSize)).aside(null, resolvePromise));
			piece = piece.slice(pieceSize);
			if (piece.length > pieceSize) writePiece();
		};

		try {
			read = createReadStream(filename, { encoding: 'utf8' });
		} catch (e) {
			return def.reject(e);
		}
		read.on('data', function (data) {
			piece += String(data);
			if (piece.length > pieceSize) writePiece();
		});
		read.on('error', function (e) {
			if (promises) {
				promises.push(deferred.reject(e));
				resolvePromise();
				return;
			}
			def.reject(e);
		});
		read.on('close', function () {
			writePiece();
			resolvePromise();
		});

		return def.promise;
	});
};
