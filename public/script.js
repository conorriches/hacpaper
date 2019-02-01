paper.install(window);

var tool1;

paper.setup("myCanvas");
var path;

function onMouseDown(event) {
  path = new Path();
  path.strokeColor = "red";
  path.strokeWidth = 3;
  path.add(event.point);
}

tool1 = new Tool();
tool1.onMouseDown = onMouseDown;

tool1.onMouseDrag = function(event) {
  path.add(event.point);
};

var myCircle = new Path.Circle(new Point(102, 102), 100);
myCircle.strokeColor = "black";

paper.draw();
