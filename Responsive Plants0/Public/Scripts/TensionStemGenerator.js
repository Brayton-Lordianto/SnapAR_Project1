// -----JS CODE-----


// TensionStemGenerator.js
// Lens Studio Version 4.28.0
// Event: Lens Initialized
// Generates a "Tension Stem" Collision Rig based on input bones and a Base "ground" Collider

// @input SceneObject[] stemJoints
// @input Physics.ColliderComponent baseAnchor
// @input Physics.BodyComponent flowerheadCollider
// @input Physics.Matter stemMatter

// @ui {"widget":"label", "label" : "---"}

// @input float baseRadius
// @input float tipRadius
// @input float baseDensity = 1.0
// @input float tipDensity = 0.2

// @ui {"widget":"label", "label" : "---"}

// @input bool showConstraints = false
// @input bool showColliders = false

// @ui {"widget":"label", "label" : "---"}

// @ui {"widget": "group_start", "label": "Advanced Setup"}

// @input float damping = 0.04 {"widget":"slider","min" : 0.0 , "max" : 1.0, "step": 0.01}
// @input float angDamping = 0.04 {"widget":"slider","min" : 0.0 , "max" : 1.0, "step": 0.01, "label" : "Angular Damping"}

// @input int intangibleRootThreshold = 1 {"label" : "Intangible Base Segments"}
// @input float segmentLength = 0.96 {"widget":"slider","min" : 0.0 , "max" : 1.0, "step": 0.01}
// @input int constraintCount = 8 {"min":0}
// @input bool tensionConstrainAll = false

// @ui {"widget": "group_end"}

const FULL_CIRCLE = Math.PI * 2;

var segmentCount = -1;
var cylChain = [];
var creationComplete = false;

const StartEv = script.createEvent("OnStartEvent");
StartEv.bind(function(eventData) {
    
    if (script.stemJoints && script.stemJoints.length > 1) {

        segmentCount = script.stemJoints.length - 1;
        
        // Create the Tension Rod:

        var tensionRod = buildBridgeRod(script.stemJoints[0],script.stemJoints[script.stemJoints.length - 1], 0.3, script.baseAnchor, true, 1.0, "tension");
        
        // Create the Collision Rig Segments:
        
        for (var i=0; i < segmentCount ; i++) {
            var j0 = script.stemJoints[i];
            var j1 = script.stemJoints[i+1];
            var targetBody = (i==0 ? script.baseAnchor : cylChain[i-1].getFirstComponent("Physics.BodyComponent"));

            var hPerc = i / (segmentCount-1);
            var density = script.baseDensity - hPerc*(script.baseDensity - script.tipDensity);
            var width = script.baseRadius - hPerc*(script.baseRadius - script.tipRadius);
            
            
            cylChain.push(buildBridgeRod(j0, j1, width, targetBody, (i<script.intangibleRootThreshold), density, "stem"));
        }
        
        // Add Constraints targeting the Tension rod:        
        
        var tensionStartPoint = script.tensionConstrainAll ? 0 : segmentCount-1;
        
        for (var j = tensionStartPoint; j < segmentCount; j++) {
            var tensionConstObj = global.scene.createSceneObject("Tension Constraint");
            tensionConstObj.setParent(cylChain[j]);
            tensionConstObj.getTransform().setLocalPosition(vec3.up().uniformScale(0.5));
            tensionConstObj.getTransform().setLocalRotation(quat.quatIdentity());
            
            var tensionConstraint = tensionConstObj.createComponent("Physics.ConstraintComponent");
            tensionConstraint.constraint = Physics.Constraint.create(Physics.ConstraintType.Point);
            tensionConstraint.target = tensionRod.getFirstComponent("Physics.BodyComponent");
            tensionConstraint.debugDrawEnabled = script.showConstraints;
        }
        
        // Attach flowerhead collider, if it exists:
        
        if (script.flowerheadCollider) {
            
            var fhConstObj1 = global.scene.createSceneObject("Flowerhead Constraint A");
            fhConstObj1.setParent(script.flowerheadCollider.getSceneObject());
            
            var fhConstraint1 = fhConstObj1.createComponent("Physics.ConstraintComponent");
            fhConstraint1.constraint = Physics.Constraint.create(Physics.ConstraintType.Point);
            fhConstraint1.target = tensionRod.getFirstComponent("Physics.BodyComponent");
            fhConstraint1.debugDrawEnabled = script.showConstraints;
            
            var fhConstObj2 = global.scene.createSceneObject("Flowerhead Constraint A");
            fhConstObj2.setParent(script.flowerheadCollider.getSceneObject());
            fhConstObj2.getTransform().setWorldPosition(tensionConstObj.getTransform().getWorldPosition());
            
            var fhConstraint2 = fhConstObj1.createComponent("Physics.ConstraintComponent");
            fhConstraint2.constraint = Physics.Constraint.create(Physics.ConstraintType.Point);
            fhConstraint2.target = cylChain[segmentCount-1].getFirstComponent("Physics.BodyComponent");
            fhConstraint2.debugDrawEnabled = script.showConstraints;
            
            script.flowerheadCollider.debugDrawEnabled = script.showColliders;
        }
        
    } else {
        print("ERROR: Tension Stem not generated. Not enough joints specified.");
    }

    creationComplete = true;
});




// Update Event

// Contains a built-in version of BonesTargetColliders.js since
// all of the colliders are script-generated and cannot be linked
// via visual scripting.

var event = script.createEvent("UpdateEvent");
event.bind(function(eventData) {
    if (creationComplete && script.stemJoints && script.stemJoints.length > 1) {
        if (cylChain && cylChain.length == script.stemJoints.length - 1) {
            for (var i=0; i < segmentCount; i++) {
            //print(i);
                if (cylChain[i].getChildrenCount() > 0) {
                    
                    var tCenterRot = cylChain[i].getTransform().getWorldRotation();
                    var tBasePos = cylChain[i].getChild(0).getTransform().getWorldPosition();
                    var j = script.stemJoints[i].getTransform();
                    
                    j.setWorldRotation(tCenterRot);
                    j.setWorldPosition(tBasePos);
                }
            }
            
        }
        
    } else {
        print("ERROR: Cannot target bones because ");
    }
});




// buildBridgeRod()
// Builds a collider between the world positions of two input objects.

// Used to build the Tension rod as well as the stem segments.

function buildBridgeRod(j0, j1, width, targetBody, intangible, density, constType) {
    
    var jPos0 = j0.getTransform().getWorldPosition();
    var jPos1 = j1.getTransform().getWorldPosition();
    
    var bridgeMid = jPos0.add(jPos1).uniformScale(0.5);
    var bridgeDist = jPos1.distance(jPos0);
    var bridgeVec = jPos1.sub(jPos0);
    var bridgeRot = quat.lookAt(vec3.forward(), bridgeVec);
    
    var segmentObj = global.scene.createSceneObject("Stem Collider");
    segmentObj.getTransform().setWorldPosition(bridgeMid);
    segmentObj.getTransform().setWorldScale(new vec3(width, bridgeDist*script.segmentLength, width));
    
    segmentObj.getTransform().setWorldRotation(bridgeRot);
    
    var cylBody = segmentObj.createComponent("Physics.BodyComponent");
    cylBody.shape = Shape.createCylinderShape();
    cylBody.shape.length = 1.0;
    cylBody.axis = Axis.Y;
    cylBody.density = density;
    cylBody.intangible = intangible;
    cylBody.dynamic = true;
    cylBody.debugDrawEnabled = script.showColliders;
    cylBody.damping = script.damping;
    cylBody.angularDamping = script.angDamping;    
    
    
    var cylConstObj = global.scene.createSceneObject("Constraint");    
    var cylConstraint;
    
    switch (constType) {
        
        case "stem":
        default:
            for (var j = 0; j < script.constraintCount; j++) {
            
                
                
                cylConstObj.setParent(segmentObj);
                
                // even percentage of the circle
                var angle = FULL_CIRCLE * (j / script.constraintCount);
                
                cylConstObj.getTransform().setLocalPosition(new vec3(Math.cos(angle)*6, -0.5, Math.sin(angle)*6));
                cylConstObj.getTransform().setLocalRotation(quat.quatIdentity());
                
                var constraint = cylConstObj.createComponent("Physics.ConstraintComponent");
                constraint.debugDrawEnabled = script.showConstraints;
                constraint.constraint = Physics.Constraint.create(Physics.ConstraintType.Fixed);
                constraint.target = targetBody;
            }
        
            
            if (script.stemMatter) {
                cylBody.matter = script.stemMatter;
            }
                   
            break;
        
        case "tension":

            cylConstObj.getTransform().setWorldPosition(jPos0);
            cylConstObj.getTransform().setWorldRotation(quat.lookAt(vec3.up(), vec3.left()));
            cylConstObj.setParentPreserveWorldTransform(segmentObj);
           
            cylConstraint = cylConstObj.createComponent("Physics.ConstraintComponent");
            cylConstraint.constraint = Physics.Constraint.create(Physics.ConstraintType.Hinge);
            cylConstraint.target = targetBody.getSceneObject().getFirstComponent("Physics.BodyComponent");
            cylConstraint.debugDrawEnabled = true;
            cylConstraint.debugDrawEnabled = script.showConstraints;
            cylConstraint.target = targetBody;
            break;
    }
    
    
    return segmentObj;
}
