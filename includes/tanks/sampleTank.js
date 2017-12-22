class SampleTank extends BaseTank{
	constructor(callback, options,setup){
		super(callback, options,setup);
		this.currentMode = 'search'; 
			//sniff = figure out directions to tanks in world
			//hunt = go in direction of most tanks and then search
			//search = look around for current tank in immediate vicinity
			//destroy = try to kill current target
		this.currentTarget = null;
		this.desiredDirection = null;
		this.scanInProgress = false;
		this.movingToPoint = false;
		this.directions = {
			ne: 315,
			nw: 45,
			sw: 135,
			se: 225
		}
	}
	getMostTargets(){
		let targets = this.activateMagnetoDetector();
		let mostTargetZone = null;
		let mostTargets = null;
		for(let z in targets){
			if(targets[z] > mostTargets){
				mostTargets = targets[z];
				mostTargetZone = z;
			}
		}
		if(mostTargets === null){
			this.compute = function(){};
			console.log('I am the champion!');
			return false;
		}
		return this.directions[mostTargetZone];
	}
	getClosestTargets(targets){
		let closestIndex = 0;
		let closestRange = null;
		
		for(let i=1; i<targets.length; i++){
			if(targets[i].range < closestRange){
				closestIndex = i;
				closestRange = targets[i].range;
			}
		}

		return targets[closestIndex];	
	}
	scanVicinity(callback){
		if(this.scanInProgress){
			return;
		}
		this.scanInProgress= true;
		let zonesToScan = [0,66, 132, 198, 264, 330];
		let currentZone = 0;
		let timer = null;
		let scans = [];
		scanZone.call(this);
		function scanZone(){
			if(this.getTurretAngle() !== zonesToScan[currentZone]){
				this.on('turretTurnComplete', scanZone.bind(this) );
				this.turretTurn(zonesToScan[currentZone]);
			} else {
				scans = scans.concat(this.activateSensor());
				if(++currentZone >= zonesToScan.length){
					callback(scans);
					this.scanInProgress = false;
					return;
				}
				scanZone.call(this);
			}
			
		}
	}
	updateTargets(targets){
		if(targets){
			this.currentTarget = this.getClosestTargets(targets);
		}
		this.on('turretTurnComplete', this.fireAndRescan.bind(this) );
		if(this.currentTarget){
			this.move('stop');
			this.turretTurn(this.currentTarget.angle);
		}
	}
	fireAndRescan(){
		const gunSpecs = this.getComponentSpecs('gun');
		if(gunSpecs.range > this.currentTarget.range){
			this.fireCannon();
			setTimeout(this.reScan.bind(this), 500);
		} else {
			this.currentMode = 'hunt';
			this.on('bodyTurnComplete',this.moveForwardAndScan.bind(this,1000));
			this.bodyTurn(this.currentTarget.angle+180);
		}
	}

	reScan(){
		const targets = this.activateSensor();
		let i = 0;
		while(i<targets.length){
			 if(targets[i].name === this.currentTarget.name){
			 	if(this.getTurretAngle() != targets[i].angle){
			 		this.currentTarget = targets[i];
			 		this.updateTargets();
			 	} else {
			 		this.fireAndRescan();
			 	}
			 	return;
			 }
			 i++;
		}
		this.magnetoScan = this.activateMagnetoDetector();
		this.currentTarget = null;
	}
	moveForwardAndScan(duration=5000){
		this.move('forward');
		setTimeout(this.stopAndScan.bind(this),duration);
	}
	stopAndScan(){
		this.move('stop');
		this.currentMode = 'search'
	}
	compute(){
		//return;
		console.log(this.currentMode + ' mode');
		switch(this.currentMode){
			case 'sniff':
				var targets = this.activateMagnetoDetector();
				if(targets.length>0){
					this.desiredDirection = this.getMostTargets(targets);
					this.currentMode = 'hunt';
		 			this.on('bodyTurnComplete',this.moveForwardAndScan.bind(this));
		 			console.log(targets, this.desiredDirection); 
		 			debugger;
		 			this.bodyTurn(this.desiredDirection);
				} else {
					this.currentMode = 'stop'; //no more other tanks on game board
				}
				
				break;
			case 'search':
				this.currentMode = 'scanning';
				this.scanVicinity( this.updateTargets.bind(this) );
				break;
			case 'destroy':
				if(this.currentTarget){
					this.fireAndRescan();
				}
				//console.log("current target: "+this.currentTarget)
				else if(this.currentTarget===null){
					this.currentMode='search';
				} else if(this.currentTarget===undefined){
					this.currentMode = 'sniff';
				}
				break;
			case 'hunt':
				break;
			case 'scanning':
				if(this.currentTarget!==null){ //if we are scanning, look for a target to be available
					this.currentMode = 'destroy'
				}
				break;

		}

		// if(!this.movingToPoint && this.currentTarget===null && !this.scanInProgress){
			
		// } else if(!this.movingToPoint && !this.scanInProgress){
		// 	if(!this.desiredDirection){
		// 		this.desiredDirection = this.getMostTargets();
		// 	}
		// 	if(this.getBodyAngle !== this.desiredDirection && !this.bodyTurning){
		// 		const gunSpecs = this.getComponentSpecs('gun');
		// 		if(!this.currentTarget){
		// 			let desiredAngle = 		
		// 			this.bodyTurning = true;
		// 			this.on('bodyTurnComplete',this.moveForwardAndScan.bind(this));
		// 			this.bodyTurn(this.desiredDirection);
		// 		} 

		// 	}
		// } else {

		// }
		
	}
}
