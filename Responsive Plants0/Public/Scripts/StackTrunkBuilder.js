// -----JS CODE-----

// StackTrunkGenerator.js
// Lens Studio Version 4.28.0
// Event: Lens Initialized
// Builds a trunk made of a chain of cylindrical Physics Bodies.

// @input SceneObject refDisc {"label" : "Reference Segment"}
// @input SceneObject endEffector  {"label" : "Treetop Group"}
// @input SceneObject treeTopPhysicsBase {"label" : "Treetop Physics Body"}
// @input Physics.ColliderComponent baseAnchor

// @input int discCount = 10 {"label" : "Segment Count"}
// @input float baseRadius = 12
// @input float tipRadius = 6
// @input float baseDensity = 100.0
// @input float tipDensity = 1.0

// @input int constraintCount = 4
// @input float constraintWidth = 0.5


// @input bool showConstraints


const BASE_OBJ = script.getSceneObject();


// this will change a lot if allowing this script to be used with branches
const TREE_HEIGHT = script.endEffector.getTransform().getLocalPosition().y;
const FULL_CIRCLE = Math.PI * 2;


const EV = script.createEvent("OnStartEvent");
EV.bind(function(eventData) {

    var lastTarget = script.baseAnchor;    
    
    for (var i=0; i <= script.discCount ; i++) {
        
        var rad;
        var hgt;
        
        var bodyObj;
        var hPerc = i/script.discCount;
        
        if (i==script.discCount) {
            
            // final run of the loop - adding constraints for the top group
            
            bodyObj = script.treeTopPhysicsBase;
            
            rad = script.baseRadius - hPerc*(script.baseRadius - script.tipRadius);
            hgt = 5.0;
            
        } else {
        
            var d = BASE_OBJ.copyWholeHierarchy(script.refDisc);
            
            
    
            var txfm = d.getTransform();
            
            var pos = new vec3(0.0, TREE_HEIGHT*hPerc, 0.0);       
            txfm.setLocalPosition(pos);
            
            bodyObj = d.getChild(0);
            var bodyComponent = bodyObj.getFirstComponent("Physics.BodyComponent");
            
            bodyComponent.density = script.baseDensity - hPerc*(script.baseDensity - script.tipDensity);
            
            rad = script.baseRadius - hPerc*(script.baseRadius - script.tipRadius);
            hgt = TREE_HEIGHT / script.discCount;
            
            var cyl = bodyComponent.shape;       
            
            cyl.length = hgt;
            cyl.radius = rad;
            
        }
        
        for (var j = 0; j < script.constraintCount; j++) {
            
            
            var constraintObj = global.scene.createSceneObject("dCon"+j);
            constraintObj.setParent(bodyObj);
            
            // even percentage of the circle
            var angle = FULL_CIRCLE * (j / script.constraintCount);
            
            constraintObj.getTransform().setLocalPosition(new vec3(Math.cos(angle)*rad*script.constraintWidth, -(hgt/2), Math.sin(angle)*rad*script.constraintWidth));
            
            var constraint = constraintObj.createComponent("Physics.ConstraintComponent");
            constraint.debugDrawEnabled = script.showConstraints;
            constraint.constraint = Physics.Constraint.create(Physics.ConstraintType.Fixed);
            constraint.target = lastTarget;
        }
        lastTarget = bodyComponent;
              
        
        d.enabled = true;
    }
    
    script.refDisc.destroy();
});
