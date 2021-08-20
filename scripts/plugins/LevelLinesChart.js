class Chart {
	constructor(ctx, data) {
		this.ctx = ctx;
		this.debug = false;

		//settings
		this.ss = {}
		this.ss.edges = {
			left: 10,
			right: 10,
			top: 10,
			bottom: 10
		}
			
		this.ss.offset_Oy_labels = 10;

		this.ss.font_number = {
			size: 13,
			family: "Comic Sans MS",
		}
		this.ss.font_number.value = `${this.ss.font_number.size}px ${this.ss.font_number.family}`;


		this.ss.font_label = {
			size: 20,
			family: "Tahoma"
		}
		this.ss.font_label.value = `${this.ss.font_label.size}px ${this.ss.font_label.family}`;
		
		this.ss.min_axes_offsets = {x: 5, y: 5};
		this.ss.max_axes_offsets = {x: 25, y: 25};
		this.ss.axis_offsets = {x: 5, y: 5};
		this.ss.label_padding = 2;
		this.ss.little_pin_length = 5;
		this.ss.big_pin_length = 10;
		this.ss.axis_labels = {x: "X", y: "Y"};

		//temp
		this.main_frame = {};
		this.axis_steps = {};
		this.axisOy_frame = {};
		this.axisOx_frame = {};
		this.labelOy_frame = {};
		this.labelOx_frame = {};
		this.window = {
			x: 0,
			y: 0,
			width: ctx.canvas.clientWidth,
			height: ctx.canvas.clientHeight
		};
		
		//data
		this.data = {
			axis_vals: {},
			axis_steps: {},
			limits: {}
		};
		this.data.limits.x1 = data.limits.x[0];
		this.data.limits.x2 = data.limits.x[1];
		this.data.limits.y1 = data.limits.y[0];
		this.data.limits.y2 = data.limits.y[1];
		this.data.setsOfPoints = data.data;

		//init main current frame
		this.frame = {
			x: this.ss.edges.left,
			y: this.ss.edges.top,
			width: this.window.width - (this.ss.edges.left + this.ss.edges.right), 
			height: this.window.height - (this.ss.edges.top + this.ss.edges.bottom)
		}

		this.main_frame = Object.assign({}, this.frame);

		this.labelOy_frame.x = this.frame.x
		this.labelOy_frame.y = this.frame.y
		this.labelOy_frame.width = this.ss.font_label.size + 2*this.ss.label_padding;
		this.labelOy_frame.height = this.frame.height - this.labelOy_frame.width;

		this.updateFrame(this.frame, this.labelOy_frame);

		this.labelOx_frame.height = this.ss.font_label.size + 2*this.ss.label_padding;
		this.labelOx_frame.width = this.frame.width;
		this.labelOx_frame.x = this.frame.x;
		this.labelOx_frame.y = this.frame.y + this.frame.height - this.labelOx_frame.height;

		this.updateFrame(this.frame, this.labelOx_frame);

		this.axisOy_frame.x = this.labelOy_frame.x + this.labelOy_frame.width;
		this.axisOy_frame.y = this.frame.y;
		this.axisOx_frame.height = this.ss.font_label.size + 2*this.ss.label_padding + this.ss.font_number.size/2;

		if (this.debug) {
			this.ctx.strokeRect(0, 0, this.window.width, this.window.height);
			this.strokeRect(this.labelOy_frame);
			this.strokeRect(this.labelOx_frame)
			this.strokeRect(this.frame)
			this.strokeRect(this.axisOy_frame);
			this.strokeRect(this.axisOx_frame);
		}

		

		this.data.axis_vals.y = this.axisIntermediateLabels(this.data.limits.y1, 
													        this.data.limits.y2, 
													        "y").reverse();
		this.axisOy_frame.width = this.maxLengthText(this.data.axis_vals.y, 
			                                         this.ss.font_number.value) + 2*this.ss.label_padding + this.ss.font_number.size/2;

		this.updateFrame(this.frame, this.axisOy_frame);

		this.data.axis_vals.x = this.axisIntermediateLabels(this.data.limits.x1, 
													   this.data.limits.x2, 
													   "x");
		this.axisOx_frame.x = this.frame.x;
		this.axisOx_frame.y = this.frame.y + this.frame.height - this.axisOx_frame.height;

		this.updateFrame(this.frame, this.axisOx_frame);

		// //oy axis frame
		if (this.debug) {
			this.strokeRect(this.axisOy_frame);
			this.strokeRect(this.axisOx_frame);
		}

		this.data.setsOfPoints.forEach( item => {
			this.drawGraph(item, this.frame);
		});


		this.update();
	}

	update() {
		this.updateGraphWindow(this.window, this.frame);
		this.drawAxisLabels(this.axis_labels);
		this.strokeRect(this.frame);
		this.drawGrid(this.frame);
		this.buildAxisOy(this.axisOy_frame, this.data.axis_vals.y);
		this.buildAxisOx(this.axisOx_frame, this.data.axis_vals.x);
	}
	updateGraphWindow(mainframe, frame) {
		this.ctx.save();
		this.ctx.fillStyle = "white";

		const ll_offset = frame.x - mainframe.x;
		const tt_offset = frame.y - mainframe.y;

		const rl_offset = ll_offset + frame.width
		const rr_offset = mainframe.width - rl_offset;

		const bt_offset = tt_offset + frame.height;
		const bb_offset = mainframe.height - bt_offset;
		
		let tempFrame;

		tempFrame = Object.assign({}, mainframe);
		tempFrame.height = tt_offset;
		this.fillRect(tempFrame);


		tempFrame = Object.assign({}, mainframe);
		tempFrame.x += rl_offset;
		tempFrame.width = rr_offset;
		this.fillRect(tempFrame);

		tempFrame = Object.assign({}, mainframe);
		tempFrame.y += bt_offset;
		tempFrame.height = bb_offset;
		this.fillRect(tempFrame);

		tempFrame = Object.assign({}, mainframe);
		tempFrame.width = ll_offset;
		this.fillRect(tempFrame);


		this.ctx.restore();
	}

	strokeRect(frame) {
		this.ctx.strokeRect(frame.x, frame.y, frame.width, frame.height)
	}

	fillRect(frame) {
		this.ctx.fillRect(frame.x, frame.y, frame.width, frame.height)
	}

	maxLengthText(text, font) {
		this.ctx.save();
		this.ctx.font = font;

		const result = Math.max.apply(null, ( text.map( item => {
			return this.ctx.measureText(item).width;
		})));
		
		this.ctx.restore();
		return result;
	}

	axisIntermediateLabels(min, max, axis) {
		const points_in_stack = 5;
		let length;
		let val_length = max - min;

		if(axis == "y") {
			length = this.frame.height - this.axisOx_frame.height;
			this.axisOy_frame.height = length
		} else {
			length = this.frame.width;
			this.axisOx_frame.width = length;
		}

		const min_offset = this.ss.min_axes_offsets[axis];
		const max_offset = this.ss.max_axes_offsets[axis];

		const max_points = parseInt(length / (min_offset * points_in_stack), 10) / + 1;
		let min_points = parseInt(length / (max_offset * points_in_stack), 10) / + 1;
		min_points = min_points < 4 ? 4 : min_points;

		let best_data = [], min_width, best_step;
		let temp_data, temp_width, val_step;
		for(let i = min_points; i <= max_points; i++) {
			temp_data = []
			val_step = val_length / (i - 1);

			for(let j = 0; j < i; j++) {
				temp_data.push(min + j*val_step);
			}

			temp_width = this.maxLengthText(temp_data, this.ss.font_number.value);
			if(min_width == undefined || temp_width < min_width) {
				min_width = temp_width;
				best_data = temp_data;
				best_step = val_step;
			} 
		}

		this.ss.axis_offsets[axis] = length / ((best_data.length - 1) * points_in_stack );
		this.data.axis_steps[axis] = best_step / points_in_stack;

		return best_data;
	}

	drawAxisLabels() {
		this.ctx.save();

	    this.ctx.textAlign = "center";
	    this.ctx.textBaseline = "middle";
		this.ctx.font = this.ss.font_label.value;

		const center_Ox = {
			x: this.labelOx_frame.x + this.labelOx_frame.width/2,
			y: this.labelOx_frame.y + this.labelOx_frame.height/2
		}

		this.ctx.fillText(this.ss.axis_labels.x, center_Ox.x, center_Ox.y);

		const center_Oy = {
			x: this.labelOy_frame.x + this.labelOy_frame.width/2,
			y: this.labelOy_frame.y + this.labelOy_frame.height/2
		}

		this.ctx.rotate(-Math.PI/2);
		this.ctx.fillText(this.ss.axis_labels.y, -center_Oy.y, center_Oy.x);

		this.ctx.restore();
	}

	updateFrame(frame, object) {
		if(object.x < frame.x || object.y < frame.y || 
		   object.width > frame.width || object.height > frame.height) {
			console.err("Update frame have no object");
			return;
		} 

		//first letter is direction of object
		//seconde letter is direction of frame
		const ll_offset = object.x - frame.x;
		const tt_offset = object.y - frame.y;

		const rl_offset = ll_offset + object.width
		const rr_offset = frame.width - rl_offset;

		const bt_offset = tt_offset + object.height;
		const bb_offset = frame.height - bt_offset;

		const s1 = frame.width * tt_offset;
		const s2 = frame.height * rr_offset;
		const s3 = frame.width * bb_offset;
		const s4 = frame.height * ll_offset;
		const maxS = Math.max.apply(null, [s1, s2, s3, s4]);
		
		if (s1 == maxS) {
			frame.height = tt_offset;
		} else if (s2 == maxS) {
			frame.x += rl_offset;
			frame.width = rr_offset;
		} else if (s3 == maxS) {
			frame.y += bt_offset;
			frame.height = bb_offset;
		} else {
			frame.width = ll_offset;
		}
	}

	drawGrid(frame){
		const little_pin_length = this.ss.little_pin_length;
		const big_pin_length = this.ss.big_pin_length;
		const x_offset = this.ss.axis_offsets.x;
		const y_offset = this.ss.axis_offsets.y;

		const x1 = frame.x;
		const y1 = frame.y;
		const x2 = frame.x + frame.width;
		const y2 = frame.y + frame.height;

		const pin_x_count = frame.width / x_offset;
		const pin_y_count = frame.height / y_offset;
		for(let i = 1; i < pin_x_count; i++) {
			this.ctx.beginPath();
			const x = x1 + i*x_offset;
			this.ctx.moveTo(x, y1);

			if (i % 5 == 0) {
				this.ctx.lineTo(x, y1 + big_pin_length);
			} else {
				this.ctx.lineTo(x, y1 + little_pin_length);
			}

			this.ctx.stroke();

			this.ctx.beginPath();
			this.ctx.moveTo(x, y2);

			if (i % 5 == 0) {
				this.ctx.lineTo(x, y2 - big_pin_length);
			} else {
				this.ctx.lineTo(x, y2 - little_pin_length);
			}

			this.ctx.stroke();
		}

		for(let i = 1; i < pin_y_count; i++) {
			this.ctx.beginPath();
			const y = y1 + i*y_offset;
			this.ctx.moveTo(x1, y);

			if (i % 5 == 0) {
				this.ctx.lineTo(x1 + big_pin_length, y);
			} else {
				this.ctx.lineTo(x1 + little_pin_length, y);
			}

			this.ctx.stroke();

			this.ctx.beginPath();
			this.ctx.moveTo(x2, y);

			if (i % 5 == 0) {
				this.ctx.lineTo(x2 - big_pin_length, y);
			} else {
				this.ctx.lineTo(x2 - little_pin_length, y);
			}

			this.ctx.stroke();
		}
	}

	buildAxisOy(frame, data){
		this.ctx.save();

		this.ctx.font = this.ss.font_number.value;
		this.ctx.textAlign = "right";
		this.ctx.textBaseline = "middle";

		let x = frame.x + frame.width - this.ss.label_padding - this.ss.font_number.size/2;
		let y = frame.y;

		let complex_offset = 5*this.ss.axis_offsets.y;
		for(let i = 0; i < data.length; i++) {
			this.ctx.fillText(data[i], x, y + i*complex_offset);
		}

		this.ctx.restore();
	}

	buildAxisOx(frame, data){
		this.ctx.save();

		this.ctx.font = this.ss.font_number.value;
		this.ctx.textAlign = "center";
		this.ctx.textBaseline = "bottom";

		let x = frame.x;
		let y = frame.y + frame.height/2 + this.ss.label_padding + this.ss.font_number.size/2;

		let complex_offset = 5*this.ss.axis_offsets.x;
		for(let i = 0; i < data.length; i++) {
			this.ctx.fillText(data[i], x + i*complex_offset, y);
		}

		this.ctx.restore();
	}

    gradient(a, b) {
        return (b.y-a.y)/(b.x-a.x);
   	}

	bzCurve(points, f, t) {
        //f = 0, will be straight line
        //t suppose to be 1, but changing the value can control the smoothness too
        if (typeof(f) == 'undefined') f = 0.3;
        if (typeof(t) == 'undefined') t = 0.6;

        this.ctx.beginPath();
        this.ctx.moveTo(points[0].x, points[0].y);

        var m = 0;
        var dx1 = 0;
        var dy1 = 0;
        let nexP, dx2, dy2;

        var preP = points[0];
        for (var i = 1; i < points.length; i++) {
            var curP = points[i];
            nexP = points[i + 1];
            if (nexP) {
                m = this.gradient(preP, nexP);
                dx2 = (nexP.x - curP.x) * -f;
                dy2 = dx2 * m * t;
            } else {
                dx2 = 0;
                dy2 = 0;
            }
            this.ctx.bezierCurveTo(preP.x - dx1, preP.y - dy1, curP.x + dx2, curP.y + dy2, curP.x, curP.y);
            dx1 = dx2;
            dy1 = dy2;
            preP = curP;
        }
        this.ctx.stroke();

    }

	drawGraph(points, frame) {
		if(points[0] == undefined) { return }
		points = this.translate(points, frame);
		this.bzCurve(points)
		this.update();
	}

	drawStepOO(point1, point2) {
		const p1 = this.translate(point1, this.frame);
		const p2 = this.translate(point2, this.frame);
		this.ctx.save();
		this.ctx.setLineDash([5]);

		this.ctx.beginPath();
		this.ctx.moveTo(p1.x, p1.y);
	    this.ctx.lineTo(p2.x, p1.y);
	    this.ctx.lineTo(p2.x, p2.y);
	    this.ctx.stroke();

	    this.ctx.restore();
	    this.drawPoint(p2);
	    this.update();
	}

	drawLine(point1, point2, color) {
		const p1 = this.translate([point1], this.frame)[0];
		const p2 = this.translate([point2], this.frame)[0];
		this.ctx.beginPath();

		this.ctx.save();
		this.ctx.setLineDash([5]);
		if (color == undefined) {
			this.ctx.strokeStyle = '#000000';
		} else {
			this.ctx.strokeStyle = color;
		}


		this.ctx.moveTo(p1.x, p1.y);
	    this.ctx.lineTo(p2.x, p2.y);
	    this.ctx.stroke();
	    this.drawPoint(p2);

	   	this.ctx.restore();
	    this.update();
	}

	drawArrow(point1, point2, headlen, color) {
		const p1 = this.translate([point1], this.frame)[0];
		const p2 = this.translate([point2], this.frame)[0];
		var angle = Math.atan2(p2.y-p1.y,p2.x-p1.x);
		const p3 = {x: p2.x-headlen*Math.cos(angle-Math.PI/6), y: p2.y-headlen*Math.sin(angle-Math.PI/6)};
		const p4 = {x: p2.x-headlen*Math.cos(angle+Math.PI/6), y: p2.y-headlen*Math.sin(angle+Math.PI/6)};
		this.ctx.save();

		this.ctx.beginPath();
		this.ctx.moveTo(p1.x, p1.y);
	    this.ctx.lineTo(p2.x, p2.y);
	    this.ctx.stroke();

	    this.ctx.lineTo(p3.x, p3.y);
	    this.ctx.moveTo(p2.x, p2.y);
	    this.ctx.lineTo(p4.x, p4.y);
	    this.ctx.strokeStyle = color;
	    this.ctx.stroke();
	    
	    this.ctx.restore();
	    this.update();
	}

	drawStepOO(point1, point2, color) {
		const p1 = this.translate([point1], this.frame)[0];
		const p2 = this.translate([point2], this.frame)[0];

		this.ctx.save();

		if (color == undefined) {
			this.ctx.strokeStyle = '#000000';
		} else {
			this.ctx.strokeStyle = color;
		}
		this.ctx.setLineDash([5]);

		this.ctx.beginPath();
		this.ctx.moveTo(p1.x, p1.y);
	    this.ctx.lineTo(p2.x, p2.y);
	    this.ctx.stroke();

	    this.ctx.restore();

	    this.drawPoint(p2);
	    this.update();
	}

	drawPoint(x, y, color) {
	  let point = this.translate([{x: x, y: y}], this.frame);
	  this.ctx.beginPath();
	  this.ctx.save();
		if (color == undefined) {
			this.ctx.strokeStyle = '#000000';
		} else {
			this.ctx.strokeStyle = color;
		}

	  this.ctx.arc(point[0].x, point[0].y, 1, 0, 2 * Math.PI, true);
	  this.ctx.arc(point[0].x, point[0].y, 2, 0, 2 * Math.PI, true);
	  this.ctx.stroke();

	  this.ctx.restore();
	  //this.update();
	}

	translate(points, frame) {
		const x_growth = this.ss.axis_offsets.x / this.data.axis_steps.x;
		const y_growth = this.ss.axis_offsets.y / this.data.axis_steps.y; 
		const origin = {x: frame.x, y: frame.y}

		let result = [];
		for(let i = 0; i < points.length; i++) {
			if (points[i] == undefined) {
				console.log(points)
			}
			result.push({
				x: origin.x + (points[i].x - this.data.limits.x1) * x_growth,
				y: origin.y + (this.data.limits.y2 - points[i].y) * y_growth
			})
		}

		return result;
	}
}