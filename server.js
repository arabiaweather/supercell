//TODO: Main Config to keep modules alive or not 

var fs = require("fs");
var cp = require('child_process');

//Vars for keeping track of children
var moduleProcesses = {};
var pidToModule = {};
var moduleToPid = {};

//Vars for Art 
var sys = require('sys');
var asciimo = require('asciimo').Figlet;
var colors = require('colors'); // add colors for fun

//Vars for Main Configurations 
var config = require('konphyg')(__dirname + '/config');
var mainConfig = config('main');
var modulesPath = __dirname + "/"+mainConfig.modulesPath;

//Var to find Modules present 
var modules = fs.readdirSync(modulesPath);


var font = 'starwars';
var welcome = "SuperCell";
asciimo.write(welcome,font,function(art){
	console.log(art.blue.bold);
	//Start the work here in Init()
	init();
});


//Find all the modules and send for starting 
function init()
{
	console.log("Supercell Started"+" [pid: ".red.bold + process.pid.toString().red.bold+"]".red.bold)
	for(module in modules)
	{
        	startModuleProcess(modules[module]);
	}
	
}

//Function to run modules and Track them, Also watches their end process 
//TODO: Check if the proccessn needs to keepAlive from the modules config
function startModuleProcess(moduleName)
{
	var moduleFile =modulesPath+"/"+moduleName+"/"+ moduleName+".js"; 
	var moduleConf = moduleName+".json";
	var pmod = cp.fork(moduleFile);
	moduleProcesses[moduleFile] = pmod;

	pidToModule[pmod.pid] = moduleFile;
	moduleToPid[moduleFile] = pmod.pid;	
	
	//Keep Alive for all modules 
	pmod.on("exit",function (code, signal){
		var moduleName = pidToModule[pmod.pid];
		var pid = pmod.pid;
		logger(moduleName.toString().red.bold + " Closed Unexpectedly".red.bold);
		logger("Trying to restart Module".red.bold);

		//Delete from PidToModule and from ModuleToPid
		delete pidToModule[pid];
		delete moduleToPid[moduleName];

		//Alert and run again 
		logger("Restating Module ".blue.bold + moduleName.blue.bold);
	//	startModuleProcess(moduleName);	 //TODO: Activate 
	});
	///////////////////////////////////
	logger("Module: ["+moduleFile.bold.red+", pid:  " + pmod.pid.toString().bold.red+"] ... Started");
}

////////////////////////UTILZ
//TODO: Get this our to another file 
function logger(data)
{
	console.log(data);
}
