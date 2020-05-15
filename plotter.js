function Plotter(canvas, cell_size_x, cell_size_y, x0, y0, grid_color, axis_color, scale) {
	this.ctx = canvas.getContext("2d")

	this.width = canvas.width
	this.height = canvas.height

	this.cell_size_x = cell_size_x
	this.cell_size_y = cell_size_y

	this.cells_x = this.width / (2 * this.cell_size_x) 
	this.cells_y = this.height / (2 * this.cell_size_y)

	this.scale = scale

	this.SetCenter(x0, y0)

	this.grid_color = grid_color
	this.axis_color = axis_color

	this.functions = []
}

Plotter.prototype.SetCenter = function(x0, y0) {
	this.x0 = this.width / 2 - this.cell_size_x * x0 * this.scale
	this.y0 = this.height / 2 + this.cell_size_y * y0 * this.scale

	this.xmin = x0 - this.cells_x / this.scale
	this.xmax = x0 + this.cells_x / this.scale

	this.ymin = y0 - this.cells_y / this.scale
	this.ymax = y0 + this.cells_y / this.scale
}

Plotter.prototype.DrawLine = function(x1, y1, x2, y2) {
	this.ctx.beginPath()
	this.ctx.moveTo(x1, y1)
	this.ctx.lineTo(x2, y2)
	this.ctx.stroke()
}

Plotter.prototype.DrawGrid = function() {
	this.ctx.strokeStyle = this.grid_color
	this.ctx.lineWidth = 1

	let top = Math.floor(this.y0 / this.cell_size_y)
	let bottom = Math.floor((this.height - this.y0) / this.cell_size_y)
	let right = Math.floor((this.width - this.x0) / this.cell_size_x) 
	let left = Math.floor(this.x0 / this.cell_size_x)

	for (let i = -bottom; i <= top; i++)
		this.DrawLine(0, this.y0 - i * this.cell_size_y, this.width, this.y0 - i * this.cell_size_y)

	for (let i = -left; i <= right; i++)
		this.DrawLine(this.x0 + i * this.cell_size_x, 0, this.x0 + i * this.cell_size_x, this.height)

}

Plotter.prototype.DrawVerticalValues = function(x0, y0) {
	this.ctx.textBaseline = "middle"
	this.ctx.textAlign = x0 < this.width ? "left" : "right"
	
	let position = Math.min(Math.max(7, x0 + 7), this.width - 14)

	let top = Math.floor(this.y0 / this.cell_size_y)
	let bottom = Math.floor((this.height - this.y0) / this.cell_size_y)
	let y = y0 < this.height ? top : bottom

	for (let i = -bottom; i <= top; i++) {
		let y = y0 - i * this.cell_size_y
		let value = this.Round(this.HtoY(y))

		this.DrawLine(x0 - 4, this.y0 - i * this.cell_size_y, x0 + 4, this.y0 - i * this.cell_size_y)
		this.ctx.fillText(value, position, y)
	}
}

Plotter.prototype.DrawHorizontalValues = function(x0, y0) {
	this.ctx.textBaseline = y0 < this.height ? "top" : "bottom"
	this.ctx.textAlign = "center"
	
	let position = Math.min(Math.max(7, y0 + 7), this.height - 14)

	let right = Math.floor((this.width - this.x0) / this.cell_size_x) 
	let left = Math.floor(this.x0 / this.cell_size_x)

	for (let i = -left; i <= right; i++){
		let x = x0 - i * this.cell_size_x
		let value = this.Round(this.WtoX(x))

		this.DrawLine(this.x0 + i * this.cell_size_x, y0 - 4, this.x0 + i * this.cell_size_x, y0 + 4)
		this.ctx.fillText(value, x, position)
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

Plotter.prototype.Round = function(value) {
	return Math.round(value * 1000000) / 1000000
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

Plotter.prototype.WtoX = function(w) {
	return this.Map(w, 0, this.width,this.xmin, this.xmax)
}

Plotter.prototype.HtoY = function(h) {
	return this.Map(h, 0, this.height, this.ymax, this.ymin)
}


Plotter.prototype.PlotFunction = function(f, color) {
	let step = (this.xmax - this.xmin) / this.width

	this.ctx.strokeStyle = color
	this.ctx.lineWidth = 2
	this.ctx.beginPath()
	this.ctx.moveTo(this.XtoW(this.xmin), this.YtoH(f(this.xmin)))

	for (let x = this.xmin; x <= this.xmax; x += step)
		this.ctx.lineTo(this.XtoW(x), this.YtoH(f(x)))

	this.ctx.stroke()
}

Plotter.prototype.Plot = function() {
	this.ctx.clearRect(0, 0, this.width, this.height)

	let t0 = performance.now()

	this.DrawGrid()
	this.DrawAxis()

	for (let i = 0; i < this.functions.length; i++) 
		this.PlotFunction(this.functions[i].f, this.functions[i].color)

	let t1 = performance.now()
	console.log(t1 - t0)
}

Plotter.prototype.MouseWheel = function(e) {
	let x0 = (this.width / 2 - this.x0) / this.cell_size_x / this.scale
	let y0 = (this.y0 - this.height / 2 ) / this.cell_size_y / this.scale

	this.scale *= e.deltaY < 0 ? 2 : 0.5

	this.SetCenter(x0, y0)
	this.Plot() 
}