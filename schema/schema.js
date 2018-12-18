const graphql = require('graphql');
const fetch = require('node-fetch');



const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLSchema,
    GraphQLID,
    GraphQLList,
    GraphQLInt
} = graphql;

const movieType = new GraphQLObjectType({
    name : 'Movie',
    fields: () => ({
        id: { type : GraphQLID},
        title: { type : GraphQLString },
        year : { type : GraphQLString },
        genres: { 
        type: new  GraphQLList(GraphQLString) ,
         resolve: async (response) =>{
            const { genres }  = await response;
             return genres;
         }},
         summary : { type: GraphQLString },
         language : { type  : GraphQLString },
         rating : { type : GraphQLString },
         torrents: {
             type: new GraphQLList(TorrentType),
             resolve: async (response)=>{
                 const { torrents } = await response;
                 return torrents;
             }
         },
         suggestion:{
             type : new GraphQLList(movieType),
             resolve: async (parent,args) => {
                const suggestUrl = `https://yts.am/api/v2/movie_suggestions.json?movie_id=${parent.id}`;
                const response = await fetch(suggestUrl);
                const json = await response.json();
                const { movies } = await json.data;

                return movies;
             }
         },

         parentalGuide:{
             type: new GraphQLList(Guide),
             resolve: async (parent,args)=>{
                 const gUrl = `https://yts.am/api/v2/movie_parental_guides.json?movie_id=${parent.id}`;
                 const response = await fetch(gUrl)
                 const json = await response.json()
                 const { parental_guides } = await json.data

                 return parental_guides;
             }
         },
         cast: {
             type: new GraphQLList(cast),
             resolve: async (parent,args) => {
                 const withCast = `https://yts.am/api/v2/movie_details.json?movie_id=${parent.id}&with_cast=true`;
                 const response = await fetch(withCast);
                 const json  = await response.json()
                 const { cast } = await json.data.movie;

                 return cast;
             }
         }
    })
})

const TorrentType = new GraphQLObjectType({
    name: 'Torrent',
    fields: ()=>  ({
        url: { type : GraphQLString },
        quality: { type : GraphQLString },
        type: { type : GraphQLString },
        size: { type : GraphQLString }
    })
})

const Guide = new GraphQLObjectType({
    name: 'Parental_Guide',
    fields: ()=>({
        type: { 
            type : GraphQLString,
        },
        text: { 
            type : GraphQLString,
            resolve: (response)=>{
                return response.parental_guide_text;
            } 
        }
    })
})

const cast = new GraphQLObjectType({
    name: 'cast',
    fields: ()=>({
        name: { type : GraphQLString },
        movieName: { 
            type : GraphQLString,
            resolve: (response) => {
                return response.character_name;
            } 
        },
        image: { 
            type : GraphQLString ,
            resolve: (response)=>{
                return response.url_small_image;
            }
        },
        imdbCode: { 
            type : GraphQLInt ,
            resolve: (response)=>{
                return response.imdb_code;
            }
        }
    })
})

const RootQuery = new GraphQLObjectType({
    name: "RootQuery",

    fields: {
        movies : {
            type: new GraphQLList(movieType),
            args: {page: {type: GraphQLInt}},
            resolve : async (parent,args) => {
                const BASE_URL = `https://yts.am/api/v2/list_movies.json?page=${args.page}`;
                const res = await fetch(BASE_URL);
                const json = await res.json();
                const { movies } = await json.data;
                
                return movies;
                
            }
        },

        movie: {
            type : movieType,
            args: { id: {type: GraphQLInt} },
            resolve: async (parent,args)=>{
                const details_url = `https://yts.am/api/v2/movie_details.json?movie_id=${args.id}`
                const res = await fetch(details_url);
                const json = await res.json();
                const { movie } = await json.data;

                return movie;
            }
        }
    }
})

module.exports = new GraphQLSchema({
    query: RootQuery
});