'use strict';

var deferred = require('deferred')
  , resolve  = require('path').resolve
  , readFile = require('fs2/read-file')
  , readdir  = require('fs2/readdir')
  , unlink   = require('fs2/unlink')

  , pgPath = resolve(__dirname, '__playground');

module.exports = function (t, a, d) {
	t(resolve(pgPath, 'test.file'), { pieceSize: 1 })(function () {
		return readFile(resolve(pgPath, 'test.file'))(function (content) {
			content = String(content);
			return readdir(pgPath)(function (files) {
				var expectedFiles = [], count = content.length + 1;
				while (--count) expectedFiles.push(count + '-test.file');
				a.deep(files.sort(), ['test.file'].concat(expectedFiles).sort());
				expectedFiles.sort();
				return deferred.map(expectedFiles, function (filename, index) {
					return readFile(resolve(pgPath, filename))(function (pieceContent) {
						a(String(pieceContent), content[index]);
						return unlink(resolve(pgPath, filename));
					});
				});
			});
		});
	}).done(function () { d(); }, d);
};
