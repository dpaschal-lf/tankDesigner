

class TankDesigner{
	constructor(){
		this.tanks = [];
		this.gameTimer = null;
		this.timerInterval = 150;
		this.intervalsPerSecond = 1000 / this.timerInterval;
		this.shiftRatio = this.timerInterval / 1000;
		this.callbacks = {
			load: this.loadComponent,
			turretTurn: this.turnTankTurret,
			bodyTurn: this.turnTankBody,
			fireGun: this.fireTankGun,
			move: this.moveTank,
			activateSensor: this.activateTankSensor
		};
		for(let callback in this.callbacks){
			this.callbacks[callback] = this.callbacks[callback].bind(this);
		}
	}
	createGameSpace(targetArea){
		this.gamePanel = $("<div>",{
			'class': 'gamePanel'
		})
		this.gameArea = $("<div>",{
			'class': 'gameArea'
		});
		this.gamePanel.appendTo(this.gameArea);
		$(targetArea).append(this.gameArea);
		this.gamePanel.css({
			height: '10000px',
			width: '10000px',
			left: '-5000px',
			top: '-5000px'
		});
	}
	startHeartbeat(){
		if(this.gameTimer){
			this.stopHeartbeat();
		}
		this.gameTimer = setInterval(this.handleHeartbeat.bind(this), this.timerInterval);
	}
	stopHeartbeat(){
		clearInterval(this.gameTimer);
		this.gameTimer = null;
	}
	handleHeartbeat(){
		this.tanks.forEach( tank => {
			tank.handleUpdate();
		})
	}
	getDegreesFromRadians(radians){
		return radians * (180 / Math.PI);
	}
	getAngleBetweenPoints(sourcePoint, destinationPoint){
		var theta = Math.atan2(
			(sourcePoint.y - destinationPoint.y ) ,
			(sourcePoint.x - destinationPoint.x )
		);
		return this.getDegreesFromRadians(theta) + 180;	 
	}
	detectAllTanksFromTank(sourceTank){
		const detectedTanks = [];
		this.tanks.forEach( tank => {
			if(sourceTank !== tank){
				let possibleTank = this.detectTankInRange(sourceTank, tank);
				if(possibleTank){
					detectedTanks.push(possibleTank);
				}
			}
		})
		return detectedTanks;
	}
	detectTankInRange(sourceTank, targetTank){
		const tankSensor = sourceTank.components.sensor;
		const sourceTankLocation = sourceTank.getCurrentPosition();
		const targetTankLocation = targetTank.getCurrentPosition();
		const targetTankAngle = this.getAngleBetweenPoints(sourceTankLocation,targetTankLocation);
		const baseSensorAngle = sourceTank.getTurretAngle();
		const halfArc = tankSensor.arc/2;
		const sensorAngles = {
			min: baseSensorAngle - halfArc,
			max: baseSensorAngle + halfArc
		}
		if(targetTankAngle >= sensorAngles.min && targetTankAngle <= sensorAngles.max){
			const tankRange = Math.sqrt(
				Math.pow(
					(sourceTankLocation.x - targetTankLocation.x),2
				) 
				+ 
				Math.pow(
					(sourceTankLocation.y - targetTankLocation.y),2
				)
			)
			if(tankRange < tankSensor.distance){
				console.log('detected');
				return {angle: targetTankAngle, range: tankRange, name: targetTank.getName()}
			}
			console.log('out of range, not detected');
		}
		console.log('out of angle, not detected');
		return false;
	}
	addTankToGameSpace(tankDom, worldLocation){
		this.gamePanel.append(tankDom);
		tankDom.css({
			left: worldLocation.x + 'px',
			top: worldLocation.y + 'px'
		});
	}
	makeTank(className, options={}, setup={}){

		//options has to do with tank components, like engine and gun
		//setup has to do with initial values like tank position and speed
		if(typeof className !=='function'){
			console.error(`tank class ${className} does not exist!`);
			return false;
		}
		setup.shiftRatio = this.shiftRatio;
		let tank = new className(this.callbacks, options, setup);
		this.tanks.push(tank);
		var domElement = tank.render();
		
		this.addTankToGameSpace(domElement, {x: setup.currentSpot.x, y: setup.currentSpot.y});

	}
	loadComponent(type, level){
		return tankParts[type][level];
	}
	commandTank(tank=this.tanks[0], action){
		tank[action];
	}
	moveTank(direction, tank){
		console.log('main game moving tank');
	}
	turnTankTurret(angle, tank){
		console.log('turning tank turret');
	}
	turnTankBody(angle, tank){
		console.log('tank body turn');
	}
	fireTankGun(tank){
		console.log('tank gun fire');
	}
	activateTankSensor(tank){
		console.log('tank sensor activate');
		return this.detectAllTanksFromTank(tank);
	}
}
const tankParts = {
	engine:{
		0: {
			speed: 20, //pixels per second
			power: 10,  //how many units of power does it provide for upgrades
			turnSpeed: 10,  //degrees per second,
			spaceNeeded: 10
		}
	},
	sensor: {
		0: {
			arc: 45,
			distance: 150, //detection range in pixels,
			powerUsage: 2, //power usage in units
			spaceNeeded: 1
		}
	},
	body: { 
		0: {
			size: {
				height: '20px',
				width: '40px'
			},
			equipmentSpace: 10, //units of space in body
			armor: 0  //units of armor (damage reduduction)
		}
	},
	turret: {
		0: {
			size: {
				height: '10px',
				width: '10px'
			},
			equipmentSpace: 3,  //units of space in the turret
			turnSpeed: 33 //33 degrees per second
		}
	},
	gun: {
		0: {
			range: 200, //range in pixels
			reload: 5, //time in seconds
			damage: 20, //hitpoints damage
			spaceNeeded: 2
		}
	}
}

class BaseTank{
	constructor(callbacks, options={}, setup={}){
		this.loader = callbacks.load;
		this.callbacks = callbacks;
		this.world = {};
		this.actionQueue = [];
		const defaults = {
			name: 'randomTank'+((Math.random()*100000000) >> 0),
			engine: 0,
			sensor: 0,
			gun: 0,
			body: 0,
			turret: 0
		}
		const initialValues = {
			turretAngle: 0,
			destinationTurretAngle: 0,
			tankAngle: 0,
			destinationTankAngle: 0,
			speed: 0,
			direction: 1,
			shiftRatio: 1,
			turretTurnDelta: 0,
			tankTurnDelta: 0,
			currentSpot: {x: 0, y: 0}
		}
		this.components = {};
		this.options = {};
		this.values = {};
		for(let key in defaults){
			this.options[key] = options[key] || defaults[key];
		}
		for(let key in initialValues){
			this.values[key] = setup[key] || initialValues[key];
		}
		this.loadComponents();
		this.handleUpdate = this.handleFirstUpdate;
	}
	loadComponents(){
		const componentsToLoad = ['engine','sensor','gun', 'turret'];
		componentsToLoad.forEach(
			componentType => {
				this.components[componentType] = this.loader(componentType, this.options[componentType])
		});
	}

	handleFirstUpdate(){
		this.values.currentSpot = this.domElements.body.position();
		this.values.width= this.domElements.body.width();
		this.values.height= this.domElements.body.height();
		this.handleUpdate = this.handleSuccessiveUpdate;
		this.values.radianConvert = Math.PI / 180;
		this.calculateNewDelta();
	}
	handleSuccessiveUpdate(){
		
		this.values.currentSpot.left += this.values.delta.x;
		this.values.currentSpot.top += this.values.delta.y;

 		this.values.turretAngle = this.convertTo360(this.values.turretAngle);
 		this.values.tankAngle = this.convertTo360(this.values.tankAngle);
 		if(this.values.destinationTankAngle !== this.values.tankAngle){
 			var difference = Math.abs(this.values.tankAngle - this.values.destinationTankAngle);
 			if(difference < Math.abs(this.values.tankTurnDelta)){
 				this.values.tankAngle = this.values.destinationTankAngle;
 			} else {
 				this.values.tankAngle += this.values.tankTurnDelta;
 			}
 		}


 		if(this.values.destinationTurretAngle !== this.values.turretAngle){
  			var difference = Math.abs(this.values.turretAngle - this.values.destinationTurretAngle);
 			if(difference < Math.abs(this.values.turretTurnDelta)){
 				this.values.turretAngle = this.values.destinationTurretAngle;
 			} else {
 				this.values.turretAngle += this.values.turretTurnDelta;
 			}
 		}

  		this.domElements.body.css({
 			left: this.values.currentSpot.left + 'px',
 			top: this.values.currentSpot.top + 'px',
 			transform: `rotateZ(${this.values.tankAngle}deg)`
 		});
 		this.domElements.turret.css({transform: 'translate(-50%, -50%) rotateZ('+this.values.turretAngle+'deg)'})

 		//console.log('tank '+this.options.name + ' update');
	}
	render(){
		const turret = $("<div>",{
			'class': 'tank turret'
		});
		const body = $("<div>",{
			'class': 'tank body'
		});
		body.append(turret);
		this.domElements = {
			body: body,
			turret: turret
		} 
		return body;
	}
	convertTo360(angle){
		if(angle>360){
			angle = 0 + angle % 360;
		} else if(angle<0){
			angle = 360 - this.convertTo360(angle*-1);
		}
		return angle;	
	}
	determinaAngleDirection(origin, destination){
		if((destination - origin + 360) % 360 < 180){
			return 1
		} 
		return -1;
	}
	turretTurn(angle){
		angle = this.convertTo360(angle);

		this.callbacks.turretTurn(angle, this);
		this.values.turretTurnDelta = this.values.shiftRatio * this.components.turret.turnSpeed * this.determinaAngleDirection(this.values.turretAngle, angle);
		this.values.destinationTurretAngle = angle;

	}
	calculateNewDelta(){
		this.values.delta = { x: null, y: null};
		var radians = this.values.tankAngle * this.values.radianConvert;
		this.values.delta.y = (this.values.speed* this.values.shiftRatio * this.values.direction) * Math.sin(radians);
		this.values.delta.x = (this.values.speed* this.values.shiftRatio * this.values.direction) * Math.cos(radians);
	}
	bodyTurn(angle){
		this.callbacks.bodyTurn(angle, this);
		angle = this.convertTo360(angle);
		this.values.tankTurnDelta = this.values.shiftRatio * this.components.engine.turnSpeed * this.determinaAngleDirection(this.values.tankAngle, angle);
		this.values.destinationTankAngle = angle;
		this.calculateNewDelta();
	}
	fireCannon(){
		this.callbacks.fireGun(this);
	}
	activateSensor(){
		this.callbacks.activateSensor(this);
	}
	move(direction){
		switch(direction){
			case 'stop': 
				this.values.speed = 0;
				this.calculateNewDelta();
				return; 
			case 'forward':
			case 'backward':
				this.callbacks.move(direction,this);
				this.values.destinationTankAngle = this.values.tankAngle; //if we move, stop our turn
				break;
			default: 
				console.error('invalid direction');
				return;
		}
		console.log(this);
		this.values.speed = this.components.engine.speed;
		this.values.direction = direction==='forward' ? 1 : -1;
		this.calculateNewDelta();
	}
	getCurrentPosition(){
		return {
			x: this.values.currentSpot.left + this.domElements.body.width()/2,
			y: this.values.currentSpot.top + this.domElements.body.height()/2,
		}
	}
	getTurretAngle(){
		return this.values.turretAngle;
	}
	getName(){
		return this.options.name;
	}

}
class DanTank extends BaseTank{
	constructor(callback, options,setup){
		super(callback, options,setup);
	}
}