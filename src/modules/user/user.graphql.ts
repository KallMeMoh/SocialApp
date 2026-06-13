import {
  GraphQLBoolean,
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
  type GraphQLFieldConfigMap,
} from 'graphql';

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: {
    _id: { type: GraphQLString },
    username: { type: GraphQLString },
    email: { type: GraphQLString },
    avatar: { type: GraphQLString },
    verified: { type: GraphQLBoolean },
    has2FA: { type: GraphQLBoolean },
    role: { type: GraphQLString },
    createdAt: { type: GraphQLString },
  },
});

const UpdateUserInput = new GraphQLInputObjectType({
  name: 'UpdateUserInput',
  fields: {
    username: { type: GraphQLString },
    email: { type: GraphQLString },
  },
});

export const userFields: GraphQLFieldConfigMap<any, any> = {
  getUserByUsername: {
    type: UserType,
    args: {
      username: { type: new GraphQLNonNull(GraphQLString) },
    },
    resolve: async (_parent, { username }, { userService }) => {
      return userService.getUserByUsername(username);
    },
  },
};

export const userMutations: GraphQLFieldConfigMap<any, any> = {
  updateUser: {
    type: UserType,
    args: {
      input: { type: new GraphQLNonNull(UpdateUserInput) },
    },
    resolve: async (_parent, { input }, { req, userService }) => {
      const userId = req.userId;
      return userService.updateUser(userId, input);
    },
  },
};
