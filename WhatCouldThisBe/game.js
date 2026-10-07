const config = {
    type: Phaser.AUTO,

    scale: {
        mode: Phaser.Scale.RESIZE,
        width: window.innerWidth,
        height: window.innerHeight
    },

    backgroundColor: "#202030",

    scene: {
        preload: preload,
        create: create
    }
};

const game = new Phaser.Game(config);


// =========================================================
// GAME VARIABLES
// =========================================================

let score = 0;
let currentQuestion = 0;
let answered = false;

const questionsPerGame = 10;

let selectedQuestions = [];

let titleText;
let questionText;
let imageText;
let scoreText;
let feedbackText;
let questionNumberText;

let answerButtons = [];

let confettiEmitter = null;


// =========================================================
// PRELOAD
// =========================================================

function preload()
{
    this.load.audio(
        "correct",
        audioFiles.correct
    );

    this.load.audio(
        "wrong",
        audioFiles.wrong
    );

    this.load.audio(
        "gameover",
        audioFiles.gameover
    );
}


// =========================================================
// CREATE
// =========================================================

function create()
{
    // Generate unique questions
    selectedQuestions =
        generateQuestions(questionsPerGame);


    // -----------------------------------------------------
    // TITLE
    // -----------------------------------------------------

    titleText = this.add.text(
        0,
        0,
        "What could this be?",
        {
            fontSize: "36px",
            color: "#ffffff",
            fontStyle: "bold"
        }
    ).setOrigin(0.5);


    // -----------------------------------------------------
    // SCORE
    // -----------------------------------------------------

    scoreText = this.add.text(
        0,
        0,
        "Score: 0",
        {
            fontSize: "22px",
            color: "#ffffff"
        }
    ).setOrigin(0.5);


    // -----------------------------------------------------
    // QUESTION NUMBER
    // -----------------------------------------------------

    questionNumberText = this.add.text(
        0,
        0,
        "",
        {
            fontSize: "20px",
            color: "#aaaaaa"
        }
    ).setOrigin(0.5);


    // -----------------------------------------------------
    // QUESTION
    // -----------------------------------------------------

    questionText = this.add.text(
        0,
        0,
        "",
        {
            fontSize: "28px",
            color: "#ffffff"
        }
    ).setOrigin(0.5);


    // -----------------------------------------------------
    // EMOJI
    // -----------------------------------------------------

    imageText = this.add.text(
        0,
        0,
        "",
        {
            fontSize: "100px",

            padding: {
                top: 20,
                bottom: 20,
                left: 20,
                right: 20
            }
        }
    ).setOrigin(0.5);


    // -----------------------------------------------------
    // FEEDBACK
    // -----------------------------------------------------

    feedbackText = this.add.text(
        0,
        0,
        "",
        {
            fontSize: "24px",
            fontStyle: "bold"
        }
    ).setOrigin(0.5);


    // -----------------------------------------------------
    // ANSWER BUTTONS
    // -----------------------------------------------------

    for (let i = 0; i < 3; i++)
    {
        createAnswerButton(this);
    }


    // -----------------------------------------------------
    // INITIAL LAYOUT
    // -----------------------------------------------------

    updateLayout(this);

    showQuestion();


    // -----------------------------------------------------
    // RESIZE
    // -----------------------------------------------------

    this.scale.on("resize", () =>
    {
        updateLayout(this);
    });
}


// =========================================================
// GENERATE QUESTIONS
// =========================================================

function generateQuestions(amount)
{
    const generatedQuestions = [];

    const categories = Object.keys(vocabulary);

    // Keep track of vocabulary words already used
    const usedWords = new Set();


    while (generatedQuestions.length < amount)
    {
        // Pick a random category
        const category =
            Phaser.Utils.Array.GetRandom(categories);


        const categoryWords =
            vocabulary[category];


        // Find words that haven't been used yet
        const availableWords =
            categoryWords.filter(word =>
                !usedWords.has(word.word)
            );


        // If this category has no unused words,
        // choose another category.
        if (availableWords.length === 0)
        {
            continue;
        }


        // Pick a unique correct answer
        const correctWord =
            Phaser.Utils.Array.GetRandom(
                availableWords
            );


        // Mark this word as used
        usedWords.add(correctWord.word);


        // -------------------------------------------------
        // WRONG ANSWERS
        // -------------------------------------------------

        const availableWrongAnswers =
            categoryWords.filter(word =>
                word.word !== correctWord.word
            );


        const shuffledWrongAnswers =
            Phaser.Utils.Array.Shuffle(
                [...availableWrongAnswers]
            );


        const wrongAnswers =
            shuffledWrongAnswers.slice(0, 2);


        // -------------------------------------------------
        // ANSWERS
        // -------------------------------------------------

        const answers = [
            correctWord.word,
            wrongAnswers[0].word,
            wrongAnswers[1].word
        ];


        // Randomize answer positions
        Phaser.Utils.Array.Shuffle(answers);


        // -------------------------------------------------
        // CREATE QUESTION
        // -----------------------------------------------------

        generatedQuestions.push({
            category: category,

            question:
                "What " +
                getCategoryName(category) +
                " is this?",

            image: correctWord.emoji,

            answers: answers,

            correct: correctWord.word
        });
    }


    return generatedQuestions;
}


// =========================================================
// CATEGORY NAME
// =========================================================

function getCategoryName(category)
{
    if (category === "animals")
    {
        return "animal";
    }


    if (category === "fruits")
    {
        return "fruit";
    }


    if (category === "objects")
    {
        return "object";
    }


    return category;
}


// =========================================================
// CREATE ANSWER BUTTON
// =========================================================

function createAnswerButton(scene)
{
    const button = scene.add.rectangle(
        0,
        0,
        300,
        55,
        0x3a3a50
    );


    button.setInteractive({
        useHandCursor: true
    });


    const text = scene.add.text(
        0,
        0,
        "",
        {
            fontSize: "21px",
            color: "#ffffff"
        }
    ).setOrigin(0.5);


    answerButtons.push({
        button: button,
        text: text
    });


    // -----------------------------------------------------
    // HOVER
    // -----------------------------------------------------

    button.on("pointerover", () =>
    {
        if (!answered)
        {
            button.setFillStyle(
                0x505070
            );
        }
    });


    button.on("pointerout", () =>
    {
        if (!answered)
        {
            button.setFillStyle(
                0x3a3a50
            );
        }
    });


    // -----------------------------------------------------
    // CLICK
    // -----------------------------------------------------

    button.on("pointerdown", () =>
    {
        if (answered)
        {
            return;
        }


        answered = true;


        const selectedAnswer =
            text.text;


        checkAnswer(
            scene,
            button,
            selectedAnswer
        );
    });
}


// =========================================================
// UPDATE LAYOUT
// =========================================================

function updateLayout(scene)
{
    if (!titleText)
    {
        return;
    }


    const width = scene.scale.width;
    const height = scene.scale.height;


    // -----------------------------------------------------
    // TITLE
    // -----------------------------------------------------

    titleText.setPosition(
        width / 2,
        height * 0.10
    );


    // -----------------------------------------------------
    // SCORE
    // -----------------------------------------------------

    scoreText.setPosition(
        width - 100,
        40
    );


    // -----------------------------------------------------
    // QUESTION NUMBER
    // -----------------------------------------------------

    questionNumberText.setPosition(
        100,
        40
    );


    // -----------------------------------------------------
    // QUESTION
    // -----------------------------------------------------

    questionText.setPosition(
        width / 2,
        height * 0.24
    );


    // -----------------------------------------------------
    // EMOJI
    // -----------------------------------------------------

    imageText.setPosition(
        width / 2,
        height * 0.42
    );


    // -----------------------------------------------------
    // FEEDBACK
    // -----------------------------------------------------

    feedbackText.setPosition(
        width / 2,
        height * 0.54
    );


    // -----------------------------------------------------
    // ANSWER BUTTONS
    // -----------------------------------------------------

    const buttonWidth =
        Math.min(400, width * 0.60);


    const buttonHeight = 55;

    const spacing = 70;

    const startY = height * 0.67;


    for (
        let i = 0;
        i < answerButtons.length;
        i++
    )
    {
        const answerButton =
            answerButtons[i];


        const y =
            startY + (i * spacing);


        answerButton.button.setPosition(
            width / 2,
            y
        );


        answerButton.button.setSize(
            buttonWidth,
            buttonHeight
        );


        answerButton.text.setPosition(
            width / 2,
            y
        );
    }
}


// =========================================================
// SHOW QUESTION
// =========================================================

function showQuestion()
{
    const question =
        selectedQuestions[currentQuestion];


    answered = false;


    // -----------------------------------------------------
    // QUESTION TEXT
    // -----------------------------------------------------

    questionText.setText(
        question.question
    );


    // -----------------------------------------------------
    // EMOJI
    // -----------------------------------------------------

    imageText.setText(
        question.image
    );


    // -----------------------------------------------------
    // QUESTION NUMBER
    // -----------------------------------------------------

    questionNumberText.setText(
        "Question " +
        (currentQuestion + 1) +
        " / " +
        selectedQuestions.length
    );


    // -----------------------------------------------------
    // CLEAR FEEDBACK
    // -----------------------------------------------------

    feedbackText.setText("");


    // -----------------------------------------------------
    // ANSWERS
    // -----------------------------------------------------

    for (
        let i = 0;
        i < answerButtons.length;
        i++
    )
    {
        const answerButton =
            answerButtons[i];


        answerButton.text.setText(
            question.answers[i]
        );


        answerButton.button.setFillStyle(
            0x3a3a50
        );


        answerButton.button.setVisible(true);

        answerButton.text.setVisible(true);
    }
}


// =========================================================
// CHECK ANSWER
// =========================================================

function checkAnswer(
    scene,
    button,
    selectedAnswer
)
{
    const question =
        selectedQuestions[currentQuestion];


    // -----------------------------------------------------
    // CORRECT
    // -----------------------------------------------------

    if (
        selectedAnswer ===
        question.correct
    )
    {
        score++;


        scoreText.setText(
            "Score: " + score
        );


        // Normal correct green
        button.setFillStyle(
            0x287a45
        );


        feedbackText.setText(
            "Correct!"
        );


        feedbackText.setColor(
            "#55dd77"
        );


        // Play correct sound
        scene.sound.play(
            "correct"
        );
    }


    // -----------------------------------------------------
    // WRONG
    // -----------------------------------------------------

    else
    {
        // Selected wrong answer becomes red
        button.setFillStyle(
            0x8a3030
        );


        feedbackText.setText(
            "Wrong!"
        );


        feedbackText.setColor(
            "#ff6666"
        );


        // Play wrong sound
        scene.sound.play(
            "wrong"
        );


        // -------------------------------------------------
        // HIGHLIGHT CORRECT ANSWER
        // -------------------------------------------------

        for (
            let i = 0;
            i < answerButtons.length;
            i++
        )
        {
            const answerButton =
                answerButtons[i];


            if (
                answerButton.text.text ===
                question.correct
            )
            {
                // Slightly yellower green
                answerButton.button.setFillStyle(
                    0x7f8f35
                );

                break;
            }
        }
    }


    // -----------------------------------------------------
    // NEXT QUESTION
    // -----------------------------------------------------

    scene.time.delayedCall(
        1000,
        () =>
        {
            currentQuestion++;


            if (
                currentQuestion >=
                selectedQuestions.length
            )
            {
                showGameOver(scene);
            }
            else
            {
                showQuestion();
            }
        }
    );
}


// =========================================================
// CREATE CONFETTI TEXTURE
// =========================================================

function createConfettiTexture(scene)
{
    // Don't recreate the texture if it already exists
    if (scene.textures.exists("confetti"))
    {
        return;
    }


    const graphics =
        scene.add.graphics();


    // Create a small rectangular piece
    graphics.fillStyle(
        0xffffff,
        1
    );


    graphics.fillRect(
        0,
        0,
        10,
        20
    );


    graphics.generateTexture(
        "confetti",
        10,
        20
    );


    graphics.destroy();
}


// =========================================================
// START CONFETTI
// =========================================================

function startConfetti(scene)
{
    createConfettiTexture(scene);


    // -----------------------------------------------------
    // CREATE EMITTER
    // -----------------------------------------------------

    confettiEmitter =
        scene.add.particles(
            0,
            -30,
            "confetti",
            {
                // Start pieces across the entire screen
                x: {
                    min: 0,
                    max: scene.scale.width
                },

                y: -30,


                // Number of pieces created at a time
                quantity: 4,


                // Create more pieces every 60ms
                frequency: 60,


                // How long each piece lives
                lifespan: 4500,


                // Horizontal movement
                speedX: {
                    min: -120,
                    max: 120
                },


                // Initial downward speed
                speedY: {
                    min: 80,
                    max: 180
                },


                // Gravity makes them fall naturally
                gravityY: 250,


                // Random rotation
                rotate: {
                    min: -180,
                    max: 180
                },


                // Slight size variation
                scale: {
                    start: 1,
                    end: 0.8
                },


                // Random confetti colors
                tint: [
                    0xff4d4d,
                    0xffd84d,
                    0x4ddfff,
                    0x65e06f,
                    0xc76cff,
                    0xff78c8
                ],


                // Don't create an infinite amount
                maxParticles: 100
            }
        );


    // -----------------------------------------------------
    // STOP EMITTING AFTER A FEW SECONDS
    // -----------------------------------------------------

    scene.time.delayedCall(
        2500,
        () =>
        {
            if (confettiEmitter)
            {
                confettiEmitter.stop();
            }
        }
    );
}


// =========================================================
// GAME OVER
// =========================================================

function showGameOver(scene)
{
    // -----------------------------------------------------
    // PLAY GAME OVER SOUND
    // -----------------------------------------------------

    scene.sound.play(
        "gameover"
    );


    // -----------------------------------------------------
    // GAME OVER TEXT
    // -----------------------------------------------------

    questionText.setText(
        "Game Complete!"
    );


    imageText.setText(
        "🎉"
    );


    questionNumberText.setText("");


    feedbackText.setText(
        "Final Score: " +
        score +
        " / " +
        selectedQuestions.length
    );


    feedbackText.setColor(
        "#ffffff"
    );


    // -----------------------------------------------------
    // HIDE ANSWER BUTTONS
    // -----------------------------------------------------

    for (
        let answerButton of answerButtons
    )
    {
        answerButton.button.setVisible(false);

        answerButton.text.setVisible(false);
    }


    // -----------------------------------------------------
    // START CONFETTI
    // -----------------------------------------------------

    startConfetti(scene);
}