//Discord initialisation
const Discord = require("discord.js");
const { prefix, token } = require('./config.json');
const client = new Discord.Client();

//Node.js imports
var fs = require('fs');

client.once('ready', () => {
	console.log("[Ampersand] is ready. Hello!");
});

client.login('NDAwNDQ4MDIzNDQ2MTU5MzYx.Xpx4lg.XMw3lqNFpraZDOAk-7AE41_vxbk');

/*

TYPES OF UNITS

Infantry
Artillery
Cavalry/Tanks
Battleships/Aircraft Carriers
Submarines/Nuclear Submarines

Fighters/Multirole Fighters
Bombers/Strategic Bombers

*/

//Bot settings
{
	bot_prefix = "$";
	start_date = new Date(2020, 03, 26, 16, 09);
	turn_timer = 60;
	announcements_channel = "549004372747747338";
	authorised_role = "";
}

government_list = ["absolute_monarchy","constitutional_monarchy","democracy","communism","fascism"];

var config = {
	materials: ["bauxite","coal","cotton","copper","gold","iron","lead","meat","silver","sulphur","stone","petrol","wheat","wood","aluminium","ammunition","artillery","concrete","fertiliser","food","lumber","machine_parts","refined_petrol","small_arms","steel","textiles","uniforms"],
	buildings: ["aluminium_factories","ammunition_factories","artillery_factories","concrete_factories","fertiliser_factories","machine_parts_factories","refineries","sawmills","small_arms_factories","steelworks","workshops","textile_mills","research_labs","schools","universities","neighbourhoods","towns","cities","metropolises","financial_districts","forts","barracks","factories","aeroports","naval_harbours"],
	units: ["cannons","field_artillery","modern_artillery","irregulars","arquebusiers","pikemen","flintlock_infantry","pike_and_shot_infantry","musketeers","early_modern_infantry","napoleonic_infantry","riflemen","infantry","tanks","fighters","bombers","galleys","caravels","galleons","frigates","men_of_war","ship_of_the_line","first_rate","ironclads","steam_frigates","dreadnoughts","cruisers","battleships"],
	visible_units: ["cannons","field_artillery","modern_artillery","irregulars","arquebusiers","pikemen","flintlock_infantry","pike_and_shot_infantry","musketeers","early_modern_infantry","napoleonic_infantry","riflemen","infantry","tanks","fighters","bombers","galleys","caravels","galleons","frigates","men_of_war","ship_of_the_line","first_rate","ironclads","steam_frigates","dreadnoughts","cruisers","battleships"],
	visible_buildings: ["aluminium_factories","ammunition_factories","artillery_factories","concrete_factories","fertiliser_factories","machine_parts_factories","refineries","sawmills","small_arms_factories","steelworks","workshops","textile_mills","research_labs","schools","universities","neighbourhoods","towns","cities","metropolises","financial_districts","forts","barracks","factories","aeroports","naval_harbours"],
	raw_resources: ["bauxite","coal","cotton","copper","gold","iron","lead","meat","silver","sulphur","stone","petrol","wheat","wood"],
	processed_goods: ["aluminium","concrete","fertiliser","food","lumber","machine_parts","refined_petrol","steel","textiles"],
	military_goods: ["ammunition","artillery","small_arms","uniforms"],
	infrastructure: ["canals","railways","motorways","aeroports"],
	
	categories: ["military","economic","administrative"],
	military_tech: [
		["Caravel", "caravel"],
		["Improved Metallurgy","improved_metallurgy"]
	],
	economic_tech: [
		["Encomiendas","encomiendas"]
	],
	administrative_tech: [
		["Cottage Industry","cottage_industry"]
	]
};

var def_data = {
	users: {
	}
}

let rawdata = fs.readFileSync('database.js');
let main = JSON.parse(rawdata);

function readConfig () {
	let rawconfig = fs.readFileSync('config.txt');
	eval(rawconfig.toString());
}

readConfig();

let rawhelp = fs.readFileSync('help.txt');
var help = rawhelp.toString().replace(/@/g, bot_prefix);

let rawhelp2 = fs.readFileSync('help2.txt');
var help2 = rawhelp2.toString().replace(/@/g, bot_prefix);

let rawbuildcosts = fs.readFileSync('documents/build_costs.txt');
var buildcosts = rawbuildcosts.toString();

let rawunitcosts = fs.readFileSync('documents/unit_costs.txt');
var unitcosts = rawunitcosts.toString().split("\n");

let rawunitcosts2 = fs.readFileSync('documents/unit_costs2.txt');
var unitcosts2 = rawunitcosts2.toString().split("\n");

let rawgovernments = fs.readFileSync('documents/governments.txt');
var governments = rawgovernments.toString();

user = "";
input = "";

building_list = [];
news = [];

//Framework
{
	//Operating functions

	function randomNumber(min, max) {
		return Math.floor(Math.random() * (max - min) + min);
	}

	function saveConfig () {
		var bot_settings = [
			'bot_prefix = "' + bot_prefix + '";',
			'start_date = new Date(2020, 03, 26, 16, 09);',
			'turn_timer = ' + turn_timer + ';',
			'announcements_channel = "' + announcements_channel + '";',
			'authorised_role = "' + authorised_role + '";'
		];
		fs.writeFile('config.txt', bot_settings.join("\n"), function (err,data) {
			if (err) {
				return console.log(err);
			}
			//console.log(data);
		});
	}

	function equalsIgnoreCase (arg0, arg1) {
		if (arg0.toLowerCase() == (bot_prefix + arg1).toLowerCase()) {
			return true;
		} else {
			return false;
		}
	}

	function parseNumber (arg0_number) {
		return Intl.NumberFormat('de').format(arg0_number);
	}

	function returnMention (arg0) {

		var mention_id = arg0.replace(/(<)(@)(!)/g,"");
		mention_id = mention_id.replace(/(<)(@)/g,"");
		mention_id = mention_id.replace(">","");

		return mention_id;
	}

	function returnChannel (arg0) {
		return client.channels.cache.get(arg0);
	}

	function parseMilliseconds (duration) {
		var milliseconds = parseInt((duration % 1000) / 100),
		seconds = Math.floor((duration / 1000) % 60),
		minutes = Math.floor((duration / (1000 * 60)) % 60),
		hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

		return hours + " hours, " + minutes + " minutes, " + seconds + " seconds";
	}

	function hasRole (arg0_msg, arg1_role) {
		if (arg0_msg.member.roles.cache.some(role => role.name === arg1_role)) {
			return true;
		} else {
			return false;
		}
	}

	function nextTurn (arg0_user) {
		var user_id = main.users[arg0_user];
		var age = main.users[arg0_user].technology_level-1;
		var buildings = main.users[arg0_user]["buildings"];
		var inventory = main.users[arg0_user]["inventory"];

		//News variables:

		var national_news = "";

		//Politics
		{
			//Political parties
			var most_popular = ["", 0];
			for (var i = 0; i < government_list.length; i++) {
				if (user_id["politics"][government_list[i]] > most_popular[1]) {
					most_popular[0] = government_list[i];
					most_popular[1] = user_id["politics"][government_list[i]];
				}
			}
			if (most_popular[1] == 0) {
				national_news = national_news + "The government of " + user_id.name + " was couped by the military today, due to there being no existing government.";
				user_id["politics"]["absolute_monarchy"] = 100;
				most_popular = ["absolute_monarchy", 100];
			}

			for (var i = 0; i < government_list.length; i++) {
				user_id["politics"][government_list[i]] = user_id["politics"][government_list[i]] + user_id[government_list[i] + "_drift"]*100;
				if (user_id["politics"][most_popular[0]] > user_id[government_list[i] + "_drift"]*100) {
					user_id["politics"][most_popular[0]] = user_id["politics"][most_popular[0]] - user_id[government_list[i] + "_drift"]*100;
				}
				//Recalc
				for (var x = 0; x < government_list.length; x++) {
					if (user_id["politics"][government_list[x]] > most_popular[1]) {
						most_popular[0] = government_list[x];
						most_popular[1] = user_id["politics"][government_list[x]];
					}
				}
			}

			console.log(most_popular);

			//Stability and revolt risk
			{
				var stab_tax_rate = user_id.tax_rate*100;
				var stab_party_popularity = (user_id["politics"][user_id.government]);
				var stab_government_modifier = 0;

				if (user_id.government != "communism" && user_id.government != "fascism" && user_id.government != "absolute_monarchy") {
					stab_government_modifier = 5;
				} else {
					stab_government_modifier = -5;
				}

				user_id.stability = Math.ceil(stab_party_popularity + stab_government_modifier - stab_tax_rate);

				if (user_id.stability > 100) {
					user_id.stability = 100;
				} else if (user_id.stability < 0) {
					user_id.stability = 0;
				}

				var dice_roll = randomNumber(0, 100);
				if (dice_roll > user_id.stability+30 || user_id.coup_this_turn == true) {
					user_id.tax_rate = 0;
					var new_government = "";
					//Revolt
					if (user_id.government == "absolute_monarchy") {
						setGovernment(user_id, "constitutional_monarchy");
						new_government = "constitutional_monarchy";
					} else if (user_id.government == "constitutional_monarchy") {
						setGovernment(user_id, "democracy");
						new_government = "democracy";
					} else if (user_id.government == "democracy") {
						setGovernment(user_id, "fascism");
						new_government = "fascism";
					} else if (user_id.government == "fascism") {
						setGovernment(user_id, "communism");
						new_government = "communism";
					} else if (user_id.government == "communism") {
						setGovernment(user_id, "absolute_monarchy");
						new_government = "absolute_monarchy";
					}

					national_news = national_news + "The country of " + user_id.name + " fell into a state of civil unrest, allowing supporters of " + user_id.government + " to coup the government!\n";
					national_news = national_news + "Rioters then went on strike, leading the country of " + user_id.name + " to lose all their actions!\n";
					user_id.coup_this_turn = false;
					user_id.actions = 0;
				}

				if (user_id.overthrow_this_turn) {
					user_id.tax_rate = 0;
					var new_government = "";
					//Revolt
					if (user_id.government == "absolute_monarchy") {
						setGovernment(user_id, "communism");
						new_government = "communism";
					} else if (user_id.government == "constitutional_monarchy") {
						setGovernment(user_id, "absolute_monarchy");
						new_government = "absolute_monarchy";
					} else if (user_id.government == "democracy") {
						setGovernment(user_id, "constitutional_monarchy");
						new_government = "constitutional_monarchy";
					} else if (user_id.government == "fascism") {
						setGovernment(user_id, "democracy");
						new_government = "democracy";
					} else if (user_id.government == "communism") {
						setGovernment(user_id, "fascism");
						new_government = "fascism";
					}

					national_news = national_news + "The country of " + user_id.name + " fell into a state of civil unrest, leading supporters of " + user_id.government + " to overthrow the government!\n";
					national_news = national_news + "Rioters then went on strike, leading the country of " + user_id.name + " to lose all their actions!\n";
					user_id.overthrow_this_turn = false;
					user_id.actions = 0;
				}

			}
		}

		news.push(national_news);

	}

	function setGovernment (arg0_user, arg1_type) {
		var user_id = arg0_user;
		user_id.government = arg1_type;
		if (arg1_type == "absolute_monarchy") {
			user_id.manpower_percentage = 0.05;
			user_id.max_tax = 0.65;
			user_id.civilian_actions_percentage = 0.10;
		} else if (arg1_type == "constitutional_monarchy") {
			user_id.manpower_percentage = 0.20;
			user_id.max_tax = 0.35;
			user_id.civilian_actions_percentage = 0.35;
		} else if (arg1_type == "democracy") {
			user_id.manpower_percentage = 0.25;
			user_id.max_tax = 1.00;
			user_id.civilian_actions_percentage = 0.50;
		} else if (arg1_type == "fascism") {
			user_id.manpower_percentage = 0.10;
			user_id.max_tax = 0.70;
			user_id.civilian_actions_percentage = 0.20;
		} else if (arg1_type == "communism") {
			user_id.manpower_percentage = 0.50;
			user_id.max_tax = 0.25;
			user_id.civilian_actions_percentage = 0.00;
		}
	}

	function newCity (arg0_user, arg1_name, arg2_type, arg3_message) {
		//Initialisation variables
		var user = main.users[arg0_user];
		var cities = user["cities"];
		var city_name = arg1_name;
		var type = arg2_type;
		var msg = arg3_message;

		var city_exists = false;

		for (var i = 0; i < cities.city_array.length; i++) {
			if (cities.city_array[i] == city_name) {
				city_exists = true;
			}
		}

		if (city_exists) {
			msg.channel.send("This city already exists!");
		} else {
			if (type == "capital") {
				cities[city_name] = {};

				cities[city_name].name = city_name;
				cities[city_name].population = randomNumber(250000,1000000);
				cities[city_name].resource = randomElement(config.raw_resources);
				cities[city_name].buildings = {};
				cities[city_name].type = "capital";
				for (var i = 0; i < config.buildings.length; i++) {
					cities[city_name]["buildings"][config.buildings[i]] = 0;
				}
				msg.channel.send("Capital city founded as **" + city_name + "**! Over " + cities[city_name].population + " are now legally residents of the capital city of **" + user.name + "**.");

				cities.city_array.push(city_name);
			} else {
				cities[city_name] = {};

				cities[city_name].name = city_name;
				cities[city_name].population = randomNumber(250000,800000);
				cities[city_name].resource = randomElement(config.raw_resources);
				cities[city_name].buildings = {};
				cities[city_name].type = "city";
				for (var i = 0; i < config.buildings.length; i++) {
					cities[city_name]["buildings"][config.buildings[i]] = 0;
				}
				msg.channel.send("A new city founded as **" + city_name + "**! Over " + cities[city_name].population + " are now legally residents of the city of **" + user.name + "**.");

				cities.city_array.push(city_name);
			}
		}
	}

	function longMessage (arg0_array, arg1_message) {
		var current_characters = 0;
		var message_arrays = [];
		var current_message_array = [];
		
		if (arg0_array.join("\n").length >= 2000) {
			for (var i = 0; i < arg0_array.length; i++) {
				if (current_characters+arg0_array[i].length < 2000) {
					current_message_array.push(arg0_array[i]);
					current_characters = current_characters + arg0_array[i].length;
				} else {
					current_characters = 0;
					message_arrays.push(current_message_array);
					current_message_array = [];

					current_message_array.push(arg0_array[i]);
					current_characters = current_characters + arg0_array[i].length;
				}
			}
		} else {
			current_characters = 0;
			message_arrays.push(arg0_array);
			current_message_array = [];
			current_characters = current_characters + arg0_array.length;
		}

		console.log(message_arrays);

		//Send all messages in array

		for (var i = 0; i < message_arrays.length; i++) {
			arg1_message.channel.send(message_arrays[i].join("\n"));
		}
	}

	//Command functions
	{
		function randomElement (arg0_array) {
			return arg0_array[Math.floor(Math.random() * arg0_array.length)];
		}

		function initVar (arg0_variable, arg1_value) {
			if (arg0_variable == undefined) {
				arg0_variable = arg1_value;
			}
		}

		function initUser (arg0_user) {
			var current_user = arg0_user.toString();
			var already_registered = false;
			for (var i = 0; i < main.user_array.length; i++) {
				if (main.user_array[i] == current_user) {
					already_registered = true;
				}
			}

			if (main.users[current_user] == undefined) { main.users[current_user] = {}; }
			if (main.users[current_user].name == undefined) { main.users[current_user].name = ""; }
			if (main.users[current_user].government == undefined) { main.users[current_user].government = ""; }
			if (main.users[current_user].technology_level == undefined) { main.users[current_user].technology_level = 3; }
			if (main.users[current_user].population == undefined) { main.users[current_user].population = 10000000; }
			if (main.users[current_user].used_manpower == undefined) { main.users[current_user].used_manpower = 0; }
			if (main.users[current_user].initial_manpower == undefined) { main.users[current_user].initial_manpower = 5000000; }
			if (main.users[current_user].manpower_percentage == undefined) { main.users[arg0_user].manpower_percentage = 0.50; }
			if (main.users[current_user].money == undefined) { main.users[current_user].money = 10000; }

			if (main.users[current_user].stability == undefined) { main.users[current_user].stability = 50; }
			if (main.users[current_user].political_capital == undefined) { main.users[current_user].political_capital = 0; }
			if (main.users[current_user].coup_this_turn == undefined) { main.users[current_user].coup_this_turn = false; }
			if (main.users[current_user].overthrow_this_turn == undefined) { main.users[current_user].overthrow_this_turn = false; }

			if (main.users[current_user].research_points == undefined) { main.users[current_user].research_points = 0; }
			
			if (main.users[current_user].military_tech == undefined) { main.users[current_user].military_tech = 0; }
			if (main.users[current_user].economic_tech == undefined) { main.users[current_user].economic_tech = 0; }
			if (main.users[current_user].administrative_tech == undefined) { main.users[current_user].administrative_tech = 0; }

			if (main.users[current_user].infamy == undefined) { main.users[current_user].infamy = 0; }

			if (main.users[current_user].news_this_turn == undefined) { main.users[current_user].news_this_turn = ""; }

			//Modifiers
			if (main.users[current_user].tax_rate == undefined) { main.users[current_user].tax_rate = 0; }
			if (main.users[current_user].tax_efficiency == undefined) { main.users[current_user].tax_efficiency = 0; }
			if (main.users[current_user].max_tax == undefined) { main.users[current_user].max_tax = 0; }
			if (main.users[current_user].pop_available == undefined) { main.users[current_user].pop_available = 0.5; }

			if (main.users[current_user].production_efficiency == undefined) { main.users[current_user].production_efficiency = 1; }
			if (main.users[current_user].mining_efficiency == undefined) { main.users[current_user].mining_efficiency = 1; }
			if (main.users[current_user].pop_growth_modifier == undefined) { main.users[current_user].pop_growth_modifier = 1.0139; }

			if (main.users[current_user].ap_modifier == undefined) { main.users[current_user].ap_modifier = 0; }
			if (main.users[current_user].dp_modifier == undefined) { main.users[current_user].dp_modifier = 0; }

			if (main.users[current_user].used_diplo_slots == undefined) { main.users[current_user].used_diplo_slots = 0; }
			if (main.users[current_user].diplo_slots == undefined) { main.users[current_user].diplo_slots = 1; }

			if (main.users[current_user].valid_tactics == undefined) { main.users[current_user].valid_tactics = []; }
			if (main.users[current_user].valid_units == undefined) { main.users[current_user].valid_units = []; }
			if (main.users[current_user].valid_laws == undefined) { main.users[current_user].valid_laws = []; }
			if (main.users[current_user].valid_cbs == undefined) { main.users[current_user].valid_cbs = []; }

			//Laws
			if (main.users[current_user].drastic_measures == undefined) { main.users[current_user].drastic_measures = false; }

			//Sub-objects
			if (main.users[current_user]["buildings"] == undefined) { main.users[current_user]["buildings"] = {}; }
			if (main.users[current_user]["cities"] == undefined) { main.users[current_user]["cities"] = {}; }
			if (main.users[current_user]["infrastructure"] == undefined) { main.users[current_user]["infrastructure"] = {}; }
			if (main.users[current_user]["inventory"] == undefined) { main.users[current_user]["inventory"] = {}; }
			if (main.users[current_user]["laws"] == undefined) { main.users[current_user]["laws"] = {}; }
			if (main.users[current_user]["military"] == undefined) { main.users[current_user]["military"] = {}; }
			if (main.users[current_user]["politics"] == undefined) { main.users[current_user]["politics"] = {}; }

			//Cities
			if (main.users[current_user]["cities"].city_array == undefined) { main.users[current_user]["cities"].city_array = []; }

			//Crafting values
			if (main.users[current_user].mining_actions == undefined) { main.users[current_user].mining_actions = 10; }
			if (main.users[current_user].chopping_actions == undefined) { main.users[current_user].chopping_actions = 10; }
			if (main.users[current_user].army_cp == undefined) { main.users[current_user].army_cp = 0; }
			if (main.users[current_user].naval_cp == undefined) { main.users[current_user].naval_cp = 0; }
			
			if (main.users[current_user].army_cp_modifier == undefined) { main.users[current_user].army_cp_modifier = 0; }
			if (main.users[current_user].naval_cp_modifier == undefined) { main.users[current_user].naval_cp_modifier = 0; }
			
			if (main.users[current_user].mining_actions == undefined) { main.users[current_user].mining_actions_modifier = 50; }
			if (main.users[current_user].chopping_actions_modifier == undefined) { main.users[current_user].chopping_actions_modifier = 50; }

			if (main.users[current_user].civilian_actions == undefined) { main.users[current_user].civilian_actions = 0; }
			if (main.users[current_user].civilian_actions_percentage == undefined) { main.users[current_user].civilian_actions_percentage = 0; }

			//Political Modifiers
			{
				for (var i = 0; i < government_list.length; i++) {
					if (main.users[current_user][government_list[i]] == undefined) { main.users[current_user][government_list[i] + "_drift"] = 0.01; }
				}
			}

			//Modifiers - Only staff can set these
			if (main.users[current_user].blockaded == undefined) { main.users[current_user].blockaded = false; }

			//Add all materials to inventory
			for (var i = 0; i < config.materials.length; i++) {
				if (main.users[current_user]["inventory"][config.materials[i]] == undefined) { main.users[current_user]["inventory"][config.materials[i]] = 0; }
			}

			//Add all buildings
			for (var i = 0; i < config.buildings.length; i++) {
				if (main.users[current_user]["buildings"][config.buildings[i]] == undefined) { main.users[current_user]["buildings"][config.buildings[i]] = 0; }
			}

			//Add all political parties
			for (var i = 0; i < government_list.length; i++) {
				if (main.users[current_user]["politics"][government_list[i]] == undefined) { main.users[current_user]["politics"][government_list[i]] = 0; }
			}

			//Add all military units
			for (var i = 0; i < config.units.length; i++) {
				if (main.users[current_user]["military"][config.units[i]] == undefined) { main.users[current_user]["military"][config.units[i]] = 0; }
			}

			//Last election
			if (main.users[current_user].last_election == undefined) { main.users[current_user].last_election = 0; }

			if (already_registered == false) {
				main.user_array.push(current_user);
			}
		}

		function activate (arg0_user, arg1_name, arg2_message) {
			var msg = arg2_message;
			var usr = main.users[arg0_user];

			//var actions_per_turn = usr["buildings"].mines + usr["buildings"].watermills*2 + usr["buildings"].factories*3;
			console.log(actions_per_turn);

			if (arg1_name == "drastic_measures") {
				if (usr.drastic_measures == false) {
					if (actions_per_turn < 50) {
						msg.channel.send("You have employed drastic measures! As your civilian populace recognises the need for 24-hour shifts, you gain 150 actions.");
						usr.actions = usr.actions + 150;
						usr.drastic_measures = true;
						usr.news_this_turn = usr.news_this_turn + "\n" + usr.name + " employed drastic measures to allow their citizens to survive the apocalypse.";
					}
				} else if (usr.drastic_measures == true) {
					msg.channel.send("Your people can't work 48-hour shifts!");
				}
			}
		}

		function modifyItem (arg0_user, arg1_amount, arg2_item, arg3_mode) {

			var current_user = arg0_user.toString();

			if (arg3_mode == "add") {
				if (main.users[current_user] == undefined) {
					initUser(current_user);
					main.users[current_user]["inventory"][arg2_item] = main.users[current_user]["inventory"][arg2_item] + parseInt(arg1_amount);
				} else {
					main.users[current_user]["inventory"][arg2_item] = main.users[current_user]["inventory"][arg2_item] + parseInt(arg1_amount);
				}
			} else if (arg3_mode == "remove") {
				if (main.users[current_user] == undefined) {
					initUser(current_user);
					main.users[current_user]["inventory"][arg2_item] = main.users[current_user]["inventory"][arg2_item] - parseInt(arg1_amount);
				} else {
					main.users[current_user]["inventory"][arg2_item] = main.users[current_user]["inventory"][arg2_item] - parseInt(arg1_amount);
				}
			}

		}

		function give (arg0_user, arg1_user2, arg2_amount, arg3_item, arg4_mode, arg5_message) {
			if (main.users[arg0_user] != undefined) {
				var usr = main.users[arg0_user];
				var other_usr_id = arg1_user2.replace(/(<)(@)(!)/g,"");
				var other_usr_id = arg1_user2.replace(/(<)(@)/g,"");
				var other_usr = main.users[other_usr_id];

				var inventory = main.users[arg0_user]["inventory"];
				console.log(other_usr_id);
				if (arg4_mode == "item") {
					if (arg3_item == "money") {
						if (usr.money >= arg2_amount) {
							usr.money = parseInt(usr.money) - parseInt(arg2_amount);
							other_usr.money = parseInt(other_usr.money) + parseInt(arg2_amount);
							arg5_message.channel.send("You sent <@" + other_usr_id + "> " + arg2_amount + " money.");
						} else {
							arg5_message.channel.send("You were unable to execute this command due to a shortage of money.");
						}
					} else {
						var item_exists = false;
						for (var i = 0; i < config.materials.length; i++) {
							if (arg3_item == config.materials[i]) {
								item_exists = true;
							}
						}
						if (item_exists) {
							if (inventory[arg3_item] >= arg2_amount) {
								inventory[arg3_item] = parseInt(inventory[arg3_item]) - parseInt(arg2_amount);
								other_usr["inventory"][arg3_item] = parseInt(other_usr["inventory"][arg3_item]) + parseInt(arg2_amount);
								arg5_message.channel.send("You gave <@" + other_usr_id + "> " + arg2_amount + " " + arg3_item + ".");
							} else {
								arg5_message.channel.send("You were unable to execute this command due to a shortage of items.");
							}
						} else {
							arg5_message.channel.send("The item you are trying to send is nonexistent!");
						}
					}
				} else if (arg4_mode == "industry") {
					var building_exists = false;
					for (var i = 0; i < config.buildings.length; i++) {
						if (arg3_item == config.buildings[i]) {
							building_exists = true;
						}
					}
					if (building_exists) {
						if (usr["buildings"][arg3_item] >= arg2_amount) {
							usr["buildings"][arg3_item] = parseInt(usr["buildings"][arg3_item]) - parseInt(arg2_amount);
							other_usr["buildings"][arg3_item] = parseInt(other_usr["buildings"][arg3_item]) + parseInt(arg2_amount);
							arg5_message.channel.send("You gave <@" + other_usr_id + "> " + arg2_amount + " " + arg3_item + ".");
						} else {
							arg5_message.channel.send("You were unable to execute this command due to a shortage of buildings.");
						}
					} else {
						arg5_message.channel.send("The item you are trying to send is nonexistent!");
					}
				} else if (arg4_mode == "military") {
					var unit_exists = false;
					for (var i = 0; i < config.units.length; i++) {
						if (arg3_item == config.units[i]) {
							unit_exists = true;
						}
					}
					if (unit_exists) {
						if (usr["military"][arg3_item] >= arg2_amount) {
							usr["military"][arg3_item] = parseInt(usr["military"][arg3_item]) - parseInt(arg2_amount);
							other_usr["military"][arg3_item] = parseInt(other_usr["military"][arg3_item]) + parseInt(arg2_amount);
							arg5_message.channel.send("You gave <@" + other_usr_id + "> " + arg2_amount + " " + arg3_item + ".");
						} else {
							arg5_message.channel.send("You were unable to execute this command due to a shortage of military units.");
						}
					} else {
						arg5_message.channel.send("The item you are trying to send is nonexistent!");
					}
				}
			} else {
				arg5_message.channel.send("The person you are trying to give items to doesn't even have a country!");
			}
		}

		function mine (arg0_user, arg1_msg, arg2_actions) {
			var user_id = main.users[arg0_user];
			var inventory = main.users[arg0_user]["inventory"];
			var mineable_materials = ["coal","iron","iron","iron","lead","gold","petrol","rocks","rocks"];

			//["coal","iron","lead","gold","petrol","wood","rocks"],
			var resource_list = "";
			var out_of_actions = false;

			for (var i = 0; i < arg2_actions; i++) {
				if (user_id.actions > 0) {
					var random_resource = randomElement(mineable_materials);
					user_id.actions--;
					inventory[random_resource] = inventory[random_resource] + 1;
					resource_list = resource_list + (random_resource + ", ");
				} else {
					out_of_actions = true;
				}
			}

			if (arg1_msg != "none") {
				arg1_msg.channel.send("You dug up " + resource_list + "whilst on your mining haul.");
				if (out_of_actions) {
					arg1_msg.channel.send("You then proceeded to run out of actions.");
				}
			}
		}

		function forage (arg0_user, arg1_msg, arg2_actions) {
			var user_id = main.users[arg0_user];
			var inventory = main.users[arg0_user]["inventory"];

			var salvaged_wood = 0;
			var out_of_actions = false;

			for (var i = 0; i < arg2_actions; i++) {
				if (user_id.actions > 0) {
					user_id.actions--;
					inventory["wood"] = inventory["wood"] + 1;
					salvaged_wood++;
				} else {
					out_of_actions = true;
				}
			}

			if (arg1_msg != "none") {
				arg1_msg.channel.send("You chopped " + salvaged_wood + " wood.");
				if (out_of_actions) {
					arg1_msg.channel.send("You then proceeded to run out of actions.");
				}
			}
		}

		function printInv (arg0_user, arg1_username, arg2_msg) {
			var inv_string = [];

			if (main.users[arg0_user] == undefined) {
				arg2_msg.channel.send("The person you are looking for has no inventory!");
			} else {

				inv_string.push(":bust_in_silhouette: User: <@" + arg0_user + ">");
				inv_string.push("------------------ \n**Raw Resources:**\n");

				for (var i = 0; i < config.raw_resources.length; i++) {
					if (main.users[arg0_user]["inventory"][config.raw_resources[i]] != undefined) {
						inv_string.push(config.raw_resources[i] + ": " + main.users[arg0_user]["inventory"][config.raw_resources[i]]);
					}
				}

				inv_string.push("------------------ \n**Processed Goods:**\n");

				for (var i = 0; i < config.processed_goods.length; i++) {
					if (main.users[arg0_user]["inventory"][config.processed_goods[i]] != undefined) {
						inv_string.push(config.processed_goods[i] + ": " + main.users[arg0_user]["inventory"][config.processed_goods[i]]);
					}
				}

				inv_string.push("------------------ \n**Military Goods:**\n");

				for (var i = 0; i < config.military_goods.length; i++) {
					if (main.users[arg0_user]["inventory"][config.military_goods[i]] != undefined) {
						inv_string.push(config.military_goods[i] + ": " + main.users[arg0_user]["inventory"][config.military_goods[i]]);
					}
				}

				arg2_msg.channel.send(inv_string.join("\n"));


			}
		}

		function printBuildings (arg0_user, arg1_username, arg2_msg) {
			var building_string = [];

			if (main.users[arg0_user] == undefined) {
				arg2_msg.channel.send("The person you are looking for is stateless!");
			} else {
				building_string.push(":bust_in_silhouette: User: <@" + arg0_user + ">");
				building_string.push("------------------ \n :homes: **Industry:**\n");

				for (var i = 0; i < config.buildings.length; i++) {
					if (main.users[arg0_user]["buildings"][config.buildings[i]] != undefined) {

						/*if (config.buildings[i] == "drill_shafts") {
							building_string.push("You have **" + main.users[arg0_user]["buildings"][config.buildings[i]] + "** " + config.buildings[i] + ", providing you with " + main.users[arg0_user]["buildings"][config.buildings[i]]*15 + " wood each turn.");
						} else if (config.buildings[i] == "coal_mines") {
							building_string.push("You have **" + main.users[arg0_user]["buildings"][config.buildings[i]] + "** " + config.buildings[i] + ", providing you with " + main.users[arg0_user]["buildings"][config.buildings[i]]*100 + " coal each turn.");
						} else if (config.buildings[i] == "iron_mines") {
							building_string.push("You have **" + main.users[arg0_user]["buildings"][config.buildings[i]] + "** " + config.buildings[i] + ", providing you with " + main.users[arg0_user]["buildings"][config.buildings[i]]*20 + " iron each turn.");
						} else if (config.buildings[i] == "steelworks") {
							building_string.push("You have **" + main.users[arg0_user]["buildings"][config.buildings[i]] + "** " + config.buildings[i] + ", refining up to " + main.users[arg0_user]["buildings"][config.buildings[i]]*10 + " steel each turn.");
						} else if (config.buildings[i] == "hunters") {
							building_string.push("");
							building_string.push("You have **" + main.users[arg0_user]["buildings"][config.buildings[i]] + "** " + config.buildings[i] + ", providing your citizens with up to " + main.users[arg0_user]["buildings"][config.buildings[i]]*5 + " raw_food each turn.");
						} else if (config.buildings[i] == "greenhouses") {
							building_string.push("You have **" + main.users[arg0_user]["buildings"][config.buildings[i]] + "** " + config.buildings[i] + ", providing your citizens with up to " + main.users[arg0_user]["buildings"][config.buildings[i]]*10 + " raw_food each turn.");
						} else if (config.buildings[i] == "eateries") {
							building_string.push("You have **" + main.users[arg0_user]["buildings"][config.buildings[i]] + "** " + config.buildings[i] + ", converting " + main.users[arg0_user]["buildings"][config.buildings[i]]*10 + " raw_food into " + main.users[arg0_user]["buildings"][config.buildings[i]]*1000 + " rations each turn.");
						} else if (config.buildings[i] == "resource_depots") {
							building_string.push("");
							building_string.push("You have **" + main.users[arg0_user]["buildings"][config.buildings[i]] + "** " + config.buildings[i] + ", giving you " + main.users[arg0_user]["buildings"][config.buildings[i]] + " actions per turn.");
						} else if (config.buildings[i] == "mines") {
							building_string.push("You have **" + main.users[arg0_user]["buildings"][config.buildings[i]] + "** " + config.buildings[i] + ", giving you " + main.users[arg0_user]["buildings"][config.buildings[i]]*3 + "-" + main.users[arg0_user]["buildings"][config.buildings[i]]*5 + " actions per turn.");
						} else if (config.buildings[i] == "factories") {
							building_string.push("You have **" + main.users[arg0_user]["buildings"][config.buildings[i]] + "** " + config.buildings[i] + ", giving you " + main.users[arg0_user]["buildings"][config.buildings[i]]*5 + "-" + main.users[arg0_user]["buildings"][config.buildings[i]]*10 + " actions per turn.");
						} else if (config.buildings[i] == "heat_generators") {
							building_string.push("");
							building_string.push("You have **" + main.users[arg0_user]["buildings"][config.buildings[i]] + "** " + config.buildings[i] + ", providing heat for " + main.users[arg0_user]["buildings"][config.buildings[i]]*1000 + " people.");
						} else if (config.buildings[i] == "signal_towers") {
							building_string.push("");
							building_string.push("You have **" + main.users[arg0_user]["buildings"][config.buildings[i]] + "** " + config.buildings[i] + ", attracting up to " + main.users[arg0_user]["buildings"][config.buildings[i]]*100 + " people each turn.");
						}*/
					}
				}

				arg2_msg.channel.send(building_string.join("\n"));
			}
		}

		function printCities (arg0_user, arg1_msg) {
			var cities_string = [];
			var cities = main.users[arg0_user].cities;

			cities_string.push(":bust_in_silhouette: User: <@" + arg0_user + ">");
			cities_string.push(":map: Country: **" + main.users[arg0_user].name + "**");
			cities_string.push("------------------ \n**Cities:**\n");
			//Print Capital City
			for (var i = 0; i < cities.city_array.length; i++) {
				if (cities[cities.city_array[i]].type == "capital") {
					cities_string.push("**" + cities[cities.city_array[i]].name + "** - Capital City");
					cities_string.push(" - Population: " + parseNumber(cities[cities.city_array[i]].population));
					cities_string.push(" - RGO: " + cities[cities.city_array[i]].resource);
				}
			}

			//Print Capital City
			for (var i = 0; i < cities.city_array.length; i++) {
				if (cities[cities.city_array[i]].type == "city") {
					cities_string.push("**" + cities[cities.city_array[i]].name + "**:");
					cities_string.push(" - Population: " + parseNumber(cities[cities.city_array[i]].population));
					cities_string.push(" - RGO: " + cities[cities.city_array[i]].resource);
				}
			}

			longMessage(cities_string, arg1_msg);
		}

		function printCity (arg0_user, arg1_city, arg2_msg) {
			var cities_string = [];
			var cities = main.users[arg0_user].cities;

			console.log(arg1_city);

			var city_exists = false;
			var city_name = "";

			for (var i = 0; i < cities.city_array.length; i++) {
				if (cities[cities.city_array[i]].name == arg1_city) {
					city_exists = true;
					city_name = cities.city_array[i];
				}
			}

			if (city_exists) {
				cities_string.push(":bust_in_silhouette: User: <@" + arg0_user + ">");
				cities_string.push(":map: Country: **" + main.users[arg0_user].name + "**");
				cities_string.push("------------------ \n**" + cities[city_name].name + ":**\n");
				cities_string.push("**Population: **" + parseNumber(cities[city_name].population));
				cities_string.push("**RGO: **" + cities[city_name].resource);
				cities_string.push("**Buildings: **");
				for (var i = 0; i < config.buildings.length; i++) {
					cities_string.push(" - " + config.buildings[i] + ": " + cities[city_name]["buildings"][config.buildings[i]]);
				}
			} else {
				cities_string.push("This city does not exist!");
			}

			longMessage(cities_string, arg2_msg);
		}

		function printStats (arg0_user, arg1_username, arg2_msg) {
			var stats_string = [];

			if (main.users[arg0_user] == undefined) {
				arg2_msg.channel.send("The person you are looking for has no country!");

			} else {

				var percentage_manpower = main.users[arg0_user].manpower_percentage*100;

				stats_string.push(":bust_in_silhouette: User: <@" + arg0_user + ">");
				stats_string.push(":map: Country: **" + main.users[arg0_user].name + "**");
				stats_string.push("------------------ \n**Statistics:**\n");
				stats_string.push(":man: Population: **" + new Intl.NumberFormat('de').format(main.users[arg0_user].population) + "**");
				stats_string.push(":guard: Manpower: (**" + new Intl.NumberFormat('de', {style: 'decimal'}).format(main.users[arg0_user].used_manpower) + "**/**" + new Intl.NumberFormat('de', {style: 'decimal'}).format(main.users[arg0_user].initial_manpower) + "**) ¦ (**" + 75 + "%**)");
				stats_string.push(":pound: Money (£): **" + new Intl.NumberFormat('de', {style: 'decimal'}).format(main.users[arg0_user].money) + "**" + " (:pound: **+" + 0 + "** per turn).\n");
				stats_string.push(":test_tube: Technological Era: **" + main.users[arg0_user].technology_level + "**\n");
				stats_string.push(":crossed_swords: Military Technology: **" + main.users[arg0_user].military_tech + "**");
				stats_string.push(":chart: Economic Technology: **" + main.users[arg0_user].economic_tech + "**");
				stats_string.push(":scroll: Administrative Technology: **" + main.users[arg0_user].administrative_tech + "**");
				stats_string.push("------------------ \n**Internal Politics:**\n");
				stats_string.push(":classical_building: Government: **" + main.users[arg0_user].government + "**");
				stats_string.push(":bar_chart: Political Capital: **" + main.users[arg0_user].political_capital + "**\n");
				stats_string.push(":moneybag: Tax Rate: **" + main.users[arg0_user].tax_rate*100 + "**%");
				stats_string.push(":scales: Stability: **" + main.users[arg0_user].stability + "**%");
				stats_string.push(":ship: Blockaded: **" + main.users[arg0_user].blockaded + "**");
				stats_string.push("------------------ \n**Diplomacy:**\n");
				stats_string.push(":dove: Diplomatic Slots: (**" + main.users[arg0_user].used_diplo_slots + "**/**" + main.users[arg0_user].diplo_slots + "**)");
				stats_string.push(":pirate_flag: Infamy: **" + main.users[arg0_user].infamy + "**");

				arg2_msg.channel.send(stats_string.join("\n"));
			}
		}

		function printPolitics (arg0_user, arg1_username, arg2_msg) {
			var politics_string = [];

			if (main.users[arg0_user] == undefined) {
				arg2_msg.channel.send("The person you are looking for has no country!");

			} else {

				politics_string.push(":bust_in_silhouette: User: <@" + arg0_user + ">");
				politics_string.push(":map: Country: " + main.users[arg0_user].name);
				politics_string.push("------------------ \n**Ruling Government:**\n");
				politics_string.push(":classical_building: Government Type: " + main.users[arg0_user].government);
				politics_string.push("------------------ \n**Internal Politics:**\n");
				for (var i = 0; i < government_list.length; i++) {
					politics_string.push(main.users[arg0_user]["politics"][government_list[i]] + "% of the population believes in " + government_list[i] + ".");
				}
				arg2_msg.channel.send(politics_string.join("\n"));
			}
		}

		function printStability (arg0_user, arg1_username, arg2_msg) {
			var stability_string = [];

			if (main.users[arg0_user] == undefined) {
				arg2_msg.channel.send("The person you are looking for has no country!");
			} else {
				var user_id = main.users[arg0_user];
				var tax_rate = user_id.tax_rate;
				var ruling_party_popularity = user_id["politics"][user_id.government];

				var stab_government_modifier = 0;
				var stab_government_text = "";
				var stab_government_prefix = "";

				if (user_id.government != "communism" && user_id.government != "fascism" && user_id.government != "absolute_monarchy") {
					stab_government_modifier = 5;
					stab_government_text = "due to the current government believing in " + user_id.government + ".";
					stab_government_prefix = "+";
				} else {
					stab_government_modifier = -5;
					stab_government_text = "due to an authoritarian regime in power.";
				}

				var calculated_stability = Math.ceil(ruling_party_popularity + stab_government_modifier - tax_rate*100);

				stability_string.push(":bust_in_silhouette: User: <@" + arg0_user + ">");
				stability_string.push(":map: Country: " + main.users[arg0_user].name);
				stability_string.push("------------------ \n**Stability:**\n");
				stability_string.push("**+" + Math.ceil(ruling_party_popularity) + "%** from ruling party popularity.");
				stability_string.push("**-" + Math.ceil(tax_rate*100) + "%** from current tax rate.");
				stability_string.push("**" + stab_government_prefix + stab_government_modifier + "%** " + stab_government_text);
				stability_string.push("------------------ \n**Calculated Stability:**\n");
				stability_string.push(":scales: Calculated Stability: **" + calculated_stability + "%**");
				stability_string.push(":scales: Current Stability: **" + user_id.stability + "%**");

				if (calculated_stability < 70) {
					stability_string.push("------------------");
					stability_string.push("You have a :fire: **revolt risk** of **" + (70-calculated_stability) + "%**!");
				}

				arg2_msg.channel.send(stability_string.join("\n"));
			}
		}

		function printMilitary (arg0_user, arg1_username, arg2_msg) {
			var military_string = [];

			if (main.users[arg0_user] == undefined) {
				arg2_msg.channel.send("The person you are looking for has no country!");

			} else {

				military_string.push(":bust_in_silhouette: User: <@" + arg0_user + ">");
				military_string.push(":map: Country: " + main.users[arg0_user].name);
				military_string.push("------------------ \n:crossed_swords: **Units:**\n");
				for (var i = 0; i < config.visible_units.length; i++) {
					military_string.push("**" + config.visible_units[i] + "**: " + main.users[arg0_user]["military"][config.visible_units[i]]);
				}
				arg2_msg.channel.send(military_string.join("\n"));
			}
		}

		function buildRequest (arg0_user, arg1_message, arg2_name, arg3_costs, arg4_build_request, arg5_amount, arg6_city) {
			//Costs: [[5, "iron"],[1, "stone"]]
			var usr = arg0_user;
			var inventory = usr["inventory"];
			var print_results = [];

			var remaining_manpower = usr.initial_manpower - usr.used_manpower;

			if (arg4_build_request == arg2_name) {
				for (var x = 0; x < arg5_amount; x++) {
					console.log("Request to build " + arg5_amount + " " + arg2_name + " was recieved.");
					var checks_passed = 0;

					for (var i = 0; i < arg3_costs.length; i++) {
						if (arg3_costs[i][1] == "manpower") {
							if (remaining_manpower >= arg3_costs[i][0]) {
								checks_passed++;
							}
						} else if (arg3_costs[i][1] == "money") {
							if (usr.money >= arg3_costs[i][0]) {
								checks_passed++;
							}
						} else if (arg3_costs[i][1] == "military_tech") {
							if (usr.military_tech >= arg3_costs[i][0]) {
								checks_passed++;
							}
						} else if (arg3_costs[i][1] == "economic_tech") {
							if (usr.economic_tech >= arg3_costs[i][0]) {
								checks_passed++;
							}
						} else if (arg3_costs[i][1] == "admin_tech") {
							if (usr.admin_tech >= arg3_costs[i][0]) {
								checks_passed++;
							}
						} else {
							if (inventory[arg3_costs[i][1]] >= arg3_costs[i][0]) {
								checks_passed++;
							}
						}
					}

					if (checks_passed >= arg3_costs.length) {
						var single_object = arg2_name;

						for (var i = 0; i < arg3_costs.length; i++) {
							if (arg3_costs[i][1] == "manpower") {
								if (remaining_manpower >= arg3_costs[i][0]) {
									usr.used_manpower = usr.used_manpower + arg3_costs[i][0];
								}
							} else if (arg3_costs[i][1] == "money") {
								if (usr.money >= arg3_costs[i][0]) {
									usr.money = usr.money - arg3_costs[i][0];
								}
							} else {
								if (inventory[arg3_costs[i][1]] >= arg3_costs[i][0]) {
									inventory[arg3_costs[i][1]] = inventory[arg3_costs[i][1]] - arg3_costs[i][0];
								}
							}
						}
						single_object = single_object.replace("factories","factory");
						single_object = single_object.replace(/s$/,"")
						print_results.push("You have successfully built a **" + single_object + "**!");
						
						var city_name = "";
						
						for (var i = 0; i < usr.cities.city_array.length; i++) {
							if (usr.cities[usr.cities.city_array[i]].name.indexOf(arg6_city) != -1) {
								city_name = usr.cities[usr.cities.city_array[i]].name;
							}
						}
						
						if (city_name == "") {
							print_results.push("The city you have specified proved more elusive than El Dorado!");
						} else {
							usr["cities"][city_name]["buildings"][arg2_name]++;
						}
					} else {
						print_results.push("You don't have the resources to build this!");
						console.log(print_results.join("\n"));
					}
				}

				arg1_message.channel.send(print_results.join("\n"));
			}
		}

		function build (arg0_user, arg1_msg, arg2_building, arg3_amount, arg4_city) {
			if (main.users[arg0_user] == undefined) {
				arg1_msg.channel.send("You don't have a country yet!");
			} else {
				var usr = main.users[arg0_user];
				var inventory = main.users[arg0_user]["inventory"];
				var result_string = [];
				var building_exists = false;

				for (var i = 0; i < config.buildings.length; i++) {
					if (arg2_building == config.buildings[i]) {
						building_exists = true;
					}
				}

				if (arg2_building == "farms") {
					building_exists = true;
				}

				if (building_exists) {
					buildRequest(usr, arg1_msg, "farms", [[1, "wood"]], arg2_building, arg3_amount, arg4_city);

				} else {
					result_string.push("You were unable to build this building.");
				}

				arg1_msg.channel.send(result_string.join("\n"));
			}
		}

		function craftRequest (arg0_user, arg1_message, arg2_name, arg3_costs, arg4_build_request, arg5_amount, arg6_int) {
			//Costs: [[5, "iron"],[1, "stone"]]
			var usr = arg0_user;
			var military = usr["military"];
			var inventory = usr["inventory"];
			var print_results = [];
			var tech_request = false;

			var remaining_manpower = usr.initial_manpower - usr.used_manpower;

			if (arg4_build_request == arg2_name) {

				for (var x = 0; x < arg5_amount; x++) {
					console.log("Request to build " + arg5_amount + " " + arg2_name + " was recieved.");
					var checks_passed = 0;

					for (var i = 0; i < arg3_costs.length; i++) {
						if (arg3_costs[i][1] == "manpower") {
							if (remaining_manpower >= arg3_costs[i][0]) {
								checks_passed++;
							}
						} else if (arg3_costs[i][1] == "money") {
							if (usr.money >= arg3_costs[i][0]) {
								checks_passed++;
							}
						} else if (arg3_costs[i][1] == "tech") {
							if (usr.technology_level >= arg3_costs[i][0]) {
								checks_passed++;
							}
						} else {
							if (inventory[arg3_costs[i][1]] >= arg3_costs[i][0]) {
								checks_passed++;
							}
						}
					}

					if (checks_passed >= arg3_costs.length) {
						var single_object = arg2_name;
						single_object = single_object.replace("factories","factory");
						single_object = single_object.replace(/s$/,"")
						print_results.push("You have successfully built a **" + single_object + "**!");
						if (tech_request != true) {
							usr["military"][arg2_name] = usr["military"][arg2_name] + arg6_int;
						}

						for (var i = 0; i < arg3_costs.length; i++) {
							if (arg3_costs[i][1] == "manpower") {
								if (remaining_manpower >= arg3_costs[i][0]) {
									usr.used_manpower = usr.used_manpower + arg3_costs[i][0];
								}
							} else if (arg3_costs[i][1] == "money") {
								if (usr.money >= arg3_costs[i][0]) {
									usr.money = usr.money - arg3_costs[i][0];
								}
							} else {
								if (inventory[arg3_costs[i][1]] >= arg3_costs[i][0]) {
									inventory[arg3_costs[i][1]] = inventory[arg3_costs[i][1]] - arg3_costs[i][0];
								}
							}
						}
					} else {
						print_results.push("You were unable to craft this item!");
						console.log(print_results.join("\n"));
					}
				}

				arg1_message.channel.send(print_results.join("\n"));
			}
		}

		function craft (arg0_user, arg1_msg, arg2_crafting, arg3_amount) {
			if (main.users[arg0_user] == undefined) {
				arg1_msg.channel.send("You don't have a country yet!");
			} else {
				var usr = main.users[arg0_user];
				var military = main.users[arg0_user]["military"];
				var result_string = [];
				var unit_exists = false;

				for (var i = 0; i < config.units.length; i++) {
					if (arg2_crafting == config.units[i]) {
						unit_exists = true;
					}
				}
				if (unit_exists) {
					//craftRequest(usr, arg1_msg, "farms", [[10, "lumber"], [5, "iron"], [1500, "money"], [500, "manpower"]], arg2_building, arg3_amount);

					craftRequest(usr, arg1_msg, "settlers", [[5, "iron"], [5, "wood"], [5000, "money"], [1, "tech"]], arg2_crafting, arg3_amount, 1);

					craftRequest(usr, arg1_msg, "icebreakers", [[15, "iron"], [20, "wood"], [20, "petrol"], [2, "gold"], [10, "lead"], [20000, "money"], [4, "tech"]], arg2_crafting, arg3_amount, 1);
					craftRequest(usr, arg1_msg, "landnoughts", [[1, "heat_cores"], [30, "iron"], [20, "lead"], [1, "gold"], [10, "petrol"], [50000, "money"], [4, "tech"]], arg2_crafting, arg3_amount, 1);
				} else {
					result_string.push("No such recipe exists!");
				}

				arg1_msg.channel.send(result_string.join("\n"));
			}
		}

		function research (arg0_user, arg1_message, arg2_name) {
			var tech_name = arg2_name;
			var msg = arg1_message;
			var usr = main.users[arg0_user];
			
			{
				if (tech_name == "caravel") {
					if (usr.research_points >= 100) {
						
					}
				}
			}
		}
	}

	//Logic
	{
		setTimeout(function(){
			console.log("[Ampersand] is ready to recieve data requests!");
			setInterval(function(){
				fs.writeFile('database.js', JSON.stringify(main), function (err,data) {
					if (err) {
						return console.log(err);
					}
				});

				//Check if a turn has passed

				if (main.lastTurn == undefined) {
					main.lastTurn = new Date().getTime();
				} else {
					var current_date = new Date().getTime();
					var time_difference = current_date - main.lastTurn;
					if (time_difference > turn_timer*1000) {
						for (var i = 0; i < Math.floor(time_difference/(turn_timer*1000)); i++) {

							if (main.roundCount == undefined) {
								main.roundCount = 0;
							} else {
								main.roundCount++;
							}

							for (var x = 0; x < main.user_array.length; x++) {
								nextTurn(main.user_array[x]);
							}

							if (main.roundCount % 3 == 0) {
								returnChannel(announcements_channel).send("<@&704386037148942446> A turn has elapsed! It is now round **" + main.roundCount + "**.");
							} else {
								returnChannel(announcements_channel).send("<@&704386037148942446> A turn has elapsed! It is now round **" + main.roundCount + "**.");
							}
							main.lastTurn = current_date;

							for (var x = 0; x < news.length; x++) {
								returnChannel(announcements_channel).send(news[x]);
							}

							news = [];
						}
					}
				}

				for (var x = 0; x < main.user_array.length; x++) {
					initUser(main.user_array[x]);
				}

			}, 100);
		},1000);
	}
}

client.on('ready', () => {
	client.user.setPresence({ activity: { name: "Midnighter RP"}, status: 'online'}).then(console.log).catch(console.error);
})

client.on('message', message => {
	//Get arguments
	var arg = [];

	//Initialisation end

	username = message.author.username;
	user_id = message.author.id;
    input = message.content;

	//Parse arguments
	arg = message.content.split(" ");
	console.log("Author: " + username);
	console.log(message.content);
	console.log(arg);

	if (arg[0].indexOf(bot_prefix) != -1) {

		//General commands
		{
			if (equalsIgnoreCase(arg[0], "help")) { //$help
				message.channel.send(help);
			}

			if (equalsIgnoreCase(arg[0], "roll")) { //$roll
				if (arg.length == 2) {
					//message.channel.send
					if (arg[1].indexOf("-") == -1) { //$roll arg1
						message.channel.send("You rolled a **" + randomNumber(1, parseInt(arg[1])) + "**.");
					} else { //$roll arg1-arg2
						var subargs = arg[1].split("-");
						message.channel.send("You rolled a **" + randomNumber(subargs[0], subargs[1]) + "**.");
					}
				} else if (arg.length == 3) {
					message.channel.send("You rolled a **" + randomNumber(parseInt(arg[1]), parseInt(arg[2])) + "**.");
				}
			}
		}

		//Administrative commands
		{
			if (hasRole(message, 'First Minister (Moderator)')) {
				if (equalsIgnoreCase(arg[0], "create")) { //$create @user int material
					if (arg.length > 1) {
						var target_user = returnMention(arg[1]);
						var material_exists = false;

						for (var i = 0; i < config.materials.length; i++) {
							if (config.materials[i] == arg[3]) {
								material_exists = true;
							}
						}

						if (material_exists) { //Execute command
							modifyItem(target_user, arg[2], arg[3], "add");
							console.log(JSON.stringify(main));
							message.channel.send("You gave " + arg[2] + " " + arg[3] + " to <@!" + target_user + ">.");
						} else {
							message.channel.send("Material '" + arg[3] + "' was not found.");
						}
					} else {
						message.channel.send("Invalid amount of arguments!");
					}
				}

				if (equalsIgnoreCase(arg[0], "remove") || equalsIgnoreCase(arg[0], "delete")) { //$remove @user int material
					if (arg.length > 1) {
						var target_user = returnMention(arg[1]);
						var material_exists = false;

						for (var i = 0; i < config.materials.length; i++) {
							if (config.materials[i] == arg[3]) {
								material_exists = true;
							}
						}

						if (material_exists) { //Execute command
							modifyItem(target_user, arg[2], arg[3], "remove");
							console.log(JSON.stringify(main));
							message.channel.send("You deleted " + arg[2] + " " + arg[3] + " from <@!" + target_user + ">.");
						} else {
							message.channel.send("Material '" + arg[3] + "' was not found.");
						}
					} else {
						message.channel.send("Invalid amount of arguments!");
					}
				}

				if (equalsIgnoreCase(arg[0], "blockade")) { //$blockade <@user>
					if (arg.length > 1) {
						var target_user = returnMention(arg[1]);
						if (main.users[target_user] != undefined) {
							if (main.users[target_user].blockaded) {
								main.users[target_user].blockaded = false;
								message.channel.send("The country of " + main.users[target_user].name + " is no longer blockaded.");
							} else if (main.users[target_user].blockaded == false) {
								main.users[target_user].blockaded = true;
								message.channel.send("The country of " + main.users[target_user].name + " was blockaded.");
							}
						} else {
							message.channel.send("The person you are trying to blockade doesn't even have a country!");
						}
					} else {
						message.channel.send("Invalid amount of arguments!");
					}
				}

				if (equalsIgnoreCase(arg[0], "eval")) { //$eval <@user> [property] [value]
					if (arg.length == 4) {
						var target_user = returnMention(arg[1]);
						eval("main.users['" + target_user + "']" + arg[2] + " = " + arg[3] + ";");
						message.channel.send("Eval command executed. Warning! This command can be highly unstable if not used correctly.");
					}
				}

				if (equalsIgnoreCase(arg[0], "exhaust")) { //$eval <@user>
					if (arg.length == 2) {
						var target_user = returnMention(arg[1]);
						main.users[target_user]["military"].settlers = 0;
						message.channel.send("<@" + target_user + "> has exhausted their colonists on expansion!");
					}
				}
			}
		}

		//Country commands
		{
			if (hasRole(message, '🗾 ¦ Country')) {
				if (equalsIgnoreCase(arg[0], "found")) { //$found <country_name>
					var target_user = returnMention(user_id);

					if (arg.length > 1) {
						initUser(target_user);
						var full_name = [];
						for (var i = 1; i < arg.length; i++) {
							full_name.push(arg[i]);
						}
						main.users[target_user].name = full_name.join(" ");
						message.channel.send("You have been successfully registered!\nDo `$government <government>` to set your government type. For a list of available government types, type `$government list`.");
					}
				}

				if (equalsIgnoreCase(arg[0], "government")) { //$government [list¦government_type]
					var target_user = returnMention(user_id);
					if (arg.length == 2 && main.users[target_user] != undefined) {
						if (arg[1] == "list") {
							message.channel.send("Valid governments: " + government_list.join(", "));
						} else {
							if (main.users[target_user].government == "") {
								var government_exists = false;

								for (var i = 0; i < government_list.length; i++) {
									if (government_list[i] == arg[1]) {
										government_exists = true;
									}
								}

								if (government_exists) {
									message.channel.send("Your government has been changed to: " + arg[1]);
									setGovernment(main.users[target_user], arg[1]);
									main.users[target_user]["politics"][arg[1]] = 100;
								} else {
									message.channel.send("That government does not exist!");
								}
							} else {
								message.channel.send("You can't change your government on a whim!");
							}
						}
					} else {
						message.channel.send("Too few arguments were included in your command. Please try again.");
					}
				}

				if (equalsIgnoreCase(arg[0], "governments")) { //$governments
					message.channel.send(governments);
				}

				if (equalsIgnoreCase(arg[0], "politics")) { //$politics <@user>
					if (arg.length == 1) {
						var target_user = returnMention(user_id);
						printPolitics(target_user, username, message);
					} else {
						var target_user = returnMention(arg[1]);
						printPolitics(target_user, username, message);
					}
				}

				if (equalsIgnoreCase(arg[0], "inv") || equalsIgnoreCase(arg[0], "inventory")) { //$inv <@user>
					if (arg.length == 1) {
						var target_user = returnMention(user_id);
						printInv(target_user, username, message);
					} else if (arg.length == 2) {
						var target_user = returnMention(arg[1]);
						printInv(target_user, username, message);
					}
				}

				if (equalsIgnoreCase(arg[0], "industry") || equalsIgnoreCase(arg[0], "buildings")) { //$industry <@user>
					if (arg.length == 1) {
						var target_user = returnMention(user_id);
						printBuildings(target_user, username, message);
					} else if (arg.length == 2) {
						var target_user = returnMention(arg[1]);
						printBuildings(target_user, username, message);
					}
				}

				if (equalsIgnoreCase(arg[0], "craft")) { //$craft <item>
					var target_user = returnMention(user_id);
					if (arg.length == 2) {
						var target_user = returnMention(user_id);
						if (arg[1] == "list") {
							message.channel.send(unitcosts);
							message.channel.send(unitcosts2);
						} else {
							craft(target_user, message, arg[1], 1);
						}
					} else if (arg.length == 3) {
						craft(target_user, message, arg[1], arg[2]);
					}
				}

				if (equalsIgnoreCase(arg[0], "build")) { //$build <building> [int] <city>
					//arg0_user, arg1_msg, arg2_building, arg3_amount
					var target_user = returnMention(user_id);
					if (arg.length == 2) {
						message.channel.send("**:scroll: Building List:**\n------------------ \n" + rawbuildcosts.toString());
					} else if (arg.length == 3) {
						var target_user = returnMention(user_id);
						build(target_user, message, arg[1], 1, arg[2]);
					} else if (arg.length == 4) {
						build(target_user, message, arg[1], arg[2], arg[3]);
					} else {
						message.channel.send("Invalid number of arguments.");
					}
				}

				if (equalsIgnoreCase(arg[0], "new-city")) { //$new-city (arg0_user, arg1_name, arg2_type, arg3_message)
					var target_user = returnMention(user_id);

					var full_name = [];
					for (var i = 1; i < arg.length; i++) {
						full_name.push(arg[i]);
					}

					if (arg.length > 1) {
						if (main.users[target_user] != undefined) {
							var capital_exists = false;

							for (var i = 0; i < main.users[target_user].cities.city_array.length; i++) {
								if (main.users[target_user]["cities"][main.users[target_user].cities.city_array[i]].type == "capital") {
									capital_exists = true;
								}
							}

							if (capital_exists) {
								newCity(target_user, full_name.join(" "), "city", message);
							} else {
								newCity(target_user, full_name.join(" "), "capital", message);
							}
						} else {
							message.channel.send("You're currently stateless! Try registering first.");
						}
					} else {
						message.channel.send("Invalid amount of arguments.");
					}
				}

				if (equalsIgnoreCase(arg[0], "rename-city")) { //$rename-city <name> <new_name>
					var target_user = returnMention(user_id);

					var full_name = [];
					for (var i = 2; i < arg.length; i++) {
						full_name.push(arg[i]);
					}

					if (arg.length >= 2) {
						if (main.users[target_user] != undefined) {
							var city_exists = false;

							for (var i = 0; i < main.users[target_user].cities.city_array.length; i++) {
								if (main.users[target_user]["cities"][main.users[target_user].cities.city_array[i]].name.indexOf(arg[1]) != -1) {
									var old_name = main.users[target_user]["cities"][main.users[target_user].cities.city_array[i]].name;
									main.users[target_user]["cities"][main.users[target_user].cities.city_array[i]].name = full_name.join(" ");
									city_exists = true;
									message.channel.send("You have renamed **" + old_name + "** to **" + full_name.join(" ") + "**!");
								}
							}

							if (city_exists == false) {
								message.channel.send("The city that you have specified doesn't exist!");
							}
						} else {
							message.channel.send("You don't even have a nation to begin with!");
						}
					} else {
						message.channel.send("Invalid amount of arguments.");
					}
				}

				if (equalsIgnoreCase(arg[0], "city")) { //$city <@user> <city>
					if (arg.length >= 2) {
						var target_user = returnMention(user_id);
						if (main.users[target_user] != undefined) {

							var full_name = [];
							for (var i = 1; i < arg.length; i++) {
								full_name.push(arg[i]);
							}

							printCity(target_user, full_name.join(" "), message);
						}
					} else if (arg.length >= 3) {
						var target_user = returnMention(arg[1]);
						if (main.users[target_user] != undefined) {

							var full_name = [];
							for (var i = 2; i < arg.length; i++) {
								full_name.push(arg[i]);
							}
							printCity(target_user, full_name.join(" "), message);
						}
					}
				}

				if (equalsIgnoreCase(arg[0], "cities")) { //$cities <@user>
					if (arg.length == 1) {
						var target_user = returnMention(user_id);
						if (main.users[target_user] != undefined) {
							printCities(target_user, message);
						}
					} else if (arg.length == 2) {
						var target_user = returnMention(arg[1]);
						if (main.users[target_user] != undefined) {
							printCities(target_user, message);
						}
					}
				}

				if (equalsIgnoreCase(arg[0], "stats") || equalsIgnoreCase(arg[0], "info")) { //$stats <@user>
					if (arg.length == 1) {
						var target_user = returnMention(user_id);
						if (main.users[target_user] != undefined) {
							printStats(target_user, username, message);
						}
					} else if (arg.length == 2) {
						var target_user = returnMention(arg[1]);
						if (main.users[target_user] != undefined) {
							printStats(target_user, arg[1], message);
						}
					}
				}

				if (equalsIgnoreCase(arg[0], "military") || equalsIgnoreCase(arg[0], "mil")) { //$military <@user>
					if (arg.length == 1) {
						var target_user = returnMention(user_id);
						if (main.users[target_user] != undefined) {
							printMilitary(target_user, username, message);
						}
					} else if (arg.length == 2) {
						var target_user = returnMention(arg[1]);
						if (main.users[target_user] != undefined) {
							printMilitary(target_user, arg[1], message);
						}
					}
				}

				if (equalsIgnoreCase(arg[0], "settax")) { //$settax [int]
					if (arg.length == 2) {
						var target_user = returnMention(user_id);
						var new_tax = arg[1]/100;
						if (new_tax <= main.users[target_user].max_tax && main.users[target_user] != undefined) {
							main.users[target_user].tax_rate = new_tax;
							message.channel.send("Your tax rate has been set to **" + arg[1] + "%**.");
						} else {
							message.channel.send("Your government type doesn't allow for such a high tax rate!");
						}
					} else {
						message.channel.send("Invalid amount of arguments!");
					}
				}

				if (equalsIgnoreCase(arg[0], "coup")) { //$coup
					var target_user = returnMention(user_id);
					if (main.users[target_user] != undefined) {
						if (main.users[target_user].coup_this_turn == false) {
							main.users[target_user].coup_this_turn = true;
							message.channel.send("A coup has been initiated! It will occur next turn.");
						} else {
							message.channel.send("A coup has already been initiated! It will occur next turn.");
						}
					}
				}

				if (equalsIgnoreCase(arg[0], "overthrow")) { //$overthrow
					var target_user = returnMention(user_id);
					if (main.users[target_user] != undefined) {
						if (main.users[target_user].overthrow_this_turn == false) {
							main.users[target_user].overthrow_this_turn = true;
							message.channel.send("An overthrow of the government has been initiated! It will occur next turn.");
						} else {
							message.channel.send("An overthrow of the government has already been initiated! It will occur next turn.");
						}
					}
				}

				if (equalsIgnoreCase(arg[0], "vote")) { //$vote
					var target_user = returnMention(user_id);
					if (main.users[target_user] != undefined) {
						if (main.users[target_user].government == "republic" || main.users[target_user].government == "democracy") {
							var vote = randomNumber(0, 100);
							if (vote >= 50) {
								message.channel.send("The motion was passed, with :thumbsup: **" + vote.toString() + "** ayes, and :thumbsdown: **" + (100-vote).toString() + "** nays.");
							} else {
								message.channel.send("The motion was rejected, with :thumbsup: **" + vote.toString() + "** ayes, and :thumbsdown: **" + (100-vote).toString() + "** nays.");
							}
						} else {
							message.channel.send("You aren't even a democratic nation! '100%' of your voters say yes.");
						}
					}
				}

				if (equalsIgnoreCase(arg[0], "nextround")) { //$nextround
					var current_date = new Date().getTime();
					var time_difference = current_date - main.lastTurn;

					message.channel.send("It is currently round **" + main.roundCount + "**.\n" + parseMilliseconds((turn_timer*1000)-time_difference) + " remaining until the next turn.");
				}

				if (equalsIgnoreCase(arg[0], "stability") || equalsIgnoreCase(arg[0], "stab")) { //$stab <@user>
					var target_user = returnMention(user_id);
					if (arg.length > 1) {
						target_user = returnMention(arg[1]);
						printStability(target_user, username, message);
					} else {
						printStability(target_user, username, message);
					}
				}

				//give(arg0_user, arg1_user2, arg2_amount, arg3_item, arg4_mode, arg5_message)

				if (equalsIgnoreCase(arg[0], "give")) { //$give <@user> <int> <item>
					if (arg.length == 4) {
						var target_user = returnMention(arg[1]);
						var current_user = returnMention(user_id);
						console.log(target_user);
						if (main.users[target_user].blockaded == undefined || main.users[current_user].blockaded == undefined) {
							give(current_user, target_user, arg[2], arg[3], "item", message);
						} else if (main.users[target_user].blockaded || main.users[current_user].blockaded == undefined) {
							message.channel.send("The person you are trying to send these items to is currently blockaded!");
						} else {
							give(current_user, target_user, arg[2], arg[3], "item", message);
						}
					} else {
						message.channel.send("Invalid amount of arguments.");
					}
					message.channel.send("Current conditions do not allow for goods to be shipped out!");
				}

				if (equalsIgnoreCase(arg[0], "militarygive")) { //$militarygive <@user> <int> <item>
					if (arg.length == 4) {
						var target_user = returnMention(arg[1]);
						var current_user = returnMention(user_id);
						if (main.users[target_user].blockaded || main.users[current_user].blockaded == undefined) {
							message.channel.send("The person you are trying to send these items to is currently blockaded!");
						} else {
							give(current_user, target_user, arg[2], arg[3], "military", message);
						}
					} else {
						message.channel.send("Invalid amount of arguments.");
					}
				}

				if (equalsIgnoreCase(arg[0], "enact")) { //$enact <law> activate (arg0_user, arg1_name, arg2_message)
					var target_user = returnMention(user_id);

					if (main.users[target_user] != undefined) {
						if (arg.length == 2) {
							activate(target_user, arg[1], message);
						} else {
							message.channel.send("Invalid amount of arguments.");
						}
					} else {
						message.channel.send("You don't even have a country!");
					}
				}
			}
		}

		//Config commands
		{
			if (hasRole(message, 'Discord Developer')) {
				if (equalsIgnoreCase(arg[0], "set-announcements-channel")) { //$set-announcements-channel <channel id>
					if (arg[1] != undefined) {
						announcements_channel = arg[1];
						saveConfig();
						readConfig();
						message.channel.send("The announcements channel has been set to the following channel ID: " + arg[1] + ".\nIf the prefix doesn't work, try typing the command again.")
						announcements_channel = arg[1];
						saveConfig();
						readConfig();
					}
				}
				if (equalsIgnoreCase(arg[0], "set-prefix")) { //$set-prefix <prefix>
					if (arg[1] != undefined) {
						bot_prefix = arg[1];
						saveConfig();
						readConfig();
						message.channel.send("The bot prefix has been changed to " + arg[1] + ".\nIf the prefix doesn't work, try typing the command again.");
						help = rawhelp.toString().replace(/@/g, bot_prefix);

						bot_prefix = arg[1];
						saveConfig();
						readConfig();
						help = rawhelp.toString().replace(/@/g, bot_prefix);
					}
				}
				if (equalsIgnoreCase(arg[0], "set-round-time")) { //$set-round-time <seconds>
					if (arg[1] != undefined) {
						turn_timer = arg[1];
						saveConfig();
						readConfig();
						message.channel.send("Turns are now " + arg[1] + " seconds long.\nIf the prefix doesn't work, try typing the command again.");

						turn_timer = arg[1];
						saveConfig();
						readConfig();
					}
				}
				if (equalsIgnoreCase(arg[0], "reset-rounds")) { //$reset-rounds
					main.roundCount = 0;
					message.channel.send("Server rounds have been reset!");
				}
			}
		}
	}
})
