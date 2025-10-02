document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.grid');
    const scoreDisplay = document.getElementById('score');
    const timerDisplay = document.getElementById('timer');
    const startBtn = document.getElementById('start-btn');
    const restartBtn = document.getElementById('restart-btn');
    const startMessage = document.getElementById('start-message');

    const width = 8;
    const squares = [];
    const jewelImagePaths = [
        'image/free-icon-diamond-3557840.png',
        'image/free-icon-diamond-432492.png',
        'image/free-icon-gem-2320575.png',
        'image/free-icon-gem-3622910.png',
        'image/free-icon-gem-4251687.png'
    ];

    let score = 0;
    let timeLeft = 60;
    let timerId = null;
    let gameLoopId = null;

    function createGrid() {
        for (let i = 0; i < width * width; i++) {
            const square = document.createElement('div');
            square.setAttribute('id', i);
            grid.appendChild(square);
            squares.push(square);
        }
    }

    function generateValidBoard() {
        for (let i = 0; i < width * width; i++) {
            let randomImageIndex = Math.floor(Math.random() * jewelImagePaths.length);
            squares[i].style.backgroundImage = `url(${jewelImagePaths[randomImageIndex]})`;
        }
        while (hasInitialMatches()) {
            for (let i = 0; i < width * width; i++) {
                let randomImageIndex = Math.floor(Math.random() * jewelImagePaths.length);
                squares[i].style.backgroundImage = `url(${jewelImagePaths[randomImageIndex]})`;
            }
        }
    }

    function hasInitialMatches() {
        for (let i = 0; i < 62; i++) {
            const rowOfThree = [i, i + 1, i + 2];
            const decidedImage = squares[i].style.backgroundImage;
            if (i % width > width - 3) continue;
            if (rowOfThree.every(index => squares[index].style.backgroundImage === decidedImage && decidedImage)) return true;
        }
        for (let i = 0; i < 48; i++) {
            const columnOfThree = [i, i + width, i + width * 2];
            const decidedImage = squares[i].style.backgroundImage;
            if (columnOfThree.every(index => squares[index].style.backgroundImage === decidedImage && decidedImage)) return true;
        }
        return false;
    }

    function clearBoard() {
        squares.forEach(square => square.style.backgroundImage = '');
    }

    function addDragListeners() {
        squares.forEach(square => square.setAttribute('draggable', true));
        squares.forEach(square => square.addEventListener('dragstart', dragStart));
        squares.forEach(square => square.addEventListener('dragend', dragEnd));
        squares.forEach(square => square.addEventListener('dragover', dragOver));
        squares.forEach(square => square.addEventListener('dragenter', dragEnter));
        squares.forEach(square => square.addEventListener('dragleave', dragLeave));
        squares.forEach(square => square.addEventListener('drop', dragDrop));
    }

    function removeDragListeners() {
        squares.forEach(square => square.setAttribute('draggable', false));
    }

    function startGame() {
        startMessage.style.display = 'none';
        generateValidBoard();
        score = 0;
        scoreDisplay.innerHTML = score;
        timeLeft = 60;
        timerDisplay.innerHTML = timeLeft;
        startBtn.classList.add('hidden');
        restartBtn.classList.add('hidden');
        addDragListeners();
        timerId = setInterval(() => {
            timeLeft--;
            timerDisplay.innerHTML = timeLeft;
            if (timeLeft <= 0) endGame();
        }, 1000);
        gameLoopId = setInterval(() => {
            checkForMatches();
            moveDown();
        }, 100);
    }

    function endGame() {
        clearInterval(timerId);
        clearInterval(gameLoopId);
        removeDragListeners();
        restartBtn.classList.remove('hidden');
        alert("게임 종료! 최종 점수: " + score);
        clearBoard();
        startMessage.style.display = 'block';
    }

    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', startGame);

    let imageBeingDragged, imageBeingReplaced, squareIdBeingDragged, squareIdBeingReplaced;
    function dragStart() { imageBeingDragged = this.style.backgroundImage; squareIdBeingDragged = parseInt(this.id); }
    function dragOver(e) { e.preventDefault(); }
    function dragEnter(e) { e.preventDefault(); }
    function dragLeave() {}
    function dragDrop() { imageBeingReplaced = this.style.backgroundImage; squareIdBeingReplaced = parseInt(this.id); this.style.backgroundImage = imageBeingDragged; squares[squareIdBeingDragged].style.backgroundImage = imageBeingReplaced; }
    function dragEnd() {
        let validMoves = [squareIdBeingDragged - 1, squareIdBeingDragged - width, squareIdBeingDragged + 1, squareIdBeingDragged + width];
        let validMove = validMoves.includes(squareIdBeingReplaced);
        if (squareIdBeingReplaced && validMove) {
            const isMatch = checkForMatches();
            if (!isMatch && squareIdBeingDragged !== null) {
                squares[squareIdBeingReplaced].style.backgroundImage = imageBeingReplaced;
                squares[squareIdBeingDragged].style.backgroundImage = imageBeingDragged;
            }
            squareIdBeingReplaced = null;
        } else if (squareIdBeingReplaced && !validMove) {
            squares[squareIdBeingReplaced].style.backgroundImage = imageBeingReplaced;
            squares[squareIdBeingDragged].style.backgroundImage = imageBeingDragged;
        }
    }

    function moveDown() {
        for (let i = 0; i < 56; i++) {
            if (squares[i + width].style.backgroundImage === '') {
                squares[i + width].style.backgroundImage = squares[i].style.backgroundImage;
                squares[i].style.backgroundImage = '';
            }
        }
        for (let i = 0; i < width; i++) {
            if (squares[i].style.backgroundImage === '') {
                let randomImageIndex = Math.floor(Math.random() * jewelImagePaths.length);
                squares[i].style.backgroundImage = `url(${jewelImagePaths[randomImageIndex]})`;
            }
        }
    }

    function checkForMatches() {
        const hMatches = [];
        const vMatches = [];
        for (let i = 0; i < 64; i++) {
            const decidedImage = squares[i].style.backgroundImage;
            if (!decidedImage) continue;
            if (i % width <= width - 3) {
                if (squares[i+1].style.backgroundImage === decidedImage && squares[i+2].style.backgroundImage === decidedImage) {
                    const hMatch = [i, i+1, i+2];
                    if (i % width <= width - 4 && squares[i+3].style.backgroundImage === decidedImage) {
                        hMatch.push(i+3);
                        if (i % width <= width - 5 && squares[i+4].style.backgroundImage === decidedImage) hMatch.push(i+4);
                    }
                    hMatches.push(hMatch);
                }
            }
            if (i < width * (width - 2)) {
                if (squares[i+width].style.backgroundImage === decidedImage && squares[i+width*2].style.backgroundImage === decidedImage) {
                    const vMatch = [i, i+width, i+width*2];
                    if (i < width * (width - 3) && squares[i+width*3].style.backgroundImage === decidedImage) {
                        vMatch.push(i+width*3);
                        if (i < width * (width - 4) && squares[i+width*4].style.backgroundImage === decidedImage) vMatch.push(i+width*4);
                    }
                    vMatches.push(vMatch);
                }
            }
        }

        const squaresToClear = new Set();
        const processedMatches = new Set();

        hMatches.forEach(hMatch => {
            vMatches.forEach(vMatch => {
                if (processedMatches.has(hMatch) || processedMatches.has(vMatch)) return;
                const intersection = hMatch.filter(i => vMatch.includes(i));
                if (intersection.length > 0) {
                    const is_h_long = hMatch.length >= 4;
                    const is_v_long = vMatch.length >= 4;
                    if (is_h_long) {
                        const rowNum = Math.floor(intersection[0] / width);
                        for (let r = rowNum - 1; r <= rowNum + 1; r++) {
                            if (r >= 0 && r < width) for (let j = 0; j < width; j++) squaresToClear.add(r * width + j);
                        }
                    } else {
                        const rowNum = Math.floor(intersection[0] / width);
                        for (let j = 0; j < width; j++) squaresToClear.add(rowNum * width + j);
                    }
                    if (is_v_long) {
                        const colNum = intersection[0] % width;
                        for (let c = colNum - 1; c <= colNum + 1; c++) {
                            if (c >= 0 && c < width) for (let j = 0; j < width; j++) squaresToClear.add(j * width + c);
                        }
                    } else {
                        const colNum = intersection[0] % width;
                        for (let j = 0; j < width; j++) squaresToClear.add(j * width + colNum);
                    }
                    processedMatches.add(hMatch);
                    processedMatches.add(vMatch);
                }
            });
        });

        [...hMatches, ...vMatches].filter(m => m.length === 5 && !processedMatches.has(m)).forEach(match => {
            if (hMatches.includes(match)) {
                const rowNum = Math.floor(match[0] / width);
                for (let r = rowNum - 1; r <= rowNum + 1; r++) {
                    if (r >= 0 && r < width) for (let j = 0; j < width; j++) squaresToClear.add(r * width + j);
                }
            } else {
                const colNum = match[0] % width;
                for (let c = colNum - 1; c <= colNum + 1; c++) {
                    if (c >= 0 && c < width) for (let j = 0; j < width; j++) squaresToClear.add(j * width + c);
                }
            }
            processedMatches.add(match);
        });

        [...hMatches, ...vMatches].filter(m => m.length === 4 && !processedMatches.has(m)).forEach(match => {
            if (hMatches.includes(match)) {
                const rowNum = Math.floor(match[0] / width);
                for (let j = 0; j < width; j++) squaresToClear.add(rowNum * width + j);
            } else {
                const colNum = match[0] % width;
                for (let j = 0; j < width; j++) squaresToClear.add(j * width + colNum);
            }
            processedMatches.add(match);
        });

        [...hMatches, ...vMatches].filter(m => m.length === 3 && !processedMatches.has(m)).forEach(match => {
            match.forEach(index => squaresToClear.add(index));
        });

        if (squaresToClear.size > 0) {
            squaresToClear.forEach(index => {
                if (squares[index].style.backgroundImage !== '') {
                    score += 1;
                    squares[index].style.backgroundImage = '';
                }
            });
            scoreDisplay.innerHTML = score;
            return true;
        }
        return false;
    }

    createGrid();
});