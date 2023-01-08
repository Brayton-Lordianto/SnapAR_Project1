// -----JS CODE-----

// BonesTargetColliders.js
// Lens Studio Version 4.28.0
// Event: Update
// Updates bone positions and orientations of a rigged 3D model based on tracker objects from a collision rig.
// The collision rig trackers are assumed to have starting position / orientation matching the bones.

// @input SceneObject[] trackers
// @input SceneObject[] bones

var trackersTransform = [];
var bonesTransform = [];

for (var i=0; i < script.bones.length; i++) {
        
    trackersTransform.push(script.trackers[i].getTransform());
    bonesTransform.push(script.bones[i].getTransform());

}


var event = script.createEvent("UpdateEvent");
event.bind(function(eventData) {
    for (var i=0; i < script.bones.length; i++) {
        bonesTransform[i].setWorldRotation(trackersTransform[i].getWorldRotation());
        bonesTransform[i].setWorldPosition(trackersTransform[i].getWorldPosition());        
    }

});
