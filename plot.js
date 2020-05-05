function Plotter(width, height, cell_size_x, cell_size_y, cells_x, cells_y, x0, y0, grid_color, axis_color, ctx) {
	this.width = width
	this.height = height

	this.cell_size_x = cell_size_x
	this.cell_size_y = cell_size_y

	this.cells_x = cells_x 
	this.cells_y = cells_y

	this.x0 = x0
	this.y0 = y0

	this.grid_color = grid_color
	this.axis_color = axis_color

	this.ctx = ctx
}

Plotter.prototype.DrawLine = function(x1, y1, x2, y2) {
	this.ctx.beginPath()
	this.ctx.moveTo(x1, y1)
	this.ctx.lineTo(x2, y2)
	this.ctx.stroke()
}

Plotter.prototype.DrawGrid = function() {
	this.ctx.strokeStyle = this.grid_color

	for (let i = 1; i <= this.cells_y; i++) {
		this.DrawLine(this.ctx, 0, this.y0 - i * this.cell_size_y, this.width, this.y0 - i * this.cell_size_y)
		this.DrawLine(this.ctx, 0, this.y0 + i * this.cell_size_y, this.width, this.y0 + i * this.cell_size_y)
	}

	for (let i = 1; i <= this.cells_x; i++) {
		this.DrawLine(this.ctx, this.x0 - i * this.cell_size_x, 0, this.x0 - i * this.cell_size_x, this.height)
		this.DrawLine(this.ctx, this.x0 + i * this.cell_size_x, 0, this.x0 + i * this.cell_size_x, this.height)
	}
}

Plotter.prototype.DrawVerticalValues = function() {
	this.ctx.textBaseline = "middle"
	this.ctx.textAlign = "right"
	
	for (let i = 1; i < this.cells_y; i++){
		this.DrawLine(this.x0 - 4, this.y0 - i * this.cell_size_y, this.x0 + 4, this.y0 - i * this.cell_size_y)
		this.DrawLine(this.x0 - 4, this.y0 + i * this.cell_size_y, this.x0 + 4, this.y0 + i * this.cell_size_y)

		this.ctx.fillText(i, this.x0 - 7, this.y0 - i * this.cell_size_y)
		this.ctx.fillText(-i, this.x0 - 7, this.y0 + i * this.cell_size_y)
	}
}

Plotter.prototype.DrawHorizontalValues = function() {
	this.ctx.textBaseline = "top"
	this.ctx.textAlign = "center"
	
	for (let i = 1; i < this.cells_x; i++){
		this.DrawLine(this.x0 - i * this.cell_size_x, this.y0 - 4, this.x0 - i * this.cell_size_x, this.y0 + 4)
		this.DrawLine(this.x0 + i * this.cell_size_x, this.y0 - 4, this.x0 + i * this.cell_size_x, this.y0 + 4)

		this.ctx.fillText(i, this.x0 + i * this.cell_size_x, this.y0 + 7)
		this.ctx.fillText(-i, this.x0 - i * this.cell_size_x, this.y0 + 7)
	}
}

Plotter.prototype.DrawAxis = function() {
	this.ctx.strokeStyle = this.axis_color
	this.ctx.fillStyle = this.axis_color
	this.ctx.font = "14px Calibri"

	this.DrawLine(this.x0, 0, this.x0, this.height)
	this.DrawLine(0, this.y0, this.width, this.y0)

	this.DrawVerticalValues()
	this.DrawHorizontalValues()
}

Plotter.prototype.Map = function(x, xmin, xmax, ymin, ymax) {
	return (x - xmin) / (xmax - xmin) * (ymax - ymin) + ymin
}

Plotter.prototype.XtoW = function(x) {
	return this.Map(x, -this.cells_x, this.cells_x, 0, this.width)
}

Plotter.prototype.YtoH = function(y) {
	return this.Map(y, this.cells_y, -this.cells_y, 0, this.height)
}

Plotter.prototype.PlotFunction = function(f, step, color) {
	let xmin = -this.cells_x
	let xmax = this.cells_x

	this.ctx.strokeStyle = color
	this.ctx.lineWidth = 2
	this.ctx.beginPath()
	this.ctx.moveTo(this.XtoW(xmin), this.YtoH(f(xmin)))

	for (let x = xmin; x <= xmax; x += step)
		this.ctx.lineTo(this.XtoW(x), this.YtoH(f(x)))

	this.ctx.stroke()
}

function f1 (x) {
	return (Math.cos(x) * Math.cos(x) + 5) / 3
}

function f2 (x) {
	return 4 * x * x
}

let canvas = document.getElementById("canvas")
canvas.width = 1920
canvas.height = 920

let ctx = canvas.getContext("2d")

let plotter = new Plotter(1900, 920, 90, 180, (1920 / 180), (920 / 360), 950, 460, "#ccc", "#000", ctx)

plotter.DrawGrid()
plotter.DrawAxis()
plotter.PlotFunction(f1, 0.01, "red")
plotter.PlotFunction(f2, 0.01, "blue")