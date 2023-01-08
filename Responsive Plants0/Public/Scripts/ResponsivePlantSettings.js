// -----JS CODE-----

// ResponsivePlantSettings.js
// Lens Studio Version 4.28.0
// Event: Lens Initialized
// Modifies settings and enables visualization / troubleshooting of a Responsive Plant Collision Rig.

// @input bool showPlantVisuals = true {"label":"Show Mesh Visuals"}
// @input bool showPlantBodies = false {"label":"Show Physics Bodies"}
// @input bool showPlantConstraints = false {"label":"Show Primary Constraints"}
// @input bool showExtraRigging = false
// @input bool showExtraRiggingConstraints = false
// @input SceneObject[] extraRigging

// @ui {"widget": "group_start", "label": "Physics Setup"}
// @input float damping = 0.32
// @input float angularDamping = 0.56
// @input Physics.Matter plantMatter
// @input Physics.WorldSettingsAsset worldResource

// @input bool overrideMatter = false

// @ui {"showIf" : "overrideMatter" , "showIfValue" : true, "widget": "group_start", "label": "Matter Settings"}
// @input float friction {"showIf" : "overrideMatter" , "showIfValue" : true}
// @input float rollingFriction {"showIf" : "overrideMatter" , "showIfValue" : true}
// @input float spinningFriction {"showIf" : "overrideMatter" , "showIfValue" : true}
// @input float dynamicBounciness {"showIf" : "overrideMatter" , "showIfValue" : true}
// @input float staticBounciness {"showIf" : "overrideMatter" , "showIfValue" : true}
// @ui {"showIf" : "overrideMatter" , "showIfValue" : true, "widget": "group_end"}

// @input bool overrideWorld = false

// @ui {"showIf" : "overrideWorld" , "showIfValue" : true, "widget": "group_start", "label": "World Settings"}
// @input vec3 gravity) {"showIf" : "overrideWorld" , "showIfValue" : true}
// @ui {"showIf" : "overrideWorld" , "showIfValue" : true, "widget": "group_end"}


// @ui {"widget": "group_end"}


const START_EV = script.createEvent("OnStartEvent");
START_EV.bind(function(eventData) {
    
    if (script.overrideMatter && script.plantMatter) {
        script.plantMatter.friction = script.friction;
        script.plantMatter.rollingFriction = script.rollingFriction;
        script.plantMatter.spinningFriction = script.spinningFriction;
        script.plantMatter.dynamicBounciness = script.dynamicBounciness;
        script.plantMatter.staticBounciness = script.staticBounciness;
    }
    
    if (script.overrideWorld && script.worldResource) {
        script.worldResource.gravity = script.gravity;
    }
    
    visualizeHierarchy(script.getSceneObject());
    
});

function visualizeHierarchy(obj) {

    var constraints = obj.getComponents("Physics.ConstraintComponent");
    var bodies = obj.getComponents("Physics.BodyComponent");
    var colliders = obj.getComponents("Physics.BodyComponent");
    var rmvs = obj.getComponents("Component.RenderMeshVisual");
    
    
    if (isInGroup(obj, script.extraRigging)) {
        
        for (var i = 0; i < constraints.length ; i++) {
            constraints[i].debugDrawEnabled = script.showExtraRiggingConstraints;
        }
        
        for (var j = 0; j < rmvs.length ; j++) {
            rmvs[j].enabled = script.showExtraRigging;
        }
        
        for (var k = 0; k < colliders.length ; k++) {
            colliders[k].debugDrawEnabled = script.showExtraRigging;
        }
        
    } else {
        
        for (var p = 0; p < constraints.length ; p++) {
            constraints[p].debugDrawEnabled = script.showPlantConstraints;
        }
        
        for (var q = 0; q < bodies.length ; q++) {
            bodies[q].debugDrawEnabled = script.showPlantBodies;
            bodies[q].damping = script.damping;
        }
    
        for (var r = 0; r < rmvs.length ; r++) {
            rmvs[r].enabled = script.showPlantVisuals;
        }
    }
    
    if (obj.getChildrenCount() > 0) {
        for (var index = 0; index < obj.getChildrenCount() ; index++) {
            visualizeHierarchy(obj.getChild(index));
        }
    }

}


// isInGroup( SceneObject: obj , SceneObject[]: objGrp )

// Returns true if the object is within the hierarchy of
// the object group, as specified in the script ui.

function isInGroup(obj, objGrp) {
    
    if (!obj.getParent()) {
        return false;
    }
    
    if (objGrp.indexOf(obj) != -1) {
        return true;
    }
    
    return isInGroup(obj.getParent(), objGrp);
}
