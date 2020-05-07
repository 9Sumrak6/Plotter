function Plotter(canvas, cell_size_x, cell_size_y, cells_x, cells_y, x0, y0, grid_color, axis_color) {
	this.width = canvas.width
	this.height = canvas.height

	this.cell_size_x = cell_size_x
	this.cell_size_y = cell_size_y

	this.cells_x = cells_x 
	this.cells_y = cells_y

	this.SetCenter(x0, y0)

	this.grid_color = grid_color
	this.axis_color = axis_color

	this.ctx = canvas.getContext("2d")

	this.functions = []
}

Plotter.prototype.SetCenter = function(x0, y0) {
	this.x0 = this.width / 2 - this.cell_size_x * x0
	this.y0 = this.height / 2 + this.cell_size_y * y0

	this.xmin = x0 - this.cells_x
	this.xmax = x0 + this.cells_x

	this.ymin = y0 - this.cells_y
	this.ymax = y0 + this.cells_y
}

Plotter.prototype.DrawLine = function(x1, y1, x2, y2) {
	this.ctx.beginPath()
	this.ctx.moveTo(x1, y1)
	this.ctx.lineTo(x2, y2)
	this.ctx.stroke()
}

Plotter.prototype.DrawGrid = function() {
	this.ctx.strokeStyle = this.grid_color

	let top = Math.floor(this.y0 / this.cell_size_y)
	let bottom = Math.floor((this.height - this.y0) / this.cell_size_y)
	let right = Math.floor((this.width - this.x0) / this.cell_size_x) 
	let left = Math.floor(this.x0 / this.cell_size_x)

	for (let i = 1; i <= top; i++)
		this.DrawLine(0, this.y0 - i * this.cell_size_y, this.width, this.y0 - i * this.cell_size_y)

	for (let i = 1; i <= bottom; i++)
		this.DrawLine(0, this.y0 + i * this.cell_size_y, this.width, this.y0 + i * this.cell_size_y)

	for (let i = 1; i <= left; i++)
		this.DrawLine(this.x0 - i * this.cell_size_x, 0, this.x0 - i * this.cell_size_x, this.height)

	for (let i = 1; i <= right; i++)
		this.DrawLine(this.x0 + i * this.cell_size_x, 0, this.x0 + i * this.cell_size_x, this.height)

}

Plotter.prototype.DrawVerticalValues = function(x0, y0) {
	this.ctx.textBaseline = "middle"
	this.ctx.textAlign = "left"
	
	let position = Math.min(Math.max(7, x0 + 7), this.width - 14)

	let top = Math.floor(this.y0 / this.cell_size_y)
	let bottom = Math.floor((this.height - this.y0) / this.cell_size_y)

	for (let i = 1; i <= top; i++) {
		this.DrawLine(x0 - 4, this.y0 - i * this.cell_size_y, x0 + 4, this.y0 - i * this.cell_size_y)
		this.ctx.fillText(i, position, this.y0 - i * this.cell_size_y)
	}

	for (let i = 1; i <= bottom; i++) {
		this.DrawLine(x0 - 4, this.y0 + i * this.cell_size_y, x0 + 4, this.y0 + i * this.cell_size_y)
		this.ctx.fillText(-i, position, this.y0 + i * this.cell_size_y)
	}
}

Plotter.prototype.DrawHorizontalValues = function(x0, y0) {
	this.ctx.textBaseline = "top"
	this.ctx.textAlign = "center"
	
	let position = Math.min(Math.max(7, y0 + 7), this.height - 14)

	let right = Math.floor((this.width - this.x0) / this.cell_size_x) 
	let left = Math.floor(this.x0 / this.cell_size_x)

	for (let i = 1; i <= right; i++){
		this.DrawLine(this.x0 + i * this.cell_size_x, y0 - 4, this.x0 + i * this.cell_size_x, y0 + 4)
		this.ctx.fillText(i, this.x0 + i * this.cell_size_x, position)
	}

	for (let i = 1; i <= left; i++){
		this.DrawLine(this.x0 - i * this.cell_size_x, y0 - 4, this.x0 - i * this.cell_size_x, y0 + 4)
		this.ctx.fillText(-i, this.x0 - i * this.cell_size_x, position)
	}
}

Plotter.prototype.DrawAxis = function() {
	this.ctx.strokeStyle = this.axis_color
	this.ctx.fillStyle = this.axis_color
	this.ctx.font = "14px Calibri"

	let x0 = Math.min(Math.max(this.x0, 0), this.width)
	let y0 = Math.min(Math.max(this.y0, 0), this.height)

	this.DrawLine(x0, 0, x0, this.height)
	this.DrawLine(0, y0, this.width, y0)

	this.DrawVerticalValues(x0, y0)
	this.DrawHorizontalValues(x0, y0)
}

Plotter.prototype.AddFunction = function(f, color) {
	this.functions.push({f: f, color: color})
}

Plotter.prototype.Map = function(x, xmin, xmax, ymin, ymax) {
	return (x - xmin) / (xmax - xmin) * (ymax - ymin) + ymin
}

Plotter.prototype.XtoW = function(x) {
	return this.Map(x, this.xmin, this.xmax, 0, this.width)
}

Plotter.prototype.YtoH = function(y) {
	return this.Map(y, this.ymin, this.ymax, this.height, 0)
}

Plotter.prototype.PlotFunction = function(f, step, color) {
	this.ctx.strokeStyle = color
	this.ctx.lineWidth = 2
	this.ctx.beginPath()
	this.ctx.moveTo(this.XtoW(this.xmin), this.YtoH(f(this.xmin)))

	for (let x = this.xmin; x <= this.xmax; x += step)
		this.ctx.lineTo(this.XtoW(x), this.YtoH(f(x)))

	this.ctx.stroke()
}

Plotter.prototype.Plot = function() {
	let t0 = performance.now()

	this.ctx.clearRect(0, 0, this.width, this.height)

	this.DrawGrid()
	this.DrawAxis()

	for (let i = 0; i < this.functions.length; i++)
		this.PlotFunction(this.functions[i].f, 0.001, this.functions[i].color)

	let t1 = performance.now()

	console.log(t1 - t0)
}