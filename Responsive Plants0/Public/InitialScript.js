// -----JS CODE-----
// @input SceneObject seaweed
// @input SceneObject fern

script.fern.getTransform().setLocalScale(new vec3(0.2,0.2,0.2))

seaweedChidren = script.seaweed.children
for (var i = 0; i < 5; ++i) {
    seaweedChidren[i].getTransform().setLocalScale(new vec3(0.5,0.5,0.5))
}