document.addEventListener('DOMContentLoaded', ()=> {

    const grid = document.querySelector(".grid")
    let squares = Array.from(document.querySelectorAll('.grid div'))
    const ScoreDisplay = document.getElementById("score")
    const startButton = document.getElementById("start-button")
    const width = 10 // width of full grid
    let currentPos = -1;
    let currScore = 0;
    const colorClasses = [
        'teto1','teto2','teto3','teto4','teto5'
    ]
    const grid2 = document.querySelector(".grid2")
    let nextSquares = Array.from(document.querySelectorAll('.grid2 div'))
    let gameOver = false;

    // global vars
    let nextTetIndChoice = -1;
    let tetIndChoice = 0;
    let tetOChoice = 0;
    let current = [];
    let timerID;
    let colorICurrNext = Math.floor(Math.random()*colorClasses.length)
    let colorICurr = Math.floor(Math.random()*colorClasses.length)

    // setup
    setFullLoadingZone()

    // listen for user input
    // arrows 
    function control(e) {
        if (gameOver) {
            return
        }
        if (e.keyCode === 37) {
            moveLeft()
        }
        if (e.keyCode === 39) {
            moveRight()
        }
        if (e.keyCode === 38) {
            rotateLeft()
        }
        if (e.keyCode === 40) {
            moveDownFast()
        }
    }
    document.addEventListener('keyup',control)

    // event listener for start button
    startButton.addEventListener('click',() => {
        if (gameOver) {
            return
        }
        // if timerID is null, we have to start/restart the game
        if (timerID) { // not null, so pause game
            clearInterval(timerID)
            timerID = null
        } else if (currentPos == -1) { // start for first time
            // call moveDown() every second
            currentPos = Math.floor(Math.random()*8);
            getRandTet()
            draw()
            timerID = setInterval(moveDown,500)
        } else { // restart
            draw()
            timerID = setInterval(moveDown,500)
        }
    })
    // make tetrominos

    // L-tetromino
    // give indices of squares that make up this shape for all rotations
    // given 3x3 shape grid is placed at top left
    // _ X X
    // _ x _
    // _ X _
    // 
    // _ _ _
    // X X X
    // _ _ X
    // 
    // _ X _
    // _ X _
    // X X _
    // 
    // X _ _
    // X X X

    const lTetromino = [[1,2,width+1,2*width+1],
                        [width,width+1,width+2,2*width+2],
                        [1,width+1,2*width,2*width+1],
                        [0,width,width+1,width+2]]

    // I-tetromino
    const iTetromino = [[1,width+1,2*width+1,3*width+1],
                        [width,width+1,width+2,width+3],
                        [1,width+1,2*width+1,3*width+1],
                        [width,width+1,width+2,width+3]]
    
    // sTetromino
    // X _ _
    // X X _
    // _ X _
    // 
    // _ X X
    // X X _
    // _ _ _
    const sTetromino = [[0,width,width+1,2*width+1],
                        [1,2,width,width+1],
                        [0,width,width+1,2*width+1],
                        [1,2,width,width+1]]

    // tTetromino
    const tTetromino = [[1,width,width+1,2*width+1],
                        [1,width,width+1,width+2],
                        [1,width+1,width+2,width*2+1],
                        [width+1,width+2,width,2*width+1]]

    // oTetromino
    const oTetromino = [[0,1,width,width+1],
                        [1,2,width+1,width+2],
                        [width+1,width+2,width*2+1,width*2+2],
                        [width+1,width,2*width,2*width+1]]

    // z tetromino (opposite of s)
    // X X _
    // _ X X
    // _ _ _
    //
    // _ _ X
    // _ X X
    // _ X _
    const zTetromino = [[0,1,width+1,width+2],
                        [2,width+1,width+2,2*width+1],
                        [0,1,width+1,width+2],
                        [2,width+1,width+2,2*width+1]]

    // j tetromino (opposite of L)
    const jTetromino = [[0,1,width+1,2*width+1],
                        [width,width+1,width+2,2],
                        [1,width+1,2*width+2,2*width+1],
                        [width*2,width,width+1,width+2]]
                        
    var tets = [oTetromino,zTetromino,lTetromino,tTetromino,iTetromino,jTetromino,sTetromino]

    function draw() {
        current.forEach(val => {
            squares[currentPos+val].classList.add("teto");
            console.log(colorClasses[colorICurr])
            squares[currentPos+val].classList.add(colorClasses[colorICurr])
        })
    }

    function undraw() {
        current.forEach(val => {
            squares[currentPos+val].classList.remove("teto");
            squares[currentPos+val].classList.remove(colorClasses[colorICurr])
        })
    }

    function checkFullRow() {
        // for each row, check full row to see if it's all 'frozen'
        for (let i=0; i<=199; i+=width) {
            let row = [i,i+1,i+2,i+3,i+4,i+5,i+6,i+7,i+8,i+9];
            if (row.every(ind => squares[ind].classList.contains("taken"))) {
                // full row!
                console.log("full row!")
                currScore += width;
                ScoreDisplay.innerHTML = currScore
                removeRow(i)
            }

        }
    }

    function removeRow(i) {
        // remove whole width of this row 
        const remClasses = ["taken","teto","teto1","teto2","teto3","teto4","teto5"]
        for (let j=0; j<width; j++) {
            const theseClasses = squares[i+j].classList
            remClasses.forEach(className => {
                if (theseClasses.contains(className)) {
                squares[i+j].classList.remove(className)}
            })
        }
        removeLoadingZone()
        const squaresRemoved = squares.splice(i,width)
        console.log(squaresRemoved)
        // add new row to top
        squares = squaresRemoved.concat(squares)
        squares.forEach(cell => grid.appendChild(cell))
        setNewLoadingZone()
    }

    function moveDown() {
        undraw()
        currentPos += width;
        draw()
        lastPos = freeze();
        checkFullRow()
    }

    function freeze() {
        if(current.some(index => squares[currentPos+index+width].classList.contains("taken"))){
            colorIOld = colorICurr
            // check if game over. if freeze and in first row, end
            if (currentPos<width*3) {
                clearInterval(timerID)
                console.log("GAME OVER")
                current.forEach(index => squares[currentPos+index].classList.add("gameoverTeto"))
                ScoreDisplay.innerHTML = currScore + " Game over!"
                gameOver = true;
            }
            // add this to taken class
            current.forEach(index => squares[currentPos+index].classList.add("taken"))
            draw()
            colorICurr = colorICurrNext
            
            colorICurrNext = Math.floor(Math.random()*colorClasses.length)
            lastPos = currentPos;
            // start new falling teto
            getRandTet()
            let widthPiece = 0;
            current.forEach(ind => {
                let currW = ind % width 
                if (currW > widthPiece){
                    widthPiece = currW
                }
            })
            currentPos = Math.floor(Math.random()*(10-widthPiece));
            console.log("width is " + widthPiece)
            return lastPos;
        }
        return width;
    }

    function getRandTet() {
        // select random tet and orientation
        if (nextTetIndChoice < 0) { // we are just starting and havent picked any teto yet
            nextTetIndChoice = Math.floor(Math.random()*tets.length)
            nextTetOChoice = Math.floor(Math.random()*tets[nextTetIndChoice].length)
        }
        tetIndChoice = nextTetIndChoice
        tetOChoice = nextTetOChoice
        nextTetIndChoice = Math.floor(Math.random()*tets.length)
        nextTetOChoice = Math.floor(Math.random()*tets[nextTetIndChoice].length)
        setNextTet()
        current = tets[tetIndChoice][tetOChoice];
    }

    function setNextTet() {
        // undraw current
        const classRem = ['teto','teto1','teto2','teto3','teto4','teto5']
        classRem.forEach(c => {
            for (let x=0;x<16;x++) {
                if (nextSquares[x].classList.contains(c)) {
                    nextSquares[x].classList.remove(c)
                }
            }
        })
        console.log(nextSquares)
        // draw next
        var nextup = tets[nextTetIndChoice][nextTetOChoice];
        console.log("NEXT SHAPE BASE10 IS: " +nextup)
        let grid2Tet = [0,0,0,0];
        // transform to grid of width 4 basis
        for (let x=0;x<nextup.length;x++){
            var rowI = Math.floor(nextup[x]/width);
            grid2Tet[x] = nextup[x]-(rowI*width)+(rowI*4)
        }
        console.log("NEXT SHAPE BASE4 IS: " +grid2Tet)
        // console.log("nextup is: " + nextup)
        grid2Tet.forEach(ind => {
            nextSquares[ind].classList.add('teto')
            nextSquares[ind].classList.add(colorClasses[colorICurrNext])
        })
    }

    function moveLeft(){
        if (!timerID) {return}
        undraw()
        const isAtLeftEdge = current.some(index => (currentPos + index) % width === 0);
        const isLeftTaken = current.some(index => squares[currentPos-1 + index].classList.contains("taken"));
        if (isAtLeftEdge || isLeftTaken) {
            console.log("cant move left")
        } else {
            currentPos -= 1;
        }
        draw()
    }
    function moveRight(){
        if (!timerID) {return}
        undraw()
        console.log("TRYING TO MOVE RIGHT!")
        const isAtRightEdge = current.some(index => (currentPos + index) % width === width-1);
        const isRightTaken = current.some(index => squares[currentPos+1 + index].classList.contains("taken"));
        if (isAtRightEdge || isRightTaken) {
            console.log("cant move right")
        } else {
            currentPos += 1;
        }
        draw()
    }
    function moveDownFast(){
        if (!timerID) {return}
        undraw()
        console.log("TRYING TO MOVE DOWN!")
        const isNotFreeDowOne = current.some(index => squares[currentPos+index+width].classList.contains("taken"))
        if (!isNotFreeDowOne) {
            console.log("free one")
            const isFreeDownTwo = current.some(index => squares[currentPos+index+3*width].classList.contains("taken"))
            if (!isFreeDownTwo) {
                console.log("free two")
                currentPos += 2*width;
            }
        }
        draw()
    }
    function rotateLeft() {
        if (!timerID) {return}
        undraw()
        console.log("rotate left!")
        tetOChoiceN = (tetOChoice + 1)%4;
        let currentN = tets[tetIndChoice][tetOChoiceN];
        const isAtLeftEdge = current.some(index => (currentPos + index) % width === 0);
        const isAtRightEdge = current.some(index => (currentPos + index) % width === width-1);
        let crossLeftEdge = false;
        let crossRightEdge = false;
        console.log(currentN)
        if (isAtLeftEdge) {
            crossLeftEdge = currentN.some(index => (currentPos + index) % width === width-1);
        }
        if (isAtRightEdge) {
            crossRightEdge = currentN.some(index => (currentPos + index) % width === 0);
        } 
        if (crossLeftEdge || crossRightEdge) {
            console.log('new rot crosses edge!')
            draw()
            return
        }
        const isLeftTaken = currentN.some(index => squares[currentPos-1 + index].classList.contains("taken"));
        const isRightTaken = currentN.some(index => squares[currentPos+1 + index].classList.contains("taken"));
        if (isLeftTaken || isRightTaken){
            console.log('invalid rot!')
        } else {
            current = currentN;
            tetOChoice = tetOChoiceN;
        }
        draw()
    }
    function setFullLoadingZone() {
        for (let j=0; j<width*3; j++) {
            squares[j].classList.add("loadingzone")
        }
    }

    function setNewLoadingZone() {
        for (let j=0; j<width; j++) {
            squares[j].classList.add("loadingzone")
        }
    }

    function removeLoadingZone() {
        for (let j=width*2; j<width*3; j++) {
            squares[j].classList.remove("loadingzone")
        }
    }



})