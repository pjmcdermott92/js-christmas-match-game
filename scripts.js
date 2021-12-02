const timer = document.querySelector('[data-time-remaining]');
const flipCounter = document.querySelector('[data-flip-count]');
const gameContainer = document.querySelector('[data-game-container]');
const startText = document.querySelector('[data-start-overlay]');
const winText = document.querySelector('[data-win-overlay]');
const gameOverText = document.querySelector('[data-game-over-overlay]');
const overlays = Array.from(document.getElementsByClassName('overlay'));
const cardTemplate = document.querySelector('[data-card-template]');

let CARD_VALUES = [
    'ginger-man',
    'ornament',
    'present',
    'santa-hat',
    'sleigh',
    'snowman',
    'stocking',
    'wreathe'
];

let cards = [];

class AudioController {
    constructor() {
        this.bgMusic = new Audio('Assets/audio/jingle-bells.mp3');
        this.cardFlipSound = new Audio('Assets/audio/flip.wav');
        this.cardMatchSound = new Audio('Assets/audio/match.wav');
        this.victorySound = new Audio('Assets/audio/victory.wav');
        this.gameOverSound = new Audio('Assets/audio/gameover.wav');
        this.bgMusic.volume = 0.5;
        this.bgMusic.loop = true;
    }

    flip = () => this.cardFlipSound.play();
    match = () => this.cardMatchSound.play();
    win = () => this.victorySound.play();
    gameOver = () => this.gameOverSound.play();
    startMusic = () => this.bgMusic.play();
    stopMusic = () => {
        this.bgMusic.pause();
        this.bgMusic.currentTime = 0;
    }
}

class MatchGame {
    constructor(timeAllowed, cards) {
        this.sounds = new AudioController();
        this.timeAllowed = timeAllowed;
        this.cardsArray = cards;
        this.matchedCards = [];
        this.timeRemaining = timeAllowed;
        this.flipCount = 0;
        this.selectedCard = null;
        this.busy = true;
    }

    startGame() {
        this.resetGame();
        setTimeout(() => {
            this.sounds.startMusic();
            this.countdown = this.startTimer();
            this.busy = false;
            cards.forEach(card => card.addEventListener('click', () => this.flipCard(card)));
         }, 1000);
        overlays.forEach(overlay => overlay.classList.remove('show'));
    }
    
    resetGame() {
        this.matchedCards = [];
        this.timeRemaining = this.timeAllowed;
        this.flipCount = 0;
        this.selectedCard = null;
        this.busy = true;
        timer.innerText = this.timeRemaining;
        flipCounter.innerText = this.flipCount;
        cards.forEach(card => card.classList.remove('show', 'matched'));
        this.shuffleCards();
    }

    shuffleCards() {
        for (let i = this.cardsArray.length -1; i > 0; i--) {
            let randomIndex = Math.floor(Math.random() * (i + 1));
            this.cardsArray[randomIndex].style.order = i;
            this.cardsArray[i].style.order = randomIndex;
        }
    }

    startTimer() {
        return setInterval(() => {
            this.timeRemaining--;
            timer.innerText = this.timeRemaining;
            if (this.timeRemaining === 0) this.gameOver();
        }, 1000);
    }

    flipCard(card) {
        if (!this.canFlipCard(card)) return;
        this.sounds.flip();
        this.flipCount++;
        flipCounter.innerText = this.flipCount;
        card.classList.add('show');
        if (this.selectedCard) this.checkForMatch(card);
        else this.selectedCard = card;
    }

    canFlipCard(card) {
        return !this.busy && !this.matchedCards.includes(card) && card !== this.selectedCard;
    }

    checkForMatch(card) {
        if (this.getCardValue(card) === this.getCardValue(this.selectedCard)) {
            this.haveMatch(card, this.selectedCard);
        } else {
            this.haveMisMatch(card, this.selectedCard);
        }
        this.selectedCard = null;
    }

    haveMatch(card1, card2) {
        this.busy = true;
        this.matchedCards.push(card1);
        this.matchedCards.push(card2);
        card1.classList.add('matched');
        card2.classList.add('matched');
        this.sounds.match();
        if (this.matchedCards.length === this.cardsArray.length) return this.gameWon();
        this.busy = false;
    }

    haveMisMatch(card1, card2) {
        this.busy = true;
        setTimeout(() => {
            card1.classList.remove('show');
            card2.classList.remove('show');
            this.selectedCard = null;
            this.busy = false;
        }, 1000);
    }
    
    getCardValue(card) {
        return card.querySelector('[data-card-value]').src;
    }

    gameWon() {
        clearInterval(this.countdown);
        this.sounds.stopMusic();
        this.sounds.win();
        winText.classList.add('show');
        this.resetGame();
    }

    gameOver() {
        clearInterval(this.countdown);
        this.sounds.stopMusic();
        this.sounds.gameOver();
        gameOverText.classList.add('show');
        this.resetGame();
    }
}

function newCard(value) {
    const card = cardTemplate.content.cloneNode(true);
    const cardValue = card.querySelector('[data-card-value]');
    cardValue.src = `./assets/images/${value}.png`;
    return card;
}

function newDeck(values) {
    const fragment = document.createDocumentFragment();
    for (const value of values) {
        fragment.appendChild(newCard(value));
        fragment.appendChild(newCard(value));
    }
    gameContainer.appendChild(fragment);
    cards = Array.from(document.getElementsByClassName('card'));
}

function gameReady() {
    newDeck(CARD_VALUES);
    const match = new MatchGame(100, cards);
    
    overlays.forEach(overlay => overlay.addEventListener('click', () => {
        match.startGame();
    }));
}

gameReady();
