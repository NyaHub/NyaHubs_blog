
global.ENV = "dev";
global.force_DB = false;
global.PORT = 3000;
global.LIB = (lib) => path.join(__dirname, "./libs", lib);

global._require = (path) => {
    return require(path.replace("@", __dirname));
}

let createError = _require('http-errors');
let express = _require('express');
let path = _require('path');
let logger = _require("@/libs/logger")("app.js");
let autoload = _require("@/libs/autoload");

async function  createExpressApp() {
	let app = express();

	app.seq = await _require("@/models")(app, _require("@/libs/logger")("sequelize"));

	app.set('views', path.join(__dirname, 'views'));
	app.set('view engine', 'ejs');
	
	app.enable("trust proxy");
	app.use(_require('morgan')('short'));
	app.use(express.json());
	app.use(express.urlencoded({extended: false}));
	app.use(_require('cookie-parser')());
	app.use(_require('@/libs/dart-sass-middleware')("/public/stylesheets"));
	app.use(express.static(path.join(__dirname, 'public')));
	
	app.use(_require("@/libs/prepare")());
	app.use(_require("@/libs/authenticate")());
	
	app.get("/urls", async (_req, res, next)=>{
		try {
			res.render("urls", res.locals.data);
		} catch(e) {
			console.log(e);
		}
		
	});

	global.routes = {
		apps: {},
		routes: []
	}

	try {
        // add routes
        let routes = await autoload("@/routes", "file");
        for (const root of routes) {
            let p = _require(path.join(__dirname, root))(app);
            if(p.isOff) continue;

            await app.use(p.root, p.router);
            logger.info("Add route: " + p.root);
        }

        // add apps
        let appsD = await autoload("@/Apps", "dir");
        let apps = [app];
        for (const a of appsD) {
            let p = await _require(path.join(__dirname, a))(app);
            if(p.isOff) continue;

            await app.use(p.root, p.app);
            if (p.api) app.use("/api" + p.root, p.api);
            logger.info("Add app: " + p.root);
            global.routes.apps[p.appName] = p.root;
            apps.push(p.app);
        }

        for (ap of apps){
            global.routes.routes[ap.mountpath] = _require("@/libs/utils").fetchRoutes(ap._router);
        }

        addErorrListeners();

        return app;

    } catch (e) {
        logger.warn("Error while app starting!");
        console.log(e);
    }



	function addErorrListeners(){
		app.use(function (_req, res, next) {
		    next(createError(404));
		});
		app.use(function (err, _req, res, next) {
			logger.error(`${err.status} : ${err.message}`);
		    res.locals.message = err.message;
		    res.locals.error = global.ENV === 'dev' ? err : {};
		
		    res.setHeader("Content-type","text/html");
		    res.status(err.status || 500);
		    res.locals.data.err = err;
	        res.render('error', res.locals.data);
		});
	}

	return app;
}

(async () => {
    const app = await createExpressApp();
    const debug = _require('debug')('server');
    const http = _require('http');
    
    let port = normalizePort(global.PORT || '8080');
    app.set('port', port);
    
    let server = http.createServer(app);
    
    app.seq.sequelize.sync({force: global.force_DB}).then(() => {
        server.listen(port);
        server.on('error', onError);
        server.on('listening', onListening);
    }).catch(err => console.log(err));

    function onError(error) {
        if (error.syscall !== 'listen') {
            throw error;
        }
        let bind = typeof port === 'string'
            ? 'Pipe ' + port
            : 'Port ' + port;
        switch (error.code) {
            case 'EACCES':
                console.error(bind + ' _requires elevated privileges');
                process.exit(1);
                break;
            case 'EADDRINUSE':
                console.error(bind + ' is already in use');
                process.exit(1);
                break;
            default:
                throw error;
        }
    }
    
    function onListening() {
        let addr = server.address();
        let bind = typeof addr === 'string'
            ? 'pipe ' + addr
            : 'port ' + addr.port;
        debug('Listening on ' + bind);
    }
})();

function normalizePort(val) {
    let port = parseInt(val, 10);
    if (isNaN(port)) {
        return val;
    }
    if (port >= 0) {
        return port;
    }
    return false;
}