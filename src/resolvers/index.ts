import { mergeResolvers } from "@graphql-tools/merge";
import { userResolver } from "./user";

const resolvers = [userResolver];

export default mergeResolvers(resolvers);
