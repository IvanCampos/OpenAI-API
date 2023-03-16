//TODO 1: GET YOUR OPENAI API KEY from https://beta.openai.com/account/api-keys

//TODO 2a: RUN THE FOLLOWING COMMAND IN YOUR DEVELOPER CONSOLE FIRST:
//         localStorage.setItem("openAI", "YOUR_OPENAI_API_KEY");
const API_KEY = localStorage.getItem("openAI");

//TODO 2b: OPTIONALLY, YOU CAN DELETE THE PREVIOUS LINE AND HARD-CODE YOUR API KEY WITH:
//const API_KEY = "YOUR_OPENAI_API_KEY";

const MIN_CHARS = 0;
let userSpan, charSpan;

//Get the Light or Dark stylesheet depending on time of day.
getStylesheet();

document.addEventListener("DOMContentLoaded", function () {

    systemSpan = document.getElementById("system");
    systemSpan.addEventListener("input", countCharactersSystem);
    systemChar = document.getElementById("charCountSystem");
    systemChar.innerText = MIN_CHARS.toString();

    assistantSpan = document.getElementById("assistant");
    assistantSpan.addEventListener("input", countCharactersAssistant);
    assistantChar = document.getElementById("charCountAssistant");
    assistantChar.innerText = MIN_CHARS.toString();

    userSpan = document.getElementById("user");
    userSpan.addEventListener("input", countCharactersUser);
    userChar = document.getElementById("charCountUser");
    userChar.innerText = MIN_CHARS.toString();
});

function countCharacters() {
    countCharactersSystem();
    countCharactersAssistant();
    countCharactersUser();
}

function countCharactersSystem() {
    
    let numOfCharsEntered = systemSpan.innerText.length.toString();
    let spans = document.querySelectorAll("span[name='counterSystem']");
    for (let i = 0; i < spans.length; i++) {
        let darkCSS = document.getElementById("darkCSS");
        if (darkCSS == null) {
            spans[i].style.color = "black";
        } else {
            spans[i].style.color = "white";
        }
    }
    systemChar.innerText = numOfCharsEntered;
}

function countCharactersAssistant() {
    
    let numOfCharsEntered = assistantSpan.innerText.length.toString();
    let spans = document.querySelectorAll("span[name='counterAssistant']");
    for (let i = 0; i < spans.length; i++) {
        let darkCSS = document.getElementById("darkCSS");
        if (darkCSS == null) {
            spans[i].style.color = "black";
        } else {
            spans[i].style.color = "white";
        }
    }
    assistantChar.innerText = numOfCharsEntered;
}

function countCharactersUser() {
    
    let numOfCharsEntered = userSpan.innerText.length.toString();
    let spans = document.querySelectorAll("span[name='counterUser']");
    for (let i = 0; i < spans.length; i++) {
        let darkCSS = document.getElementById("darkCSS");
        if (darkCSS == null) {
            spans[i].style.color = "black";
        } else {
            spans[i].style.color = "white";
        }
    }
    userChar.innerText = numOfCharsEntered;
}

async function chatGPT_API_Completions() {
    //Cache DOM elements to avoid unnecessary DOM traversals
    let systemElem = document.getElementById('system');
    let assistantElem = document.getElementById('assistant');
    let userElem = document.getElementById('user');
    let responseElem = document.getElementById("response");
    clearResponseAndReceipt();
    let systemText = systemElem.textContent.trim();
    let assistantText = assistantElem.textContent.trim();
    let userText = userElem.textContent.trim();

    if (userText) {
        try {

            const messages = [];

            // add the system message
            const systemMessage = {
            role: "system",
            content: systemText
            };
            if (systemText.length > 0) {
                messages.push(systemMessage);
            }

            // add the assistant message
            const assistantMessage = {
            role: "assistant",
            content: assistantText
            };
            if (assistantText.length > 0) {
                messages.push(assistantMessage);
            }

            // add the user message
            const userMessage = {
            role: "user",
            content: userText
            };
            if (userText.length > 0) {
                messages.push(userMessage);
            }

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + API_KEY
                },
                body: JSON.stringify({
                    "model": "gpt-3.5-turbo",
                    "messages": messages,
                    "temperature": 0
                })
            });

            if (!response.ok) {
                console.error("HTTP ERROR: " + response.status + "\n" + response.statusText);
                typeSentence("HTTP ERROR: " + response.status, responseElem);
            } else {
                const data = await response.json();
                typeSentence(createResponse(data), responseElem, data, true);
            }
        } catch (error) {
            console.error("ERROR: " + error);
        }
    } else {
        await typeSentence("Please enter a prompt and select an engine", responseElem);
    }
}

function clearAll() {
    document.getElementById('system').textContent = '';
    document.getElementById('assistant').textContent = '';
    document.getElementById('user').textContent = '';
    countCharacters();
    clearResponseAndReceipt();
}

function clearResponseAndReceipt() {
    document.getElementById('response').innerHTML = '';
    document.getElementById('receipt').innerHTML = '';
}

function removePeriod(json) {
    json.forEach(function (element, index) {
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
        response = json.choices[0].message.content
    }

    return response;
}

async function typeSentence(sentence, elementReference, data, isReceipt = false, delay = 30) {
    elementReference.innerText = "";
    if (sentence === "HTTP ERROR: 401") {
        sentence += " — Please make sure that your Open AI API Key has been set properly.";
    }
    const letters = sentence.split("");
    let i = 0;
    while (i < letters.length) {
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
    let model = json.model;
    let totalTokens = json.usage.total_tokens;
    return "<hr/><div><span>" + model + " </span><span style='font-family: Poppins; font-weight: bolder;'>RECEIPT</span></div><br/><div style='font-family: Poppins'>Total Tokens: <span style='font-family: Orbitron'>" + totalTokens +
        "</span></div><br/>$" + calculateCost(json.model, totalTokens);
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
    const CHATGPT_PRICE = 0.002;
    
    let pricePerToken = totalTokens / 1000;
    totalCost = CHATGPT_PRICE * pricePerToken;

    return totalCost.toFixed(10);
}

function convertEpochToDateTime(epoch) {
    let date = new Date(epoch * 1000);
    return date.toLocaleString();
}

function getTimeColor() { 
    let color = "dark"; 
    const currentHour = new Date().getHours(); 
    if (currentHour >= 6 && currentHour < 19) { 
        color = "light"; 
    } 
    return color; 
}

function getStylesheet() {
    const CSS_LIGHT = "<link id='lightCSS' rel='stylesheet' href='./light.css' type='text/css'>";
    const CSS_DARK = "<link id='darkCSS' rel='stylesheet' href='./dark.css' type='text/css'>";
    let timeColor = getTimeColor();
    if (timeColor === "light") {
        document.write(CSS_LIGHT);
    } else {
        document.write(CSS_DARK);
    }
    setGitHubImageAndLogo(timeColor);
}

function setGitHubImageAndLogo(timeColor) {
    let ghImg = document.getElementById("gh-img");
    ghImg.src = "";
    if (timeColor === "dark") {
        ghImg.src = "../images/github-mark-white.png";
    } else {
        ghImg.src = "../images/github-mark.png";
    }
}

function switchStylesheet() {
    let darkCSS = document.getElementById("darkCSS");
    let lightCSS = document.getElementById("lightCSS");
    let newColor = "light";

    if (darkCSS == null) {
        document.getElementById("lightCSS").remove();
        setSheet("darkCSS", "./dark.css");
        newColor = "dark";
    } else if (lightCSS == null) {
        document.getElementById("darkCSS").remove();
        setSheet("lightCSS", "./light.css");
    }
    setGitHubImageAndLogo(newColor);
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