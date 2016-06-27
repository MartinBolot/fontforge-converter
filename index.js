var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var fs = require('fs');
var exec = require('child_process').exec;
var cors = require('cors');
var portConfig = require('./config.port.js');

var outputDir = 'output/';
var tempDir = 'tmp/';

app.use(cors({
	origin:['https://newui.prototypo.io','https://dev.prototypo.io','https://app.prototypo.io', 'http://localhost:9000', 'https://beta.prototypo.io']
}));

app.post('/:font/:user',bodyParser.raw({type:'application/otf'}), function(req, res) {

	var fileName = req.params.user + '_' + req.params.font + (new Date()).getTime();
	fs.writeFile(tempDir + fileName + '.otf',req.body,
		function(err) {

			exec('./removeOverlap.pe ' + fileName + '.otf', function(err) {
				if (err) {
					console.log('Error while converting font with fileName: '+ fileName + err.message);
					fs.unlinkSync(tempDir + fileName + '.otf');
					return res.sendStatus(500);
				}

				res.download(outputDir + fileName + '.otf', function() {
					console.log('Successfully converted font with fileName: '+ fileName);
					//fs.unlinkSync(outputDir + fileName + '.otf');
					//fs.unlinkSync(tempDir + fileName + '.otf');
				});
			});
		});
});

app.post('/:fontFam/:fontStyle/:user', bodyParser.raw({type:'application/otf'}), handleDownloadPostRequest);
app.post('/:fontFam/:fontStyle/:user/:template', bodyParser.raw({type:'application/otf'}), handleDownloadPostRequest);
app.post('/:fontFam/:fontStyle/:user/:template/:overlap', bodyParser.raw({type:'application/otf'}), handleDownloadPostRequest);

function handleDownloadPostRequest(req, res) {
	var fileName = req.params.user + '_' + req.params.fontFam + '-' + req.params.fontStyle;

	if (req.params.template) {
		fileName += '_' + req.params.template;
	}

	fileName += '_' + (new Date()).getTime();

	if (req.params.overlap) {
		fs.writeFile(tempDir + fileName + '.otf',req.body, function(err) {
				exec('./removeOverlap.pe ' + fileName + '.otf', function(err) {
					if (err) {
						console.log('Error while converting font with fileName: '+ fileName + err.message);
						fs.unlinkSync(tempDir + fileName + '.otf');
						return res.sendStatus(500);
					}

					res.download(outputDir + fileName + '.otf', function() {
						console.log('Successfully converted font with fileName: '+ fileName);
						fs.unlinkSync(tempDir + fileName + '.otf');
					});
				});
		});
	} else {
		fs.writeFile(outputDir + fileName + '.otf',req.body, function(err) {
			if(err) {
				console.log('Error while downloading font with fileName: ' + fileName + err.message);
			}

			console.log('Successfully downloaded font with fileName: ' + fileName);
			res.download(outputDir + fileName + '.otf');
		});
	}

}

var server = app.listen(portConfig.port, function() {
	console.log('listening');
});
