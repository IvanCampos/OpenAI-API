# OpenAI API JavaScript Jumpstart

![](https://cdn-images-1.medium.com/max/1600/0*pEHsXwTQ8hKkrQBV.gif)

## Why?
* Entry level skeleton
  * OpenAI API jumpstart
* Verbose code commenting via chatGPT
* Only uses static files: 
  * HTML, JS, CSS, PNG
* Vanilla JavaScript without:
  * plugins
  * libraries
  * frameworks
  * build scripts
  * server configs
  * unneeded complexity
* API Key options:
  * localStorage or hard-coded
* Run immediately on GitHub Pages 
  * with localStorage option
* Just fork and hack the code locally


![](https://cdn-images-1.medium.com/max/1600/0*bJe_0S_W7NbyROry.gif)

## Base Features
* Call the OpenAI API
* Sample prompts
* GPT-3 model selector
    * selected option saved to localStorage
* Character counter
* Cost per run calculator
* Light & Dark Mode styles
* Text typewriter effect

## Getting Started
Open jumpstart/openai-api.js and setup your api key with either localStorage or hard-coding: 

//TODO 1: GET YOUR OPENAI API KEY from https://beta.openai.com/account/api-keys

//TODO 2a: RUN THE FOLLOWING COMMAND IN YOUR DEVELOPER CONSOLE FIRST:
//         localStorage.setItem("openAI", "YOUR_OPENAI_API_KEY");
const API_KEY = localStorage.getItem("openAI");

//TODO 2b: OPTIONALLY, YOU CAN DELETE THE PREVIOUS LINE AND HARD-CODE YOUR API KEY WITH:
//const API_KEY = "YOUR_OPENAI_API_KEY";

Open jumpstart/index.html and enjoy.

That is all.