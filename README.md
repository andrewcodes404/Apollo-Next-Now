Apollo ~ Next ~ Now - Setup & Deploy

Project Setup
=============

```jsx
$ mkdir my_next_now_app
$ cd my_next_now_app
$ npm init -y
```

install dependecies

```jsx
$ npm i apollo-boost babel-plugin-styled-components graphql next next-with-apollo react react-apollo react-dom styled-components styled-normalize
```

update —\> package.json

```jsx
"scripts": {
    "dev": "next",
  }
```

AND this babel stuff in the package object

```jsx
 "//": "This is our babel config, I prefer this over a .babelrc file",
  "babel": {
    "env": {
      "development": {
        "presets": [
          "next/babel"
        ],
        "plugins": [
          [
            "styled-components",
            {
              "ssr": true,
              "displayName": true
            }
          ]
        ]
      },
      "production": {
        "presets": [
          "next/babel"
        ],
        "plugins": [
          [
            "styled-components",
            {
              "ssr": true,
              "displayName": true
            }
          ]
        ]
      },
      "test": {
        "presets": [
          [
            "next/babel",
            {
              "preset-env": {
                "modules": "commonjs"
              }
            }
          ]
        ],
        "plugins": [
          [
            "styled-components",
            {
              "ssr": true,
              "displayName": true
            }
          ]
        ]
      }
    }
  }
```

create —\> pages/index.js

```jsx
const Index = () => (
  <div>
    <p>Hello Next.js</p>
  </div>
)

export default Index
```

Run it

```jsx
$ npm run dev
```

Deploy to Now
=============

lets get this up and running on now first 

Do you already have the CLI installed!!

<https://zeit.co/docs/v2/getting-started/installation/>

### Create —\> next.config.js

```jsx
module.exports = {
  target: 'serverless'
}
```

or you will prob want to use some css somewhere so…

```jsx
npm i @zeit/next-css
```

```jsx
const withCSS = require('@zeit/next-css')
module.exports = withCSS({
    target: `serverless`,
})
```

### Create —\> now.json

<https://zeit.co/docs/v2/deployments/configuration/>

```jsx
{
    "version": 2,
    // important 👇 change this name and delete this coment
    "name": "ac404-front",
    "builds": [{ "src": "next.config.js", "use": "@now/next" }],
    "routes": [
        { "src": "/project/(?<id>[^/]+)$", "dest": "/project?id=$id" }
      ]
  }
```

Create —\> .nowignore

```jsx
node_modules
.vscode
.next
```

Update —\> .package.json

```jsx
{
  ...
  "scripts": {
    "dev": "next",
    "now-build": "next build"
  },
  ...
}
```

Deploy it

```jsx
$ now
```

As this is your first deploy you will get the alias address looks like

WE NEED TO GIVE THIS TO THE PRISMA BACKEND!!!!

```jsx
Ready! Aliased to https://my_next_now_app.yourAccountName.now.sh [in clipboard] [46s]
```

Go in to the backend dir now.json
=================================

should look like this

```jsx
{
    "version": 2,
    //update this name👇 and delete this comment
    "name": "my-app-name-yoga",
    "builds": [
        { "src": "src/index.js", "use": "@now/node-server" }
    ],
    "routes": [
        { "src": "/.*", "dest": "src/index.js" }
    ],
    "env": {
        "PRISMA_ENDPOINT":"@app_name_prisma_endpoint",
        "PRISMA_SECRET":"@app_name_prisma_secret",
        
        // You dont know this yet as we havent set up the frontend so add it anyway add app_name_frontend_url TBD
        "FRONTEND_URL":"@app_name_frontend_url",
    }
}
```

if you have set up the frontend\_url already you will need to delete it

```jsx
$ now secret rm app_name_frontend_url
```

and then add the new url

```jsx
$ now secret add app_name_frontend_url https://my_next_now_app.yourAccountName.now.sh
```

Add Apollo and connect to Prisma
================================

AND ADD THE CORECT PRISMA ENDPOINT
----------------------------------

**create **—\> lib/createApolloClient.js

```jsx
// HOC  that will expose apollo client via a prop that help server side rendering
import withApollo from 'next-with-apollo';

// a small package with all the best bits we need from apollo
import ApolloClient from 'apollo-boost';

// where is the Yoga API - don't put anything in here that shouldn't be public!
const devPrismaEndpoint = `http://localhost:4000`;

                                👇 👇 👇 Change  this  HERE  👇 👇 👇 
const prodPrismaEndpoint = `https://graphql-blog-back-yoga-prod.andrewcodes404.now.sh/`;

function createClient({ headers }) {
  console.log("process.env.NODE_ENV=", process.env.NODE_ENV);
  return new ApolloClient({

    //setting the url we can change for prod
    uri: process.env.NODE_ENV === 'development' ? devPrismaEndpoint : prodPrismaEndpoint,
    request: operation => {
      operation.setContext({
        fetchOptions: {
          //can transport cookies
          credentials: 'include',
        },
        headers,
      });
    }, 
  });
}

export default withApollo(createClient);
```

**create** —\> pages/\_app.js

\_app.js wraps all pages so it’s the perfect place to use the apolloClient

```jsx
import App, { Container } from 'next/app';
import { ApolloProvider } from 'react-apollo';
import apolloClient from '../lib/createApolloClient';

class MyApp extends App {
  static async getInitialProps({ Component, ctx }) {
    let pageProps = {};
    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx);
    }
    // this exposes the query to the user
    pageProps.query = ctx.query;
    return { pageProps };
  }
  render() {
    const { Component, apollo, pageProps } = this.props;
    return (
      <Container>
        <ApolloProvider client={apollo}>
          <Component {...pageProps} />
        </ApolloProvider>
      </Container>
    );
  }
}
//wrapp the app with the apollo client
export default apolloClient(MyApp);
```

Run dev

```jsx
$ npm run dev
```

shopuld run without error… we are not actually reciving or sending any data yet but the connection should run ok

Hopefully you have some data in your db?

Lets run a very simple query to proove the connection is working

**Update** —\> index.js

imports needed

```jsx
import React, { Component } from 'react'
/// to use queries
import { Query } from "react-apollo";
// to write the query in graphl style
import gql from "graphql-tag";
```

create the query

```jsx
const QUERY_ALL_USERS = gql`
  query QUERY_ALL_USERS {
    users {
      name
    }
  }
`;
```

now use the render props to wrap the component

```jsx
export default class Index extends Component {
    render() {
      return (
       <Query query={QUERY_ALL_USERS}>
        {(payload)=>{
          console.log("payload =", payload);
          return <p>I'm the child of the query</p>   
        }}
       </Query>
      );
    }
  }
```

Check the connection

TURN YOUR BACKEND ON!!!!

```jsx
$ npm run dev
```

You should see the payload in the console 👍 

**update** —\> index.js

```jsx
import React, { Component } from "react";
/// to use queries
import { Query } from "react-apollo";
// to write the query in graphl style
import gql from "graphql-tag";

const QUERY_ALL_USERS = gql`
  query QUERY_ALL_USERS {
    users {
      name
      id
    }
  }
`;

const User = props => {
    console.log("props = ", props);
    return <p>{props.user.name}</p>;
  };
  
export default class Index extends Component {
    render() {
      return (
        <Query query={QUERY_ALL_USERS}>
          {({ data, error, loading }) => {
            if (loading) return <p>Loading...</p>;
            if (error) return <p>Error: {error.message}</p>;
            return (
              <div>
                {data.users.map(user => (  
                  <User user={user} key={user.id} />
                ))}
              </div>
            );
          }}
        </Query>
      );
    }
  }
```

Taking the data from the query and printing it out 👆

```jsx
$ npm run dev
```

Everything good? let’s deploy it to now

```jsx
$ now
```

All running smoothly apart from a browser console error

GET <http://localhost:3000/favicon.ico> 404 (Not Found)

just putting a fav in the root dir won’t work, you must acivate next.js \<head\> options and manually add what fav you want there