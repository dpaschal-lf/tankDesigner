# tankdesigner specs

## Important: your tank must extend the BaseTank class, and must have at least these functions: 
/*
constructor(callback, options,setup){
	super(callback, options,setup);
}
compute(){
	//your main AI code goes here.
}

## BaseTank Specs

### Properties:

### Methods:
- getDistanceToBounds
	- purpose: get distance to north, south, east, and west boundaries of game world
	- params: none
	- return: (object) : 
		- north: distance to north bounds, 
		- south: distance to south bounds, 
		- east: distance to east bounds, 
		- west: distance to west bounds}
- move
	- purpose: move the tnak
	- params: (string) direction
		- 'forward' : move the tank forward;
		- 'backward' : move the tank backward;
		- 'stop': stop tank movement
	- return: undefined
- turretTurn
	- purpose: turn the turret in the specified direction, relative to world direction
	- params: angle (number)
	- return: undefined
- bodyTurn
	- purpose: turn the tank in the specified direction, relative to the world direction
	- params: angle (number)
	- return: undefined
- fireCannon
	- purpose: fire tank cannon
	- params: undefined
	- return: undefined
- activateSensor
	- purpose: detect tanks in front of the tanks turret
	- params: none
	- return: (array) array of objects for each object detected
		- object
			- angle (number) - the real world direction to the object
			- range (number) - the distance to the object
			- name (string) - the name of the object
- activateMagnetoDetector
	- purpose: get general direction of other tanks
	- params: none
	- return: (object) list of directions with count of tanks in that direction
		- ne: (number) count of tanks to the northeast (up right)
		- sw: (number) count ot anks to the southwest (down left)
		- nw: (number) you get the idea
		- se: (number) more of the same
- getCurrentPosition
	- purpose: return the x,y coordinates of your tank
	- return: (object)
		- x: x coordinate of the tank
		- y: y coordinate of the tank
- getTurretAngle
	- purpose: return the angle of the turret
	- params: none
	- return: (number) the degree angle of the turret relative to the world
- getBodyAngle
	- purpose: return the angle of the tank body
	- params: none
	- return: (number) the degree angle of the tank body
- getName
	- purpose: get the current tank's name
	- params: none
	- return: (string) the name of the tank
- getHealth
	- purpose: get the current tank's hitpoints
	- params: none
	- return: (number) percentage of health remaining
- on
	- purpose: set an event listener
	- params:
		- handler (string) - the event to attach a handler to
			- turretTurnComplete : when turret reaches desired angle
			- bodyTurnComplete: when body reaches desired angle,
			- damage: when tank is damaged,
			- death: when tank dies,
			- collision: when tank collides with something
		- callback (function) - the handler to execute when the event happens
- getComponentSpecs
	- purpose: get specifications of an item on your tank
	- params: 
		- item (string) - the item you want the specs of
	- return: (object) with specs of the item in question









### Events: