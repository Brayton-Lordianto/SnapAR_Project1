// -----JS CODE-----

// SuspensionFrondGenerator.js
// Lens Studio Version 4.28.0
// Event: Lens Initialized
// Generates a "Suspension Frond" Collision Rig based on input bones, a Base "ground" Collider, and a Center Tether Collider.


// @input SceneObject[] jointChain {"label" : "Frond Joints"}
// @input Physics.ColliderComponent baseAnchor
// @input Physics.BodyComponent centerTether
// @input Physics.Matter frondMatter

// @ui {"widget":"label", "label" : "---"}

// @input float baseDensity = 1.0
// @input float tipDensity = 0.2
// @input vec2 baseLateral {"label":"Base Collider Lateral Scale"}
// @input vec2 tipLateral {"label":"Tip Collider Lateral Scale"}

// @ui {"widget":"label", "label" : "---"}

// @input bool showConstraints = false
// @input bool showColliders = false

// @ui {"widget":"label", "label" : "---"}

// @ui {"widget": "group_start", "label": "Advanced Setup"}

// @input float craneDensity = 0.2
// @input float craneRiseAdjust = 0.0 {"widget":"slider","min" : -1.0 , "max" : 1.0, "step": 0.01}
    
// @ui {"widget":"label", "label" : "---"}
    
// @input int intangibleRootThreshold = 1 {"label" : "Intangible Base Segments"}
// @input int floatingTipThreshold = -1 {"label" : "Unconstrained Tip Segments"}
// @ui {"widget":"label", "label" : "Enter a negative value to use the apex"}
// @ui {"widget":"label", "label" : "of the frond curve as the threshold."}
    
// @ui {"widget":"label", "label" : "---"}

// @input float damping = 0.04 {"widget":"slider","min" : 0.0 , "max" : 1.0, "step": 0.01}
// @input float angDamping = 0.04 {"widget":"slider","min" : 0.0 , "max" : 1.0, "step": 0.01}
// @input int constraintCount = 1
// @input float colliderLength = 0.96 {"widget":"slider","min" : 0.0 , "max" : 1.0, "step": 0.01}

// @ui {"widget": "group_end"}


var segmentCount = -1;
var segChain = [];
var creationComplete = false;

const StartEv = script.createEvent("OnStartEvent");
StartEv.bind(function(eventData) {
    
    if (script.jointChain && script.jointChain.length > 1) {
        
        segmentCount = script.jointChain.length - 1;
        

        // Determine the position of the highest joint in the arch        
        
        var apexJointPos = script.jointChain[0].getTransform().getWorldPosition();
        var apexJointIndex = 0;
        for (var i=1; i <= segmentCount ; i++) {
            var currentJointPos = script.jointChain[i].getTransform().getWorldPosition();
            if (apexJointPos.y < currentJointPos.y) {
                apexJointPos = currentJointPos;
                apexJointIndex = i;
            }
        }
        
        var fT;
        if (script.floatingTipThreshold < 0) {
            fT = segmentCount-apexJointIndex;
        } else {
            fT = script.floatingTipThreshold;
        }
        
        var centerPos = script.centerTether.getSceneObject().getTransform().getWorldPosition();
        var outerPos = apexJointPos;
        
        var adjustedRise = rangeRemap(script.craneRiseAdjust, -1.0, 1.0, outerPos.y, centerPos.y);
        centerPos.y = adjustedRise;
        outerPos.y = adjustedRise;
        
        var r = quat.quatIdentity();
        var suspensionCrane = buildBridgeSegment(centerPos, outerPos, r, new vec2(2, 2), script.centerTether, true, true, script.craneDensity, "crane", quat.quatIdentity());
        
        // Build Next Plant Body Segment
        
        for (var j=0; j < segmentCount ; j++) {
            
            if (!script.jointChain[j+1] || script.jointChain[j+1] === null) {
                print("Warning: Not all bones are linked in the Component. Generation stopped at "+j+" segments.");
                return;
            }
            
            var jntPos0 = script.jointChain[j].getTransform().getWorldPosition();
            var jntPos1 = script.jointChain[j+1].getTransform().getWorldPosition();
            
            var targetBody = (j==0 ? script.baseAnchor : segChain[j-1].getFirstComponent("Physics.BodyComponent"));
            var hPerc = j / (segmentCount-1);
            var density = script.baseDensity - hPerc*(script.baseDensity - script.tipDensity);
            var xSection = script.baseLateral.sub(script.baseLateral.sub(script.tipLateral).uniformScale(hPerc));

            segChain.push(buildBridgeSegment(jntPos0, jntPos1, script.jointChain[j].getTransform().getWorldRotation(), xSection, targetBody, (j<script.intangibleRootThreshold),true, density, "frond"));
            
            // constrain to tether and bar unless floating tip threshold has been reached
            
            if (j < segmentCount - fT) {
                for (var k=0; k<script.constraintCount; k++) {
            
                    var craneConstObj = global.scene.createSceneObject("Crane Constraint");
                    craneConstObj.setParent(segChain[j]);
                    craneConstObj.getTransform().setLocalPosition(vec3.forward().uniformScale(0.5));
                    
                    var craneConstraint = craneConstObj.createComponent("Physics.ConstraintComponent");
                    craneConstraint.constraint = Physics.Constraint.create(Physics.ConstraintType.Point);
                    craneConstraint.target = suspensionCrane.getFirstComponent("Physics.BodyComponent");
                    craneConstraint.debugDrawEnabled = script.showConstraints;
            
                    var tetherConstObj = global.scene.createSceneObject("Tether Constraint");
                    tetherConstObj.setParent(segChain[j]);
                    tetherConstObj.getTransform().setLocalPosition(vec3.up().uniformScale(0.5));
                    
                    var tetherConstraint = tetherConstObj.createComponent("Physics.ConstraintComponent");
                    tetherConstraint.constraint = Physics.Constraint.create(Physics.ConstraintType.Point);
                    tetherConstraint.target = script.centerTether;
                    tetherConstraint.debugDrawEnabled = script.showConstraints;
                }
            }
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

var UPDATE_EV = script.createEvent("UpdateEvent");
UPDATE_EV.bind(function(eventData) {
    if (creationComplete && script.jointChain && script.jointChain.length > 1) {
        if (segChain && segChain.length == script.jointChain.length - 1) {
            for (var i=0; i < segmentCount; i++) {
                
                if (segChain[i].getChildrenCount() > 0) {
                    
                    var tCenterRot = segChain[i].getTransform().getWorldRotation();
                    var tBasePos = segChain[i].getChild(0).getTransform().getWorldPosition();
                    var jnt = script.jointChain[i].getTransform();
                    
                    jnt.setWorldRotation(tCenterRot);
                    jnt.setWorldPosition(tBasePos);
                }
            }
            
        }
        
    } else {
        print("ERROR: Cannot target bones.");
    }
});




function buildBridgeSegment(jPos0, jPos1, baseRot, xSection, targetBody, intangible, dynamic, density, bridgeType) {
    
    
    var bridgeMid = jPos0.add(jPos1).uniformScale(0.5);
    var bridgeDist = jPos1.distance(jPos0);
    var bridgeVec = jPos1.sub(jPos0);
    var craneRot = quat.lookAt(vec3.up(), bridgeVec);
    
    var segmentObj = global.scene.createSceneObject("Segment");
    segmentObj.getTransform().setWorldPosition(bridgeMid);
    
    if (bridgeType == "crane") {
        segmentObj.getTransform().setWorldRotation(craneRot);
    } else {
        segmentObj.getTransform().setWorldRotation(baseRot);
    }
    
    segmentObj.getTransform().setLocalScale(new vec3(xSection.y, bridgeDist, xSection.x));
    
    var segBody = segmentObj.createComponent("Physics.BodyComponent");
    segBody.shape = Shape.createBoxShape();
    segBody.shape.size = new vec3(1.0, script.colliderLength, 1.0);
    segBody.debugDrawEnabled = script.showColliders;
    segBody.intangible = intangible;
    segBody.dynamic = dynamic;
    if (dynamic) {
        segBody.density = density;
    }
    if (script.frondMatter && bridgeType == "frond") {
        segBody.matter = script.frondMatter;
    }
    segBody.damping = script.damping;
    segBody.angularDamping = script.angDamping;  
    
    for (var i=0; i<script.constraintCount; i++) {
        
        var segConstObj = global.scene.createSceneObject("Constraint");
        var segConstraint;
        
        segConstObj.setParent(segmentObj);
        segConstObj.getTransform().setLocalPosition(vec3.down().uniformScale(0.5));
        segConstObj.getTransform().setLocalRotation(quat.quatIdentity());
        
        segConstraint = segConstObj.createComponent("Physics.ConstraintComponent");
        segConstraint.constraint = Physics.Constraint.create(Physics.ConstraintType.Fixed);
        
        segConstraint.debugDrawEnabled = script.showConstraints;
        segConstraint.target = targetBody;
    }
    return segmentObj;
}


function rangeRemap(i, inMin, inMax, outMin, outMax) {
    return outMin + ((outMax - outMin) / (inMax - inMin)) * (i - inMin);
}