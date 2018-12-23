const graphql = require('graphql');
const fetch = require('node-fetch');
const api = require('yifysubtitles-api');

const language = require('../langmap.json');



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
         imdbcode:{ 
             type : GraphQLString,
            resolve: async(response) =>{
                const { imdb_code } = await response;
                return imdb_code;
            } },
         torrents: {
             type: new GraphQLList(TorrentType),
             resolve: async (response)=>{
                 const { torrents } = await response;
                 return torrents;
             }
         },
         suggestion:{
             type : new GraphQLList(movieType),
             resolve: async (parent,args,context) => {
                return movies = await context.suggestionLoader.load(parent.id);;
             }
         },

         parentalGuide:{
             type: new GraphQLList(Guide),
             resolve: async (parent,args,context)=>{
                 return parental_guides = await context.PgLoader.load(parent.id);
             }
         },
         cast: {
             type: new GraphQLList(cast),
             resolve: async (parent,args,context) => {
                 const cast = await context.castLoader.load(parent.id);
                 return cast
             }
         },

         subtitles: {
             type: new GraphQLList(SubType),
             args: { language: { type: GraphQLString}},
             resolve: async (parent,args,context) =>{
                const selectedLang = language[args.language.toLowerCase()];
                if(! selectedLang )
                    return  new Error('Language not found!!!!');
                const data = await api.search({imdbid:`${parent.imdb_code}`});
                return data[selectedLang];
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

const SubType = new GraphQLObjectType({
    name: 'Subtitles',
    description:'Get Subtitles',
    fields: () => ({
        title : { 
            type : GraphQLString,
            resolve: async (response)=>{
                const { release } = await response
                return release
            }
         },
         language: {
             type : GraphQLString,
             resolve: async (response)=>{
                const { langName } = await response
                return langName
             }
         },
         url:{
            type : GraphQLString,
            resolve: async (response)=>{
               const { url } = await response
               return url
            }
         }
        
    })
})

const RootQuery = new GraphQLObjectType({
    name: "RootQuery",

    fields: {
        movies : {
            type: new GraphQLList(movieType),
            args: {term: {type: GraphQLString}},
            resolve : async (parent,args,context) => {
                const  movies  = await context.moviesLoader.load(args.term);
                return movies;
            }
        },

        movie: {
            type : movieType,
            args: { id: {type: GraphQLInt} },
            resolve: async (parent,args,context)=>{
                const movie  = await context.movieLoader.load(args.id);
                return movie;
            }
        }
    }
})

module.exports = new GraphQLSchema({
    query: RootQuery
});