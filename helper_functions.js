var mouse_pos_x;
var mouse_pos_y;

//percentage of height at which dampening region begins
const multiplier_negative = 0.75;

function Cal_Mouse_Pos (evt) {
    var rect = canvas.getBoundingClientRect ();
    var root = document.documentElement;
    mouse_pos_x = evt.clientX - rect.left - root.scrollLeft;
    mouse_pos_y = evt.clientY - rect.top - root.scrollTop;
    // return {
    //     x: mouseX,
    //     y: mouseY
    // };
}

function Lerp (a, b, val) {
	return a + (b-a)*val;
}
function Lerp_Colour (a, b, value) {
		// # RRGGBB - each letter is 4 bytes
		var red = Lerp (a>>16, b>>16, value);
		var green = Lerp ((a>>8) & 0xFF, (b>>8) & 0xFF, value);
		var blue = Lerp (a & 0xFF, b & 0xFF, value);
		return ((red<<16) | (green<<8) | (blue));
}

function rgba (r, g, b, a) {
	return ("rgba(" + r.toString() + "," + g.toString() + "," + b.toString() + "," + a.toString() + ")");
}
function hexa (hex, a) {
	//0xRRGGBB
	return ("rgba(" + (hex>>16).toString() + "," + (hex>>8 & 0xFF).toString() + "," + (hex & 0xFF).toString() + "," + a.toString() + ")");
}

function Draw_Rect (x, y, l, b, col) {
	ctx.beginPath ();
	ctx.fillStyle = col;
	ctx.fillRect(x,y,l,b);
	ctx.closePath ();
}


function Get_Next_Spawn_Time () {
	return Lerp (time_bw_spawns_min, time_bw_spawns_max, Math.random());
}

function Get_Multiplier (percent) {
	//see desmos block game or try sketching graph to understand
	//it gives a high value when percent is close to 0 and a negative value when percent is
	// close to 1
	return (1 - percent/multiplier_negative);
}
