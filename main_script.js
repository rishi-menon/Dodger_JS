//canvas variables
var canvas;
var ctx;
var width;
var height;

const fps = 40;
const delta_time = 1/fps;

//coordinates of center of player
var player_pos_x;
var player_pos_y;
var player_health;
const player_size = 20;	//try to keep this even for good results ?
const player_half_size = player_size/2;
const player_starting_health = 100;

var player_alive = true;

var player_score = 1;


//spawning time variables
var next_spawn_time = 0;
//in milliseconds
const time_bw_spawns_min = 500;
const time_bw_spawns_max = 3000;

var master_block;

//health bar
const health_col = 0xff2222;
const health_thickness = 15;

//animation variables
//animation_screen variables
const screen_alpha_final = 0.8;
const screen_alpha_initial = 0;
const screen_animation_time = 0.8;	//in seconds
const screen_animation_col = 0x111111;
var screen_alpha_percent = 0;

//animation_score variable
const score_posy_initial = 40;
const score_posy_final = 300;
const score_animation_time = 0.9;	//in seconds
var score_percent = 0;
var score_posy = score_posy_initial;
const score_posx = 200;

//game over text
const go_alpha_final = 0.8;
const go_alpha_initial = 0;
const go_animation_time = 0.9;	//in seconds
const go_text_col = 0xeeee11;
const go_x = 120;
const go_y = 400;
var go_alpha_percent = 0;

//block constants
const block_prop = {
	size_x_min: 10,
	size_x_max: 20,
	size_y_min: 5,
	size_y_max: 10,
	speed_x_min: -8,
	speed_x_max: 8,
	speed_y_min: 50,
	speed_y_max: 200,
	initial_col: 0x0000FF,
	final_col: 0x00FFFF
};


window.onload = function () {
	//initialise canvas variables
	canvas = document.getElementById ("myCanvas");
	ctx = canvas.getContext ("2d");
	width = canvas.width;
	height = canvas.height;


	// console.log(block_prop.size_x_min);
	// console.log(block_prop.size_x_max);
	// console.log(block_prop.size_y_min);
	// console.log(block_prop.size_y_max);
	//
	// console.log(block_prop.speed_x_min);
	// console.log(block_prop.speed_x_max);
	// console.log(block_prop.speed_y_min);
	// console.log(block_prop.speed_y_max);

	master_block = new Block (0, 0, 0, 0, 0, 0, 0, 0, 0);
	Initialise_Game ();
	setInterval (Fixed_Update, 1000 * delta_time);

	canvas.addEventListener ("mousemove", Cal_Mouse_Pos);

	document.addEventListener ("keydown", function(evt) {
		if (!player_alive && evt.keyCode == 32) {
			//space key... restart game
			Initialise_Game ();
		}
	})
}

function Initialise_Game () {
	player_pos_x = 0.5*width;
	player_pos_y = 0.8*height;
	mouse_pos_x = 0.5*width;
	mouse_pos_y = 0.8*height;
	next_spawn_time = 0;
	player_alive = true;
	player_health = player_starting_health;

	//animation variables
	screen_alpha_percent = 0;
	score_percent = 0;
	score_posy = score_posy_initial;
	go_alpha_percent = 0;
	player_score = 1;
	master_block.Delete_All_Blocks ();
}

function End_Game () {
	player_alive = false;
	player_health = 0;
}

function Move_Player () {
	player_pos_x = Lerp (player_pos_x, mouse_pos_x, 0.15);
	player_pos_y = Lerp (player_pos_y, mouse_pos_y, 0.15);
}

function Play_Death_Animation () {
	//calculate percent and values
	var screen_alpha_val = screen_alpha_final;
	var go_alpha_val = go_alpha_final;
	if (score_percent < 1) {
		score_percent += delta_time / score_animation_time;
		score_posy = Lerp (score_posy_initial, score_posy_final, score_percent);
	}
	if (score_percent > 1) {
		score_percent = 1;
		score_posy = score_posy_final;
	}
	if (screen_alpha_percent < 1) {
		screen_alpha_percent += delta_time / screen_animation_time;
		screen_alpha_val = Lerp (screen_alpha_initial, screen_alpha_final, screen_alpha_percent);
	}
	if (screen_alpha_percent > 1) {
		screen_alpha_percent = 1;
	}
	if (go_alpha_percent < 1) {
		go_alpha_percent += delta_time / go_animation_time;
		go_alpha_val = Lerp (go_alpha_initial, go_alpha_final, go_alpha_percent);
	}
	if (screen_alpha_percent > 1) {
		go_alpha_percent = 1;
	}

	//do the animation part
	Draw_Rect (0, 0, width, height, hexa (screen_animation_col, screen_alpha_val));
	//display game over messsage
	ctx.font = "20px Arial";
    ctx.fillStyle = hexa (go_text_col, go_alpha_val);
    ctx.fillText("Press space to restart", go_x, go_y);

	//the score animation will be in FixedUpdate as that has to be displayed even when player is alive
}

function Fixed_Update () {
	//clear screen
	ctx.clearRect (0, 0, width, height);



	////////////////////////////////////////////////////////////////
	//MAIN LOGIC OF GAME
	// - Move player
	// - Generate blocks if necessary
	// - move blocks
	// - check collision with player
	// - check collision with bottom edge
	// - draw blocks

	//Play death animation and display game over text
	if (!player_alive) {
		Play_Death_Animation ();
	} else {
		//draw player
		Draw_Rect (player_pos_x - player_half_size, player_pos_y - player_half_size, player_size, player_size, 	hexa (0xAABB00, 1));
		//move player
		Move_Player ();

		//INCREASE SCORE

		//(1 - player_pos_y/(height * 0.8) gives a high value at the top
		//0.8 so as to effectively decrease the height...
		//so if player is really down, increment will be -ve
		var increment = delta_time * 1.2 * (1 - player_pos_y/(height * 0.8));
		player_score += increment;
		if (player_score < 1)
			player_score = 1;
	}

	//display score.... This has to be done after play death animation so that
	//the score is displayed over the fading screen
	Display_Score ();

	//Create a block even if player is dead
	var curr_time = (new Date ()).getTime ();
	if (curr_time > next_spawn_time) {
		//create new block
		master_block.Create_New_Block ();
		next_spawn_time = curr_time + Get_Next_Spawn_Time ();
	}

	//check if there are blocks in the game even if player is dead
	if (master_block.next != null) {
		master_block.next.Move ();
		//check if block goes out of screen
		master_block.next.Check_Bottom_Edge ();
	}

	//a block might have been deleted so check again if blocks are left on screen
	//only do if player is alive
	if (master_block.next != null && player_alive) {
		//check to see if block collides with player
		var collision_block = master_block.next.Check_Collision (player_pos_x, player_pos_y, player_half_size);
		if (collision_block != null) {
			//collision
			player_health -= collision_block.damage;
			collision_block.Delete_Block ();
			if (player_health <= 0)
				End_Game ();
		}
	}

	//a block might have been deleted so check again and draw
	if (master_block.next != null)
		master_block.next.Draw ();

		//move and draw player and draw health bar if player is alive
	if (player_alive) {


		//player_health/player_starting_health gives a percentage value
		//score should increase more if player is close to the top
		Draw_Rect (0, height - health_thickness, width*(player_health/player_starting_health), health_thickness, hexa (health_col, 0.6));
	}

	//game logic over
	////////////////////////////////////////////////////////////////////////
}

function Display_Score () {
	ctx.font = "25px Arial";
    ctx.fillStyle = "#00b049";
    ctx.fillText(player_score.toFixed(2), score_posx, score_posy);
}
