import React, { Component } from "react";
/// to use queries
import { Query } from "react-apollo";
// to write the query in graphl style
import gql from "graphql-tag";

const QUERY_ALL_USERS = gql`
  query QUERY_ALL_USERS {
    users {
      name
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