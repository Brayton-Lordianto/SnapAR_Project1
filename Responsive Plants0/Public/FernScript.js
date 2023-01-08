// -----JS CODE-----

// @input SceneObject fern
// @input SceneObject pot

var prev = script.fern.getTransform().getLocalScale()
// 1 to 1.3 in 2 steps 
var factor = 0.2
print(x)
var x = prev["x"] + factor
var y = prev["y"] + factor
var z = prev["z"] + factor

if (x <= 1.5)  {
    print(x)
    script.fern.getTransform().setLocalScale(new vec3(x, y, z))
}