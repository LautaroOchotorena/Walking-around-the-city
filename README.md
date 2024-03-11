# Are you tired of walking always to the same routes?
This is a **walking aplication** where you can **select your city** and the **amount of kilometers** (up to 10km) you would like to walk (see blue route) and of course you would feel kinda tired after that excercice so it also generates the minimum walk to return to the original point you have selected (see red route).

The algorithm has a tendecy of chosing a route heading to the north. It was implemented to avoid chosing routes pretty close to the starting point but you can check it out and change it as you want.

To **run** it you have **two options**: either download all the files and follow the steps I am going to give or enter to this [website](http://lautaro98.pythonanywhere.com) where you can play rightaway (I recommend this one but you won't be able to tune the algorithm as you want).

For the first option I recommend to have an enviroment created just to not interfer to your current libraries.

1) run in the console where it is the folder:
\```bash
python install -r requeriments.txt
\```
It will install all the dependencies neededed.

2) run:
\```bash
python server.py
\```

It will deploy the server and you can be able to open your web locally.
