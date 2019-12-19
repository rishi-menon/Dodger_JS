const dampening_effect = 0.35;

function Block (pos_x, pos_y, len, breadth, sx, sy, damage, hex, alpha) {
	this.col = hexa (hex, alpha);
	this.x = pos_x;
	this.y = pos_y;
	this.sx = sx;	//speed in x direction (pixels/sec)
	this.sy = sy;	//speed in y direction (pixels/sec)
	this.width = len;
	this.height = breadth;
	this.damage = damage;
	this.next = null;
	this.prev = null;
}

Block.prototype.Move = function () {
	if (this.y > multiplier_negative*height) {
		this.x += this.sx * delta_time * dampening_effect;
		this.y += this.sy * delta_time * dampening_effect;
	} else {
		this.x += this.sx * delta_time;
		this.y += this.sy * delta_time;
	}
	if (this.next != null)
		this.next.Move ();
}

Block.prototype.Draw = function () {
	Draw_Rect (this.x, this.y, this.width, this.height, this.col);
	if (this.next != null) {
		this.next.Draw ();
	}
}

//checks collision of current object with player
Block.prototype.Check_Block_Collision = function (x, y, half_size) {
	//size is size of player
	//this.(x, y) are coordinates of top left corner
	//(x, y) are coordinates of center of player
	// console.log((x).toString() + "+" + half_size + " " + this.x);

	//check if bottom edge of player is above top edge of block
	if (y + half_size < this.y)
		return false;
	//check if top edge of player is below bottom edge of block
	if (y - half_size > this.y + this.height)
		return false;
	//check if right edge of player is to the left of the left edge of block
	if (x + half_size < this.x)
		return false;
	//check if left edge of player is to the right of the right edge of block
	if (x - half_size > this.x + this.width)
		return false;
	return true;
}

Block.prototype.Check_Collision = function (x, y, half_size) {

	if (this.Check_Block_Collision (x, y, half_size)) {
		return this;
	}
	if (this.next != null)
		return this.next.Check_Collision (x, y, half_size);
	else
		return null;
}

Block.prototype.Delete_Block = function () {
	if (this.next != null)
		this.next.prev = this.prev;
	this.prev.next = this.next;
	delete this;
}

Block.prototype.Print = function () {
	console.log(this);
	if (this.next != null)
		this.next.Print ();
}

Block.prototype.Check_Bottom_Edge = function () {
	if (this.next != null)
		this.next.Check_Bottom_Edge ();

	if (this.y > height)
		this.Delete_Block ();
}
Block.prototype.Create_New_Block = function () {
	//create random values for x_position, speed_x, y, length, breadth
	if (this.next == null) {
		var pos_x = Lerp (0.05*width, 0.95*width, Math.random());
		var len = Lerp (block_prop.size_x_min, block_prop.size_x_max, Math.random());
		var breadth = Lerp (block_prop.size_y_min, block_prop.size_y_max, Math.random());
		var speed_x = Lerp (block_prop.speed_x_min, block_prop.speed_x_max, Math.random());
		var speed_y = Lerp (block_prop.speed_y_min, block_prop.speed_y_max, Math.random());

		var rand_percent = Math.random();
		var hex = Lerp_Colour (block_prop.initial_col, block_prop.final_col, rand_percent);
		var damage = Math.floor (Lerp (block_prop.initial_dmg, block_prop.final_dmg, rand_percent));
		// Block (pos_x, pos_y, len, breadth, sx, sy, damage, hex, alpha)
		this.next = new Block (pos_x, 0, len, breadth, speed_x, speed_y, damage, hex, 0.5);
		this.next.prev = this;
	} else {
		this.next.Create_New_Block ();
	}
}
Block.prototype.Delete_All_Blocks = function () {
	if (this.next != null) {
		this.next.Delete_All_Blocks ();
	}
	this.next = null;
	this.prev = null;
	delete this;
}
