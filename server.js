const express = require('express');
const schema = require('./schema/schema');
var graphqlHTTP = require('express-graphql');

const PORT = 3000 || process.env.PORT;

const app = express();

app.use('/graphql', graphqlHTTP(req =>({
    schema: schema,
    graphiql: true
  })));


app.listen(PORT, () => {
    console.log('Server is up and running on port 3000');
})