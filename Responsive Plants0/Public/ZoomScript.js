// -----JS CODE-----
// @input SceneObject fernScene
// @input SceneObject fern
// @input SceneObject pot
// @input SceneObject seaweed

print("Hello World")

//function setChildrenTransform(obj, x, y, z, prevScale) {
//    print(obj.children.length)
//    if (obj.children.length == 0) return;
//    print("hie")    
//    var currScale = obj.getTransform().getLocalScale[0];
//    if (currScale == prevScale) { obj.getTransform().setLocalScale(new vec3(x,y,z)); }
//    for (var i = 0; i < obj.children.length; ++i) {
//        print('h')
//        setChildrenTransform(obj.children[i], x, y, z)
//    }
//}


if (script.fernScene.enabled) {
    script.fern.getTransform().setLocalScale(new vec3(1,1,1))
//    var prev = script.fern.getTransform().getLocalScale()
//    var factor = 0.2
//    print(x)
//    var x = prev["x"] + factor
//    var y = prev["y"] + factor
//    var z = prev["z"] + factor
//    
//    if (x <= 1.5)  {
//        print(x)
//        script.fern.getTransform().setLocalScale(new vec3(x, y, z))
//    }
} else 
// seaweed 
if (script.seaweed.enabled) {
    // script.seaweed.children[0-4] is groups 1-5
    // two steps to go from 0.5 to 1 => + .25
    var factor = 0.25
    for (var i = 0; i < 5; ++i) {
        var prev = script.seaweed.children[i].getTransform().getLocalScale()
        var x = prev["x"] + factor
        var y = prev["y"] + factor
        var z = prev["z"] + factor
        if (x > 1.1) break
        script.seaweed.children[i].getTransform().setLocalScale(new vec3(x,y,z))
    }

    
}