jui.define("util.mode.pen2", ["util.base", "util.parser.path"], function (_, PathParser) {
    var DrawingModePen2 = function (canvas) {

		var parser = new PathParser();
		var currentPen = [];
		var startPos;
		var currentCurvePos;
		var reversePos;
		var currentDragCenterCircle;
		var currentDragCircle;
		var currentDragCircle2;
		var currentDragPath;
		var currentMovePath;
		var isDragging = false;
		var pen2;
		var events;
		var point_list = [];

		this.init = function () {
			pen2 = canvas.svg.g({
				className : "pen2-guid"
			});

			canvas.appendToGroup(pen2);

			currentPath = canvas.svg.path({
				className : 'item',
				fill: 'transparent',
				stroke: 'black',
				'stroke-width': 3,
				'stroke-linejoin': 'round'
			});

			this.addToPen(currentPath);
		}

		this.isRightClick = function (e) {
			return e.buttons == 2;
		}

		// mode 가 변경될 때 초기 상태로 되돌린다.
		this.initMode = function () {
			var self = this;
			// 비활성화 일 때 초기 상태로 되돌림
			if (this.disabled)
			{
				if (events) {
					canvas.offMouseEvent(events);
					canvas.chart.off(move2);
				}

			}
			// 활성화 모드
			else {
				events = canvas.setMouseEvent( function click(e) { self.dragStart(e); },  function move(e) { self.drag(e); },  function up(e) { self.dragEnd(e); } );
				canvas.chart.on('chart.mousemove', function move2 (e) {
					self.move(e);
				});
			}
		}

		this.dragStart = function (e) {

			if (this.isRightClick(e))
			{

				if (currentMovePath) {
					currentMovePath.remove();
					currentMovePath.element.parentNode.removeChild(currentMovePath.element);
				}


				startPos = null;
				currentDragPath = null;
				currentMovePath = null;
				currentDragCenterCircle = null;
				currentDragCircle = null;
				currentDragCircle2 = null;

				this.generatePath(point_list);

				point_list = [];
				return;
			}

			startPos = canvas.pos(e);

			point_list.push({ type : 'pointer', pos : startPos });

			currentDragPath = this.addGuidePath({
				'stroke-dasharray' : '5 5'
			});
			currentMovePath = this.addGuidePath({
				'stroke-dasharray' : '5 5'
			});
			currentDragCenterCircle = this.addCircle();
			currentDragCircle = this.addCircle({
				stroke : 'red'
			});
			/*
			currentDragCircle2 = this.addCircle({
				stroke : 'green'
			});
			*/

			currentDragCenterCircle.attr({
				'cx' :  startPos.x,
				'cy' :  startPos.y
			});

		}

		this.move = function (e) {
			if (!startPos) {
				return;
			}

			if (!isDragging) {
				var pos = canvas.pos(e);


				currentMovePath.MoveTo(startPos.x, startPos.y);
				currentMovePath.LineTo(pos.x, pos.y);
				currentMovePath.join();

			} else {
				currentMovePath.join();
			}
		}

		this.generatePath = function () {
			var len = point_list.length;

			var path = canvas.svg.path({
				className : 'item',
				fill : 'transparent',
				stroke : 'black',
				'stroke-width' : 3
			});

			for(var i = 0; i < len; i++) {
				var segment = point_list[i];
				var pos = segment.pos;

				if (i == 0) {
					path.MoveTo(pos.x, pos.y);
				} else {
					if (segment.type == 'pointer') {
						path.LineTo(pos.x, pos.y);
					} else if (segment.type == 'curve') {
						var pointer = point_list[i+1];
						var curve = point_list[i+2];

						if (pointer && curve) {
							path.CurveTo(pos.x, pos.y, curve.pos.x, curve.pos.y, pointer.pos.x, pointer.pos.y);
						}

						// 커브는 어떻게 그리나요
					}
				}
			}

			path.join();

			canvas.appendToCanvas(path);
		}

		this.drag = function (e) {
			isDragging = true;

			currentCurvePos = canvas.pos(e);

			this.drawCurveGuide();
		}

		this.dragEnd = function (e) {
			isDragging = false;

			// 점을 추가 한다
			if (currentCurvePos) {
				point_list.push({ type : 'curve', pos : currentCurvePos, reverse : reversePos });
				currentCurvePos = null;
				reversePos = null;
			}
		}

		this.addToPen = function (o) {
			pen2.append(o);
			pen2.element.appendChild(o.element);
		}

		this.addCircle = function (o) {
			var circle = canvas.svg.circle(_.extend({
				fill : 'white',
				stroke : 'blue',
				'stroke-width' : 1,
				r : 5
			}, o || {}));

			this.addToPen(circle);

			return circle;
		}

		this.addGuidePath = function (obj) {
			var path = canvas.svg.path(_.extend({
				fill : 'transparent',
				stroke : 'blue',
				'stroke-width' : 1
			}, obj || {}));

			this.addToPen(path);

			return path;
		}

		this.drawCurveGuide = function () {

			if (!startPos) {
				return;
			}

			var distX = Math.abs(startPos.x - currentCurvePos.x);
			var distY = Math.abs(startPos.y - currentCurvePos.y);

			var distX2 = 2 * distX;
			var distY2 = 2 * distY;


			currentDragCircle.attr({
				'cx' :  currentCurvePos.x,
				'cy' :  currentCurvePos.y
			});

			var reverseX = (startPos.x > currentCurvePos.x) ? currentCurvePos.x + distX2 : currentCurvePos.x - distX2;
			var reverseY = (startPos.y > currentCurvePos.y) ?  currentCurvePos.y + distY2 : currentCurvePos.y - distY2;

			/*
			currentDragCircle2.attr({
				'cx' :  reverseX,
				'cy' :  reverseY
			});
			*/

			currentDragPath.MoveTo(currentCurvePos.x, currentCurvePos.y);
			currentDragPath.LineTo(startPos.x, startPos.y);
			//currentDragPath.LineTo(reverseX, reverseY);
			currentDragPath.join();

			reversePos = { x : reverseX, y : reverseY };

		}

		this.drawEnd = function () {

		}

    };


    return DrawingModePen2;
}, "drawing.core");
