const express = require('express');
const schema = require('./schema/schema');
var graphqlHTTP = require('express-graphql');


const app = express();

app.use('/graphql', graphqlHTTP(req =>({
    schema: schema,
    graphiql: true
  })));


app.listen(3000, () => {
    console.log('Server is up and running on port 3000');
})