const MIN_CHARS = 0;
let promptSpan, charSpan;
getStylesheet();

document.addEventListener("DOMContentLoaded", function () {

    promptSpan = document.getElementById("prompt");
    promptSpan.addEventListener("input", countCharacters);

    charSpan = document.getElementById("charCount");
    charSpan.innerText = MIN_CHARS.toString();

    //ENSURES THAT THE ENGINE SELECTED IS KEPT ON A PAGE REFRESH
    const enginesList = document.getElementById("engines");
    const OPENAI_API_ENGINE = "OPENAI_API_ENGINE";
    enginesList.addEventListener('change', (event) => {
        let currentEngine = event.target.value;
        localStorage.setItem(OPENAI_API_ENGINE, currentEngine);
    });
    if (localStorage.getItem(OPENAI_API_ENGINE)) {
        enginesList.value = localStorage.getItem(OPENAI_API_ENGINE);
    }
});

const MAX_COUNTER = 280;

//TODO FIRST: RUN THE FOLLOWING COMMAND IN YOUR DEVELOPER CONSOLE FIRST
//localStorage.setItem("openAI", "YOUR_API_KEY");
const API_KEY = localStorage.getItem("openAI");

//TODO FIRST: OPTIONALLY, YOU CAN REPLACE THE PREVIOUS LINE AND HARD-CODE YOUR API KEY WITH:
//const API_KEY = "YOUR_API_KEY";

function countCharacters() {
    let numOfCharsEntered = promptSpan.innerText.length.toString();
    let spans = document.querySelectorAll("span[name='counter']");
    for (let i = 0; i < spans.length; i++) {
        if (numOfCharsEntered > MAX_COUNTER) {
            spans[i].style.color = "red";
        } else {
            let darkCSS = document.getElementById("darkCSS");
            if (darkCSS == null) {
                spans[i].style.color = "black";
            } else {
                spans[i].style.color = "white";
            }
        }
    }
    charSpan.innerText = numOfCharsEntered;
}

async function openAI_API_Completions() {
    clearResponseAndReceipt();
    let promptText = document.getElementById('prompt').textContent;
    let engine = document.getElementById("engines").value;

    if (promptText.trim().length > 0 && engine.trim().length > 0) {
        await fetch('https://api.openai.com/v1/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + API_KEY
            },
            body: JSON.stringify({
                'model': engine,
                'prompt': promptText,
                'temperature': 0,
                'max_tokens': 1000
            })
        }).then(response => {
            if (!response.ok) {
                console.log("not: " + response.status + "..." + response.statusText);
                typeSentence("HTTP ERROR: " + response.status, document.getElementById("response"));
            }
            return response.json();
        }).then(data => {
            typeSentence(createResponse(data), document.getElementById("response"), data,true);
        }).catch(error => {
            console.log("Error: " + error);
        });
    } else {
        await typeSentence("Please enter a prompt and select an engine", document.getElementById("response"));
    }
}

//SET TOP EXAMPLES
const TOP_EXAMPLES = [
    'Bitcoin is bad because it is used by bad people and has no intrinsic value. It is also bad for the environment.',
    'I honestly have no respect for posers who use AI and act like they are some sort of artists and go on to make money off. AI is cool visually but all of you here can attest to the feeling drawing feels like on paper, canvas, tablet or any other medium. Da Vinci and the art masters must be turning in their graves',
    'Instagram makes people depressed & Twitter makes people angry. Which is better?',
    'AI tech like ChatGPT can be used by bad actors to lobby within democracies at incredible speed and scope, costing far less than troll farms like Russia\'s IRA',
];

function setExample(exampleIndex) {
    clearAll();
    document.getElementById('prompt').textContent=TOP_EXAMPLES[exampleIndex];
    countCharacters();
}

function clearAll() {
    document.getElementById('prompt').textContent='';
    countCharacters();
    clearResponseAndReceipt();
}

function clearResponseAndReceipt() {
    document.getElementById('response').innerHTML='';
    document.getElementById('receipt').innerHTML='';
}

function removePeriod(json) {
    json.forEach(function(element, index) {
        if (element === ".") {
            json.splice(index, 1);
        }
    });
    return json;
}

function createResponse(json) {
    let response = "";
    let choices = removePeriod(json.choices);
    if (choices.length > 0) {
        response = json.choices[0].text
        //json.choices[0].index
        //json.choices[0].logprobs
        //json.choices[0].finish_reason
    }

    return response;
}

async function typeSentence(sentence, elementReference, data, isReceipt = false) {

    elementReference.innerText = "";
    const letters = sentence.split("");
    let delay = 30;
    let i = 0;
    while(i < letters.length) {
        await waitForMs(delay);
        elementReference.append(letters[i]);
        i++
    }

    if (isReceipt) {
        document.getElementById("receipt").innerHTML = createReceipt(data);
    }

    return;
}

function waitForMs(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

function createReceipt(json) {
    /*let table = "<table border='1'>";
    table += "<tr style='background-color: orangered; color: white; text-align: left'><th>Name</th><th>Value</th></tr>";
    table += setRow("Completion ID", json.id);
    table += setRow("Object Type", json.object);
    table += setRow("Prompted At", convertEpochToDateTime(json.created));
    table += setRow("Engine Used", json.model);
    table += setRow("Prompt Tokens", json.usage.prompt_tokens, true);
    table += setRow("Completion Tokens", json.usage.completion_tokens, true);
    table += setRow("Total Tokens", json.usage.total_tokens, true);
    table += setRow("Total Cost", "$" + calculateCost(json.model, json.usage.total_tokens));
    table += "</table>";
    return table;*/

    return "Total Cost: $" + calculateCost(json.model, json.usage.total_tokens);
}

function setRow(name, value, setWordCount) {
    let description = value;
    if (setWordCount === true) {
        description = value + " (~" + +Math.round(value * 0.75) + " words)";
    }
    return "<tr><td>" + name + "</td><td>" + description + "</td></tr>";
}

function calculateCost(engineName, totalTokens, wordCount = false) {

    let totalCost = 0;
    //Prices per 1000 tokens
    const DAVINCI_PRICE = 0.02;
    const CURIE_PRICE = 0.002;
    const BABBAGE_PRICE = 0.0005;
    const ADA_PRICE = 0.0004;

    let pricePerToken = totalTokens/1000;
    if (engineName === "text-davinci-003") {
        totalCost = DAVINCI_PRICE * pricePerToken;
    } else if (engineName === "text-curie-001") {
        totalCost = CURIE_PRICE * pricePerToken;
    } else if (engineName === "text-babbage-001") {
        totalCost = BABBAGE_PRICE * pricePerToken;
    } else if (engineName === "text-ada-001") {
        totalCost = ADA_PRICE * pricePerToken;
    }

    return totalCost.toFixed(10);
}

function convertEpochToDateTime(epoch) {
    let date = new Date(epoch * 1000);
    return date.toLocaleString();
}

function getTimeColor() {
    let color = "white";
    var currentTime = new Date().getHours();
    if (6 <= currentTime&&currentTime < 19) {
        color = "black";
    }

    return color;
}

function getStylesheet() {
    const CSS_LIGHT = "<link id='lightCSS' rel='stylesheet' href='./light.css' type='text/css'>";
    const CSS_DARK = "<link id='darkCSS' rel='stylesheet' href='./dark.css' type='text/css'>";
    let timeColor = getTimeColor();
    if (timeColor === "black") {
        document.write(CSS_LIGHT);
    }
    else {
        document.write(CSS_DARK);
    }
}

function switchStylesheet() {
    let darkCSS = document.getElementById("darkCSS");
    let lightCSS = document.getElementById("lightCSS");

    if (darkCSS == null) {
        document.getElementById("lightCSS").remove();
        setSheet("darkCSS","./dark.css");
    } else if (lightCSS == null) {
        document.getElementById("darkCSS").remove();
        setSheet("lightCSS","./light.css");
    }
    countCharacters();
}

function setSheet(id, href) {
    var sheet = document.createElement('link');
    sheet.rel = "stylesheet";
    sheet.id = id;
    sheet.href = href;
    sheet.type = "text/css";
    document.body.appendChild(sheet);
}