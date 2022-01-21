var Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Common = Matter.Common,
    MouseConstraint = Matter.MouseConstraint,
    Mouse = Matter.Mouse,
    World = Matter.World,
    Vertices = Matter.Vertices,
    Svg = Matter.Svg,
    Bodies = Matter.Bodies;


function convertSvgToVertices() {
    let vertexSets = [];
    let svg = document.getElementById("svgInput").value;
    let svgContainer = document.getElementById("svgContainer");
    svgContainer.innerHTML = svg;
    let outputElement = document.getElementById("verticesOutput");

    $(svgContainer).find('path').each(function(i, path) {
        console.log (path);
        var points = Svg.pathToVertices(path, 30);
        vertexSets.push(Vertices.scale(points, 10, 10));
    });
    
    outputElement.value = JSON.stringify(vertexSets);
}
