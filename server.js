const express = require('express');
const schema = require('./schema/schema');
var graphqlHTTP = require('express-graphql');
const DataLoader = require('dataloader');
const fetch = require('node-fetch');

const PORT = process.env.PORT || 3000;
const app = express();

const getSuggestions = id => 
    fetch(`https://yts.am/api/v2/movie_suggestions.json?movie_id=${id}`)
    .then(response => response.json())
    .then(json => json.data.movies)

const getParentalGuide = id =>
    fetch(`https://yts.am/api/v2/movie_parental_guides.json?movie_id=${id}`)
    .then(response => response.json())
    .then(json => json.data.parental_guides)

const getCast = id =>
    fetch(`https://yts.am/api/v2/movie_details.json?movie_id=${id}&with_cast=true`)
    .then(response => response.json())
    .then(json => json.data.movie.cast)


const getMovies = term => 
    fetch(`https://yts.am/api/v2/list_movies.json?query_term=${term}`)
    .then(response => response.json())
    .then(json => json.data.movies)

const getMovie = id => 
    fetch(`https://yts.am/api/v2/movie_details.json?movie_id=${id}`)
    .then(response => response.json())
    .then(json => json.data.movie)

app.use('/graphql', graphqlHTTP(req =>{

    const suggestionLoader = new DataLoader(keys =>
        Promise.all(keys.map(getSuggestions)))
      
    const PgLoader = new DataLoader(keys =>
        Promise.all(keys.map(getParentalGuide)))

    
    const castLoader = new DataLoader(keys =>
        Promise.all(keys.map(getCast)))

    const moviesLoader = new DataLoader(keys =>
            Promise.all(keys.map(getMovies)))         
      
      
     const movieLoader = new DataLoader(keys =>
         Promise.all(keys.map(getMovie)))  

    return{
        schema: schema,
        context:{
            suggestionLoader,
            PgLoader,
            castLoader,
            moviesLoader,
            movieLoader
        },
        graphiql: true
    }
  }));


app.listen(PORT, () => {
    console.log(`Server is up and running on port ${PORT}`);
})