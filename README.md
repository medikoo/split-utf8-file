# split-utf8-file

## Splits utf8 encoded file into smaller files of fixed size

Use case: Cut minified JS file into smaller files, so they can be analyzed within code editors
That cannot be addressed reliably by Linux's [`split`](http://linux.die.net/man/1/split) as it
doesn't respect UTF8 chars encoding.

### Installation

	$ npm install -g split-utf8-file

### Usage

	split-utf8-file filename.js

#### Options

- `pieceSize` - Size of file piece (default: 100k)
- `destPath` - Destination directory path (default: same as of input file)
