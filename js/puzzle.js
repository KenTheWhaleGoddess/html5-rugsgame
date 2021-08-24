var game = new Phaser.Game(400, 600, Phaser.CANVAS, 'phaser-example', { preload: preload, create: null });

var PIECE_WIDTH = 200,
    PIECE_HEIGHT = 200,
    BOARD_COLS,
    BOARD_ROWS;

var piecesGroup,
    piecesAmount,
    shuffledIndexArray = [];


// Application id from moralis.io
Moralis.initialize('igDYNSIRB7leqHRpnUuNPfplY1fn0Y60fp5AM8zV');
//Server url from moralis.io
Moralis.serverURL = 'https://e1qealego843.moralisweb3.com:2053/server';

async function preload() {
    await ethereum.enable();
}

async function login() {
    try {
        const user = await Moralis.Web3.authenticate();
        console.log(user);
        alert("User logged in");
        
        const userinfo = Moralis.User.current();
        const userAddress = userinfo.get("ethAddress");
        const openseaRugs = await fetch('https://api.opensea.io/api/v1/assets?order_direction=desc&offset=0&limit=50&collection=8bit-rugs&owner=' + userAddress);
        const rugs = await openseaRugs.json();
        console.log(rug[0]);
        hideLogin();
        prepareBoard(rug[0]);
    } catch (error) {
        console.log(error);
    }
}

async function hideLogin() {
	$('#login_button').hide();
}

function prepareBoard(rug) {
    console.log(rug);

    game.load.spritesheet("background", rug.image_url, PIECE_WIDTH, PIECE_HEIGHT);

    var piecesIndex = 0,
        i, j,
        piece;

    BOARD_COLS = Math.floor(game.world.width / PIECE_WIDTH);
    BOARD_ROWS = Math.floor(game.world.height / PIECE_HEIGHT);

    piecesAmount = BOARD_COLS * BOARD_ROWS;

    shuffledIndexArray = createShuffledIndexArray();

    piecesGroup = game.add.group();

    for (i = 0; i < BOARD_ROWS; i++)
    {
        for (j = 0; j < BOARD_COLS; j++)
        {
            if (shuffledIndexArray[piecesIndex]) {
                piece = piecesGroup.create(j * PIECE_WIDTH, i * PIECE_HEIGHT, "background", shuffledIndexArray[piecesIndex]);
            }
            else { //initial position of black piece
                piece = piecesGroup.create(j * PIECE_WIDTH, i * PIECE_HEIGHT);
                piece.black = true;
            }
            piece.name = 'piece' + i.toString() + 'x' + j.toString();
            piece.currentIndex = piecesIndex;
            piece.destIndex = shuffledIndexArray[piecesIndex];
            piece.inputEnabled = true;
            piece.events.onInputDown.add(selectPiece, this);
            piece.posX = j;
            piece.posY = i;
            piecesIndex++;
        }
    }

}

function selectPiece(piece) {

    var blackPiece = canMove(piece);

    //if there is a black piece in neighborhood
    if (blackPiece) {
        movePiece(piece, blackPiece);
    }

}

function canMove(piece) {

    var foundBlackElem = false;

    piecesGroup.children.forEach(function(element) {
        if (element.posX === (piece.posX - 1) && element.posY === piece.posY && element.black ||
            element.posX === (piece.posX + 1) && element.posY === piece.posY && element.black ||
            element.posY === (piece.posY - 1) && element.posX === piece.posX && element.black ||
            element.posY === (piece.posY + 1) && element.posX === piece.posX && element.black) {
            foundBlackElem = element;
            return;
        }
    });

    return foundBlackElem;
}

function movePiece(piece, blackPiece) {

    var tmpPiece = {
        posX: piece.posX,
        posY: piece.posY,
        currentIndex: piece.currentIndex
    };

    game.add.tween(piece).to({x: blackPiece.posX * PIECE_WIDTH, y: blackPiece.posY * PIECE_HEIGHT}, 300, Phaser.Easing.Linear.None, true);

    //change places of piece and blackPiece
    piece.posX = blackPiece.posX;
    piece.posY = blackPiece.posY;
    piece.currentIndex = blackPiece.currentIndex;
    piece.name ='piece' + piece.posX.toString() + 'x' + piece.posY.toString();

    //piece is the new black
    blackPiece.posX = tmpPiece.posX;
    blackPiece.posY = tmpPiece.posY;
    blackPiece.currentIndex = tmpPiece.currentIndex;
    blackPiece.name ='piece' + blackPiece.posX.toString() + 'x' + blackPiece.posY.toString();

    //after every move check if puzzle is completed
    checkIfFinished();
}

function checkIfFinished() {

    var isFinished = true;

    piecesGroup.children.forEach(function(element) {
        if (element.currentIndex !== element.destIndex) {
            isFinished = false;
            return;
        }
    });

    if (isFinished) {
        showFinishedText();
    }

}

function showFinishedText() {

    var style = { font: "40px Arial", fill: "#000", align: "center"};

    var text = game.add.text(game.world.centerX, game.world.centerY, "Congratulations! \nYou made it!", style);

    text.anchor.set(0.5);

}

function createShuffledIndexArray() {

    var indexArray = [];

    for (var i = 0; i < piecesAmount; i++)
    {
        indexArray.push(i);
    }

    return shuffle(indexArray);

}

function shuffle(array) {

    var counter = array.length,
        temp,
        index;

    while (counter > 0)
    {
        index = Math.floor(Math.random() * counter);

        counter--;

        temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }

    return array;
    
}

document.getElementById("login_button").onclick = login;