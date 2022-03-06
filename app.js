const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running successfully at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`DB Error at ${error.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();
app.get("/movies/", async (request, response) => {
  const getQuery = `select * from movie;`;
  const dbResponse = await db.all(getQuery);
  response.send(dbResponse);
});

//insert

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const insertQuery = `insert into movie(director_id,movie_name,
    lead_actor)values(
  '${directorId}','${movieName}','${leadActor}');`;
  const dbResponse = await db.run(insertQuery);
  const movieID = dbResponse.lastID;
  response.send("Movie Successfully Added");
});

//get movie based on movie id

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getOneQuery = `select * from movie where movie_id = ${movieId};`;
  const dbResponse = await db.get(getOneQuery);
  response.send(dbResponse);
});

//update movie
app.put("/movies/:movieId/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const { movieId } = request.params;
  const getOneQuery = `update movie set
   director_id =  '${directorId}',
   movie_name = '${movieName}',
    lead_actor = '${leadActor}'
 where movie_id = ${movieId};`;
  const dbResponse = await db.run(getOneQuery);
  response.send("Movie Details Updated");
});

//delete movie

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getOneQuery = `delete from movie 
  where movie_id = ${movieId};`;
  const dbResponse = await db.run(getOneQuery);
  response.send("Movie Removed");
});

//get directors

app.get("/directors/", async (request, response) => {
  const getQuery = `select * from director;`;
  const dbResponse = await db.all(getQuery);
  response.send(dbResponse);
});

//return movie name with director id

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getOneQuery = `select movie_name from movie where director_id = ${directorId} group by movie_id;`;
  const dbResponse = await db.get(getOneQuery);
  response.send(dbResponse);
});

module.exports = app;
