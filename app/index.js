var yeoman = require('yeoman-generator');
var crypto = require('crypto');

module.exports = yeoman.generators.Base.extend({
	constructor: function() {
		yeoman.generators.Base.apply(this, arguments);

		this.argument('name', {
			desc: 'The name of the app to create.',
			optional: true,
			required: false
		});
	},

	getAppName: function() {
		if(!this.name) {
			var done = this.async();

			this.prompt({
				type: 'input',
				name: 'name',
				message: 'The name of your app'
			}, function(answers) {
				this.name = answers.name;
				done();
			}.bind(this));
		}
	},

	getDatabaseUrl: function() {
		var done = this.async();

		var username = process.env.USER;

		this.prompt({
			type: 'input',
			name: 'databaseUrl',
			message: 'The URL to your PostgreSQL database.',
			default: 'postgres://' + username + '@127.0.0.1/' + this.name
		}, function(answers) {
			this.databaseUrl = answers.databaseUrl;
			done();
		}.bind(this));
	},

	setup: function() {
		this.destinationRoot(this.name);
	},

	renderFiles: function() {
		this.template('skeleton/index-js.template', 'index.js', {name: this.name});
		this.template('skeleton/bower-json.template', 'bower.json', {name: this.name});
		this.template('skeleton/env.template', '.env', {sessionKey: crypto.randomBytes(127).toString('base64'), databaseUrl: this.databaseUrl});
		this.template('skeleton/package-json.template', 'package.json', {name: this.name});
		this.template('skeleton/Gruntfile-js.template', 'Gruntfile.js', {});
	},

	installEverything: function() {
		this.installDependencies();
	}
});
