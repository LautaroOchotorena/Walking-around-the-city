# Are you tired of always walking the same routes?

This is a **walking application** where you can **select your city** and the **distance** you would like to walk (up to 10 km). The blue route represents your chosen path, and after your exercise, the algorithm generates the minimum walk needed to return to your starting point (see red route).

The algorithm tends to choose routes heading north. While it was implemented to avoid selecting routes too close to the starting point, you can check it out and make adjustments as needed.

## How to Run It

You have **two options**:

1. Download all the files and follow the steps I provide, or
2. Visit this [**website**](http://lautaro98.pythonanywhere.com) where you can start right away (I recommend this option, but note that you won't be able to customize the algorithm).

For the first option, I recommend creating a separate environment to avoid interference with your current libraries.

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

## Potential Problems

If the website encounters any issues or is down, please let me know.

## Extra

Most of the work was done using ChatGPT, following my provided instructions. While I have knowledge in Python, my proficiency in HTML, JavaScript, and CSS is limited.