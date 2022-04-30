"use strict";

function gameOn() {

    let canvasBackground = document.createElement("canvas");
    let ctxBackground = canvasBackground.getContext("2d");

    canvasBackground.id = "background";
    canvasBackground.width = innerWidth;
    canvasBackground.height = innerHeight;
    canvasBackground.style.position = "absolute";
    document.body.appendChild(canvasBackground);

    let gameBackground = new Image();
    gameBackground.src = "images/background.png";
    let castleDefender = new Image();
    castleDefender.src = "images/castle_defender.png";

    // Глобальные переменные
    // размер ячейки
    // зазор между ячейкой
    // объект положения ячейки через клавиатуру
    // панель с очками
    let cellSize, cellGap, cellKey, controlsBar;

    function init() {
        cellSize = Math.floor(canvasBackground.width / 12);

        cellGap = cellSize * 0.03;

        cellKey = {
            x: 0,
            y: cellSize * 5,
            width: cellSize,
            height: cellSize,
            speed: cellSize,
            color: false
        };

        controlsBar = {
            width: cellSize * 9,
            height: cellSize
        };
    }

    init();

    let canvas = document.createElement("canvas");
    let ctx = canvas.getContext("2d");

    canvas.id = "game";
    canvas.width = cellSize * 9;
    canvas.height = cellSize * 6;
    canvas.style.top = "50%";
    canvas.style.left = "60%";
    canvas.style.transform = "translate(-50%, -50%)";
    canvas.style.position = "absolute";
    document.body.appendChild(canvas);

    let proportionality = cellSize;

    // массив игровой сетки
    let gameGrid = [];

    // объект положения мыши
    let mouse = {
        x: undefined,
        y: undefined,
        width: 0.1,
        height: 0.1,
        clicked: false
    };

    let touch = {
        x: undefined,
        y: undefined,
        width: 0.1,
        height: 0.1,
        clicked: false
    };

    // переменная показывающая фактическое расстояние от начала страницы до игровой области
    let canvasPosition = canvas.getBoundingClientRect();

    canvas.addEventListener("touchstart", (e) => {
        e = e || window.event;

        touch.x = e.touches[0].clientX - canvasPosition.left;
        touch.y = e.touches[0].clientY - canvasPosition.top;

        touch.clicked = true;
    });

    canvas.addEventListener("touchmove", (e) => {
        e = e || window.event;

        touch.x = e.touches[0].clientX - canvasPosition.left;
        touch.y = e.touches[0].clientY - canvasPosition.top;
    });

    canvas.addEventListener("touchend", () => {
        settingDefender();

        touch.x = undefined;
        touch.y = undefined;

        touch.clicked = false;
    });

    // событие нажатия мыши
    canvas.addEventListener("mousedown", () => {
        mouse.clicked = true;
    });

    // событие отпускания нажатия мыши
    canvas.addEventListener("mouseup", () => {
        mouse.clicked = false;
    });

    // событие перемещения мыши
    canvas.addEventListener("mousemove", (e) => {
        e = e || window.event;

        mouse.x = e.x - canvasPosition.left;
        mouse.y = e.y - canvasPosition.top;

        cellKey.x = mouse.x - (mouse.x % cellSize);
        cellKey.y = mouse.y - (mouse.y % cellSize);

        cellKey.color = false;

    });

    // событие покидания мыши игровой области
    canvas.addEventListener("mouseleave", () => {
        mouse.x = undefined;
        mouse.y = undefined;
    });

    window.addEventListener("keydown", moveCell);

    function moveCell(e) {
        e = e || window.event;

        mouse.x = undefined;
        mouse.y = undefined;

        cellKey.color = true;

        if((e.key.toLowerCase() === "w" || e.key === "ArrowUp" || e.key.toLowerCase() === "ц") && cellKey.y > cellSize) {
            cellKey.y -= cellKey.speed;
        }

        if((e.key.toLowerCase() === "s" || e.key === "ArrowDown" || e.key.toLowerCase() === "ы") && cellKey.y < canvas.height - cellSize) {
            cellKey.y += cellKey.speed;
        }

        if((e.key.toLowerCase() === "a" || e.key === "ArrowLeft" || e.key.toLowerCase() === "ф") && cellKey.x > 0) {
            cellKey.x -= cellKey.speed;
        }

        if((e.key.toLowerCase() === "d" || e.key === "ArrowRight" || e.key.toLowerCase() === "в") && cellKey.x < canvas.width - cellSize) {
            cellKey.x += cellKey.speed;
        }

        if(e.key === "Enter" || e.key === " ") {
            settingDefender();
        }

        if(e.key === "1") {
            chosenDefender = 1;
        }

        if(e.key === "2") {
            chosenDefender = 2;
        }

        if(e.key === "3") {
            chosenDefender = 3;
        }
    }

    function crateCell() {
        if(cellKey.color === true) {
            ctx.strokeStyle = "black";
            ctx.strokeRect(cellKey.x, cellKey.y, cellSize, cellSize);
        }
    }

    // массив защитников
    let defenders = [];

    // количество ресурсов
    let numberOfResources = 300;

    // массив врагов
    let enemies = [];

    // переменная генерации врагов
    let frame = 0;

    // интервалов между появлением врагов
    let enemiesInterval = 600;

    // окончание игры
    let gameOver = false;
    let win = false;

    // массив со снарядами
    let projectiles = [];

    // переменная хранения счёта
    let score = 0;

    // массив ресурсов
    let resources = [];

    // переменная с выигрышным счётом
    let winningScore = 50;

    // массив с плавоющими значениями
    let floatingMessages = [];

    // переменная с номером выбранного защитника
    let chosenDefender = 0;

    let positionProjectileX = [];
    let positionProjectileY = [];

    let positionDefendersX = [];
    let positionDefendersY = [];

    // массив позиций врагов
    let enemyPositions = [];

    let positionResourceX = [];
    let positionResourceY = [];


    // Ячейки
    class Cell {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.width = cellSize;
            this.height = cellSize;
        }

        setSize() {
            this.width = cellSize;
            this.height = cellSize;
        }

        draw() {
            if((mouse.x && mouse.y && collision(this, mouse)) || (touch.x && touch.y && collision(this, touch))) {
                ctx.strokeStyle = "black";
                ctx.strokeRect(this.x, this.y, this.width, this.height);
            }
        }
    };

    // функция заполнения массива ячеек
    function crateGrid() {

        gameGrid.length = 0;

        for(let y = cellSize; y < cellSize * 6; y += cellSize) {
            for(let x = 0; x < cellSize * 9; x += cellSize) {
                gameGrid.push(new Cell(x, y));
            }
        }
    }

    // функция обработки массива ячеек
    function handleGameGrid() {
        for(let i = 0; i < gameGrid.length; i++) {
            gameGrid[i].draw();
        }
    }

    crateGrid();


    // Снаряды
    // создаём снаряды
    let projectile1 = new Image();
    projectile1.src = "images/projectile_01.png";

    let projectile2 = new Image();
    projectile2.src = "images/projectile_02.png";

    let projectile3 = new Image();
    projectile3.src = "images/projectile_03.png";

    class Projectile {
        constructor(x, y, color) {
            this.x = x;
            this.y = y;
            this.width = cellSize * 0.1;
            this.height = cellSize * 0.1;
            this.power = 20;
            this.speed = cellSize * 0.05;
            this.colorProjectile = color;
        }

        updateProjectile(i) {
            this.y = positionProjectileY[i] * cellSize / proportionality;
            positionProjectileY[i] = this.y;

            this.width = cellSize * 0.1;
            this.height = cellSize * 0.1;
            this.speed = cellSize * 0.05;
        }

        update() {
            this.x += this.speed;
        }

        draw() {
            if(this.colorProjectile === 1) {
                ctx.scale(1, 1);
                ctx.drawImage(projectile1, this.x - cellSize * 0.15, this.y - cellSize * 0.15, this.width * 3, this.height * 3);
            } else if(this.colorProjectile === 2) {
                ctx.drawImage(projectile2, this.x - cellSize * 0.15, this.y - cellSize * 0.15, this.width * 3, this.height * 3);
            } else if(this.colorProjectile === 3) {
                ctx.drawImage(projectile3, this.x - cellSize * 0.15, this.y - cellSize * 0.15, this.width * 3, this.height * 3);
            } else {
                ctx.drawImage(projectile1, this.x - cellSize * 0.15, this.y - cellSize * 0.15, this.width * 3, this.height * 3);
            }
        }
    };

    // музыка при попадании снарядо во врага
    let kickProjectileSound = new Audio();
    kickProjectileSound.src = "audio/kick_projectile_sound.wav";

    // функция обработки массива снарядов
    function handleProjectiles() {
        for(let i = 0; i < projectiles.length; i++) {
            projectiles[i].update();
            projectiles[i].draw();

            // цикл перебора врагов в массиве
            for(let j = 0; j < enemies.length; j++) {
                if(enemies[j] && projectiles[i] && collision(projectiles[i], enemies[j])) {
                    enemies[j].healt -= projectiles[i].power;

                    kickProjectileSound.play();

                    projectiles.splice(i, 1);

                    positionProjectileX.splice(i, 1);
                    positionProjectileY.splice(i, 1);

                    i--;
                }
            }

            // удаление снаряда из массива при достижении конца игровой области
            if(projectiles[i] && projectiles[i].x > (cellSize * 9) - (cellSize / 2)) {
                projectiles.splice(i, 1);

                positionProjectileX.splice(i, 1);
                positionProjectileY.splice(i, 1);

                i--;
            }
        }
    };


    // Защитники
    // создаём первого защитника
    let defender1 = new Image();
    defender1.src = "images/defender_attack_and_wait_01.png";

    // создаём второго защитника
    let defender2 = new Image();
    defender2.src = "images/defender_attack_and_wait_02.png";

    // создаём третьего защитника
    let defender3 = new Image();
    defender3.src = "images/defender_attack_and_wait_03.png";

    class Defender {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.width = cellSize - cellGap * 2;
            this.height = cellSize - cellGap * 2;
            this.shooting = false;
            this.healt = 100;
            this.timer = 0;
            this.frameX = 23;
            this.frameY = 0;
            this.spriteWidth = 522;
            this.spriteHeight = 422;
            this.minFrame = [0, 12];
            this.maxFrame = [11, 23];
            this.chosenDefender = chosenDefender;
            this.colorDefender = 1;
        }

        updateResize(i) {

            this.x = positionDefendersX[i] * cellSize / proportionality;
            this.y = positionDefendersY[i] * cellSize / proportionality;

            positionDefendersX[i] = this.x;
            positionDefendersY[i] = this.y;

            this.width = cellSize - cellGap * 2;
            this.height = cellSize - cellGap * 2;
        }

        // функция стрельбы
        update() {

            if(this.shooting) {
                this.timer++;
                if(this.timer % 34 === 0) {
                    projectiles.push(new Projectile(this.x + cellSize, this.y + cellSize / 2, this.colorDefender));
                    positionProjectileX.push(this.x + cellSize);
                    positionProjectileY.push(this.y + cellSize / 2);
                }
            } else {
                this.timer = 0;
            }

            if(this.timer === 0) {
                if(frame % 3 === 0) {
                    if(this.frameX < this.maxFrame[1]) {
                        this.frameX++;
                    } else {
                        this.frameX = this.minFrame[1];
                    }
                }
            } else {
                if(frame % 3 === 0) {
                    if(this.frameX < this.maxFrame[0]) {
                        this.frameX++;
                    } else {
                        this.frameX = this.minFrame[0];
                    }
                }
            }
        }

        draw() {
            // условие выбора защитника при выбранной карте
            if(this.chosenDefender === 1) {
                ctx.drawImage(defender1, this.frameX * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x + cellSize * 0.3, this.y, this.width, this.height);
                this.colorDefender = 1;
            } else if(this.chosenDefender === 2) {
                ctx.drawImage(defender2, this.frameX * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x + cellSize * 0.3, this.y, this.width, this.height);
                this.colorDefender = 2;
            } else if(this.chosenDefender === 3) {
                ctx.drawImage(defender3, this.frameX * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x + cellSize * 0.3, this.y, this.width, this.height);
                this.colorDefender = 3;
            } else {
                ctx.drawImage(defender1, this.frameX * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x + cellSize * 0.3, this.y, this.width, this.height);
                this.colorDefender = 1;
            }
        }
    };

    // функция обработки массива с защитниками
    function handleDefenders() {
        for(let i = 0; i < defenders.length; i++) {
            defenders[i].draw();
            defenders[i].update();

            // условие стрельбы по врагам при нахождении защитника и врага на одной линии
            if(enemyPositions.indexOf(defenders[i].y) !== -1 || enemyPositions.indexOf(Math.floor(defenders[i].y * 1000) / 1000) !== -1 || enemyPositions.indexOf(Math.ceil(defenders[i].y * 1000) / 1000) !== -1 || enemyPositions.indexOf(Math.round(defenders[i].y * 1000) / 1000) !== -1) {
                defenders[i].shooting = true;
            } else {
                defenders[i].shooting = false;
            }

            // столкновение между защитником и врагом
            for(let j = 0; j < enemies.length; j++) {

                // остановка противника и уменьшение жизней защитника
                if(defenders[i] && collision(defenders[i], enemies[j])) {
                    enemies[j].movement = 0;
                    defenders[i].healt -= 0.2;
                }

                // удаление защитника из массива с защитниками и возобновление движения врага если защитник существует на экране
                if(defenders[i] && defenders[i].healt <= 0) {
                    defenders.splice(i, 1);
                    positionDefendersX.splice(i, 1);
                    positionDefendersY.splice(i, 1);
                    i--;

                    enemies[j].movement = enemies[j].speed;
                }
            }
        }
    }

    // функция выбора защитников
    function chooseDefender() {
        // карты с защитниками
        let card1 = {
            x: cellSize * 0.1,
            y: cellSize * 0.1,
            width: cellSize * 0.7,
            height: cellSize * 0.85
        };

        let card2 = {
            x: cellSize * 0.9,
            y: cellSize * 0.1,
            width: cellSize * 0.7,
            height: cellSize * 0.85
        };

        let card3 = {
            x: cellSize * 1.7,
            y: cellSize * 0.1,
            width: cellSize * 0.7,
            height: cellSize * 0.85
        };

        let card1stroke = "black";
        let card2stroke = "black";
        let card3stroke = "black";

        // условие наведения на выбранную карту
        if((collision(mouse, card1) && mouse.clicked) || (collision(touch, card1) && touch.clicked)) {
            chosenDefender = 1;
        } else if((collision(mouse, card2) && mouse.clicked) || (collision(touch, card2) && touch.clicked)) {
            chosenDefender = 2;
        } else if((collision(mouse, card3) && mouse.clicked) || (collision(touch, card3) && touch.clicked)) {
            chosenDefender = 3;
        }

        // условие выбора цвета обводки при наведении на нужную карту
        if(chosenDefender === 1) {
            card1stroke = "gold";
            card2stroke = "black";
            card3stroke = "black";
        } else if(chosenDefender === 2) {
            card1stroke = "black";
            card2stroke = "gold";
            card3stroke = "black";
        } else if(chosenDefender === 3) {
            card1stroke = "black";
            card2stroke = "black";
            card3stroke = "gold";
        } else {
            card1stroke = "black";
            card2stroke = "black";
            card3stroke = "black";
        }

        ctx.lineWidth = 1;
        ctx.fillStyle = "rgba(0, 0, 0, 0.2)";

        ctx.fillRect(card1.x, card1.y, card1.width, card1.height);
        ctx.strokeStyle = card1stroke;
        ctx.strokeRect(card1.x, card1.y, card1.width, card1.height);
        ctx.drawImage(defender1, 21, 0, 522, 422, -cellSize * 0.1, cellSize * 0.05, cellSize * 1.3, cellSize * 1.1);

        ctx.fillRect(card2.x, card2.y, card2.width, card2.height);
        ctx.strokeStyle = card2stroke;
        ctx.strokeRect(card2.x, card2.y, card2.width, card2.height);
        ctx.drawImage(defender2, 21, 0, 522, 422, cellSize * 0.7, cellSize * 0.05, cellSize * 1.3, cellSize * 1.1);

        ctx.fillRect(card3.x, card3.y, card3.width, card3.height);
        ctx.strokeStyle = card3stroke;
        ctx.strokeRect(card3.x, card3.y, card3.width, card3.height);
        ctx.drawImage(defender3, 21, 0, 522, 422, cellSize * 1.5, cellSize * 0.05, cellSize * 1.3, cellSize * 1.1);
    }


    // Плавающие значения
    class FloatingMessage {
        constructor(value, x, y, size, color) {
            this.value = value;
            this.x = x;
            this.y = y;
            this.size = size;
            this.lifeSpan = 0;
            this.color = color;
            this.opacity = 1;
        }

        update() {
            this.y -= 0.3;
            this.lifeSpan += 1;
            if(this.opacity > 0.03) {
                this.opacity -= 0.03;
            }
        }

        draw() {
            ctx.globalAlpha = this.opacity;
            ctx.fillStyle = this.color;
            ctx.font = this.size + "px Arial";
            ctx.fillText(this.value, this.x, this.y);
            ctx.globalAlpha = 1;
        }
    };

    // функция обработки плавающих значений
    function handleFloatingMessages() {
        for(let i = 0; i < floatingMessages.length; i++) {
            floatingMessages[i].update();
            floatingMessages[i].draw();
            if(floatingMessages[i].lifeSpan >= 50) {
                floatingMessages.splice(i, 1);
                i--;
            }
        }
    }


    // Враги
    // массив типов врагов
    let enemyTypes = [];

    // создаём первого врага
    let enemy1 = new Image();
    enemy1.src = "images/enemy_walk_and_attack_01.png";
    enemyTypes.push(enemy1);

    // создаём второго врага
    let enemy2 = new Image();
    enemy2.src = "images/enemy_walk_and_attack_02.png";
    enemyTypes.push(enemy2);

    // создаём третьего врага
    let enemy3 = new Image();
    enemy3.src = "images/enemy_walk_and_attack_03.png";
    enemyTypes.push(enemy3);

    class Enemy {
        constructor(verticalPosition) {
            this.x = cellSize * 9;
            this.y = verticalPosition;
            this.width = cellSize - cellGap * 2;
            this.height = cellSize - cellGap * 2;
            this.speed = (Math.random() * cellSize * 0.002) + (cellSize * 0.004);
            this.movement = this.speed;
            this.healt = 200;
            this.maxHealth = this.healt;
            this.enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
            this.frameX = 29;
            this.frameY = 0;
            this.minFrame = [0, 12];
            this.maxFrame = [11, 29];
            this.spriteWidth = 522;
            this.spriteHeight = 422;
            this.sound = new Audio();
            this.sound.src = 'audio/kick_enemy_sound.mp3';
        }

        updateEnemy(i) {
            this.y = enemyPositions[i] * cellSize / proportionality;
            enemyPositions[i] = this.y;

            this.width = cellSize - cellGap * 2;
            this.height = cellSize - cellGap * 2;
            this.speed = (Math.random() * cellSize * 0.002) + (cellSize * 0.004);
            this.movement = this.speed;
        }

        update() {
            this.x -= this.movement;

            if(this.movement === 0) {
                if(frame % 3 === 0) {
                    if(this.frameX > this.minFrame[0]) {
                        this.frameX--;

                        if(this.frameX === 1) {
                            this.sound.play();
                        }

                    } else {
                        this.frameX = this.maxFrame[0];
                    }
                }
            } else {
                if(frame % 3 === 0) {
                    if(this.frameX > this.minFrame[1]) {
                        this.frameX--;
                    } else {
                        this.frameX = this.maxFrame[1];
                    }
                }
            }
        }

        draw() {
            ctx.drawImage(this.enemyType, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight, this.x - cellSize * 0.2, this.y, this.width, this.height);
        }
    };

    // функция обработки массива с врагами
    function handleEnemies() {
        for(let i = 0; i < enemies.length; i++) {
            enemies[i].update();
            enemies[i].draw();

            // при перемещении врага в начало экрана игра заканчивается
            if(enemies[i].x < 0) {
                gameOver = true;
            }

            // условие удаления врага из массива при 0 здоровьи и добавление ресурсов
            if(enemies[i].healt <= 0) {
                let gainedResources = (enemies[i].maxHealth / 10);

                // пересчитать
                floatingMessages.push(new FloatingMessage("+" + gainedResources, enemies[i].x, enemies[i].y, 30, "black"));
                floatingMessages.push(new FloatingMessage("+" + gainedResources, 370, 40, 30, "red"));

                numberOfResources += gainedResources;
                score += gainedResources;
                const findThisIndex = enemyPositions.indexOf(enemies[i].y);
                enemyPositions.splice(findThisIndex, 1);
                enemies.splice(i, 1);
                i--;
            }
        }

        // генерация врага на экране
        if(frame % enemiesInterval === 0 && score < winningScore) {
            let verticalPosition = Math.floor(Math.random() * 5 + 1) * cellSize + cellGap;
            enemies.push(new Enemy(verticalPosition));
            enemyPositions.push(verticalPosition);

            // уменьшение интервала между появлением врагов
            if(enemiesInterval > 120) {
                enemiesInterval -= 50;
            }
        }
    }


    // Ресурсы
    // создаём ресурс
    let resource = new Image();
    resource.src = "images/resource.png";

    let amounts = [20, 30, 40];

    class Resource {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.width = cellSize * 0.3;
            this.height = cellSize * 0.3;
            this.amount = amounts[Math.floor(Math.random() * amounts.length)];
        }

        updateResource(i) {

            this.x = positionResourceX[i] * cellSize / proportionality;
            this.y = positionResourceY[i] * cellSize / proportionality;

            positionResourceX[i] = this.x;
            positionResourceY[i] = this.y;

            this.width = cellSize * 0.3;
            this.height = cellSize * 0.3;
        }

        draw() {
            ctx.drawImage(resource, this.x, this.y, this.width, this.height);
        }
    };

    // функция обработки массива ресурсов
    function handleResources() {
        // занесение ресурсов в массив
        if(frame % 500 === 0 && score < winningScore) {
            let resourcePositionX = Math.random() * (cellSize * 8);
            let resourcePositionY = (Math.floor(Math.random() * 5) + 1) * cellSize + 25;

            resources.push(new Resource(resourcePositionX, resourcePositionY));

            positionResourceX.push(resourcePositionX);
            positionResourceY.push(resourcePositionY);
        }

        for(let i = 0; i < resources.length; i++) {
            resources[i].draw();
        }
    }


    // Утилиты
    // функция панелей
    function handleGameStatus() {
        ctx.fillStyle = "black";
        ctx.font = (cellSize * 0.3) + "px Arial";
        ctx.fillText("Score: " + score, cellSize * 2.5, cellSize * 0.4);
        ctx.fillText("Resources: " + numberOfResources, cellSize * 2.5, cellSize * 0.8);

        // условие проигрыша
        if(gameOver) {
            gameStop();
        }

        // пересчитать
        // условие выигрыша
        if(score >= winningScore && enemies.length === 0) {
            win = true;
            gameStop();
        }
    }

    // музыка сбора ресурсов
    let resourceSound = new Audio();
    resourceSound.src = "audio/resource_sound.mp3";

    // музыка установки защитника
    let settingDefenderSound = new Audio();
    settingDefenderSound.src = "audio/setting_defender_sound.mp3";

    // Событие размещения защитника на экране

    canvas.addEventListener("click", settingDefender);

    function settingDefender() {

        
        for(let i = 0; i < resources.length; i++) {

            if((resources[i] && mouse.x && mouse.y && collision(resources[i], mouse)) || (resources[i] && collision(cellKey, resources[i])) || (resources[i] && touch.x && touch.y && collision(touch, resources[i]))) {
                numberOfResources += resources[i].amount;

                // пересчитать
                floatingMessages.push(new FloatingMessage("+" + resources[i].amount, resources[i].x, resources[i].y, cellSize * 0.3, "black"));
                floatingMessages.push(new FloatingMessage("+" + resources[i].amount, 440, 80, 30, "gold"));

                resources.splice(i, 1);
                positionResourceX.splice(i, 1);
                positionResourceY.splice(i, 1);
                i--;

                resourceSound.play();

                return;
            }
        }

        let gridPositionX = (mouse.x - (mouse.x % cellSize) + cellGap) || (touch.x - (touch.x % cellSize) + cellGap) || (cellKey.x + cellGap);
        let gridPositionY = (mouse.y - (mouse.y % cellSize) + cellGap) || (touch.y - (touch.y % cellSize) + cellGap) || (cellKey.y + cellGap);

        // запрет размещения на панели с очками
        if(gridPositionY < cellSize) {
            return;
        }

        // запрет размещения защитника в одном и том же квадрате
        for(let i = 0; i < defenders.length; i++) {
            // запрет размещения защитника на защитнике
            if(defenders[i].x === gridPositionX && defenders[i].y === gridPositionY) {
                return;
            }
        }

        // стоимость защитника
        let defenderCost = 100;

        // занесение защитников в массив и списание ресурсов
        if(numberOfResources >= defenderCost) {
            defenders.push(new Defender(gridPositionX, gridPositionY));
            positionDefendersX.push(gridPositionX);
            positionDefendersY.push(gridPositionY);

            settingDefenderSound.play();

            numberOfResources -= defenderCost;
        } else {
            floatingMessages.push(new FloatingMessage("Need more", mouse.x, mouse.y - cellSize * 0.25, cellSize * 0.2, "red"));
            floatingMessages.push(new FloatingMessage("resources", mouse.x, mouse.y, cellSize * 0.2, "red"));
        }
    }


    function gameStop() {
        let scores = new String();

        scores += localStorage['ajname'] + (String('....................').substr(localStorage['ajname'].length)) + (String('00000000' + score).slice(-8));
        
        document.body.removeChild(canvas);
        document.body.removeChild(canvasBackground);
        
        let scoreTable = document.createElement("div");
        scoreTable.id = "scoreTable";
        document.body.appendChild(scoreTable);
        
        let scoreRow = document.createElement("div");
        scoreRow.id = "scoreRow";
        scoreTable.appendChild(scoreRow);
        
        let scoreCell = document.createElement("div");
        scoreCell.id = "scoreCell";
        scoreCell.innerHTML = "SCORE<br>";
        scoreCell.innerHTML += scores;
        scoreRow.appendChild(scoreCell);
        
        let scoreButton = document.createElement("button");
        scoreButton.id = "scoreButton";
        scoreButton.innerHTML = "PLAY AGAIN";
        scoreButton.addEventListener("touchstart", () => {
            window.location.reload();
        });
        scoreButton.onclick = function () {
            window.location.reload();
        };
        scoreTable.appendChild(scoreButton);
    }

    let requestAnimationFrame = (function(){ 
        return  window.requestAnimationFrame       || 
                window.webkitRequestAnimationFrame || 
                window.mozRequestAnimationFrame    || 
                window.oRequestAnimationFrame      || 
                window.msRequestAnimationFrame     || 
                function( callback ){ 
                window.setTimeout(callback, 1000 / 60); 
                };
    })();

    // функция анимации
    function animate() {
        // условие окончания игры
        if(!gameOver || !win) {
            // рекурсия анимации
            requestAnimationFrame(animate);
        }

        // очистка холста
        ctx.clearRect(0, 0, cellSize * 9, cellSize * 6);

        ctxBackground.drawImage(gameBackground, 0, 0, canvasBackground.width, canvasBackground.height);

        ctxBackground.drawImage(castleDefender, 0, canvasBackground.height / 10, canvasBackground.width * 0.22, canvasBackground.height / 1.2);

        ctx.strokeStyle = "green";
        ctx.strokeRect(0, 0, cellSize * 9, cellSize * 6);
        ctx.strokeRect(0, 0, controlsBar.width, controlsBar.height);

        // рисуем ячейку при нажатии клавиши
        crateCell();

        // рисуем сетку
        handleGameGrid();

        // рисуем защитников
        handleDefenders();

        // рисуем ресурсы
        handleResources();

        // рисуем снаряды
        handleProjectiles()

        // рисуем врагов
        handleEnemies();

        // рисуем функцию панелей
        handleGameStatus();

        // рисуем карты с защитниками
        chooseDefender();

        // рисуем сообщения на экране
        handleFloatingMessages()

        frame++;
    }

    // вызываем функцию анимации
    animate();

    // функция столкновений
    function collision(first, second) {
        if(!(first.x > second.x + second.width || first.x + first.width < second.x ||
            first.y > second.y + second.height || first.y + first.height < second.y)) {
                return true;
            }
    }

    // событие изменения ширины экрана
    window.addEventListener("resize", function() {
        canvasBackground.width = innerWidth;
        canvasBackground.height = innerHeight;

        init();

        canvas.width = cellSize * 9;
        canvas.height = cellSize * 6;

        // переменная показывающая фактическое расстояние от начала страницы до игровой области
        canvasPosition = canvas.getBoundingClientRect();

        crateGrid();

        for(let i = 0; i < defenders.length; i++) {
            defenders[i].updateResize(i);
        }

        for(let i = 0; i < enemies.length; i++) {
            enemies[i].updateEnemy(i);
        }

        for(let i = 0; i < resources.length; i++) {
            resources[i].updateResource(i);
        }

        for(let i = 0; i < projectiles.length; i++) {
            projectiles[i].updateProjectile(i);
        }

        proportionality = cellSize;

    });
}