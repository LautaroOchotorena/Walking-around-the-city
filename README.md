# Are you tired of walking always the same routes?
This is a **walking aplication** where you can **select your city** and the **distance** (up to 10km) you would like to walk (see blue route) and of course you would feel kinda tired after that excercice so it also generates the minimum walk needed to return to your starting point (see red route).

The algorithm has a tendecy of chosing a route heading to the north. It was implemented to avoid chosing routes pretty close to the starting point but you can check it out and change it as you want.

![Example](https://github.com/LautaroOchotorena/Walking-around-the-city/blob/master/Example.jpg)

## How to Run It

You have **three options**:

1. Download all the files and follow the steps I provide, or
2. Visit this [**website**](http://lautaro98.pythonanywhere.com) where you can start right away (I recommend this option, but note that you won't be able to customize the algorithm).
3. Create a codespace (recommended if option 2 isn't working)

For the **first option**, I recommend creating a separate environment to avoid interference with your current libraries.

Follow these steps:

1. In the console, navigate to the folder and run:

    ```bash
    pip install -r requirements.txt
    ```

    This will install all the necessary dependencies.

2. Run:

    ```bash
    python server.py
    ```

    This will deploy the server, and you can open your web locally.

For the **third option**:

On the repository's main page,
1. Click the green Code button.
2. Select Codespaces.
3. Create a codespace.
4. Wait until the python version and the requirements are intalled.
5. Run in the console:

    ```bash
    python server.py
    ```

6. Click on ports and open the url.


## Potential Problems

The website may experience downtime if it remains inactive for a period of time. Reload the page. It may take a few seconds to load.

If the problem persists, please let me know.

## Extra

Most of the work was done using ChatGPT, following my provided instructions. Even though I have knowledge in Python, my proficiency in HTML, JavaScript, and CSS is limited.