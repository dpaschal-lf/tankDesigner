

const game = new TankDesigner();
game.createGameSpace('#mainDisplay');
game.makeTank(DanTank,{name: 'dantank'}, {currentSpot:{x: 5000 + game.gameArea.width()/2, y: 5000+game.gameArea.height()/2} });

game.makeTank(TargetTank,{name: 'targettank1'}, {currentSpot:{x: 4900 + game.gameArea.width()/2, y: 4900+game.gameArea.height()/2} });

/*
game.makeTank(DanTank,{name: 'targettank2'}, {currentSpot:{x: 5100 + game.gameArea.width()/2, y: 5100+game.gameArea.height()/2} });

game.makeTank(DanTank,{name: 'targettank3'}, {currentSpot:{x: 5050 + game.gameArea.width()/2, y: 5050+game.gameArea.height()/2} });

game.makeTank(DanTank,{name: 'targettank4'}, {currentSpot:{x: 5100 + game.gameArea.width()/2, y: 4900+game.gameArea.height()/2} });
*/
game.createInfoPanels('#extraInfo');
game.updateInfoView();
game.startHeartbeat();
var tank = game.tanks[0]






