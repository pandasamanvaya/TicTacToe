var TicTacToe = artifacts.require("TicTacToe");

const GAME_CREATED_EVENT = "GameCreated";
const PLAYER_JOINED_EVENT = "PlayerJoinedGame";
const PLAYER_MADE_MOVE_EVENT = "PlayerMadeMove";
const GAME_OVER_EVENT = "GameOver";
const GAME_MONEY = "SentMoney";
const GAME_TIMED_OUT = "TimedOut"

function wait(time){
   var start = new Date().getTime();
   var end = start;
   while(end < start + time) {
     end = new Date().getTime();
  }
}

contract('TicTacToe', function(accounts) {
	it("should create a game", () => {
        var tic_tac_toe;
        return TicTacToe.deployed().then((instance) => {
    	    tic_tac_toe = instance;
    	    return tic_tac_toe.newGame();
        }).then((result) => {
        	eventArgs = getEventArgs(result, GAME_CREATED_EVENT);
        	assert.isTrue(eventArgs !== false);
        	
        	assert.equal(accounts[0], eventArgs.creator, "Game creator was not logged correctly.");
        	assert.notEqual(0, eventArgs.gameId, "The game was not created.");
        });
    });

    it("should join a game with sufficient funds", () => {
        var tic_tac_toe;
        var price = 200;
        var choice = 1;
        var game_id;

        return TicTacToe.deployed().then((instance) => {
            tic_tac_toe = instance;
            return tic_tac_toe.newGame();
        }).then((result) => {
            eventArgs = getEventArgs(result, GAME_CREATED_EVENT);
            game_id = eventArgs.gameId;
            return tic_tac_toe.joinGame(game_id, choice, {from: accounts[0], value: price});
        }).then((result) => {
            eventArgs = getEventArgs(result, GAME_MONEY);
            assert.isTrue(eventArgs !== false, "Player joined game with insufficient funds");
        });
    });

    it("should allow to join a game with random player", () => {
        var tic_tac_toe;
        var price = 200;
        var choice = 0;
        var game_id;

        return TicTacToe.deployed().then((instance) => {
            tic_tac_toe = instance;
            return tic_tac_toe.newGame();
        }).then((result) => {
            eventArgs = getEventArgs(result, GAME_CREATED_EVENT);
            game_id = eventArgs.gameId;
        }).then(async(result) => {
            //Catch invalid choice
            try{
                await tic_tac_toe.joinGame(game_id, 3, {from: accounts[0], value: price});
            }
            catch(err){
                assert.include(err.message, "revert");
            }
            return tic_tac_toe.joinGame(game_id, choice, {from: accounts[0], value: price});
        }).then(async (result) => {
            //Catch error if all seats are taken
            try{
                await tic_tac_toe.joinGame(game_id, choice, {from: accounts[1], value: price});
            }
            catch(err){
                assert.include(err.message, "revert");
            }
           });
    });

    it("should accept exactly two players", () => {
        var tic_tac_toe;
        var price = 200;
        var choice = 1;
        var game_id;

        return TicTacToe.deployed().then((instance) => {
    	    tic_tac_toe = instance;
    	    
    	    return tic_tac_toe.newGame();
        }).then((result) => {
        	eventArgs = getEventArgs(result, GAME_CREATED_EVENT);
        	game_id = eventArgs.gameId;

        	return tic_tac_toe.joinGame(game_id, choice, {from: accounts[0], value: price});
        }).then((result) => {
        	eventArgs = getEventArgs(result, PLAYER_JOINED_EVENT);
        	assert.isTrue(eventArgs !== false, "Player one did not join the game.");
        	assert.equal(accounts[0], eventArgs.player.valueOf(), "The wrong player joined the game.");
        	assert.equal(0, (game_id.valueOf()-eventArgs.gameId.valueOf()), "Player one joined the wrong game.");

        	return tic_tac_toe.joinGame(game_id, choice, {from: accounts[1], value: price});
        }).then( async(result) => {
        	eventArgs = getEventArgs(result, PLAYER_JOINED_EVENT);
        	assert.isTrue(eventArgs !== false, "Player two did not join the game.");
        	assert.equal(accounts[1], eventArgs.player, "The wrong player joined the game.");
        	assert.equal(0, (game_id.valueOf()-eventArgs.gameId.valueOf()), "Player two joined the wrong game.");
            //Catch error if all seats are taken
            try{
            	await tic_tac_toe.joinGame(game_id, choice, {from: accounts[2], value: price});
            }
            catch(err){
                assert.include(err.message, "revert");
            }
        });
    });

    // it("should let the players make moves", () => {
    //     var tic_tac_toe;
    //     var price = 200;
    //     var choice = 1;
    //     var game_id;
    //     return TicTacToe.deployed().then((instance) => {
    // 	    tic_tac_toe = instance;
    	    
    // 	    return tic_tac_toe.newGame();
    //     }).then((result) => {
    //     	eventArgs = getEventArgs(result, GAME_CREATED_EVENT);
    //     	game_id = eventArgs.gameId;

    //     	return tic_tac_toe.joinGame(game_id, choice, {from: accounts[0], value: price});
    //     }).then((result) => {
    //     	return tic_tac_toe.joinGame(game_id, choice, {from: accounts[1], value: price});
    //     }).then((result) => {
    //     	return tic_tac_toe.makeMove(game_id, 0, 0, {from: accounts[0]});
    //     }).then((result) => {
    //     	eventArgs = getEventArgs(result, PLAYER_MADE_MOVE_EVENT);
    //     	assert.isTrue(eventArgs !== false, "Player did not make a move.");
    //     	assert.equal(accounts[0], eventArgs.player, "The wrong player joined the game.");
    //     	assert.equal(0, (game_id.valueOf()-eventArgs.gameId.valueOf()), "Player made move in the wrong game.");
    //     	assert.equal(0, eventArgs.xCoordinate.valueOf(), "Player made move in another cell.");
    //     	assert.equal(0, eventArgs.yCoordinate.valueOf(), "Player made move in another cell.");

    //     	return tic_tac_toe.makeMove(game_id, 1, 1, {from: accounts[1]});
    //     }).then((result) => {
    //     	eventArgs = getEventArgs(result, PLAYER_MADE_MOVE_EVENT);
    //     	assert.isTrue(eventArgs !== false, "Player did not make a move.");
    //     	assert.equal(accounts[1], eventArgs.player, "The wrong player joined the game.");
    //     	assert.equal(0, (game_id.valueOf()-eventArgs.gameId.valueOf()), "Player made move in the wrong game.");
    //     	assert.equal(1, eventArgs.xCoordinate.valueOf(), "Player made move in another cell.");
    //     	assert.equal(1, eventArgs.yCoordinate.valueOf(), "Player made move in another cell.");

    //     	return tic_tac_toe.makeMove(game_id, 0, 1, {from: accounts[0]});
    //     }).then((result) => {
    //     	eventArgs = getEventArgs(result, PLAYER_MADE_MOVE_EVENT);
    //     	assert.isTrue(eventArgs !== false, "Player did not make a move.");
    //     	assert.equal(accounts[0], eventArgs.player, "The wrong player joined the game.");
    //     	assert.equal(0, (game_id.valueOf()-eventArgs.gameId.valueOf()), "Player made move in the wrong game.");
    //     	assert.equal(0, eventArgs.xCoordinate.valueOf(), "Player made move in another cell.");
    //     	assert.equal(1, eventArgs.yCoordinate.valueOf(), "Player made move in another cell.");

    //     	return tic_tac_toe.makeMove(game_id, 1, 2, {from: accounts[1]});
    //     }).then((result) => {
    //     	eventArgs = getEventArgs(result, PLAYER_MADE_MOVE_EVENT);
    //     	assert.isTrue(eventArgs !== false, "Player did not make a move.");
    //     	assert.equal(accounts[1], eventArgs.player, "The wrong player joined the game.");
    //     	assert.equal(0,(game_id.valueOf()-eventArgs.gameId.valueOf()), "Player made move in the wrong game.");
    //     	assert.equal(1, eventArgs.xCoordinate.valueOf(), "Player made move in another cell.");
    //     	assert.equal(2, eventArgs.yCoordinate.valueOf(), "Player made move in another cell.");

    //     	return tic_tac_toe.makeMove(game_id, 0, 2, {from: accounts[0]});
    //     }).then((result) => {
    //     	eventArgs = getEventArgs(result, GAME_OVER_EVENT);
    //     	assert.isTrue(eventArgs !== false, "Game is not over.");
    //     	assert.equal(1, eventArgs.winner, "The wrong player won the game (or draw).");
    //         assert.equal(0, (game_id.valueOf()-eventArgs.gameId.valueOf()), "Player won the wrong game.");
    //     	assert.notEqual(web3.eth.getBalance(accounts[0]), web3.eth.getBalance(accounts[1]), "Prize Money not recieved.");
    //     });
    // });

    it("should timeout for making late move", () => {
        var tic_tac_toe;
        var price = 200;
        var choice = 1;
        var game_id;
        return TicTacToe.deployed().then((instance) => {
            tic_tac_toe = instance;
            
            return tic_tac_toe.newGame();
        }).then((result) => {
            eventArgs = getEventArgs(result, GAME_CREATED_EVENT);
            game_id = eventArgs.gameId;

            return tic_tac_toe.joinGame(game_id, choice, {from: accounts[0], value: price});
        }).then((result) => {
            return tic_tac_toe.joinGame(game_id, choice, {from: accounts[1], value: price});
        }).then((result) => {
            return tic_tac_toe.makeMove(game_id, 0, 0, {from: accounts[0]});
        }).then((result) => {
            wait(11000);
            return tic_tac_toe.makeMove(game_id, 0, 1, {from: accounts[1]});
        }).then((result) => {
            eventArgs = getEventArgs(result, GAME_TIMED_OUT);
            assert.isTrue(eventArgs !== false, "Game didn't timeout");
        });
    });

    it("should not let the same player make two moves in a row", () => {
        var tic_tac_toe;
        var price = 200;
        var choice = 1;
        var game_id;
        return TicTacToe.deployed().then((instance) => {
    	    tic_tac_toe = instance;
    	    
    	    return tic_tac_toe.newGame();
        }).then((result) => {
        	eventArgs = getEventArgs(result, GAME_CREATED_EVENT);
        	game_id = eventArgs.gameId;

        	return tic_tac_toe.joinGame(game_id, choice, {from: accounts[0], value: price});
        }).then((result) => {
        	return tic_tac_toe.joinGame(game_id, choice, {from: accounts[1], value: price});
        }).then((result) => {
        	return tic_tac_toe.makeMove(game_id, 0, 0, {from: accounts[0]});
        }).then((result) => {
        	return tic_tac_toe.makeMove(game_id, 0, 1, {from: accounts[1]});
        }).then(async(result) => {
            //Catch error if move made in cell previously filled
            try{
        	   await tic_tac_toe.makeMove(game_id, 0, 2, {from: accounts[1]});
            }
            catch(err){
                assert.include(err.message, "revert");
            }
        });
    });

    it("should not let a player make a move at already filled coordinates", () => {
        var tic_tac_toe;
        var price = 200;
        var choice = 1;
        var game_id;
        return TicTacToe.deployed().then((instance) => {
    	    tic_tac_toe = instance;
    	    
    	    return tic_tac_toe.newGame();
        }).then((result) => {
        	eventArgs = getEventArgs(result, GAME_CREATED_EVENT);
        	game_id = eventArgs.gameId;

        	return tic_tac_toe.joinGame(game_id, choice, {from: accounts[0], value: price});
        }).then((result) => {
        	return tic_tac_toe.joinGame(game_id, choice, {from: accounts[1], value: price});
        }).then((result) => {
        	return tic_tac_toe.makeMove(game_id, 0, 0, {from: accounts[0]});
        }).then((result) => {
        	return tic_tac_toe.makeMove(game_id, 0, 1, {from: accounts[1]});
        }).then(async(result) => {
            //Catch error if 2 moves made consecutively
            try{
        	   await tic_tac_toe.makeMove(game_id, 0, 1, {from: accounts[0]});
            }
            catch(err){
                assert.include(err.message, "revert");
            }
        });
    });
});

// getEventArgs returns the event args from the transaction result,
// filtered by event_name.
// Returns the boolean `false` if no event with the given name was found.
function getEventArgs(transaction_result, event_name) {
	for (var i = 0; i < transaction_result.logs.length; i++) {
        var log = transaction_result.logs[i];

        if (log.event == event_name) {
            return log.args;
        }
    }

    return false;
}
