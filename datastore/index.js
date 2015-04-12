var yeoman = require('yeoman-generator');
var pg = require('pg');
pg.defaults.poolIdleTimeout = 500;

module.exports = yeoman.generators.Base.extend({
	constructor: function() {
		yeoman.generators.Base.apply(this, arguments);

		this.argument('user', {
			desc: 'The user used to connect to your datastore. Defaults to your username (`' + process.env.USER + '`). This user must have permissions to create a database and install extensions.',
			optional: true,
			required: false,
			defaults: process.env.USER
		});

		this.argument('password', {
			desc: 'The password used to connect to your datastore. By default no password is set.',
			optional: true,
			required: false,
			defaults: ''
		});

		this.argument('host', {
			desc: 'The host of your Postgres instance. By default this is set to 127.0.0.1.',
			optional: true,
			required: false,
			defaults: '127.0.0.1'
		});

		this.argument('port', {
			desc: 'The port used to connect to your datastore.',
			optional: true,
			required: false,
			defaults: 5432
		});

		this.argument('template', {
			desc: 'The template database to connect to. If you don\'t know what this means, you don\'t have to change this. Defaults to template1.',
			optional: true,
			required: false,
			defaults: 'template1'
		});

		this.argument('databaseUrl', {
			desc: 'Optionally specify a full URL in the format of `postgres://user:password@host:port/template` to the database.',
			optional: true,
			required: false
		});

		this.argument('database', {
			desc: 'The database to create.',
			optional: true,
			required: false
		});

		this._datastore = null;
		this._done = null;
	},

	testLocalDatastore: function() {
		var next = this.async();

		// It seems the default value is only returned once. So we'll assign it manually.
		this.user = this.user;
		this.password = this.password;
		this.host = this.host;
		this.port = this.port;
		this.template = this.template;
		
		this.database = this.options.database;

		this.databaseUrl = 'postgres://' + this.user + (this.password && this.password.length ? (':' + this.password) : '') + '@' + this.host + ':' + this.port + '/' + this.template;

		// We have to connect to a database to create a database. So let's test if we can access the template database, see http://www.postgresql.org/docs/9.3/static/manage-ag-templatedbs.html.
		pg.connect(this.databaseUrl, function(error, datastore, done) {
			if(error) {
				throw new Error('Cannot connect to datastore at `' + this.databaseUrl + '`.');
			}
			else {
				this._datastore = datastore;
				this._done = done;

				next();
			}
		}.bind(this));
	},

	getDatabaseName: function() {
		if(!this.database) {
			var next = this.async();

			this.prompt({
				type: 'input',
				name: 'database',
				message: 'The name of the database to create'
			}, function(answers) {
				this.database = answers.database;

				next();
			}.bind(this));
		}
	},

	createDatabase: function() {
		var next = this.async();

		// OK, we can't use $1 to create the dabase so we'll just concat this string. This means this is vulnerable to SQL injection but only developers should have access to this.
		this._datastore.query('CREATE DATABASE ' + this.database, function(error) {
			this._done();

			if(error) {
				throw error;
			}
			else {
				next();
			}
		}.bind(this));
	},

	connectToDatabase: function() {
		var next = this.async();

		this.databaseUrl = 'postgres://' + this.user + (this.password && this.password.length ? (':' + this.password) : '') + '@' + this.host + ':' + this.port + '/' + this.database;

		pg.connect(this.databaseUrl, function(error, datastore, done) {
			if(error) {
				throw error;
			}
			else {
				this._datastore = datastore;
				this._done = done;

				next();
			}
		}.bind(this));
	},

	installExtension: function() {
		var next = this.async();

		this._datastore.query('CREATE EXTENSION "uuid-ossp";', function(error) {
			this._done();

			if(error) {
				throw error;
			}
			else {
				next();
			}
		}.bind(this));
	},

	printInfo: function() {
		console.log('\t');
		console.log('\t');
		console.log('\t');
		console.log('\tCreated database `' + this.database + '` at `' + this.databaseUrl + '`.');
		console.log('\t');
		console.log('\t');
		console.log('\t');
	}
});
