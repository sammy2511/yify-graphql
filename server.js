const express = require('express');
const schema = require('./schema/schema');
var graphqlHTTP = require('express-graphql');

const PORT = process.env.PORT || 3000;

const app = express();

app.use('/graphql', graphqlHTTP(req =>({
    schema: schema,
    graphiql: true
  })));


app.listen(PORT, () => {
    console.log(`Server is up and running on port ${PORT}`);
})